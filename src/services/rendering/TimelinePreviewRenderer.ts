/**
 * Timeline Preview Renderer - Optimized for real-time performance
 * Only renders visible regions, caches frames, uses offscreen canvas
 */

export interface PreviewRenderOptions {
  canvasElement: HTMLCanvasElement;
  timelineStart: number;
  timelineEnd: number;
  visibleStart: number;
  visibleEnd: number;
  fps: number;
  quality: number; // 0-1
  onFrameReady?: (frameTime: number, canvas: HTMLCanvasElement) => void;
}

export class TimelinePreviewRenderer {
  private offscreenCanvas: OffscreenCanvas | null = null;
  private cachedFrames: Map<number, ImageData> = new Map();
  private renderWorker: Worker | null = null;
  private lastRenderTime = 0;
  private renderDebounceMs = 16; // ~60fps

  constructor(useWorker = true) {
    if (useWorker && typeof Worker !== 'undefined') {
      try {
        this.renderWorker = new Worker(new URL('./timelineRenderWorker.ts', import.meta.url), {
          type: 'module'
        });
      } catch {
        console.warn('Could not initialize render worker, using main thread');
      }
    }
  }

  /**
   * Render only the visible portion of timeline
   * Skips off-screen regions for performance
   */
  async renderVisibleRegion(options: PreviewRenderOptions): Promise<void> {
    const now = performance.now();
    if (now - this.lastRenderTime < this.renderDebounceMs) {
      return; // Skip if too soon
    }
    this.lastRenderTime = now;

    const { canvasElement, visibleStart, visibleEnd, quality, onFrameReady } = options;

    if (!canvasElement) return;

    const ctx = canvasElement.getContext('2d');
    if (!ctx) return;

    const scaledWidth = Math.round(canvasElement.width * quality);
    const scaledHeight = Math.round(canvasElement.height * quality);

    // Only render visible frames
    const visibleDuration = visibleEnd - visibleStart;
    const framesToRender = Math.ceil(visibleDuration * options.fps);

    for (let i = 0; i < framesToRender; i++) {
      const frameTime = visibleStart + (i / options.fps);

      // Check cache first
      const cacheKey = Math.floor(frameTime * 1000);
      if (this.cachedFrames.has(cacheKey)) {
        const cachedData = this.cachedFrames.get(cacheKey)!;
        ctx.putImageData(cachedData, 0, 0);
        continue;
      }

      // Render frame
      if (this.renderWorker) {
        await this.renderFrameWithWorker(frameTime, scaledWidth, scaledHeight, ctx, cacheKey);
      } else {
        this.renderFrameMainThread(frameTime, scaledWidth, scaledHeight, ctx, cacheKey);
      }

      if (onFrameReady) {
        onFrameReady(frameTime, canvasElement);
      }
    }

    // Cleanup old cache entries
    if (this.cachedFrames.size > 100) {
      const keysToDelete = Array.from(this.cachedFrames.keys()).slice(0, 50);
      keysToDelete.forEach(key => this.cachedFrames.delete(key));
    }
  }

  private renderFrameMainThread(
    frameTime: number,
    width: number,
    height: number,
    ctx: CanvasRenderingContext2D,
    cacheKey: number
  ): void {
    // Render at scaled quality
    const imageData = ctx.createImageData(width, height);
    // Fill with placeholder (in real implementation, this calls actual effect renderer)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    ctx.putImageData(imageData, 0, 0);
    this.cachedFrames.set(cacheKey, imageData);
  }

  private async renderFrameWithWorker(
    frameTime: number,
    width: number,
    height: number,
    ctx: CanvasRenderingContext2D,
    cacheKey: number
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.renderWorker) {
        this.renderFrameMainThread(frameTime, width, height, ctx, cacheKey);
        resolve();
        return;
      }

      const messageId = Math.random();
      const handleMessage = (event: MessageEvent) => {
        if (event.data.id === messageId) {
          const imageData = new ImageData(event.data.pixels, width, height);
          ctx.putImageData(imageData, 0, 0);
          this.cachedFrames.set(cacheKey, imageData);
          this.renderWorker?.removeEventListener('message', handleMessage);
          resolve();
        }
      };

      this.renderWorker.addEventListener('message', handleMessage);
      this.renderWorker.postMessage({
        id: messageId,
        frameTime,
        width,
        height
      });
    });
  }

  clearCache(): void {
    this.cachedFrames.clear();
  }

  dispose(): void {
    this.renderWorker?.terminate();
    this.cachedFrames.clear();
  }
}
