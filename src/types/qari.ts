export interface QariProvider {
  id: string;
  name: string;
  apiVersion: string;
  documentationUrl: string;
  licenseStatus: 'open' | 'restricted' | 'unknown';
  attribution: string;
  offlineAllowed: boolean;
  redistributionAllowed: boolean;
}

export interface Qari {
  providerId: string;
  providerReciterId: number;
  canonicalReciterKey: string;
  name: string;
  style: string;
  qiraat: string;
  language: string;
  metadata?: Record<string, any>;
}

export interface QariSurahAudio {
  providerId: string;
  providerReciterId: number;
  surahNumber: number;
  audioId: number;
  format: string;
  durationMs: number;
  audioUrl: string;
  fileSize?: number;
  checksum?: string;
  retrievedAt: number;
}

export interface AyahTiming {
  providerId: string;
  providerReciterId: number;
  surahNumber: number;
  verseKey: string; // "67:1"
  startMs: number;
  endMs: number;
  durationMs: number;
  source: string;
  confidence: number;
  provenance: 'provider-verified' | 'provider-derived' | 'acoustic-vad' | 'dp-derived' | 'observed' | 'interpolated' | 'legacy-fallback';
  wordTimings?: WordTiming[];
}

export interface WordTiming {
  providerId: string;
  providerReciterId: number;
  verseKey: string;
  wordIndex: number;
  startMs: number;
  endMs: number;
  source: string;
  provenance: string;
}

export interface QariDatabase {
  providers: QariProvider[];
  qaris: Qari[];
}

export interface ReferencePrior {
  verseKey: string;
  expectedStartMs: number;
  expectedEndMs: number;
  confidence: number;
  provenance: string;
}
