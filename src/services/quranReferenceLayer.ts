import { AyahTiming, Qari } from '../types/qari';
import { qariTimingService } from './qariTimingService';
import { qariProviderRegistry } from './qariProviderRegistry';

export interface ReferencePrior {
  verseKey: string;
  expectedStartMs: number;
  expectedEndMs: number;
  confidence: number;
  provenance: string;
}

class QuranReferenceLayer {
  /**
   * Gets reference timings for a specific reciter and surah.
   */
  async getReferencePriors(
    canonicalReciterKey: string,
    surahNumber: number
  ): Promise<ReferencePrior[]> {
    // 1. Resolve canonical reciter key to provider info
    // For now, we assume Quran Foundation is the primary source
    const reciters = await qariProviderRegistry.fetchReciters('quran-foundation');
    const qari = reciters.find(r => r.canonicalReciterKey === canonicalReciterKey);

    if (!qari) {
      return [];
    }

    // 2. Fetch timings
    const timings = await qariTimingService.getSurahTiming(
      qari.providerId,
      qari.providerReciterId,
      surahNumber
    );

    // 3. Convert to priors
    return timings.map(t => ({
      verseKey: t.verseKey,
      expectedStartMs: t.startMs,
      expectedEndMs: t.endMs,
      confidence: t.confidence,
      provenance: t.provenance
    }));
  }

  /**
   * Discovers which Surahs are available for a given Qari.
   * Note: Quran Foundation API doesn't have a direct "available surahs per reciter" list easily.
   * We might need to handle this by attempting fetch or having a known list.
   */
  async getAvailableSurahs(canonicalReciterKey: string): Promise<number[]> {
    // For Quran.com v4, most reciters have all 114 surahs.
    // Return full list for now.
    return Array.from({ length: 114 }, (_, i) => i + 1);
  }
}

export const quranReferenceLayer = new QuranReferenceLayer();
