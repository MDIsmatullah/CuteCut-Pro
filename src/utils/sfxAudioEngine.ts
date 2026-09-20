import { SoundEffectItem } from '../data/sfxLibraryData';

/**
 * Procedural Studio-Grade SFX Engine using Web Audio API & OfflineAudioContext.
 * Generates clean, zero-latency, offline-compatible WAV audio blobs for 1-click timeline drop
 * and instantaneous auditioning.
 */

// Memory cache for synthesized Blob URLs so audio is generated only once per session
const sfxBlobCache = new Map<string, string>();
let activePreviewAudio: HTMLAudioElement | null = null;

/**
 * Converts an AudioBuffer into a compliant 16-bit Stereo/Mono WAV Blob
 */
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const numSamples = buffer.length;
  const dataSize = numSamples * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  function writeString(offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  // RIFF chunk descriptor
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');

  // "fmt " sub-chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, format, true); // AudioFormat
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitDepth, true); // BitsPerSample

  // "data" sub-chunk
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Interleave and write 16-bit PCM samples
  const channelData: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channelData.push(buffer.getChannelData(ch));
  }

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = channelData[ch][i];
      // Soft clamp -1.0 to 1.0
      sample = Math.max(-1, Math.min(1, sample));
      // Convert to 16-bit signed integer
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([view], { type: 'audio/wav' });
}

/**
 * Creates noise buffer
 */
function createNoiseBuffer(ctx: BaseAudioContext, duration: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, Math.max(1, Math.floor(sampleRate * duration)), sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0.0;
  // Pink-ish noise filter for warmer cinematic texture
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    lastOut = (lastOut + 0.02 * white) / 1.02;
    data[i] = lastOut * 3.5;
  }
  return buffer;
}

/**
 * Procedurally generates audio buffer for a given sound effect type using OfflineAudioContext
 */
