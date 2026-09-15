import { spawn } from 'child_process';
import { RenderTimeline, RenderManifest } from '../../types/video';
import * as fs from 'fs';
import * as path from 'path';

import { LayoutEngine } from './layoutEngine';
import { HighlightPlanner } from './highlightPlanner';

export interface RenderProgress {
  frame: number;
  fps: number;
  time: string;
  bitrate: string;
  speed: string;
  percent: number;
}

export class FFmpegPipeline {
  /**
   * Generates a complex FFmpeg filter graph for Quran video rendering.
   * This is the core synthesis logic.
   */
  static generateFilterGraph(timeline: RenderTimeline): string {
    const filters: string[] = [];
    const { width, height } = timeline.resolution;
    
    // 1. Background layer
    filters.push(`[0:v]scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}[bg]`);

    // Get layout config based on selection
    const layoutConfig = LayoutEngine.getLayoutConfig(timeline.scenes[0]?.layout || 'centered-quran', timeline.resolution);

    // 2. Scene processing loop
    let lastOutput = 'bg';
    timeline.scenes.forEach((scene, i) => {
      const output = `s${i}`;
      const escapedArabic = scene.arabicText.replace(/'/g, "\\'").replace(/:/g, "\\:");
      
      // Arabic Text Filter (Base)
      let currentFilter = `drawtext=text='${escapedArabic}':fontcolor=white:fontsize=${layoutConfig.arabic.fontSize}:x=${layoutConfig.arabic.x}+(w-${layoutConfig.arabic.width})/2:y=${layoutConfig.arabic.y}:enable='between(t,${scene.startTime},${scene.endTime})'`;

      // Add Translation if present
      if (scene.translation) {
        const escapedTrans = scene.translation.replace(/'/g, "\\'").replace(/:/g, "\\:");
        currentFilter += `,drawtext=text='${escapedTrans}':fontcolor=lightgray:fontsize=${layoutConfig.translation.fontSize}:x=${layoutConfig.translation.x}+(w-${layoutConfig.translation.width})/2:y=${layoutConfig.translation.y}:enable='between(t,${scene.startTime},${scene.endTime})'`;
      }

      // Add Highlights (Simplified: Highlight the whole Arabic block for the active word duration)
      if (scene.words && scene.highlightMode.type !== 'static') {
        const highlights = HighlightPlanner.planHighlights(scene.words, scene.highlightMode, scene.startTime, scene.endTime);
        highlights.forEach(h => {
          // In drawtext, we'd ideally highlight specific words. 
          // For now, we'll implement a color change for the entire block during word duration as a fallback
          // if we don't have a sophisticated ASS subtitle generator.
          if (scene.highlightMode.type === 'word') {
            currentFilter += `,drawtext=text='${escapedArabic}':fontcolor=yellow:fontsize=${layoutConfig.arabic.fontSize}:x=${layoutConfig.arabic.x}+(w-${layoutConfig.arabic.width})/2:y=${layoutConfig.arabic.y}:enable='between(t,${h.startTime},${h.endTime})'`;
          }
        });
      }
      
      filters.push(`[${lastOutput}]${currentFilter}[${output}]`);
      lastOutput = output;
    });

    return filters.join(';');
  }

  /**
   * Executes the FFmpeg command.
   */
  static async render(
    timeline: RenderTimeline,
    outputPath: string,
    onProgress?: (progress: RenderProgress) => void
  ): Promise<void> {
    const filterGraph = this.generateFilterGraph(timeline);
    
    // Construct safe arguments
    const args = [
      '-y', // Overwrite output
      '-i', timeline.audioSource, // Background/Audio source (assuming it has video or we use it as audio)
      // If we had a separate image background:
      // '-loop', '1', '-i', backgroundImage,
      '-filter_complex', filterGraph,
      '-map', '0:a', // Use audio from first input
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', '23',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-t', timeline.totalDuration.toString(),
      outputPath
    ];

    return new Promise((resolve, reject) => {
      const process = spawn('ffmpeg', args);
      
      process.stderr.on('data', (data) => {
        const line = data.toString();
        // Parse progress from FFmpeg stderr
        // Example: frame=  123 fps= 30 q=28.0 size=    512kB time=00:00:05.12 bitrate= 819.2kbits/s speed=1.2x
        const progress = this.parseProgress(line, timeline.totalDuration);
        if (progress && onProgress) {
          onProgress(progress);
        }
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg exited with code ${code}`));
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
      const [h, m, s] = timeStr.split(':').map(parseFloat);
      const currentTime = h * 3600 + m * 60 + s;
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
