/**
 * Mobile Performance Adapter
 * Automatically adjusts preview quality and effects on mobile devices
 */

import { PerformanceManager } from './PerformanceManager';

export interface MobilePerformanceConfig {
  previewQualityMultiplier: number;
  maxPreviewFps: number;
  reduceEffectsInPreview: boolean;
  useProxyMode: boolean;
  maxConcurrentEffects: number;
}

export class MobilePerformanceAdapter {
  private static config: MobilePerformanceConfig;

  static initialize(): void {
    const perfMgr = PerformanceManager.getInstance();
    const caps = perfMgr.getCapabilities();
    const opt = perfMgr.getOptimization();

    if (caps.isMobile) {
      this.config = {
        previewQualityMultiplier: opt.previewQuality,
        maxPreviewFps: 24,
        reduceEffectsInPreview: opt.previewQuality < 0.7,
        useProxyMode: opt.previewQuality < 0.5,
        maxConcurrentEffects: 1
      };
    } else if (caps.isLowEnd) {
      this.config = {
        previewQualityMultiplier: 0.5,
        maxPreviewFps: 24,
        reduceEffectsInPreview: true,
        useProxyMode: true,
        maxConcurrentEffects: 1
      };
    } else {
      this.config = {
        previewQualityMultiplier: 1.0,
        maxPreviewFps: 60,
        reduceEffectsInPreview: false,
        useProxyMode: false,
        maxConcurrentEffects: 3
      };
    }
  }

  static getConfig(): MobilePerformanceConfig {
    if (!this.config) {
      this.initialize();
    }
    return this.config;
  }

  static shouldRenderEffect(effectType: string): boolean {
    const config = this.getConfig();
    if (!config.reduceEffectsInPreview) return true;

    // Skip heavy effects in low-performance mode
    const heavyEffects = ['blur', 'shadow', 'glow', 'chromakey', 'colorgrade'];
    return !heavyEffects.includes(effectType);
  }

  static getPreviewResolution(baseWidth: number, baseHeight: number): { width: number; height: number } {
    const config = this.getConfig();
    const multiplier = config.previewQualityMultiplier;
    return {
      width: Math.round(baseWidth * multiplier),
      height: Math.round(baseHeight * multiplier)
    };
  }
}