export async function synthesizeSfxBuffer(sfx: SoundEffectItem): Promise<AudioBuffer> {
  const sampleRate = 44100;
  const duration = Math.max(0.1, sfx.duration);
  const totalSamples = Math.ceil(sampleRate * duration);

  const OfflineCtxClass = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
  const ctx = new OfflineCtxClass(2, totalSamples, sampleRate);

  const now = 0;
  const type = sfx.synthesisType || '';

  // ==========================================
  // WHOOSH FAMILY
  // ==========================================
  if (type.startsWith('whoosh')) {
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, duration);

    const biquad = ctx.createBiquadFilter();
    biquad.type = 'bandpass';
    biquad.Q.value = type.includes('fast') ? 4 : type.includes('deep') ? 1.8 : 2.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);

    const peakTime = type.includes('reverse') ? duration * 0.85 : duration * 0.45;
    gain.gain.exponentialRampToValueAtTime(0.9, peakTime);
    gain.gain.exponentialRampToValueAtTime(0.001, duration - 0.01);

    if (type.includes('deep') || type.includes('low')) {
      biquad.frequency.setValueAtTime(60, now);
      biquad.frequency.exponentialRampToValueAtTime(650, peakTime);
      biquad.frequency.exponentialRampToValueAtTime(80, duration);

      // Add sub sine layer
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(80, now);
      subOsc.frequency.exponentialRampToValueAtTime(140, peakTime);
      subOsc.frequency.exponentialRampToValueAtTime(45, duration);

      subGain.gain.setValueAtTime(0.001, now);
      subGain.gain.exponentialRampToValueAtTime(0.7, peakTime);
      subGain.gain.exponentialRampToValueAtTime(0.001, duration);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(duration);
    } else if (type.includes('reverse')) {
      biquad.frequency.setValueAtTime(150, now);
      biquad.frequency.exponentialRampToValueAtTime(3200, duration * 0.9);
      biquad.frequency.exponentialRampToValueAtTime(200, duration);
    } else if (type.includes('scifi') || type.includes('warp')) {
      biquad.frequency.setValueAtTime(300, now);
      biquad.frequency.exponentialRampToValueAtTime(4200, peakTime);
      biquad.frequency.exponentialRampToValueAtTime(180, duration);

      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(120, duration);
      oscGain.gain.setValueAtTime(0.2, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, duration);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(duration);
    } else {
      // Standard / whip / fast whoosh
      biquad.frequency.setValueAtTime(250, now);
      biquad.frequency.exponentialRampToValueAtTime(2200, peakTime);
      biquad.frequency.exponentialRampToValueAtTime(150, duration);
    }

    noise.connect(biquad);
    biquad.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(duration);
  }
  // ==========================================
  // IMPACT FAMILY
  // ==========================================
  else if (type.startsWith('impact')) {
    // 1. Sub Bass Drop / Punch
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';

    if (type.includes('braam')) {
      subOsc.type = 'sawtooth';
      subOsc.frequency.setValueAtTime(130, now);
      subOsc.frequency.exponentialRampToValueAtTime(45, duration * 0.4);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.frequency.exponentialRampToValueAtTime(200, duration);

      subGain.gain.setValueAtTime(0.85, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, duration - 0.05);

      subOsc.connect(filter);
      filter.connect(subGain);
    } else {
      subOsc.frequency.setValueAtTime(180, now);
      subOsc.frequency.exponentialRampToValueAtTime(type.includes('sub_boom') ? 40 : 50, 0.15);
      subGain.gain.setValueAtTime(0.95, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, duration - 0.02);
      subOsc.connect(subGain);
    }

    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(duration);

    // 2. Transient Click / Hit
    const hitNoise = ctx.createBufferSource();
    hitNoise.buffer = createNoiseBuffer(ctx, Math.min(duration, 0.4));
    const hitFilter = ctx.createBiquadFilter();
    hitFilter.type = 'lowpass';
    hitFilter.frequency.setValueAtTime(type.includes('metal') ? 4000 : 1200, now);
    hitFilter.frequency.exponentialRampToValueAtTime(100, 0.25);

    const hitGain = ctx.createGain();
    hitGain.gain.setValueAtTime(0.8, now);
    hitGain.gain.exponentialRampToValueAtTime(0.001, 0.25);

    hitNoise.connect(hitFilter);
    hitFilter.connect(hitGain);
    hitGain.connect(ctx.destination);
    hitNoise.start(now);
    hitNoise.stop(0.3);

    // Optional metallic ring
    if (type.includes('metal') || type.includes('anvil') || type.includes('shield')) {
      const ringOsc = ctx.createOscillator();
      const ringGain = ctx.createGain();
      ringOsc.type = 'triangle';
      ringOsc.frequency.setValueAtTime(1180, now);
      ringGain.gain.setValueAtTime(0.4, now);
      ringGain.gain.exponentialRampToValueAtTime(0.001, 0.9);
      ringOsc.connect(ringGain);
      ringGain.connect(ctx.destination);
      ringOsc.start(now);
      ringOsc.stop(0.9);
    }
  }
  // ==========================================
  // RISER FAMILY
  // ==========================================
  else if (type.startsWith('riser')) {
    // Swept oscillator + rising noise
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = type.includes('cyberpunk') ? 'sawtooth' : type.includes('horror') ? 'sawtooth' : 'sine';

    const startFreq = type.includes('screamer') ? 350 : 80;
    const endFreq = type.includes('screamer') ? 4800 : type.includes('bassdrone') ? 320 : 1800;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, duration * 0.95);

    oscGain.gain.setValueAtTime(0.01, now);
    oscGain.gain.exponentialRampToValueAtTime(0.75, duration * 0.95);
    oscGain.gain.linearRampToValueAtTime(0.0001, duration);

    // Vibrato / tremolo
    if (type.includes('horror') || type.includes('scifi')) {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(7, now);
      lfoGain.gain.setValueAtTime(30, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(duration);
    }

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(duration);

    // Rising noise layer
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, duration);
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(180, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(4500, duration * 0.95);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.005, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.65, duration * 0.95);
    noiseGain.gain.linearRampToValueAtTime(0.001, duration);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(duration);
  }
  // ==========================================
  // YOUTUBE & VLOG FAMILY (POPS & BELLS)
  // ==========================================
  else if (type.startsWith('vlog')) {
    if (type.includes('pop') || type.includes('cork')) {
      // Juicy Bubble Pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';

      const popStart = type.includes('cork') ? 450 : 1250;
      const popEnd = type.includes('cork') ? 120 : 380;
      osc.frequency.setValueAtTime(popStart, now);
      osc.frequency.exponentialRampToValueAtTime(popEnd, duration * 0.7);

      gain.gain.setValueAtTime(0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.001, duration - 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(duration);
    } else if (type.includes('bell') || type.includes('chime') || type.includes('ping') || type.includes('coin')) {
      // Bell / notification chime with harmonics
      const freqs = type.includes('coin')
        ? [1860, 2980, 4200]
        : type.includes('success')
        ? [523.25, 659.25, 783.99, 1046.5] // C major chord
        : [1568, 2349, 3136];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const startDelay = type.includes('success') ? idx * 0.12 : 0;

        osc.frequency.setValueAtTime(freq, now + startDelay);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.setValueAtTime(0.6 / (idx + 1), now + startDelay);
        gain.gain.exponentialRampToValueAtTime(0.001, duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + startDelay);
        osc.stop(duration);
      });
    } else if (type.includes('buzzer')) {
      // Error buzzer
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);

      gain.gain.setValueAtTime(0.7, now);
      gain.gain.setValueAtTime(0.001, 0.25);
      gain.gain.setValueAtTime(0.7, 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(duration);
    } else if (type.includes('camera') || type.includes('click') || type.includes('typing') || type.includes('switch')) {
      // Shutter click / mouse click / typing
      const clicks = type.includes('typing') ? [0, 0.18, 0.35, 0.55, 0.8, 1.05] : type.includes('camera') ? [0, 0.08] : [0];
      clicks.forEach(t => {
        if (t < duration) {
          const noise = ctx.createBufferSource();
          noise.buffer = createNoiseBuffer(ctx, 0.06);
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(2400, now + t);
          filter.Q.value = 5;

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.85, now + t);
          gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.05);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          noise.start(now + t);
          noise.stop(now + t + 0.06);
        }
      });
    } else {
      // General vlog / game jump
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(650, duration * 0.8);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(duration);
    }
  }
  // ==========================================
  // GLITCH & TECH FAMILY
  // ==========================================
  else if (type.startsWith('glitch')) {
    const numStutters = 8;
    const sliceDur = duration / numStutters;
    for (let i = 0; i < numStutters; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i % 2 === 0 ? 'sawtooth' : 'square';
      const randomFreq = 200 + Math.random() * 2400;
      osc.frequency.setValueAtTime(randomFreq, now + i * sliceDur);

      gain.gain.setValueAtTime(0.5, now + i * sliceDur);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (i + 1) * sliceDur - 0.005);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * sliceDur);
      osc.stop(now + (i + 1) * sliceDur);
    }
  }
  // ==========================================
  // ISLAMIC NASHEED & SACRED AMBIANCES FAMILY
  // ==========================================
  else if (type.startsWith('islamic')) {
    if (type.includes('droplet') || type.includes('zamzam')) {
      // Sacred Water Droplet with beautiful hall reverb
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(620, 0.12);

      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, duration - 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(duration);
    } else if (type.includes('tasbih') || type.includes('pageturn')) {
      // Wooden tasbih beads click / Quran page slide
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, duration);
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(type.includes('tasbih') ? 1600 : 900, now);
      filter.Q.value = type.includes('tasbih') ? 8 : 1.5;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, duration - 0.05);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      noise.stop(duration);
    } else {
      // Sacred Warm Tone / Drone (Hijaz / Bayati resonance)
      // Chords: Root D (146.83Hz), Fifth A (220Hz), Octave D (293.66Hz), Minor Third F (174.61Hz)
      const chord = [146.83, 174.61, 220.0, 293.66];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Slow soft swell and release
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.3 / (idx + 1), duration * 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, duration - 0.05);

        // Warm lowpass filter
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, now);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(duration);
      });

      // Soft serene wind undercurrent
      const wind = ctx.createBufferSource();
      wind.buffer = createNoiseBuffer(ctx, duration);
      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.setValueAtTime(320, now);
      const windGain = ctx.createGain();
      windGain.gain.setValueAtTime(0.001, now);
      windGain.gain.linearRampToValueAtTime(0.12, duration * 0.4);
      windGain.gain.exponentialRampToValueAtTime(0.001, duration - 0.02);
      wind.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(ctx.destination);
      wind.start(now);
      wind.stop(duration);
    }
  }
  // ==========================================
  // NATURE & FOLEY FAMILY
  // ==========================================
  else {
    // Rain, wind, thunder, waves
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, duration);
    const filter = ctx.createBiquadFilter();

    if (type.includes('thunder')) {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, now);
      filter.frequency.exponentialRampToValueAtTime(60, duration * 0.8);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.001, duration);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
    } else {
      // Waves / gentle rain
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(750, now);
      filter.Q.value = 1.2;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.4, duration * 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, duration - 0.05);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
    }

    noise.start(now);
    noise.stop(duration);
  }

  return await ctx.startRendering();
}

