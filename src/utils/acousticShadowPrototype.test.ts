/**
 * Phase 3 Acoustic Shadow Prototype Unit Test Suite
 * 
 * Verifies:
 * 1. Acoustic observation schema integrity
 * 2. Arabic Quranic normalization for comparison (without mutating canonical text)
 * 3. Token similarity metrics (Levenshtein distance)
 * 4. Boundary proximity confidence calculation
 * 5. Multi-factor confidence decomposition
 * 6. Constrained canonical Quran hypothesis alignment
 * 7. Shadow comparison pipeline and diagnostics
 * 8. Fallback on missing/empty observations
 * 9. Production display safety ('legacy' and 'shadow' modes preserve legacy timestamps)
 */

import {
  AcousticObservation,
  normalizeArabicForComparison,
  computeLevenshteinDistance,
  calculateTokenSimilarity,
  calculateBoundaryProximityConfidence,
  computeCompositeConfidence,
  alignObservationsToCanonicalQuran,
  executeShadowAlignmentComparison
} from './acousticShadowPrototype';

export interface PrototypeTestResult {
  name: string;
  passed: boolean;
  details?: string;
}

export function runAcousticShadowPrototypeTests(): {
  total: number;
  passed: number;
  failed: number;
  results: PrototypeTestResult[];
} {
  const results: PrototypeTestResult[] = [];

  // TEST 1: Arabic Normalization for Comparison (Tashkeel, Waqf marks, Alif variants)
  {
    const rawUthmani = 'تَبَٰرَكَ ٱلَّذِى بِيَدِهِ ٱلْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ ۙ';
    const normalized = normalizeArabicForComparison(rawUthmani);
    // Should remove Tashkeel, replace ٱ -> ا, ى -> ي, strip Waqf mark ۙ
    const expected = 'تبارك الذي بيده الملك وهو علي كل شيء قدير';
    const passed = normalized === expected;
    results.push({
      name: '1. Arabic Orthography Normalization for Comparison',
      passed,
      details: passed ? `Normalized: "${normalized}"` : `Expected "${expected}", got "${normalized}"`
    });
  }

  // TEST 2: Levenshtein Distance & Token Similarity
  {
    const sim1 = calculateTokenSimilarity('تَبَارَكَ', 'تَبَٰرَكَ'); // Exact when normalized
    const sim2 = calculateTokenSimilarity('الذي', 'ٱلَّذِى');       // Exact when normalized
    const sim3 = calculateTokenSimilarity('قَدِيرٌ', 'قَدِيرٍ');     // Exact when normalized
    const sim4 = calculateTokenSimilarity('الملك', 'الملوك');       // Minor difference
    const sim5 = calculateTokenSimilarity('الشيطان', 'الرحمن');     // Very different

    const passed = sim1 === 1.0 && sim2 === 1.0 && sim3 === 1.0 && sim4 > 0.7 && sim5 < 0.5;
    results.push({
      name: '2. Arabic Token Similarity & Levenshtein Metrics',
      passed,
      details: `Exact: ${sim1}, ${sim2}, ${sim3} | Similar: ${sim4.toFixed(2)} | Dissimilar: ${sim5.toFixed(2)}`
    });
  }

  // TEST 3: Mathematical Boundary Proximity Confidence Decay
  {
    const vadBoundaries = [1.0, 3.5, 6.0, 9.2];
    const confExact = calculateBoundaryProximityConfidence(3.5, vadBoundaries);      // Delta 0ms -> ~1.0
    const confClose = calculateBoundaryProximityConfidence(3.55, vadBoundaries);     // Delta 50ms -> ~0.716
    const confFar = calculateBoundaryProximityConfidence(4.5, vadBoundaries);        // Delta 1000ms -> ~0.001

    const passed = confExact >= 0.99 && confClose > 0.65 && confClose < 0.85 && confFar < 0.05;
    results.push({
      name: '3. Boundary Proximity Confidence Exponential Decay',
      passed,
      details: `Exact (0ms): ${confExact} | Close (50ms): ${confClose} | Far (1000ms): ${confFar}`
    });
  }

  // TEST 4: Multidimensional Confidence Decomposition
  {
    // Model: 0.9, Acoustic SNR: 0.85, Text match: 1.0, Boundary proximity: 0.95
    const conf = computeCompositeConfidence(0.90, 0.85, 1.0, 0.95);
    // Composite: 0.40*1.0 + 0.25*0.95 + 0.20*0.85 + 0.15*0.90 = 0.40 + 0.2375 + 0.17 + 0.135 = 0.9425 -> 0.943
    const passed = conf.compositeConfidence >= 0.94 && conf.compositeConfidence <= 0.95 &&
                   conf.textMatchConfidence === 1.0 &&
                   conf.boundaryConfidence === 0.95;
    results.push({
      name: '4. Multi-Factor Confidence Decomposition (Zero Magic Constants)',
      passed,
      details: `Composite: ${conf.compositeConfidence} (Text: ${conf.textMatchConfidence}, Boundary: ${conf.boundaryConfidence}, Acoustic: ${conf.acousticConfidence}, Model: ${conf.modelConfidence})`
    });
  }

  // TEST 5: Constrained Quranic Hypotheses Alignment (Surah Al-Mulk 67:1-2)
  {
    const testObservations: AcousticObservation[] = [
      { start: 0.5, end: 1.1, token: 'تبارك', modelConfidence: 0.92, acousticConfidence: 0.88, source: 'synthetic-benchmark' },
      { start: 1.1, end: 1.5, token: 'الذي', modelConfidence: 0.94, acousticConfidence: 0.90, source: 'synthetic-benchmark' },
      { start: 1.5, end: 2.1, token: 'بيده', modelConfidence: 0.90, acousticConfidence: 0.85, source: 'synthetic-benchmark' },
      { start: 2.1, end: 2.7, token: 'الملك', modelConfidence: 0.95, acousticConfidence: 0.92, source: 'synthetic-benchmark' },
      { start: 2.7, end: 3.1, token: 'وهو', modelConfidence: 0.88, acousticConfidence: 0.80, source: 'synthetic-benchmark' },
      { start: 3.1, end: 3.5, token: 'على', modelConfidence: 0.91, acousticConfidence: 0.85, source: 'synthetic-benchmark' },
      { start: 3.5, end: 3.9, token: 'كل', modelConfidence: 0.93, acousticConfidence: 0.89, source: 'synthetic-benchmark' },
      { start: 3.9, end: 4.4, token: 'شيء', modelConfidence: 0.89, acousticConfidence: 0.82, source: 'synthetic-benchmark' },
      { start: 4.4, end: 5.2, token: 'قدير', modelConfidence: 0.96, acousticConfidence: 0.94, source: 'synthetic-benchmark' }
    ];

    const { hypotheses, matchedCount } = alignObservationsToCanonicalQuran(
      testObservations,
      67, // Surah Al-Mulk
      1,
      1,
      [0.5, 1.1, 1.5, 2.1, 2.7, 3.1, 3.5, 3.9, 4.4, 5.2]
    );

    const passed = hypotheses.length === 1 &&
                   matchedCount === 9 &&
                   hypotheses[0].start === 0.5 &&
                   hypotheses[0].end === 5.2 &&
                   hypotheses[0].wordHypotheses.length === 9 &&
                   hypotheses[0].confidence.compositeConfidence > 0.85;

    results.push({
      name: '5. Constrained Canonical Quran Alignment (Surah Al-Mulk 67:1)',
      passed,
      details: `Matched words: ${matchedCount}/9 | Ayah span: ${hypotheses[0]?.start}s - ${hypotheses[0]?.end}s | Confidence: ${hypotheses[0]?.confidence.compositeConfidence}`
    });
  }

  // TEST 6: Shadow Pipeline Diagnostics & Delta Calculation
  {
    const legacyResult = [
      { start: 0.4, end: 5.0, verse_key: '67:1', text_arabic: 'تَبَٰرَكَ ٱلَّذِى...', text_english: 'Blessed is He...' }
    ];

    const testObservations: AcousticObservation[] = [
      { start: 0.5, end: 1.1, token: 'تبارك', modelConfidence: 0.92, acousticConfidence: 0.88, source: 'synthetic-benchmark' },
      { start: 1.1, end: 1.5, token: 'الذي', modelConfidence: 0.94, acousticConfidence: 0.90, source: 'synthetic-benchmark' },
      { start: 1.5, end: 2.1, token: 'بيده', modelConfidence: 0.90, acousticConfidence: 0.85, source: 'synthetic-benchmark' },
      { start: 2.1, end: 2.7, token: 'الملك', modelConfidence: 0.95, acousticConfidence: 0.92, source: 'synthetic-benchmark' },
      { start: 2.7, end: 3.1, token: 'وهو', modelConfidence: 0.88, acousticConfidence: 0.80, source: 'synthetic-benchmark' },
      { start: 3.1, end: 3.5, token: 'على', modelConfidence: 0.91, acousticConfidence: 0.85, source: 'synthetic-benchmark' },
      { start: 3.5, end: 3.9, token: 'كل', modelConfidence: 0.93, acousticConfidence: 0.89, source: 'synthetic-benchmark' },
      { start: 3.9, end: 4.4, token: 'شيء', modelConfidence: 0.89, acousticConfidence: 0.82, source: 'synthetic-benchmark' },
      { start: 4.4, end: 5.2, token: 'قدير', modelConfidence: 0.96, acousticConfidence: 0.94, source: 'synthetic-benchmark' }
    ];

    const shadowRes = executeShadowAlignmentComparison(
      legacyResult,
      testObservations,
      67,
      1,
      1,
      'shadow',
      [0.5, 5.2],
      6.0
    );

    // Delta start: |0.4 - 0.5| = 0.1, delta end: |5.0 - 5.2| = 0.2 -> mean delta: 0.15s
    const passed = shadowRes.mode === 'shadow' &&
                   shadowRes.displayedSegments === legacyResult && // UI safety: MUST equal legacy result
                   shadowRes.diagnostics.meanBoundaryDeltaSec === 0.15 &&
                   shadowRes.diagnostics.matchedObservationsCount === 9;

    results.push({
      name: '6. Shadow Pipeline Comparison & Forensic Diagnostics',
      passed,
      details: `Mean Delta: ${shadowRes.diagnostics.meanBoundaryDeltaSec}s | Displayed Segments: Legacy Preserved (${shadowRes.displayedSegments === legacyResult})`
    });
  }

  // TEST 7: Fallback & API Failure Recovery
  {
    const legacyResult = [
      { start: 0.0, end: 4.0, verse_key: '1:1', text_arabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', text_english: 'In the name of Allah...' }
    ];

    // Empty observations simulation (e.g. API failure / timeout)
    const fallbackRes = executeShadowAlignmentComparison(
      legacyResult,
      [], // Empty
      1,
      1,
      1,
      'legacy',
      [],
      4.0
    );

    const passed = fallbackRes.diagnostics.fallbackTriggered === true &&
                   fallbackRes.displayedSegments === legacyResult &&
                   fallbackRes.diagnostics.warnings.length > 0;

    results.push({
      name: '7. Graceful Fallback on Missing/Failed Observations',
      passed,
      details: `Fallback Triggered: ${fallbackRes.diagnostics.fallbackTriggered} | Warning: "${fallbackRes.diagnostics.warnings[0]}"`
    });
  }

  // TEST 8: Production Display Safety Enforcement
  {
    const legacyResult = [{ start: 1.0, end: 3.0, verse_key: '112:1', text_arabic: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ', text_english: 'Say, He is Allah...' }];
    const testObs: AcousticObservation[] = [
      { start: 1.2, end: 3.2, token: 'قل هو الله احد', modelConfidence: 0.9, acousticConfidence: 0.9, source: 'synthetic-benchmark' }
    ];

    const legacyMode = executeShadowAlignmentComparison(legacyResult, testObs, 112, 1, 1, 'legacy');
    const shadowMode = executeShadowAlignmentComparison(legacyResult, testObs, 112, 1, 1, 'shadow');

    // In both 'legacy' and 'shadow' modes, displayedSegments MUST strictly be the legacy production result
    const passed = legacyMode.displayedSegments === legacyResult &&
                   shadowMode.displayedSegments === legacyResult;

    results.push({
      name: '8. Strict Production Display Safety (Legacy & Shadow Modes)',
      passed,
      details: `Legacy preserved in legacy mode: ${legacyMode.displayedSegments === legacyResult} | Legacy preserved in shadow mode: ${shadowMode.displayedSegments === legacyResult}`
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
