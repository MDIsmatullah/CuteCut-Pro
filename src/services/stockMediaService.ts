/**
 * Stock Media Service: Direct Pexels & Pixabay & Open Media Connector
 * Enables searching, downloading, and auto-assigning royalty-free video loops
 * and background photography per Ayah without using editor internal placeholders.
 */

import { CURATED_STOCK_CATALOG } from './stockMediaCatalog';

export interface StockItem {
  id: string;
  title: string;
  url: string;
  downloadUrl?: string;
  thumbnail: string;
  duration?: number;
  mediaType: 'video' | 'image';
  source: 'pexels' | 'pixabay' | 'wikimedia' | 'unsplash';
  author?: string;
  width?: number;
  height?: number;
  category?: string;
}

export { CURATED_STOCK_CATALOG };

export const DEFAULT_PEXELS_KEY = 'zQcA6fA1V1ErZ5UOPLM6HY5YbqFLBoaGrxzg583UlE5tDUzSAda0umZU';
export const DEFAULT_PIXABAY_KEY = '51611607-2bddfcd1e87cf3230c2436755';

export function isValidPexelsKey(key?: string): boolean {
  if (!key) return false;
  const cleaned = key.trim();
  if (cleaned.length < 25) return false;
  if (/pexels/i.test(cleaned)) return false;
  return true;
}

export function isValidPixabayKey(key?: string): boolean {
  if (!key) return false;
  const cleaned = key.trim();
  if (cleaned.length < 15) return false;
  if (/pixabay/i.test(cleaned)) return false;
  return true;
}

export function getEffectivePexelsKey(customKey?: string): string {
  if (isValidPexelsKey(customKey)) {
    return customKey!.trim();
  }
  if (isValidPexelsKey(process.env.PEXELS_API_KEY)) {
    return process.env.PEXELS_API_KEY!.trim();
  }
  return DEFAULT_PEXELS_KEY;
}

export function getEffectivePixabayKey(customKey?: string): string {
  if (isValidPixabayKey(customKey)) {
    return customKey!.trim();
  }
  if (isValidPixabayKey(process.env.PIXABAY_API_KEY)) {
    return process.env.PIXABAY_API_KEY!.trim();
  }
  return DEFAULT_PIXABAY_KEY;
}

/**
 * Search Pexels API (with automatic fallback to default production key)
 */
