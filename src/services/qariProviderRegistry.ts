import { Qari, QariProvider } from '../types/qari';

export const QURAN_FOUNDATION_PROVIDER: QariProvider = {
  id: 'quran-foundation',
  name: 'Quran Foundation / Quran.com',
  apiVersion: 'v4',
  documentationUrl: 'https://quran.foundation/api-docs',
  licenseStatus: 'unknown', // Need to verify redistribution terms
  attribution: 'Audio provided by Quran.com',
  offlineAllowed: true,
  redistributionAllowed: false
};

class QariProviderRegistry {
  private providers: Map<string, QariProvider> = new Map();
  private qaris: Map<string, Qari[]> = new Map();

  constructor() {
    this.providers.set(QURAN_FOUNDATION_PROVIDER.id, QURAN_FOUNDATION_PROVIDER);
  }

  getProvider(id: string): QariProvider | undefined {
    return this.providers.get(id);
  }

  async fetchReciters(providerId: string): Promise<Qari[]> {
    if (providerId === 'quran-foundation') {
      if (this.qaris.has(providerId)) {
        return this.qaris.get(providerId)!;
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const response = await fetch('https://api.quran.com/api/v4/resources/chapter_reciters?language=en', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error('Failed to fetch reciters');
        
        const data = await response.json();
        const reciters: Qari[] = data.reciters.map((r: any) => ({
          providerId: 'quran-foundation',
          providerReciterId: r.id,
          canonicalReciterKey: this.normalizeName(r.name),
          name: r.name,
          style: r.style || 'Murattal',
          qiraat: r.qiraat || 'Hafs',
          language: 'ar'
        }));

        this.qaris.set(providerId, reciters);
        return reciters;
      } catch (error) {
        console.error('Error fetching reciters from Quran Foundation:', error);
        return [];
      }
    }
    return [];
  }

  private normalizeName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  }
}

export const qariProviderRegistry = new QariProviderRegistry();
