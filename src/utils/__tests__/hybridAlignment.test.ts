
import { runQuranAlignmentEngine, QuranVerseInput, QuranicPhoneticModel } from '../quranAlignmentEngine';
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

/**
 * Phase 5B: Hybrid Alignment Logic Tests
 */
export async function runHybridAlignmentTests(): Promise<SuiteResult> {
  const results: TestResult[] = [];

  const verses: QuranVerseInput[] = [
    { verse_key: '67:1', text_uthmani: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ' },
    { verse_key: '67:2', text_uthmani: 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ' }
  ];

  const observations = [
    { start: 0.5, end: 3.4, confidence: 90 }, // Match for 67:1
    { start: 3.6, end: 6.4, confidence: 90 }  // Match for 67:2
  ];

  // 1. Hybrid Prior Injection
  try {
    const priors: ReferencePrior[] = [
      { verseKey: '67:1', expectedStartMs: 500, expectedEndMs: 3500, confidence: 95, provenance: 'provider-verified' },
      { verseKey: '67:2', expectedStartMs: 3600, expectedEndMs: 6500, confidence: 95, provenance: 'provider-verified' }
    ];

    const hybridRes = await runQuranAlignmentEngine(verses, {
      mode: 'hybrid',
      referencePriors: priors,
      acousticSegments: observations
    });

    results.push({
      name: '1. Hybrid Prior Injection',
      passed: hybridRes.length === 2 && hybridRes[0].diagnostics?.alignmentMethod === 'HYBRID-REFERENCE',
      details: hybridRes[0].diagnostics ? `Method: ${hybridRes[0].diagnostics.alignmentMethod}, RefEvidence: ${hybridRes[0].diagnostics.referenceEvidence}` : 'No diagnostics'
    });
  } catch (err: any) {
    results.push({ name: '1. Hybrid Prior Injection', passed: false, details: err.message });
  }

  // 2. Acoustic Authority Rule
  try {
    const badPriors: ReferencePrior[] = [
      { verseKey: '67:1', expectedStartMs: 5000, expectedEndMs: 8000, confidence: 95, provenance: 'provider-verified' },
      { verseKey: '67:2', expectedStartMs: 8100, expectedEndMs: 11000, confidence: 95, provenance: 'provider-verified' }
    ];

    const authorityRes = await runQuranAlignmentEngine(verses, {
      mode: 'hybrid',
      referencePriors: badPriors,
      acousticSegments: observations
    });

    // Acoustic observations should pull it back
    const startDiff = Math.abs(authorityRes[0].startTime - 0.5);
    results.push({
      name: '2. Acoustic Authority Rule',
      passed: startDiff < 0.6,
      details: `Start diff from observation: ${startDiff.toFixed(2)}s (Target < 0.6s)`
    });
  } catch (err: any) {
    results.push({ name: '2. Acoustic Authority Rule', passed: false, details: err.message });
  }

  // 3. Hybrid Diagnostics Verification
  try {
    const priors: ReferencePrior[] = [
      { verseKey: '67:1', expectedStartMs: 500, expectedEndMs: 3500, confidence: 95, provenance: 'provider-verified' },
      { verseKey: '67:2', expectedStartMs: 3600, expectedEndMs: 6500, confidence: 95, provenance: 'provider-verified' }
    ];

    const diagRes = await runQuranAlignmentEngine(verses, {
      mode: 'hybrid',
      referencePriors: priors,
      acousticSegments: observations
    });

    const d = diagRes[0].diagnostics;
    const hasHybridFields = d && d.alignmentMode === 'hybrid' && d.providerVsAcousticDeltaMs !== undefined;
    
    results.push({
      name: '3. Hybrid Diagnostics Verification',
      passed: !!hasHybridFields,
      details: d ? `Mode: ${d.alignmentMode}, Delta: ${d.providerVsAcousticDeltaMs}ms` : 'No diagnostics'
    });
  } catch (err: any) {
    results.push({ name: '3. Hybrid Diagnostics Verification', passed: false, details: err.message });
  }

  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  return { total, passed, failed, results };
}
