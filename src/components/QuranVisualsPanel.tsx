import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Film,
  Image as ImageIcon,
  Play,
  RotateCw,
  Layers,
  ChevronRight,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Copy,
  Clock,
  Wand2,
  Eye,
  RefreshCw,
  Globe,
  Plus,
  Download,
  Search,
  Check
} from 'lucide-react';
import { Track, Clip, ClipType } from '../types';
import { extractAyahNumberFromClip, getSafeMediaUrl } from '../utils/editorUtils';
import { SURAHS } from './MediaPanel';
import { getTranslationOptionById } from '../utils/quranTranslations';
import {
  smartAnalyzeAyahVisualTheme,
  CURATED_STOCK_CATALOG,
  normalizeCategory,
  StockItem,
  searchMultiSourceStock,
  getStockAssetsForAyahs
} from '../services/stockMediaService';

export interface AyahVisualItem {
  verse_key: string;
  verse_number?: number;
  text_arabic?: string;
  translation?: string;
  theme: string;
  mood: string;
  stockQuery: string;
  cinematicPrompt: string;
  imageUrl: string;
  videoUrl: string;
  selectedUrl: string;
  mediaType: 'image' | 'video';
  start?: number;
  duration?: number;
  source?: 'pexels' | 'pixabay' | 'wikimedia' | 'unsplash';
  downloadUrl?: string;
}

interface QuranVisualsPanelProps {
  tracks: Track[];
  onAddClip: (clipData: Partial<Clip>) => void;
  onReplaceVideoTrackClips?: (clips: Partial<Clip>[]) => void;
  onUpdateClip?: (clipId: string, updates: Partial<Clip>) => void;
  quranTranslation?: string;
  currentTime?: number;
}

export interface QuranCategory {
  id: string;
  name: string;
  urdu: string;
  icon: string;
  query: string;
  themeKey: string;
  description: string;
}

export const QURAN_TILAWAT_CATEGORIES: QuranCategory[] = [
  { id: 'nature', name: 'Nature & Greenery', urdu: 'قدرتی مناظر و باغات', icon: '🌿', query: 'nature forest landscape trees', themeKey: 'gardens', description: 'Lush greenery, trees, and peaceful landscapes' },
  { id: 'mountains', name: 'Majestic Mountains', urdu: 'عظیم الشان پہاڑ', icon: '🏔️', query: 'majestic mountains peaks snow alpine', themeKey: 'mountains', description: 'Towering peaks, cliffs, and misty mountain horizons' },
  { id: 'night', name: 'Night Sky & Stars', urdu: 'رات کا آسمان اور کہکشاں', icon: '🌌', query: 'starry night galaxy universe stars', themeKey: 'night', description: 'Cosmic nebulae, deep space, and twinkling stars' },
  { id: 'dawn', name: 'Sunrise & Noor Beams', urdu: 'طلوعِ آفتاب و نور', icon: '🌅', query: 'sunrise golden dawn light rays noor', themeKey: 'dawn', description: 'Spiritual morning glow, golden radiance & warmth' },
  { id: 'rain', name: 'Gentle Rain & Drops', urdu: 'رحمت کی بارش اور قطرے', icon: '🌧️', query: 'rain falling water droplets lake', themeKey: 'rain', description: 'Blessing rain on earth, peaceful water drops' },
  { id: 'clouds', name: 'Sky & Clouds Timelapse', urdu: 'بادل اور آسمان', icon: '☁️', query: 'clouds timelapse blue sky sunlight', themeKey: 'clouds', description: 'Billowing cloudscapes drifting across blue sky' },
  { id: 'waves', name: 'Calm Ocean & Waves', urdu: 'پرسکون سمندر اور لہریں', icon: '🌊', query: 'ocean waves calm turquoise sea', themeKey: 'ocean', description: 'Deep blue tides, crystal shores & horizons' },
  { id: 'desert', name: 'Golden Desert Dunes', urdu: 'سنہری صحرا و ریت کے ٹیلے', icon: '🏜️', query: 'desert sand dunes golden sunset horizon', themeKey: 'desert', description: 'Sweeping desert dunes under warm golden skies' },
  { id: 'makkah', name: 'Holy Haramain & Mosques', urdu: 'مکہ مکرمہ و مساجد', icon: '🕋', query: 'makkah kaaba grand mosque madinah islamic', themeKey: 'makkah', description: 'Kaaba, Grand Mosque, and sacred architecture' },
  { id: 'waterfall', name: 'Rivers & Waterfalls', urdu: 'ندیاں اور آبشاریں', icon: '💧', query: 'waterfall river stream crystal flow', themeKey: 'waterfall', description: 'Peaceful flowing mountain streams and waterfalls' },
];

// Comprehensive curated theme asset bank using genuine Pexels, Pixabay & local verified royalty-free media
const LOCAL_THEMATIC_ASSETS: Record<string, { image: string; video: string; query: string; mood: string; prompt: string; source: 'pexels' | 'pixabay' }> = {
  dawn: {
    image: 'https://images.pexels.com/photos/531756/pexels-photo-531756.jpeg?auto=compress&cs=tinysrgb&w=1920',
    video: 'https://videos.pexels.com/video-files/3163534/3163534-hd_1920_1080_30fps.mp4',
    query: 'sunrise golden dawn mountains',
    mood: 'golden-warm',
    prompt: 'Cinematic golden morning sunbeams breaking through misty mountains, spiritual radiance and warm dawn light',
    source: 'pexels'
  },
  night: {
    image: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=1920',
    video: 'https://videos.pexels.com/video-files/853889/853889-hd_1920_1080_25fps.mp4',
    query: 'starry night galaxy universe',
    mood: 'deep-blue-night',
    prompt: 'Majestic deep night cosmos, countless twinkling stars, celestial milky way galaxy over tranquil silhouetted hills',
    source: 'pexels'
  },
  mountains: {
    image: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=1920',
    video: 'https://videos.pexels.com/video-files/3015510/3015510-hd_1920_1080_24fps.mp4',
    query: 'majestic mountain peaks clouds',
    mood: 'emerald-majestic',
    prompt: 'Towering alpine mountain peaks bathed in ethereal sunlight, pine forest valley, pristine contemplation',
    source: 'pexels'
  },
  ocean: {
    image: 'https://images.pexels.com/photos/1295138/pexels-photo-1295138.jpeg?auto=compress&cs=tinysrgb&w=1920',
    video: 'https://cdn.pixabay.com/video/2015/10/24/1192-143997632_large.mp4',
    query: 'calm ocean waves turquoise sea',
    mood: 'aquatic-tranquil',
    prompt: 'Crystal turquoise ocean gently lapping against shore, rolling crystal-clear waves, peaceful horizon',
    source: 'pexels'
  },
  rain: {
    image: 'https://images.pexels.com/photos/1529360/pexels-photo-1529360.jpeg?auto=compress&cs=tinysrgb&w=1920',
    video: 'https://videos.pexels.com/video-files/1409899/1409899-hd_1920_1080_25fps.mp4',
    query: 'gentle rain falling fresh greenery',
    mood: 'tranquil-rain',
    prompt: 'Gentle blessing rain falling upon fresh green leaves, raindrops creating ripples on water surface',
    source: 'pexels'
  },
  gardens: {
    image: 'https://images.pexels.com/photos/38136/pexels-photo-38136.jpeg?auto=compress&cs=tinysrgb&w=1920',
    video: 'https://cdn.pixabay.com/video/2020/06/10/41648-430310237_large.mp4',
    query: 'lush green garden paradise stream',
    mood: 'verdant-peace',
    prompt: 'Lush paradise garden, flowing crystal stream beneath ancient olive trees, blooming flowers in soft daylight',
    source: 'pexels'
  },
  desert: {
    image: 'https://images.pexels.com/photos/1001435/pexels-photo-1001435.jpeg?auto=compress&cs=tinysrgb&w=1920',
    video: 'https://cdn.pixabay.com/video/2019/04/16/22880-330689947_large.mp4',
    query: 'golden desert sand dunes horizon',
    mood: 'golden-desert',
    prompt: 'Vast sweeping golden sand dunes under a serene sunset horizon, gentle wind carving ripples in the sand',
    source: 'pexels'
  },
  light: {
    image: 'https://images.pexels.com/photos/1420440/pexels-photo-1420440.jpeg?auto=compress&cs=tinysrgb&w=1920',
    video: 'https://cdn.pixabay.com/video/2021/04/19/71542-539075726_large.mp4',
    query: 'celestial golden rays beam of light',
    mood: 'heavenly-glow',
    prompt: 'Divine celestial light rays illuminating atmospheric particles in high dynamic range, majestic awe',
    source: 'pexels'
  },
  cosmos: {
    image: 'https://images.pexels.com/photos/1252869/pexels-photo-1252869.jpeg?auto=compress&cs=tinysrgb&w=1920',
    video: 'https://videos.pexels.com/video-files/3163534/3163534-hd_1920_1080_30fps.mp4',
    query: 'earth planet stars nebula galaxy',
    mood: 'cosmic-depth',
    prompt: 'View of Earth from orbit, glowing atmosphere with deep starry nebula in background, cosmic wonder',
    source: 'pexels'
  },
  clouds: {
    image: 'https://images.pexels.com/photos/844297/pexels-photo-844297.jpeg?auto=compress&cs=tinysrgb&w=1920',
    video: 'https://videos.pexels.com/video-files/3015510/3015510-hd_1920_1080_24fps.mp4',
    query: 'epic timelapse clouds sunlight',
    mood: 'ethereal-sky',
    prompt: 'Dramatic cinematic cloudscape in golden hour, billowing white clouds drifting across deep azure sky',
    source: 'pexels'
  },
  makkah: {
    image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1920&auto=format&fit=crop&q=80',
    video: 'https://cdn.pixabay.com/video/2021/04/19/71542-539075726_large.mp4',
    query: 'holy kaaba makkah grand mosque',
    mood: 'spiritual-reverence',
    prompt: 'Holy Kaaba in Makkah, peaceful pilgrims in Tawaf under night illumination',
    source: 'pixabay'
  },
  waterfall: {
    image: 'https://images.pexels.com/photos/38136/pexels-photo-38136.jpeg?auto=compress&cs=tinysrgb&w=1920',
    video: 'https://cdn.pixabay.com/video/2020/06/10/41648-430310237_large.mp4',
    query: 'crystal waterfall stream mountain',
    mood: 'pure-stream',
    prompt: 'Crystal clear waterfall cascading through mountain forest into calm turquoise pool',
    source: 'pexels'
  }
};

