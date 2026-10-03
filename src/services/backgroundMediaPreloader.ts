/**
 * CuteCut Pro v2.5.3 - Background Media Pre-Caching & Zero-Latency Stream Engine
 * Automatically pre-buffers and warms up all video, audio, image, and text assets
 * in the background as soon as they are added to the timeline.
 */

import { Track, Clip, ClipType } from '../types';
import { normalizeMediaUrl, getSafeCrossOrigin } from '../utils/editorUtils';

// In-memory cache for preloaded Blob URLs, ImageBitmaps, and AudioBuffers
interface CachedMediaItem {
  url: string;
  blobUrl?: string;
  isFullyBuffered: boolean;
  bufferedRanges: { start: number; end: number }[];
  audioBuffer?: AudioBuffer;
  imageElement?: HTMLImageElement;
  videoElement?: HTMLVideoElement;
  preloading: boolean;
}

class BackgroundMediaPreloader {
  private cache: Map<string, CachedMediaItem> = new Map();
  private audioCtx: AudioContext | null = null;
  private preloadQueue: string[] = [];
  private isProcessingQueue: boolean = false;

  private getAudioContext(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    return this.audioCtx;
  }

  /**
   * Scan timeline tracks and immediately begin pre-buffering and warming up all assets in the background
   */
  public preloadTimelineAssets(tracks: Track[]): void {
    if (typeof window === 'undefined') return;

    tracks.forEach((track) => {
      track.clips.forEach((clip) => {
        if (!clip.url) return;
        const normUrl = normalizeMediaUrl(clip.url);
        if (!normUrl) return;

        if (!this.cache.has(clip.id)) {
          this.cache.set(clip.id, {
            url: normUrl,
            isFullyBuffered: false,
            bufferedRanges: [],
            preloading: false
          });
          this.preloadQueue.push(clip.id);
        }

        // Trigger background warm-up
        this.warmUpClip(clip, normUrl);
      });
    });

    this.processQueue(tracks);
  }

  private warmUpClip(clip: Clip, url: string): void {
    const isImage = clip.isImage || clip.type === ClipType.IMAGE || (/\.(jpeg|jpg|png|gif|webp|svg|avif|bmp)(\?|$)/i.test(url) && !url.includes('.mp4') && !url.includes('.webm'));
    const isVideo = clip.type === ClipType.VIDEO && !isImage;
    const isAudio = clip.type === ClipType.AUDIO;

    const cached = this.cache.get(clip.id);
    if (!cached) return;

    if (isImage && !cached.imageElement) {
      const img = new Image();
      const safeCrossOrigin = getSafeCrossOrigin(url);
      if (safeCrossOrigin) img.crossOrigin = safeCrossOrigin;
      img.src = url;
      img.onload = () => {
        cached.imageElement = img;
        cached.isFullyBuffered = true;
      };
      if (typeof img.decode === 'function') {
        img.decode().then(() => {
          cached.isFullyBuffered = true;
        }).catch(() => {});
      }
    } else if (isVideo && !cached.videoElement) {
      const video = document.createElement('video');
      const safeCrossOrigin = getSafeCrossOrigin(url);
      if (safeCrossOrigin) video.crossOrigin = safeCrossOrigin;
      video.src = url;
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;

      // Monitor buffered time ranges in background
      video.addEventListener('progress', () => {
        const ranges: { start: number; end: number }[] = [];
        for (let i = 0; i < video.buffered.length; i++) {
          ranges.push({
            start: video.buffered.start(i),
            end: video.buffered.end(i)
          });
        }
        cached.bufferedRanges = ranges;
        if (video.duration && video.buffered.length > 0) {
          const totalBuffered = ranges.reduce((acc, r) => acc + (r.end - r.start), 0);
          if (totalBuffered >= video.duration * 0.9) {
            cached.isFullyBuffered = true;
          }
        }
      });

      video.addEventListener('canplaythrough', () => {
        cached.isFullyBuffered = true;
      });

      try {
        video.load();
      } catch {}
      cached.videoElement = video;
    } else if (isAudio && !cached.audioBuffer) {
      // Pre-fetch and decode audio in background for instant playback
      this.preloadAudioBuffer(clip.id, url);
    }
  }

  private async preloadAudioBuffer(clipId: string, url: string): Promise<void> {
    const cached = this.cache.get(clipId);
    if (!cached || cached.audioBuffer || cached.preloading) return;

    try {
      cached.preloading = true;
      const resp = await fetch(url, { mode: 'cors' }).catch(() => fetch(url));
      if (!resp || !resp.ok) return;

      const arrayBuffer = await resp.arrayBuffer();
      const ctx = this.getAudioContext();
      const decoded = await ctx.decodeAudioData(arrayBuffer);
      cached.audioBuffer = decoded;
      cached.isFullyBuffered = true;
      cached.preloading = false;
    } catch {
      if (cached) cached.preloading = false;
    }
  }

  private async processQueue(tracks: Track[]): Promise<void> {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    while (this.preloadQueue.length > 0) {
      const clipId = this.preloadQueue.shift();
      if (!clipId) continue;

      const cached = this.cache.get(clipId);
      if (!cached || cached.isFullyBuffered || cached.preloading) continue;

      // Find clip in tracks
      let targetClip: Clip | null = null;
      for (const t of tracks) {
        const found = t.clips.find(c => c.id === clipId);
        if (found) {
          targetClip = found;
          break;
        }
      }

      if (targetClip) {
        this.warmUpClip(targetClip, cached.url);
      }
    }

    this.isProcessingQueue = false;
  }

  public getCachedMedia(clipId: string): CachedMediaItem | undefined {
    return this.cache.get(clipId);
  }

  public clearCache(): void {
    this.cache.clear();
    this.preloadQueue = [];
  }
}

export const backgroundMediaPreloader = new BackgroundMediaPreloader();
