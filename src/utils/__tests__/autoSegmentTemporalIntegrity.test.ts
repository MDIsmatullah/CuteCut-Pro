import { Clip, ClipType } from '../../types';
import {
  autoSegmentAudioClipsBySilence,
  autoSyncVideoClipsToAyahs,
  autoSegmentClipByRhythm,
  fitAcousticSegmentsToVerses,
  splitVerseAcrossBreaths,
  enforceStrictNonOverlappingClips
} from '../editorUtils';
import { enforceGlobalTimelineConsistency, QuranAlignmentSegment } from '../quranAlignmentEngine';

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

export function runAutoSegmentTemporalIntegrityTests(): TestSuiteResult {
  const results: TestResult[] = [];

  function assert(name: string, condition: boolean, details?: string) {
    results.push({
      name,
      passed: condition,
      details: condition ? details : `ASSERTION FAILED: ${details || ''}`
    });
  }

  // 1. Check strict non-overlap & positive duration on chaotic overlapping input clips
  {
    const chaoticClips: Clip[] = [
      {
        id: 'c1',
        name: 'Clip 1',
        type: ClipType.AUDIO,
        trackId: 'track-1',
        start: 0,
        duration: 3.5,
        sourceStart: 0,
        sourceDuration: 3.5,
        playbackRate: 1.0,
        volume: 1.0,
      },
      {
        id: 'c2',
        name: 'Clip 2 (Overlaps c1)',
        type: ClipType.AUDIO,
        trackId: 'track-1',
        start: 2.0, // Overlap!
        duration: 2.0,
        sourceStart: 2.0,
        sourceDuration: 2.0,
        playbackRate: 1.0,
        volume: 1.0,
      },
      {
        id: 'c3',
        name: 'Clip 3 (Negative/Zero duration)',
        type: ClipType.AUDIO,
        trackId: 'track-1',
        start: 3.0,
        duration: -1.0, // Negative duration!
        sourceStart: 3.0,
        sourceDuration: 1.0,
        playbackRate: 1.0,
        volume: 1.0,
      },
      {
        id: 'c4',
        name: 'Clip 4 (Backwards Start)',
        type: ClipType.AUDIO,
        trackId: 'track-1',
        start: 1.5, // Out of order!
        duration: 1.0,
        sourceStart: 1.5,
        sourceDuration: 1.0,
        playbackRate: 1.0,
        volume: 1.0,
      }
    ];

    const sanitized = enforceStrictNonOverlappingClips(chaoticClips, 0.1);

    let hasOverlap = false;
    let hasNegativeDuration = false;
    let hasCollision = false;

    for (let i = 0; i < sanitized.length; i++) {
      if (sanitized[i].duration <= 0) hasNegativeDuration = true;
      if (sanitized[i].start < 0) hasCollision = true;
      if (i > 0) {
        const prevEnd = sanitized[i - 1].start + sanitized[i - 1].duration;
        if (sanitized[i].start < prevEnd - 0.001) hasOverlap = true;
      }
    }

    assert(
      'enforceStrictNonOverlappingClips: Resolves overlaps, negative durations & ordering',
      !hasOverlap && !hasNegativeDuration && !hasCollision,
      `Clips count: ${sanitized.length}, Overlap: ${hasOverlap}, Negative: ${hasNegativeDuration}, Collision: ${hasCollision}`
    );
  }

  // 2. Test autoSegmentAudioClipsBySilence with overlapping & zero-length speech segments
  {
    const baseClip: Clip = {
      id: 'source-audio-1',
      name: 'Surah Al-Mulk Recitation',
      type: ClipType.AUDIO,
      trackId: 'track-audio',
      start: 0,
      duration: 30.0,
      sourceStart: 0,
      sourceDuration: 30.0,
      playbackRate: 1.0,
      volume: 1.0,
    };

    const speechSegments = [
      { start: 0.5, end: 4.2 },
      { start: 3.8, end: 7.0 }, // Overlaps segment 1
      { start: 8.0, end: 8.0 }, // Zero duration
      { start: 9.0, end: 14.5 },
      { start: 16.0, end: 22.0 },
    ];

    const segmented = autoSegmentAudioClipsBySilence(baseClip, speechSegments, {
      gapHandling: 'label-pauses',
      includePauses: true,
      isQuranAudio: true,
      startAyahNumber: 1
    });

    let hasOverlap = false;
    let hasNegativeDuration = false;
    let hasCollision = false;

    for (let i = 0; i < segmented.length; i++) {
      if (segmented[i].duration <= 0) hasNegativeDuration = true;
      if (segmented[i].start < 0) hasCollision = true;
      if (i > 0) {
        const prevEnd = segmented[i - 1].start + segmented[i - 1].duration;
        if (segmented[i].start < prevEnd - 0.001) hasOverlap = true;
      }
    }

    assert(
      'autoSegmentAudioClipsBySilence: Zero overlap, no negative duration, no collisions',
      !hasOverlap && !hasNegativeDuration && !hasCollision && segmented.length > 0,
      `Produced ${segmented.length} clips with strict sequential temporal integrity`
    );
  }

  // 3. Test autoSyncVideoClipsToAyahs
  {
    const baseVideo: Clip = {
      id: 'vid-1',
      name: 'Background Nature',
      type: ClipType.VIDEO,
      trackId: 'track-video',
      start: 0,
      duration: 30.0,
      sourceStart: 0,
      sourceDuration: 30.0,
      playbackRate: 1.0,
      volume: 1.0,
    };

    const captions: Clip[] = [
      {
        id: 'cap-1',
        name: 'AR: 67:1',
        type: ClipType.TEXT,
        trackId: 'track-text',
        start: 0.5,
        duration: 4.5,
        sourceStart: 0,
        sourceDuration: 4.5,
        playbackRate: 1.0,
        volume: 1.0,
      },
      {
        id: 'cap-2',
        name: 'AR: 67:2',
        type: ClipType.TEXT,
        trackId: 'track-text',
        start: 5.2,
        duration: 6.0,
        sourceStart: 0,
        sourceDuration: 6.0,
        playbackRate: 1.0,
        volume: 1.0,
      },
      {
        id: 'cap-3',
        name: 'AR: 67:3',
        type: ClipType.TEXT,
        trackId: 'track-text',
        start: 11.5,
        duration: 5.0,
        sourceStart: 0,
        sourceDuration: 5.0,
        playbackRate: 1.0,
        volume: 1.0,
      }
    ];

    const videoClips = autoSyncVideoClipsToAyahs([baseVideo], captions);

    let hasOverlap = false;
    let hasNegativeDuration = false;

    for (let i = 0; i < videoClips.length; i++) {
      if (videoClips[i].duration <= 0) hasNegativeDuration = true;
      if (i > 0) {
        const prevEnd = videoClips[i - 1].start + videoClips[i - 1].duration;
        if (videoClips[i].start < prevEnd - 0.001) hasOverlap = true;
      }
    }

    assert(
      'autoSyncVideoClipsToAyahs: Seamless non-overlapping video clips with positive durations',
      !hasOverlap && !hasNegativeDuration && videoClips.length === 3,
      `Video clips count: ${videoClips.length}`
    );
  }

  // 4. Test autoSegmentClipByRhythm
  {
    const audioClip: Clip = {
      id: 'beat-audio',
      name: 'Rhythm Track',
      type: ClipType.AUDIO,
      trackId: 'track-audio',
      start: 0,
      duration: 10.0,
      sourceStart: 0,
      sourceDuration: 10.0,
      playbackRate: 1.0,
      volume: 1.0,
    };

    const rhythmClips = autoSegmentClipByRhythm(audioClip, 2.5);

    let hasOverlap = false;
    let hasNegativeDuration = false;

    for (let i = 0; i < rhythmClips.length; i++) {
      if (rhythmClips[i].duration <= 0) hasNegativeDuration = true;
      if (i > 0) {
        const prevEnd = rhythmClips[i - 1].start + rhythmClips[i - 1].duration;
        if (rhythmClips[i].start < prevEnd - 0.001) hasOverlap = true;
      }
    }

    assert(
      'autoSegmentClipByRhythm: Exact non-overlapping beat cuts with positive durations',
      !hasOverlap && !hasNegativeDuration && rhythmClips.length === 4,
      `Rhythm clips count: ${rhythmClips.length}`
    );
  }

  // 5. Test fitAcousticSegmentsToVerses
  {
    const chaoticAcoustic = [
      { start: 0.2, end: 2.0 },
      { start: 1.9, end: 4.5 },
      { start: 5.0, end: 8.2 },
      { start: 8.0, end: 12.0 }
    ];

    const fitted = fitAcousticSegmentsToVerses(chaoticAcoustic, 6);

    let hasOverlap = false;
    let hasNegativeDuration = false;

    for (let i = 0; i < fitted.length; i++) {
      if (fitted[i].end <= fitted[i].start) hasNegativeDuration = true;
      if (i > 0 && fitted[i].start < fitted[i - 1].end) hasOverlap = true;
    }

    assert(
      'fitAcousticSegmentsToVerses: Strict monotonic non-overlapping segments for target verse count',
      !hasOverlap && !hasNegativeDuration && fitted.length === 6,
      `Fitted ${fitted.length} segments without collisions`
    );
  }

  // 6. Test splitVerseAcrossBreaths
  {
    const verse = {
      verse_key: '67:1',
      text_arabic: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
      text_english: 'Blessed is He in whose hand is dominion, and He is over all things competent'
    };

    const breaths = [
      { start: 0.5, end: 2.5 },
      { start: 2.4, end: 5.0 }, // Overlaps breath 0
      { start: 5.2, end: 7.8 }
    ];

    const subVerses = splitVerseAcrossBreaths(verse, breaths, {
      showAyahSymbol: true,
      ayahSymbolStyle: 'uthmani-circle',
      ayahDigitType: 'arabic',
      ayahSymbolPosition: 'end'
    });

    let hasOverlap = false;
    let hasNegativeDuration = false;

    for (let i = 0; i < subVerses.length; i++) {
      if (subVerses[i].end <= subVerses[i].start) hasNegativeDuration = true;
      if (i > 0 && subVerses[i].start < subVerses[i - 1].end) hasOverlap = true;
    }

    assert(
      'splitVerseAcrossBreaths: Sub-phrase breath clips with zero overlap and positive durations',
      !hasOverlap && !hasNegativeDuration && subVerses.length === 3,
      `Sub-verses count: ${subVerses.length}`
    );
  }

  // 7. Test enforceGlobalTimelineConsistency
  {
    const rawSegs: QuranAlignmentSegment[] = [
      {
        ayahIndex: 1,
        wordIndex: 1,
        isWaqfPause: false,
        confidenceScore: 95,
        verse_key: '67:1',
        startTime: 0.5,
        endTime: 4.2
      },
      {
        ayahIndex: 2,
        wordIndex: 1,
        isWaqfPause: false,
        confidenceScore: 92,
        verse_key: '67:2',
        startTime: 4.0, // Overlaps seg 1!
        endTime: 8.5
      },
      {
        ayahIndex: 3,
        wordIndex: 1,
        isWaqfPause: false,
        confidenceScore: 88,
        verse_key: '67:3',
        startTime: 8.0, // Overlaps seg 2!
        endTime: 7.5 // Negative duration!
      }
    ];

    const consistent = enforceGlobalTimelineConsistency(rawSegs, 100, 20.0);

    let hasOverlap = false;
    let hasNegativeDuration = false;

    for (let i = 0; i < consistent.length; i++) {
      if (consistent[i].endTime <= consistent[i].startTime) hasNegativeDuration = true;
      if (i > 0 && consistent[i].startTime < consistent[i - 1].endTime) hasOverlap = true;
    }

    assert(
      'enforceGlobalTimelineConsistency: Strict mathematical guarantee of zero overlap and positive duration',
      !hasOverlap && !hasNegativeDuration && consistent.length === 3,
      `Cleaned ${consistent.length} alignment segments`
    );
  }

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  return {
    total: results.length,
    passed,
    failed,
    results
  };
}
