import { QuranAlignmentSegment } from '../../types/quranAlignment';
import { RenderScene, VideoLayout, HighlightMode } from '../../types/video';

export interface ScenePlannerOptions {
  layout: VideoLayout;
  highlightMode: HighlightMode;
  backgroundType: 'color' | 'image' | 'video';
  backgroundAsset?: string;
  showTranslation: boolean;
}

export class ScenePlanner {
  /**
   * Converts alignment segments into renderable scenes.
   * Strictly adheres to alignment boundaries.
   */
  static planScenes(
    segments: QuranAlignmentSegment[],
    options: ScenePlannerOptions
  ): RenderScene[] {
    return segments.map((segment, index) => {
      const sceneId = `scene_${index}_${segment.verse_key || 'unknown'}`;
      
      // Map word timings if available, otherwise fallback to ayah-level
      const words = segment.words || [];
      const hasWordTimings = words.length > 0 && words.some(w => w.audioStart > 0);
      
      const effectiveHighlightMode: HighlightMode = 
        (options.highlightMode.type === 'word' || options.highlightMode.type === 'progressive') && !hasWordTimings
          ? { type: 'ayah' }
          : options.highlightMode;

      return {
        sceneId,
        verseKey: segment.verse_key || '',
        startTime: segment.startTime,
        endTime: segment.endTime,
        arabicText: segment.text_arabic || '',
        translation: options.showTranslation ? segment.text_english : undefined,
        words: segment.words,
        highlightMode: effectiveHighlightMode,
        layout: options.layout,
        backgroundAsset: options.backgroundAsset,
        backgroundType: options.backgroundType,
        transition: {
          type: 'fade',
          duration: 0.5
        }
      };
    });
  }

  /**
   * Validates that scenes do not have overlaps or negative durations.
   */
  static validateTimeline(scenes: RenderScene[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      
      if (scene.endTime <= scene.startTime) {
        errors.push(`Scene ${scene.sceneId} has invalid duration: ${scene.startTime}s to ${scene.endTime}s`);
      }
      
      if (i > 0) {
        const prevScene = scenes[i - 1];
        if (scene.startTime < prevScene.endTime - 0.001) { // 1ms tolerance
          errors.push(`Scene overlap detected between ${prevScene.sceneId} and ${scene.sceneId}`);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
