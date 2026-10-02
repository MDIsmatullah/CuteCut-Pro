/**
 * Web Worker for timeline preview rendering
 * Runs heavy rendering operations off main thread
 */

interface RenderMessage {
  id: number;
  frameTime: number;
  width: number;
  height: number;
}

self.onmessage = (event: MessageEvent<RenderMessage>) => {
  const { id, frameTime, width, height } = event.data;

  // Simulate frame rendering (in production, this would call actual effect engine)
  const pixels = new Uint8ClampedArray(width * height * 4);

  // Fill with black background (placeholder)
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = 0; // R
    pixels[i + 1] = 0; // G
    pixels[i + 2] = 0; // B
    pixels[i + 3] = 255; // A
  }

  // Send back to main thread
  (self as any).postMessage({
    id,
    pixels: pixels.buffer,
    frameTime,
    width,
    height
  }, [pixels.buffer]);
};
