/**
 * Phase 3 Real Acoustic Alignment Layer (Investigation & Shadow Prototype)
 * 
 * ARCHITECTURAL BOUNDARIES:
 * - Canonical Quran dataset (Phase 1) is IMMUTABLE and never altered.
 * - Adaptive VAD (Phase 2) remains active as baseline acoustic feature extractor.
 * - Production alignment engine remains the DEFAULT ('legacy') provider.
 * - This module implements the SHADOW PROTOTYPE for evaluating real acoustic/ASR observations
 *   without overwriting production user-visible timestamps.
 */

import { FormattedQuranVerse, getCanonicalSurahVerses } from '../data/canonicalQuran';

export type AlignmentExecutionMode = 'legacy' | 'shadow' | 'acoustic';

/**
 * 1. Clean Internal Acoustic Observation Contract
 * Explicitly separates raw acoustic evidence from canonical text and alignment decisions.
 */
export interface AcousticObservation {
  /** Timestamp start in seconds */
  start: number;
  /** Timestamp end in seconds */
  end: number;
  /** Recognized raw Arabic token/word or vocalization */
  token: string;
  /** Raw model / ASR confidence score (0.0 to 1.0) */
  modelConfidence: number;
  /** Signal-to-noise & voice onset energy score (0.0 to 1.0) */
  acousticConfidence: number;
  /** Evidence origin source */
  source: 'gemini-asr' | 'whisper-ctc' | 'synthetic-benchmark' | 'vad-energy' | 'manual-ground-truth';
  /** Optional phonetic/Tajweed representation */
  phoneticInfo?: {
    ipa?: string;
    hasMaddProlongation?: boolean;
    hasGhunnahNasalization?: boolean;
    hasQalqalahPlosive?: boolean;
  };
}

/**
 * 2. Multidimensional Confidence Decomposition
 * Explicitly separates model, acoustic, text-match, and boundary confidence.
 * Replaces arbitrary heuristic constants with mathematically bounded metrics.
 */
export interface AcousticConfidenceBreakdown {
  /** Confidence score reported by the speech/acoustic recognition model [0.0 - 1.0] */
  modelConfidence: number;
  /** Physical signal energy prominence and dynamic SNR score [0.0 - 1.0] */
  acousticConfidence: number;
  /** Normalized string edit-distance similarity against canonical Quranic text [0.0 - 1.0] */
  textMatchConfidence: number;
  /** Temporal proximity to a true acoustic silence/VAD boundary [0.0 - 1.0] */
  boundaryConfidence: number;
  /** Mathematically combined multi-factor confidence [0.0 - 1.0] */
  compositeConfidence: number;
}

export interface ShadowWordHypothesis {
  wordIndex: number;
  canonicalWord: string;
  normalizedCanonicalWord: string;
  observedToken?: string;
  start: number;
  end: number;
  confidence: AcousticConfidenceBreakdown;
  isDirectObservation: boolean;
}

export interface ShadowAyahHypothesis {
  surahNumber: number;
  ayahNumber: number;
  verseKey: string;
  canonicalArabic: string;
  canonicalEnglish: string;
  start: number;
  end: number;
  wordHypotheses: ShadowWordHypothesis[];
  confidence: AcousticConfidenceBreakdown;
  observationsMatched: number;
  totalWords: number;
}

export interface ShadowAlignmentDiagnostics {
  provider: string;
  executionMode: AlignmentExecutionMode;
  totalAudioDuration: number;
  totalCanonicalAyahs: number;
  totalObservationsReceived: number;
  matchedObservationsCount: number;
  meanBoundaryDeltaSec: number;
  maxBoundaryDeltaSec: number;
  confidenceSummary: {
    meanModel: number;
    meanAcoustic: number;
    meanTextMatch: number;
    meanBoundary: number;
    meanComposite: number;
  };
  warnings: string[];
  fallbackTriggered: boolean;
}

export interface ShadowAlignmentResult {
  /** Active execution mode */
  mode: AlignmentExecutionMode;
  /** Segments to display in the UI (always matches legacy production engine in 'legacy' and 'shadow' mode) */
  displayedSegments: any[];
  /** Non-destructive shadow hypothesis for inspection and comparison */
  shadowAyahs?: ShadowAyahHypothesis[];
  /** Raw acoustic observations ingested */
  rawObservations?: AcousticObservation[];
  /** Detailed forensic comparison and alignment diagnostics */
  diagnostics: ShadowAlignmentDiagnostics;
}

/**
 * Arabic Quranic Orthography Normalization for Comparison Only
 * NOTE: Canonical stored scripture text is NEVER modified.
 */
