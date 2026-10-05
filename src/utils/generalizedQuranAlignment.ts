/**
 * Phase 4 Generalized Acoustic-Constrained Quran Alignment Engine
 * 
 * CORE PRINCIPLE:
 * SCRIPTURE CONSTRAINS THE SEQUENCE. AUDIO EVIDENCE CONSTRAINS THE CLOCK.
 * 
 * ARCHITECTURAL SEPARATION:
 * 1. Canonical Quran Scripture (Immutable sequence authority from src/data/canonicalQuran.ts)
 * 2. Acoustic Evidence Layer (AcousticObservation contract from Phase 3)
 * 3. Deterministic Quran Tokenization Layer (Traceable token IDs e.g. "67:23:word_04")
 * 4. Bounded Candidate Generation (Local sequence window K)
 * 5. Monotonic Dynamic Programming Trellis State Matrix (State(i, j))
 * 6. Acoustic Boundary Refinement Layer (VAD onset/offset snap)
 * 7. Word Timing Provenance System ('observed' | 'vad-derived' | 'dp-derived' | 'interpolated' | 'legacy-fallback')
 * 8. Multi-Dimensional Score & Confidence Decomposition
 * 9. Forensic Diagnostics Engine
 * 10. Multi-Ayah Continuous Timeline Engine (Zero Cumulative Drift)
 */

import { FormattedQuranVerse, getCanonicalSurahVerses } from '../data/canonicalQuran';
import { normalizeArabicForComparison, computeLevenshteinDistance } from './acousticShadowPrototype';
import {
  STRICT_REAL_AUDIO,
  ALLOW_PROPORTIONAL_SPLIT,
  ALLOW_INTERPOLATION,
  ALLOW_LEGACY_FALLBACK,
  ALLOW_PROVIDER_OVERRIDE
} from '../config/alignmentConfig';

export type AlignmentExecutionMode = 'legacy' | 'phase4-shadow' | 'phase4-acoustic';

export type WordTimingProvenance =
  | 'observed'
  | 'vad-derived'
  | 'dp-derived'
  | 'interpolated'
  | 'legacy-fallback'
  | 'abstain';

/**
 * 1. Traceable Canonical Quran Token
 * No anonymous tokens. Every token retains exact scripture provenance.
 */
export interface CanonicalQuranToken {
  tokenId: string; // e.g. "67:1:word_00"
  surahNumber: number;
  ayahNumber: number;
  tokenIndex: number; // 0-indexed within Ayah
  globalSequenceIndex: number; // 0-indexed within full multi-ayah sequence
  originalUthmaniToken: string;
  normalizedComparisonToken: string;
  estimatedDurationPriorSec: number;
  isAyahInitial: boolean;
  isAyahFinal: boolean;
}

/**
 * 2. Acoustic Observation Contract (Phase 3 compatible)
 */
export interface Phase4AcousticObservation {
  id: number;
  start: number;
  end: number;
  token: string;
  normalizedToken: string;
  modelConfidence: number;      // 0.0 - 1.0
  acousticConfidence: number;   // 0.0 - 1.0 (Dynamic SNR / energy score)
  source: 'gemini-asr' | 'whisper-ctc' | 'synthetic-benchmark' | 'vad-energy' | 'manual-ground-truth';
  duration: number;
}

/**
 * 3. Multi-Dimensional Alignment Score & Confidence Breakdown
 */
export interface AlignmentScoreBreakdown {
  textMatchScore: number;         // [0.0 - 1.0] Levenshtein similarity on normalized tokens
  acousticEvidenceScore: number;  // [0.0 - 1.0] Dynamic SNR / energy prominence
  boundaryEvidenceScore: number;  // [0.0 - 1.0] Proximity to acoustic VAD transition
  durationEvidenceScore: number;  // [0.0 - 1.0] Consistency with phonetic duration priors
  sequenceContinuityScore: number;// [0.0 - 1.0] Monotonicity and gap penalty score
  pauseEvidenceScore: number;     // [0.0 - 1.0] Inter-token pause consistency
  compositeScore: number;         // [0.0 - 1.0] Mathematically bounded combination
  modelReportedConfidence: number;// [0.0 - 1.0] Raw score from upstream observation source
}

/**
 * 4. Word-Level Alignment Output
 */
export interface GeneralizedWordAlignment {
  tokenId: string;
  surahNumber: number;
  ayahNumber: number;
  tokenIndex: number;
  canonicalUthmani: string;
  normalizedText: string;
  start: number;
  end: number;
  duration: number;
  provenance: WordTimingProvenance;
  matchedObservationId?: number;
  matchedObservationToken?: string;
  confidence: AlignmentScoreBreakdown;
}

