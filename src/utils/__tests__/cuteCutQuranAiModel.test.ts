import { cuteCutQuranAiModel } from '../../services/quranAiModelEngine';
import { ALL_114_SURAHS } from '../quranSurahData';

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

export async function runCuteCutQuranAiModelTests(): Promise<SuiteResult> {
  const results: TestResult[] = [];

  // Test 1: All 114 Surahs
  try {
    const allSurahs = cuteCutQuranAiModel.getAllSurahs();
    const fatihah = cuteCutQuranAiModel.getSurah(1);
    const baqarah = cuteCutQuranAiModel.getSurah(2);
    const nas = cuteCutQuranAiModel.getSurah(114);

    const passed = allSurahs.length === 114 &&
      fatihah.totalAyahs === 7 &&
      baqarah.totalAyahs === 286 &&
      nas.totalAyahs === 6;

    results.push({
      name: 'Rule 1: Should provide all 114 Surahs from Surah Al-Baqarah (286 ayahs) to Surah An-Nas (6 ayahs)',
      passed,
      details: passed ? 'All 114 Surahs metadata verified.' : `Surah counts mismatch.`
    });
  } catch (err: any) {
    results.push({
      name: 'Rule 1: Should provide all 114 Surahs',
      passed: false,
      details: err.message
    });
  }

  // Test 2: Auto-detect Surah
  try {
    const detectedFatihah = cuteCutQuranAiModel.autoDetectSurahFromAudio(60, 'Recitation Surah Fatihah Mishary');
    const detectedBaqarah = cuteCutQuranAiModel.autoDetectSurahFromAudio(1800, '002-Al-Baqarah.mp3');
    const detectedShort = cuteCutQuranAiModel.autoDetectSurahFromAudio(25);

    const passed = detectedFatihah.id === 1 &&
      detectedBaqarah.id === 2 &&
      [108, 112, 114].includes(detectedShort.id);

    results.push({
      name: 'Rule 1: Should auto-detect Surah from audio duration and name hints',
      passed,
      details: passed ? 'Auto-detection heuristics passed.' : 'Auto-detection failed.'
    });
  } catch (err: any) {
    results.push({
      name: 'Rule 1: Should auto-detect Surah',
      passed: false,
      details: err.message
    });
  }

  // Test 3: Rule 2 & 3 Mukammal Surah
  try {
    const verses = await cuteCutQuranAiModel.fetchSurahScriptureAndTranslations(1);
    const report = await cuteCutQuranAiModel.executeQuranAutoSegmentation({
      surahNumber: 1,
      audioDuration: 45
    });

    const passed = verses.length === 7 &&
      report.mukammalGuaranteeSatisfied &&
      report.totalVersesExpected === 7 &&
      report.segments.length >= 7;

    results.push({
      name: 'Rule 2 & 3: Should fetch scripture & translations and enforce Mukammal Surah guarantee',
      passed,
      details: passed ? 'Surah Al-Fatihah 7 ayahs fully compiled.' : 'Mukammal guarantee not satisfied.'
    });
  } catch (err: any) {
    results.push({
      name: 'Rule 2 & 3: Mukammal Surah guarantee',
      passed: false,
      details: err.message
    });
  }

  // Test 4: Rule 4 Single Breath 1 Ayah
  try {
    const report = await cuteCutQuranAiModel.executeQuranAutoSegmentation({
      surahNumber: 108, // Surah Al-Kawthar (3 ayahs)
      audioDuration: 18,
      acousticBreaths: [
        { id: 1, startSec: 0.2, endSec: 4.5, durationSec: 4.3, peakDb: -15, averageDb: -20, silenceAfterMs: 400 },
        { id: 2, startSec: 4.9, endSec: 9.8, durationSec: 4.9, peakDb: -15, averageDb: -20, silenceAfterMs: 400 },
        { id: 3, startSec: 10.2, endSec: 16.0, durationSec: 5.8, peakDb: -15, averageDb: -20, silenceAfterMs: 300 }
      ]
    });

    const passed = report.segments.length === 3 &&
      report.segments[0].startTime === 0.2 &&
      report.segments[0].endTime === 4.5 &&
      report.segments[1].startTime === 4.9 &&
      report.segments[2].startTime === 10.2;

    results.push({
      name: 'Rule 4: Single Breath 1-Ayah voice sync should lock onset and offset with zero drift',
      passed,
      details: passed ? 'Audio breath onsets locked with zero drift.' : 'Timing drift detected.'
    });
  } catch (err: any) {
    results.push({
      name: 'Rule 4: Single Breath 1-Ayah voice sync',
      passed: false,
      details: err.message
    });
  }

  // Test 5: Rule 5 Multi-Ayah Wasl in 1 Breath
  try {
    const report = await cuteCutQuranAiModel.executeQuranAutoSegmentation({
      surahNumber: 112, // Al-Ikhlas (4 ayahs)
      audioDuration: 18,
      acousticBreaths: [
        { id: 1, startSec: 0.5, endSec: 8.5, durationSec: 8.0, peakDb: -14, averageDb: -19, silenceAfterMs: 500 },
        { id: 2, startSec: 9.0, endSec: 17.0, durationSec: 8.0, peakDb: -14, averageDb: -19, silenceAfterMs: 300 }
      ]
    });

    const passed = report.mukammalGuaranteeSatisfied &&
      report.segments.length === 4 &&
      report.multiAyahBreathsDetected > 0;

    results.push({
      name: 'Rule 5: Multi-Ayah in 1 Single Breath (Wasl: 2, 3, or 4 Ayahs in 1 Breath) should partition sequentially',
      passed,
      details: passed ? 'Wasl single-breath partitioned all 4 ayahs sequentially.' : 'Wasl partitioning failed.'
    });
  } catch (err: any) {
    results.push({
      name: 'Rule 5: Multi-Ayah in 1 Single Breath',
      passed: false,
      details: err.message
    });
  }

  // Test 6: Rule 6 Long Ayah Multi-Breath Intra-Ayah Splits
  try {
    const report = await cuteCutQuranAiModel.executeQuranAutoSegmentation({
      surahNumber: 108,
      audioDuration: 30,
      acousticBreaths: [
        { id: 1, startSec: 0.5, endSec: 4.0, durationSec: 3.5, peakDb: -14, averageDb: -20, silenceAfterMs: 400 },
        { id: 2, startSec: 4.4, endSec: 8.5, durationSec: 4.1, peakDb: -14, averageDb: -20, silenceAfterMs: 400 },
        { id: 3, startSec: 8.9, endSec: 13.0, durationSec: 4.1, peakDb: -14, averageDb: -20, silenceAfterMs: 400 },
        { id: 4, startSec: 13.4, endSec: 18.0, durationSec: 4.6, peakDb: -14, averageDb: -20, silenceAfterMs: 400 },
        { id: 5, startSec: 18.4, endSec: 23.0, durationSec: 4.6, peakDb: -14, averageDb: -20, silenceAfterMs: 400 },
        { id: 6, startSec: 23.4, endSec: 28.5, durationSec: 5.1, peakDb: -14, averageDb: -20, silenceAfterMs: 300 }
      ]
    });

    const passed = report.longAyahBreathsSplitCount > 0 &&
      report.segments.length === 6 &&
      report.segments.some(s => s.isSubPhrase);

    results.push({
      name: 'Rule 6: Long Ayah in 2, 3, or 4 Breaths (Intra-Ayah Waqf Splits) should divide into sub-phrases',
      passed,
      details: passed ? 'Intra-ayah waqf sub-phrases generated.' : 'Long ayah split failed.'
    });
  } catch (err: any) {
    results.push({
      name: 'Rule 6: Long Ayah in 2, 3, or 4 Breaths',
      passed: false,
      details: err.message
    });
  }

  return {
    total: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    results
  };
}
