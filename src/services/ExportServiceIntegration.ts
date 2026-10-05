/**
 * Export Service Integration - Complete export flow with performance optimization
 * Integrates: device-aware presets, chunked export, hardware encoding, validation
 */

import { PerformanceManager } from './performance/PerformanceManager';
import { MobilePerformanceAdapter } from './performance/MobilePerformanceAdapter';
import { FFmpegPipeline, RenderProgress } from './video/ffmpegPipeline';
import { ChunkedExportEngine } from './video/ChunkedExportEngine';
import { exportWithWebCodecs } from './webCodecsExportService';

export interface ExportConfig {
  timeline: any;
  outputPath: string;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  format: 'mp4' | 'mov' | 'webm';
  width: number;
  height: number;
  fps: number;
  bitrate: number;
}

export interface ExportProgress {
  percent: number;
  currentFrame: number;
  totalFrames: number;
  speed: number;
  estimatedTime: number;
  currentChunk?: number;
  totalChunks?: number;
  status: 'preparing' | 'rendering' | 'encoding' | 'validating' | 'complete' | 'error';
  message: string;
}

export class ExportServiceIntegration {
  private static exportInProgress = false;
  private static cancellationRequested = false;

  static async startExport(
    config: ExportConfig,
    onProgress: (progress: ExportProgress) => void,
    onComplete: (outputPath: string) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    if (this.exportInProgress) {
      onError(new Error('Export already in progress'));
      return;
    }

    this.exportInProgress = true;
    this.cancellationRequested = false;

    try {
      // Step 1: Initialize performance manager
      onProgress({
        percent: 0,
        currentFrame: 0,
        totalFrames: 0,
        speed: 0,
        estimatedTime: 0,
        status: 'preparing',
        message: 'Detecting device capabilities...'
      });

      const perfManager = PerformanceManager.getInstance();
      const capabilities = perfManager.getCapabilities();
      const optimization = perfManager.getOptimization();

      onProgress({
        percent: 5,
        currentFrame: 0,
        totalFrames: 0,
        speed: 0,
        estimatedTime: 0,
        status: 'preparing',
        message: `Device: ${capabilities.estimatedPerformance.toUpperCase()} | ${capabilities.cpuCores} cores | ${capabilities.totalMemory}GB RAM`
      });

      // Step 2: Apply mobile/low-end adapter if needed
      if (capabilities.isMobile || capabilities.isLowEnd) {
        MobilePerformanceAdapter.initialize();
        const mobileConfig = MobilePerformanceAdapter.getConfig();
        onProgress({
          percent: 10,
          currentFrame: 0,
          totalFrames: 0,
          speed: 0,
          estimatedTime: 0,
          status: 'preparing',
          message: `Mobile mode: ${Math.round(mobileConfig.previewQualityMultiplier * 100)}% quality, max ${mobileConfig.maxPreviewFps}fps`
        });
      }

      // Step 3: Decide export strategy based on device and timeline size
      const timelineDuration = config.timeline?.duration || 0;
      const useChunkedExport = timelineDuration > 300 || capabilities.isLowEnd;

      if (useChunkedExport) {
        onProgress({
          percent: 15,
          currentFrame: 0,
          totalFrames: 0,
          speed: 0,
          estimatedTime: 0,
          status: 'rendering',
          message: 'Using chunked export for stability...'
        });

        await this.exportChunked(config, optimization, onProgress, onError);
      } else {
        onProgress({
          percent: 15,
          currentFrame: 0,
          totalFrames: 0,
          speed: 0,
          estimatedTime: 0,
          status: 'encoding',
          message: 'Starting direct export...'
        });

        await this.exportDirect(config, optimization, onProgress, onError);
      }

      // Step 4: Final validation
      onProgress({
        percent: 90,
        currentFrame: 0,
        totalFrames: 0,
        speed: 0,
        estimatedTime: 0,
        status: 'validating',
        message: 'Validating output file...'
      });

      await this.validateExportOutput(config.outputPath);

      onProgress({
        percent: 100,
        currentFrame: 0,
        totalFrames: 0,
        speed: 0,
        estimatedTime: 0,
        status: 'complete',
        message: 'Export complete!'
      });

      onComplete(config.outputPath);
    } catch (error) {
      onError(error as Error);
    } finally {
      this.exportInProgress = false;
    }
  }

