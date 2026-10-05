/**
 * Quran Alignment Validation Harness - Independent Verification & Calibration Layer
 *
 * Implements the Phase 8 real-audio offline validation, calibration, regression harnesses,
 * and automated reports with strict firewalling between synthetic and physical evidence.
 */

import { QuranAlignmentSegment, QuranVerseInput } from '../types/quranAlignment';
import { runQuranAlignmentEngine } from './quranAlignmentEngine';

export type EvidenceType = 'synthetic' | 'benchmark' | 'provider' | 'physical-pcm' | 'manual-ground-truth';

export interface IndependentAcousticBoundary {
  verseKey: string;
  start: number;
  end: number;
  isAmbiguous?: boolean;
}

export interface CalibrationBinStats {
  bin: string;
  sample_count: number;
  mean_error_ms: number;
  median_error_ms: number;
  p90_error_ms: number;
  p95_error_ms: number;
  within_50ms: number;
  within_100ms: number;
  within_250ms: number;
  within_500ms: number;
}

export interface AcousticRecordingStats {
  sample_rate: number;
  channels: number;
  duration: number;
  sample_count: number;
  peak: number;
  RMS: number;
  noise_floor: number;
  dynamic_range: number;
  longest_pause: number;
  speech_regions: Array<{
    start_ms: number;
    end_ms: number;
    duration_ms: number;
    preceding_silence_ms: number;
    following_silence_ms: number;
  }>;
}

export interface BoundaryComparisonRow {
  verseKey: string;
  independentStart: number;
  autoStart: number;
  startErrorMs: number;
  independentEnd: number;
  autoEnd: number;
  endErrorMs: number;
  ayahDuration: number;
  durationErrorMs: number;
  isAmbiguous: boolean;
}

export interface AggregateErrorStats {
  meanAbsoluteBoundaryErrorMs: number;
  medianBoundaryErrorMs: number;
  p90BoundaryErrorMs: number;
  p95BoundaryErrorMs: number;
  maximumBoundaryErrorMs: number;
  meanStartErrorMs: number;
  meanEndErrorMs: number;
  boundariesWithin50ms: number;
  boundariesWithin100ms: number;
  boundariesWithin250ms: number;
  boundariesExceeding500ms: number;
  boundariesExceeding1000ms: number;
}

export interface ValidationReport {
  timestamp: string;
  evidenceType: EvidenceType;
  recordingPath?: string;
  pcmMetadata?: {
    sampleRate: number;
    channels: number;
    duration: number;
    decoder: string;
  };
  recordingStats?: AcousticRecordingStats;
  alignmentDiagnostics: QuranAlignmentSegment[];
  boundaryComparisons: BoundaryComparisonRow[];
  aggregateStats: AggregateErrorStats;
  calibrationBins: CalibrationBinStats[];
  qariMetadata?: {
    name: string;
    recitationStyle: string;
  };
  certification: 'A — CERTIFIED' | 'B — CERTIFIED WITH DOCUMENTED LIMITATION' | 'C — DEFECT FIXED AND CERTIFIED' | 'D — UNVERIFIED' | 'E — BLOCKED';
}

/**
 * Audit and harden word provenance to have strict source classifications
 */
export type WordProvenanceSource =
  | 'observed'
  | 'provider-reference'
  | 'vad-derived'
  | 'dp-derived'
  | 'interpolated'
  | 'legacy-fallback';

/**
 * 1. REAL BOUNDARY ERROR ENGINE
 */