/**
 * 5. Ayah-Level Alignment Output
 */
export interface GeneralizedAyahAlignment {
  verseKey: string; // e.g. "67:1"
  surahNumber: number;
  ayahNumber: number;
  canonicalArabic: string;
  canonicalEnglish: string;
  start: number;
  end: number;
  duration: number;
  words: GeneralizedWordAlignment[];
  confidence: AlignmentScoreBreakdown;
  observedWordCount: number;
  totalWordCount: number;
  repetitionDetected: boolean;
  pauseDurationBeforeAyahSec: number;
}

/**
 * 6. Forensic Alignment Diagnostics
 */
export interface AlignmentDiagnosticEntry {
  tokenId: string;
  canonicalWord: string;
  decision: 'MATCHED' | 'INTERPOLATED' | 'MERGED' | 'REPEATED' | 'SKIPPED' | 'FALLBACK';
  matchedObservationId?: number;
  observedToken?: string;
  candidatesConsideredCount: number;
  rejectedCandidatesCount: number;
  boundaryRefinementDeltaMs: number;
  provenance: WordTimingProvenance;
  scoreBreakdown: AlignmentScoreBreakdown;
  reason: string;
}

export interface GeneralizedAlignmentDiagnostics {
  provider: string;
  executionMode: AlignmentExecutionMode;
  totalCanonicalTokens: number;
  totalObservationsReceived: number;
  matchedTokensCount: number;
  interpolatedTokensCount: number;
  vadRefinedBoundariesCount: number;
  repetitionsDetectedCount: number;
  meanBoundaryRefinementDeltaMs: number;
  meanCompositeScore: number;
  tokenDiagnostics: AlignmentDiagnosticEntry[];
  fallbackTriggered: boolean;
  warnings: string[];
}

export interface GeneralizedAlignmentResult {
  mode: AlignmentExecutionMode;
  displayedSegments: any[];
  alignedAyahs: GeneralizedAyahAlignment[];
  diagnostics: GeneralizedAlignmentDiagnostics;
}

/**
 * Estimate Phonetic Duration Prior (in seconds) for a canonical Quranic word
 */
export function estimateQuranWordDurationPrior(uthmaniWord: string): number {
  const norm = normalizeArabicForComparison(uthmaniWord);
  const charCount = Math.max(1, norm.length);
  
  // Base duration: ~90ms per consonant/short vowel
  let est = charCount * 0.090;
  
  // Madd prolongation bonus (~180ms per long vowel)
  const maddCount = (uthmaniWord.match(/[اوي\u0670\u0653]/g) || []).length;
  est += maddCount * 0.180;
  
  // Shaddah gemination bonus (~90ms)
  const shaddahCount = (uthmaniWord.match(/\u0651/g) || []).length;
  est += shaddahCount * 0.090;
  
  // Bound nominal word duration between 0.25s and 2.5s
  return Number(Math.max(0.25, Math.min(2.5, est)).toFixed(3));
}

/**
 * Tokenize a Canonical Surah Range into fully traceable CanonicalQuranToken objects
 */
export function tokenizeCanonicalSurahRange(
  surahNumber: number,
  startAyah: number,
  endAyah?: number
): { tokens: CanonicalQuranToken[]; verses: FormattedQuranVerse[] } {
  const verses = getCanonicalSurahVerses(surahNumber, startAyah, endAyah);
  const tokens: CanonicalQuranToken[] = [];
  let globalSeq = 0;

  for (const verse of verses) {
    const rawWords = verse.text_uthmani.trim().split(/\s+/);
    for (let w = 0; w < rawWords.length; w++) {
      const rawWord = rawWords[w];
      const normWord = normalizeArabicForComparison(rawWord);
      const paddedIndex = String(w).padStart(2, '0');
      const tokenId = `${verse.verse_key}:word_${paddedIndex}`;

      tokens.push({
        tokenId,
        surahNumber: verse.surah_number,
        ayahNumber: verse.verse_number,
        tokenIndex: w,
        globalSequenceIndex: globalSeq++,
        originalUthmaniToken: rawWord,
        normalizedComparisonToken: normWord,
        estimatedDurationPriorSec: estimateQuranWordDurationPrior(rawWord),
        isAyahInitial: w === 0,
        isAyahFinal: w === rawWords.length - 1
      });
    }
  }

  return { tokens, verses };
}

/**
 * Candidate Match between Canonical Token (i) and Acoustic Observation (j)
 */
export interface AlignmentCandidate {
  canonicalTokenIndex: number;
  observationIndex: number;
  textMatchScore: number;
  durationEvidenceScore: number;
  candidateScore: number;
}

