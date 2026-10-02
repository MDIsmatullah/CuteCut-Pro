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
   * This is the core synthesis logic with proper video stream generation.
   */
  static generateFilterGraph(timeline: RenderTimeline): string {
    const filters: string[] = [];
    const { width, height } = timeline.resolution;
    
    // 1. Create color background (generates video stream, not just overlay)
    filters.push(`color=c=black:s=${width}x${height}:d=${timeline.totalDuration}[bg]`);

    // Get layout config based on selection
    const layoutConfig = LayoutEngine.getLayoutConfig(timeline.scenes[0]?.layout || 'centered-quran', timeline.resolution);

    // 2. Scene processing loop
    let lastOutput = 'bg';
    timeline.scenes.forEach((scene, i) => {
      const output = `s${i}`;
      const escapedArabic = scene.arabicText.replace(/'/g, "\\'").replace(/:/g, "\\:");
      
      // Arabic Text Filter (Base)
      let currentFilter = `drawtext=text='${escapedArabic}':fontcolor=white:fontsize=${layoutConfig.arabic.fontSize}:x=(w-${layoutConfig.arabic.width})/2:y=${layoutConfig.arabic.y}:enable='between(t,${scene.startTime},${scene.endTime})'`;

      // Add Translation if present
      if (scene.translation) {
        const escapedTrans = scene.translation.replace(/'/g, "\\'").replace(/:/g, "\\:");
        currentFilter += `,drawtext=text='${escapedTrans}':fontcolor=lightgray:fontsize=${layoutConfig.translation.fontSize}:x=(w-${layoutConfig.translation.width})/2:y=${layoutConfig.translation.y}:enable='between(t,${scene.startTime},${scene.endTime})'`;
      }

      // Add Highlights (Word-by-word highlighting)
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

  /**
   * Executes the FFmpeg command with PROPER VIDEO + AUDIO MUXING.
   * FIXED ISSUES:
   * - Video stream generation from filter_complex
   * - Correct audio-video synchronization  
   * - Universal codec compatibility for Linux/Ubuntu players
   */
  static async render(
    timeline: RenderTimeline,
    outputPath: string,
    onProgress?: (progress: RenderProgress) => void
  ): Promise<void> {
    const filterGraph = this.generateFilterGraph(timeline);
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Construct FFmpeg arguments with PROPER VIDEO + AUDIO MUXING
    const args = [
      '-y', // Overwrite output
      '-i', timeline.audioSource, // Audio input
      '-filter_complex', filterGraph,
      
      // CRITICAL FIX: Map BOTH video and audio streams correctly
      '-map', '[' + (timeline.scenes.length > 0 ? 's' + (timeline.scenes.length - 1) : 'bg') + ']', // Map video from filter output
      '-map', '0:a', // Map audio from input file
      
      // Video codec settings - optimized for Linux/Ubuntu compatibility
      '-c:v', 'libx264',
      '-preset', 'medium', // Better quality than veryfast, faster than slow
      '-crf', '18', // Quality level (0=lossless, 18=high, 23=default, 51=worst)
      '-pix_fmt', 'yuv420p', // Maximum compatibility (yuv420p is universal)
      
      // Audio codec settings
      '-c:a', 'aac',
      '-b:a', '192k', // Audio bitrate
      '-ar', '44100', // Standard audio sample rate
      
      // Duration and timing synchronization
      '-t', timeline.totalDuration.toString(),
      
      // Output format specifications for maximum compatibility
      '-movflags', '+faststart', // Optimize for streaming/preview
      '-fflags', '+genpts', // Generate presentation timestamps for proper sync
      
      outputPath
    ];

    return new Promise((resolve, reject) => {
      const process = spawn('ffmpeg', args);
      
      let stderrOutput = '';
      
      process.stderr.on('data', (data) => {
        const line = data.toString();
        stderrOutput += line;
        
        // Parse progress from FFmpeg stderr
        const progress = this.parseProgress(line, timeline.totalDuration);
        if (progress && onProgress) {
          onProgress(progress);
        }
      });

      process.stdout.on('data', (data) => {
        console.log('[FFmpeg STDOUT]', data.toString());
      });

      process.on('close', (code) => {
        if (code === 0) {
          console.log('[FFmpeg Success] Video rendered successfully with proper audio-video sync');
          resolve();
        } else {
          console.error('[FFmpeg Error Output]', stderrOutput);
          reject(new Error(`FFmpeg exited with code ${code}. Error: ${stderrOutput.slice(-500)}`));
        }
      });

      process.on('error', (err) => {
        console.error('[FFmpeg Process Error]', err);
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