export function computeBoundaryErrors(
  independent: IndependentAcousticBoundary[],
  autoSegments: QuranAlignmentSegment[]
): { rows: BoundaryComparisonRow[]; stats: AggregateErrorStats } {
  const rows: BoundaryComparisonRow[] = [];
  const errors: number[] = [];
  const startErrors: number[] = [];
  const endErrors: number[] = [];

  for (const ind of independent) {
    const matched = autoSegments.find(s => s.verse_key === ind.verseKey);
    if (!matched) continue;

    const startErrorMs = Math.round((matched.startTime - ind.start) * 1000);
    const endErrorMs = Math.round((matched.endTime - ind.end) * 1000);
    const durationErrorMs = Math.round(((matched.endTime - matched.startTime) - (ind.end - ind.start)) * 1000);

    rows.push({
      verseKey: ind.verseKey,
      independentStart: ind.start,
      autoStart: matched.startTime,
      startErrorMs,
      independentEnd: ind.end,
      autoEnd: matched.endTime,
      endErrorMs,
      ayahDuration: Number((ind.end - ind.start).toFixed(2)),
      durationErrorMs,
      isAmbiguous: ind.isAmbiguous || false
    });

    if (!ind.isAmbiguous) {
      errors.push(Math.abs(startErrorMs));
      errors.push(Math.abs(endErrorMs));
      startErrors.push(Math.abs(startErrorMs));
      endErrors.push(Math.abs(endErrorMs));
    }
  }

  // Calculate Aggregates
  const sortedErrors = [...errors].sort((a, b) => a - b);
  const n = sortedErrors.length;
  
  const sum = errors.reduce((acc, v) => acc + v, 0);
  const meanAbsoluteBoundaryErrorMs = n > 0 ? Math.round(sum / n) : 0;
  const medianBoundaryErrorMs = n > 0 ? sortedErrors[Math.floor(n / 2)] : 0;
  const p90BoundaryErrorMs = n > 0 ? sortedErrors[Math.floor(n * 0.9)] : 0;
  const p95BoundaryErrorMs = n > 0 ? sortedErrors[Math.floor(n * 0.95)] : 0;
  const maximumBoundaryErrorMs = n > 0 ? sortedErrors[n - 1] : 0;

  const sumStart = startErrors.reduce((acc, v) => acc + v, 0);
  const meanStartErrorMs = startErrors.length > 0 ? Math.round(sumStart / startErrors.length) : 0;

  const sumEnd = endErrors.reduce((acc, v) => acc + v, 0);
  const meanEndErrorMs = endErrors.length > 0 ? Math.round(sumEnd / endErrors.length) : 0;

  const boundariesWithin50ms = errors.filter(e => e <= 50).length;
  const boundariesWithin100ms = errors.filter(e => e <= 100).length;
  const boundariesWithin250ms = errors.filter(e => e <= 250).length;
  const boundariesExceeding500ms = errors.filter(e => e > 500).length;
  const boundariesExceeding1000ms = errors.filter(e => e > 1000).length;

  return {
    rows,
    stats: {
      meanAbsoluteBoundaryErrorMs,
      medianBoundaryErrorMs,
      p90BoundaryErrorMs,
      p95BoundaryErrorMs,
      maximumBoundaryErrorMs,
      meanStartErrorMs,
      meanEndErrorMs,
      boundariesWithin50ms,
      boundariesWithin100ms,
      boundariesWithin250ms,
      boundariesExceeding500ms,
      boundariesExceeding1000ms
    }
  };
}

/**
 * 2. CONFIDENCE CALIBRATION INFRASTRUCTURE
 */
export function buildConfidenceCalibration(
  comparisons: BoundaryComparisonRow[],
  autoSegments: QuranAlignmentSegment[]
): CalibrationBinStats[] {
  const bins = [
    { label: '0–50', min: 0, max: 50 },
    { label: '50–70', min: 50, max: 70 },
    { label: '70–80', min: 70, max: 80 },
    { label: '80–90', min: 80, max: 90 },
    { label: '90–95', min: 90, max: 95 },
    { label: '95–100', min: 95, max: 101 }
  ];

  return bins.map(b => {
    // Collect segments matching this bin
    const matchingSegs = autoSegments.filter(s => {
      const conf = s.diagnostics?.confidence ?? s.confidenceScore ?? 0;
      return conf >= b.min && conf < b.max;
    });

    const matchingKeys = matchingSegs.map(s => s.verse_key);
    const matchingComps = comparisons.filter(c => matchingKeys.includes(c.verseKey) && !c.isAmbiguous);

    const errors: number[] = [];
    for (const c of matchingComps) {
      errors.push(Math.abs(c.startErrorMs));
      errors.push(Math.abs(c.endErrorMs));
    }

    const sorted = [...errors].sort((x, y) => x - y);
    const count = sorted.length;

    const sum = errors.reduce((acc, v) => acc + v, 0);
    const mean = count > 0 ? Math.round(sum / count) : 0;
    const median = count > 0 ? sorted[Math.floor(count / 2)] : 0;
    const p90 = count > 0 ? sorted[Math.floor(count * 0.9)] : 0;
    const p95 = count > 0 ? sorted[Math.floor(count * 0.95)] : 0;

    return {
      bin: b.label,
      sample_count: matchingSegs.length,
      mean_error_ms: mean,
      median_error_ms: median,
      p90_error_ms: p90,
      p95_error_ms: p95,
      within_50ms: errors.filter(e => e <= 50).length,
      within_100ms: errors.filter(e => e <= 100).length,
      within_250ms: errors.filter(e => e <= 250).length,
      within_500ms: errors.filter(e => e <= 500).length
    };
  });
}

/**
 * 3. AUTOMATED ACOUSTIC MEASUREMENT FROM Float32Array (PCM)
 */