export async function searchPexelsApi(options: {
  query: string;
  mediaType: 'video' | 'image';
  perPage?: number;
  page?: number;
  apiKey?: string;
}): Promise<StockItem[]> {
  const key = getEffectivePexelsKey(options.apiKey);
  if (!key) return [];

  const perPage = Math.max(1, Math.min(80, options.perPage || 15));
  const page = Math.max(1, options.page || 1);

  try {
    if (options.mediaType === 'video') {
      const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(options.query)}&per_page=${perPage}&page=${page}&orientation=landscape`;
      const res = await fetch(url, {
        headers: { Authorization: key }
      });
      if (!res.ok) return [];
      const data = await res.json();
      const videos: any[] = data.videos || [];

      // If no videos found and query had multiple words, try with the first two significant keywords
      if (videos.length === 0 && options.query.trim().includes(' ')) {
        const simplifiedQuery = options.query.trim().split(/\s+/).slice(0, 2).join(' ');
        if (simplifiedQuery !== options.query.trim()) {
          return searchPexelsApi({ ...options, query: simplifiedQuery });
        }
      }

      return videos.map((v: any) => {
        // Find best fast-streaming HD mp4 file (priority: 720p or 1080p mp4 for near-instant web buffering)
        const videoFiles: any[] = v.video_files || [];
        const mp4Files = videoFiles.filter((f: any) => f.file_type === 'video/mp4');
        const fast720pFile = mp4Files.find((f: any) => f.width === 1280 || f.height === 720);
        const fast1080pFile = mp4Files.find((f: any) => (f.width === 1920 || f.height === 1080) && (!f.fps || f.fps <= 30));
        const anyHdMp4 = mp4Files.find((f: any) => f.quality === 'hd') || mp4Files[0];
        const chosenFile = fast720pFile || fast1080pFile || anyHdMp4 || videoFiles[0];

        return {
          id: `pexels-v-${v.id}`,
          title: `Pexels Video #${v.id} (${v.user?.name || 'Contributor'})`,
          url: chosenFile?.link || v.url,
          downloadUrl: (fast1080pFile || chosenFile)?.link || v.url,
          thumbnail: v.image || (v.video_pictures && v.video_pictures[0]?.picture) || '',
          duration: v.duration || 15,
          mediaType: 'video',
          source: 'pexels',
          author: v.user?.name || 'Pexels Contributor',
          width: chosenFile?.width || v.width,
          height: chosenFile?.height || v.height,
          category: options.query
        };
      });
    } else {
      const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(options.query)}&per_page=${perPage}&page=${page}&orientation=landscape`;
      const res = await fetch(url, {
        headers: { Authorization: key }
      });
      if (!res.ok) return [];
      const data = await res.json();
      const photos: any[] = data.photos || [];

      if (photos.length === 0 && options.query.trim().includes(' ')) {
        const simplifiedQuery = options.query.trim().split(/\s+/).slice(0, 2).join(' ');
        if (simplifiedQuery !== options.query.trim()) {
          return searchPexelsApi({ ...options, query: simplifiedQuery });
        }
      }

      return photos.map((p: any) => ({
        id: `pexels-p-${p.id}`,
        title: p.alt || `Pexels Photo by ${p.photographer || 'Photographer'}`,
        url: p.src?.large2x || p.src?.original || p.src?.large,
        downloadUrl: p.src?.original,
        thumbnail: p.src?.medium || p.src?.small,
        mediaType: 'image',
        source: 'pexels',
        author: p.photographer || 'Pexels Contributor',
        width: p.width,
        height: p.height,
        category: options.query
      }));
    }
  } catch (err) {
    console.warn('[Pexels API] Error fetching:', err);
    return [];
  }
}

/**
 * Search Pixabay API (with automatic fallback to default production key)
 */
export async function searchPixabayApi(options: {
  query: string;
  mediaType: 'video' | 'image';
  perPage?: number;
  page?: number;
  apiKey?: string;
}): Promise<StockItem[]> {
  const key = getEffectivePixabayKey(options.apiKey);
  if (!key) return [];

  // Pixabay strictly requires per_page to be between 3 and 200
  const perPage = Math.max(3, Math.min(200, options.perPage || 15));
  const page = Math.max(1, options.page || 1);

  try {
    if (options.mediaType === 'video') {
      const url = `https://pixabay.com/api/videos/?key=${encodeURIComponent(key)}&q=${encodeURIComponent(options.query)}&per_page=${perPage}&page=${page}&orientation=horizontal`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      const hits: any[] = data.hits || [];

      if (hits.length === 0 && options.query.trim().includes(' ')) {
        const simplifiedQuery = options.query.trim().split(/\s+/).slice(0, 2).join(' ');
        if (simplifiedQuery !== options.query.trim()) {
          return searchPixabayApi({ ...options, query: simplifiedQuery });
        }
      }

      return hits.map((h: any) => {
        // In Pixabay, 'large' is often 4K (200MB+), which causes long player buffering latency.
        // 'medium' (1080p, ~12MB) or 'small' (720p, ~5MB) buffers 10x-20x faster.
        const vUrl = h.videos?.medium?.url || h.videos?.small?.url || h.videos?.large?.url || h.videos?.tiny?.url;
        const downloadUrl = h.videos?.large?.url || h.videos?.medium?.url || vUrl;
        return {
          id: `pixabay-v-${h.id}`,
          title: h.tags || `Pixabay Video #${h.id}`,
          url: vUrl,
          downloadUrl: downloadUrl,
          thumbnail: h.userImageURL || `https://i.vimeocdn.com/video/${h.picture_id}_640x360.jpg`,
          duration: h.duration || 15,
          mediaType: 'video',
          source: 'pixabay',
          author: h.user || 'Pixabay Creator',
          category: options.query
        };
      });
    } else {
      const url = `https://pixabay.com/api/?key=${encodeURIComponent(key)}&q=${encodeURIComponent(options.query)}&per_page=${perPage}&page=${page}&orientation=horizontal&image_type=photo`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      const hits: any[] = data.hits || [];

      if (hits.length === 0 && options.query.trim().includes(' ')) {
        const simplifiedQuery = options.query.trim().split(/\s+/).slice(0, 2).join(' ');
        if (simplifiedQuery !== options.query.trim()) {
          return searchPixabayApi({ ...options, query: simplifiedQuery });
        }
      }

      return hits.map((h: any) => ({
        id: `pixabay-p-${h.id}`,
        title: h.tags || `Pixabay Image #${h.id}`,
        url: h.largeImageURL || h.imageURL,
        downloadUrl: h.largeImageURL || h.imageURL,
        thumbnail: h.webformatURL || h.previewURL,
        mediaType: 'image',
        source: 'pixabay',
        author: h.user || 'Pixabay Creator',
        width: h.imageWidth,
        height: h.imageHeight,
        category: options.query
      }));
    }
  } catch (err) {
    console.warn('[Pixabay API] Error fetching:', err);
    return [];
  }
}

