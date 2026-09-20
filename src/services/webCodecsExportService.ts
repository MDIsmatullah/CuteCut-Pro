import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import { Track, Clip, ClipType } from '../types';

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

/**
 * Check if the current browser environment supports the WebCodecs API
 */
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

/**
 * Find the optimal supported H.264 / AVC codec string for this GPU & browser
 */
async function getSupportedVideoCodec(width: number, height: number, fps: number, bitrate: number): Promise<string> {
  const candidateCodecs = [
    'avc1.4d002a', // H.264 Main Profile, Level 4.2 (ideal for 1080p60 / 4K)
    'avc1.640028', // H.264 High Profile, Level 4.0
    'avc1.42001f', // H.264 Baseline Profile, Level 3.1
    'vp09.00.10.08', // VP9 Fallback
  ];

  if (typeof VideoEncoder.isConfigSupported === 'function') {
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
        // try next
      }
    }
  }

  // Default standard H.264 codec string
  return 'avc1.4d002a';
}

/**
 * Mix all audio clips from timeline tracks into an offline AudioBuffer
 */
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
          const rawVol = c.volume !== undefined ? c.volume : 80;
          if (rawVol > 0) {
            audioClips.push(c);
          }
        }
      });
    });

    if (audioClips.length === 0) {
      return null;
    }

    onLog(`[WebCodecs Audio] Preparing offline audio mix for ${audioClips.length} track clips...`);

    // Fetch and decode audio buffers for each clip
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

    // Render into OfflineAudioContext
    const totalSamples = Math.ceil(totalDuration * sampleRate);
    const offlineCtx = new OfflineAudioContext(2, Math.max(sampleRate, totalSamples), sampleRate);

    clipBuffers.forEach(({ clip, buffer }) => {
      const source = offlineCtx.createBufferSource();
      source.buffer = buffer;

      const gainNode = offlineCtx.createGain();
      const rawVol = clip.volume !== undefined ? clip.volume : 80;
      const vol = Math.max(0, Math.min(1, rawVol > 1 ? rawVol / 100 : rawVol));
      gainNode.gain.value = vol;

      source.connect(gainNode);
      gainNode.connect(offlineCtx.destination);

      const startTime = Math.max(0, clip.start);
      const offset = Math.max(0, clip.sourceStart || 0);
      const clipDuration = clip.duration;

      source.start(startTime, offset, clipDuration);
    });

    onLog(`[WebCodecs Audio] Rendering studio audio master (${sampleRate}Hz Stereo)...`);
    const rendered = await offlineCtx.startRendering();
    onLog(`[WebCodecs Audio] Audio mix complete (${rendered.duration.toFixed(1)}s).`);
    return rendered;
  } catch (err) {
    onLog(`[WebCodecs Audio] Offline audio mix notice: ${err}`);
    return null;
  }
}

