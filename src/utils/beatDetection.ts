import { BeatMarker } from '../types';

/**
 * Audio Beat Detection and Musical Rhythm Generator
 * Detects transient energy spikes, drops, and rhythmic tempo markers
 */

export interface BeatDetectionOptions {
  bpm?: number;
  sensitivity?: number; // 0.1 to 2.0, default 1.0
  addDrops?: boolean;
}

/**
 * Generate beat markers for a specific duration based on BPM tempo and time offset
 */
export function generateRhythmicBeats(
  duration: number,
  bpm: number = 120,
  offset: number = 0,
  addDrops: boolean = true
): BeatMarker[] {
  const markers: BeatMarker[] = [];
  const beatInterval = 60 / Math.max(30, Math.min(300, bpm));
  let currentTime = offset;
  let beatCount = 0;

  while (currentTime < duration) {
    if (currentTime >= 0) {
      const isDrop = addDrops && (beatCount % 16 === 0 || beatCount % 32 === 0);
      markers.push({
        id: `beat-${Date.now()}-${beatCount}-${Math.random().toString(36).substring(2, 6)}`,
        time: Number(currentTime.toFixed(3)),
        type: isDrop ? 'drop' : 'beat',
        label: isDrop ? `Drop (Bar ${Math.floor(beatCount / 4) + 1})` : `Beat ${beatCount + 1}`,
        bpm,
      });
    }
    currentTime += beatInterval;
    beatCount++;
  }

  return markers;
}

/**
 * Automatically analyze an audio file URL using Web Audio API to detect real audio energy peaks
 */
export async function detectAudioBeats(
  audioUrl: string,
  clipDuration: number,
  fallbackBpm: number = 128
): Promise<BeatMarker[]> {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass || !audioUrl) {
      return generateRhythmicBeats(clipDuration, fallbackBpm);
    }

    // Fetch and decode audio array buffer
    const response = await fetch(audioUrl, { mode: 'cors' }).catch(() => null);
    if (!response || !response.ok) {
      return generateRhythmicBeats(clipDuration, fallbackBpm);
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioCtx = new AudioContextClass();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    
    const sampleRate = audioBuffer.sampleRate;
    const channelData = audioBuffer.getChannelData(0); // primary channel
    
    // Window size ~ 23ms (1024 samples at 44.1kHz)
    const windowSize = 1024;
    const energyWindows: number[] = [];
    
    for (let i = 0; i < channelData.length; i += windowSize) {
      let sum = 0;
      const end = Math.min(i + windowSize, channelData.length);
      for (let j = i; j < end; j++) {
        sum += channelData[j] * channelData[j];
      }
      energyWindows.push(Math.sqrt(sum / (end - i)));
    }

    // Dynamic threshold peak picking
    const markers: BeatMarker[] = [];
    const localWindow = 20; // ~0.5s context
    const minBeatGap = Math.floor((0.25 * sampleRate) / windowSize); // Min 250ms between beats (max 240 BPM)
    let lastBeatWindow = -minBeatGap;
    let detectedBpm = fallbackBpm;

    // Estimate BPM using interval distances between highest peaks
    const peakIntervals: number[] = [];

    for (let i = localWindow; i < energyWindows.length - localWindow; i++) {
      let localAvg = 0;
      for (let j = i - localWindow; j <= i + localWindow; j++) {
        localAvg += energyWindows[j];
      }
      localAvg /= (localWindow * 2 + 1);

      const threshold = localAvg * 1.35;
      const isPeak = energyWindows[i] > threshold &&
                     energyWindows[i] > energyWindows[i - 1] &&
                     energyWindows[i] >= energyWindows[i + 1];

      if (isPeak && (i - lastBeatWindow) >= minBeatGap) {
        if (lastBeatWindow > 0) {
          const deltaSec = ((i - lastBeatWindow) * windowSize) / sampleRate;
          if (deltaSec > 0.3 && deltaSec < 1.5) {
            peakIntervals.push(deltaSec);
          }
        }

        const time = Number(((i * windowSize) / sampleRate).toFixed(3));
        if (time <= clipDuration) {
          const isHighEnergy = energyWindows[i] > localAvg * 2.0;
          markers.push({
            id: `peak-${i}-${Date.now()}`,
            time,
            type: isHighEnergy ? 'drop' : 'beat',
            label: isHighEnergy ? 'Drop / Kick' : 'Beat',
          });
        }
        lastBeatWindow = i;
      }
    }

    if (peakIntervals.length > 3) {
      const avgInterval = peakIntervals.reduce((a, b) => a + b, 0) / peakIntervals.length;
      detectedBpm = Math.round(60 / avgInterval);
    }

    if (markers.length < 4) {
      // If audio is too ambient or quiet, generate musical rhythmic beats
      return generateRhythmicBeats(clipDuration, detectedBpm || fallbackBpm);
    }

    return markers;
  } catch (err) {
    console.warn('[BeatDetection] WebAudio beat extraction error, using tempo fallback:', err);
    return generateRhythmicBeats(clipDuration, fallbackBpm);
  }
}
