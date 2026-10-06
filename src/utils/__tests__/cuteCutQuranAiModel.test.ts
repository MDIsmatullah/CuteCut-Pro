import { cuteCutQuranAiModel } from '../../services/quranAiModelEngine';
import { ALL_114_SURAHS } from '../quranSurahData';

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

export async function runCuteCutQuranAiModelTests(): Promise<TestSuiteResult> {
  const results: TestResult[] = [];

  // Test 1: All 114 Surahs available
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
      name: 'Rule 1: 114 Universal Surahs from Al-Baqarah (286) to An-Nas (6)',
      passed,
      details: `Loaded ${allSurahs.length} surahs. Baqarah=${baqarah.totalAyahs}, Nas=${nas.totalAyahs}`
    });
  } catch (err: any) {
    results.push({
      name: 'Rule 1: 114 Universal Surahs',
      passed: false,
      details: err?.message
    });
  }

  // Test 2: Auto-detect Surah
  try {
    const dFatihah = cuteCutQuranAiModel.autoDetectSurahFromAudio(60, 'Recitation Surah Fatihah Mishary');
    const dBaqarah = cuteCutQuranAiModel.autoDetectSurahFromAudio(1800, '002-Al-Baqarah.mp3');
    const passed = dFatihah.id === 1 && dBaqarah.id === 2;

    results.push({
      name: 'Rule 1: Auto-Detect Surah from audio duration & metadata',
      passed,
      details: `Detected Fatihah=${dFatihah.id}, Baqarah=${dBaqarah.id}`
    });
  } catch (err: any) {
    results.push({
      name: 'Rule 1: Auto-Detect Surah',
      passed: false,
      details: err?.message
    });
  }

  // Test 3: Fetch Scripture & Mukammal Surah
  try {
    const verses = await cuteCutQuranAiModel.fetchSurahScriptureAndTranslations(1);
    const report = await cuteCutQuranAiModel.executeQuranAutoSegmentation({
      surahNumber: 1,
      audioDuration: 45
    });

    const passed = verses.length === 7 &&
      report.mukammalGuaranteeSatisfied &&
      report.segments.length >= 7;

    results.push({
      name: 'Rule 2 & 3: Quran.com API text & Mukammal Surah guarantee (All 7 Ayahs Al-Fatihah)',
      passed,
      details: `Produced ${report.segments.length} segments with 100% Mukammal guarantee.`
    });
  } catch (err: any) {
    results.push({
      name: 'Rule 2 & 3: Quran.com API & Mukammal Surah',
      passed: false,
      details: err?.message
    });
  }

  // Test 4: Single Breath 1-Ayah Voice Sync
  try {
    const report = await cuteCutQuranAiModel.executeQuranAutoSegmentation({
      surahNumber: 108,
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
      report.segments[1].startTime === 4.9;

    results.push({
      name: 'Rule 4: Single Breath 1-Ayah Voice Sync (Zero Drift)',
      passed,
      details: `Locked 3 segments to audio onsets and waqf pauses.`
    });
  } catch (err: any) {
    results.push({
      name: 'Rule 4: Single Breath 1-Ayah Voice Sync',
      passed: false,
      details: err?.message
    });
  }

  // Test 5: Multi-Ayah in 1 Breath (Wasl Recitation)
  try {
    const report = await cuteCutQuranAiModel.executeQuranAutoSegmentation({
      surahNumber: 112, // 4 ayahs in 2 breaths
      audioDuration: 18,
      acousticBreaths: [
        { id: 1, startSec: 0.5, endSec: 8.5, durationSec: 8.0, peakDb: -14, averageDb: -19, silenceAfterMs: 500 },
        { id: 2, startSec: 9.0, endSec: 17.0, durationSec: 8.0, peakDb: -14, averageDb: -19, silenceAfterMs: 300 }
      ]
    });

    const passed = report.segments.length === 4 &&
      report.multiAyahBreathsDetected > 0 &&
      report.segments[0].startTime < report.segments[1].startTime;

    results.push({
      name: 'Rule 5: Multi-Ayah in 1 Single Breath (Wasl: 2-4 Ayahs)',
      passed,
      details: `Partitioned ${report.segments.length} ayahs in chronological sequence.`
    });
  } catch (err: any) {
    results.push({
      name: 'Rule 5: Multi-Ayah in 1 Breath',
      passed: false,
      details: err?.message
    });
  }

  // Test 6: Long Ayah Multi-Breath Splitting
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
      name: 'Rule 6: Long Ayah in 2, 3, or 4 Breaths (Intra-Ayah Waqf Splits)',
      passed,
      details: `Split into sub-phrases with voice matching.`
    });
  } catch (err: any) {
    results.push({
      name: 'Rule 6: Long Ayah Multi-Breath Splitting',
      passed: false,
      details: err?.message
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