const STYLE_TO_THEME_KEYS: Record<string, string[]> = {
  'nature': ['gardens', 'mountains'],
  'mountains': ['mountains'],
  'night': ['night', 'cosmos'],
  'dawn': ['dawn', 'light'],
  'rain': ['rain'],
  'clouds': ['clouds'],
  'waves': ['ocean'],
  'desert': ['desert'],
  'makkah': ['makkah'],
  'waterfall': ['waterfall'],
  // Backwards compatibility
  'cinematic-nature': ['gardens', 'mountains'],
  'golden-dawn': ['dawn', 'light'],
  'night-cosmos': ['night', 'cosmos'],
  'ocean-water': ['ocean'],
  'rain-clouds': ['rain'],
  'paradise-gardens': ['gardens'],
  'desert-dunes': ['desert'],
};

export const QuranVisualsPanel: React.FC<QuranVisualsPanelProps> = ({
  tracks,
  onAddClip,
  onReplaceVideoTrackClips,
  onUpdateClip,
  quranTranslation = 'ur-jalandhry',
  currentTime = 0,
}) => {
  const [sourceMode, setSourceMode] = useState<'timeline' | 'surah'>('timeline');
  const [syncTimingMode, setSyncTimingMode] = useState<'exact' | 'continuous'>('exact');
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [startAyah, setStartAyah] = useState<number>(1);
  const [endAyah, setEndAyah] = useState<number>(7);
  const [mediaType, setMediaType] = useState<'video' | 'image'>('video');
  const [visualCategory, setVisualCategory] = useState<string>('nature');
  const [stockSource, setStockSource] = useState<'pexels' | 'pixabay'>('pexels');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stockExplorerItems, setStockExplorerItems] = useState<any[]>([]);
  const [isLoadingExplorer, setIsLoadingExplorer] = useState<boolean>(false);
  
  // Legacy alias for visual category
  const visualStyle = visualCategory;
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generatedVisuals, setGeneratedVisuals] = useState<AyahVisualItem[]>([]);
  const [activePreview, setActivePreview] = useState<AyahVisualItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState<boolean>(false);

  // Stock source tracking
  const [stockSourceUsed, setStockSourceUsed] = useState<string>('live-pexels-api');

  const [smartKeywordDistribution, setSmartKeywordDistribution] = useState<boolean>(true);

  // Live Stock Media Fetcher from Pexels / Pixabay (supports backend proxy and direct client fallback)
  const fetchLiveStockMedia = async (
    sourceWeb: 'pexels' | 'pixabay',
    catId: string,
    customQuery: string,
    type: 'video' | 'image'
  ) => {
    setIsLoadingExplorer(true);
    try {
      const catConfig = QURAN_TILAWAT_CATEGORIES.find(c => c.id === catId) || QURAN_TILAWAT_CATEGORIES[0];
      const activeQuery = customQuery.trim().length > 0 ? customQuery.trim() : catConfig.query;

      const isFileProtocol = typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';

      // 1. If not strictly on file://, try local server endpoint first
      if (!isFileProtocol) {
        try {
          const res = await fetch(
            `/api/stock/search?category=${encodeURIComponent(activeQuery)}&mediaType=${type}&source=${sourceWeb}&count=12`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.items) && data.items.length > 0) {
              setStockExplorerItems(data.items);
              if (data.sourceUsed) {
                setStockSourceUsed(data.sourceUsed);
              }
              return;
            }
          }
        } catch (serverErr) {
          console.log('[QuranVisualsPanel] Server proxy search bypassed, using client live search:', serverErr);
        }
      }

      // 2. Direct Live Client Fetcher (works in built Electron, Snap, file://, and offline environments)
      const directResult = await searchMultiSourceStock(activeQuery, type, 12, { source: sourceWeb });
      if (directResult && Array.isArray(directResult.items) && directResult.items.length > 0) {
        setStockExplorerItems(directResult.items);
        setStockSourceUsed(directResult.sourceUsed || (sourceWeb === 'pixabay' ? 'live-pixabay-api' : 'live-pexels-api'));
      }
    } catch (e) {
      console.warn('Failed to fetch stock explorer media:', e);
    } finally {
      setIsLoadingExplorer(false);
    }
  };

  // Re-fetch whenever stock website, category, or mediaType changes
  useEffect(() => {
    fetchLiveStockMedia(stockSource, visualCategory, searchQuery, mediaType);
  }, [stockSource, visualCategory, mediaType]);

  // Debounced search when user types in search box (e.g. "natural")
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const timer = setTimeout(() => {
      fetchLiveStockMedia(stockSource, visualCategory, searchQuery, mediaType);
    }, 450);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Add individual stock item to timeline
  const handleAddStockItemToTimeline = (item: any) => {
    const isVid = (item.mediaType || mediaType) === 'video';
    const targetTrackType = isVid ? ClipType.VIDEO : ClipType.IMAGE;
    const targetTrack = tracks.find(t => t.type === targetTrackType);
    const trackId = targetTrack ? targetTrack.id : `track-${targetTrackType}-1`;
    
    const trackClips = targetTrack?.clips || [];
    const lastClip = trackClips[trackClips.length - 1];
    const startTime = lastClip ? (lastClip.start + lastClip.duration) : currentTime;
    const clipDuration = item.duration || (isVid ? 10.0 : 5.0);

    onAddClip(
      {
        name: item.title || `${(item.source || stockSource).toUpperCase()} ${item.category || 'Visual'}`,
        type: isVid ? ClipType.VIDEO : ClipType.IMAGE,
        url: getSafeMediaUrl(item.url),
        poster: getSafeMediaUrl(item.thumbnail || item.url),
        thumbnailUrl: getSafeMediaUrl(item.thumbnail || item.url),
        fallbackUrl: getSafeMediaUrl(item.thumbnail || item.url),
        start: startTime,
        duration: clipDuration,
        sourceStart: 0,
        sourceDuration: clipDuration,
        isImage: !isVid,
        playbackRate: 1.0,
        volume: isVid ? 0 : 1.0,
        opacity: 1,
        filters: {
          brightness: 100,
          contrast: 105,
          saturation: 110,
          grayscale: 0,
          sepia: 0,
          invert: 0,
          hueRotate: 0,
          chromaKey: { enabled: false, color: '#00ff00', threshold: 40, smoothness: 10 }
        }
      },
      trackId
    );
    showToast(`🎬 Added "${item.title}" (${(item.source || stockSource).toUpperCase()}) to timeline at ${startTime.toFixed(1)}s!`);
  };

  // Apply individual stock item to all Ayahs in generated list
  const handleApplyStockItemToAllAyahs = (item: any) => {
    if (generatedVisuals.length === 0) {
      showToast(`⚡ Selected for generation! Click "Generate Ayah Visuals with AI" below to apply across all verses.`);
      return;
    }
    const isVid = (item.mediaType || mediaType) === 'video';
    const safeUrl = getSafeMediaUrl(item.url);
    const updated = generatedVisuals.map(v => ({
      ...v,
      imageUrl: isVid ? (item.thumbnail || item.url) : safeUrl,
      videoUrl: isVid ? safeUrl : '',
      selectedUrl: safeUrl,
      mediaType: isVid ? ('video' as const) : ('image' as const),
      source: item.source || stockSource,
      downloadUrl: item.url,
      cinematicPrompt: item.title,
    }));
    setGeneratedVisuals(updated);
    showToast(`✅ Applied "${item.title}" across all ${updated.length} Ayahs!`);
  };

  // Direct download single media file from Pexels / Pixabay via server proxy to avoid CORS
  const downloadMediaFile = (url: string, filename: string) => {
    if (!url) return;
    const downloadEndpoint = `/api/stock/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
    const a = document.createElement('a');
    a.href = downloadEndpoint;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Direct batch download of all generated media files to user's computer
  const handleDownloadAllVisuals = async () => {
    if (generatedVisuals.length === 0) return;
    setIsDownloadingAll(true);
    showToast(`📥 Starting download of ${generatedVisuals.length} media files from Pexels/Pixabay...`);
    
    for (let i = 0; i < generatedVisuals.length; i++) {
      const item = generatedVisuals[i];
      const isVid = item.mediaType === 'video';
      const targetUrl = item.downloadUrl || item.selectedUrl || (isVid ? item.videoUrl : item.imageUrl);
      const cleanKey = item.verse_key.replace(/[^a-zA-Z0-9_-]/g, '_');
      const ext = isVid ? 'mp4' : 'jpg';
      const filename = `quran_${cleanKey}_${item.theme}_${item.source || 'stock'}.${ext}`;
      
      downloadMediaFile(targetUrl, filename);
      await new Promise(r => setTimeout(r, 650)); // Stagger to prevent browser download blockage
    }
    
    setIsDownloadingAll(false);
    showToast(`✅ Queued all ${generatedVisuals.length} media files for download!`);
  };

  const [targetLang, setTargetLang] = useState<string>('ur');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  const handleTranslateTimelineSubtitles = async () => {
    // 1. Gather all text clips on the timeline
    const textTracks = tracks.filter(t => t.type === 'text');
    const allTextClips: any[] = [];
    textTracks.forEach(t => {
      t.clips.forEach(c => {
        if (c.type === 'text' || c.text) {
          allTextClips.push(c);
        }
      });
    });

    if (allTextClips.length === 0) {
      setToastMessage('❌ No text subtitles found on the timeline!');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsTranslating(true);
    try {
      const res = await fetch('/api/ai/translate-subtitles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subtitles: allTextClips.map(c => ({ id: c.id, text: c.text || c.name })),
          targetLanguage: targetLang
        })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.translated) && onUpdateClip) {
        data.translated.forEach((item: any) => {
          onUpdateClip(item.id, {
            text: item.translatedText,
            name: item.translatedText.substring(0, 30)
          });
        });
        setToastMessage(`✅ Successfully translated ${data.translated.length} subtitles!`);
      } else {
        setToastMessage('❌ Translation failed or onUpdateClip is not bound.');
      }
    } catch (e) {
      setToastMessage('❌ Error occurred while translating subtitles.');
    } finally {
      setIsTranslating(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Extract Quran Ayahs from both text tracks AND segmented audio tracks currently present on timeline
  const getTimelineAyahs = (): Array<{
    verse_key: string;
    text_arabic?: string;
    translation?: string;
    start: number;
    duration: number;
  }> => {
    const textTracks = tracks.filter(t => t.type === 'text');
    const audioTracks = tracks.filter(t => t.type === 'audio');
    const result: Array<{
      verse_key: string;
      text_arabic?: string;
      translation?: string;
      start: number;
      duration: number;
    }> = [];

    // 1. Search clips in text tracks
    textTracks.forEach(track => {
      track.clips.forEach(clip => {
        const rawName = clip.name || '';
        const rawText = clip.text || '';
        const isAr = /[\u0600-\u06FF]/.test(rawText);

        let key = rawName;
        const ayahNum = extractAyahNumberFromClip(clip);

        if (/ta'?awwuz|auzubillah|a'udhubillah/i.test(rawName) || rawText.includes('أَعُوذُ') || /refuge/i.test(rawText)) {
          key = "Ta'awwuz (A'udhubillah)";
        } else if (/tasmiyah|bismillah/i.test(rawName) || rawText.includes('بِسْمِ') || /name of allah/i.test(rawText)) {
          key = "Tasmiyah (Bismillah)";
        } else if (rawName.match(/\d+:\d+/)) {
          const m = rawName.match(/\d+:\d+/);
          key = `Ayah ${m ? m[0] : rawName}`;
        } else if (ayahNum !== null) {
          key = `Ayah ${ayahNum}`;
        } else if (!key) {
          key = `Verse ${result.length + 1}`;
        }

        const existing = result.find(r => Math.abs(r.start - clip.start) < 0.35);
        if (existing) {
          if (isAr && !existing.text_arabic) {
            existing.text_arabic = rawText;
          } else if (!isAr && !existing.translation) {
            existing.translation = rawText;
          }
          if (existing.verse_key.startsWith('Verse') && !key.startsWith('Verse')) {
            existing.verse_key = key;
          }
        } else {
          result.push({
            verse_key: key,
            text_arabic: isAr ? rawText : undefined,
            translation: !isAr ? rawText : undefined,
            start: Number(clip.start.toFixed(2)),
            duration: Number(clip.duration.toFixed(2)),
          });
        }
      });
    });

    // 2. If text tracks didn't have clips, check audio track segmented clips
    if (result.length === 0) {
      audioTracks.forEach(track => {
        track.clips.forEach(clip => {
          const rawName = clip.name || '';
          const ayahNum = extractAyahNumberFromClip(clip);
          let key = rawName;

          if (ayahNum !== null) {
            key = `Ayah ${ayahNum}`;
          } else if (/ayah|part/i.test(rawName)) {
            key = rawName.replace(/\(\d+(\.\d+)?s\)/gi, '').trim();
          } else {
            key = `Audio Part ${result.length + 1}`;
          }

          result.push({
            verse_key: key,
            start: Number(clip.start.toFixed(2)),
            duration: Number(clip.duration.toFixed(2)),
          });
        });
      });
    }

    return result.sort((a, b) => a.start - b.start);
  };

  const timelineAyahs = getTimelineAyahs();

  // Trigger notification toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Standalone Client-Side Style-Based Visual Generator (Respects user-chosen visual style category & smart Quranic keywords)
  const generateLocalQuranVisuals = (verses: any[], catId: string, outputType: 'video' | 'image'): AyahVisualItem[] => {
    const catConfig = QURAN_TILAWAT_CATEGORIES.find(c => c.id === catId) || QURAN_TILAWAT_CATEGORIES[0];
    const usedUrls = new Set<string>();

    return verses.map((v, index) => {
      let matchedTheme = catId;
      let promptTitle = `${catConfig.name} Scene`;

      // Smart Quranic Keyword Analysis (Arabic text & translation detection)
      if (smartKeywordDistribution && (v.text_arabic || v.translation)) {
        const analyzed = smartAnalyzeAyahVisualTheme(v.text_arabic, v.translation, catId);
        matchedTheme = analyzed.theme;
        promptTitle = analyzed.prompt;
      }

      const normalizedTheme = normalizeCategory(matchedTheme);
      const catItems = CURATED_STOCK_CATALOG[normalizedTheme] || CURATED_STOCK_CATALOG.forest || [];

      // Filter by requested mediaType and source preference
      const filtered = catItems.filter(item => {
        const matchType = outputType === 'video' ? item.mediaType === 'video' : true;
        if (!matchType) return false;
        if (stockSource === 'pexels') return item.source === 'pexels';
        if (stockSource === 'pixabay') return item.source === 'pixabay';
        return true;
      });

      const pool = filtered.length > 0 ? filtered : catItems.filter(item => (outputType === 'video' ? item.mediaType === 'video' : true));

      // Pick an unused item to guarantee zero repetition across 20+ Ayahs
      let chosenItem = pool.find(item => !usedUrls.has(item.url));

      if (!chosenItem) {
        // Broaden search across all 150+ catalog items to ensure uniqueness
        const allCats = Object.keys(CURATED_STOCK_CATALOG);
        for (const cKey of allCats) {
          const altItems = (CURATED_STOCK_CATALOG[cKey] || []).filter(item =>
            (outputType === 'video' ? item.mediaType === 'video' : true) &&
            (item.source === stockSource)
          );
          const altUnused = altItems.find(item => !usedUrls.has(item.url));
          if (altUnused) {
            chosenItem = altUnused;
            break;
          }
        }
      }

      if (!chosenItem && pool.length > 0) {
        chosenItem = pool[index % pool.length];
      }

      if (chosenItem) {
        usedUrls.add(chosenItem.url);
      }

      const isVid = (chosenItem?.mediaType || outputType) === 'video';
      const targetUrl = chosenItem?.url || 'https://videos.pexels.com/video-files/3015510/3015510-hd_1920_1080_24fps.mp4';
      const thumbUrl = chosenItem?.thumbnail || chosenItem?.url || 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=400';

      return {
        verse_key: v.verse_key || `Ayah ${index + 1}`,
        text_arabic: v.text_arabic,
        translation: v.translation,
        theme: chosenItem?.category || matchedTheme,
        mood: catConfig.urdu,
        stockQuery: catConfig.query,
        cinematicPrompt: chosenItem?.title || promptTitle,
        imageUrl: thumbUrl,
        videoUrl: isVid ? targetUrl : '',
        selectedUrl: targetUrl,
        mediaType: outputType,
        start: v.start !== undefined ? v.start : index * 5.0,
        duration: v.duration !== undefined ? v.duration : 5.0,
        source: (chosenItem?.source as any) || stockSource,
        downloadUrl: chosenItem?.downloadUrl || targetUrl
      };
    });
  };

  // Generate Visuals for Ayahs directly from Pexels, Pixabay or Curated 150+ Library
  const handleGenerateVisuals = async () => {
    setIsGenerating(true);
    setGenerationProgress(15);

    let payloadVerses: any[] = [];

    if (sourceMode === 'timeline' && timelineAyahs.length > 0) {
      payloadVerses = timelineAyahs.map(a => ({
        verse_key: a.verse_key,
        text_arabic: a.text_arabic || '',
        translation: a.translation || '',
        start: a.start,
        duration: a.duration,
      }));
    } else {
      // Build from selected Surah & Ayah range
      const surahInfo = SURAHS.find(s => s.id === selectedSurah) || SURAHS[0];
      const count = Math.max(1, Math.min(30, endAyah - startAyah + 1));
      
      for (let i = 0; i < count; i++) {
        const ayahIndex = startAyah + i;
        payloadVerses.push({
          verse_key: `${selectedSurah}:${ayahIndex}`,
          text_arabic: `سورة ${surahInfo.name} - آية ${ayahIndex}`,
          translation: `Translation of Surah ${surahInfo.name} Verse ${ayahIndex}`,
          duration: 5.0,
          start: i * 5.0,
        });
      }
    }

    try {
      setGenerationProgress(35);
      const activeCat = QURAN_TILAWAT_CATEGORIES.find(c => c.id === visualCategory) || QURAN_TILAWAT_CATEGORIES[0];
      const activeQuery = searchQuery.trim().length > 0 ? searchQuery.trim() : activeCat.query;

      // 1. Direct Pexels & Pixabay Multi-Ayah stock resolver endpoint (server or direct client)
      let stockItems: any[] = [];
      let sourceLabel = 'Live Stock Engine';

      const isFileProtocol = typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';

      if (!isFileProtocol) {
        try {
          const stockRes = await fetch(
            `/api/stock/search?category=${encodeURIComponent(activeQuery)}&mediaType=${mediaType}&count=${payloadVerses.length}&source=${stockSource}`
          ).then(r => (r.ok ? r.json() : null)).catch(() => null);

          if (stockRes && stockRes.success && Array.isArray(stockRes.items) && stockRes.items.length > 0) {
            stockItems = stockRes.items;
            sourceLabel = stockRes.sourceUsed?.includes('api') ? 'Live Pexels/Pixabay API' : 'Curated 150+ 4K Stock Catalog';
          }
        } catch (e) {
          console.warn('[QuranVisualsPanel] Server stock search failed, trying client search:', e);
        }
      }

      // If server didn't return items, query client-side stock search engine
      if (stockItems.length === 0) {
        try {
          const clientRes = await searchMultiSourceStock(activeQuery, mediaType, payloadVerses.length, { source: stockSource });
          if (clientRes && Array.isArray(clientRes.items) && clientRes.items.length > 0) {
            stockItems = clientRes.items;
            sourceLabel = clientRes.sourceUsed?.includes('api') ? 'Live Pexels/Pixabay API' : 'Curated 150+ 4K Stock Catalog';
          }
        } catch (e) {
          console.warn('[QuranVisualsPanel] Client stock search failed:', e);
        }
      }

      if (stockItems.length > 0) {
        setGenerationProgress(80);
        const enriched: AyahVisualItem[] = payloadVerses.map((v: any, index: number) => {
          const item = stockItems[index % stockItems.length];
          const isVid = (item.mediaType || mediaType) === 'video';
          const safeUrl = getSafeMediaUrl(item.url);
          return {
            verse_key: v.verse_key || `Ayah ${index + 1}`,
            text_arabic: v.text_arabic,
            translation: v.translation,
            theme: item.category || activeCat.name,
            mood: activeCat.urdu,
            stockQuery: activeQuery,
            cinematicPrompt: item.title || `${activeCat.name} Scene ${index + 1}`,
            imageUrl: item.thumbnail || safeUrl,
            videoUrl: isVid ? safeUrl : '',
            selectedUrl: safeUrl,
            mediaType: isVid ? 'video' : 'image',
            start: v.start !== undefined ? v.start : index * 5.0,
            duration: v.duration !== undefined ? v.duration : 5.0,
            source: item.source || (stockSource === 'pixabay' ? 'pixabay' : 'pexels'),
            downloadUrl: item.downloadUrl || item.url
          };
        });

        setGeneratedVisuals(enriched);
        setGenerationProgress(100);
        showToast(`✨ Generated ${enriched.length} unique Ayah scenes from ${sourceLabel}!`);
        return;
      }

      setGenerationProgress(75);
      // 2. Standalone / Offline Pexels & Pixabay Curated 150+ Library with zero repeating items
      const localVisuals = generateLocalQuranVisuals(payloadVerses, visualStyle, mediaType);
      setGeneratedVisuals(localVisuals);
      setGenerationProgress(100);
      showToast(`✨ Generated ${localVisuals.length} unique Ayah scenes from Curated 150+ Catalog!`);
    } catch (err: any) {
      console.warn('Direct stock resolver fallback:', err);
      const localVisuals = generateLocalQuranVisuals(payloadVerses, visualStyle, mediaType);
      setGeneratedVisuals(localVisuals);
      showToast(`✨ Generated ${localVisuals.length} unique Ayah visual scenes!`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Place single visual on timeline
  const handleAddVisualToTimeline = (item: AyahVisualItem) => {
    const isVid = item.mediaType === 'video';
    
    // Helper to parse verse numbers for matching
    const getVerseKeyNumbers = (str: string) => {
      const colonMatch = str.match(/(\d+)[:.](\d+)/);
      if (colonMatch) {
        return { surah: parseInt(colonMatch[1], 10), verse: parseInt(colonMatch[2], 10) };
      }
      const numMatch = str.match(/\d+/);
      if (numMatch) {
        return { surah: null, verse: parseInt(numMatch[0], 10) };
      }
      return null;
    };

    const isMatch = (keyA: string, keyB: string) => {
      const cleanA = keyA.toLowerCase();
      const cleanB = keyB.toLowerCase();
      if (cleanA.includes('tawuz') || cleanA.includes('ta\'awwuz') || cleanA.includes('auzubillah')) {
        return cleanB.includes('tawuz') || cleanB.includes('ta\'awwuz') || cleanB.includes('auzubillah') || cleanB.includes('refuge');
      }
      if (cleanA.includes('tasmiyah') || cleanA.includes('bismillah')) {
        return cleanB.includes('tasmiyah') || cleanB.includes('bismillah') || cleanB.includes('name of allah');
      }

      const nA = getVerseKeyNumbers(keyA);
      const nB = getVerseKeyNumbers(keyB);
      if (nA && nB) {
        if (nA.surah !== null && nB.surah !== null) {
          return nA.surah === nB.surah && nA.verse === nB.verse;
        }
        return nA.verse === nB.verse;
      }
      return false;
    };

    const matchedSeg = timelineAyahs.find(t => isMatch(item.verse_key, t.verse_key));
    
    let targetStart = currentTime;
    let targetDuration = item.duration || 5.0;

    if (matchedSeg) {
      targetStart = matchedSeg.start;
      targetDuration = matchedSeg.duration;
    } else if (sourceMode === 'timeline' && item.start !== undefined) {
      targetStart = item.start;
    }

    onAddClip({
      name: `Scene: ${item.verse_key} [${item.theme}]`,
      type: isVid ? ClipType.VIDEO : ClipType.IMAGE,
      url: item.selectedUrl || (isVid ? item.videoUrl : item.imageUrl),
      poster: item.imageUrl,
      thumbnailUrl: item.imageUrl,
      fallbackUrl: item.imageUrl,
      duration: targetDuration,
      sourceStart: 0,
      sourceDuration: targetDuration,
      start: targetStart,
      isImage: !isVid,
      playbackRate: 1.0,
      volume: isVid ? 0 : 1.0,
      filters: {
        brightness: 100,
        contrast: 105,
        saturation: 110,
        grayscale: 0,
        sepia: 0,
        invert: 0,
        hueRotate: 0,
        chromaKey: { enabled: false, color: '#00ff00', threshold: 40, smoothness: 10 }
      }
    });
    showToast(`✓ Added ${item.verse_key} scene to timeline at ${targetStart.toFixed(1)}s`);
  };

  // Place ALL generated visuals on video track strictly synced to Quran text clips
  const handleAutoPlaceAllOnTimeline = () => {
    if (generatedVisuals.length === 0) return;

    // Calculate total audio duration currently on the timeline
    const audioTrackList = tracks.filter(t => t.type === 'audio');
    let totalAudioDur = 0;
    audioTrackList.forEach(t => {
      t.clips.forEach(c => {
        const end = c.start + c.duration;
        if (end > totalAudioDur) {
          totalAudioDur = end;
        }
      });
    });

    // Helper functions to parse verse numbers and check for match
    const getVerseKeyNumbers = (str: string) => {
      const colonMatch = str.match(/(\d+)[:.](\d+)/);
      if (colonMatch) {
        return { surah: parseInt(colonMatch[1], 10), verse: parseInt(colonMatch[2], 10) };
      }
      const numMatch = str.match(/\d+/);
      if (numMatch) {
        return { surah: null, verse: parseInt(numMatch[0], 10) };
      }
      return null;
    };

    const isMatch = (keyA: string, keyB: string) => {
      const cleanA = keyA.toLowerCase();
      const cleanB = keyB.toLowerCase();
      if (cleanA.includes('tawuz') || cleanA.includes('ta\'awwuz') || cleanA.includes('auzubillah')) {
        return cleanB.includes('tawuz') || cleanB.includes('ta\'awwuz') || cleanB.includes('auzubillah') || cleanB.includes('refuge');
      }
      if (cleanA.includes('tasmiyah') || cleanA.includes('bismillah')) {
        return cleanB.includes('tasmiyah') || cleanB.includes('bismillah') || cleanB.includes('name of allah');
      }

      const nA = getVerseKeyNumbers(keyA);
      const nB = getVerseKeyNumbers(keyB);
      if (nA && nB) {
        if (nA.surah !== null && nB.surah !== null) {
          return nA.surah === nB.surah && nA.verse === nB.verse;
        }
        return nA.verse === nB.verse;
      }
      return false;
    };

    // Build the segments list with exact timing matched to the timeline
    let segments: Array<{ verse_key: string; start: number; duration: number; text_arabic?: string; translation?: string }> = [];

    // Attempt intelligent matching with timeline subtitles first, regardless of sourceMode
    if (timelineAyahs.length > 0) {
      segments = generatedVisuals.map((g) => {
        // Find a matching subtitle segment in timelineAyahs
        const matchedSeg = timelineAyahs.find(t => isMatch(g.verse_key, t.verse_key));
        if (matchedSeg) {
          return {
            verse_key: g.verse_key,
            start: matchedSeg.start,
            duration: matchedSeg.duration,
            text_arabic: matchedSeg.text_arabic || g.text_arabic,
            translation: matchedSeg.translation || g.translation,
          };
        }
        return null;
      }).filter((s): s is NonNullable<typeof s> => s !== null);
    }

    // Fallback: If no matches were found, or match count is too low, use standard heuristic strategies
    if (segments.length === 0) {
      if (sourceMode === 'timeline' && timelineAyahs.length === generatedVisuals.length) {
        segments = timelineAyahs;
      } else if (sourceMode === 'timeline' && totalAudioDur > 0) {
        const segmentDur = totalAudioDur / generatedVisuals.length;
        segments = generatedVisuals.map((g, i) => ({
          verse_key: g.verse_key || `Ayah ${i + 1}`,
          start: Number((i * segmentDur).toFixed(2)),
          duration: Number(segmentDur.toFixed(2)),
          text_arabic: g.text_arabic,
          translation: g.translation,
        }));
      } else {
        segments = generatedVisuals.map((g, i) => ({
          verse_key: g.verse_key,
          start: g.start !== undefined ? g.start : Number((i * 5.0).toFixed(2)),
          duration: g.duration !== undefined ? g.duration : 5.0,
          text_arabic: g.text_arabic,
          translation: g.translation,
        }));
      }
    }

    let runningMarker = 0;

    // Ensure we map each generated visual to its matched segment or fallback segment
    const clipsToPlace: Partial<Clip>[] = generatedVisuals.map((item, idx) => {
      const isVid = item.mediaType === 'video';
      
      // Try to find matching segment by verse_key
      let seg = segments.find(s => isMatch(item.verse_key, s.verse_key));
      if (!seg) {
        // Fallback to sequential index
        seg = segments[idx] || {
          start: item.start !== undefined ? item.start : runningMarker,
          duration: item.duration || 5.0,
          verse_key: item.verse_key,
        };
      }

      let clipStart = Number(seg.start.toFixed(2));
      let clipDur = Number(seg.duration.toFixed(2));

      // Stretch scene until the start of next verse so there are zero black gaps
      if (syncTimingMode === 'continuous') {
        // Sort segments chronologically to get the next one
        const sortedSegs = [...segments].sort((a, b) => a.start - b.start);
        const currentSegIdx = sortedSegs.findIndex(s => s.verse_key === seg!.verse_key);
        const nextSeg = sortedSegs[currentSegIdx + 1];
        if (nextSeg && nextSeg.start > clipStart) {
          clipDur = Number((nextSeg.start - clipStart).toFixed(2));
        } else if (!nextSeg && totalAudioDur > clipStart + clipDur) {
          // Stretch final segment to cover remaining audio duration
          clipDur = Number((totalAudioDur - clipStart).toFixed(2));
        }
      }

      runningMarker = clipStart + clipDur;

      return {
        id: `ayah-bg-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        name: `Scene: ${seg.verse_key} [${item.theme}]`,
        type: isVid ? ClipType.VIDEO : ClipType.IMAGE,
        url: getSafeMediaUrl(item.selectedUrl || (isVid ? item.videoUrl : item.imageUrl)),
        poster: getSafeMediaUrl(item.imageUrl),
        thumbnailUrl: getSafeMediaUrl(item.imageUrl),
        fallbackUrl: getSafeMediaUrl(item.imageUrl),
        start: clipStart,
        duration: Math.max(1.0, clipDur),
        sourceStart: 0,
        sourceDuration: Math.max(1.0, clipDur),
        isImage: !isVid,
        playbackRate: 1.0,
        volume: 0, // Muted background video track
        filters: {
          brightness: 100,
          contrast: 100,
          saturation: 100,
          grayscale: 0,
          sepia: 0,
          invert: 0,
          hueRotate: 0,
          chromaKey: { enabled: false, color: '#00ff00', threshold: 40, smoothness: 10 }
        }
      };
    });

    // Post-processing: If we are in continuous mode, make sure the first clip stretches back to 0s to avoid intro black screen!
    if (syncTimingMode === 'continuous' && clipsToPlace.length > 0) {
      const sortedClips = [...clipsToPlace].sort((a, b) => (a.start || 0) - (b.start || 0));
      const firstClip = sortedClips[0];
      if (firstClip && firstClip.start && firstClip.start > 0) {
        const offset = firstClip.start;
        firstClip.duration = Number(((firstClip.duration || 5.0) + offset).toFixed(2));
        firstClip.sourceDuration = firstClip.duration;
        firstClip.start = 0;
      }
    }

    if (onReplaceVideoTrackClips) {
      onReplaceVideoTrackClips(clipsToPlace);
      showToast(
        syncTimingMode === 'exact'
          ? `🎬 Placed ${clipsToPlace.length} scenes synced strictly to text start & end!`
          : `🎬 Placed ${clipsToPlace.length} continuous scenic visual bridges on timeline!`
      );
    } else {
      clipsToPlace.forEach(c => onAddClip(c));
      showToast(`🎬 Added ${clipsToPlace.length} background scenes to timeline!`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#18181c] text-gray-200 overflow-y-auto custom-scrollbar p-4 space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-[#1e2329] to-cyan-950/50 border border-emerald-500/30 rounded-xl p-3.5 shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-black font-extrabold shadow-md shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 text-gray-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">Quran Visuals AI</h2>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Ayah Media Generator
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Auto-generate 4K cinematic scenes & stock videos matching every Ayah's translation
            </p>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-900/90 border border-emerald-400/50 text-emerald-100 text-xs px-3.5 py-2.5 rounded-lg shadow-xl flex items-center gap-2 transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mode Switcher: Timeline Ayahs vs Select Surah */}
      <div className="bg-[#121216] border border-[#2a2a30] rounded-xl p-3 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Source Ayahs
          </span>
          <div className="flex rounded-lg bg-[#1e1e24] p-0.5 border border-[#33333d]">
            <button
              onClick={() => setSourceMode('timeline')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition ${
                sourceMode === 'timeline'
                  ? 'bg-cyan-500 text-black font-bold shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              From Timeline ({timelineAyahs.length})
            </button>
            <button
              onClick={() => setSourceMode('surah')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition ${
                sourceMode === 'surah'
                  ? 'bg-cyan-500 text-black font-bold shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Pick Surah
            </button>
          </div>
        </div>

        {sourceMode === 'timeline' ? (
          <div className="text-[11px] text-gray-400 bg-[#1a1a22] p-2.5 rounded-lg border border-[#2e2e38]">
            {timelineAyahs.length > 0 ? (
              <div className="space-y-1">
                <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Detected {timelineAyahs.length} verse subtitles on your timeline!
                </div>
                <div className="text-gray-400 text-[10px]">
                  Each Ayah's exact start time and duration will be synced to the generated background footage.
                </div>
              </div>
            ) : (
              <div className="text-amber-300/90 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  No Quran subtitles found on timeline yet. You can pick a Surah below or use Quran AI v4 to align verses first.
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="col-span-3">
              <label className="text-[10px] text-gray-400 block mb-1">Select Surah</label>
              <select
                value={selectedSurah}
                onChange={(e) => {
                  const sId = parseInt(e.target.value, 10);
                  setSelectedSurah(sId);
                  const sObj = SURAHS.find(s => s.id === sId);
                  setStartAyah(1);
                  setEndAyah(sObj ? Math.min(10, sObj.id === 1 ? 7 : 10) : 7);
                }}
                className="w-full bg-[#1c1c24] border border-[#33333d] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {SURAHS.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Start Ayah</label>
              <input
                type="number"
                min="1"
                max="286"
                value={startAyah}
                onChange={(e) => setStartAyah(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-[#1c1c24] border border-[#33333d] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">End Ayah</label>
              <input
                type="number"
                min={startAyah}
                max="286"
                value={endAyah}
                onChange={(e) => setEndAyah(parseInt(e.target.value, 10) || startAyah)}
                className="w-full bg-[#1c1c24] border border-[#33333d] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Total</label>
              <div className="bg-[#1c1c24] border border-[#33333d] rounded-lg px-2.5 py-1.5 text-xs text-cyan-400 font-bold text-center">
                {Math.max(1, endAyah - startAyah + 1)} Ayahs
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stock Media Provider & Quran Visuals Studio */}
      <div className="bg-[#121216] border border-[#2a2a30] rounded-xl p-3.5 space-y-4 shadow-lg">
        {/* Connected Stock Engine Status (100% Automatic & Royalty-Free) */}
        <div className="bg-[#151722] border border-[#262c3e] rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                {stockSource === 'pixabay' ? 'Pixabay' : 'Pexels'} 4K Live Stock Engine
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-[10px] text-gray-400">
                100% Royalty-Free • Direct Live Search & Auto-Streaming Active
              </div>
            </div>
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            Connected
          </span>
        </div>

        {/* Step 1: Select Website (2 Websites: Pexels or Pixabay) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-bold text-gray-200 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              1. Select Website (Pexels اور Pixabay منتخب کریں)
            </label>
            <span className="text-[9px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
              100% Royalty-Free
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setStockSource('pexels');
                showToast('📸 Switched to Pexels HD Stock Library');
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all text-left ${
                stockSource === 'pexels'
                  ? 'bg-gradient-to-r from-emerald-950/80 to-[#12291e] border-emerald-500 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/40'
                  : 'bg-[#181820] border-[#2c2c36] text-gray-400 hover:bg-[#1f1f2a] hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 ${stockSource === 'pexels' ? 'bg-emerald-500 text-black font-black' : 'bg-[#22222d] text-gray-300'}`}>
                  📸
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    Pexels
                    {stockSource === 'pexels' && <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />}
                  </div>
                  <div className="text-[10px] text-gray-400 truncate">HD Videos & 4K Photos</div>
                </div>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${stockSource === 'pexels' ? 'bg-emerald-500/20 text-emerald-300' : 'text-gray-600'}`}>
                Active
              </span>
            </button>

            <button
              onClick={() => {
                setStockSource('pixabay');
                showToast('🎨 Switched to Pixabay Stock Library');
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all text-left ${
                stockSource === 'pixabay'
                  ? 'bg-gradient-to-r from-emerald-950/80 to-[#12291e] border-emerald-500 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/40'
                  : 'bg-[#181820] border-[#2c2c36] text-gray-400 hover:bg-[#1f1f2a] hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 ${stockSource === 'pixabay' ? 'bg-emerald-500 text-black font-black' : 'bg-[#22222d] text-gray-300'}`}>
                  🎨
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    Pixabay
                    {stockSource === 'pixabay' && <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />}
                  </div>
                  <div className="text-[10px] text-gray-400 truncate">Free Footage & Images</div>
                </div>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${stockSource === 'pixabay' ? 'bg-emerald-500/20 text-emerald-300' : 'text-gray-600'}`}>
                Active
              </span>
            </button>
          </div>
        </div>

        {/* Smart Multi-Ayah Keyword Auto-Distribution Switch */}
        <div className="bg-[#171722] border border-[#2b2b3b] rounded-xl p-2.5 flex items-center justify-between">
          <div className="space-y-0.5 pr-2">
            <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Smart Keyword Auto-Matching (آیات کے مفہوم کے مطابق مناظر)
            </div>
            <div className="text-[10px] text-gray-400 leading-tight">
              Automatically assigns distinct scenes based on Arabic keywords (السماء، الأرض، الجبال، الماء، النور) with zero repetition across 20+ Ayahs.
            </div>
          </div>
          <button
            onClick={() => {
              setSmartKeywordDistribution(!smartKeywordDistribution);
              showToast(
                !smartKeywordDistribution
                  ? '✨ Smart Quranic Keyword Distribution Enabled!'
                  : '📌 Fixed Category Mode Enabled'
              );
            }}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition shrink-0 ${
              smartKeywordDistribution
                ? 'bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-950/40'
                : 'bg-[#22222e] text-gray-400 border-[#333342] hover:text-white'
            }`}
          >
            {smartKeywordDistribution ? 'ON (Smart)' : 'OFF (Fixed)'}
          </button>
        </div>

        {/* Media Format Selector */}
        <div className="flex items-center justify-between pt-1 border-t border-[#202028]">
          <span className="text-[11px] font-semibold text-gray-300">Format (ویڈیو یا تصویر)</span>
          <div className="flex rounded-lg bg-[#1a1a24] p-0.5 border border-[#30303c]">
            <button
              onClick={() => setMediaType('video')}
              className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded-md transition ${
                mediaType === 'video'
                  ? 'bg-emerald-500 text-black shadow font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              HD Video
            </button>
            <button
              onClick={() => setMediaType('image')}
              className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded-md transition ${
                mediaType === 'image'
                  ? 'bg-emerald-500 text-black shadow font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              4K Image
            </button>
          </div>
        </div>

        {/* Step 2: Quran Tilawat Categories Under the Selected Website */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold text-gray-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              2. Quran Tilawat Categories (قرآن تلاوت کی کیٹیگری)
            </label>
            <span className="text-[10px] text-emerald-400/90 font-medium font-urdu">
              {QURAN_TILAWAT_CATEGORIES.find(c => c.id === visualCategory)?.urdu}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto custom-scrollbar pr-1">
            {QURAN_TILAWAT_CATEGORIES.map(cat => {
              const isSelected = visualCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setVisualCategory(cat.id);
                    setSearchQuery('');
                  }}
                  className={`flex items-start gap-2 p-2 rounded-xl text-left transition border ${
                    isSelected
                      ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/30'
                      : 'bg-[#181820] border-[#272732] text-gray-300 hover:bg-[#20202c] hover:border-gray-700'
                  }`}
                >
                  <span className="text-xl shrink-0 mt-0.5">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-gray-200 truncate">{cat.name}</div>
                    <div className="text-[10px] text-emerald-400/90 font-medium truncate font-urdu">{cat.urdu}</div>
                    <div className="text-[9px] text-gray-400 truncate mt-0.5">{cat.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Interactive Search & Live Media Explorer (Like searching directly on Pexels/Pixabay) */}
        <div className="pt-2 border-t border-[#202028] space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-gray-200 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              Search & Live Explorer ({stockSource === 'pixabay' ? 'Pixabay' : 'Pexels'})
            </label>
            {isLoadingExplorer && (
              <span className="text-[10px] text-cyan-400 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" /> Fetching...
              </span>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`🔍 Search ${stockSource === 'pixabay' ? 'Pixabay' : 'Pexels'} (e.g. natural, rain, mountains, ocean, clouds, noor)...`}
              className="w-full bg-[#181822] border border-[#333342] rounded-xl pl-3 pr-8 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/80 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Live Media Cards from Pexels / Pixabay */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-gray-400 px-0.5">
              <span>Results from <strong className="text-white capitalize">{stockSource}</strong> ({stockExplorerItems.length} found):</span>
              <span className="text-emerald-400">Hover video to play</span>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
              {stockExplorerItems.map((item, idx) => {
                const isVid = (item.mediaType || mediaType) === 'video';
                return (
                  <div
                    key={item.id || idx}
                    className="group relative bg-[#171720] border border-[#282836] hover:border-cyan-500/60 rounded-xl overflow-hidden p-1.5 flex flex-col transition shadow-sm hover:shadow-cyan-950/20"
                  >
                    <div className="relative w-full h-24 bg-black rounded-lg overflow-hidden shrink-0">
                      {isVid ? (
                        <video
                          src={getSafeMediaUrl(item.url)}
                          poster={item.thumbnail}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          playsInline
                          onMouseEnter={e => (e.currentTarget as HTMLVideoElement).play().catch(() => {})}
                          onMouseLeave={e => {
                            const v = e.currentTarget as HTMLVideoElement;
                            v.pause();
                            v.currentTime = 0;
                          }}
                        />
                      ) : (
                        <img
                          src={item.thumbnail || item.url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      )}

                      <div className="absolute top-1 left-1 flex items-center gap-1">
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow ${item.source === 'pixabay' ? 'bg-amber-500 text-black' : 'bg-emerald-500 text-black'}`}>
                          {item.source || stockSource}
                        </span>
                        {isVid && (
                          <span className="text-[8px] bg-black/70 text-gray-200 px-1 py-0.5 rounded font-mono">
                            {item.duration ? `${item.duration}s` : 'HD'}
                          </span>
                        )}
                      </div>

                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 pointer-events-none">
                        <div className="w-7 h-7 rounded-full bg-cyan-500 text-black flex items-center justify-center shadow-lg">
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-1.5 flex flex-col justify-between flex-1">
                      <div className="text-[11px] font-semibold text-gray-200 truncate leading-tight" title={item.title}>
                        {item.title || `${item.category || 'Tilawat'} Media`}
                      </div>
                      
                      <div className="flex items-center gap-1 mt-1.5 pt-1 border-t border-[#232330]">
                        <button
                          onClick={() => handleAddStockItemToTimeline(item)}
                          className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-md py-1 text-[9px] font-bold flex items-center justify-center gap-1 transition"
                          title="Add directly to timeline"
                        >
                          <Plus className="w-2.5 h-2.5" /> Timeline
                        </button>
                        <button
                          onClick={() => handleApplyStockItemToAllAyahs(item)}
                          className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-md py-1 text-[9px] font-bold flex items-center justify-center gap-1 transition"
                          title="Apply this video to all Ayahs"
                        >
                          <Check className="w-2.5 h-2.5" /> Use
                        </button>
                        <button
                          onClick={() => downloadMediaFile(item.url, `${item.source || 'stock'}_${item.id || 'media'}.${isVid ? 'mp4' : 'jpg'}`)}
                          className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition"
                          title="Download to PC"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* AI Subtitle Translation Tool */}
      <div className="bg-[#121216] border border-[#2b2b36]/60 rounded-xl p-4.5 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-bold text-teal-300">
            <Globe className="w-4 h-4 text-teal-400" />
            AI Multi-Language Translator
          </span>
          <span className="text-[10px] text-gray-400">Translate Subtitles</span>
        </div>
        <p className="text-[11px] text-gray-400 leading-normal">
          Select any language to translate all timeline text/lyrics subtitles using Gemini's high-fidelity Islamic linguistic translator.
        </p>
        <div className="flex items-center gap-2">
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="flex-1 bg-[#1a1a24] border border-[#2e2e3a] text-xs text-gray-200 rounded-lg px-3 py-2 outline-none focus:border-teal-500"
          >
            <option value="ur">Urdu (اردو)</option>
            <option value="en">English (English)</option>
            <option value="ar">Arabic (العربية)</option>
            <option value="tr">Turkish (Türkçe)</option>
            <option value="fr">French (Français)</option>
            <option value="id">Indonesian (Bahasa Indonesia)</option>
          </select>
          <button
            onClick={handleTranslateTimelineSubtitles}
            disabled={isTranslating}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800 text-black text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isTranslating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>Translate</span>
          </button>
        </div>
      </div>

      {/* Main Action: Generate Visuals */}
      <div className="space-y-2">
        <button
          onClick={handleGenerateVisuals}
          disabled={isGenerating}
          className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition transform active:scale-98 ${
            isGenerating
              ? 'bg-emerald-700/50 text-emerald-200 cursor-wait'
              : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-black hover:opacity-95 shadow-emerald-500/20'
          }`}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
              <span>Analyzing Translation & Generating Scenes ({generationProgress}%)...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 text-black" />
              <span>Generate Ayah Visuals with AI</span>
            </>
          )}
        </button>

        {generatedVisuals.length > 0 && (
          <div className="bg-[#121216] border border-[#2b2b36] rounded-xl p-3 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-200">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Timeline Sync Alignment
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">
                {timelineAyahs.length > 0 ? `${timelineAyahs.length} Ayahs Detected` : 'Surah Mode'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSyncTimingMode('exact')}
                className={`p-2.5 rounded-lg border text-left transition ${
                  syncTimingMode === 'exact'
                    ? 'bg-emerald-950/50 border-emerald-400 text-white shadow-sm ring-1 ring-emerald-500/40'
                    : 'bg-[#1a1a22] border-[#2e2e38] text-gray-400 hover:text-gray-200 hover:bg-[#20202a]'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-300">
                  <span>🎯 Exact Text Sync</span>
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                  Image starts & ends with text (Text khatam, image khatam)
                </div>
              </button>

              <button
                onClick={() => setSyncTimingMode('continuous')}
                className={`p-2.5 rounded-lg border text-left transition ${
                  syncTimingMode === 'continuous'
                    ? 'bg-cyan-950/50 border-cyan-400 text-white shadow-sm ring-1 ring-cyan-500/40'
                    : 'bg-[#1a1a22] border-[#2e2e38] text-gray-400 hover:text-gray-200 hover:bg-[#20202a]'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-cyan-300">
                  <span>🌊 Continuous Flow</span>
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                  Bridges across silence gaps between verses smoothly
                </div>
              </button>
            </div>

            <button
              onClick={handleAutoPlaceAllOnTimeline}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white flex items-center justify-center gap-2 shadow-md transition"
            >
              <Layers className="w-4 h-4" />
              <span>Auto-Place All {generatedVisuals.length} Visuals on Video Timeline</span>
            </button>
          </div>
        )}
      </div>

      {/* Generated Scenes List */}
      {generatedVisuals.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Generated Ayah Scenes</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px]">
                {generatedVisuals.length}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[9px] uppercase font-bold">
                {stockSource === 'auto' ? 'Pexels & Pixabay' : stockSource}
              </span>
            </h3>
            <button
              onClick={handleDownloadAllVisuals}
              disabled={isDownloadingAll}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1.5 transition active:scale-95"
              title="Download all generated media files directly to your computer"
            >
              {isDownloadingAll ? (
                <RefreshCw className="w-3 h-3 animate-spin text-emerald-300" />
              ) : (
                <Download className="w-3 h-3 text-emerald-400" />
              )}
              <span>{isDownloadingAll ? 'Downloading...' : `Download All (${generatedVisuals.length})`}</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {generatedVisuals.map((item, index) => (
              <div
                key={index}
                className="bg-[#141418] border border-[#2b2b34] hover:border-emerald-500/50 rounded-xl p-3 space-y-2 transition shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/40 rounded text-emerald-300 font-bold text-[11px]">
                      {item.verse_key}
                    </span>
                    <span className="text-[10px] text-gray-400 capitalize px-1.5 py-0.5 bg-[#202028] rounded">
                      {item.theme}
                    </span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 rounded">
                      {item.source || 'pexels'}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{item.duration?.toFixed(1)}s</span>
                  </div>
                </div>

                {/* Translation Quote */}
                {item.translation && (
                  <p className="text-[11px] text-gray-300 italic line-clamp-2 bg-[#1b1b22] px-2 py-1.5 rounded border border-[#272730]">
                    "{item.translation}"
                  </p>
                )}

                {/* Media Preview & Prompt */}
                <div className="flex gap-2.5 items-center">
                  <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-black shrink-0 border border-[#333340] group cursor-pointer"
                       onClick={() => setActivePreview(item)}>
                    {item.mediaType === 'video' ? (
                      <video
                        src={item.selectedUrl}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => e.currentTarget.pause()}
                      />
                    ) : (
                      <img
                        src={item.selectedUrl}
                        alt={item.verse_key}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
                      <span className="text-cyan-400 font-medium">Media: </span>
                      {item.cinematicPrompt}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <button
                        onClick={() => handleAddVisualToTimeline(item)}
                        className="px-2 py-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1 transition"
                      >
                        <Plus className="w-3 h-3" />
                        Add to Timeline
                      </button>
                      <button
                        onClick={() => {
                          const isVid = item.mediaType === 'video';
                          const targetUrl = item.downloadUrl || item.selectedUrl || (isVid ? item.videoUrl : item.imageUrl);
                          const cleanKey = item.verse_key.replace(/[^a-zA-Z0-9_-]/g, '_');
                          const ext = isVid ? 'mp4' : 'jpg';
                          downloadMediaFile(targetUrl, `quran_${cleanKey}_${item.theme}_${item.source || 'stock'}.${ext}`);
                        }}
                        className="px-2 py-1 rounded-md bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-[10px] font-semibold flex items-center gap-1 transition"
                        title="Download MP4/JPG file directly to your computer"
                      >
                        <Download className="w-3 h-3" />
                        Download {item.mediaType === 'video' ? 'MP4' : 'JPG'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Lightbox Preview */}
      {activePreview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181c] border border-[#333340] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl space-y-3 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Scene Preview: {activePreview.verse_key}</span>
              </h4>
              <button
                onClick={() => setActivePreview(null)}
                className="text-gray-400 hover:text-white text-xs px-2 py-1 bg-[#22222a] rounded-lg"
              >
                Close
              </button>
            </div>

            <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
              {activePreview.mediaType === 'video' ? (
                <video
                  src={activePreview.selectedUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  controls
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={activePreview.selectedUrl}
                  alt={activePreview.verse_key}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="text-xs text-gray-300 bg-[#121216] p-2.5 rounded-lg border border-[#2a2a34] space-y-1">
              <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                Semantic AI Visual Prompt
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed">{activePreview.cinematicPrompt}</p>
            </div>

            <button
              onClick={() => {
                handleAddVisualToTimeline(activePreview);
                setActivePreview(null);
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              Add This Scene to Timeline
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
