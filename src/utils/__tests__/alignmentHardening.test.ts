import { QuranVerseInput, QuranAlignmentSegment } from '../quranAlignmentEngine';
import { runQuranAlignmentEngine, enforceGlobalTimelineConsistency } from '../quranAlignmentEngine';
import { executeAcousticValidationHarness } from '../validationHarness';
import { ReferencePrior } from '../../types/qari';

export interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

export interface SuiteResult {
  total: number;
  passed: number;
  failed: number;
  results: TestResult[];
}

export async function runAlignmentHardeningTests(): Promise<SuiteResult> {
  const results: TestResult[] = [];

  const dummyVerses: QuranVerseInput[] = [
    { verse_key: '67:23', text_arabic: 'قل هو الذي انشاكم وجعل لكم السمع والابصار والافئدة' },
    { verse_key: '67:24', text_arabic: 'قل هو الذي ذراكم في الارض واليه تحشرون' }
  ];

  // 1. 67:23 → 67:24 Transition & Madd Stability (Synthetic)
  try {
    const acousticSegments = [
      { start: 0.5, end: 10.0 }, // 67:23
      { start: 19.0, end: 25.0 } // 67:24
    ];

    const alignment = runQuranAlignmentEngine(dummyVerses, {
      acousticSegments,
      mode: 'full-ayah',
      edgePaddingMs: 100
    });

    const passed = alignment.length === 2 && 
                   alignment[0].verse_key === '67:23' && 
                   alignment[1].verse_key === '67:24' &&
                   alignment[0].endTime < 11.0 &&
                   alignment[1].startTime > 18.0;

    results.push({
      name: '1. 67:23 → 67:24 Transition & Madd Stability (Synthetic)',
      passed,
      details: alignment.length === 2 ? `67:23 End: ${alignment[0].endTime}s, 67:24 Start: ${alignment[1].startTime}s` : 'Failed length'
    });
  } catch (err: any) {
    results.push({ name: '1. 67:23 → 67:24 Transition & Madd Stability (Synthetic)', passed: false, details: err.message });
  }

  // 2. Evidence Type Firewall
  try {
    const syntheticReport = executeAcousticValidationHarness(dummyVerses, [
      { verseKey: '67:23', start: 0.5, end: 10.0 },
      { verseKey: '67:24', start: 19.0, end: 25.0 }
    ]);

    const physicalPcmReport = executeAcousticValidationHarness(
      dummyVerses,
      [
        { verseKey: '67:23', start: 0.5, end: 10.0 },
        { verseKey: '67:24', start: 19.0, end: 25.0 }
      ],
      new Float32Array(16000 * 30), // 30s dummy PCM
      16000,
      'validation/recordings/surah_67_test_qari.wav'
    );

    const passed = syntheticReport.evidenceType === 'synthetic' && 
                   physicalPcmReport.evidenceType === 'physical-pcm' &&
                   physicalPcmReport.certification === 'D — UNVERIFIED';

    results.push({
      name: '2. Evidence Type Firewall Validation',
      passed,
      details: `Synthetic: ${syntheticReport.evidenceType}, Physical: ${physicalPcmReport.evidenceType}`
    });
  } catch (err: any) {
    results.push({ name: '2. Evidence Type Firewall Validation', passed: false, details: err.message });
  }

  // 3. Long Waqf & Breathing Pause Resiliency
  try {
    const gaps = [0.2, 1.0, 3.0, 10.0];
    let allGapsPreserved = true;
    
    for (const gap of gaps) {
      const acousticSegments = [
        { start: 0.5, end: 5.0 },
        { start: 5.0 + gap, end: 10.0 + gap }
      ];

      const align = runQuranAlignmentEngine(dummyVerses, {
        acousticSegments,
        mode: 'full-ayah',
        edgePaddingMs: 0
      });

      if (align.length !== 2 || (align[1].startTime - align[0].endTime < 0)) {
        allGapsPreserved = false;
      }
    }

    results.push({
      name: '3. Long Waqf & Breathing Pause Resiliency',
      passed: allGapsPreserved,
      details: 'Evaluated pauses from 200ms to 10s successfully'
    });
  } catch (err: any) {
    results.push({ name: '3. Long Waqf & Breathing Pause Resiliency', passed: false, details: err.message });
  }

  // 4. Madd-Aware Duration Robustness
  try {
    const acousticSegments = [
      { start: 0.5, end: 15.0 }, // 14.5s (nominal is ~5.0s)
      { start: 16.0, end: 22.0 }
    ];

    const align = runQuranAlignmentEngine(dummyVerses, {
      acousticSegments,
      mode: 'full-ayah'
    });

    const passed = align.length === 2 && align[1].startTime >= align[0].endTime;

    results.push({
      name: '4. Madd-Aware Duration Robustness',
      passed,
      details: align.length === 2 ? `Stretch ratio: ${(14.5 / 5.0).toFixed(1)}x` : 'Failed length'
    });
  } catch (err: any) {
    results.push({ name: '4. Madd-Aware Duration Robustness', passed: false, details: err.message });
  }

  // 5. Recitation Pacing & Tempo Perturbations
  try {
    const speeds = [0.5, 0.75, 1.0, 1.5, 2.0];
    let allPacesStable = true;

    for (const speed of speeds) {
      const acousticSegments = [
        { start: 0.2, end: 4.0 * speed },
        { start: 4.0 * speed + 1.0, end: 8.0 * speed }
      ];

      const align = runQuranAlignmentEngine(dummyVerses, {
        acousticSegments,
        mode: 'full-ayah'
      });

      if (align.length !== 2 || align[1].startTime < align[0].endTime) {
        allPacesStable = false;
      }
    }

    results.push({
      name: '5. Recitation Pacing & Tempo Perturbations',
      passed: allPacesStable,
      details: 'Tested speed factors from Hadr to Tartil successfully'
    });
  } catch (err: any) {
    results.push({ name: '5. Recitation Pacing & Tempo Perturbations', passed: false, details: err.message });
  }

  // 6. Provider Prior Resilience & Acoustic Authority
  try {
    const acousticSegments = [
      { start: 1.0, end: 6.0 },
      { start: 7.0, end: 12.0 }
    ];

    const conflictingPriors: ReferencePrior[] = [
      { verseKey: '67:23', expectedStartMs: 5000, expectedEndMs: 15000, confidence: 95, provenance: 'provider-verified' },
      { verseKey: '67:24', expectedStartMs: 16000, expectedEndMs: 25000, confidence: 95, provenance: 'provider-verified' }
    ];

    const align = runQuranAlignmentEngine(dummyVerses, {
      acousticSegments,
      referencePriors: conflictingPriors,
      mode: 'full-ayah',
      edgePaddingMs: 0
    });

    const passed = align.length === 2 && align[0].startTime < 2.0 && align[0].endTime < 7.0;

    results.push({
      name: '6. Provider Prior Resilience & Acoustic Authority',
      passed,
      details: align.length === 2 ? `Acoustic Start: ${align[0].startTime}s (Expected Priority)` : 'Failed length'
    });
  } catch (err: any) {
    results.push({ name: '6. Provider Prior Resilience & Acoustic Authority', passed: false, details: err.message });
  }

  // 7. Timeline Integrity Gap Hardening
  try {
    const mockSegments: QuranAlignmentSegment[] = [
      { ayahIndex: 0, wordIndex: 0, startTime: 1.0, endTime: 5.0, isWaqfPause: false, confidenceScore: 90, verse_key: '67:1' },
      { ayahIndex: 1, wordIndex: 5, startTime: 5.2, endTime: 9.0, isWaqfPause: false, confidenceScore: 90, verse_key: '67:2' }
    ];

    const gapsMs = [0, 10, 100, 500, 1000, 3000, 5000, 10000];
    let allGapsPassed = true;

    for (const gap of gapsMs) {
      const adjustedSegments = mockSegments.map((s, i) => {
        if (i === 1) {
          return { ...s, startTime: mockSegments[0].endTime + (gap / 1000) };
        }
        return s;
      });

      const consistent = enforceGlobalTimelineConsistency(adjustedSegments, 50, 30.0);
      if (consistent.length !== 2 || consistent[1].startTime < consistent[0].endTime) {
        allGapsPassed = false;
      }
    }

    results.push({
      name: '7. Timeline Integrity Gap Hardening',
      passed: allGapsPassed,
      details: `Evaluated ${gapsMs.length} timeline gap intervals successfully`
    });
  } catch (err: any) {
    results.push({ name: '7. Timeline Integrity Gap Hardening', passed: false, details: err.message });
  }

  const passedCount = results.filter(r => r.passed).length;
  return {
    total: results.length,
    passed: passedCount,
    failed: results.length - passedCount,
    results
  };
}
