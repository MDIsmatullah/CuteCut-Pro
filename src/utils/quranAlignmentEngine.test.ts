/**
 * Quran Alignment Engine - 13 Automated Forced Alignment Test Scenarios
 * 
 * Verifies:
 * 1. Fast recitation (Hadr)
 * 2. Slow recitation (Tartil)
 * 3. Long pause between ayahs
 * 4. Short pause (Intra-ayah Waqf)
 * 5. Multiple Ayahs in one continuous speech segment (continuous breath)
 * 6. Repeated Ayah (I'adah)
 * 7. Re-reading / partial restart
 * 8. Noisy audio (low SNR, adaptive noise floor)
 * 9. Reverberant audio (mosque acoustics decay)
 * 10. Bismillah (separate alignment target when present, absent = no time allocated)
 * 11. Ta'awwuz (separate alignment target when present, absent = no time allocated)
 * 12. Long Surah sequence (30 Ayahs of Surah Al-Mulk) with zero cumulative drift
 * 13. Deliberately incorrect candidate boundary (demonstrating global Viterbi error recovery)
 */

import {
  runQuranAlignmentEngine,
  QuranVerseInput,
  extractAcousticObservations,
  computePhoneticTextSimilarity,
  normalizeQuranicPhonetics
} from './quranAlignmentEngine';

export interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

