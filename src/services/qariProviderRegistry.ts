import { Qari, QariProvider } from '../types/qari';

export const QURAN_FOUNDATION_PROVIDER: QariProvider = {
  id: 'quran-foundation',
  name: 'Quran Foundation / Quran.com',
  apiVersion: 'v4',
  documentationUrl: 'https://quran.foundation/api-docs',
  licenseStatus: 'unknown',
  attribution: 'Audio provided by Quran.com',
  offlineAllowed: true,
  redistributionAllowed: false
};

export const CANONICAL_FALLBACK_RECITERS: Qari[] = [
  { providerId: 'quran-foundation', providerReciterId: 7, canonicalReciterKey: 'mishari-rashid-al-afasy', name: 'Mishari Rashid al-`Afasy', style: 'Murattal', qiraat: 'Hafs', language: 'ar' },
  { providerId: 'quran-foundation', providerReciterId: 1, canonicalReciterKey: 'abdulbaset-abdulsamad', name: 'AbdulBaset AbdulSamad', style: 'Murattal', qiraat: 'Hafs', language: 'ar' },
  { providerId: 'quran-foundation', providerReciterId: 2, canonicalReciterKey: 'abdulbaset-abdulsamad-mujawwad', name: 'AbdulBaset AbdulSamad (Mujawwad)', style: 'Mujawwad', qiraat: 'Hafs', language: 'ar' },
  { providerId: 'quran-foundation', providerReciterId: 3, canonicalReciterKey: 'abdur-rahman-as-sudais', name: 'Abdur-Rahman as-Sudais', style: 'Murattal', qiraat: 'Hafs', language: 'ar' },
  { providerId: 'quran-foundation', providerReciterId: 4, canonicalReciterKey: 'abu-bakr-al-shatri', name: 'Abu Bakr al-Shatri', style: 'Murattal', qiraat: 'Hafs', language: 'ar' },
  { providerId: 'quran-foundation', providerReciterId: 5, canonicalReciterKey: 'hani-ar-rifai', name: 'Hani ar-Rifai', style: 'Murattal', qiraat: 'Hafs', language: 'ar' },
  { providerId: 'quran-foundation', providerReciterId: 6, canonicalReciterKey: 'mahmoud-khalil-al-husary', name: 'Mahmoud Khalil Al-Husary', style: 'Murattal', qiraat: 'Hafs', language: 'ar' },
  { providerId: 'quran-foundation', providerReciterId: 8, canonicalReciterKey: 'sa-ud-ash-shuraym', name: 'Sa`ud ash-Shuraym', style: 'Murattal', qiraat: 'Hafs', language: 'ar' },
  { providerId: 'quran-foundation', providerReciterId: 9, canonicalReciterKey: 'mohamed-siddiq-al-minshawi', name: 'Mohamed Siddiq al-Minshawi', style: 'Murattal', qiraat: 'Hafs', language: 'ar' },
  { providerId: 'quran-foundation', providerReciterId: 10, canonicalReciterKey: 'mohamed-siddiq-al-minshawi-mujawwad', name: 'Mohamed Siddiq al-Minshawi (Mujawwad)', style: 'Mujawwad', qiraat: 'Hafs', language: 'ar' },
  { providerId: 'quran-foundation', providerReciterId: 11, canonicalReciterKey: 'maher-al-muaiqly', name: 'Maher al-Muaiqly', style: 'Murattal', qiraat: 'Hafs', language: 'ar' },
  { providerId: 'quran-foundation', providerReciterId: 12, canonicalReciterKey: 'saad-al-ghamdi', name: 'Saad al-Ghamdi', style: 'Murattal', qiraat: 'Hafs', language: 'ar' },
  { providerId: 'quran-foundation', providerReciterId: 13, canonicalReciterKey: 'yasser-ad-dussary', name: 'Yasser ad-Dussary', style: 'Murattal', qiraat: 'Hafs', language: 'ar' },
  { providerId: 'quran-foundation', providerReciterId: 14, canonicalReciterKey: 'ali-jaber', name: 'Ali Jaber', style: 'Murattal', qiraat: 'Hafs', language: 'ar' },
  { providerId: 'quran-foundation', providerReciterId: 15, canonicalReciterKey: 'bandar-baleela', name: 'Bandar Baleela', style: 'Murattal', qiraat: 'Hafs', language: 'ar' },
  { providerId: 'quran-foundation', providerReciterId: 16, canonicalReciterKey: 'khalid-al-jaleel', name: 'Khalid al-Jaleel', style: 'Murattal', qiraat: 'Hafs', language: 'ar' },
  { providerId: 'quran-foundation', providerReciterId: 17, canonicalReciterKey: 'raad-mohammad-al-kurdi', name: 'Raad Mohammad al-Kurdi', style: 'Murattal', qiraat: 'Hafs', language: 'ar' },
  { providerId: 'quran-foundation', providerReciterId: 18, canonicalReciterKey: 'nasser-al-qatami', name: 'Nasser Al-Qatami', style: 'Murattal', qiraat: 'Hafs', language: 'ar' },
  { providerId: 'quran-foundation', providerReciterId: 19, canonicalReciterKey: 'ahmad-al-ajmy', name: 'Ahmad al-Ajmy', style: 'Murattal', qiraat: 'Hafs', language: 'ar' },
  { providerId: 'quran-foundation', providerReciterId: 20, canonicalReciterKey: 'fares-abbad', name: 'Fares Abbad', style: 'Murattal', qiraat: 'Hafs', language: 'ar' },
];

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

      // Try local backend proxy first, then fallback to Quran.com direct
      const endpoints = [
        '/api/quran/reciters',
        'https://api.quran.com/api/v4/resources/chapter_reciters?language=en'
      ];

      for (const endpoint of endpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);
          const response = await fetch(endpoint, { 
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data.reciters) && data.reciters.length > 0) {
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
            }
          }
        } catch {
          // Continue to next endpoint or fallback
        }
      }

      // If remote endpoints are rate-limited or 503, smoothly fall back to canonical verified reciters
      this.qaris.set(providerId, CANONICAL_FALLBACK_RECITERS);
      return CANONICAL_FALLBACK_RECITERS;
    }
    return [];
  }

  public normalizeName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  }
}

export const qariProviderRegistry = new QariProviderRegistry();