/**
 * Execute GPU Hardware-Accelerated Video & Audio Export with WebCodecs
 */
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

  const totalFrames = Math.max(1, Math.ceil(duration * fps));
  const chosenCodec = await getSupportedVideoCodec(width, height, fps, bitrate);
  const sampleRate = 44100;

  onLog(`🚀 Activating WebCodecs Hardware Engine (GPU Prefer-Hardware)...`);
  onLog(`Codec Profile: ${chosenCodec} | Target: ${width}x${height} @ ${fps}fps (${(bitrate / 1_000_000).toFixed(1)} Mbps)`);

  // 1. Prepare Audio Master
  let audioBuffer: AudioBuffer | null = null;
  const support = checkWebCodecsSupport();
  const shouldEncodeAudio = support.hasAudioEncoder;

  if (shouldEncodeAudio) {
    audioBuffer = await renderTimelineAudioOffline(tracks, duration, sampleRate, onLog);
  }

  // 2. Initialize MP4 Muxer
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

  // 3. Initialize AudioEncoder if audio buffer exists
  let audioEngine: AudioEncoder | null = null;
  if (audioBuffer && shouldEncodeAudio) {
    try {
      audioEngine = new AudioEncoder({
        output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
        error: (e) => onLog(`[WebCodecs AudioEncoder Error] ${e}`)
      });

      audioEngine.configure({
        codec: 'mp4a.40.2', // AAC-LC
        sampleRate,
        numberOfChannels: 2,
        bitrate: 192_000
      });

      // Encode audio buffer into chunks
      const audioDataClass = (window as any).AudioData;
      if (audioDataClass) {
        const chunkSize = 1024;
        const totalSamples = audioBuffer.length;
        const leftChannel = audioBuffer.getChannelData(0);
        const rightChannel = audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : leftChannel;

        for (let sampleOffset = 0; sampleOffset < totalSamples; sampleOffset += chunkSize) {
          const currentChunkFrames = Math.min(chunkSize, totalSamples - sampleOffset);
          const chunkLeft = leftChannel.subarray(sampleOffset, sampleOffset + currentChunkFrames);
          const chunkRight = rightChannel.subarray(sampleOffset, sampleOffset + currentChunkFrames);

          // Planar float32 interleaved or separate planes
          const planarData = new Float32Array(currentChunkFrames * 2);
          planarData.set(chunkLeft, 0);
          planarData.set(chunkRight, currentChunkFrames);

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
        onLog(`[WebCodecs Audio] All audio frames encoded into MP4 stream.`);
      }
    } catch (aEncErr) {
      onLog(`[WebCodecs AudioEncoder Note] ${aEncErr}. Continuing video pass.`);
    }
  }

  // 4. Initialize VideoEncoder
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
    avc: { format: 'avc' }
  });

  onLog(`⚡ VideoEncoder ready! Starting hardware frame extraction loop (${totalFrames} frames)...`);

  const startTime = performance.now();
  let encodedFrames = 0;

  // 5. Hardware Accelerated Frame Render & Encode Loop
  for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
    if (checkCancelled()) {
      onLog(`Export cancelled by user.`);
      try {
        videoEncoder.close();
      } catch {}
      throw new Error('Export cancelled');
    }

    if (encoderError) {
      throw encoderError;
    }

    const frameTime = frameIndex / fps;

    // Ask PreviewPlayer canvas to render current exact frame
    await renderFrameAtTime(frameTime);

    // Microsecond timestamp
    const timestamp = Math.round((frameIndex / fps) * 1_000_000);
    const isKeyframe = (frameIndex % Math.round(fps * 2) === 0);

    const videoFrame = new VideoFrame(canvas, { timestamp });
    videoEncoder.encode(videoFrame, { keyFrame: isKeyframe });
    videoFrame.close();

    encodedFrames++;

    // Throttling: If GPU queue is busy, yield to event loop so browser doesn't freeze
    if (videoEncoder.encodeQueueSize > 5) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    // Progress update every few frames or on completion
    if (frameIndex % 5 === 0 || frameIndex === totalFrames - 1) {
      const now = performance.now();
      const elapsedSec = (now - startTime) / 1000;
      const actualFps = elapsedSec > 0 ? Math.round(encodedFrames / elapsedSec) : 0;
      const pct = Math.min(99, Math.floor((frameIndex / totalFrames) * 100));
      onProgress(pct, frameIndex + 1, totalFrames, actualFps);
    }
  }

  onLog(`Frames rendering complete. Flushing GPU pipeline & finalizing MP4 container...`);
  await videoEncoder.flush();
  videoEncoder.close();

  // Finalize Muxer
  muxer.finalize();
  const buffer = muxerTarget.buffer;

  const totalTimeSec = ((performance.now() - startTime) / 1000).toFixed(1);
  const avgFps = totalTimeSec !== '0.0' ? Math.round(totalFrames / parseFloat(totalTimeSec)) : 0;
  onLog(`✅ WebCodecs Export Finished in ${totalTimeSec}s! (Average GPU Speed: ${avgFps} FPS). Output: ${(buffer.byteLength / (1024 * 1024)).toFixed(2)} MB.`);

  onProgress(100, totalFrames, totalFrames, avgFps);

  return new Blob([buffer], { type: 'video/mp4' });
}
