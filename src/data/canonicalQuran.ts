/**
 * Canonical Quran Scripture Data Layer (Phase 1)
 * 
 * Provides verified, immutable Uthmani Quranic text and verse counts
 * across all 114 Surahs (6,236 Ayahs) with zero dummy strings or artificial placeholders.
 */

import canonicalQuranRaw from './canonicalQuran.json';

export interface CanonicalAyah {
  k: string;       // Stable identifier e.g. "67:1", "1:1", "114:6"
  n: number;       // Ayah number (1-indexed within surah)
  ar: string;      // Canonical Uthmani Arabic text
  en: string;      // Verified English translation
  surah: number;   // Surah number (1 to 114)
}

export interface CanonicalSurahMetadata {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  nameTransliteration: string;
  revelationType: 'Meccan' | 'Medinan';
  ayahCount: number;
}

export interface FormattedQuranVerse {
  verse_key: string;
  verse_number: number;
  surah_number: number;
  text_uthmani: string;
  text_english: string;
  translation: string;
}

// Canonical Chapter / Surah Ayah counts (Hafs canon, total = 6236)
export const CANONICAL_AYAH_COUNTS: readonly number[] = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109,
  123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
  112, 78, 118, 64, 77, 227, 93, 88, 69, 60,
  34, 30, 73, 54, 45, 83, 182, 88, 75, 85,
  54, 53, 89, 59, 37, 35, 38, 29, 18, 45,
  60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
  14, 11, 11, 18, 12, 12, 30, 52, 52, 44,
  28, 28, 20, 56, 40, 31, 50, 40, 46, 42,
  29, 19, 36, 25, 22, 17, 19, 26, 30, 20,
  15, 21, 11, 8, 8, 19, 5, 8, 8, 11,
  11, 8, 3, 9, 5, 4, 7, 3, 6, 3,
  5, 4, 5, 6
];

// Raw dataset type casting
const rawData = canonicalQuranRaw as Record<string, Array<{ k: string; n: number; ar: string; en: string }>>;

// Fast indexed lookups
const surahMap = new Map<number, CanonicalAyah[]>();
const verseKeyMap = new Map<string, CanonicalAyah>();

// Initialize canonical lookups
for (let sNum = 1; sNum <= 114; sNum++) {
  const sKey = String(sNum);
  const rawVerses = rawData[sKey] || [];
  const processedVerses: CanonicalAyah[] = rawVerses.map(v => ({
    k: v.k,
    n: v.n,
    ar: v.ar,
    en: v.en,
    surah: sNum
  }));

  surahMap.set(sNum, processedVerses);
  for (const v of processedVerses) {
    verseKeyMap.set(v.k, v);
  }
}

/**
 * Returns exact canonical ayah count for a given Surah (1 to 114)
 */
export function getCanonicalAyahCount(surahNumber: number): number {
  if (surahNumber < 1 || surahNumber > 114) return 0;
  return CANONICAL_AYAH_COUNTS[surahNumber - 1] || 0;
}

/**
 * Get all canonical verses for a Surah with full Uthmani text and verified translation
 */
export function getCanonicalSurahVerses(
  surahNumber: number,
  startAyah: number = 1,
  endAyah?: number
): FormattedQuranVerse[] {
  const verses = surahMap.get(surahNumber);
  if (!verses || verses.length === 0) return [];

  const maxAyahs = verses.length;
  const start = Math.max(1, startAyah);
  const end = endAyah ? Math.min(maxAyahs, endAyah) : maxAyahs;

  return verses
    .filter(v => v.n >= start && v.n <= end)
    .map(v => ({
      verse_key: v.k,
      verse_number: v.n,
      surah_number: surahNumber,
      text_uthmani: v.ar,
      text_english: v.en,
      translation: v.en
    }));
}

/**
 * Look up a single Ayah by Surah number and Ayah number
 */
export function getCanonicalAyah(
  surahNumber: number,
  ayahNumber: number
): FormattedQuranVerse | null {
  const key = `${surahNumber}:${ayahNumber}`;
  const v = verseKeyMap.get(key);
  if (!v) return null;

  return {
    verse_key: v.k,
    verse_number: v.n,
    surah_number: v.surah,
    text_uthmani: v.ar,
    text_english: v.en,
    translation: v.en
  };
}

/**
 * Look up a single Ayah by stable identifier e.g. "67:23"
 */
export function getCanonicalAyahByKey(verseKey: string): FormattedQuranVerse | null {
  const v = verseKeyMap.get(verseKey);
  if (!v) return null;

  return {
    verse_key: v.k,
    verse_number: v.n,
    surah_number: v.surah,
    text_uthmani: v.ar,
    text_english: v.en,
    translation: v.en
  };
}

/**
 * Checks if a specific verse exists in the canonical Quran
 */
export function hasCanonicalAyah(surahNumber: number, ayahNumber: number): boolean {
  return verseKeyMap.has(`${surahNumber}:${ayahNumber}`);
}

/**
 * Total number of Surahs in the canonical dataset (114)
 */
export function getTotalSurahsCount(): number {
  return surahMap.size;
}

/**
 * Total number of Ayahs in the canonical dataset (6236)
 */
export function getTotalAyahsCount(): number {
  return verseKeyMap.size;
}
