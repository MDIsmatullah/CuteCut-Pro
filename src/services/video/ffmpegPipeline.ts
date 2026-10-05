import { spawn, spawnSync } from 'child_process';
import { RenderTimeline } from '../../types/video';
import * as fs from 'fs';
import * as path from 'path';

import { LayoutEngine } from './layoutEngine';
import { HighlightPlanner } from './highlightPlanner';
import { PerformanceManager } from '../performance/PerformanceManager';

export interface RenderProgress {
  frame: number;
  fps: number;
  time: string;
  bitrate: string;
  speed: string;
  percent: number;
}

export class FFmpegPipeline {
  private static sanitizeFilterText(input?: string): string {
    const value = (input ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/:/g, '\\:');
    return value;
  }

  private static getSafeDuration(timeline: RenderTimeline): number {
    const maxSceneEnd = timeline.scenes?.length
      ? Math.max(...timeline.scenes.map(scene => Number.isFinite(scene.endTime) ? scene.endTime : 0))
      : 0;
    const fallback = Number.isFinite(timeline.totalDuration) ? timeline.totalDuration : 0;
    return Math.max(1, Math.min(36000, Number.isFinite(maxSceneEnd) && maxSceneEnd > fallback ? maxSceneEnd : fallback || 1));
  }

  private static getSafeFps(timeline: RenderTimeline): number {
    const fps = Number(timeline.fps || 30);
    if (!Number.isFinite(fps) || fps <= 0) return 30;
    return Math.min(60, Math.max(1, Math.round(fps)));
  }

  private static getFastEncodeArgs(): string[] {
    const runtime = PerformanceManager.getInstance();
    const optimization = runtime.getOptimization();
    const encoders = spawnSync('ffmpeg', ['-encoders'], { encoding: 'utf8' });
    const list = encoders.stdout || '';

    if (list.includes('h264_nvenc') && optimization.useHardwareAccel) {
      return ['-c:v', 'h264_nvenc', '-preset', 'p4', '-rc', 'constqp', '-qp', '23'];
    }
    if (list.includes('h264_qsv') && optimization.useHardwareAccel) {
      return ['-c:v', 'h264_qsv', '-preset', 'veryfast'];
    }
    if (list.includes('h264_vaapi') && optimization.useHardwareAccel) {
      return ['-c:v', 'h264_vaapi', '-qp', '23'];
    }
    if (list.includes('h264_v4l2m2m') && optimization.useHardwareAccel) {
      return ['-c:v', 'h264_v4l2m2m', '-preset', 'veryfast'];
    }

    const presetMap: Record<string, string> = {
      ultrafast: 'ultrafast',
      veryfast: 'veryfast',
      fast: 'fast',
      medium: 'medium'
    };

    return ['-c:v', 'libx264', '-preset', presetMap[optimization.exportPreset] || 'veryfast', '-crf', optimization.exportPreset === 'medium' ? '18' : '20', '-threads', String(Math.max(1, optimization.threadsToUse))];
  }

  static validateOutput(outputPath: string): { isValid: boolean; error?: string; details?: Record<string, unknown> } {
    const result = this.validateRenderOutput(outputPath);
    return {
      isValid: result.isValid,
      error: result.message,
      details: result.details
    };
  }

  static validateRenderOutput(outputPath: string): { isValid: boolean; message: string; details?: Record<string, unknown> } {
    try {
      if (!fs.existsSync(outputPath)) {
        return { isValid: false, message: 'Output file was not created.' };
      }

      const stats = fs.statSync(outputPath);
      if (!stats.size || stats.size < 1024) {
        return { isValid: false, message: `Output file is too small: ${stats.size} bytes.`, details: { size: stats.size } };
      }

      const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type', '-of', 'default=noprint_wrappers=1:nokey=1', outputPath], {
        encoding: 'utf8'
      });

      if (probe.error) {
        return { isValid: false, message: `ffprobe not available or failed: ${probe.error.message}`, details: { error: probe.error.message } };
      }

      const streams = (probe.stdout || '').split(/\r?\n/).filter(Boolean);
      const hasVideo = streams.some(s => s === 'video');
      const hasAudio = streams.some(s => s === 'audio');

      if (!hasVideo || !hasAudio) {
        return {
          isValid: false,
          message: `Output is invalid: missing ${!hasVideo ? 'video' : ''}${!hasVideo && !hasAudio ? ' and ' : ''}${!hasAudio ? 'audio' : ''} stream(s).`,
          details: { streams }
        };
      }

