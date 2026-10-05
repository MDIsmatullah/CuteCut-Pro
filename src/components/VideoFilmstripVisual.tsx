import React, { useMemo, useState, useEffect } from 'react';
import { Clip, ClipType } from '../types';
import { formatTimeCode, getSafeCrossOrigin, normalizeMediaUrl } from '../utils/editorUtils';

interface VideoFilmstripVisualProps {
  clip: Clip;
  width: number;
  isSelected: boolean;
  zoom: number;
}

// Global persistent cache for thumbnail snapshots across all clips and re-renders
const globalThumbnailCache = new Map<string, string>();

// High-performance sequential global queue to prevent browser video decoder choke
interface QueueItem {
  url: string;
  targetTime: number;
  crossOrigin: string | undefined;
  fallbackUrl: string | null;
  onExtracted: (timeKey: string, dataUrl: string) => void;
}

const extractionQueue: QueueItem[] = [];
let isProcessingQueue = false;

// Reusable single video element per active video URL to avoid destroying & recreating video pipelines 20+ times
let activeVideoEl: HTMLVideoElement | null = null;
let activeVideoUrl: string = '';
let activeVideoReady: Promise<boolean> | null = null;
let sharedCanvas: HTMLCanvasElement | null = null;

function getSharedCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D | null } {
  if (!sharedCanvas) {
    sharedCanvas = document.createElement('canvas');
    sharedCanvas.width = 160; // Lightweight but razor sharp timeline frame
    sharedCanvas.height = 90;
  }
  return { canvas: sharedCanvas, ctx: sharedCanvas.getContext('2d', { willReadFrequently: false }) };
}

async function prepareVideoForExtraction(url: string, crossOrigin: string | undefined): Promise<boolean> {
  if (activeVideoEl && activeVideoUrl === url && activeVideoReady) {
    return activeVideoReady;
  }

  // Clean up previous video element if URL changed
  if (activeVideoEl) {
    try {
      activeVideoEl.pause();
      activeVideoEl.removeAttribute('src');
      activeVideoEl.load();
    } catch {
      // ignore
    }
    activeVideoEl = null;
  }

  activeVideoUrl = url;
  const video = document.createElement('video');
  activeVideoEl = video;

  if (crossOrigin) {
    video.crossOrigin = crossOrigin;
  }
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.setAttribute('webkit-playsinline', 'true');
  video.setAttribute('playsinline', 'true');

  activeVideoReady = new Promise<boolean>((resolve) => {
    let resolved = false;
    let timer: any = null;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      video.removeEventListener('loadeddata', onReady);
      video.removeEventListener('canplay', onReady);
      video.removeEventListener('error', onError);
    };

    const onReady = () => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve(true);
    };

    const onError = () => {
      if (resolved) return;
      // If failed with crossOrigin, try once without crossOrigin
      if (video.crossOrigin) {
        video.removeAttribute('crossorigin');
        try {
          video.load();
        } catch {
          resolved = true;
          cleanup();
          resolve(false);
        }
      } else {
        resolved = true;
        cleanup();
        resolve(false);
      }
    };

    video.addEventListener('loadeddata', onReady);
    video.addEventListener('canplay', onReady);
    video.addEventListener('error', onError);

    // 4 second timeout for network stream metadata/buffer
    timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve(video.readyState >= 1);
      }
    }, 4000);

    video.src = url;
    try {
      video.load();
    } catch {
      resolved = true;
      cleanup();
      resolve(false);
    }
  });

  return activeVideoReady;
}