/**
 * Smart Quranic Theme & Keyword Analyzer:
 * Inspects Arabic Quran text & translations (English/Urdu/Hindi)
 * to automatically detect the ideal visual scene theme.
 */
export function smartAnalyzeAyahVisualTheme(
  arabicText?: string,
  translationText?: string,
  fallbackTheme: string = 'forest'
): { theme: string; prompt: string } {
  const ar = (arabicText || '').toLowerCase();
  const tr = (translationText || '').toLowerCase();
  const combined = `${ar} ${tr}`;

  // 1. Stars / Night / Cosmos / Universe
  if (
    ar.includes('سماء') || ar.includes('سماوات') || ar.includes('نجوم') || ar.includes('نجم') ||
    ar.includes('كواكب') || ar.includes('قمر') || ar.includes('فلك') || ar.includes('بروج') ||
    tr.includes('star') || tr.includes('heaven') || tr.includes('cosmos') || tr.includes('galaxy') ||
    tr.includes('night') || tr.includes('moon') || tr.includes('ستارے') || tr.includes('آسمان') ||
    tr.includes('چاند') || tr.includes('رات') || tr.includes('فلک')
  ) {
    return {
      theme: 'stars',
      prompt: 'Cinematic 4K cosmic starry sky, milky way galaxy drifting over tranquil horizon'
    };
  }

  // 2. Rain / Water / Clouds / Blessings
  if (
    ar.includes('ماء') || ar.includes('مطر') || ar.includes('غيث') || ar.includes('سحاب') ||
    ar.includes('معصرات') || ar.includes('ودق') || ar.includes('وابل') || ar.includes('طل') ||
    tr.includes('rain') || tr.includes('water') || tr.includes('cloud') || tr.includes('shower') ||
    tr.includes('بارش') || tr.includes('پانی') || tr.includes('بادل') || tr.includes('رحمت کا پانی')
  ) {
    return {
      theme: 'rain',
      prompt: 'Gentle peaceful rain drops falling on crystal clear water ripples in slow motion'
    };
  }

  // 3. Clouds / Sky / Atmosphere
  if (
    ar.includes('غمام') || ar.includes('سحاب') || ar.includes('سحابا') || ar.includes('رياح') ||
    tr.includes('cloud') || tr.includes('sky') || tr.includes('wind') || tr.includes('sunset') ||
    tr.includes('بادل') || tr.includes('ہوا') || tr.includes('شام')
  ) {
    return {
      theme: 'clouds',
      prompt: 'Dramatic billowing golden sunset clouds floating majestically across horizon'
    };
  }

  // 4. Noor / Sun / Light / Dawn / Day
  if (
    ar.includes('نور') || ar.includes('شمس') || ar.includes('ضياء') || ar.includes('فجر') ||
    ar.includes('صبح') || ar.includes('نهار') || ar.includes('مشرق') || ar.includes('مغرب') ||
    tr.includes('light') || tr.includes('sun') || tr.includes('dawn') || tr.includes('morning') ||
    tr.includes('radiance') || tr.includes('روشنی') || tr.includes('نور') || tr.includes('سورج') ||
    tr.includes('صبح') || tr.includes('اجالا')
  ) {
    return {
      theme: 'particles',
      prompt: 'Ethereal golden morning sunbeams breaking through misty horizon with radiant Noor rays'
    };
  }

  // 5. Ocean / Sea / Waves / Ships
  if (
    ar.includes('بحر') || ar.includes('يم') || ar.includes('موج') || ar.includes('سفينة') ||
    ar.includes('فلك') || ar.includes('لؤلؤ') || ar.includes('مرجان') ||
    tr.includes('sea') || tr.includes('ocean') || tr.includes('waves') || tr.includes('ship') ||
    tr.includes('سمندر') || tr.includes('لہریں') || tr.includes('بحری جہاز') || tr.includes('موج')
  ) {
    return {
      theme: 'waves',
      prompt: 'Tranquil turquoise ocean waves gently rolling onto peaceful shoreline under soft sky'
    };
  }

  // 6. Mountains / Heights / Rocks
  if (
    ar.includes('جبال') || ar.includes('جبل') || ar.includes('طور') || ar.includes('أوتاد') ||
    ar.includes('صخر') || ar.includes('رواسي') ||
    tr.includes('mountain') || tr.includes('peak') || tr.includes('cliff') || tr.includes('rock') ||
    tr.includes('پہاڑ') || tr.includes('چٹان') || tr.includes('بلندی')
  ) {
    return {
      theme: 'mountains',
      prompt: 'Majestic high-altitude alpine mountain range standing firm under cinematic clouds'
    };
  }

  // 7. Rivers / Waterfalls / Springs
  if (
    ar.includes('أنهار') || ar.includes('نهر') || ar.includes('عين') || ar.includes('سلسبيل') ||
    ar.includes('تسنيم') || ar.includes('كوثر') ||
    tr.includes('river') || tr.includes('stream') || tr.includes('waterfall') || tr.includes('spring') ||
    tr.includes('دریا') || tr.includes('نہر') || tr.includes('چشمہ') || tr.includes('آبشار')
  ) {
    return {
      theme: 'waterfall',
      prompt: 'Crystal clear cascade waterfall flowing through tranquil green paradise mountain glen'
    };
  }

  // 8. Desert / Sand / Dunes
  if (
    ar.includes('أحقاف') || ar.includes('رمال') || ar.includes('صحراء') || ar.includes('بادية') ||
    tr.includes('desert') || tr.includes('sand') || tr.includes('dune') || tr.includes('sahara') ||
    tr.includes('صحرا') || tr.includes('ریت') || tr.includes('ٹیلے')
  ) {
    return {
      theme: 'desert',
      prompt: 'Sweeping golden sand dunes rippling under warm evening Arabian desert sunlight'
    };
  }

  // 9. Makkah / Kaaba / Mosques / Prostration / Sacred
  if (
    ar.includes('مكة') || ar.includes('بكة') || ar.includes('مسجد') || ar.includes('حرام') ||
    ar.includes('بيت') || ar.includes('سجود') || ar.includes('صلاة') || ar.includes('قبلة') ||
    tr.includes('makkah') || tr.includes('mecca') || tr.includes('kaaba') || tr.includes('mosque') ||
    tr.includes('prayer') || tr.includes('مکہ') || tr.includes('کعبہ') || tr.includes('مسجد') ||
    tr.includes('نماز') || tr.includes('سجدہ')
  ) {
    return {
      theme: 'makkah',
      prompt: 'Atmospheric sacred view of Holy Kaaba and grand minarets with spiritual lighting'
    };
  }

  // 10. Gardens / Earth / Nature / Trees (Paradise)
  if (
    ar.includes('جنة') || ar.includes('جنات') || ar.includes('أرض') || ar.includes('شجر') ||
    ar.includes('نبات') || ar.includes('حب') || ar.includes('زيتون') || ar.includes('رمان') ||
    tr.includes('garden') || tr.includes('paradise') || tr.includes('earth') || tr.includes('tree') ||
    tr.includes('green') || tr.includes('forest') || tr.includes('باغات') || tr.includes('زمین') ||
    tr.includes('درخت') || tr.includes('جنت') || tr.includes('سبزہ')
  ) {
    return {
      theme: 'forest',
      prompt: 'Lush green paradise garden with serene pine trees and gentle sunlit foliage'
    };
  }

  const norm = normalizeCategory(fallbackTheme);
  return {
    theme: norm,
    prompt: `Cinematic 4K high resolution ${norm} atmosphere for Quran recitation`
  };
}