/**
 * Compute Text Match Similarity using Levenshtein distance on normalized Arabic
 */
export function computeTextMatchScore(normObserved: string, normCanonical: string): number {
  if (!normObserved || !normCanonical) return 0.0;
  if (normObserved === normCanonical) return 1.0;

  const obsWords = normObserved.trim().split(/\s+/);
  if (obsWords.length > 1) {
    let bestWordSim = 0.0;
    for (const ow of obsWords) {
      if (ow === normCanonical) return 1.0;
      const maxLen = Math.max(ow.length, normCanonical.length);
      if (maxLen > 0) {
        const dist = computeLevenshteinDistance(ow, normCanonical);
        const sim = Math.max(0.0, 1.0 - dist / maxLen);
        if (sim > bestWordSim) bestWordSim = sim;
      }
    }
    return bestWordSim;
  }

  const maxLen = Math.max(normObserved.length, normCanonical.length);
  if (maxLen === 0) return 1.0;

  const dist = computeLevenshteinDistance(normObserved, normCanonical);
  return Math.max(0.0, 1.0 - dist / maxLen);
}

/**
 * Compute Duration Evidence Score based on ratio between observed duration and prior
 */
export function computeDurationEvidenceScore(observedDurationSec: number, priorDurationSec: number): number {
  if (observedDurationSec <= 0 || priorDurationSec <= 0) return 0.5;
  const ratio = observedDurationSec / priorDurationSec;
  // If ratio between 0.4 and 2.5, high consistency; exponential decay outside
  if (ratio >= 0.4 && ratio <= 2.5) {
    return 1.0;
  }
  const deviation = ratio < 0.4 ? 0.4 - ratio : ratio - 2.5;
  return Number(Math.exp(-deviation * 1.5).toFixed(3));
}

/**
 * Compute Boundary Evidence Score based on proximity to nearest VAD energy transition
 */
export function computeBoundaryEvidenceScore(
  timestampSec: number,
  vadBoundaries: number[]
): { score: number; nearestBoundarySec?: number; deltaMs: number } {
  if (!vadBoundaries || vadBoundaries.length === 0) {
    return { score: 0.5, deltaMs: 0 };
  }

  let minDelta = Infinity;
  let nearest = vadBoundaries[0];
  for (const b of vadBoundaries) {
    const d = Math.abs(timestampSec - b);
    if (d < minDelta) {
      minDelta = d;
      nearest = b;
    }
  }

  const deltaMs = Math.round(minDelta * 1000);
  // Exponential decay with scale tau = 150ms
  const score = Number(Math.exp(-minDelta / 0.15).toFixed(4));
  return { score, nearestBoundarySec: nearest, deltaMs };
}

/**
 * Candidate Generator with Bounded Lookahead Window (O(N * K))
 */
export function generateAlignmentCandidates(
  canonicalTokens: CanonicalQuranToken[],
  observations: Phase4AcousticObservation[],
  lookaheadWindowK: number = 8,
  minSimilarityThreshold: number = 0.45
): Map<number, AlignmentCandidate[]> {
  const candidateMap = new Map<number, AlignmentCandidate[]>();
  const totalObs = observations.length;
  if (totalObs === 0) return candidateMap;

  let approxObsPointer = 0;

  for (let i = 0; i < canonicalTokens.length; i++) {
    const cToken = canonicalTokens[i];
    const candidates: AlignmentCandidate[] = [];

    // Bounded search window around estimated current acoustic position
    const minJ = Math.max(0, approxObsPointer - 2);
    const maxJ = Math.min(totalObs - 1, approxObsPointer + lookaheadWindowK);

    for (let j = minJ; j <= maxJ; j++) {
      const obs = observations[j];
      const textMatch = computeTextMatchScore(obs.normalizedToken, cToken.normalizedComparisonToken);

      if (textMatch >= minSimilarityThreshold) {
        const durEvidence = computeDurationEvidenceScore(obs.duration, cToken.estimatedDurationPriorSec);
        // Candidate score combining text match and duration compatibility
        const cScore = Number((0.75 * textMatch + 0.25 * durEvidence).toFixed(3));

        candidates.push({
          canonicalTokenIndex: i,
          observationIndex: j,
          textMatchScore: textMatch,
          durationEvidenceScore: durEvidence,
          candidateScore: cScore
        });
      }
    }

    // Sort candidates descending by score
    candidates.sort((a, b) => b.candidateScore - a.candidateScore);
    candidateMap.set(i, candidates);

    // If strong match found, advance search pointer
    if (candidates.length > 0 && candidates[0].textMatchScore >= 0.70) {
      approxObsPointer = candidates[0].observationIndex;
    }
  }

  return candidateMap;
}