async function processNextQueueItem() {
  if (isProcessingQueue || extractionQueue.length === 0) return;
  isProcessingQueue = true;

  const item = extractionQueue.shift()!;
  
  await new Promise<void>(async (resolveItem) => {
    const roundedTime = Math.round(item.targetTime * 10) / 10;
    const cacheKey = `${item.url}_${roundedTime}`;
    const posterKey = `${item.url}_poster`;

    const existingCached = globalThumbnailCache.get(cacheKey);
    if (existingCached && existingCached !== 'failed_cors') {
      item.onExtracted(cacheKey, existingCached);
      isProcessingQueue = false;
      resolveItem();
      setTimeout(processNextQueueItem, 0);
      return;
    }

    const stockFallback = item.fallbackUrl || getFallbackImageForVideoUrl(item.url);
    if (stockFallback && stockFallback !== 'failed_cors') {
      // Pre-seed poster key so timeline shows it immediately
      if (!globalThumbnailCache.has(posterKey)) {
        globalThumbnailCache.set(posterKey, stockFallback);
      }
    }

    const finish = (resultUrl: string | null) => {
      const validResult = (resultUrl && resultUrl !== 'failed_cors') ? resultUrl : stockFallback;
      if (validResult && validResult !== 'failed_cors') {
        globalThumbnailCache.set(cacheKey, validResult);
        if (!globalThumbnailCache.has(posterKey)) {
          globalThumbnailCache.set(posterKey, validResult);
        }
        item.onExtracted(cacheKey, validResult);
      }
      resolveItem();
    };

    try {
      const isReady = await prepareVideoForExtraction(item.url, item.crossOrigin);
      const video = activeVideoEl;

      if (!isReady || !video || video.readyState < 1) {
        finish(null);
        isProcessingQueue = false;
        setTimeout(processNextQueueItem, 0);
        return;
      }

      const { canvas, ctx } = getSharedCanvas();
      if (!ctx) {
        finish(null);
        isProcessingQueue = false;
        setTimeout(processNextQueueItem, 0);
        return;
      }

      const videoDur = (video.duration && isFinite(video.duration) && video.duration > 0) ? video.duration : 999999;
      const clampedTargetTime = Math.max(0.05, Math.min(Math.max(0.05, videoDur - 0.1), item.targetTime));

      // If already at or very near this time, draw immediately
      if (Math.abs(video.currentTime - clampedTargetTime) < 0.15) {
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          finish(dataUrl);
        } catch {
          finish(null);
        }
        isProcessingQueue = false;
        setTimeout(processNextQueueItem, 0);
        return;
      }

      let isDone = false;
      let seekTimeout: any = null;

      const onSeeked = () => {
        if (isDone) return;
        isDone = true;
        if (seekTimeout) clearTimeout(seekTimeout);
        video.removeEventListener('seeked', onSeeked);

        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          finish(dataUrl);
        } catch {
          finish(null);
        }
        isProcessingQueue = false;
        setTimeout(processNextQueueItem, 0);
      };

      video.addEventListener('seeked', onSeeked, { once: true });
      seekTimeout = setTimeout(() => {
        if (!isDone) {
          isDone = true;
          video.removeEventListener('seeked', onSeeked);
          // Attempt drawing whatever frame video has right now
          try {
            if (video.videoWidth > 0 && video.videoHeight > 0) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
              finish(dataUrl);
            } else {
              finish(null);
            }
          } catch {
            finish(null);
          }
          isProcessingQueue = false;
          setTimeout(processNextQueueItem, 0);
        }
      }, 2500);

      try {
        video.currentTime = clampedTargetTime;
      } catch {
        if (!isDone) {
          isDone = true;
          clearTimeout(seekTimeout);
          finish(null);
          isProcessingQueue = false;
          setTimeout(processNextQueueItem, 0);
        }
      }
    } catch {
      finish(null);
      isProcessingQueue = false;
      setTimeout(processNextQueueItem, 0);
    }
  });
}

function queueFrameExtraction(
  url: string,
  targetTime: number,
  crossOrigin: string | undefined,
  fallbackUrl: string | null,
  onExtracted: (timeKey: string, dataUrl: string) => void
) {
  const roundedTime = Math.round(targetTime * 10) / 10;
  const cacheKey = `${url}_${roundedTime}`;
  
  const existing = globalThumbnailCache.get(cacheKey);
  if (existing && existing !== 'failed_cors') {
    onExtracted(cacheKey, existing);
    return;
  }

  // Check if duplicate task is already queued
  const isDuplicate = extractionQueue.some(
    item => item.url === url && Math.abs(item.targetTime - targetTime) < 0.1
  );
  if (isDuplicate) return;

  // Prevent queue from growing indefinitely
  if (extractionQueue.length > 50) {
    extractionQueue.splice(20, 15);
  }

  extractionQueue.push({
    url,
    targetTime,
    crossOrigin,
    fallbackUrl,
    onExtracted
  });

  processNextQueueItem();
}

