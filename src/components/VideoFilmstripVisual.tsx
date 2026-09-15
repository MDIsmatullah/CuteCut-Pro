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
  onExtracted: (timeKey: string, dataUrl: string) => void;
}

const extractionQueue: QueueItem[] = [];
let isProcessingQueue = false;

async function processNextQueueItem() {
  if (isProcessingQueue || extractionQueue.length === 0) return;
  isProcessingQueue = true;

  const item = extractionQueue.shift()!;
  
  await new Promise<void>((resolveItem) => {
    const roundedTime = Math.round(item.targetTime * 10) / 10;
    const cacheKey = `${item.url}_${roundedTime}`;
    const posterKey = `${item.url}_poster`;

    if (globalThumbnailCache.has(cacheKey)) {
      item.onExtracted(cacheKey, globalThumbnailCache.get(cacheKey)!);
      isProcessingQueue = false;
      resolveItem();
      setTimeout(processNextQueueItem, 0);
      return;
    }

    const stockFallback = getFallbackImageForVideoUrl(item.url);
    if (stockFallback) {
      globalThumbnailCache.set(cacheKey, stockFallback);
      if (!globalThumbnailCache.has(posterKey)) {
        globalThumbnailCache.set(posterKey, stockFallback);
      }
      item.onExtracted(cacheKey, stockFallback);
      isProcessingQueue = false;
      resolveItem();
      setTimeout(processNextQueueItem, 0);
      return;
    }

    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    canvas.width = 160; // Lightweight but razor sharp timeline frame
    canvas.height = 90;
    const ctx = canvas.getContext('2d', { willReadFrequently: false });

    if (item.crossOrigin) {
      video.crossOrigin = item.crossOrigin;
    }
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    let isDone = false;
    let timeoutId: any = null;

    const finish = (resultUrl: string) => {
      if (isDone) return;
      isDone = true;
      if (timeoutId) clearTimeout(timeoutId);

      globalThumbnailCache.set(cacheKey, resultUrl);
      if (!globalThumbnailCache.has(posterKey)) {
        globalThumbnailCache.set(posterKey, resultUrl);
      }
      item.onExtracted(cacheKey, resultUrl);

      video.pause();
      video.removeAttribute('src');
      try {
        video.load();
      } catch {
        // ignore
      }
      resolveItem();
    };

    video.addEventListener('loadeddata', () => {
      try {
        video.currentTime = Math.max(0.05, item.targetTime);
      } catch {
        finish(getFallbackImageForVideoUrl(item.url) || 'failed_cors');
      }
    });

    video.addEventListener('seeked', () => {
      if (!ctx) {
        finish(getFallbackImageForVideoUrl(item.url) || 'failed_cors');
        return;
      }
      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        finish(dataUrl);
      } catch {
        finish(getFallbackImageForVideoUrl(item.url) || 'failed_cors');
      }
    });

    video.addEventListener('error', () => {
      if (video.crossOrigin) {
        // Retry once without crossorigin for some local configurations
        video.removeAttribute('crossorigin');
        try {
          video.load();
        } catch {
          finish(getFallbackImageForVideoUrl(item.url) || 'failed_cors');
        }
      } else {
        finish(getFallbackImageForVideoUrl(item.url) || 'failed_cors');
      }
    });

    timeoutId = setTimeout(() => {
      finish(getFallbackImageForVideoUrl(item.url) || 'failed_cors');
    }, 1800); // 1.8s maximum wait per frame

    video.src = item.url;
    try {
      video.load();
    } catch {
      finish(getFallbackImageForVideoUrl(item.url) || 'failed_cors');
    }
  });

  isProcessingQueue = false;
  setTimeout(processNextQueueItem, 0);
}

function queueFrameExtraction(
  url: string,
  targetTime: number,
  crossOrigin: string | undefined,
  onExtracted: (timeKey: string, dataUrl: string) => void
) {
  const roundedTime = Math.round(targetTime * 10) / 10;
  const cacheKey = `${url}_${roundedTime}`;
  
  if (globalThumbnailCache.has(cacheKey)) {
    onExtracted(cacheKey, globalThumbnailCache.get(cacheKey)!);
    return;
  }

  // Check if duplicate task is already queued
  const isDuplicate = extractionQueue.some(
    item => item.url === url && Math.abs(item.targetTime - targetTime) < 0.1
  );
  if (isDuplicate) return;

  extractionQueue.push({
    url,
    targetTime,
    crossOrigin,
    onExtracted
  });

  processNextQueueItem();
}

// Curated Unsplash fallback images for standard stock & thematic videos
export const getFallbackImageForVideoUrl = (url: string | undefined): string | null => {
  if (!url) return null;
  const lowerUrl = url.toLowerCase();

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

  const fallbackImg = clip.poster || clip.thumbnailUrl || clip.fallbackUrl || getFallbackImageForVideoUrl(clip.url);
  const posterKey = normalizedUrl ? `${normalizedUrl}_poster` : '';
  const initialPoster = posterKey ? globalThumbnailCache.get(posterKey) : null;
  const [posterThumb, setPosterThumb] = useState<string | null>(initialPoster || fallbackImg || null);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});

  const crossOrigin = useMemo(() => getSafeCrossOrigin(clip.url), [clip.url]);

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
      if (globalThumbnailCache.has(posterKey)) {
        return;
      }
      const img = new Image();
      img.src = normalizedUrl;
      img.onload = () => {
        if (isMounted) {
          globalThumbnailCache.set(posterKey, normalizedUrl);
          setPosterThumb((prev) => (prev === normalizedUrl ? prev : normalizedUrl));
        }
      };
      return () => {
        isMounted = false;
      };
    }

    // Video extraction: Get poster frame sequentially if not already cached
    const initialTime = (clip.sourceStart || 0) + 0.1;
    if (!globalThumbnailCache.has(posterKey)) {
      queueFrameExtraction(normalizedUrl, initialTime, crossOrigin, (_key, dataUrl) => {
        if (isMounted) {
          setPosterThumb((prev) => (prev === dataUrl ? prev : dataUrl));
        }
      });
    }

    // Extract any frame slices that are not yet in global cache
    frames.forEach((frame) => {
      const roundedTime = Math.round(frame.mediaTime * 10) / 10;
      const cacheKey = `${normalizedUrl}_${roundedTime}`;
      
      if (!globalThumbnailCache.has(cacheKey)) {
        queueFrameExtraction(normalizedUrl, frame.mediaTime, crossOrigin, (_key, dataUrl) => {
          if (isMounted) {
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
  }, [normalizedUrl, isImage, frames, crossOrigin, posterKey, clip.sourceStart]);

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
            const thumb = thumbnails[frame.index] || globalThumbnailCache.get(cacheKey) || posterThumb || globalThumbnailCache.get(posterKey);

            return (
              <div
                key={`video-frame-${frame.index}`}
                className={`h-full border-r border-black/60 flex flex-col justify-between relative overflow-hidden bg-[#0c181d] flex-shrink-0 ${
                  isSelected ? 'border-cyan-400/50' : 'border-black/50'
                }`}
                style={{ width: `${frameWidth}px`, minWidth: `${frameWidth}px` }}
              >
                {thumb && thumb !== 'failed_cors' ? (
                  <img
                    src={thumb}
                    alt={`frame-${frame.index}`}
                    className="absolute inset-0 w-full h-full object-cover opacity-95 transition-opacity duration-200"
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
         prevProps.clip.playbackRate === nextProps.clip.playbackRate;
});

export default VideoFilmstripVisual;
