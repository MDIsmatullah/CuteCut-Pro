import { ReferencePrior } from '../types/qari';

export class ReferenceTransform {
  private offsetMs: number = 0;
  private tempoScale: number = 1.0;
  private isAvailable: boolean = false;

  constructor(
    priors: ReferencePrior[],
    acousticDurationMs: number
  ) {
    if (!priors || priors.length === 0) return;

    const firstPrior = priors[0];
    const lastPrior = priors[priors.length - 1];
    
    const providerSpan = lastPrior.expectedEndMs - firstPrior.expectedStartMs;
    
    if (providerSpan > 0 && acousticDurationMs > 0) {
      // Use the ratio of total durations as a robust tempo estimate
      // We assume the acoustic duration covers roughly the same verses as the priors
      this.tempoScale = acousticDurationMs / providerSpan;
      
      // Bound the tempo scale to plausible recitation ranges (fast Hadr to slow Tartil)
      this.tempoScale = Math.max(0.4, Math.min(2.5, this.tempoScale));
      
      // Default offset assumes they start around the same time relative to the beginning
      this.offsetMs = Math.max(0, 150 - (firstPrior.expectedStartMs * this.tempoScale));
      this.isAvailable = true;
    }
  }

  /**
   * Estimates an improved offset based on a known anchor point (e.g. first verse start)
   */
  setAnchor(providerTimeMs: number, acousticTimeMs: number) {
    this.offsetMs = acousticTimeMs - (providerTimeMs * this.tempoScale);
  }

  transform(providerTimeMs: number): number {
    return this.offsetMs + (providerTimeMs * this.tempoScale);
  }

  getTempoScale(): number {
    return this.tempoScale;
  }

  isValid(): boolean {
    return this.isAvailable;
  }
}