// Curated high-resolution fallback posters for local stock & thematic videos
export const getFallbackImageForVideoUrl = (url: string | undefined): string | null => {
  if (!url) return null;
  const lowerUrl = url.toLowerCase();

  // Stock Islamic & Holy Videos
  if (lowerUrl.includes('makkah_tawaf') || lowerUrl.includes('tawaf')) {
    return 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=800&q=80';
  }
  if (lowerUrl.includes('makkah_night')) {
    return 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80';
  }
  if (lowerUrl.includes('makkah_ramadan')) {
    return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
  }

  // Stock Nature & Landscapes
  if (lowerUrl.includes('golden_sunrise') || lowerUrl.includes('dawn')) {
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';
  }
  if (lowerUrl.includes('floating_clouds') || lowerUrl.includes('clouds')) {
    return 'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&w=800&q=80';
  }
  if (lowerUrl.includes('mountain_clouds') || lowerUrl.includes('alpine')) {
    return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80';
  }

  // Stock Rain & Water
  if (lowerUrl.includes('rain_water') || lowerUrl.includes('rain')) {
    return 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=800&q=80';
  }
  if (lowerUrl.includes('forest_waterfall') || lowerUrl.includes('waterfall')) {
    return 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80';
  }
  if (lowerUrl.includes('ocean_sunset') || lowerUrl.includes('ocean')) {
    return 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=800&q=80';
  }

  // Stock Cosmic & Stars
  if (lowerUrl.includes('milkyway_galaxy') || lowerUrl.includes('galaxy') || lowerUrl.includes('cosmic')) {
    return 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80';
  }
  if (lowerUrl.includes('night_stars') || lowerUrl.includes('stars')) {
    return 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80';
  }

  // Mixkit legacy & external CDNs
  if (lowerUrl.includes('mixkit-clouds-and-blue-sky') || lowerUrl.includes('2408')) {
    return 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&auto=format&fit=crop&q=80';
  }
  if (lowerUrl.includes('mixkit-starry-sky-at-night') || lowerUrl.includes('42283')) {
    return 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80';
  }
  if (lowerUrl.includes('mixkit-forest-stream') || lowerUrl.includes('529')) {
    return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80';
  }
  if (lowerUrl.includes('mixkit-calm-sea-water') || lowerUrl.includes('42999')) {
    return 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&auto=format&fit=crop&q=80';
  }
  if (lowerUrl.includes('mixkit-rain-falling') || lowerUrl.includes('42948')) {
    return 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=600&auto=format&fit=crop&q=80';
  }
  if (lowerUrl.includes('mixkit-sunlight-filtering') || lowerUrl.includes('42990')) {
    return 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&auto=format&fit=crop&q=80';
  }
  if (lowerUrl.includes('mixkit-sand-dunes') || lowerUrl.includes('41584')) {
    return 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop&q=80';
  }
  if (lowerUrl.includes('mixkit-golden-light-streaks') || lowerUrl.includes('42861')) {
    return 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80';
  }
  if (lowerUrl.includes('mixkit-spinning-around-the-earth') || lowerUrl.includes('41558')) {
    return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80';
  }
  if (lowerUrl.includes('mixkit-dinosaur-toy') || lowerUrl.includes('42289')) {
    return 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=600&auto=format&fit=crop&q=80';
  }
  if (lowerUrl.includes('mixkit-digital-neon-mesh') || lowerUrl.includes('41566')) {
    return 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80';
  }
  if (lowerUrl.includes('mixkit-purple-and-blue-paint') || lowerUrl.includes('43303')) {
    return 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80';
  }

  return null;
};

