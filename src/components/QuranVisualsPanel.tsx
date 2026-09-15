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
  Plus
} from 'lucide-react';
import { Track, Clip, ClipType } from '../types';
import { extractAyahNumberFromClip } from '../utils/editorUtils';
import { SURAHS } from './MediaPanel';
import { getTranslationOptionById } from '../utils/quranTranslations';

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
}

interface QuranVisualsPanelProps {
  tracks: Track[];
  onAddClip: (clipData: Partial<Clip>) => void;
  onReplaceVideoTrackClips?: (clips: Partial<Clip>[]) => void;
  onUpdateClip?: (clipId: string, updates: Partial<Clip>) => void;
  quranTranslation?: string;
  currentTime?: number;
}

const VISUAL_STYLES = [
  { id: 'cinematic-nature', name: 'Cinematic Nature & Landscapes', icon: '🏔️', description: 'Ultra-realistic 4K mountains, valleys, and forests' },
  { id: 'golden-dawn', name: 'Golden Dawn & Sun Rays (Noor)', icon: '🌅', description: 'Warm morning light, sunrise, and celestial glow' },
  { id: 'night-cosmos', name: 'Deep Space & Starry Skies', icon: '🌌', description: 'Nebulae, Milky Way galaxy, and starry cosmos' },
  { id: 'ocean-water', name: 'Tranquil Ocean & Rivers', icon: '🌊', description: 'Turquoise seas, calm tides, and flowing water' },
  { id: 'rain-clouds', name: 'Gentle Rain & Dramatic Clouds', icon: '🌧️', description: 'Rain falling on earth, mist, and dynamic timelapses' },
  { id: 'paradise-gardens', name: 'Verdant Gardens & Flora', icon: '🌿', description: 'Lush greenery, blooming flowers, and olive groves' },
  { id: 'desert-dunes', name: 'Golden Sand Dunes & Horizon', icon: '🏜️', description: 'Majestic desert curves, winds, and golden hour' },
];

// Comprehensive curated theme asset bank for instant, beautiful results in Web & Desktop Snap/PKG builds
const LOCAL_THEMATIC_ASSETS: Record<string, { image: string; video: string; query: string; mood: string; prompt: string }> = {
  dawn: {
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2560&auto=format&fit=crop&q=90',
    video: '/videos/golden_sunrise.mp4',
    query: 'sunrise golden dawn mountains',
    mood: 'golden-warm',
    prompt: 'Cinematic 4K golden morning sunbeams breaking through misty mountains, spiritual radiance and warm dawn light'
  },
  night: {
    image: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=2560&auto=format&fit=crop&q=90',
    video: '/videos/milkyway_galaxy.mp4',
    query: 'starry night galaxy universe',
    mood: 'deep-blue-night',
    prompt: 'Majestic deep night cosmos, countless twinkling stars, celestial milky way galaxy over tranquil silhouetted hills'
  },
  mountains: {
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=2560&auto=format&fit=crop&q=90',
    video: '/videos/mountain_clouds.mp4',
    query: 'majestic mountain peaks clouds',
    mood: 'emerald-majestic',
    prompt: 'Towering alpine mountain peaks bathed in ethereal sunlight, pine forest valley, pristine contemplation'
  },
  ocean: {
    image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=2560&auto=format&fit=crop&q=90',
    video: '/videos/ocean_sunset.mp4',
    query: 'calm ocean waves turquoise sea',
    mood: 'aquatic-tranquil',
    prompt: 'Crystal turquoise ocean gently lapping against shore, rolling crystal-clear waves, peaceful horizon'
  },
  rain: {
    image: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=2560&auto=format&fit=crop&q=90',
    video: '/videos/rain_water.mp4',
    query: 'gentle rain falling fresh greenery',
    mood: 'tranquil-rain',
    prompt: 'Gentle blessing rain falling upon fresh green leaves, raindrops creating ripples on water surface'
  },
  gardens: {
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=2560&auto=format&fit=crop&q=90',
    video: '/videos/forest_waterfall.mp4',
    query: 'lush green garden paradise stream',
    mood: 'verdant-peace',
    prompt: 'Lush paradise garden, flowing crystal stream beneath ancient olive trees, blooming flowers in soft daylight'
  },
  desert: {
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=2560&auto=format&fit=crop&q=90',
    video: '/videos/golden_sunrise.mp4',
    query: 'golden desert sand dunes horizon',
    mood: 'golden-desert',
    prompt: 'Vast sweeping golden sand dunes under a serene sunset horizon, gentle wind carving ripples in the sand'
  },
  light: {
    image: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=2560&auto=format&fit=crop&q=90',
    video: '/videos/golden_sunrise.mp4',
    query: 'celestial golden rays beam of light',
    mood: 'heavenly-glow',
    prompt: 'Divine celestial light rays illuminating atmospheric particles in high dynamic range, majestic awe'
  },
  cosmos: {
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=2560&auto=format&fit=crop&q=90',
    video: '/videos/night_stars.mp4',
    query: 'earth planet stars nebula galaxy',
    mood: 'cosmic-depth',
    prompt: 'View of Earth from orbit, glowing atmosphere with deep starry nebula in background, cosmic wonder'
  },
  clouds: {
    image: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=2560&auto=format&fit=crop&q=90',
    video: '/videos/floating_clouds.mp4',
    query: 'epic timelapse clouds sunlight',
    mood: 'ethereal-sky',
    prompt: 'Dramatic cinematic cloudscape in golden hour, billowing white clouds drifting across deep azure sky'
  }
};

