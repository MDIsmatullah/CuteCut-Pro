/**
 * Offline Storage & IndexedDB Caching Utility
 * Provides lightning-fast local persistence for Quran verses, audio buffers, translations, and project metadata
 * Works seamlessly in both Online, Offline, and Desktop Electron packaged environments.
 */

const DB_NAME = 'AIQuranVideoEditor_OfflineDB';
const DB_VERSION = 1;
const STORES = {
  VERSES: 'quran_verses_cache',
  TRANSLATIONS: 'quran_translations_cache',
  AUDIO_BUFFERS: 'audio_waveform_cache',
  APP_PRESETS: 'app_presets_cache'
};

let dbPromise: Promise<IDBDatabase | null> | null = null;

function getIDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      try {
        const req = window.indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(STORES.VERSES)) {
            db.createObjectStore(STORES.VERSES, { keyPath: 'key' });
          }
          if (!db.objectStoreNames.contains(STORES.TRANSLATIONS)) {
            db.createObjectStore(STORES.TRANSLATIONS, { keyPath: 'key' });
          }
          if (!db.objectStoreNames.contains(STORES.AUDIO_BUFFERS)) {
            db.createObjectStore(STORES.AUDIO_BUFFERS, { keyPath: 'key' });
          }
          if (!db.objectStoreNames.contains(STORES.APP_PRESETS)) {
            db.createObjectStore(STORES.APP_PRESETS, { keyPath: 'key' });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => {
          console.warn('[OfflineStorage] IndexedDB open error, falling back to memory/localStorage:', req.error);
          resolve(null);
        };
      } catch (err) {
        console.warn('[OfflineStorage] IndexedDB initialization failed:', err);
        resolve(null);
      }
    });
  }
  return dbPromise;
}

/**
 * Cache and retrieve data from IndexedDB with Memory/LocalStorage fallback
 */
export async function getCachedItem<T>(storeName: string, key: string): Promise<T | null> {
  try {
    const db = await getIDB();
    if (!db) {
      const fallback = localStorage.getItem(`cache_${storeName}_${key}`);
      return fallback ? JSON.parse(fallback) : null;
    }
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result ? req.result.data : null);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  } catch {
    return null;
  }
}

export async function setCachedItem<T>(storeName: string, key: string, data: T): Promise<void> {
  try {
    const db = await getIDB();
    if (!db) {
      try {
        localStorage.setItem(`cache_${storeName}_${key}`, JSON.stringify(data));
      } catch {
        // quota exceeded fallback
      }
      return;
    }
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.put({ key, data, updatedAt: Date.now() });
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  } catch {
    // Ignore cache set errors
  }
}

/**
 * High-speed cached Quran verses accessor
 */
export async function getCachedSurahVerses(surahNum: number): Promise<any[] | null> {
  return getCachedItem<any[]>(STORES.VERSES, `surah_${surahNum}`);
}

export async function setCachedSurahVerses(surahNum: number, verses: any[]): Promise<void> {
  return setCachedItem(STORES.VERSES, `surah_${surahNum}`, verses);
}

/**
 * High-speed cached translation accessor
 */
export async function getCachedTranslation(verseKey: string, lang: string): Promise<string | null> {
  return getCachedItem<string>(STORES.TRANSLATIONS, `trans_${verseKey}_${lang}`);
}

export async function setCachedTranslation(verseKey: string, lang: string, text: string): Promise<void> {
  return setCachedItem(STORES.TRANSLATIONS, `trans_${verseKey}_${lang}`, text);
}

/**
 * High-speed Audio Waveform channel float array caching
 */
export async function getCachedAudioChannel(url: string): Promise<Float32Array | null> {
  const cached = await getCachedItem<number[]>(STORES.AUDIO_BUFFERS, `audio_${url}`);
  if (cached && Array.isArray(cached)) {
    return new Float32Array(cached);
  }
  return null;
}

export async function setCachedAudioChannel(url: string, data: Float32Array): Promise<void> {
  // Store decimated or compressed sample array for storage efficiency
  const sampleArray = Array.from(data.subarray(0, Math.min(data.length, 500000)));
  return setCachedItem(STORES.AUDIO_BUFFERS, `audio_${url}`, sampleArray);
}
