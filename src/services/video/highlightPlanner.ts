import { QuranWordAlignment } from '../../types/quranAlignment';
import { HighlightMode } from '../../types/video';

export interface WordHighlight {
  wordIndex: number;
  startTime: number;
  endTime: number;
  text: string;
}

export class HighlightPlanner {
  /**
   * Generates a sequence of highlights for a scene based on the mode.
   */
  static planHighlights(
    words: QuranWordAlignment[],
    mode: HighlightMode,
    sceneStartTime: number,
    sceneEndTime: number
  ): WordHighlight[] {
    if (mode.type === 'static') return [];

    if (mode.type === 'ayah') {
      return [{
        wordIndex: -1,
        startTime: sceneStartTime,
        endTime: sceneEndTime,
        text: '' // Refers to the whole text
      }];
    }

    // Sort words by time to be safe
    const sortedWords = [...words].sort((a, b) => a.audioStart - b.audioStart);

    if (mode.type === 'word') {
      return sortedWords.map(word => ({
        wordIndex: word.wordIndex,
        startTime: word.audioStart,
        endTime: word.audioEnd,
        text: word.rawText
      }));
    }

    if (mode.type === 'progressive') {
      // For progressive, each "highlight" starts at word onset and lasts until the end of the scene
      return sortedWords.map(word => ({
        wordIndex: word.wordIndex,
        startTime: word.audioStart,
        endTime: sceneEndTime,
        text: word.rawText
      }));
    }

    return [];
  }
}