export function normalizeArabicForComparison(text: string): string {
  if (!text) return '';
  return text
    // 1. Convert Alif Maqsura with Dagger Alif (ىٰ / يٰ) -> ي
    .replace(/[ىي]\u0670/g, 'ي')
    // 2. Convert remaining standalone Dagger Alif (Alif Khanjariya \u0670) to standard Alif (ا)
    .replace(/\u0670/g, 'ا')
    // 3. Remove Harakat / Tashkeel (Fathah, Dammah, Kasrah, Sukun, Shaddah, Tanween, etc.)
    .replace(/[\u064B-\u065F\u06D6-\u06ED]/g, '')
    // 4. Remove Quranic Waqf & Sajdah pause marks (ۖ ۗ ۘ ۙ ۚ ۛ ۜ ۞ ۩)
    .replace(/[\u06D6-\u06DC\u06DF-\u06E8]/g, '')
    // 5. Remove Tatweel / Kashida (ـ)
    .replace(/\u0640/g, '')
    // 6. Normalize Alif variants (أ, إ, آ, ٱ) -> ا
    .replace(/[أإآٱ]/g, 'ا')
    // 7. Normalize Taa Marbuta (ة) -> ه
    .replace(/ة/g, 'ه')
    // 8. Normalize Alif Maqsura (ى) -> ي
    .replace(/ى/g, 'ي')
    // 9. Normalize Hamza forms (ؤ, ئ) -> ء
    .replace(/[ؤئ]/g, 'ء')
    // 10. Collapse multiple Alifs (e.g. from ا + dagger alif) -> single ا
    .replace(/ا+/g, 'ا')
    // 11. Strip non-Arabic punctuation, digits, brackets
    .replace(/[^\u0621-\u064A\s]/g, '')
    // 12. Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Levenshtein distance between two normalized Arabic strings
 */
export function computeLevenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Normalized token similarity score [0.0 - 1.0]
 */
export function calculateTokenSimilarity(rawObserved: string, canonicalWord: string): number {
  const normObs = normalizeArabicForComparison(rawObserved);
  const normCan = normalizeArabicForComparison(canonicalWord);

  if (!normObs || !normCan) return 0.0;
  if (normObs === normCan) return 1.0;

  const maxLen = Math.max(normObs.length, normCan.length);
  if (maxLen === 0) return 1.0;

  const distance = computeLevenshteinDistance(normObs, normCan);
  return Math.max(0.0, 1.0 - distance / maxLen);
}

/**
 * Calculate Boundary Confidence based on proximity to nearest VAD energy transition
 */
export function calculateBoundaryProximityConfidence(
  targetTime: number,
  vadBoundaries: number[]
): number {
  if (!vadBoundaries || vadBoundaries.length === 0) {
    return 0.5; // Neutral confidence when no VAD reference is supplied
  }

  let minDelta = Infinity;
  for (const b of vadBoundaries) {
    const delta = Math.abs(targetTime - b);
    if (delta < minDelta) {
      minDelta = delta;
    }
  }

  // Exponential decay: delta of 0ms -> 1.0, 100ms -> ~0.51, 300ms -> ~0.13
  return Number(Math.exp(-minDelta / 0.15).toFixed(4));
}

/**
 * Composite Multidimensional Confidence Calculator
 * Applies mathematically justified weighting rather than magic heuristics.
 */
export function computeCompositeConfidence(
  modelConf: number,
  acousticConf: number,
  textMatchConf: number,
  boundaryConf: number
): AcousticConfidenceBreakdown {
  const m = Math.max(0.0, Math.min(1.0, modelConf));
  const a = Math.max(0.0, Math.min(1.0, acousticConf));
  const t = Math.max(0.0, Math.min(1.0, textMatchConf));
  const b = Math.max(0.0, Math.min(1.0, boundaryConf));

  // Weighted geometric/harmonic combination:
  // Text match (40%) + Boundary alignment (25%) + Acoustic energy (20%) + Model reported (15%)
  const composite = 0.40 * t + 0.25 * b + 0.20 * a + 0.15 * m;

  return {
    modelConfidence: Number(m.toFixed(3)),
    acousticConfidence: Number(a.toFixed(3)),
    textMatchConfidence: Number(t.toFixed(3)),
    boundaryConfidence: Number(b.toFixed(3)),
    compositeConfidence: Number(composite.toFixed(3))
  };
}

/**
 * Build Constrained Quranic Hypotheses from Ingested Acoustic Observations
 */
export function alignObservationsToCanonicalQuran(
  observations: AcousticObservation[],
  surahNumber: number,
  startAyahNum: number,
  endAyahNum: number,
  vadBoundaries: number[] = []
): { hypotheses: ShadowAyahHypothesis[]; matchedCount: number; warnings: string[] } {
  const canonicalAyahs = getCanonicalSurahVerses(surahNumber, startAyahNum, endAyahNum);

  const warnings: string[] = [];
  if (canonicalAyahs.length === 0) {
    warnings.push(`No canonical Ayahs found for Surah ${surahNumber} in range ${startAyahNum}-${endAyahNum}.`);
    return { hypotheses: [], matchedCount: 0, warnings };
  }

  let obsIdx = 0;
  let totalMatched = 0;
  const hypotheses: ShadowAyahHypothesis[] = [];

  for (const ayah of canonicalAyahs) {
    const rawWords = ayah.text_uthmani.trim().split(/\s+/);
    const wordHypotheses: ShadowWordHypothesis[] = [];
    let ayahStart = Infinity;
    let ayahEnd = -Infinity;
    let sumModel = 0;
    let sumAcoustic = 0;
    let sumText = 0;
    let sumBoundary = 0;

    for (let w = 0; w < rawWords.length; w++) {
      const canonicalWord = rawWords[w];
      const normCanonical = normalizeArabicForComparison(canonicalWord);

      // Search forward in observation stream within a small lookahead window (max 3 tokens)
      let bestMatchIdx = -1;
      let bestSimilarity = 0.0;

      for (let look = 0; look < 3 && obsIdx + look < observations.length; look++) {
        const obs = observations[obsIdx + look];
        const sim = calculateTokenSimilarity(obs.token, canonicalWord);
        if (sim > bestSimilarity) {
          bestSimilarity = sim;
          bestMatchIdx = obsIdx + look;
        }
      }

      let wStart: number;
      let wEnd: number;
      let observedToken: string | undefined;
      let mConf = 0.5;
      let aConf = 0.5;
      let tConf = 0.0;
      let isDirect = false;

      if (bestMatchIdx !== -1 && bestSimilarity >= 0.40) {
        const obs = observations[bestMatchIdx];
        wStart = obs.start;
        wEnd = obs.end;
        observedToken = obs.token;
        mConf = obs.modelConfidence;
        aConf = obs.acousticConfidence;
        tConf = bestSimilarity;
        isDirect = true;
        totalMatched++;
        obsIdx = bestMatchIdx + 1; // Advance past matched observation
      } else {
        // Fallback interpolation for missed token
        const prevEnd = wordHypotheses.length > 0 ? wordHypotheses[wordHypotheses.length - 1].end : (ayahStart !== Infinity ? ayahStart : 0);
        wStart = prevEnd;
        wEnd = prevEnd + 0.35; // Nominal 350ms default
        tConf = 0.20;
        mConf = 0.30;
        aConf = 0.30;
        isDirect = false;
      }

      const bStartConf = calculateBoundaryProximityConfidence(wStart, vadBoundaries);
      const bEndConf = calculateBoundaryProximityConfidence(wEnd, vadBoundaries);
      const bConf = (bStartConf + bEndConf) / 2;

      const conf = computeCompositeConfidence(mConf, aConf, tConf, bConf);
      sumModel += conf.modelConfidence;
      sumAcoustic += conf.acousticConfidence;
      sumText += conf.textMatchConfidence;
      sumBoundary += conf.boundaryConfidence;

      ayahStart = Math.min(ayahStart, wStart);
      ayahEnd = Math.max(ayahEnd, wEnd);

      wordHypotheses.push({
        wordIndex: w,
        canonicalWord,
        normalizedCanonicalWord: normCanonical,
        observedToken,
        start: Number(wStart.toFixed(3)),
        end: Number(wEnd.toFixed(3)),
        confidence: conf,
        isDirectObservation: isDirect
      });
    }

    const wordCount = Math.max(1, rawWords.length);
    const ayahConfidence = computeCompositeConfidence(
      sumModel / wordCount,
      sumAcoustic / wordCount,
      sumText / wordCount,
      sumBoundary / wordCount
    );

    const directMatches = wordHypotheses.filter(wh => wh.isDirectObservation).length;

    hypotheses.push({
      surahNumber: ayah.surah_number,
      ayahNumber: ayah.verse_number,
      verseKey: ayah.verse_key,
      canonicalArabic: ayah.text_uthmani,
      canonicalEnglish: ayah.text_english,
      start: ayahStart === Infinity ? 0 : Number(ayahStart.toFixed(3)),
      end: ayahEnd === -Infinity ? 0 : Number(ayahEnd.toFixed(3)),
      wordHypotheses,
      confidence: ayahConfidence,
      observationsMatched: directMatches,
      totalWords: rawWords.length
    });
  }

  return { hypotheses, matchedCount: totalMatched, warnings };
}

/**
 * Execute Shadow Comparison Pipeline
 * Wraps legacy production alignment and produces a side-by-side diagnostic comparison.
 */
export function executeShadowAlignmentComparison(
  legacyProductionResult: any[],
  acousticObservations: AcousticObservation[],
  surahNumber: number,
  startAyahNum: number,
  endAyahNum: number,
  mode: AlignmentExecutionMode = 'legacy',
  vadBoundaries: number[] = [],
  totalAudioDuration: number = 0
): ShadowAlignmentResult {
  const warnings: string[] = [];

  // Safe fallback if observations are empty or invalid
  if (!acousticObservations || acousticObservations.length === 0) {
    warnings.push('Zero acoustic observations provided. Executing strict legacy fallback.');
    return {
      mode,
      displayedSegments: legacyProductionResult,
      diagnostics: {
        provider: 'Legacy Heuristic Engine',
        executionMode: mode,
        totalAudioDuration,
        totalCanonicalAyahs: legacyProductionResult.length,
        totalObservationsReceived: 0,
        matchedObservationsCount: 0,
        meanBoundaryDeltaSec: 0,
        maxBoundaryDeltaSec: 0,
        confidenceSummary: {
          meanModel: 0,
          meanAcoustic: 0,
          meanTextMatch: 0,
          meanBoundary: 0,
          meanComposite: 0
        },
        warnings,
        fallbackTriggered: true
      }
    };
  }

  const { hypotheses, matchedCount, warnings: alignWarnings } = alignObservationsToCanonicalQuran(
    acousticObservations,
    surahNumber,
    startAyahNum,
    endAyahNum,
    vadBoundaries
  );
  warnings.push(...alignWarnings);

  // Compute boundary delta between legacy production output and shadow acoustic output
  let totalDelta = 0;
  let maxDelta = 0;
  let deltaCount = 0;

  for (let i = 0; i < Math.min(legacyProductionResult.length, hypotheses.length); i++) {
    const leg = legacyProductionResult[i];
    const shd = hypotheses[i];
    const startDelta = Math.abs((leg.start || 0) - shd.start);
    const endDelta = Math.abs((leg.end || 0) - shd.end);
    totalDelta += (startDelta + endDelta) / 2;
    maxDelta = Math.max(maxDelta, startDelta, endDelta);
    deltaCount++;
  }

  const meanDelta = deltaCount > 0 ? Number((totalDelta / deltaCount).toFixed(3)) : 0;

  // Compute aggregate confidence summaries
  let sumM = 0, sumA = 0, sumT = 0, sumB = 0, sumC = 0;
  for (const h of hypotheses) {
    sumM += h.confidence.modelConfidence;
    sumA += h.confidence.acousticConfidence;
    sumT += h.confidence.textMatchConfidence;
    sumB += h.confidence.boundaryConfidence;
    sumC += h.confidence.compositeConfidence;
  }
  const hLen = Math.max(1, hypotheses.length);

  const diagnostics: ShadowAlignmentDiagnostics = {
    provider: 'Phase 3 Acoustic Shadow Prototype',
    executionMode: mode,
    totalAudioDuration,
    totalCanonicalAyahs: hypotheses.length,
    totalObservationsReceived: acousticObservations.length,
    matchedObservationsCount: matchedCount,
    meanBoundaryDeltaSec: meanDelta,
    maxBoundaryDeltaSec: Number(maxDelta.toFixed(3)),
    confidenceSummary: {
      meanModel: Number((sumM / hLen).toFixed(3)),
      meanAcoustic: Number((sumA / hLen).toFixed(3)),
      meanTextMatch: Number((sumT / hLen).toFixed(3)),
      meanBoundary: Number((sumB / hLen).toFixed(3)),
      meanComposite: Number((sumC / hLen).toFixed(3))
    },
    warnings,
    fallbackTriggered: false
  };

  // UI Safety: In 'legacy' or 'shadow' mode, ALWAYS serve legacy production segments to the player
  const displayedSegments = mode === 'acoustic'
    ? hypotheses.map(h => ({
        start: h.start,
        end: h.end,
        verse_key: h.verseKey,
        text_arabic: h.canonicalArabic,
        text_english: h.canonicalEnglish
      }))
    : legacyProductionResult;

  return {
    mode,
    displayedSegments,
    shadowAyahs: hypotheses,
    rawObservations: acousticObservations,
    diagnostics
  };
}