const STYLE_TO_THEME_KEYS: Record<string, string[]> = {
  'cinematic-nature': ['mountains', 'gardens', 'dawn', 'clouds', 'ocean'],
  'golden-dawn': ['dawn', 'light', 'clouds', 'mountains'],
  'night-cosmos': ['night', 'cosmos', 'light', 'clouds'],
  'ocean-water': ['ocean', 'rain', 'clouds', 'dawn'],
  'rain-clouds': ['rain', 'clouds', 'mountains', 'gardens'],
  'paradise-gardens': ['gardens', 'ocean', 'rain', 'dawn'],
  'desert-dunes': ['desert', 'dawn', 'light', 'night'],
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
  const [visualStyle, setVisualStyle] = useState<string>('cinematic-nature');
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generatedVisuals, setGeneratedVisuals] = useState<AyahVisualItem[]>([]);
  const [activePreview, setActivePreview] = useState<AyahVisualItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Standalone Client-Side Semantic Visual Generator (Works 100% in Desktop Snap/PKG & Offline)
  const generateLocalQuranVisuals = (verses: any[], styleId: string, outputType: 'video' | 'image'): AyahVisualItem[] => {
    const stylePool = STYLE_TO_THEME_KEYS[styleId] || STYLE_TO_THEME_KEYS['cinematic-nature'];

    return verses.map((v, index) => {
      const textCombo = `${v.verse_key || ''} ${v.text_arabic || ''} ${v.translation || ''}`.toLowerCase();
      let matchedTheme = stylePool[index % stylePool.length];

      // Semantic keyword detection
      if (/noor|light|ray|glow|sun|shams|bright/i.test(textCombo)) {
        matchedTheme = 'light';
      } else if (/sky|sama|star|galaxy|universe|night|lail|space/i.test(textCombo)) {
        matchedTheme = 'night';
      } else if (/ocean|sea|bahr|water|ship|wave|river/i.test(textCombo)) {
        matchedTheme = 'ocean';
      } else if (/rain|matar|cloud|sahab|water|pour/i.test(textCombo)) {
        matchedTheme = 'rain';
      } else if (/jannah|garden|tree|fruit|flower|leaf|jannat/i.test(textCombo)) {
        matchedTheme = 'gardens';
      } else if (/mountain|jabal|peak|stone|earth|ard/i.test(textCombo)) {
        matchedTheme = 'mountains';
      } else if (/desert|sand|dune|dry|horizon/i.test(textCombo)) {
        matchedTheme = 'desert';
      }

      const asset = LOCAL_THEMATIC_ASSETS[matchedTheme] || LOCAL_THEMATIC_ASSETS['mountains'];
      const chosenUrl = outputType === 'video' ? asset.video : asset.image;

      return {
        verse_key: v.verse_key || `Ayah ${index + 1}`,
        text_arabic: v.text_arabic,
        translation: v.translation,
        theme: matchedTheme,
        mood: asset.mood,
        stockQuery: asset.query,
        cinematicPrompt: asset.prompt,
        imageUrl: asset.image,
        videoUrl: asset.video,
        selectedUrl: chosenUrl,
        mediaType: outputType,
        start: v.start !== undefined ? v.start : index * 5.0,
        duration: v.duration !== undefined ? v.duration : 5.0,
      };
    });
  };

  // Generate Visuals for Ayahs
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
      setGenerationProgress(45);
      // Attempt backend AI route with quick timeout fallback for Desktop Snap / PKG standalone environments
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch('/api/ai/quran-visuals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          verses: payloadVerses,
          visualStyle,
          mediaType,
          surahName: SURAHS.find(s => s.id === selectedSurah)?.name || 'Quran'
        })
      }).catch(() => null);

      clearTimeout(timeoutId);

      if (res && res.ok) {
        const data = await res.json();
        if (data && data.visuals && data.visuals.length > 0) {
          const enriched: AyahVisualItem[] = data.visuals.map((v: any, index: number) => {
            const original = payloadVerses[index] || {};
            return {
              ...v,
              verse_key: original.verse_key || v.verse_key,
              text_arabic: original.text_arabic || v.text_arabic,
              translation: original.translation || v.translation,
              start: original.start !== undefined ? original.start : index * 5.0,
              duration: original.duration !== undefined ? original.duration : 5.0,
              mediaType: mediaType,
            };
          });

          setGeneratedVisuals(enriched);
          setGenerationProgress(100);
          showToast(`✨ Generated ${enriched.length} Ayah visual scenes successfully!`);
          return;
        }
      }

      // Standalone / Offline Snap & PKG Fallback Generator
      setGenerationProgress(80);
      const localVisuals = generateLocalQuranVisuals(payloadVerses, visualStyle, mediaType);
      setGeneratedVisuals(localVisuals);
      setGenerationProgress(100);
      showToast(`✨ Generated ${localVisuals.length} Ayah cinematic scenes!`);
    } catch (err: any) {
      console.warn('Local visual generator activated:', err);
      const localVisuals = generateLocalQuranVisuals(payloadVerses, visualStyle, mediaType);
      setGeneratedVisuals(localVisuals);
      showToast(`✨ Generated ${localVisuals.length} Ayah visual scenes!`);
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
      type: ClipType.VIDEO,
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
        type: ClipType.VIDEO,
        url: item.selectedUrl || (isVid ? item.videoUrl : item.imageUrl),
        poster: item.imageUrl,
        thumbnailUrl: item.imageUrl,
        fallbackUrl: item.imageUrl,
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

      {/* Visual Format & Style Options */}
      <div className="bg-[#121216] border border-[#2a2a30] rounded-xl p-3 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
          <span>Media Output Type</span>
          <div className="flex rounded-lg bg-[#1e1e24] p-0.5 border border-[#33333d]">
            <button
              onClick={() => setMediaType('video')}
              className={`flex items-center gap-1 px-3 py-1 text-[11px] font-medium rounded-md transition ${
                mediaType === 'video'
                  ? 'bg-emerald-500 text-black font-bold shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              HD Video
            </button>
            <button
              onClick={() => setMediaType('image')}
              className={`flex items-center gap-1 px-3 py-1 text-[11px] font-medium rounded-md transition ${
                mediaType === 'image'
                  ? 'bg-emerald-500 text-black font-bold shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              4K Image
            </button>
          </div>
        </div>

        <div>
          <label className="text-[10px] text-gray-400 block mb-1.5 font-medium">
            Visual Atmosphere Theme
          </label>
          <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {VISUAL_STYLES.map(style => (
              <button
                key={style.id}
                onClick={() => setVisualStyle(style.id)}
                className={`flex items-center gap-2.5 p-2 rounded-lg text-left transition border ${
                  visualStyle === style.id
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-white shadow-sm'
                    : 'bg-[#1c1c24] border-[#2c2c36] text-gray-300 hover:bg-[#23232e]'
                }`}
              >
                <span className="text-lg">{style.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-200 truncate">{style.name}</div>
                  <div className="text-[10px] text-gray-400 truncate">{style.description}</div>
                </div>
              </button>
            ))}
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
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Generated Ayah Scenes</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px]">
                {generatedVisuals.length}
              </span>
            </h3>
            <span className="text-[10px] text-gray-400">Click scene to preview</span>
          </div>

          <div className="space-y-2.5">
            {generatedVisuals.map((item, index) => (
              <div
                key={index}
                className="bg-[#141418] border border-[#2b2b34] hover:border-emerald-500/50 rounded-xl p-3 space-y-2 transition shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/40 rounded text-emerald-300 font-bold text-[11px]">
                      {item.verse_key}
                    </span>
                    <span className="text-[10px] text-gray-400 capitalize px-1.5 py-0.5 bg-[#202028] rounded">
                      {item.theme}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 flex items-center gap-1">
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
                      <span className="text-cyan-400 font-medium">AI Prompt: </span>
                      {item.cinematicPrompt}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <button
                        onClick={() => handleAddVisualToTimeline(item)}
                        className="px-2.5 py-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1 transition"
                      >
                        <Plus className="w-3 h-3" />
                        Add to Timeline
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
