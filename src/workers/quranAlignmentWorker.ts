/**
 * Quran Alignment Background Web Worker
 * 
 * Executes CTC forced alignment, VAD silence detection, Levenshtein zero-drift matching,
 * and Waqf classification off the main UI thread.
 */

import {
  runQuranAlignmentEngine,
  QuranVerseInput,
  QuranAlignmentEngineOptions,
  QuranAlignmentSegment
} from '../utils/quranAlignmentEngine';

export interface AlignmentWorkerRequest {
  id?: string;
  type: 'ALIGN_QURAN';
  verses: QuranVerseInput[];
  options?: QuranAlignmentEngineOptions;
}

export interface AlignmentWorkerResponse {
  id?: string;
  type: 'ALIGNMENT_COMPLETE' | 'ALIGNMENT_ERROR';
  segments?: QuranAlignmentSegment[];
  error?: string;
  durationMs?: number;
}

self.onmessage = (event: MessageEvent<AlignmentWorkerRequest>) => {
  const { id, type, verses, options } = event.data;

  if (type === 'ALIGN_QURAN') {
    const startTime = performance.now();
    try {
      const segments = runQuranAlignmentEngine(verses, options);
      const durationMs = performance.now() - startTime;

      const response: AlignmentWorkerResponse = {
        id,
        type: 'ALIGNMENT_COMPLETE',
        segments,
        durationMs
      };
      self.postMessage(response);
    } catch (err: any) {
      const response: AlignmentWorkerResponse = {
        id,
        type: 'ALIGNMENT_ERROR',
        error: err?.message || 'Unknown alignment worker error',
        durationMs: performance.now() - startTime
      };
      self.postMessage(response);
    }
  }
};