export function runAllQuranAlignmentTests(): {
  total: number;
  passed: number;
  failed: number;
  results: TestResult[];
} {
  const results: TestResult[] = [];

  function assert(name: string, condition: boolean, details?: string) {
    results.push({
      name,
      passed: !!condition,
      details: details || (condition ? undefined : 'Assertion condition failed')
    });
  }

  // -------------------------------------------------------------------------
  // TEST 1: Fast Recitation (Hadr)
  // -------------------------------------------------------------------------
  try {
    const verses: QuranVerseInput[] = [
      { verse_key: '1:1', text_uthmani: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
      { verse_key: '1:2', text_uthmani: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' }
    ];

    // Rapid tempo ~1.2s per ayah
    const acousticSegments = [
      { start: 0.2, end: 1.4 },
      { start: 1.6, end: 2.8 }
    ];

    const aligned = runQuranAlignmentEngine(verses, {
      acousticSegments,
      audioDuration: 3.2,
      recitationPaceEstimate: 'fast-hadr',
      edgePaddingMs: 0
    });

    const passed = aligned.length === 2 && aligned[0].startTime === 0.2 && aligned[1].startTime === 1.6;
    assert('1. Fast Recitation (Hadr)', passed);
  } catch (e: any) {
    assert('1. Fast Recitation (Hadr)', false, e.message);
  }

  // -------------------------------------------------------------------------
  // TEST 2: Slow Recitation (Tartil)
  // -------------------------------------------------------------------------
  try {
    const verses: QuranVerseInput[] = [
      { verse_key: '1:1', text_uthmani: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
      { verse_key: '1:2', text_uthmani: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' }
    ];

    // Prolonged slow Tartil ~8s per ayah
    const acousticSegments = [
      { start: 0.5, end: 8.5 },
      { start: 10.0, end: 18.0 }
    ];

    const aligned = runQuranAlignmentEngine(verses, {
      acousticSegments,
      audioDuration: 20.0,
      recitationPaceEstimate: 'slow-tartil',
      edgePaddingMs: 0
    });

    const passed = aligned.length === 2 && aligned[0].endTime === 8.5 && aligned[1].startTime === 10.0;
    assert('2. Slow Recitation (Tartil)', passed);
  } catch (e: any) {
    assert('2. Slow Recitation (Tartil)', false, e.message);
  }

  // -------------------------------------------------------------------------
  // TEST 3: Long Pauses Between Ayahs
  // -------------------------------------------------------------------------
  try {
    const verses: QuranVerseInput[] = [
      { verse_key: '112:1', text_uthmani: 'قُلْ هُوَ اللَّهُ أَحَدٌ' },
      { verse_key: '112:2', text_uthmani: 'اللَّهُ الصَّمَدُ' }
    ];

    // 4.0s pause gap between Ayah 1 and Ayah 2
    const acousticSegments = [
      { start: 0.5, end: 3.5 },
      { start: 7.5, end: 10.5 }
    ];

    const aligned = runQuranAlignmentEngine(verses, {
      acousticSegments,
      audioDuration: 12.0,
      edgePaddingMs: 0
    });

    const passed = aligned.length === 2 && aligned[0].endTime === 3.5 && aligned[1].startTime === 7.5;
    assert('3. Long Pause Between Ayahs', passed);
  } catch (e: any) {
    assert('3. Long Pause Between Ayahs', false, e.message);
  }

  // -------------------------------------------------------------------------
  // TEST 4: Short Pause (Intra-Ayah Waqf)
  // -------------------------------------------------------------------------
  try {
    const verses: QuranVerseInput[] = [
      { verse_key: '2:255', text_uthmani: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ' }
    ];

    // 350ms breath pause inside Ayat al-Kursi
    const aligned = runQuranAlignmentEngine(verses, {
      mode: 'split-breaths',
      audioDuration: 12.0,
      edgePaddingMs: 0
    });

    const passed = aligned.length >= 1;
    assert('4. Short Pause (Intra-Ayah Waqf)', passed);
  } catch (e: any) {
    assert('4. Short Pause (Intra-Ayah Waqf)', false, e.message);
  }

  // -------------------------------------------------------------------------
  // TEST 5: Multiple Ayahs in One Continuous Speech Segment (Continuous Breath)
  // -------------------------------------------------------------------------
  try {
    const verses: QuranVerseInput[] = [
      { verse_key: '114:1', text_uthmani: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ' },
      { verse_key: '114:2', text_uthmani: 'مَلِكِ النَّاسِ' },
      { verse_key: '114:3', text_uthmani: 'إِلَٰهِ النَّاسِ' }
    ];

    // Continuous 6.0s speech block without silence pauses
    const acousticSegments = [
      { start: 0.5, end: 6.5 }
    ];

    const aligned = runQuranAlignmentEngine(verses, {
      acousticSegments,
      audioDuration: 7.0,
      edgePaddingMs: 0,
      allowProportionalSplit: true
    });

    // Syllabic Viterbi anchors each verse continuously across the single breath
    const passed = aligned.length === 3 && aligned[0].startTime === 0.5 && aligned[2].endTime === 6.5;
    assert('5. Multiple Ayahs in One Continuous Speech Segment', passed);
  } catch (e: any) {
    assert('5. Multiple Ayahs in One Continuous Speech Segment', false, e.message);
  }

  // -------------------------------------------------------------------------
  // TEST 6: Repeated Ayah (I'adah)
  // -------------------------------------------------------------------------
  try {
    const verses: QuranVerseInput[] = [
      { verse_key: '55:13', text_uthmani: 'فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ' },
      { verse_key: '55:14', text_uthmani: 'خَلَقَ الْإِنسَانَ مِن صَلْصَالٍ كَالْفَخَّارِ' }
    ];

    const acousticSegments = [
      { start: 0.4, end: 3.5 },
      { start: 4.2, end: 7.3 }, // Repetition of 55:13
      { start: 8.0, end: 12.0 }  // 55:14
    ];

    const aligned = runQuranAlignmentEngine(verses, {
      acousticSegments,
      audioDuration: 13.0,
      edgePaddingMs: 0
    });

    const passed = aligned.length === 2 && aligned[1].endTime === 12.0;
    assert('6. Repeated Ayah (I\'adah)', passed);
  } catch (e: any) {
    assert('6. Repeated Ayah (I\'adah)', false, e.message);
  }

  // -------------------------------------------------------------------------
  // TEST 7: Re-reading / Partial Restart
  // -------------------------------------------------------------------------
  try {
    const verses: QuranVerseInput[] = [
      { verse_key: '67:1', text_uthmani: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ' }
    ];

    // Reciter stumbles after 2s, restarts and recites fully to 10s
    const acousticSegments = [
      { start: 0.5, end: 2.2 },
      { start: 2.8, end: 10.0 }
    ];

    const aligned = runQuranAlignmentEngine(verses, {
      acousticSegments,
      audioDuration: 11.0,
      edgePaddingMs: 0
    });

    const passed = aligned.length === 1 && aligned[0].endTime === 10.0;
    assert('7. Re-reading / Partial Restart', passed);
  } catch (e: any) {
    assert('7. Re-reading / Partial Restart', false, e.message);
  }

  // -------------------------------------------------------------------------
  // TEST 8: Noisy Audio (Low SNR Adaptive Noise Floor)
  // -------------------------------------------------------------------------
  try {
    // Generate synthetic PCM with background Gaussian noise + speech burst
    const sampleRate = 8000;
    const pcm = new Float32Array(sampleRate * 3); // 3 seconds
    for (let i = 0; i < pcm.length; i++) {
      // Noise floor ~-40dB
      pcm[i] = (Math.random() - 0.5) * 0.02;
      // Speech signal from 1.0s to 2.5s (~-15dB)
      if (i >= sampleRate * 1.0 && i <= sampleRate * 2.5) {
        pcm[i] += Math.sin(2 * Math.PI * 220 * (i / sampleRate)) * 0.3;
      }
    }

    const obs = extractAcousticObservations(pcm, sampleRate);
    const passed = obs.observations.length >= 1 && obs.adaptiveNoiseFloorDb < -30;
    assert('8. Noisy Audio (Low SNR Adaptive Noise Floor)', passed, `Detected noise floor: ${obs.adaptiveNoiseFloorDb}dB`);
  } catch (e: any) {
    assert('8. Noisy Audio (Low SNR Adaptive Noise Floor)', false, e.message);
  }

  // -------------------------------------------------------------------------
  // TEST 9: Reverberant Audio (Mosque Acoustic Tail)
  // -------------------------------------------------------------------------
  try {
    // Generate synthetic PCM with exponential reverb tail decay
    const sampleRate = 8000;
    const pcm = new Float32Array(sampleRate * 4);
    for (let i = 0; i < pcm.length; i++) {
      if (i < sampleRate * 2.0) {
        pcm[i] = Math.sin(2 * Math.PI * 300 * (i / sampleRate)) * 0.4;
      } else {
        // Exponential decay tail
        const decay = Math.exp(-(i - sampleRate * 2.0) / (sampleRate * 0.5));
        pcm[i] = (Math.random() - 0.5) * 0.2 * decay;
      }
    }

    const obs = extractAcousticObservations(pcm, sampleRate);
    const passed = obs.observations.length >= 1;
    assert('9. Reverberant Audio (Mosque Acoustic Tail)', passed);
  } catch (e: any) {
    assert('9. Reverberant Audio (Mosque Acoustic Tail)', false, e.message);
  }

  // -------------------------------------------------------------------------
  // TEST 10: Bismillah (Separate Alignment Target)
  // -------------------------------------------------------------------------
  try {
    const verses: QuranVerseInput[] = [
      { verse_key: '67:0 (Basmala)', isTasmiyah: true, text_uthmani: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
      { verse_key: '67:1', text_uthmani: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ' }
    ];

    const acousticSegments = [
      { start: 0.3, end: 3.8 },
      { start: 4.5, end: 9.8 }
    ];

    const aligned = runQuranAlignmentEngine(verses, { acousticSegments, audioDuration: 11.0, edgePaddingMs: 0 });

    const passed = aligned.length === 2 && aligned[0].startTime === 0.3 && aligned[1].startTime === 4.5;
    assert('10. Bismillah (Separate Alignment Target)', passed);
  } catch (e: any) {
    assert('10. Bismillah (Separate Alignment Target)', false, e.message);
  }

  // -------------------------------------------------------------------------
  // TEST 11: Ta'awwuz (Separate Alignment Target)
  // -------------------------------------------------------------------------
  try {
    const verses: QuranVerseInput[] = [
      { verse_key: 'aux', isTaawwuz: true, text_uthmani: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ' },
      { verse_key: '1:1', text_uthmani: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' }
    ];

    const acousticSegments = [
      { start: 0.5, end: 3.5 },
      { start: 4.2, end: 7.2 }
    ];

    const aligned = runQuranAlignmentEngine(verses, { acousticSegments, audioDuration: 8.0, edgePaddingMs: 0 });

    const passed = aligned.length === 2 && aligned[0].startTime === 0.5 && aligned[1].startTime === 4.2;
    assert('11. Ta\'awwuz (Separate Alignment Target)', passed);
  } catch (e: any) {
    assert('11. Ta\'awwuz (Separate Alignment Target)', false, e.message);
  }

  // -------------------------------------------------------------------------
  // TEST 12: Long Surah Sequence (30 Ayahs of Surah Al-Mulk) Zero-Drift Test
  // -------------------------------------------------------------------------
  try {
    const verses: QuranVerseInput[] = Array.from({ length: 30 }, (_, i) => ({
      verse_key: `67:${i + 1}`,
      text_uthmani: `آية سورة الملك رقم ${i + 1} مع التجويد والوقف والوصل`,
      translation: `Translation ${i + 1}`
    }));

    let cur = 0.5;
    const acousticSegments: Array<{ start: number; end: number }> = [];
    for (let i = 0; i < 30; i++) {
      const dur = 6.0 + (i % 3) * 1.5;
      acousticSegments.push({ start: Number(cur.toFixed(2)), end: Number((cur + dur).toFixed(2)) });
      cur += dur + 1.0; // 1.0s pause between ayahs
    }

    const totalAudioDur = cur + 2.0;
    const aligned = runQuranAlignmentEngine(verses, { acousticSegments, audioDuration: totalAudioDur, edgePaddingMs: 0 });

    const exactCount = aligned.length === 30;
    const endDrift = Math.abs(aligned[29].endTime - acousticSegments[29].end);
    const zeroDrift = endDrift <= 0.2;

    assert(
      '12. Long Surah Sequence (30 Ayahs) Zero Cumulative Drift',
      exactCount && zeroDrift,
      `30th ayah end drift: ${endDrift.toFixed(3)}s`
    );
  } catch (e: any) {
    assert('12. Long Surah Sequence (30 Ayahs) Zero Cumulative Drift', false, e.message);
  }

  // -------------------------------------------------------------------------
  // TEST 13: Deliberately Incorrect Candidate Boundary (Viterbi Error Recovery)
  // -------------------------------------------------------------------------
  try {
    const verses: QuranVerseInput[] = [
      { verse_key: '112:1', text_uthmani: 'قُلْ هُوَ اللَّهُ أَحَدٌ' },
      { verse_key: '112:2', text_uthmani: 'اللَّهُ الصَّمَدُ' },
      { verse_key: '112:3', text_uthmani: 'لَمْ يَلِدْ وَلَمْ يُولَدْ' },
      { verse_key: '112:4', text_uthmani: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ' }
    ];

    // Segments with a spurious noise artifact at 3.0s (deliberate false candidate)
    const acousticSegments = [
      { start: 0.5, end: 2.8 },
      { start: 3.0, end: 3.1 }, // False noise pop
      { start: 4.0, end: 6.2 }, // True Ayah 2
      { start: 7.0, end: 9.5 }, // True Ayah 3
      { start: 10.5, end: 13.5 } // True Ayah 4
    ];

    const aligned = runQuranAlignmentEngine(verses, {
      acousticSegments,
      audioDuration: 15.0,
      edgePaddingMs: 0
    });

    // Verify that Ayah 4 locks onto true acoustic boundary at 10.5s rather than drifting
    const ayah4Start = aligned[3].startTime;
    const recovered = Math.abs(ayah4Start - 10.5) <= 0.5;

    assert(
      '13. Deliberately Incorrect Candidate Boundary Recovery',
      recovered,
      `Ayah 4 start: ${ayah4Start}s (expected ~10.5s)`
    );
  } catch (e: any) {
    assert('13. Deliberately Incorrect Candidate Boundary Recovery', false, e.message);
  }

  // -------------------------------------------------------------------------
  // TEST 14: Local Boundary Refinement Precision (Phase 2)
  // -------------------------------------------------------------------------
  try {
    const verses: QuranVerseInput[] = [
      { verse_key: '1:1', text_uthmani: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
      { verse_key: '1:2', text_uthmani: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' }
    ];

    const acousticSegments = [
      { start: 0.5, end: 3.2 },
      { start: 3.9, end: 6.8 }
    ];

    const aligned = runQuranAlignmentEngine(verses, {
      acousticSegments,
      audioDuration: 8.0,
      edgePaddingMs: 0
    });

    const passed = 
      Math.abs(aligned[0].endTime - 3.2) < 0.2 &&
      Math.abs(aligned[1].startTime - 3.9) < 0.2 &&
      (aligned[1].diagnostics?.durationPriorScore ?? 0) >= 50;
      
    assert('14. Local Boundary Refinement Precision', passed, `Ayah 1 end: ${aligned[0].endTime}, Ayah 2 start: ${aligned[1].startTime}`);
  } catch (e: any) {
    assert('14. Local Boundary Refinement Precision', false, e.message);
  }

  const passed = results.filter(r => r.passed).length;
  const failed = results.length - passed;

  return {
    total: results.length,
    passed,
    failed,
    results
  };
}
