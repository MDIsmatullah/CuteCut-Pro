/**
 * Phase 4 Generalized Quran Alignment Unit Test Suite
 * 
 * NOTE ON METHODOLOGY:
 * All test cases utilize SYNTHETIC BENCHMARK observations with explicitly labeled
 * `source: 'synthetic-benchmark'`.
 * Real-audio physical testing is NOT performed by this unit test suite.
 * These tests verify mathematical monotonic optimization, candidate pruning,
 * boundary refinement, provenance tracking, and software contract safety.
 */

import {
  tokenizeCanonicalSurahRange,
  generateAlignmentCandidates,
  solveMonotonicTrellis,
  refineBoundariesAndGenerateWords,
  groupWordsIntoAyahAlignments,
  runGeneralizedQuranAlignment,
  Phase4AcousticObservation
} from './generalizedQuranAlignment';

export interface GeneralizedTestResult {
  name: string;
  passed: boolean;
  details?: string;
}

export function runGeneralizedQuranAlignmentTests(): {
  total: number;
  passed: number;
  failed: number;
  results: GeneralizedTestResult[];
} {
  const results: GeneralizedTestResult[] = [];

  // TEST 1: Monotonic Sequence Enforcement (Strict j_next >= j_curr progression)
  {
    const { tokens } = tokenizeCanonicalSurahRange(112, 1, 1); // 4 words: قُلْ, هُوَ, ٱللَّهُ, أَحَدٌ
    const observations: Phase4AcousticObservation[] = [
      { id: 1, start: 0.5, end: 0.9, token: 'قل', normalizedToken: 'قل', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.4 },
      { id: 2, start: 0.9, end: 1.3, token: 'هو', normalizedToken: 'هو', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.4 },
      { id: 3, start: 1.3, end: 2.0, token: 'الله', normalizedToken: 'الله', modelConfidence: 0.95, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.7 },
      { id: 4, start: 2.0, end: 2.8, token: 'احد', normalizedToken: 'احد', modelConfidence: 0.95, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.8 }
    ];

    const candidates = generateAlignmentCandidates(tokens, observations);
    const { anchors } = solveMonotonicTrellis(tokens, observations, candidates);

    let isStrictlyMonotonic = true;
    let prevObsIdx = -1;
    for (let i = 0; i < tokens.length; i++) {
      const anchor = anchors.get(i);
      if (anchor) {
        if (anchor.observationIndex < prevObsIdx) {
          isStrictlyMonotonic = false;
        }
        prevObsIdx = anchor.observationIndex;
      }
    }

    const passed = anchors.size === 4 && isStrictlyMonotonic;
    results.push({
      name: '1. Monotonic Sequence (SYNTHETIC)',
      passed,
      details: `Matched ${anchors.size}/4 tokens | Strictly Monotonic: ${isStrictlyMonotonic}`
    });
  }

  // TEST 2: Repeated Ayah / Word (I'adah) Resilience
  {
    const { tokens } = tokenizeCanonicalSurahRange(112, 1, 1);
    // Reciter repeats the first two words before completing the Ayah
    const observations: Phase4AcousticObservation[] = [
      { id: 1, start: 0.5, end: 0.9, token: 'قل', normalizedToken: 'قل', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.4 },
      { id: 2, start: 0.9, end: 1.3, token: 'هو', normalizedToken: 'هو', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.4 },
      // Repeat attempt
      { id: 3, start: 1.8, end: 2.2, token: 'قل', normalizedToken: 'قل', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.4 },
      { id: 4, start: 2.2, end: 2.6, token: 'هو', normalizedToken: 'هو', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.4 },
      { id: 5, start: 2.6, end: 3.3, token: 'الله', normalizedToken: 'الله', modelConfidence: 0.95, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.7 },
      { id: 6, start: 3.3, end: 4.1, token: 'احد', normalizedToken: 'احد', modelConfidence: 0.95, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.8 }
    ];

    const candidates = generateAlignmentCandidates(tokens, observations);
    const { anchors } = solveMonotonicTrellis(tokens, observations, candidates);

    // Should bind final monotonic sequence correctly to completion
    const lastWordAnchor = anchors.get(3);
    const passed = lastWordAnchor !== undefined && lastWordAnchor.matchedObservation.id === 6;
    results.push({
      name: '2. Repeated Ayah / I\'adah Recovery (SYNTHETIC)',
      passed,
      details: `Resolved final token to observation ID ${lastWordAnchor?.matchedObservation.id} (expected ID 6)`
    });
  }

  // TEST 3: Partial Restart Resilience
  {
    const { tokens } = tokenizeCanonicalSurahRange(1, 1, 1); // بِسْمِ, ٱللَّهِ, ٱلرَّحْمَٰنِ, ٱلرَّحِيمِ
    const observations: Phase4AcousticObservation[] = [
      { id: 1, start: 0.5, end: 1.0, token: 'بسم', normalizedToken: 'بسم', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.5 },
      // Restart after hesitation
      { id: 2, start: 1.6, end: 2.1, token: 'بسم', normalizedToken: 'بسم', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.5 },
      { id: 3, start: 2.1, end: 2.8, token: 'الله', normalizedToken: 'الله', modelConfidence: 0.95, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.7 },
      { id: 4, start: 2.8, end: 3.6, token: 'الرحمن', normalizedToken: 'الرحمن', modelConfidence: 0.92, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.8 },
      { id: 5, start: 3.6, end: 4.5, token: 'الرحيم', normalizedToken: 'الرحيم', modelConfidence: 0.94, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.9 }
    ];

    const candidates = generateAlignmentCandidates(tokens, observations);
    const { anchors } = solveMonotonicTrellis(tokens, observations, candidates);
    const words = refineBoundariesAndGenerateWords(tokens, anchors, [], 4.5);

    const passed = words.length === 4 && words[3].matchedObservationId === 5;
    results.push({
      name: '3. Partial Restart Resilience (SYNTHETIC)',
      passed,
      details: `Full sequence aligned across partial restart | Final word end: ${words[3]?.end}s`
    });
  }

  // TEST 4: Long Silence & Pause Tolerance
  {
    const { tokens } = tokenizeCanonicalSurahRange(112, 1, 2);
    // 3.5 seconds long pause between Ayah 1 and Ayah 2
    const observations: Phase4AcousticObservation[] = [
      { id: 1, start: 0.5, end: 2.5, token: 'قل هو الله احد', normalizedToken: 'قل هو الله احد', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 2.0 },
      { id: 2, start: 6.0, end: 8.0, token: 'الله الصمد', normalizedToken: 'الله الصمد', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 2.0 }
    ];

    const result = runGeneralizedQuranAlignment(112, 1, 2, observations, [], 'phase4-acoustic', [0.5, 2.5, 6.0, 8.0], 8.5);
    const ayah2 = result.alignedAyahs[1];

    const passed = result.alignedAyahs.length === 2 &&
                   result.alignedAyahs[0].end <= 2.6 &&
                   ayah2.start >= 5.9 &&
                   ayah2.pauseDurationBeforeAyahSec >= 3.4;

    results.push({
      name: '4. Long Silence & Waqf Tolerance (SYNTHETIC)',
      passed,
      details: `Detected pause before Ayah 2: ${ayah2?.pauseDurationBeforeAyahSec}s (expected ~3.5s)`
    });
  }

  // TEST 5: Short Pause (Intra-Ayah Waqf)
  {
    const { tokens } = tokenizeCanonicalSurahRange(1, 2, 2); // ٱلْحَمْدُ, لِلَّهِ, رَبِّ, ٱلْعَٰلَمِينَ
    const observations: Phase4AcousticObservation[] = [
      { id: 1, start: 0.5, end: 1.2, token: 'الحمد', normalizedToken: 'الحمد', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.7 },
      { id: 2, start: 1.2, end: 1.8, token: 'لله', normalizedToken: 'لله', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.6 },
      // 300ms intra-ayah breath gap
      { id: 3, start: 2.1, end: 2.6, token: 'رب', normalizedToken: 'رب', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.5 },
      { id: 4, start: 2.6, end: 3.5, token: 'العالمين', normalizedToken: 'العالمين', modelConfidence: 0.95, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.9 }
    ];

    const candidates = generateAlignmentCandidates(tokens, observations);
    const { anchors } = solveMonotonicTrellis(tokens, observations, candidates);
    const words = refineBoundariesAndGenerateWords(tokens, anchors, [0.5, 1.8, 2.1, 3.5], 3.6);

    const passed = words.length === 4 && words[2].start === 2.1;
    results.push({
      name: '5. Short Pause / Intra-Ayah Waqf (SYNTHETIC)',
      passed,
      details: `Word 2 end: ${words[1]?.end}s, Word 3 start: ${words[2]?.start}s (Intra-pause preserved)`
    });
  }

  // TEST 6: Multiple Ayahs in One Continuous Speech Segment
  {
    const { tokens, verses } = tokenizeCanonicalSurahRange(113, 1, 3);
    // Continuous fast recitation connecting 3 ayahs without silence
    const observations: Phase4AcousticObservation[] = [
      { id: 1, start: 0.5, end: 1.0, token: 'قل', normalizedToken: 'قل', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.5 },
      { id: 2, start: 1.0, end: 1.6, token: 'اعوذ', normalizedToken: 'اعوذ', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.6 },
      { id: 3, start: 1.6, end: 2.1, token: 'برب', normalizedToken: 'برب', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.5 },
      { id: 4, start: 2.1, end: 2.8, token: 'الفلق', normalizedToken: 'الفلق', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.7 },
      { id: 5, start: 2.8, end: 3.3, token: 'من', normalizedToken: 'من', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.5 },
      { id: 6, start: 3.3, end: 3.8, token: 'شر', normalizedToken: 'شر', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.5 },
      { id: 7, start: 3.8, end: 4.5, token: 'ما', normalizedToken: 'ما', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.7 },
      { id: 8, start: 4.5, end: 5.2, token: 'خلق', normalizedToken: 'خلق', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.7 }
    ];

    const candidates = generateAlignmentCandidates(tokens, observations);
    const { anchors } = solveMonotonicTrellis(tokens, observations, candidates);
    const words = refineBoundariesAndGenerateWords(tokens, anchors, [], 5.5);
    const ayahs = groupWordsIntoAyahAlignments(words, verses);

    const passed = ayahs.length >= 2 && ayahs[0].end === ayahs[1].start;
    results.push({
      name: '6. Multiple Ayahs in Continuous Audio (SYNTHETIC)',
      passed,
      details: `Aligned ${ayahs.length} ayahs continuously | Ayah 1 end: ${ayahs[0]?.end}s, Ayah 2 start: ${ayahs[1]?.start}s`
    });
  }

  // TEST 7: Skipped Acoustic Observation (Extraneous Noise / Extraneous Word)
  {
    const { tokens } = tokenizeCanonicalSurahRange(112, 1, 1);
    const observations: Phase4AcousticObservation[] = [
      { id: 1, start: 0.5, end: 0.9, token: 'قل', normalizedToken: 'قل', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.4 },
      // Extraneous cough / background noise recognized as spurious token
      { id: 2, start: 0.9, end: 1.2, token: 'سعال', normalizedToken: 'سعال', modelConfidence: 0.3, acousticConfidence: 0.4, source: 'synthetic-benchmark', duration: 0.3 },
      { id: 3, start: 1.2, end: 1.6, token: 'هو', normalizedToken: 'هو', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.4 },
      { id: 4, start: 1.6, end: 2.3, token: 'الله', normalizedToken: 'الله', modelConfidence: 0.95, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.7 },
      { id: 5, start: 2.3, end: 3.1, token: 'احد', normalizedToken: 'احد', modelConfidence: 0.95, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.8 }
    ];

    const candidates = generateAlignmentCandidates(tokens, observations);
    const { anchors } = solveMonotonicTrellis(tokens, observations, candidates);

    // Spurious observation ID 2 must NOT be bound to any canonical token
    const isSpuriousBound = Array.from(anchors.values()).some(a => a.matchedObservation.id === 2);
    const passed = anchors.size === 4 && !isSpuriousBound;

    results.push({
      name: '7. Skipped Spurious Observation (SYNTHETIC)',
      passed,
      details: `Ignored extraneous observation ID 2 | Correctly matched 4/4 canonical tokens`
    });
  }

  // TEST 8: Skipped Canonical Token (Unobserved Token Interpolation)
  {
    const { tokens } = tokenizeCanonicalSurahRange(112, 1, 1); // 4 words
    // Word 2 ("هو") missing from acoustic observations
    const observations: Phase4AcousticObservation[] = [
      { id: 1, start: 0.5, end: 0.9, token: 'قل', normalizedToken: 'قل', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.4 },
      { id: 2, start: 1.5, end: 2.2, token: 'الله', normalizedToken: 'الله', modelConfidence: 0.95, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.7 },
      { id: 3, start: 2.2, end: 3.0, token: 'احد', normalizedToken: 'احد', modelConfidence: 0.95, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.8 }
    ];

    const candidates = generateAlignmentCandidates(tokens, observations);
    const { anchors } = solveMonotonicTrellis(tokens, observations, candidates);
    const words = refineBoundariesAndGenerateWords(tokens, anchors, [], 3.0);

    const skippedWord = words[1];
    const passed = words.length === 4 &&
                   skippedWord.provenance === 'interpolated' &&
                   skippedWord.start >= 0.9 &&
                   skippedWord.end <= 1.5;

    results.push({
      name: '8. Skipped Canonical Token Interpolation (SYNTHETIC)',
      passed,
      details: `Word "هو" interpolated in span: ${skippedWord?.start}s - ${skippedWord?.end}s | Provenance: ${skippedWord?.provenance}`
    });
  }

  // TEST 9: Incorrect Candidate Rejection
  {
    const { tokens } = tokenizeCanonicalSurahRange(112, 2, 2); // ٱللَّهُ, ٱلصَّمَدُ
    const observations: Phase4AcousticObservation[] = [
      { id: 1, start: 0.5, end: 1.2, token: 'الله', normalizedToken: 'الله', modelConfidence: 0.95, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.7 },
      // Deliberately incorrect phonetically dissimilar token
      { id: 2, start: 1.2, end: 1.8, token: 'كتاب', normalizedToken: 'كتاب', modelConfidence: 0.4, acousticConfidence: 0.4, source: 'synthetic-benchmark', duration: 0.6 }
    ];

    const candidates = generateAlignmentCandidates(tokens, observations);
    const word2Candidates = candidates.get(1) || [];

    const passed = word2Candidates.length === 0 || word2Candidates[0].textMatchScore < 0.35;
    results.push({
      name: '9. Incorrect Candidate Rejection (SYNTHETIC)',
      passed,
      details: `Rejected phonetically mismatched observation "كتاب" against "الصمد"`
    });
  }

  // TEST 10: Bounded Lookahead Window O(N * K)
  {
    const { tokens } = tokenizeCanonicalSurahRange(67, 1, 3); // 30+ tokens
    const observations: Phase4AcousticObservation[] = [];
    // Generate 50 dummy observations
    for (let j = 0; j < 50; j++) {
      observations.push({
        id: j,
        start: j * 0.5,
        end: (j + 1) * 0.5,
        token: 'كلمة',
        normalizedToken: 'كلمه',
        modelConfidence: 0.5,
        acousticConfidence: 0.5,
        source: 'synthetic-benchmark',
        duration: 0.5
      });
    }

    const candidateMap = generateAlignmentCandidates(tokens, observations, 8, 0.35);
    let maxCandidatesPerToken = 0;
    candidateMap.forEach(cList => {
      maxCandidatesPerToken = Math.max(maxCandidatesPerToken, cList.length);
    });

    const passed = maxCandidatesPerToken <= 11; // Lookahead 8 + 2 back + 1 center
    results.push({
      name: '10. Bounded Lookahead Window O(N * K) (SYNTHETIC)',
      passed,
      details: `Max candidates per token: ${maxCandidatesPerToken} (bounded by K=8)`
    });
  }

  // TEST 11: Zero Cumulative Drift Across Multi-Ayah Sequence
  {
    const { tokens, verses } = tokenizeCanonicalSurahRange(112, 1, 4); // 4 ayahs
    const observations: Phase4AcousticObservation[] = [
      { id: 1, start: 0.5, end: 2.0, token: 'قل هو الله احد', normalizedToken: 'قل هو الله احد', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 1.5 },
      { id: 2, start: 2.5, end: 4.0, token: 'الله الصمد', normalizedToken: 'الله الصمد', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 1.5 },
      { id: 3, start: 4.5, end: 6.5, token: 'لم يلد ولم يولد', normalizedToken: 'لم يلد ولم يولد', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 2.0 },
      { id: 4, start: 7.0, end: 9.5, token: 'ولم يكن له كفوا احد', normalizedToken: 'ولم يكن له كفوا احد', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 2.5 }
    ];

    const result = runGeneralizedQuranAlignment(112, 1, 4, observations, [], 'phase4-acoustic', [], 10.0);
    const lastAyah = result.alignedAyahs[result.alignedAyahs.length - 1];

    const passed = result.alignedAyahs.length === 4 && lastAyah.end === 9.5;
    results.push({
      name: '11. Zero Cumulative Timeline Drift (SYNTHETIC)',
      passed,
      details: `Final ayah end: ${lastAyah?.end}s | Timeline accumulation exact`
    });
  }

  // TEST 12: Boundary Refinement (VAD Transition Snapping within 120ms)
  {
    const { tokens } = tokenizeCanonicalSurahRange(112, 1, 1);
    // Observation starts at 0.540s, VAD boundary is at 0.500s (40ms delta -> should snap)
    const observations: Phase4AcousticObservation[] = [
      { id: 1, start: 0.54, end: 0.95, token: 'قل', normalizedToken: 'قل', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.41 }
    ];

    const candidates = generateAlignmentCandidates(tokens, observations);
    const { anchors } = solveMonotonicTrellis(tokens, observations, candidates, [0.50, 1.00]);
    const words = refineBoundariesAndGenerateWords(tokens, anchors, [0.50, 1.00], 1.2);

    const word1 = words[0];
    const passed = word1.start === 0.50 && word1.provenance === 'vad-derived';

    results.push({
      name: '12. Boundary Refinement VAD Snap (SYNTHETIC)',
      passed,
      details: `Snapped 0.54s -> ${word1?.start}s (VAD boundary delta: 40ms) | Provenance: ${word1?.provenance}`
    });
  }

  // TEST 13: Provenance Tracking (Explicit Labeling)
  {
    const { tokens } = tokenizeCanonicalSurahRange(112, 1, 1); // 4 words
    const observations: Phase4AcousticObservation[] = [
      { id: 1, start: 0.5, end: 0.9, token: 'قل', normalizedToken: 'قل', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.4 },
      // Word 2 missing -> interpolated
      { id: 3, start: 1.5, end: 2.2, token: 'الله', normalizedToken: 'الله', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark', duration: 0.7 }
    ];

    const candidates = generateAlignmentCandidates(tokens, observations);
    const { anchors } = solveMonotonicTrellis(tokens, observations, candidates);
    const words = refineBoundariesAndGenerateWords(tokens, anchors, [0.5, 0.9], 2.5);

    const provSet = new Set(words.map(w => w.provenance));
    const passed = provSet.has('observed') && provSet.has('interpolated');

    results.push({
      name: '13. Explicit Word Timing Provenance (SYNTHETIC)',
      passed,
      details: `Tracked provenances: ${Array.from(provSet).join(', ')}`
    });
  }

  // TEST 14: Structured Confidence Breakdown Decomposition
  {
    const { tokens } = tokenizeCanonicalSurahRange(112, 1, 1);
    const observations: Phase4AcousticObservation[] = [
      { id: 1, start: 0.5, end: 1.0, token: 'قل', normalizedToken: 'قل', modelConfidence: 0.92, acousticConfidence: 0.88, source: 'synthetic-benchmark', duration: 0.5 }
    ];

    const candidates = generateAlignmentCandidates(tokens, observations);
    const { anchors } = solveMonotonicTrellis(tokens, observations, candidates, [0.5, 1.0]);
    const anchor = anchors.get(0);

    const conf = anchor?.scoreBreakdown;
    const passed = conf !== undefined &&
                   conf.textMatchScore === 1.0 &&
                   conf.boundaryEvidenceScore >= 0.95 &&
                   conf.compositeScore > 0.80 &&
                   conf.modelReportedConfidence === 0.92;

    results.push({
      name: '14. Multi-Factor Confidence Decomposition (SYNTHETIC)',
      passed,
      details: `Text: ${conf?.textMatchScore}, Boundary: ${conf?.boundaryEvidenceScore}, Acoustic: ${conf?.acousticEvidenceScore}, Composite: ${conf?.compositeScore}`
    });
  }

  // TEST 15: Graceful Legacy Fallback on Missing Data
  {
    const legacyMock = [
      { start: 0.0, end: 3.0, verse_key: '112:1', text_arabic: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ', text_english: 'Say, He is Allah...' }
    ];

    const result = runGeneralizedQuranAlignment(112, 1, 1, [], legacyMock, 'legacy');

    const passed = result.diagnostics.fallbackTriggered === true &&
                   result.displayedSegments === legacyMock &&
                   result.diagnostics.warnings.length > 0;

    results.push({
      name: '15. Graceful Legacy Fallback (SYNTHETIC)',
      passed,
      details: `Fallback Triggered: ${result.diagnostics.fallbackTriggered} | Displayed Segments: Legacy Preserved (${result.displayedSegments === legacyMock})`
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