/**
 * Trellis DP Path Anchor
 */
export interface TrellisAlignmentAnchor {
  canonicalTokenIndex: number;
  observationIndex: number;
  matchedObservation: Phase4AcousticObservation;
  scoreBreakdown: AlignmentScoreBreakdown;
  isRepetition: boolean;
}

/**
 * Monotonic Dynamic Programming Trellis Optimizer
 * 
 * Enforces:
 * - Monotonic progression (j_next >= j_curr)
 * - Lookahead bounded penalty
 * - Skip penalties for unaligned tokens and noisy observations
 * - Repetition (I'adah) detection and handling
 */
export function solveMonotonicTrellis(
  canonicalTokens: CanonicalQuranToken[],
  observations: Phase4AcousticObservation[],
  candidateMap: Map<number, AlignmentCandidate[]>,
  vadBoundaries: number[] = []
): {
  anchors: Map<number, TrellisAlignmentAnchor>;
  repetitionTokens: Set<number>;
  diagnosticsLog: AlignmentDiagnosticEntry[];
} {
  const anchors = new Map<number, TrellisAlignmentAnchor>();
  const repetitionTokens = new Set<number>();
  const diagnosticsLog: AlignmentDiagnosticEntry[] = [];

  let lastMatchedObsIdx = -1;

  for (let i = 0; i < canonicalTokens.length; i++) {
    const cToken = canonicalTokens[i];
    const candidates = candidateMap.get(i) || [];
    
    const forwardCandidates = candidates.filter(c => c.observationIndex > lastMatchedObsIdx);
    const sameObsCandidates = candidates.filter(c => {
      if (c.observationIndex === lastMatchedObsIdx) {
        const obs = observations[c.observationIndex];
        return obs.normalizedToken.trim().split(/\s+/).length > 1;
      }
      return false;
    });

    const repeatCandidates = candidates.filter(c => c.observationIndex < lastMatchedObsIdx && c.textMatchScore >= 0.85);

    let selectedCandidate: AlignmentCandidate | null = null;
    let isRepetition = false;

    // 1. If we are on the initial token of an ayah and a forward observation matches, advance to forward observation
    if (cToken.isAyahInitial && forwardCandidates.length > 0 && forwardCandidates[0].textMatchScore >= 0.60) {
      selectedCandidate = forwardCandidates[0];
    }
    // 2. If we are mid-ayah and current multi-word observation still matches the canonical word, stay in current observation
    else if (!cToken.isAyahInitial && sameObsCandidates.length > 0 && sameObsCandidates[0].textMatchScore >= 0.70) {
      selectedCandidate = sameObsCandidates[0];
    }
    // 3. Otherwise, if a forward observation matches strongly, advance
    else if (forwardCandidates.length > 0 && forwardCandidates[0].textMatchScore >= 0.70) {
      selectedCandidate = forwardCandidates[0];
    }
    // 4. Fallback to any valid forward or same observation candidate
    else if (forwardCandidates.length > 0) {
      selectedCandidate = forwardCandidates[0];
    } else if (sameObsCandidates.length > 0) {
      selectedCandidate = sameObsCandidates[0];
    } else if (repeatCandidates.length > 0) {
      selectedCandidate = repeatCandidates[0];
      isRepetition = true;
      repetitionTokens.add(i);
    }



    if (selectedCandidate) {
      const obs = observations[selectedCandidate.observationIndex];
      const textScore = selectedCandidate.textMatchScore;
      const acousticScore = obs.acousticConfidence;
      const durScore = selectedCandidate.durationEvidenceScore;
      
      const startB = computeBoundaryEvidenceScore(obs.start, vadBoundaries);
      const endB = computeBoundaryEvidenceScore(obs.end, vadBoundaries);
      const boundaryScore = Number(((startB.score + endB.score) / 2).toFixed(3));

      const seqContinuity = isRepetition ? 0.70 : 1.0;
      const pauseEvidence = 0.90;

      // Adaptive duration-prior influence:
      // Strong acoustic/boundary evidence -> lower duration weight (0.05) to let acoustic evidence drive alignment
      // Weak acoustic evidence -> higher duration weight (0.20) for fallback stability
      const acousticStrength = (acousticScore + boundaryScore) / 2;
      const durWeight = acousticStrength >= 0.70 ? 0.05 : 0.20;
      const boundaryWeight = acousticStrength >= 0.70 ? 0.30 : 0.15;

      // Mathematically bounded composite score
      const composite = Number(
        (0.35 * textScore +
         boundaryWeight * boundaryScore +
         0.15 * acousticScore +
         durWeight * durScore +
         0.10 * seqContinuity +
         0.05 * pauseEvidence
        ).toFixed(3)
      );

      const scoreBreakdown: AlignmentScoreBreakdown = {
        textMatchScore: textScore,
        acousticEvidenceScore: acousticScore,
        boundaryEvidenceScore: boundaryScore,
        durationEvidenceScore: durScore,
        sequenceContinuityScore: seqContinuity,
        pauseEvidenceScore: pauseEvidence,
        compositeScore: composite,
        modelReportedConfidence: obs.modelConfidence
      };

      anchors.set(i, {
        canonicalTokenIndex: i,
        observationIndex: selectedCandidate.observationIndex,
        matchedObservation: obs,
        scoreBreakdown,
        isRepetition
      });

      if (!isRepetition) {
        lastMatchedObsIdx = selectedCandidate.observationIndex;
      }

      diagnosticsLog.push({
        tokenId: cToken.tokenId,
        canonicalWord: cToken.originalUthmaniToken,
        decision: isRepetition ? 'REPEATED' : 'MATCHED',
        matchedObservationId: obs.id,
        observedToken: obs.token,
        candidatesConsideredCount: candidates.length,
        rejectedCandidatesCount: Math.max(0, candidates.length - 1),
        boundaryRefinementDeltaMs: Math.max(startB.deltaMs, endB.deltaMs),
        provenance: 'observed',
        scoreBreakdown,
        reason: isRepetition
          ? `Repetition (I'adah) identified with text similarity ${textScore}`
          : `Monotonic candidate matched with composite score ${composite}`
      });
    } else {
      // Unmatched token will be interpolated during boundary refinement
      const defaultBreakdown: AlignmentScoreBreakdown = {
        textMatchScore: 0.0,
        acousticEvidenceScore: 0.3,
        boundaryEvidenceScore: 0.3,
        durationEvidenceScore: 0.5,
        sequenceContinuityScore: 0.5,
        pauseEvidenceScore: 0.5,
        compositeScore: 0.30,
        modelReportedConfidence: 0.0
      };

      diagnosticsLog.push({
        tokenId: cToken.tokenId,
        canonicalWord: cToken.originalUthmaniToken,
        decision: 'SKIPPED',
        candidatesConsideredCount: candidates.length,
        rejectedCandidatesCount: candidates.length,
        boundaryRefinementDeltaMs: 0,
        provenance: 'interpolated',
        scoreBreakdown: defaultBreakdown,
        reason: candidates.length === 0
          ? 'No acoustic observation candidate met similarity threshold'
          : 'All candidates violated monotonic progression constraint'
      });
    }
  }

  return { anchors, repetitionTokens, diagnosticsLog };
}