/**
 * Gets or creates a guaranteed, offline-ready WAV Blob URL for a sound effect item.
 */
export async function getSfxBlobUrl(sfx: SoundEffectItem): Promise<string> {
  if (sfxBlobCache.has(sfx.id)) {
    return sfxBlobCache.get(sfx.id)!;
  }

  try {
    const audioBuffer = await synthesizeSfxBuffer(sfx);
    const wavBlob = audioBufferToWavBlob(audioBuffer);
    const blobUrl = URL.createObjectURL(wavBlob);
    sfxBlobCache.set(sfx.id, blobUrl);
    return blobUrl;
  } catch (err) {
    console.error(`Failed to synthesize SFX buffer for ${sfx.id}`, err);
    // Fallback to static URL if present
    if (sfx.url) {
      return sfx.url;
    }
    throw err;
  }
}

/**
 * Live audio auditioning player with stop callback
 */
export async function playSfxPreview(
  sfx: SoundEffectItem,
  onEnded?: () => void
): Promise<() => void> {
  // Stop previous preview if active
  if (activePreviewAudio) {
    try {
      activePreviewAudio.pause();
      activePreviewAudio.currentTime = 0;
    } catch {}
    activePreviewAudio = null;
  }

  const audioUrl = await getSfxBlobUrl(sfx);
  const audio = new Audio(audioUrl);
  activePreviewAudio = audio;

  audio.onended = () => {
    if (activePreviewAudio === audio) {
      activePreviewAudio = null;
    }
    if (onEnded) onEnded();
  };

  audio.onerror = () => {
    if (activePreviewAudio === audio) {
      activePreviewAudio = null;
    }
    if (onEnded) onEnded();
  };

  try {
    await audio.play();
  } catch (err) {
    console.warn('Audio play prevented or interrupted:', err);
    if (onEnded) onEnded();
  }

  return () => {
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch {}
    if (activePreviewAudio === audio) {
      activePreviewAudio = null;
    }
  };
}

/**
 * Stops any currently playing preview
 */
export function stopSfxPreview(): void {
  if (activePreviewAudio) {
    try {
      activePreviewAudio.pause();
      activePreviewAudio.currentTime = 0;
    } catch {}
    activePreviewAudio = null;
  }
}