  private static async exportDirect(
    config: ExportConfig,
    optimization: any,
    onProgress: (progress: ExportProgress) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    const timeline = {
      projectId: 'main',
      scenes: [],
      audioSource: config.timeline?.audioPath || '',
      totalDuration: config.timeline?.duration || 0,
      resolution: { width: config.width, height: config.height, label: `${config.width}x${config.height}` },
      fps: config.fps,
      metadata: {
        surahName: config.timeline?.name || ''
      }
    };

    return new Promise((resolve, reject) => {
      FFmpegPipeline.render(timeline, config.outputPath, (progress: RenderProgress) => {
        const percent = Math.min(95, 15 + (progress.percent * 0.8));
        onProgress({
          percent,
          currentFrame: progress.frame,
          totalFrames: 0,
          speed: parseFloat(progress.speed) || 0,
          estimatedTime: 0,
          status: 'encoding',
          message: `Encoding: ${progress.percent}% | Speed: ${progress.speed} | Bitrate: ${progress.bitrate}`
        });
      }).then(resolve).catch(reject);
    });
  }

  private static async exportChunked(
    config: ExportConfig,
    optimization: any,
    onProgress: (progress: ExportProgress) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    const chunkSizeSeconds = optimization.previewQuality < 0.5 ? 60 : 120;

    return new Promise((resolve, reject) => {
      ChunkedExportEngine.exportInChunks({
        inputAudio: config.timeline?.audioPath || '',
        outputPath: config.outputPath,
        totalDuration: config.timeline?.duration || 0,
        fps: config.fps,
        width: config.width,
        height: config.height,
        bitrate: config.bitrate,
        chunkSizeSeconds,
        onProgress: (percent, currentChunk, totalChunks) => {
          const overallPercent = 15 + (percent * 0.8);
          onProgress({
            percent: overallPercent,
            currentFrame: 0,
            totalFrames: totalChunks,
            speed: 0,
            estimatedTime: 0,
            currentChunk,
            totalChunks,
            status: 'rendering',
            message: `Chunked export: ${currentChunk}/${totalChunks} chunks | ${percent}%`
          });
        },
        onLog: (msg) => {
          console.log(`[ChunkedExport] ${msg}`);
        }
      }).then(resolve).catch(reject);
    });
  }

  private static async validateExportOutput(outputPath: string): Promise<void> {
    const fs = await import('fs');
    const { spawnSync } = await import('child_process');

    // Check file exists and has content
    if (!fs.existsSync(outputPath)) {
      throw new Error('Output file was not created');
    }

    const stats = fs.statSync(outputPath);
    if (stats.size < 1024) {
      throw new Error(`Output file too small: ${stats.size} bytes`);
    }

    // Validate with ffprobe
    const probe = spawnSync('ffprobe', [
      '-v', 'error',
      '-show_entries', 'stream=codec_type',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      outputPath
    ], { encoding: 'utf8' });

    const streams = (probe.stdout || '').split(/\r?\n/).filter(Boolean);
    const hasVideo = streams.some(s => s === 'video');
    const hasAudio = streams.some(s => s === 'audio');

    if (!hasVideo || !hasAudio) {
      throw new Error(`Invalid output: missing ${!hasVideo ? 'video' : ''} ${!hasAudio ? 'audio' : ''}`);
    }
  }

  static cancelExport(): void {
    this.cancellationRequested = true;
  }

  static isCancellationRequested(): boolean {
    return this.cancellationRequested;
  }
}