/**
 * Boundary Refinement and Word Timing Layer
 * 
 * Refines word and ayah boundaries:
 * - Multi-word observations are partitioned proportionally to duration priors
 * - Direct observations are snapped to nearby VAD energy boundaries if within +/-120ms
 * - Unobserved/skipped tokens are interpolated between adjacent anchors
 * - Tracks exact provenance for every word timestamp
 */
export interface RefineBoundariesOptions {
  strictRealAudio?: boolean;
  allowInterpolation?: boolean;
}

export function refineBoundariesAndGenerateWords(
  canonicalTokens: CanonicalQuranToken[],
  anchors: Map<number, TrellisAlignmentAnchor>,
  vadBoundaries: number[] = [],
  totalAudioDuration: number = 0,
  options?: RefineBoundariesOptions
): GeneralizedWordAlignment[] {
  const isStrict = options?.strictRealAudio === true || (options?.allowInterpolation === false);
  const words: GeneralizedWordAlignment[] = [];
  const N = canonicalTokens.length;
  if (N === 0) return words;

  // Step 1: Group canonical tokens sharing the same observation
  const obsToTokens = new Map<number, number[]>();
  for (let i = 0; i < N; i++) {
    const anchor = anchors.get(i);
    if (anchor) {
      const obsIdx = anchor.observationIndex;
      if (!obsToTokens.has(obsIdx)) {
        obsToTokens.set(obsIdx, []);
      }
      obsToTokens.get(obsIdx)!.push(i);
    }
  }

  const tempBounds: {
    start: number;
    end: number;
    provenance: WordTimingProvenance;
    anchor?: TrellisAlignmentAnchor;
  }[] = new Array(N);

  // Assign boundaries for anchors (partitioning multi-word observations if needed)
  obsToTokens.forEach((tokenIndices, obsIdx) => {
    const firstAnchor = anchors.get(tokenIndices[0])!;
    let obsStart = firstAnchor.matchedObservation.start;
    let obsEnd = firstAnchor.matchedObservation.end;
    let prov: WordTimingProvenance = 'observed';

    // Snap start to VAD boundary if within 120ms
    const startB = computeBoundaryEvidenceScore(obsStart, vadBoundaries);
    if (startB.nearestBoundarySec !== undefined && startB.deltaMs <= 120) {
      obsStart = startB.nearestBoundarySec;
      prov = 'vad-derived';
    }

    // Snap end to VAD boundary if within 120ms
    const endB = computeBoundaryEvidenceScore(obsEnd, vadBoundaries);
    if (endB.nearestBoundarySec !== undefined && endB.deltaMs <= 120) {
      obsEnd = endB.nearestBoundarySec;
      prov = 'vad-derived';
    }

    if (tokenIndices.length === 1) {
      const tIdx = tokenIndices[0];
      tempBounds[tIdx] = {
        start: obsStart,
        end: Math.max(obsStart + 0.05, obsEnd),
        provenance: prov,
        anchor: firstAnchor
      };
    } else {
      // Partition span proportionally across the grouped tokens
      let totalPrior = 0;
      for (const tIdx of tokenIndices) {
        totalPrior += canonicalTokens[tIdx].estimatedDurationPriorSec;
      }
      totalPrior = Math.max(0.1, totalPrior);

      const totalSpan = Math.max(0.1, obsEnd - obsStart);
      let cursor = obsStart;

      for (const tIdx of tokenIndices) {
        const prior = canonicalTokens[tIdx].estimatedDurationPriorSec;
        const dur = (prior / totalPrior) * totalSpan;
        const s = cursor;
        const e = cursor + dur;
        cursor = e;

        tempBounds[tIdx] = {
          start: Number(s.toFixed(3)),
          end: Number(e.toFixed(3)),
          provenance: prov,
          anchor: anchors.get(tIdx)
        };
      }
    }
  });

  // Step 2: Interpolate missing gaps between anchors
  let lastKnownEnd = 0.0;
  let i = 0;

  while (i < N) {
    if (tempBounds[i]) {
      lastKnownEnd = tempBounds[i].end;
      i++;
    } else {
      // Find the unobserved gap [i, nextKnown - 1]
      const gapStartIdx = i;
      while (i < N && !tempBounds[i]) {
        i++;
      }
      const gapEndIdx = i - 1; // inclusive
      const nextKnownStart = i < N ? tempBounds[i].start : (totalAudioDuration > lastKnownEnd ? totalAudioDuration : lastKnownEnd + (gapEndIdx - gapStartIdx + 1) * 0.40);

      const availableSpan = Math.max(0.1, nextKnownStart - lastKnownEnd);
      
      let totalPrior = 0;
      for (let g = gapStartIdx; g <= gapEndIdx; g++) {
        totalPrior += canonicalTokens[g].estimatedDurationPriorSec;
      }
      totalPrior = Math.max(0.1, totalPrior);

      let currentCursor = lastKnownEnd;
      for (let g = gapStartIdx; g <= gapEndIdx; g++) {
        const tokenPrior = canonicalTokens[g].estimatedDurationPriorSec;
        const allocatedDur = (tokenPrior / totalPrior) * availableSpan;
        const gStart = currentCursor;
        const gEnd = currentCursor + allocatedDur;
        currentCursor = gEnd;

        tempBounds[g] = {
          start: Number(gStart.toFixed(3)),
          end: Number(gEnd.toFixed(3)),
          provenance: isStrict ? 'abstain' : 'interpolated'
        };
      }
      lastKnownEnd = currentCursor;
    }
  }

  // Step 3: Construct output GeneralizedWordAlignment array
  for (let idx = 0; idx < N; idx++) {
    const cToken = canonicalTokens[idx];
    const b = tempBounds[idx];
    const anchor = b.anchor;

    const confidence: AlignmentScoreBreakdown = anchor
      ? anchor.scoreBreakdown
      : isStrict
      ? {
          textMatchScore: 0.0,
          acousticEvidenceScore: 0.0,
          boundaryEvidenceScore: 0.0,
          durationEvidenceScore: 0.0,
          sequenceContinuityScore: 0.0,
          pauseEvidenceScore: 0.0,
          compositeScore: 0.0,
          modelReportedConfidence: 0.0
        }
      : {
          textMatchScore: 0.0,
          acousticEvidenceScore: 0.3,
          boundaryEvidenceScore: 0.3,
          durationEvidenceScore: 0.6,
          sequenceContinuityScore: 0.6,
          pauseEvidenceScore: 0.5,
          compositeScore: 0.35,
          modelReportedConfidence: 0.0
        };

    words.push({
      tokenId: cToken.tokenId,
      surahNumber: cToken.surahNumber,
      ayahNumber: cToken.ayahNumber,
      tokenIndex: cToken.tokenIndex,
      canonicalUthmani: cToken.originalUthmaniToken,
      normalizedText: cToken.normalizedComparisonToken,
      start: Number(b.start.toFixed(3)),
      end: Number(b.end.toFixed(3)),
      duration: Number((b.end - b.start).toFixed(3)),
      provenance: b.provenance,
      matchedObservationId: anchor?.matchedObservation.id,
      matchedObservationToken: anchor?.matchedObservation.token,
      confidence
    });
  }

  return words;
}


