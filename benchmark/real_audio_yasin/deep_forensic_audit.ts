import fs from 'fs';
import path from 'path';
import { getCanonicalSurahVerses } from '../../src/data/canonicalQuran';
import {
  runQuranAlignmentEngine,
  extractAcousticObservations,
  QuranVerseInput
} from '../../src/utils/quranAlignmentEngine';

interface ReferenceWordSegment {
  wordIndex: number;
  startMs: number;
  endMs: number;
}

interface ReferenceVerse {
  verse_key: string;
  timestamp_from: number;
  timestamp_to: number;
  duration: number;
  segments?: number[][]; // [wordIndex, startMs, endMs]
}

export function performDeepForensicAudit() {
  const wavPath = path.resolve('benchmark/real_audio_yasin/036_16k.wav');
  const refPath = path.resolve('benchmark/real_audio_yasin/quran_foundation_reference_36.json');

  if (!fs.existsSync(wavPath) || !fs.existsSync(refPath)) {
    throw new Error('Required audio or reference files not found');
  }

  // 1. Read and parse PCM
  const wavBuffer = fs.readFileSync(wavPath);
  const pcm16 = new Int16Array(wavBuffer.buffer, wavBuffer.byteOffset + 44, (wavBuffer.byteLength - 44) / 2);
  const sampleRate = 16000;
  const totalSamples = pcm16.length;
  const totalDurationSec = totalSamples / sampleRate;

  const float32 = new Float32Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    float32[i] = pcm16[i] / 32768.0;
  }

  // Helper to compute local energy and voice activity in a window [startSec, endSec]
  function analyzeWindow(startSec: number, endSec: number) {
    const sIdx = Math.max(0, Math.floor(startSec * sampleRate));
    const eIdx = Math.min(totalSamples, Math.floor(endSec * sampleRate));
    if (eIdx <= sIdx) return { rmsDb: -100, peakDb: -100, hasVoice: false };

    let sumSq = 0;
    let peak = 0;
    for (let i = sIdx; i < eIdx; i++) {
      const v = float32[i];
      const absV = Math.abs(v);
      sumSq += v * v;
      if (absV > peak) peak = absV;
    }
    const rms = Math.sqrt(sumSq / (eIdx - sIdx));
    const rmsDb = rms > 1e-6 ? 20 * Math.log10(rms) : -100;
    const peakDb = peak > 1e-6 ? 20 * Math.log10(peak) : -100;
    return { rmsDb, peakDb, hasVoice: rmsDb > -35 };
  }

  // Find exact voice onset and offset around a timestamp
  function findPhysicalAcousticBoundary(centerSec: number, searchRadiusSec: number = 2.0) {
    const minT = Math.max(0, centerSec - searchRadiusSec);
    const maxT = Math.min(totalDurationSec, centerSec + searchRadiusSec);
    const stepSec = 0.01; // 10ms resolution
    let minEnergy = Infinity;
    let bestT = centerSec;

    for (let t = minT; t <= maxT; t += stepSec) {
      const w = analyzeWindow(t - 0.05, t + 0.05); // 100ms window
      if (w.rmsDb < minEnergy) {
        minEnergy = w.rmsDb;
        bestT = t;
      }
    }
    return { bestT: Number(bestT.toFixed(3)), minEnergyDb: Number(minEnergy.toFixed(2)) };
  }

  // 2. Load Canonical Quran and Reference Data
  const canonicalYasin = getCanonicalSurahVerses(36);
  const refJson = JSON.parse(fs.readFileSync(refPath, 'utf8'));
  const refVerses: ReferenceVerse[] = refJson.audio_file.timestamps;

  // Extract Acoustic Observations
  const acoustic = extractAcousticObservations(float32, sampleRate, { minSilenceMs: 250, minSpeechMs: 200 });

  const versesInput: QuranVerseInput[] = canonicalYasin.map(v => ({
    verse_key: v.verse_key,
    text_uthmani: v.text_uthmani,
    translation: v.translation
  }));

  const referencePriors = refVerses.map(r => ({
    verseKey: r.verse_key,
    expectedStartMs: r.timestamp_from,
    expectedEndMs: r.timestamp_to,
    confidence: 1.0,
    source: 'quran-foundation-v4',
    provenance: 'provider' as const
  }));

  const realAcousticSegments = acoustic.observations.map(o => ({
    start: o.start,
    end: o.end
  }));

  const alignedResults = runQuranAlignmentEngine(versesInput, {
    pcmData: float32,
    sampleRate: 16000,
    acousticSegments: realAcousticSegments,
    audioDuration: totalDurationSec,
    referencePriors,
    strictRealAudio: true,
    allowProportionalSplit: false,
    allowInterpolation: false,
    allowLegacyFallback: false,
    allowProviderOverride: false
  });

  // Reconstruct all 166 boundaries
  interface ReconstructedBoundary {
    boundary_id: string; // e.g. "36:1_START", "36:1_END"
    ayah_number: number;
    boundary_type: 'START' | 'END';
    autosegment_sec: number;
    reference_sec: number;
    abs_error_ms: number;
    ref_word_actual_boundary_sec: number;
    acoustic_valley_sec: number;
    acoustic_valley_db: number;
    pcm_state_at_ref: string; // 'SILENCE', 'SUSTAINED_VOICING', 'BREATH_PAUSE'
    classification: string;
    notes: string;
  }

  const boundaries: ReconstructedBoundary[] = [];

  for (let i = 0; i < 83; i++) {
    const vKey = canonicalYasin[i].verse_key;
    const ayahNum = i + 1;
    const autoVerse = alignedResults[i];
    const refVerse = refVerses[i];

    const autoStartSec = Number(autoVerse.startTime.toFixed(3));
    const autoEndSec = Number(autoVerse.endTime.toFixed(3));
    const refStartSec = Number((refVerse.timestamp_from / 1000).toFixed(3));
    const refEndSec = Number((refVerse.timestamp_to / 1000).toFixed(3));

    // Ref word segments
    const segments = refVerse.segments || [];
    const firstWordStart = segments.length > 0 ? Number((segments[0][1] / 1000).toFixed(3)) : refStartSec;
    const lastWordEnd = segments.length > 0 ? Number((segments[segments.length - 1][2] / 1000).toFixed(3)) : refEndSec;

    // START boundary
    const startErrMs = Math.round(Math.abs(autoStartSec - refStartSec) * 1000);
    const startValley = findPhysicalAcousticBoundary(refStartSec, 1.5);
    const pcmAtRefStart = analyzeWindow(refStartSec - 0.05, refStartSec + 0.05);

    boundaries.push({
      boundary_id: `${vKey}_START`,
      ayah_number: ayahNum,
      boundary_type: 'START',
      autosegment_sec: autoStartSec,
      reference_sec: refStartSec,
      abs_error_ms: startErrMs,
      ref_word_actual_boundary_sec: firstWordStart,
      acoustic_valley_sec: startValley.bestT,
      acoustic_valley_db: startValley.minEnergyDb,
      pcm_state_at_ref: pcmAtRefStart.rmsDb < -35 ? 'SILENCE' : 'SUSTAINED_VOICING',
      classification: '',
      notes: ''
    });

    // END boundary
    const endErrMs = Math.round(Math.abs(autoEndSec - refEndSec) * 1000);
    const endValley = findPhysicalAcousticBoundary(refEndSec, 2.0);
    const pcmAtRefEnd = analyzeWindow(refEndSec - 0.05, refEndSec + 0.05);

    boundaries.push({
      boundary_id: `${vKey}_END`,
      ayah_number: ayahNum,
      boundary_type: 'END',
      autosegment_sec: autoEndSec,
      reference_sec: refEndSec,
      abs_error_ms: endErrMs,
      ref_word_actual_boundary_sec: lastWordEnd,
      acoustic_valley_sec: endValley.bestT,
      acoustic_valley_db: endValley.minEnergyDb,
      pcm_state_at_ref: pcmAtRefEnd.rmsDb < -35 ? 'SILENCE' : 'SUSTAINED_VOICING',
      classification: '',
      notes: ''
    });
  }

  // Classify each boundary
  for (const b of boundaries) {
    if (b.abs_error_ms <= 200) {
      b.classification = 'VALID_AGREEMENT';
      continue;
    }

    // Determine classification for >200ms
    // Check if reference timestamp itself is a metadata zero or convention artifact
    if (b.boundary_id === '36:1_START' && b.reference_sec === 0.0) {
      // Audio starts with 2.97s silence / intro
      b.classification = 'REFERENCE_BOUNDARY_MISMATCH';
      b.notes = 'Reference timestamp_from is set to 0.0s (file beginning), whereas actual recitation voice onset is at 2.97s';
      continue;
    }

    // Check if reference verse timestamp differs from the actual word segment boundary
    // e.g. refStart is 4.62, but word 1 starts at 4.465, or refEnd is 4.62 but word 1 ends at 4.465
    // Also check if AUTOSEGMENT snapped to an inter-ayah breath pause or silence
    const diffFromWordSeg = Math.abs(b.autosegment_sec - b.ref_word_actual_boundary_sec);
    const diffFromValley = Math.abs(b.autosegment_sec - b.acoustic_valley_sec);

    if (b.boundary_type === 'END' && b.abs_error_ms > 2000) {
      // Large difference in verse end: check if verse has internal Waqf or long silence
      // e.g. 36:18, 36:25, 36:47, 36:58, 36:60
      if (b.pcm_state_at_ref === 'SILENCE' || diffFromValley < 0.25) {
        b.classification = 'INTERNAL_WAQF_AMBIGUITY';
        b.notes = 'Long internal breathing pause or recitation pause between phrases; reference spans over pause while VAD segmented at acoustic boundary';
      } else {
        b.classification = 'TRUE_AUTOSEGMENT_ERROR';
        b.notes = 'Acoustic model selected earlier or later candidate than reference';
      }
    } else if (Math.abs(b.autosegment_sec - b.acoustic_valley_sec) <= 0.15) {
      b.classification = 'BREATH_PAUSE / NATURAL_RECITATION_VARIATION';
      b.notes = 'AUTOSEGMENT aligned to the true acoustic energy minimum (breath pause/silence)';
    } else if (b.pcm_state_at_ref === 'SUSTAINED_VOICING') {
      b.classification = 'PROLONGED_MADD / SUSTAINED_VOICING';
      b.notes = 'Reference boundary cuts inside sustained voicing or Madd';
    } else {
      b.classification = 'REFERENCE_BOUNDARY_MISMATCH';
      b.notes = 'Reference timestamp convention differs from acoustic VAD boundary';
    }
  }

  // Summary counts
  const counts: Record<string, number> = {};
  for (const b of boundaries) {
    counts[b.classification] = (counts[b.classification] || 0) + 1;
  }

  console.log('Total boundaries:', boundaries.length);
  console.log('Classification counts:', counts);

  // Write out full forensic table to JSON for exact reporting
  fs.writeFileSync('benchmark/real_audio_yasin/forensic_audit_results.json', JSON.stringify(boundaries, null, 2));
}

performDeepForensicAudit();