      return { isValid: true, message: 'Render output validated.' };
    } catch (err: any) {
      return { isValid: false, message: err?.message || 'Validation failed.' };
    }
  }

  static generateFilterGraph(timeline: RenderTimeline): string {
    const filters: string[] = [];
    const safeDuration = this.getSafeDuration(timeline);
    const { width, height } = timeline.resolution;

    filters.push(`color=c=black:s=${width}x${height}:d=${safeDuration}[bg]`);

    const layoutConfig = LayoutEngine.getLayoutConfig(timeline.scenes?.[0]?.layout || 'centered-quran', timeline.resolution);

    let lastOutput = 'bg';
    const safeScenes = Array.isArray(timeline.scenes) ? timeline.scenes : [];

    safeScenes.forEach((scene, i) => {
      const output = `s${i}`;
      const escapedArabic = this.sanitizeFilterText(scene.arabicText || '');

      let currentFilter = `drawtext=text='${escapedArabic}':fontcolor=white:fontsize=${layoutConfig.arabic.fontSize}:x=(w-${layoutConfig.arabic.width})/2:y=${layoutConfig.arabic.y}:enable='between(t,${scene.startTime},${scene.endTime})'`;

      if (scene.translation) {
        const escapedTrans = this.sanitizeFilterText(scene.translation);
        currentFilter += `,drawtext=text='${escapedTrans}':fontcolor=lightgray:fontsize=${layoutConfig.translation.fontSize}:x=(w-${layoutConfig.translation.width})/2:y=${layoutConfig.translation.y}:enable='between(t,${scene.startTime},${scene.endTime})'`;
      }

      if (scene.words && scene.highlightMode.type !== 'static') {
        const highlights = HighlightPlanner.planHighlights(scene.words, scene.highlightMode, scene.startTime, scene.endTime);
        highlights.forEach(h => {
          if (scene.highlightMode.type === 'word') {
            currentFilter += `,drawtext=text='${escapedArabic}':fontcolor=yellow:fontsize=${layoutConfig.arabic.fontSize}:x=(w-${layoutConfig.arabic.width})/2:y=${layoutConfig.arabic.y}:enable='between(t,${h.startTime},${h.endTime})'`;
          }
        });
      }

      filters.push(`[${lastOutput}]${currentFilter}[${output}]`);
      lastOutput = output;
    });

    return filters.join(';');
  }

  static async render(
    timeline: RenderTimeline,
    outputPath: string,
    onProgress?: (progress: RenderProgress) => void
  ): Promise<void> {
    if (!timeline || !timeline.audioSource) {
      throw new Error('Invalid render timeline: missing audioSource.');
    }

    const safeDuration = this.getSafeDuration(timeline);
    const safeFps = this.getSafeFps(timeline);
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filterGraph = this.generateFilterGraph(timeline);
    const lastVideoLabel = timeline.scenes?.length ? `s${timeline.scenes.length - 1}` : 'bg';
    const videoCodecArgs = this.getFastEncodeArgs();
    const optimization = PerformanceManager.getInstance().getOptimization();

    const args = [
      '-y',
      '-i', timeline.audioSource,
      '-filter_complex', filterGraph,
      '-map', `[${lastVideoLabel}]`,
      '-map', '0:a',
      ...videoCodecArgs,
      '-pix_fmt', 'yuv420p',
      '-r', String(safeFps),
      '-c:a', 'aac',
      '-b:a', '192k',
      '-ar', '44100',
      '-t', String(safeDuration),
      '-shortest',
      '-movflags', '+faststart',
      '-fflags', '+genpts',
      outputPath
    ];

    if (optimization.previewQuality < 0.75) {
      args.splice(args.indexOf('-r') + 1, 0, String(Math.min(safeFps, 24)));
    }

    return new Promise((resolve, reject) => {
      const process = spawn('ffmpeg', args);
      let stderrOutput = '';

      process.stderr.on('data', (data) => {
        const line = data.toString();
        stderrOutput += line;
        const progress = this.parseProgress(line, safeDuration);
        if (progress && onProgress) {
          onProgress(progress);
        }
      });

      process.on('close', (code) => {
        if (code === 0) {
          const validation = this.validateRenderOutput(outputPath);
          if (!validation.isValid) {
            reject(new Error(`Render validation failed: ${validation.message}`));
            return;
          }

          resolve();
        } else {
          const message = stderrOutput ? stderrOutput.slice(-500) : 'Unknown FFmpeg error.';
          reject(new Error(`FFmpeg exited with code ${code}. ${message}`));
        }
      });

      process.on('error', (err) => {
        reject(err);
      });
    });
  }

  private static parseProgress(line: string, totalDuration: number): RenderProgress | null {
    const frameMatch = line.match(/frame=\s*(\d+)/);
    const fpsMatch = line.match(/fps=\s*([\d.]+)/);
    const timeMatch = line.match(/time=\s*([\d:.]+)/);
    const bitrateMatch = line.match(/bitrate=\s*([\d.]+kbits\/s)/);
    const speedMatch = line.match(/speed=\s*([\d.]+x)/);

    if (timeMatch) {
      const timeStr = timeMatch[1];
      const timeParts = timeStr.split(':').map(parseFloat);
      let currentTime = 0;

      if (timeParts.length === 3) {
        currentTime = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
      } else if (timeParts.length === 2) {
        currentTime = timeParts[0] * 60 + timeParts[1];
      }

      const percent = Math.min(100, Math.round((currentTime / totalDuration) * 100));

      return {
        frame: frameMatch ? parseInt(frameMatch[1]) : 0,
        fps: fpsMatch ? parseFloat(fpsMatch[1]) : 0,
        time: timeStr,
        bitrate: bitrateMatch ? bitrateMatch[1] : '',
        speed: speedMatch ? speedMatch[1] : '',
        percent
      };
    }

    return null;
  }
}