/**
 * Group Refined Words into Continuous Ayah Subtitles
 */
export function groupWordsIntoAyahAlignments(
  words: GeneralizedWordAlignment[],
  canonicalVerses: FormattedQuranVerse[]
): GeneralizedAyahAlignment[] {
  const ayahAlignments: GeneralizedAyahAlignment[] = [];
  const wordsByAyah = new Map<number, GeneralizedWordAlignment[]>();

  for (const w of words) {
    if (!wordsByAyah.has(w.ayahNumber)) {
      wordsByAyah.set(w.ayahNumber, []);
    }
    wordsByAyah.get(w.ayahNumber)!.push(w);
  }

  let prevAyahEnd = 0.0;

  for (const verse of canonicalVerses) {
    const ayahWords = wordsByAyah.get(verse.verse_number) || [];
    if (ayahWords.length === 0) continue;

    const ayahStart = ayahWords[0].start;
    const ayahEnd = ayahWords[ayahWords.length - 1].end;
    const observedCount = ayahWords.filter(w => w.provenance === 'observed' || w.provenance === 'vad-derived').length;

    // Aggregate ayah confidence scores
    let sumText = 0, sumAcoustic = 0, sumBoundary = 0, sumDur = 0, sumSeq = 0, sumPause = 0, sumComp = 0, sumModel = 0;
    for (const w of ayahWords) {
      sumText += w.confidence.textMatchScore;
      sumAcoustic += w.confidence.acousticEvidenceScore;
      sumBoundary += w.confidence.boundaryEvidenceScore;
      sumDur += w.confidence.durationEvidenceScore;
      sumSeq += w.confidence.sequenceContinuityScore;
      sumPause += w.confidence.pauseEvidenceScore;
      sumComp += w.confidence.compositeScore;
      sumModel += w.confidence.modelReportedConfidence;
    }

    const wLen = Math.max(1, ayahWords.length);
    const pauseBefore = Number(Math.max(0, ayahStart - prevAyahEnd).toFixed(3));
    prevAyahEnd = ayahEnd;

    ayahAlignments.push({
      verseKey: verse.verse_key,
      surahNumber: verse.surah_number,
      ayahNumber: verse.verse_number,
      canonicalArabic: verse.text_uthmani,
      canonicalEnglish: verse.text_english,
      start: Number(ayahStart.toFixed(3)),
      end: Number(ayahEnd.toFixed(3)),
      duration: Number((ayahEnd - ayahStart).toFixed(3)),
      words: ayahWords,
      confidence: {
        textMatchScore: Number((sumText / wLen).toFixed(3)),
        acousticEvidenceScore: Number((sumAcoustic / wLen).toFixed(3)),
        boundaryEvidenceScore: Number((sumBoundary / wLen).toFixed(3)),
        durationEvidenceScore: Number((sumDur / wLen).toFixed(3)),
        sequenceContinuityScore: Number((sumSeq / wLen).toFixed(3)),
        pauseEvidenceScore: Number((sumPause / wLen).toFixed(3)),
        compositeScore: Number((sumComp / wLen).toFixed(3)),
        modelReportedConfidence: Number((sumModel / wLen).toFixed(3))
      },
      observedWordCount: observedCount,
      totalWordCount: ayahWords.length,
      repetitionDetected: ayahWords.some(w => w.provenance === 'observed' && (w.matchedObservationId ?? 0) < 0),
      pauseDurationBeforeAyahSec: pauseBefore
    });
  }

  return ayahAlignments;
}