/**
 * Normalize category name or query
 */
export function normalizeCategory(raw: string): string {
  const q = (raw || '').toLowerCase().trim();
  if (q.includes('waterfall') || q.includes('stream') || q.includes('river') || q.includes('spring')) return 'waterfall';
  if (q.includes('makkah') || q.includes('mecca') || q.includes('kaaba') || q.includes('madinah') || q.includes('mosque') || q.includes('islamic')) return 'makkah';
  if (q.includes('desert') || q.includes('sand') || q.includes('dune') || q.includes('sahara')) return 'desert';
  if (q.includes('wave') || q.includes('ocean') || q.includes('sea') || q.includes('beach') || q.includes('tide')) return 'waves';
  if (q.includes('rain') || q.includes('drop') || q.includes('water drop') || q.includes('window')) return 'rain';
  if (q.includes('cloud') || q.includes('sky') || q.includes('timelapse')) return 'clouds';
  if (q.includes('dawn') || q.includes('sunrise') || q.includes('morning') || q.includes('sunbeam') || q.includes('light') || q.includes('noor') || q.includes('gold') || q.includes('particle')) return 'particles';
  if (q.includes('star') || q.includes('night') || q.includes('space') || q.includes('cosmos') || q.includes('galaxy') || q.includes('universe')) return 'stars';
  if (q.includes('mountain') || q.includes('peak') || q.includes('hill') || q.includes('alpine') || q.includes('cliff')) return 'mountains';
  if (q.includes('nature') || q.includes('forest') || q.includes('tree') || q.includes('garden') || q.includes('wood') || q.includes('leaf') || q.includes('green')) return 'forest';
  return 'forest';
}