export const VideoFilmstripVisual = React.memo<VideoFilmstripVisualProps>(({
  clip,
  width,
  isSelected,
  zoom,
}) => {
  // CapCut Pro frame slice width (approx 68px to 80px per frame slice)
  const targetFrameWidth = Math.max(56, Math.min(90, Math.round(68 * (zoom > 25 ? 1 : 0.85))));
  const frameCount = Math.max(1, Math.min(48, Math.floor(width / targetFrameWidth)));
  const frameWidth = width / Math.max(1, frameCount);

  const normalizedUrl = useMemo(() => normalizeMediaUrl(clip.url), [clip.url]);
  
  // Robustly determine if the clip is an image
  const isImage = useMemo(() => {
    if (clip.isImage) return true;
    if (clip.type === 'image' || clip.type === ClipType.IMAGE) return true;
    if (!clip.url) return false;
    
    const urlLower = clip.url.toLowerCase();
    return (
      urlLower.startsWith('data:image/') ||
      urlLower.includes('unsplash.com') ||
      /\.(jpeg|jpg|png|gif|webp|svg|bmp|avif)($|\?)/i.test(clip.url)
    );
  }, [clip.url, clip.type, clip.isImage]);

  // Guaranteed fallback thumbnail image
  const validFallback = useMemo(() => {
    const raw = clip.thumbnailUrl || clip.poster || clip.fallbackUrl || getFallbackImageForVideoUrl(clip.url);
    if (!raw || raw === 'failed_cors') return null;
    return raw;
  }, [clip.thumbnailUrl, clip.poster, clip.fallbackUrl, clip.url]);

  const posterKey = normalizedUrl ? `${normalizedUrl}_poster` : '';
  const initialPoster = useMemo(() => {
    if (!posterKey) return validFallback;
    const cached = globalThumbnailCache.get(posterKey);
    return (cached && cached !== 'failed_cors') ? cached : validFallback;
  }, [posterKey, validFallback]);

  const [posterThumb, setPosterThumb] = useState<string | null>(initialPoster);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});

  const crossOrigin = useMemo(() => getSafeCrossOrigin(clip.url), [clip.url]);

  // Pre-seed global cache with fallback image so it's instantly available everywhere
  useEffect(() => {
    if (validFallback && posterKey && !globalThumbnailCache.has(posterKey)) {
      globalThumbnailCache.set(posterKey, validFallback);
    }
    if (validFallback && !posterThumb) {
      setPosterThumb(validFallback);
    }
  }, [validFallback, posterKey, posterThumb]);

  const frames = useMemo(() => {
    const list = [];
    const secPerFrame = clip.duration / Math.max(1, frameCount);
    const sourceOffset = clip.sourceStart || 0;

    for (let i = 0; i < frameCount; i++) {
      const clipTimeOffset = clip.start + i * secPerFrame;
      const mediaTime = sourceOffset + i * secPerFrame;
      list.push({
        index: i,
        timecode: formatTimeCode(clipTimeOffset, false),
        mediaTime,
      });
    }
    return list;
  }, [width, zoom, clip.start, clip.duration, clip.sourceStart, frameCount]);

  useEffect(() => {
    if (!normalizedUrl) return;

    let isMounted = true;

    if (isImage) {
      const existing = globalThumbnailCache.get(posterKey);
      if (existing && existing !== 'failed_cors') {
        return;
      }
      const img = new Image();
      img.src = normalizedUrl;
      img.onload = () => {
        if (isMounted) {
          globalThumbnailCache.set(posterKey, normalizedUrl);
          setPosterThumb(normalizedUrl);
        }
      };
      return () => {
        isMounted = false;
      };
    }

    // Video extraction: Get poster frame if not already cached
    const initialTime = (clip.sourceStart || 0) + 0.1;
    const cachedPoster = globalThumbnailCache.get(posterKey);
    if (!cachedPoster || cachedPoster === 'failed_cors') {
      queueFrameExtraction(normalizedUrl, initialTime, crossOrigin, validFallback, (_key, dataUrl) => {
        if (isMounted && dataUrl && dataUrl !== 'failed_cors') {
          setPosterThumb(dataUrl);
        }
      });
    }

    // Extract any frame slices that are not yet in global cache
    frames.forEach((frame) => {
      const roundedTime = Math.round(frame.mediaTime * 10) / 10;
      const cacheKey = `${normalizedUrl}_${roundedTime}`;
      const cached = globalThumbnailCache.get(cacheKey);
      
      if (!cached || cached === 'failed_cors') {
        queueFrameExtraction(normalizedUrl, frame.mediaTime, crossOrigin, validFallback, (_key, dataUrl) => {
          if (isMounted && dataUrl && dataUrl !== 'failed_cors') {
            setThumbnails((prev) => {
              if (prev[frame.index] === dataUrl) return prev;
              return { ...prev, [frame.index]: dataUrl };
            });
          }
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [normalizedUrl, isImage, frames, crossOrigin, posterKey, clip.sourceStart, validFallback]);

  return (
    <div className="absolute inset-0 flex items-stretch overflow-hidden pointer-events-none select-none rounded-md bg-[#10171d]">
      <div className="w-full h-full flex items-stretch">
        {isImage && normalizedUrl ? (
          <div className="w-full h-full flex items-stretch relative overflow-hidden">
            {frames.map((frame) => (
              <div
                key={`img-frame-${frame.index}`}
                className={`h-full border-r border-black/50 relative overflow-hidden bg-slate-900 flex-shrink-0 ${
                  isSelected ? 'border-cyan-400/40' : 'border-slate-800/80'
                }`}
                style={{ width: `${frameWidth}px`, minWidth: `${frameWidth}px` }}
              >
                <img
                  src={normalizedUrl}
                  alt={`img-loop-${frame.index}`}
                  className="absolute inset-0 w-full h-full object-cover opacity-95 transition-opacity duration-300"
                  loading="lazy"
                />
                
                {frameWidth >= 44 && (
                  <div className="absolute bottom-1 left-1 z-10 text-[7px] font-mono text-cyan-200 bg-black/75 px-1 py-0.5 rounded shadow-sm">
                    {frame.timecode}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          frames.map((frame) => {
            const roundedTime = Math.round(frame.mediaTime * 10) / 10;
            const cacheKey = `${normalizedUrl}_${roundedTime}`;

            // Priority:
            // 1. Frame-specific extracted snapshot
            // 2. Cached frame snapshot
            // 3. Extracted or state poster
            // 4. Cached poster
            // 5. Guaranteed clip fallback (thumbnailUrl, poster, fallbackUrl)
            const extractedThumb = thumbnails[frame.index];
            const cachedFrame = globalThumbnailCache.get(cacheKey);
            const cachedPoster = globalThumbnailCache.get(posterKey);

            const thumb = (extractedThumb && extractedThumb !== 'failed_cors' ? extractedThumb : null)
              || (cachedFrame && cachedFrame !== 'failed_cors' ? cachedFrame : null)
              || (posterThumb && posterThumb !== 'failed_cors' ? posterThumb : null)
              || (cachedPoster && cachedPoster !== 'failed_cors' ? cachedPoster : null)
              || validFallback;

            return (
              <div
                key={`video-frame-${frame.index}`}
                className={`h-full border-r border-black/60 flex flex-col justify-between relative overflow-hidden bg-[#0c181d] flex-shrink-0 ${
                  isSelected ? 'border-cyan-400/50' : 'border-black/50'
                }`}
                style={{ width: `${frameWidth}px`, minWidth: `${frameWidth}px` }}
              >
                {thumb ? (
                  <img
                    src={thumb}
                    alt={`frame-${frame.index}`}
                    className="absolute inset-0 w-full h-full object-cover opacity-95 transition-opacity duration-200"
                    loading="lazy"
                    onError={(e) => {
                      // Fall back to clip fallback if individual data URL or cached frame fails
                      const target = e.currentTarget;
                      if (validFallback && target.src !== validFallback) {
                        target.src = validFallback;
                      }
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0c1a24] via-[#102433] to-[#0a121a] opacity-90 flex flex-col items-center justify-center p-1">
                    <span className="text-[14px] opacity-40">📹</span>
                    <span className="text-[6.5px] font-mono text-cyan-500/70 truncate max-w-full">
                      Preview
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

                {frameWidth >= 46 && (
                  <div className="z-10 absolute bottom-1 left-1 flex items-center text-[7px] font-mono font-bold text-cyan-200 bg-black/80 px-1 py-0.2 rounded shadow-sm">
                    <span>{frame.timecode}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.width === nextProps.width &&
         prevProps.isSelected === nextProps.isSelected &&
         prevProps.zoom === nextProps.zoom &&
         prevProps.clip.id === nextProps.clip.id &&
         prevProps.clip.duration === nextProps.clip.duration &&
         prevProps.clip.start === nextProps.clip.start &&
         prevProps.clip.sourceStart === nextProps.clip.sourceStart &&
         prevProps.clip.playbackRate === nextProps.clip.playbackRate &&
         prevProps.clip.thumbnailUrl === nextProps.clip.thumbnailUrl &&
         prevProps.clip.poster === nextProps.clip.poster &&
         prevProps.clip.url === nextProps.clip.url;
});

export default VideoFilmstripVisual;