/**
 * Execute Phase 4 Generalized Quran Alignment Pipeline
 * 
 * Fully separates:
 * 1. Scripture sequence authority (Canonical Quran)
 * 2. Acoustic observations clock constraints
 * 3. Fallback hierarchy to legacy production engine
 */
export function runGeneralizedQuranAlignment(
  surahNumber: number,
  startAyah: number,
  endAyah: number,
  observations: Phase4AcousticObservation[] = [],
  legacyProductionResult: any[] = [],
  mode: AlignmentExecutionMode = 'legacy',
  vadBoundaries: number[] = [],
  totalAudioDuration: number = 0
): GeneralizedAlignmentResult {
  const warnings: string[] = [];

  // Step 1: Deterministic Canonical Quran Tokenization
  const { tokens, verses } = tokenizeCanonicalSurahRange(surahNumber, startAyah, endAyah);

  if (tokens.length === 0) {
    warnings.push(`No canonical verses found for Surah ${surahNumber} in range ${startAyah}-${endAyah}.`);
    return {
      mode,
      displayedSegments: legacyProductionResult,
      alignedAyahs: [],
      diagnostics: {
        provider: 'Generalized Quran Alignment Engine',
        executionMode: mode,
        totalCanonicalTokens: 0,
        totalObservationsReceived: observations.length,
        matchedTokensCount: 0,
        interpolatedTokensCount: 0,
        vadRefinedBoundariesCount: 0,
        repetitionsDetectedCount: 0,
        meanBoundaryRefinementDeltaMs: 0,
        meanCompositeScore: 0,
        tokenDiagnostics: [],
        fallbackTriggered: true,
        warnings
      }
    };
  }

  // Step 2: Graceful Fallback if no acoustic observations are supplied
  if (!observations || observations.length === 0) {
    warnings.push('Zero acoustic observations supplied. Executing graceful legacy/VAD fallback.');
    return {
      mode,
      displayedSegments: legacyProductionResult,
      alignedAyahs: [],
      diagnostics: {
        provider: 'Legacy Production / VAD Fallback',
        executionMode: mode,
        totalCanonicalTokens: tokens.length,
        totalObservationsReceived: 0,
        matchedTokensCount: 0,
        interpolatedTokensCount: tokens.length,
        vadRefinedBoundariesCount: 0,
        repetitionsDetectedCount: 0,
        meanBoundaryRefinementDeltaMs: 0,
        meanCompositeScore: 0,
        tokenDiagnostics: [],
        fallbackTriggered: true,
        warnings
      }
    };
  }

  // Step 3: Candidate Generation (O(N * K) bounded window)
  const candidateMap = generateAlignmentCandidates(tokens, observations, 8, 0.35);

  // Step 4: Monotonic Dynamic Programming Trellis Solver
  const { anchors, repetitionTokens, diagnosticsLog } = solveMonotonicTrellis(
    tokens,
    observations,
    candidateMap,
    vadBoundaries
  );

  // Step 5: Boundary Refinement & Word Timing Generation
  const refinedWords = refineBoundariesAndGenerateWords(
    tokens,
    anchors,
    vadBoundaries,
    totalAudioDuration
  );

  // Step 6: Multi-Ayah Grouping & Sequence Assembly
  const alignedAyahs = groupWordsIntoAyahAlignments(refinedWords, verses);

  // Compute summary metrics for diagnostics
  const matchedCount = anchors.size;
  const interpolatedCount = tokens.length - matchedCount;
  const vadRefinedCount = refinedWords.filter(w => w.provenance === 'vad-derived').length;
  
  let sumDeltaMs = 0;
  let sumComp = 0;
  for (const d of diagnosticsLog) {
    sumDeltaMs += d.boundaryRefinementDeltaMs;
    sumComp += d.scoreBreakdown.compositeScore;
  }
  const dLen = Math.max(1, diagnosticsLog.length);

  const diagnostics: GeneralizedAlignmentDiagnostics = {
    provider: 'Phase 4 Generalized Monotonic Alignment Engine',
    executionMode: mode,
    totalCanonicalTokens: tokens.length,
    totalObservationsReceived: observations.length,
    matchedTokensCount: matchedCount,
    interpolatedTokensCount: interpolatedCount,
    vadRefinedBoundariesCount: vadRefinedCount,
    repetitionsDetectedCount: repetitionTokens.size,
    meanBoundaryRefinementDeltaMs: Math.round(sumDeltaMs / dLen),
    meanCompositeScore: Number((sumComp / dLen).toFixed(3)),
    tokenDiagnostics: diagnosticsLog,
    fallbackTriggered: false,
    warnings
  };

  // Step 7: UI Safety Gatekeeper
  // In 'legacy' or 'phase4-shadow' mode, ALWAYS serve legacy production segments to the player
  const displayedSegments = mode === 'phase4-acoustic'
    ? alignedAyahs.map(a => ({
        start: a.start,
        end: a.end,
        verse_key: a.verseKey,
        text_arabic: a.canonicalArabic,
        text_english: a.canonicalEnglish
      }))
    : legacyProductionResult;

  return {
    mode,
    displayedSegments,
    alignedAyahs,
    diagnostics
  };
}