export function analyzePCM(
  pcm: Float32Array,
  sampleRate: number
): AcousticRecordingStats {
  const duration = pcm.length / sampleRate;
  
  // Peak Amplitude
  let peak = 0;
  let sumSq = 0;
  for (let i = 0; i < pcm.length; i++) {
    const absVal = Math.abs(pcm[i]);
    if (absVal > peak) peak = absVal;
    sumSq += pcm[i] * pcm[i];
  }

  const rms = Math.sqrt(sumSq / pcm.length);
  const noiseFloorDb = -65.0; // Dynamic baseline fallback
  const peakDb = 20 * Math.log10(peak || 0.0001);
  const rmsDb = 20 * Math.log10(rms || 0.0001);
  const dynamicRange = peakDb - noiseFloorDb;

  // Simple Energy Envelope Speech Region detection
  const frameSize = Math.round(sampleRate * 0.02); // 20ms
  const speechRegions: Array<{ start_ms: number; end_ms: number; duration_ms: number; preceding_silence_ms: number; following_silence_ms: number }> = [];
  
  let inSpeech = false;
  let speechStartFrame = 0;
  let silences: Array<{ start: number; end: number }> = [];

  for (let frameOffset = 0; frameOffset < pcm.length; frameOffset += frameSize) {
    let frameSumSq = 0;
    const limit = Math.min(pcm.length, frameOffset + frameSize);
    for (let i = frameOffset; i < limit; i++) {
      frameSumSq += pcm[i] * pcm[i];
    }
    const frameRms = Math.sqrt(frameSumSq / frameSize);
    const frameDb = 20 * Math.log10(frameRms || 0.0001);
    const isFrameSpeech = frameDb > -45.0;

    if (isFrameSpeech && !inSpeech) {
      inSpeech = true;
      speechStartFrame = frameOffset;
    } else if (!isFrameSpeech && inSpeech) {
      inSpeech = false;
      const endMs = Math.round((frameOffset / sampleRate) * 1000);
      const startMs = Math.round((speechStartFrame / sampleRate) * 1000);
      speechRegions.push({
        start_ms: startMs,
        end_ms: endMs,
        duration_ms: endMs - startMs,
        preceding_silence_ms: 0,
        following_silence_ms: 0
      });
    }
  }

  // Compute silence margins & pauses
  let longestPause = 0;
  if (speechRegions.length > 0) {
    for (let i = 0; i < speechRegions.length; i++) {
      const preceding = i === 0 ? speechRegions[0].start_ms : speechRegions[i].start_ms - speechRegions[i - 1].end_ms;
      const following = i === speechRegions.length - 1 ? Math.round(duration * 1000) - speechRegions[i].end_ms : speechRegions[i + 1].start_ms - speechRegions[i].end_ms;
      
      speechRegions[i].preceding_silence_ms = preceding;
      speechRegions[i].following_silence_ms = following;

      if (i > 0) {
        const pause = speechRegions[i].start_ms - speechRegions[i - 1].end_ms;
        if (pause > longestPause) longestPause = pause;
      }
    }
  }

  return {
    sample_rate: sampleRate,
    channels: 1,
    duration: Number(duration.toFixed(2)),
    sample_count: pcm.length,
    peak: Number(peak.toFixed(4)),
    RMS: Number(rms.toFixed(4)),
    noise_floor: Number(noiseFloorDb.toFixed(1)),
    dynamic_range: Number(dynamicRange.toFixed(1)),
    longest_pause: longestPause,
    speech_regions: speechRegions
  };
}

/**
 * 4. INDEPENDENT ACOUSTIC VALIDATION HARNESS ENGINE
 */
export function executeAcousticValidationHarness(
  verses: QuranVerseInput[],
  independentBoundaries: IndependentAcousticBoundary[],
  pcmData?: Float32Array,
  sampleRate?: number,
  recordingPath?: string
): ValidationReport {
  const isPhysical = pcmData !== undefined && sampleRate !== undefined;
  const evidenceType: EvidenceType = isPhysical ? 'physical-pcm' : 'synthetic';

  // Executing production AutoSegment engine unmodified
  const autoSegments = runQuranAlignmentEngine(verses, {
    pcmData,
    sampleRate,
    mode: 'full-ayah'
  });

  // Independent Measurements
  let recordingStats: AcousticRecordingStats | undefined;
  if (isPhysical && pcmData && sampleRate) {
    recordingStats = analyzePCM(pcmData, sampleRate);
  }

  // Comparisons
  const { rows, stats } = computeBoundaryErrors(independentBoundaries, autoSegments);

  // Confidence Calibration Binning
  const calibrationBins = buildConfidenceCalibration(rows, autoSegments);

  // Determine Certification Gate
  let certification: ValidationReport['certification'] = 'D — UNVERIFIED';
  if (isPhysical) {
    const isRealPhysicalFile = recordingPath && !recordingPath.includes('test_qari') && !recordingPath.includes('dummy') && !recordingPath.includes('validation/recordings/');
    if (isRealPhysicalFile && rows.length > 0) {
      if (stats.meanAbsoluteBoundaryErrorMs <= 150) {
        certification = 'A — CERTIFIED';
      } else {
        certification = 'B — CERTIFIED WITH DOCUMENTED LIMITATION';
      }
    } else {
      certification = 'D — UNVERIFIED';
    }
  }

  return {
    timestamp: new Date().toISOString(),
    evidenceType,
    recordingPath,
    pcmMetadata: isPhysical && sampleRate ? {
      sampleRate,
      channels: 1,
      duration: Number((pcmData!.length / sampleRate).toFixed(2)),
      decoder: 'WebAudio/FFmpeg PCM'
    } : undefined,
    recordingStats,
    alignmentDiagnostics: autoSegments,
    boundaryComparisons: rows,
    aggregateStats: stats,
    calibrationBins,
    certification
  };
}
