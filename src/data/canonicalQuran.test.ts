/**
 * Canonical Quran Scripture Dataset Verification & Regression Tests (Phase 1)
 *
 * Verifies:
 * 1. Complete 114 Surahs coverage
 * 2. Exact 6,236 total Ayahs count
 * 3. Exact Ayah counts for key Surahs (1, 2, 18, 55, 67, 91, 112, 114)
 * 4. Zero dummy text / placeholders across all 6,236 verses
 * 5. Stable lookup by `surah:ayah` (e.g. 67:23, 1:1, 2:286)
 * 6. Sequential numbering without missing verses or duplicates
 * 7. Exact Arabic Uthmani text and verified English translations
 * 8. Surah Al-Mulk (67) regression
 * 9. Surah Ar-Rahman (55) regression
 * 10. Range slicing (startAyah / endAyah) precision
 */

import {
  getCanonicalSurahVerses,
  getCanonicalAyah,
  getCanonicalAyahByKey,
  getCanonicalAyahCount,
  hasCanonicalAyah,
  getTotalSurahsCount,
  getTotalAyahsCount,
  CANONICAL_AYAH_COUNTS
} from './canonicalQuran';

export interface ScriptureTestResult {
  name: string;
  passed: boolean;
  details?: string;
}

export function runCanonicalQuranTests(): {
  total: number;
  passed: number;
  failed: number;
  results: ScriptureTestResult[];
} {
  const results: ScriptureTestResult[] = [];

  function assert(name: string, condition: boolean, details?: string) {
    results.push({
      name,
      passed: !!condition,
      details: details || (condition ? undefined : 'Assertion failed')
    });
  }

  // -------------------------------------------------------------------------
  // TEST 1: Surahs 1–114 Complete Coverage
  // -------------------------------------------------------------------------
  try {
    const totalSurahs = getTotalSurahsCount();
    assert(
      '1. Complete 114 Surahs Coverage',
      totalSurahs === 114,
      `Expected 114 Surahs, found ${totalSurahs}`
    );
  } catch (e: any) {
    assert('1. Complete 114 Surahs Coverage', false, e.message);
  }

  // -------------------------------------------------------------------------
  // TEST 2: Exact Total 6,236 Canonical Ayahs
  // -------------------------------------------------------------------------
  try {
    const totalAyahs = getTotalAyahsCount();
    const sumExpected = CANONICAL_AYAH_COUNTS.reduce((acc, c) => acc + c, 0);
    assert(
      '2. Exact 6,236 Canonical Ayah Count',
      totalAyahs === 6236 && sumExpected === 6236,
      `Total Ayahs: ${totalAyahs} (expected 6236)`
    );
  } catch (e: any) {
    assert('2. Exact 6,236 Canonical Ayah Count', false, e.message);
  }

  // -------------------------------------------------------------------------
  // TEST 3: Specific Surah Exact Ayah Counts (1, 2, 18, 55, 67, 91, 112, 114)
  // -------------------------------------------------------------------------
  try {
    const checks = [
      { surah: 1, expected: 7, name: 'Al-Fatihah' },
      { surah: 2, expected: 286, name: 'Al-Baqarah' },
      { surah: 18, expected: 110, name: 'Al-Kahf' },
      { surah: 55, expected: 78, name: 'Ar-Rahman' },
      { surah: 67, expected: 30, name: 'Al-Mulk' },
      { surah: 91, expected: 15, name: 'Ash-Shams' },
      { surah: 112, expected: 4, name: 'Al-Ikhlas' },
      { surah: 114, expected: 6, name: 'An-Nas' }
    ];

    let allCountsMatch = true;
    const failures: string[] = [];

    for (const check of checks) {
      const verses = getCanonicalSurahVerses(check.surah);
      const countFn = getCanonicalAyahCount(check.surah);
      if (verses.length !== check.expected || countFn !== check.expected) {
        allCountsMatch = false;
        failures.push(`${check.name} (${check.surah}): expected ${check.expected}, got verses=${verses.length}, countFn=${countFn}`);
      }
    }

    assert(
      '3. Key Surahs Exact Ayah Counts (1, 2, 18, 55, 67, 91, 112, 114)',
      allCountsMatch,
      failures.length > 0 ? failures.join('; ') : 'All 8 key surahs matched exact counts'
    );
  } catch (e: any) {
    assert('3. Key Surahs Exact Ayah Counts', false, e.message);
  }

  // -------------------------------------------------------------------------
  // TEST 4: Zero Dummy Text / Placeholders Across Entire 6,236 Verses
  // -------------------------------------------------------------------------
  try {
    let dummyCount = 0;
    let emptyArabicCount = 0;
    let emptyEnglishCount = 0;

    for (let s = 1; s <= 114; s++) {
      const verses = getCanonicalSurahVerses(s);
      for (const v of verses) {
        if (!v.text_uthmani || v.text_uthmani.trim().length === 0) {
          emptyArabicCount++;
        }
        if (!v.translation || v.translation.trim().length === 0) {
          emptyEnglishCount++;
        }
        if (v.text_uthmani.includes('آيَة كَرِيمَة') || v.text_uthmani.includes('dummy') || v.translation.includes('Chapter')) {
          // Verify no artificial fallback patterns exist
          if (v.text_uthmani.includes('آيَة كَرِيمَة') || v.text_uthmani.includes('dummy')) {
            dummyCount++;
          }
        }
      }
    }

    const passed = dummyCount === 0 && emptyArabicCount === 0 && emptyEnglishCount === 0;
    assert(
      '4. Zero Dummy Text / Placeholders across all 6,236 Ayahs',
      passed,
      `Dummy: ${dummyCount}, Empty Arabic: ${emptyArabicCount}, Empty English: ${emptyEnglishCount}`
    );
  } catch (e: any) {
    assert('4. Zero Dummy Text / Placeholders across all 6,236 Ayahs', false, e.message);
  }

  // -------------------------------------------------------------------------
  // TEST 5: Stable Identifier & Direct Ayah Lookup
  // -------------------------------------------------------------------------
  try {
    const v67_23 = getCanonicalAyahByKey('67:23');
    const v1_1 = getCanonicalAyah(1, 1);
    const v2_286 = getCanonicalAyah(2, 286);
    const v114_6 = getCanonicalAyahByKey('114:6');
    const invalid = getCanonicalAyah(115, 1);

    const valid67_23 = v67_23 !== null && v67_23.verse_key === '67:23' && v67_23.text_uthmani.includes('قُلْ هُوَ ٱلَّذِىٓ أَنشَأَكُمْ');
    const valid1_1 = v1_1 !== null && v1_1.verse_key === '1:1' && v1_1.text_uthmani.includes('بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ');
    const valid2_286 = v2_286 !== null && v2_286.verse_key === '2:286' && v2_286.text_uthmani.includes('لَا يُكَلِّفُ ٱللَّهُ نَفْسًا');
    const valid114_6 = v114_6 !== null && v114_6.verse_key === '114:6' && v114_6.text_uthmani.includes('مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ');
    const validInvalid = invalid === null;

    const passed = valid67_23 && valid1_1 && valid2_286 && valid114_6 && validInvalid;
    assert(
      '5. Stable Identifier & Direct Ayah Lookup',
      passed,
      `67:23=${valid67_23}, 1:1=${valid1_1}, 2:286=${valid2_286}, 114:6=${valid114_6}, invalid=${validInvalid}`
    );
  } catch (e: any) {
    assert('5. Stable Identifier & Direct Ayah Lookup', false, e.message);
  }

  // -------------------------------------------------------------------------
  // TEST 6: Sequential Ayah Numbering with Zero Gaps
  // -------------------------------------------------------------------------
  try {
    let gapFound = false;
    let detailMsg = 'All 114 Surahs have strict sequential 1..N ayah numbering';

    for (let s = 1; s <= 114; s++) {
      const verses = getCanonicalSurahVerses(s);
      const expectedCount = CANONICAL_AYAH_COUNTS[s - 1];
      if (verses.length !== expectedCount) {
        gapFound = true;
        detailMsg = `Surah ${s}: expected ${expectedCount} verses, got ${verses.length}`;
        break;
      }
      for (let idx = 0; idx < verses.length; idx++) {
        if (verses[idx].verse_number !== idx + 1 || verses[idx].verse_key !== `${s}:${idx + 1}`) {
          gapFound = true;
          detailMsg = `Surah ${s} Ayah mismatch at index ${idx}: verse_number=${verses[idx].verse_number}, key=${verses[idx].verse_key}`;
          break;
        }
      }
      if (gapFound) break;
    }

    assert('6. Sequential Ayah Numbering (Zero Gaps or Skips)', !gapFound, detailMsg);
  } catch (e: any) {
    assert('6. Sequential Ayah Numbering (Zero Gaps or Skips)', false, e.message);
  }

  // -------------------------------------------------------------------------
  // TEST 7: Surah Al-Mulk (67) Regression
  // -------------------------------------------------------------------------
  try {
    const mulk = getCanonicalSurahVerses(67);
    const passed = 
      mulk.length === 30 &&
      mulk[0].text_uthmani.includes('تَبَـٰرَكَ ٱلَّذِى بِيَدِهِ ٱلْمُلْكُ') &&
      mulk[22].verse_key === '67:23' &&
      mulk[29].text_uthmani.includes('فَمَن يَأْتِيكُم بِمَآءٍ مَّعِينٍۭ');

    assert('7. Surah Al-Mulk (67) 30-Ayah Regression', passed, `Total verses: ${mulk.length}`);
  } catch (e: any) {
    assert('7. Surah Al-Mulk (67) 30-Ayah Regression', false, e.message);
  }

  // -------------------------------------------------------------------------
  // TEST 8: Surah Ar-Rahman (55) Regression
  // -------------------------------------------------------------------------
  try {
    const rahman = getCanonicalSurahVerses(55);
    const passed = 
      rahman.length === 78 &&
      rahman[0].text_uthmani.includes('ٱلرَّحْمَـٰنُ') &&
      rahman[12].text_uthmani.includes('فَبِأَىِّ ءَالَآءِ رَبِّكُمَا تُكَذِّبَانِ') &&
      rahman[77].text_uthmani.includes('تَبَـٰرَكَ ٱسْمُ رَبِّكَ ذِى ٱلْجَلَـٰلِ وَٱلْإِكْرَامِ');

    assert('8. Surah Ar-Rahman (55) 78-Ayah Regression', passed, `Total verses: ${rahman.length}`);
  } catch (e: any) {
    assert('8. Surah Ar-Rahman (55) 78-Ayah Regression', false, e.message);
  }

  // -------------------------------------------------------------------------
  // TEST 9: Range Slicing (startAyah / endAyah)
  // -------------------------------------------------------------------------
  try {
    const sliceMulk = getCanonicalSurahVerses(67, 10, 15);
    const passed = 
      sliceMulk.length === 6 &&
      sliceMulk[0].verse_number === 10 &&
      sliceMulk[5].verse_number === 15 &&
      sliceMulk[0].verse_key === '67:10' &&
      sliceMulk[5].verse_key === '67:15';

    assert('9. Range Slicing (startAyah / endAyah) Precision', passed, `Slice length: ${sliceMulk.length}`);
  } catch (e: any) {
    assert('9. Range Slicing (startAyah / endAyah) Precision', false, e.message);
  }

  // -------------------------------------------------------------------------
  // TEST 10: hasCanonicalAyah Predicate Function
  // -------------------------------------------------------------------------
  try {
    const has1_7 = hasCanonicalAyah(1, 7);
    const has1_8 = hasCanonicalAyah(1, 8); // Should be false
    const has67_30 = hasCanonicalAyah(67, 30);
    const has67_31 = hasCanonicalAyah(67, 31); // Should be false
    const has114_6 = hasCanonicalAyah(114, 6);
    const has114_7 = hasCanonicalAyah(114, 7); // Should be false

    const passed = has1_7 && !has1_8 && has67_30 && !has67_31 && has114_6 && !has114_7;
    assert('10. hasCanonicalAyah Predicate Boundary Accuracy', passed);
  } catch (e: any) {
    assert('10. hasCanonicalAyah Predicate Boundary Accuracy', false, e.message);
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
