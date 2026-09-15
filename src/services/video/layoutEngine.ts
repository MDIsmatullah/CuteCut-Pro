import { VideoLayout, VideoResolution } from '../../types/video';

export interface LayoutDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  lineSpacing: number;
}

export interface SceneLayoutConfig {
  arabic: LayoutDimensions;
  translation: LayoutDimensions;
  margin: number;
  safeArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export class LayoutEngine {
  /**
   * Calculates the layout for a given resolution and layout style.
   * Ensures text stays within safe margins.
   */
  static getLayoutConfig(
    layout: VideoLayout,
    resolution: VideoResolution
  ): SceneLayoutConfig {
    const { width, height } = resolution;
    const margin = Math.round(width * 0.05);
    const safeX = margin;
    const safeY = margin;
    const safeWidth = width - (margin * 2);
    const safeHeight = height - (margin * 2);

    switch (layout) {
      case 'social-vertical':
        return {
          margin,
          safeArea: { x: safeX, y: safeY, width: safeWidth, height: safeHeight },
          arabic: {
            x: safeX,
            y: Math.round(height * 0.35),
            width: safeWidth,
            height: Math.round(height * 0.3),
            fontSize: Math.round(width * 0.08),
            lineSpacing: 1.5
          },
          translation: {
            x: safeX,
            y: Math.round(height * 0.65),
            width: safeWidth,
            height: Math.round(height * 0.2),
            fontSize: Math.round(width * 0.04),
            lineSpacing: 1.2
          }
        };

      case 'cinematic':
        return {
          margin,
          safeArea: { x: safeX, y: safeY, width: safeWidth, height: safeHeight },
          arabic: {
            x: safeX,
            y: Math.round(height * 0.4),
            width: safeWidth,
            height: Math.round(height * 0.2),
            fontSize: Math.round(height * 0.1),
            lineSpacing: 1.5
          },
          translation: {
            x: safeX,
            y: Math.round(height * 0.75),
            width: safeWidth,
            height: Math.round(height * 0.1),
            fontSize: Math.round(height * 0.04),
            lineSpacing: 1.2
          }
        };

      case 'landscape':
      case 'centered-quran':
      default:
        return {
          margin,
          safeArea: { x: safeX, y: safeY, width: safeWidth, height: safeHeight },
          arabic: {
            x: safeX,
            y: Math.round(height * 0.3),
            width: safeWidth,
            height: Math.round(height * 0.3),
            fontSize: Math.round(height * 0.12),
            lineSpacing: 1.5
          },
          translation: {
            x: safeX,
            y: Math.round(height * 0.65),
            width: safeWidth,
            height: Math.round(height * 0.2),
            fontSize: Math.round(height * 0.05),
            lineSpacing: 1.2
          }
        };
    }
  }

  /**
   * Estimates if text will fit in the given dimensions.
   * Simple heuristic: average char width.
   */
  static estimateTextFit(
    text: string,
    dimensions: LayoutDimensions,
    isArabic: boolean
  ): boolean {
    const avgCharWidth = dimensions.fontSize * (isArabic ? 0.6 : 0.45);
    const estimatedWidth = text.length * avgCharWidth;
    const linesNeeded = Math.ceil(estimatedWidth / dimensions.width);
    const totalHeightNeeded = linesNeeded * dimensions.fontSize * dimensions.lineSpacing;
    
    return totalHeightNeeded <= dimensions.height;
  }
}