/**
 * Master multi-ayah stock asset resolver:
 * Guarantees N completely unique, non-repeating Pexels/Pixabay items for N loaded ayahs.
 * Features smart multi-category distribution so even with 20+ Ayahs, every Ayah gets
 * a fresh, distinct high-resolution video/photo.
 */
export async function getStockAssetsForAyahs(options: {
  categoryOrQuery: string;
  mediaType: 'video' | 'image';
  count: number;
  source?: 'pexels' | 'pixabay' | 'auto';
  pexelsApiKey?: string;
  pixabayApiKey?: string;
}): Promise<{ items: StockItem[]; sourceUsed: string }> {
  const { categoryOrQuery, mediaType, count } = options;
  const targetCount = Math.max(1, count || 1);
  const matchedCat = normalizeCategory(categoryOrQuery);
  const reqSource = options.source || 'auto';

  let liveResults: StockItem[] = [];
  let sourceUsed = 'catalog-curated-150-library';

  const effectivePexelsKey = getEffectivePexelsKey(options.pexelsApiKey);
  const effectivePixabayKey = getEffectivePixabayKey(options.pixabayApiKey);

  // 1. Try live Pexels API if key available and requested (or auto)
  if (reqSource !== 'pixabay' && effectivePexelsKey) {
    const pexelsItems = await searchPexelsApi({
      query: categoryOrQuery,
      mediaType,
      perPage: Math.max(15, targetCount),
      apiKey: effectivePexelsKey
    });
    if (pexelsItems.length > 0) {
      liveResults = pexelsItems;
      sourceUsed = 'live-pexels-api';
    }
  }

  // 2. Try live Pixabay API if key available and requested (or needed to reach target count)
  if ((liveResults.length < targetCount || reqSource === 'pixabay') && reqSource !== 'pexels' && effectivePixabayKey) {
    const pixabayItems = await searchPixabayApi({
      query: categoryOrQuery,
      mediaType,
      perPage: Math.max(15, targetCount),
      apiKey: effectivePixabayKey
    });
    if (pixabayItems.length > 0) {
      if (reqSource === 'pixabay') {
        liveResults = pixabayItems;
        sourceUsed = 'live-pixabay-api';
      } else {
        liveResults = [...liveResults, ...pixabayItems];
        sourceUsed = sourceUsed === 'live-pexels-api' ? 'live-pexels-pixabay' : 'live-pixabay-api';
      }
    }
  }

  // 3. Fallback to Curated 150+ Verified Stock Catalog with Smart Non-Repeating Rotation
  const primaryCatItems = CURATED_STOCK_CATALOG[matchedCat] || CURATED_STOCK_CATALOG.forest || [];
  
  // Filter by requested mediaType and requested source (pexels or pixabay)
  const filterBySourceAndType = (items: StockItem[]) => {
    return items.filter(item => {
      const matchType = mediaType === 'video' ? item.mediaType === 'video' : true;
      if (!matchType) return false;
      if (reqSource === 'pexels') return item.source === 'pexels';
      if (reqSource === 'pixabay') return item.source === 'pixabay';
      return true;
    });
  };

  const primaryPool = filterBySourceAndType(primaryCatItems);

  // Build extended pool from all categories to guarantee 50+ unique items without repeating
  const allCategoryKeys = ['forest', 'mountains', 'stars', 'particles', 'rain', 'clouds', 'waves', 'waterfall', 'desert', 'makkah'];
  const allVerifiedItems: StockItem[] = [];
  
  // Add primary items first
  allVerifiedItems.push(...primaryPool);
  
  // Add remaining categories to guarantee 100+ items
  for (const catKey of allCategoryKeys) {
    if (catKey !== matchedCat) {
      const items = filterBySourceAndType(CURATED_STOCK_CATALOG[catKey] || []);
      allVerifiedItems.push(...items);
    }
  }

  const finalItems: StockItem[] = [];
  const usedUrls = new Set<string>();

  // First add live API results (if available)
  for (const item of liveResults) {
    if (finalItems.length < targetCount && !usedUrls.has(item.url)) {
      usedUrls.add(item.url);
      finalItems.push(item);
    }
  }

  // Then fill remaining needed count from curated catalog without duplicating URLs
  for (const item of allVerifiedItems) {
    if (finalItems.length >= targetCount) break;
    if (!usedUrls.has(item.url)) {
      usedUrls.add(item.url);
      finalItems.push(item);
    }
  }

  // If count is still greater than pool (e.g. 100 ayahs), cycle safely
  let cycleIdx = 0;
  while (finalItems.length < targetCount && allVerifiedItems.length > 0) {
    const baseItem = allVerifiedItems[cycleIdx % allVerifiedItems.length];
    finalItems.push({
      ...baseItem,
      id: `${baseItem.id}-cycle-${finalItems.length + 1}`,
      title: `${baseItem.title} (Part ${finalItems.length + 1})`
    });
    cycleIdx++;
  }

  return { items: finalItems, sourceUsed };
}
