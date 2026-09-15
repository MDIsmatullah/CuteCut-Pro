import { AyahTiming, WordTiming, QariSurahAudio } from '../types/qari';

class QariTimingService {
  private timingCache: Map<string, AyahTiming[]> = new Map();
  private audioCache: Map<string, QariSurahAudio> = new Map();

  private getCacheKey(providerId: string, reciterId: number, surahNumber: number): string {
    return `${providerId}:${reciterId}:${surahNumber}`;
  }

  async getSurahTiming(
    providerId: string,
    reciterId: number,
    surahNumber: number
  ): Promise<AyahTiming[]> {
    const cacheKey = this.getCacheKey(providerId, reciterId, surahNumber);
    if (this.timingCache.has(cacheKey)) {
      return this.timingCache.get(cacheKey)!;
    }

    if (providerId === 'quran-foundation') {
      return this.fetchFromQuranFoundation(reciterId, surahNumber);
    }

    return [];
  }

  private async fetchFromQuranFoundation(
    reciterId: number,
    surahNumber: number
  ): Promise<AyahTiming[]> {
    const cacheKey = this.getCacheKey('quran-foundation', reciterId, surahNumber);
    
    try {
      // Endpoint: GET /chapter_recitations/:reciter_id/:chapter_number?segments=true
      const url = `https://api.quran.com/api/v4/chapter_recitations/${reciterId}/${surahNumber}?segments=true`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`Failed to fetch timing for Surah ${surahNumber}`);

      const data = await response.json();
      const audioFile = data.audio_file;
      
      if (!audioFile || !audioFile.audio_url) {
        return [];
      }

      // Store audio info
      this.audioCache.set(cacheKey, {
        providerId: 'quran-foundation',
        providerReciterId: reciterId,
        surahNumber: surahNumber,
        audioId: audioFile.id,
        format: audioFile.format || 'mp3',
        durationMs: 0, // Not provided in this endpoint directly
        audioUrl: audioFile.audio_url,
        retrievedAt: Date.now()
      });

      const timings: AyahTiming[] = [];
      const timestamps = audioFile.timestamps || [];

      for (const ts of timestamps) {
        const verseKey = ts.verse_key; // Use verse_key directly from provider
        
        const wordTimings: WordTiming[] = (ts.segments || []).map((seg: any) => ({
          providerId: 'quran-foundation',
          providerReciterId: reciterId,
          verseKey,
          wordIndex: seg[0],
          startMs: seg[1],
          endMs: seg[2],
          source: 'provider-verified',
          provenance: 'provider-verified'
        }));

        timings.push({
          providerId: 'quran-foundation',
          providerReciterId: reciterId,
          surahNumber,
          verseKey,
          startMs: ts.timestamp_from,
          endMs: ts.timestamp_to,
          durationMs: ts.timestamp_to - ts.timestamp_from,
          source: 'provider-verified',
          confidence: 100,
          provenance: 'provider-verified',
          wordTimings
        });
      }

      this.timingCache.set(cacheKey, timings);
      return timings;
    } catch (error) {
      console.error('Error fetching timing from Quran Foundation:', error);
      return [];
    }
  }

  getAudioInfo(providerId: string, reciterId: number, surahNumber: number): QariSurahAudio | undefined {
    return this.audioCache.get(this.getCacheKey(providerId, reciterId, surahNumber));
  }
}

export const qariTimingService = new QariTimingService();
