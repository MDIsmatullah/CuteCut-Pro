/**
 * Chunked Export Engine
 * Splits large timeline exports into manageable chunks
 * Reduces memory pressure and improves stability
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface ChunkExportOptions {
  inputAudio: string;
  outputPath: string;
  totalDuration: number;
  fps: number;
  width: number;
  height: number;
  bitrate: number;
  chunkSizeSeconds: number;
  onProgress?: (percent: number, currentChunk: number, totalChunks: number) => void;
  onLog?: (msg: string) => void;
}

export class ChunkedExportEngine {
  /**
   * Export video in chunks to reduce memory and improve stability
   */
  static async exportInChunks(options: ChunkExportOptions): Promise<void> {
    const {
      inputAudio,
      outputPath,
      totalDuration,
      fps,
      width,
      height,
      bitrate,
      chunkSizeSeconds,
      onProgress,
      onLog
    } = options;

    const totalChunks = Math.ceil(totalDuration / chunkSizeSeconds);
    const tempDir = path.join(path.dirname(outputPath), '.cutecut-temp');

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    onLog?.(`📦 Starting chunked export: ${totalChunks} chunks of ${chunkSizeSeconds}s each`);

    const chunkPaths: string[] = [];

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const startTime = chunkIndex * chunkSizeSeconds;
      const endTime = Math.min(startTime + chunkSizeSeconds, totalDuration);
      const chunkPath = path.join(tempDir, `chunk_${chunkIndex}.mp4`);

      onLog?.(`Processing chunk ${chunkIndex + 1}/${totalChunks} (${startTime}s - ${endTime}s)...`);

      await this.exportChunk({
        inputAudio,
        outputPath: chunkPath,
        startTime,
        duration: endTime - startTime,
        fps,
        width,
        height,
        bitrate
      });

      chunkPaths.push(chunkPath);
      const percent = Math.round(((chunkIndex + 1) / totalChunks) * 100);
      onProgress?.(percent, chunkIndex + 1, totalChunks);
    }

    onLog?.(`✂️ All chunks exported. Concatenating...`);

    // Create concat demuxer file
    const concatFile = path.join(tempDir, 'concat.txt');
    const concatContent = chunkPaths.map(p => `file '${p}'`).join('\n');
    fs.writeFileSync(concatFile, concatContent);

    // Concatenate chunks
    await this.concatenateChunks(concatFile, outputPath, onLog);

    // Cleanup temp files
    chunkPaths.forEach(p => {
      try { fs.unlinkSync(p); } catch {}
    });
    try { fs.unlinkSync(concatFile); } catch {}
    try { fs.rmdirSync(tempDir); } catch {}

    onLog?.(`✅ Chunked export complete!`);
  }

  private static async exportChunk(options: {
    inputAudio: string;
    outputPath: string;
    startTime: number;
    duration: number;
    fps: number;
    width: number;
    height: number;
    bitrate: number;
  }): Promise<void> {
    const { inputAudio, outputPath, startTime, duration, fps, width, height, bitrate } = options;

    const args = [
      '-ss', String(startTime),
      '-t', String(duration),
      '-i', inputAudio,
      '-f', 'lavfi',
      '-i', `color=black:s=${width}x${height}:d=${duration}`,
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', '20',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-y',
      outputPath
    ];

    return new Promise((resolve, reject) => {
      const process = spawn('ffmpeg', args);

      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg chunk export failed with code ${code}`));
        }
      });

      process.on('error', (err) => {
        reject(err);
      });
    });
  }

  private static async concatenateChunks(concatFile: string, outputPath: string, onLog?: (msg: string) => void): Promise<void> {
    const args = [
      '-f', 'concat',
      '-safe', '0',
      '-i', concatFile,
      '-c', 'copy',
      '-y',
      outputPath
    ];

    return new Promise((resolve, reject) => {
      const process = spawn('ffmpeg', args);

      process.stderr.on('data', (data) => {
        const line = data.toString();
        if (line.includes('frame=')) {
          onLog?.(`Concatenating... ${line.trim()}`);
        }
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg concatenation failed with code ${code}`));
        }
      });

      process.on('error', (err) => {
        reject(err);
      });
    });
  }
}
