import { getCanonicalSurahVerses } from '../../data/canonicalQuran';
import { runQuranAlignmentEngine, QuranVerseInput } from '../quranAlignmentEngine';
import { assignAcousticSegmentsToVerses, fitAcousticSegmentsStrict, AcousticSegment } from '../editorUtils';
import {
  STRICT_REAL_AUDIO,
  ALLOW_PROPORTIONAL_SPLIT,
  ALLOW_INTERPOLATION,
  ALLOW_LEGACY_FALLBACK,
  ALLOW_PROVIDER_OVERRIDE
} from '../../config/alignmentConfig';

export interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

export interface TestSuiteResult {
  total: number;
  passed: number;
  failed: number;
  results: TestResult[];
}

export function runYasinStrictBenchmarkTests(): TestSuiteResult {
  const results: TestResult[] = [];

  function assert(name: string, condition: boolean, details?: string) {
    results.push({
      name,
      passed: condition,
      details: condition ? details : `ASSERTION FAILED: ${details || ''}`
    });
  }

  const yasinVerses = getCanonicalSurahVerses(36);

  // -------------------------------------------------------------------------
  // TEST 1: Surah Yasin Canonical Verification (1..83 Strict Indexing)
  // -------------------------------------------------------------------------
  {
    const count = yasinVerses.length;
    const firstVerse = yasinVerses[0];
    const lastVerse = yasinVerses[count - 1];
    const strictlyIndexed = yasinVerses.every((v, idx) => v.verse_number === idx + 1 && v.verse_key === `36:${idx + 1}`);

    const passed = count === 83 &&
                   firstVerse?.verse_key === '36:1' &&
                   firstVerse?.text_uthmani.includes('يس') &&
                   lastVerse?.verse_key === '36:83' &&
                   strictlyIndexed;

    assert(
      '1. Surah Yasin Canonical Verification (1..83 Strict Indexing)',
      passed,
      `Verses: ${count}/83 | 36:1: "${firstVerse?.text_uthmani}" | 36:83: "${lastVerse?.text_uthmani.slice(0, 20)}..." | Strictly Indexed: ${strictlyIndexed}`
    );
  }

  // -------------------------------------------------------------------------
  // TEST 2: Proportional Split & Interpolation Firewall (S=48 < V=83)
  // -------------------------------------------------------------------------
  {
    // Continuous recitation scenario: 48 acoustic segments for 83 verses
    const simulatedAcousticSegments: AcousticSegment[] = [];
    let curTime = 0.5;
    for (let s = 0; s < 48; s++) {
      const segDur = 3.0 + (s % 5) * 1.2;
      simulatedAcousticSegments.push({
        start: Number(curTime.toFixed(2)),
        end: Number((curTime + segDur).toFixed(2))
      });
      curTime += segDur + 0.4; // 400ms pause
    }

    const assignments = assignAcousticSegmentsToVerses(
      simulatedAcousticSegments,
      yasinVerses.length,
      yasinVerses.map(v => v.text_uthmani.length)
    );

    const proportionalSplitCount = assignments.proportionalSplitCount ?? 0;
    const interpolationCount = assignments.interpolationCount ?? 0;
    const legacyFallbackCount = assignments.legacyFallbackCount ?? 0;
    const providerOverrideCount = assignments.providerOverrideCount ?? 0;
    const isAbstained = assignments.status === 'ABSTAIN';

    // Strict Real-Audio Mode: Proportional splitting is strictly forbidden when S < V
    const passed = STRICT_REAL_AUDIO &&
                   !ALLOW_PROPORTIONAL_SPLIT &&
                   proportionalSplitCount === 0 &&
                   interpolationCount === 0 &&
                   legacyFallbackCount === 0 &&
                   providerOverrideCount === 0 &&
                   isAbstained;

    assert(
      '2. Proportional Split & Interpolation Firewall (S=48 < V=83)',
      passed,
      `Status: ${assignments.status} | Proportional splits: ${proportionalSplitCount} (must be 0) | Interpolations: ${interpolationCount} (must be 0) | Strict: ${STRICT_REAL_AUDIO}`
    );
  }

  // -------------------------------------------------------------------------
  // TEST 3: Full 83-Ayah Yasin Alignment with Strict Forensic Diagnostics
  // -------------------------------------------------------------------------
  {
    // Generate realistic 83 acoustic speech blocks with distinct onsets, offsets and pauses
    const acousticSegments: AcousticSegment[] = [];
    let curTime = 1.0;
    for (let v = 0; v < 83; v++) {
      const verseWordCount = yasinVerses[v].text_uthmani.split(/\s+/).length;
      const speechDur = Math.max(1.5, verseWordCount * 0.45);
      acousticSegments.push({
        start: Number(curTime.toFixed(2)),
        end: Number((curTime + speechDur).toFixed(2))
      });
      const pauseDur = v % 4 === 0 ? 1.2 : 0.45; // Periodic longer breathing waqf
      curTime += speechDur + pauseDur;
    }
    const totalAudioDuration = Number(curTime.toFixed(2));

    const aligned = runQuranAlignmentEngine(yasinVerses, {
      acousticSegments,
      audioDuration: totalAudioDuration,
      strictRealAudio: true,
      allowProportionalSplit: false,
      allowInterpolation: false,
      allowLegacyFallback: false,
      allowProviderOverride: false
    });

    const totalAligned = aligned.length;
    let allMonotonic = true;
    let allPositiveDuration = true;
    let zeroProportionalSplits = true;
    let zeroInterpolations = true;
    let zeroLegacyFallbacks = true;
    let allDiagnosticsComplete = true;

    for (let i = 0; i < totalAligned; i++) {
      const seg = aligned[i];
      if (seg.startTime >= seg.endTime) allPositiveDuration = false;
      if (i > 0 && seg.startTime < aligned[i - 1].endTime) allMonotonic = false;

      const d = seg.diagnostics;
      if (!d) {
        allDiagnosticsComplete = false;
        continue;
      }

      if (d.proportionalSplitUsed) zeroProportionalSplits = false;
      if (d.interpolationUsed) zeroInterpolations = false;
      if (d.legacyFallbackUsed) zeroLegacyFallbacks = false;

      if (
        d.sustainedVoicingRisk === undefined ||
        d.boundaryStabilityMs === undefined ||
        d.candidateMarginMs === undefined ||
        !d.validationStatus
      ) {
        allDiagnosticsComplete = false;
      }
    }

    const passed = totalAligned === 83 &&
                   allMonotonic &&
                   allPositiveDuration &&
                   zeroProportionalSplits &&
                   zeroInterpolations &&
                   zeroLegacyFallbacks &&
                   allDiagnosticsComplete;

    assert(
      '3. Full 83-Ayah Yasin Alignment with Strict Forensic Diagnostics',
      passed,
      `Aligned: ${totalAligned}/83 | Monotonic: ${allMonotonic} | PositiveDur: ${allPositiveDuration} | ZeroPropSplits: ${zeroProportionalSplits} | ZeroInterpolations: ${zeroInterpolations} | CompleteDiagnostics: ${allDiagnosticsComplete}`
    );
  }

  // -------------------------------------------------------------------------
  // TEST 4: Yasin 36:1 "يس" Madd Lazim & Sustained Voicing Protection
  // -------------------------------------------------------------------------
  {
    // 36:1 "يس" has 6 harakat Madd Lazim on Ya & Sin (~2.2s). True offset at 2.40s. Pause 2.40s - 3.20s.
    // 36:2 starts at 3.20s.
    const yasin1And2: QuranVerseInput[] = [
      yasinVerses[0], // 36:1
      yasinVerses[1]  // 36:2
    ];

    const acousticSegments: AcousticSegment[] = [
      { start: 0.50, end: 2.40 }, // True Ayah 1 (duration: 1.9s)
      { start: 3.20, end: 6.80 }  // True Ayah 2 (duration: 3.6s)
    ];

    const aligned = runQuranAlignmentEngine(yasin1And2, {
      acousticSegments,
      audioDuration: 8.0,
      strictRealAudio: true,
      allowProportionalSplit: false
    });

    const ayah1 = aligned[0];
    const ayah2 = aligned[1];

    // Ayah 1 must lock onto the true speech-offset at 2.40s (+/- 0.15s),
    // NEVER swallowing the 800ms silence gap or drifting to 3.20s.
    const ayah1EndAccurate = Math.abs(ayah1.endTime - 2.40) <= 0.15;
    const ayah2StartAccurate = Math.abs(ayah2.startTime - 3.20) <= 0.15;
    const gapPreserved = ayah2.startTime >= ayah1.endTime;

    const passed = ayah1EndAccurate && ayah2StartAccurate && gapPreserved;

    assert(
      '4. Yasin 36:1 "يس" Madd Lazim & Sustained Voicing Protection',
      passed,
      `Ayah 1 end: ${ayah1.endTime}s (expected ~2.40s) | Ayah 2 start: ${ayah2.startTime}s (expected ~3.20s) | Pause gap: ${(ayah2.startTime - ayah1.endTime).toFixed(2)}s`
    );
  }

  // -------------------------------------------------------------------------
  // TEST 5: Multi-Pass Boundary Stability & Candidate Margin Decomposition
  // -------------------------------------------------------------------------
  {
    const yasinSubset = yasinVerses.slice(0, 5);
    const acousticSegments: AcousticSegment[] = [
      { start: 0.5, end: 2.4 },
      { start: 3.1, end: 6.5 },
      { start: 7.2, end: 10.4 },
      { start: 11.0, end: 14.8 },
      { start: 15.6, end: 19.5 }
    ];

    const aligned = runQuranAlignmentEngine(yasinSubset, {
      acousticSegments,
      audioDuration: 21.0,
      strictRealAudio: true
    });

    const metrics = aligned.map(a => ({
      ayah: a.verse_key,
      stability: a.diagnostics?.boundaryStabilityMs ?? 0,
      margin: a.diagnostics?.candidateMarginMs ?? 0,
      status: a.diagnostics?.validationStatus,
      risk: a.diagnostics?.sustainedVoicingRisk ?? 0
    }));

    const allHaveMetrics = metrics.every(m => m.stability >= 0 && m.margin >= 0 && (m.status === 'VALIDATED' || m.status === 'UNVALIDATED'));
    const passed = metrics.length === 5 && allHaveMetrics;

    assert(
      '5. Multi-Pass Boundary Stability & Candidate Margin Decomposition',
      passed,
      `Evaluated 5 Ayahs: Avg Stability: ${(metrics.reduce((acc, m) => acc + m.stability, 0) / 5).toFixed(0)}ms | Avg Margin: ${(metrics.reduce((acc, m) => acc + m.margin, 0) / 5).toFixed(0)}ms | Validated: ${metrics.filter(m => m.status === 'VALIDATED').length}/5`
    );
  }

  // -------------------------------------------------------------------------
  // TEST 6: Strict Boundary Non-Overlapping & Monotonic Timeline Invariance
  // -------------------------------------------------------------------------
  {
    const yasinSubset = yasinVerses.slice(0, 10);
    const acousticSegments: AcousticSegment[] = [];
    let t = 0.2;
    for (let i = 0; i < 10; i++) {
      acousticSegments.push({ start: Number(t.toFixed(2)), end: Number((t + 3.0).toFixed(2)) });
      t += 3.4;
    }

    const aligned = runQuranAlignmentEngine(yasinSubset, {
      acousticSegments,
      audioDuration: 40.0,
      edgePaddingMs: 50 // Test non-overlapping enforcement with padding
    });

    let zeroOverlap = true;
    for (let i = 1; i < aligned.length; i++) {
      if (aligned[i].startTime < aligned[i - 1].endTime) {
        zeroOverlap = false;
        break;
      }
    }

    const passed = aligned.length === 10 && zeroOverlap;

    assert(
      '6. Strict Boundary Non-Overlapping & Monotonic Timeline Invariance',
      passed,
      `Segments: ${aligned.length} | Zero overlap: ${zeroOverlap}`
    );
  }

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.length - passedCount;

  return {
    total: results.length,
    passed: passedCount,
    failed: failedCount,
    results
  };
}
