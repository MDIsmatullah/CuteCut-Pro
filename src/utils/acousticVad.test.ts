import { analyzeVoiceActivityRMS } from './editorUtils';
import { extractAcousticObservations } from './quranAlignmentEngine';

export interface AcousticTestResult {
  name: string;
  passed: boolean;
  details?: string;
}

export function runAcousticVadTests(): {
  total: number;
  passed: number;
  failed: number;
  results: AcousticTestResult[];
} {
  const results: AcousticTestResult[] = [];
  const sampleRate = 16000;

  function generateToneSegment(
    durationSec: number,
    amplitude: number,
    freqHz = 220,
    noiseAmp = 0.001
  ): Float32Array {
    const totalSamples = Math.floor(durationSec * sampleRate);
    const pcm = new Float32Array(totalSamples);
    for (let i = 0; i < totalSamples; i++) {
      const tone = Math.sin((2 * Math.PI * freqHz * i) / sampleRate) * amplitude;
      const noise = (Math.random() * 2 - 1) * noiseAmp;
      pcm[i] = tone + noise;
    }
    return pcm;
  }

  function generateSilenceSegment(durationSec: number, noiseAmp = 0.001): Float32Array {
    const totalSamples = Math.floor(durationSec * sampleRate);
    const pcm = new Float32Array(totalSamples);
    for (let i = 0; i < totalSamples; i++) {
      pcm[i] = (Math.random() * 2 - 1) * noiseAmp;
    }
    return pcm;
  }

  function concatenate(arrays: Float32Array[]): Float32Array {
    const totalLength = arrays.reduce((acc, a) => acc + a.length, 0);
    const res = new Float32Array(totalLength);
    let offset = 0;
    for (const a of arrays) {
      res.set(a, offset);
      offset += a.length;
    }
    return res;
  }

  // TEST 1: Baseline Clean Recording (High SNR, 3 Ayahs with standard Waqf pauses)
  {
    // Ayah 1 (1.5s) -> Silence 0.8s -> Ayah 2 (2.0s) -> Silence 1.0s -> Ayah 3 (1.2s)
    const a1 = generateToneSegment(1.5, 0.4, 200, 0.001);
    const s1 = generateSilenceSegment(0.8, 0.001);
    const a2 = generateToneSegment(2.0, 0.45, 220, 0.001);
    const s2 = generateSilenceSegment(1.0, 0.001);
    const a3 = generateToneSegment(1.2, 0.38, 210, 0.001);
    const pcm = concatenate([s1, a1, s1, a2, s2, a3, s1]);

    const segs = analyzeVoiceActivityRMS(pcm, sampleRate, { noiseFloorSensitivity: 'quran-ayah' });
    const passed = segs.length === 3;
    results.push({
      name: 'Baseline Clean 3-Ayah Voice Activity Detection',
      passed,
      details: `Detected ${segs.length} segments (expected 3)`
    });
  }

  // TEST 2: Low-Level / Quiet Reciter (Quiet Voice ~-30dB, low noise floor)
  {
    const a1 = generateToneSegment(1.2, 0.04, 180, 0.0005);
    const s1 = generateSilenceSegment(0.7, 0.0005);
    const a2 = generateToneSegment(1.8, 0.05, 190, 0.0005);
    const pcm = concatenate([s1, a1, s1, a2, s1]);

    const segs = analyzeVoiceActivityRMS(pcm, sampleRate, { noiseFloorSensitivity: 'quran-ayah' });
    const passed = segs.length === 2;
    results.push({
      name: 'Quiet Reciter Adaptive Dynamic Range Detection',
      passed,
      details: `Detected ${segs.length} segments (expected 2)`
    });
  }

  // TEST 3: High Background Noise Floor / Mosque Reverb (Low SNR)
  {
    // Background noise amplitude 0.015 (~-36dB), speech 0.15 (~-16dB) -> ~20dB SNR
    const a1 = generateToneSegment(1.6, 0.15, 230, 0.012);
    const s1 = generateSilenceSegment(0.9, 0.012);
    const a2 = generateToneSegment(1.4, 0.16, 240, 0.012);
    const pcm = concatenate([s1, a1, s1, a2, s1]);

    const segs = analyzeVoiceActivityRMS(pcm, sampleRate, { noiseFloorSensitivity: 'mosque' });
    const passed = segs.length === 2;
    results.push({
      name: 'High Noise Floor & Mosque Reverb Tolerance',
      passed,
      details: `Detected ${segs.length} segments (expected 2)`
    });
  }

  // TEST 4: Fast Recitation / Hadr (Short Ayahs, quick 200ms breathing gaps)
  {
    const a1 = generateToneSegment(0.7, 0.35, 250, 0.002);
    const s1 = generateSilenceSegment(0.25, 0.002); // 250ms Waqf breath
    const a2 = generateToneSegment(0.6, 0.38, 260, 0.002);
    const s2 = generateSilenceSegment(0.22, 0.002);
    const a3 = generateToneSegment(0.8, 0.32, 240, 0.002);
    const pcm = concatenate([s1, a1, s1, a2, s2, a3, s1]);

    const segs = analyzeVoiceActivityRMS(pcm, sampleRate, {
      noiseFloorSensitivity: 'hadr',
      minSilenceMs: 160,
      minSpeechMs: 250
    });
    const passed = segs.length === 3;
    results.push({
      name: 'Rapid Hadr Pace & Short Breath Gap Separation',
      passed,
      details: `Detected ${segs.length} segments (expected 3)`
    });
  }

  // TEST 5: Slow Tartil Recitation with Long Madd Prolongations and Deep Breathing
  {
    // Long 4-second recitation with natural intra-ayah amplitude dip (Madd) that should NOT be split prematurely
    const pcm1 = generateToneSegment(1.5, 0.4, 200, 0.001);
    const dip = generateToneSegment(0.3, 0.08, 200, 0.001); // Soft vowel dip
    const pcm2 = generateToneSegment(1.8, 0.35, 200, 0.001);
    const longAyah = concatenate([pcm1, dip, pcm2]); // Total ~3.6s contiguous Ayah

    const pause = generateSilenceSegment(1.2, 0.001); // 1.2s Waqf
    const ayah2 = generateToneSegment(2.5, 0.38, 210, 0.001);
    const pcm = concatenate([pause, longAyah, pause, ayah2, pause]);

    const segs = analyzeVoiceActivityRMS(pcm, sampleRate, { noiseFloorSensitivity: 'tartil' });
    const passed = segs.length === 2;
    results.push({
      name: 'Slow Tartil with Madd Vowel Continuity & Waqf Distinction',
      passed,
      details: `Detected ${segs.length} segments (expected 2)`
    });
  }

  // TEST 6: Alignment Feature Extraction & Acoustic Candidates Output
  {
    const a1 = generateToneSegment(1.2, 0.3, 220, 0.002);
    const s1 = generateSilenceSegment(0.6, 0.002);
    const a2 = generateToneSegment(1.5, 0.35, 230, 0.002);
    const pcm = concatenate([s1, a1, s1, a2, s1]);

    const acoustic = extractAcousticObservations(pcm, sampleRate);
    const hasCandidates = acoustic.candidates.length >= 2;
    const hasObservations = acoustic.observations.length >= 2;
    const hasSensibleNoiseFloor = acoustic.adaptiveNoiseFloorDb < -30;
    const hasSensiblePeak = acoustic.averageSpeechDb > -30;

    const passed = hasCandidates && hasObservations && hasSensibleNoiseFloor && hasSensiblePeak;
    results.push({
      name: 'Acoustic Observation & Boundary Candidate Generation',
      passed,
      details: `Candidates: ${acoustic.candidates.length}, Observations: ${acoustic.observations.length}, NoiseFloor: ${acoustic.adaptiveNoiseFloorDb}dB, Peak: ${acoustic.averageSpeechDb}dB`
    });
  }

  const passedCount = results.filter(r => r.passed).length;
  return {
    total: results.length,
    passed: passedCount,
    failed: results.length - passedCount,
    results
  };
}
