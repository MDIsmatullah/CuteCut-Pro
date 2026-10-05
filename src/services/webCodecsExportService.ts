import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import { Track, Clip, ClipType } from '../types';
import { getNormalizedClipVolume } from '../utils/editorUtils';
import { detectSystemHardwareProfile } from '../utils/systemCapabilityDetector';

export interface WebCodecsExportOptions {
  canvas: HTMLCanvasElement;
  tracks: Track[];
  duration: number;
  fps: number;
  width: number;
  height: number;
  bitrate: number;
  onProgress: (pct: number, frame: number, totalFrames: number, fpsActual: number) => void;
  onLog: (msg: string) => void;
  renderFrameAtTime: (time: number) => Promise<void>;
  checkCancelled: () => boolean;
}

export interface WebCodecsSupportInfo {
  supported: boolean;
  hasVideoEncoder: boolean;
  hasAudioEncoder: boolean;
  gpuAccelerated: boolean;
}

export function checkWebCodecsSupport(): WebCodecsSupportInfo {
  if (typeof window === 'undefined') {
    return { supported: false, hasVideoEncoder: false, hasAudioEncoder: false, gpuAccelerated: false };
  }

  const hasVideoEncoder = typeof window.VideoEncoder !== 'undefined' && typeof window.VideoFrame !== 'undefined';
  const hasAudioEncoder = typeof window.AudioEncoder !== 'undefined' && typeof (window as any).AudioData !== 'undefined';

  return {
    supported: hasVideoEncoder,
    hasVideoEncoder,
    hasAudioEncoder,
    gpuAccelerated: hasVideoEncoder
  };
}

async function getSupportedVideoCodec(width: number, height: number, fps: number, bitrate: number): Promise<string> {
  const candidateCodecs = [
    'avc1.640033',
    'avc1.64002a',
    'avc1.4d002a',
    'avc1.640028',
    'avc1.42001f',
    'vp09.00.41.08',
    'vp09.00.10.08',
  ];

  if (typeof VideoEncoder !== 'undefined' && typeof VideoEncoder.isConfigSupported === 'function') {
    for (const codec of candidateCodecs) {
      try {
        const support = await VideoEncoder.isConfigSupported({
          codec,
          width,
          height,
          bitrate,
          framerate: fps,
          hardwareAcceleration: 'prefer-hardware'
        });
        if (support && support.supported) {
          return codec;
        }
      } catch {
        // try next codec
      }
    }
  }

  return 'avc1.4d002a';
}

async function renderTimelineAudioOffline(
  tracks: Track[],
  totalDuration: number,
  sampleRate: number,
  onLog: (msg: string) => void
): Promise<AudioBuffer | null> {
  try {
    const audioClips: Clip[] = [];
    tracks.forEach(t => {
      if (t.muted) return;
      t.clips.forEach(c => {
        if ((c.type === ClipType.AUDIO || c.type === ClipType.VIDEO) && c.url) {
          const normVol = getNormalizedClipVolume(c.volume);
          if (normVol > 0) {
            audioClips.push(c);
          }
        }
      });
    });

    if (audioClips.length === 0) {
      return null;
    }

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const clipBuffers: { clip: Clip; buffer: AudioBuffer }[] = [];

    for (const clip of audioClips) {
      try {
        const resp = await fetch(clip.url, { mode: 'cors' });
        if (resp.ok) {
          const arrayBuffer = await resp.arrayBuffer();
          const decoded = await audioContext.decodeAudioData(arrayBuffer);
          clipBuffers.push({ clip, buffer: decoded });
        }
      } catch (e) {
        onLog(`[WebCodecs Audio] Could not load audio stream for ${clip.name || clip.id}: ${e}`);
      }
    }

    if (clipBuffers.length === 0) {
      return null;
    }

    const totalSamples = Math.ceil(totalDuration * sampleRate);
    const offlineCtx = new OfflineAudioContext(2, Math.max(sampleRate, totalSamples), sampleRate);

    clipBuffers.forEach(({ clip, buffer }) => {
      const source = offlineCtx.createBufferSource();
      source.buffer = buffer;

      const gainNode = offlineCtx.createGain();
      const vol = getNormalizedClipVolume(clip.volume);
      gainNode.gain.value = vol;

      source.connect(gainNode);
      gainNode.connect(offlineCtx.destination);

      const startTime = Math.max(0, clip.start || 0);
      const offset = Math.max(0, clip.sourceStart || 0);
      const clipDuration = clip.duration;
      source.start(startTime, offset, clipDuration);
    });

    const rendered = await offlineCtx.startRendering();
    return rendered;
  } catch (err) {
    onLog(`[WebCodecs Audio] Offline audio mix notice: ${err}`);
    return null;
  }
}

