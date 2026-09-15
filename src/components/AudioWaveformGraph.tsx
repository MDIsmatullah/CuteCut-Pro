import React, { useRef, useEffect, useState } from 'react';
import { generateWaveformPeaks, normalizeMediaUrl, calculateAudioPeakDb, calculateFrequencySpectrumAtOffset, analyzeVoiceActivityRMS, computeBreathMarkersFromSpeech, globalBreathMarkersRegistry } from '../utils/editorUtils';

interface AudioWaveformGraphProps {
  clipId: string;
  url?: string;
  width: number;
  height?: number;
  isSelected: boolean;
  volume?: number;
  showSilenceHighlights?: boolean;
  showBeatMarkers?: boolean;
  overlayMode?: boolean;
  onPeakCalculated?: (peakDb: number) => void;
  currentTime?: number;
  clipStart?: number;
  clipDuration?: number;
  isPlaying?: boolean;
}

// Global cache for decoded audio channel data buffers to avoid re-fetching / re-decoding audio on every zoom tick
const decodedAudioCache = new Map<string, Float32Array>();
const pendingDecodes = new Map<string, Promise<Float32Array | null>>();

export const AudioWaveformGraph = React.memo<AudioWaveformGraphProps>(({
  clipId,
  url,
  width,
  height,
  isSelected,
  volume = 1.0,
  showSilenceHighlights = true,
  showBeatMarkers = true,
  overlayMode = false,
  onPeakCalculated,
  currentTime,
  clipStart = 0,
  clipDuration = 0,
  isPlaying = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [channelData, setChannelData] = useState<Float32Array | null>(null);
  const lastReportedPeakRef = useRef<number | null>(null);

  // Decode audio data using Web Audio API if URL is provided
  useEffect(() => {
    let isMounted = true;
    if (!url) {
      setChannelData(null);
      return;
    }

    const cacheKey = url;
    if (decodedAudioCache.has(cacheKey)) {
      setChannelData(decodedAudioCache.get(cacheKey)!);
      return;
    }

    if (pendingDecodes.has(cacheKey)) {
      pendingDecodes.get(cacheKey)!.then((data) => {
        if (isMounted && data) setChannelData(data);
      });
      return;
    }

    const decodePromise = (async (): Promise<Float32Array | null> => {
      try {
        // Check IndexedDB cache first
        try {
          const { getCachedAudioChannel, setCachedAudioChannel } = await import('../utils/offlineStorage');
          const idbData = await getCachedAudioChannel(url);
          if (idbData && idbData.length > 0) {
            decodedAudioCache.set(cacheKey, idbData);
            return idbData;
          }
        } catch {
          // ignore cache read error
        }

        const normalized = normalizeMediaUrl(url);
        const response = await fetch(normalized);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();

        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtxClass) return null;
        const audioCtx = new AudioCtxClass();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        audioCtx.close();

        // Extract channel 0 data
        const rawData = audioBuffer.getChannelData(0);
        
        // Cache decoded float array in memory and IndexedDB
        decodedAudioCache.set(cacheKey, rawData);
        try {
          const { setCachedAudioChannel } = await import('../utils/offlineStorage');
          await setCachedAudioChannel(url, rawData);
        } catch {
          // ignore cache write error
        }
        return rawData;
      } catch (err) {
        console.warn(`[AudioWaveformEngine] Web Audio decode bypass for ${url}:`, err);
        return null;
      } finally {
        pendingDecodes.delete(cacheKey);
      }
    })();

    pendingDecodes.set(cacheKey, decodePromise);
    decodePromise.then((data) => {
      if (isMounted && data) {
        setChannelData(data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [url]);

  // Analyze voice activity to generate and register breath/silence markers for timeline snapping & overlays
  useEffect(() => {
    if (channelData && channelData.length > 0 && clipDuration > 0) {
      try {
        const speech = analyzeVoiceActivityRMS(channelData, 44100, {
          noiseFloorSensitivity: 'quran-ayah',
        });
        const breaths = computeBreathMarkersFromSpeech(speech, clipDuration, clipId);
        globalBreathMarkersRegistry.set(clipId, breaths);
      } catch (err) {
        console.warn('[AudioWaveformGraph] Failed to extract breath markers:', err);
      }
    } else if (clipDuration > 0) {
      // Procedural fallback if channel data isn't loaded yet, so snapping has initial targets
      const proceduralBreaths = [
        { id: `${clipId}-proc-1`, startTime: clipDuration * 0.2, endTime: clipDuration * 0.2 + 0.5, duration: 0.5 },
        { id: `${clipId}-proc-2`, startTime: clipDuration * 0.5, endTime: clipDuration * 0.5 + 0.6, duration: 0.6 },
        { id: `${clipId}-proc-3`, startTime: clipDuration * 0.8, endTime: clipDuration * 0.8 + 0.5, duration: 0.5 }
      ];
      globalBreathMarkersRegistry.set(clipId, proceduralBreaths);
    }

    return () => {
      globalBreathMarkersRegistry.delete(clipId);
    };
  }, [channelData, clipId, clipDuration]);

  // Render Canvas Waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderWidth = Math.max(10, Math.floor(width));
    const renderHeight = height || canvas.parentElement?.clientHeight || 48;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = renderWidth * dpr;
    canvas.height = renderHeight * dpr;
    canvas.style.width = `${renderWidth}px`;
    canvas.style.height = `${renderHeight}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, renderWidth, renderHeight);

    // 1. Container backdrop (Solid dark purple for audio, fully clear for video overlay to let thumbnails shine through!)
    if (!overlayMode) {
      const backdropGradient = ctx.createLinearGradient(0, 0, 0, renderHeight);
      backdropGradient.addColorStop(0, '#1c0d2e');
      backdropGradient.addColorStop(0.5, '#150924');
      backdropGradient.addColorStop(1, '#1c0d2e');
      ctx.fillStyle = backdropGradient;
      ctx.fillRect(0, 0, renderWidth, renderHeight);
    }

    // 2. Compute Peak Amplitudes & RMS Silence Flags (downsampled per bar)
    const volFactor = Math.min(2.0, Math.max(0.1, volume));
    const barWidth = 2;
    const gap = 1;
    const totalBars = Math.max(8, Math.floor(renderWidth / (barWidth + gap)));

    let peaks: number[] = [];
    let isSilenceFlags: boolean[] = [];

    const noiseFloorDb = -28;
    const rmsThreshold = Math.pow(10, noiseFloorDb / 20); // ~0.0398 RMS threshold for better real-world tolerance

    if (channelData && channelData.length > 0) {
      const samplesPerBar = Math.floor(channelData.length / totalBars);
      for (let i = 0; i < totalBars; i++) {
        const start = i * samplesPerBar;
        const end = Math.min(channelData.length, start + samplesPerBar);
        let maxVal = 0;
        let sumSq = 0;
        let count = 0;
        for (let j = start; j < end; j += 2) {
          const val = channelData[j];
          const absVal = Math.abs(val);
          if (absVal > maxVal) maxVal = absVal;
          sumSq += val * val;
          count++;
        }
        const rms = count > 0 ? Math.sqrt(sumSq / count) : 0;
        peaks.push(Math.min(1.0, maxVal * volFactor));
        // Silence condition: RMS energy below noise floor or peak negligible (tolerating inhalation)
        isSilenceFlags.push(rms < rmsThreshold || maxVal < 0.045);
      }
    } else {
      const rawPeaks = generateWaveformPeaks(`${clipId}-${url || 'audio'}`, totalBars);
      for (let i = 0; i < totalBars; i++) {
        const p = rawPeaks[i];
        peaks.push(Math.min(1.0, p * volFactor));
        isSilenceFlags.push(p < 0.18);
      }
    }

    // 2.5 Compute Peak dB for local display without triggering React state cascade loops
    const calculatedPeakDb = channelData && channelData.length > 0
      ? calculateAudioPeakDb(channelData, volume)
      : calculateAudioPeakDb(peaks, 1.0);

    if (onPeakCalculated && lastReportedPeakRef.current !== calculatedPeakDb) {
      lastReportedPeakRef.current = calculatedPeakDb;
      try {
        onPeakCalculated(calculatedPeakDb);
      } catch (err) {
        // ignore
      }
    }

    // 3. Draw Background Highlight Bands & Text Guides for Silence Regions (Only for pure audio, not video overlays)
    if (showSilenceHighlights && !overlayMode) {
      let silenceStartBar: number | null = null;
      for (let i = 0; i <= totalBars; i++) {
        const isSil = i < totalBars ? isSilenceFlags[i] : false;
        if (isSil && silenceStartBar === null) {
          silenceStartBar = i;
        } else if (!isSil && silenceStartBar !== null) {
          const silenceEndBar = i;
          const xStart = silenceStartBar * (barWidth + gap);
          const xWidth = (silenceEndBar - silenceStartBar) * (barWidth + gap) - gap;

          if (xWidth >= 4) {
            // Draw soft Amber translucent glow background
            ctx.fillStyle = 'rgba(245, 158, 11, 0.16)';
            ctx.fillRect(xStart, 0, xWidth, renderHeight);

            // Top and bottom accent border lines marking the silence window
            ctx.fillStyle = 'rgba(251, 191, 36, 0.5)';
            ctx.fillRect(xStart, 0, xWidth, 1.5);
            ctx.fillRect(xStart, renderHeight - 1.5, xWidth, 1.5);

            // Render crisp "PAUSE" text node placement guide label if silence region is wide enough
            if (xWidth >= 16 && renderHeight >= 28) {
              ctx.save();
              ctx.font = '700 7px Inter, system-ui, sans-serif';
              ctx.fillStyle = 'rgba(251, 191, 36, 0.95)';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'top';
              ctx.fillText('PAUSE', xStart + xWidth / 2, 2);
              ctx.restore();
            }
          }
          silenceStartBar = null;
        }
      }
    }

    // 4. Center Baseline Reference Line (Only for pure audio tracks, not video overlay mode)
    const centerY = renderHeight / 2;
    if (!overlayMode) {
      ctx.strokeStyle = isSelected ? 'rgba(216, 180, 254, 0.5)' : 'rgba(168, 85, 247, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(renderWidth, centerY);
      ctx.stroke();
    }

    // 5. Speech vs Silence Waveform Bar Gradients
    const speechGradient = ctx.createLinearGradient(0, 0, 0, renderHeight);
    if (overlayMode) {
      // Vibrant Cyan/Teal/Emerald for Video Overlays
      if (isSelected) {
        speechGradient.addColorStop(0, '#e0f2fe');
        speechGradient.addColorStop(0.5, '#38bdf8');
        speechGradient.addColorStop(1, '#0284c7');
      } else {
        speechGradient.addColorStop(0, '#cff4fc');
        speechGradient.addColorStop(0.5, 'rgba(34, 211, 238, 0.95)');
        speechGradient.addColorStop(1, 'rgba(14, 116, 144, 0.85)');
      }
    } else {
      // Lavender / Purple / Violet for Audio Clips
      if (isSelected) {
        speechGradient.addColorStop(0, '#f3e8ff');
        speechGradient.addColorStop(0.5, '#d8b4fe');
        speechGradient.addColorStop(1, '#c084fc');
      } else {
        speechGradient.addColorStop(0, '#e9d5ff');
        speechGradient.addColorStop(0.5, 'rgba(192, 132, 252, 0.9)');
        speechGradient.addColorStop(1, 'rgba(168, 85, 247, 0.7)');
      }
    }

    // Silence: High-Contrast Amber / Gold / Orange Highlight
    const silenceGradient = ctx.createLinearGradient(0, 0, 0, renderHeight);
    if (isSelected) {
      silenceGradient.addColorStop(0, '#fffbeb');
      silenceGradient.addColorStop(0.5, '#fde68a');
      silenceGradient.addColorStop(1, '#f59e0b');
    } else {
      silenceGradient.addColorStop(0, '#fef3c7');
      silenceGradient.addColorStop(0.5, 'rgba(251, 191, 36, 0.9)');
      silenceGradient.addColorStop(1, 'rgba(217, 119, 6, 0.8)');
    }

    const maxAmplitude = overlayMode ? (renderHeight * 0.25) : ((renderHeight / 2) * 0.88);

    // 6. Draw Main Waveform Bars & Beat Transient Markers
    for (let i = 0; i < totalBars; i++) {
      const x = i * (barWidth + gap);
      const isSil = isSilenceFlags[i];
      const amp = Math.max(0.04, peaks[i] || 0.04);
      const barHeight = amp * maxAmplitude;

      let topY = centerY - barHeight;
      let h = barHeight * 2;

      if (overlayMode) {
        // Bottom-aligned mini-waveform for video track overlays (growing upwards from the bottom)
        topY = renderHeight - barHeight - 2.5;
        h = barHeight;
      }

      ctx.fillStyle = (showSilenceHighlights && isSil) ? silenceGradient : speechGradient;

      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, topY, barWidth, h, 1);
      } else {
        ctx.rect(x, topY, barWidth, h);
      }
      ctx.fill();

      // 6.5 Beat / Transient Spike Dot Indicator
      const prevPeak = i > 0 ? peaks[i - 1] : 0;
      const isBeatTransient = showBeatMarkers && !isSil && amp > 0.42 && (amp > prevPeak * 1.2 + 0.08);
      if (isBeatTransient && renderHeight >= 20 && !overlayMode) {
        ctx.save();
        ctx.fillStyle = overlayMode ? '#fbbf24' : '#22d3ee';
        ctx.shadowBlur = 4;
        ctx.shadowColor = overlayMode ? 'rgba(251, 191, 36, 0.9)' : 'rgba(34, 211, 238, 0.9)';
        ctx.beginPath();
        ctx.arc(x + barWidth / 2, Math.max(2, topY - 2), 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 7. Render scrubbing laser cursor only if explicitly selected and manual scrub
    if (isSelected && currentTime !== undefined && clipDuration > 0) {
      const clipOffset = currentTime - clipStart;
      const isPlayheadInClip = clipOffset >= 0 && clipOffset <= clipDuration;

      if (isPlayheadInClip) {
        const clampedOffset = Math.max(0, Math.min(clipDuration, clipOffset));
        const playheadRatio = clampedOffset / clipDuration;
        const playheadX = Math.round(playheadRatio * renderWidth);

        // Draw Playhead Scrubbing Laser Cursor Line across the Clip
        ctx.save();
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#06b6d4';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(playheadX, 0);
        ctx.lineTo(playheadX, renderHeight);
        ctx.stroke();
        ctx.restore();
      }
    }

  }, [channelData, width, height, isSelected, volume, clipId, url, showSilenceHighlights, showBeatMarkers, overlayMode]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none rounded-md">
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
      />
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.clipId === nextProps.clipId &&
         prevProps.url === nextProps.url &&
         prevProps.width === nextProps.width &&
         prevProps.height === nextProps.height &&
         prevProps.isSelected === nextProps.isSelected &&
         prevProps.volume === nextProps.volume &&
         prevProps.showSilenceHighlights === nextProps.showSilenceHighlights &&
         prevProps.showBeatMarkers === nextProps.showBeatMarkers &&
         prevProps.overlayMode === nextProps.overlayMode;
});

export default AudioWaveformGraph;