export async function exportWithWebCodecs(options: WebCodecsExportOptions): Promise<Blob> {
  const {
    canvas,
    tracks,
    duration,
    fps,
    width,
    height,
    bitrate,
    onProgress,
    onLog,
    renderFrameAtTime,
    checkCancelled
  } = options;

  if (!canvas || !renderFrameAtTime || typeof checkCancelled !== 'function') {
    throw new Error('Invalid export options. Missing render canvas or callbacks.');
  }

  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error('Invalid render duration.');
  }

  if (typeof window === 'undefined' || !('VideoEncoder' in window) || !('VideoFrame' in window)) {
    throw new Error('WebCodecs is not supported in this browser.');
  }

  const totalFrames = Math.max(1, Math.ceil(duration * fps));
  const chosenCodec = await getSupportedVideoCodec(width, height, fps, bitrate);
  const sampleRate = 44100;
  const sysProfile = detectSystemHardwareProfile();

  onLog(`🚀 WebCodecs export started | ${width}x${height} @ ${fps}fps | Codec: ${chosenCodec}`);
  onLog(`⚡ System Capability: ${sysProfile.cpuCores} CPU Cores • ${sysProfile.deviceMemoryGb}GB RAM [${sysProfile.tierBadge}]`);

  let audioBuffer: AudioBuffer | null = null;
  const support = checkWebCodecsSupport();
  const shouldEncodeAudio = support.hasAudioEncoder;

  if (shouldEncodeAudio) {
    audioBuffer = await renderTimelineAudioOffline(tracks, duration, sampleRate, onLog);
  }

  const muxerTarget = new ArrayBufferTarget();
  const isVp9 = chosenCodec.startsWith('vp09');

  const muxer = new Muxer({
    target: muxerTarget,
    video: {
      codec: isVp9 ? 'vp9' : 'avc',
      width,
      height
    },
    audio: (audioBuffer && shouldEncodeAudio) ? {
      codec: 'aac',
      numberOfChannels: 2,
      sampleRate
    } : undefined,
    fastStart: 'in-memory',
    firstTimestampBehavior: 'offset'
  });

  let audioEngine: AudioEncoder | null = null;
  if (audioBuffer && shouldEncodeAudio) {
    try {
      const audioDataClass = (window as any).AudioData;
      if (!audioDataClass) {
        throw new Error('AudioData API unavailable');
      }

      audioEngine = new AudioEncoder({
        output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
        error: (e) => onLog(`[WebCodecs AudioEncoder Error] ${e}`)
      });

      audioEngine.configure({
        codec: 'mp4a.40.2',
        sampleRate,
        numberOfChannels: 2,
        bitrate: 192_000
      });

      const chunkSize = 1024;
      const totalSamples = audioBuffer.length;
      const leftChannel = audioBuffer.getChannelData(0);
      const rightChannel = audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : leftChannel;

      for (let sampleOffset = 0; sampleOffset < totalSamples; sampleOffset += chunkSize) {
        const currentChunkFrames = Math.min(chunkSize, totalSamples - sampleOffset);
        const leftSlice = leftChannel.subarray(sampleOffset, sampleOffset + currentChunkFrames);
        const rightSlice = rightChannel.subarray(sampleOffset, sampleOffset + currentChunkFrames);
        const planarData = new Float32Array(currentChunkFrames * 2);

        for (let i = 0; i < currentChunkFrames; i++) {
          planarData[i] = leftSlice[i];
          planarData[currentChunkFrames + i] = rightSlice[i];
        }

        const timestampMicrosec = Math.round((sampleOffset / sampleRate) * 1_000_000);
        const audioData = new audioDataClass({
          format: 'f32-planar',
          sampleRate,
          numberOfFrames: currentChunkFrames,
          numberOfChannels: 2,
          timestamp: timestampMicrosec,
          data: planarData
        });

        audioEngine.encode(audioData);
        audioData.close();
      }

      await audioEngine.flush();
      audioEngine.close();
      onLog('[WebCodecs Audio] Audio frames encoded successfully.');
    } catch (aEncErr) {
      onLog(`[WebCodecs AudioEncoder Note] ${aEncErr}. Continuing video pass.`);
    }
  }

  let encoderError: Error | null = null;
  const videoEncoder = new VideoEncoder({
    output: (chunk, meta) => {
      muxer.addVideoChunk(chunk, meta);
    },
    error: (e) => {
      encoderError = e;
      onLog(`[WebCodecs VideoEncoder Error] ${e}`);
    }
  });

  videoEncoder.configure({
    codec: chosenCodec,
    width,
    height,
    bitrate,
    framerate: fps,
    hardwareAcceleration: 'prefer-hardware',
    latencyMode: 'quality',
    avc: { format: 'avc' }
  });

  const startTime = performance.now();
  let encodedFrames = 0;

  // Dedicated offscreen buffer canvas to guarantee 100% pixel-perfect dimensions for VideoEncoder
  let offscreenCanvas: HTMLCanvasElement | null = null;
  let offscreenCtx: CanvasRenderingContext2D | null = null;

  if (typeof document !== 'undefined' && (canvas.width !== width || canvas.height !== height)) {
    offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
    offscreenCtx = offscreenCanvas.getContext('2d', { alpha: false });
    if (offscreenCtx) {
      offscreenCtx.imageSmoothingEnabled = true;
      offscreenCtx.imageSmoothingQuality = 'high';
    }
  }

  for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
    if (checkCancelled()) {
      onLog('Export cancelled by user.');
      try { videoEncoder.close(); } catch {}
      throw new Error('Export cancelled');
    }

    if (encoderError) {
      throw encoderError;
    }

    const frameTime = frameIndex / fps;
    await renderFrameAtTime(frameTime);

    const timestamp = Math.round((frameIndex / fps) * 1_000_000);
    const isKeyframe = (frameIndex % Math.round(fps * 2) === 0);

    let frameSource: CanvasImageSource = canvas;
    if (offscreenCanvas && offscreenCtx) {
      offscreenCtx.drawImage(canvas, 0, 0, width, height);
      frameSource = offscreenCanvas;
    }

    const videoFrame = new VideoFrame(frameSource, { timestamp });
    videoEncoder.encode(videoFrame, { keyFrame: isKeyframe });
    videoFrame.close();

    encodedFrames++;

    // Adaptive micro-yielding tailored to system CPU/GPU power
    if (frameIndex % sysProfile.yieldIntervalFrames === 0) {
      if (sysProfile.tier === 'turbo' || sysProfile.tier === 'high') {
        await Promise.resolve();
      } else {
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
      }
    }

    // Dynamic Backpressure Queue Throttling tuned to GPU capabilities
    const maxQueue = sysProfile.maxQueueDepth;
    const releaseThreshold = Math.max(1, Math.floor(maxQueue / 2));

    if (videoEncoder.encodeQueueSize > maxQueue) {
      await new Promise<void>((resolve) => {
        let isResolved = false;
        videoEncoder.ondequeue = () => {
          if (videoEncoder.encodeQueueSize <= releaseThreshold && !isResolved) {
            isResolved = true;
            videoEncoder.ondequeue = null;
            resolve();
          }
        };

        setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            videoEncoder.ondequeue = null;
            resolve();
          }
        }, sysProfile.tier === 'turbo' ? 2 : 4);
      });
    }

    if (frameIndex % 5 === 0 || frameIndex === totalFrames - 1) {
      const now = performance.now();
      const elapsedSec = (now - startTime) / 1000;
      const actualFps = elapsedSec > 0 ? Math.round(encodedFrames / elapsedSec) : 0;
      const pct = Math.min(99, Math.floor((frameIndex / totalFrames) * 100));
      onProgress(pct, frameIndex + 1, totalFrames, actualFps);
    }
  }

  onLog('Frames encoded. Finalizing export...');
  await videoEncoder.flush();
  videoEncoder.close();

  muxer.finalize();
  const buffer = muxerTarget.buffer;

  const totalTimeSec = ((performance.now() - startTime) / 1000).toFixed(1);
  const avgFps = totalTimeSec !== '0.0' ? Math.round(totalFrames / parseFloat(totalTimeSec)) : 0;
  onLog(`✅ Export complete in ${totalTimeSec}s, avg ${avgFps} FPS. Size: ${(buffer.byteLength / (1024 * 1024)).toFixed(2)} MB.`);

  onProgress(100, totalFrames, totalFrames, avgFps);
  return new Blob([buffer], { type: 'video/mp4' });
}
