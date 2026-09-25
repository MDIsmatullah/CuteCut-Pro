import React, { useState, useRef, useEffect } from 'react';
import { Upload, Film, Music, Type, Sliders, Play, Pause, Plus, Trash2, BookOpen, Sparkles, Globe, ExternalLink, Search, Download, Shield, Image as ImageIcon, Brain, Wand2, Zap, CheckCircle2, Layers, Volume2, Mic, RefreshCw, Languages, Check, Square, LayoutGrid, List, Smile, Blend, Palette, Timer, Bell } from 'lucide-react';
import { Clip, ClipType, Track, WatermarkSettings, QuranTranslationOption } from '../types';
import { STOCK_VIDEOS, STOCK_AUDIOS, STOCK_IMAGES, TEXT_PRESETS, PRESET_LUTS } from '../data/presetAssets';
import {
  CAPCUT_AUDIO_TRACKS,
  CAPCUT_STICKERS,
  CAPCUT_EFFECTS,
  CAPCUT_TRANSITIONS,
  CAPCUT_FILTERS,
  CapCutAudioItem,
} from '../data/cutecutAssets';
import { AyahSymbolStyle, AyahDigitType, AyahSymbolPosition, formatAyahSymbol, getSafeCrossOrigin } from '../utils/editorUtils';
import { QURAN_TRANSLATION_OPTIONS, getTranslationOptionById, SUPPORTED_TRANSLATION_FONTS, getSuggestedFontsForLanguage } from '../utils/quranTranslations';
import { FAMOUS_MIX_COLLECTIONS } from '../utils/quranSurahData';
import OrnateAyahMedallion from './OrnateAyahMedallion';
import { QuranVisualsPanel } from './QuranVisualsPanel';
import { SoundEffectsPanel } from './SoundEffectsPanel';
import { LiveAnimationPreview } from './LiveAnimationPreview';
import { searchMultiSourceStock } from '../services/stockMediaService';

/**
 * Asset URL Resolver Helper using Tauri's convertFileSrc API.
 * Safely bypasses cross-origin CORS rules and webview sandboxing restrictions
 * for both local file paths and external streams in Tauri desktop production builds.
 */
export function resolveTauriAssetUrl(pathOrUrl: string | undefined): string {
  if (!pathOrUrl) return '';
  if (pathOrUrl.startsWith('blob:') || pathOrUrl.startsWith('data:') || pathOrUrl.startsWith('content:')) {
    return pathOrUrl;
  }

  if (typeof window !== 'undefined') {
    // Check window.__TAURI__ global convertFileSrc
    const tauriGlobal = (window as any).__TAURI__;
    if (tauriGlobal && tauriGlobal.tauri && typeof tauriGlobal.tauri.convertFileSrc === 'function') {
      try {
        if (!pathOrUrl.startsWith('http://') && !pathOrUrl.startsWith('https://')) {
          return tauriGlobal.tauri.convertFileSrc(pathOrUrl);
        }
      } catch (err) {
        console.warn('convertFileSrc global failed', err);
      }
    }
  }

  return pathOrUrl;
}

/**
 * Safe external URL opener for Tauri native shell or browser fallback.
 */
export async function openExternalUrl(url: string) {
  if (!url) return;
  try {
    if (typeof window !== 'undefined' && (window as any).__TAURI__?.shell?.open) {
      await (window as any).__TAURI__.shell.open(url);
      return;
    }
    const shellPkg = '@tauri-apps/api/shell';
    const tauriShell = await import(/* @vite-ignore */ shellPkg).catch(() => null);
    if (tauriShell && typeof tauriShell.open === 'function') {
      await tauriShell.open(url);
      return;
    }
  } catch (e) {
    console.warn('Failed opening external shell url', e);
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

interface StockVideoItemCardProps {
  video: typeof STOCK_VIDEOS[0];
  onAdd: () => void;
}

const StockVideoItemCard: React.FC<StockVideoItemCardProps> = ({ video, onAdd }) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  return (
    <div
      id={`stock-video-${video.id}`}
      onMouseEnter={() => {
        setIsHovered(true);
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(() => {});
        }
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        if (videoRef.current) {
          videoRef.current.pause();
        }
      }}
      onClick={onAdd}
      className="group bg-[#1a1a22] hover:bg-[#22222d] border border-gray-800/80 hover:border-cyan-500/60 rounded-xl p-2 flex flex-col cursor-pointer transition-all duration-200 relative shadow-xs hover:shadow-cyan-950/30"
    >
      <div className="w-full h-22 bg-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden shrink-0 mb-1.5 border border-white/5">
        {/* Static Thumbnail */}
        {video.thumbnail.startsWith('http') ? (
          <img
            src={video.thumbnail}
            alt={video.name}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isHovered ? 'opacity-0' : 'opacity-100 group-hover:scale-105'
            }`}
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        ) : (
          <span className="text-2xl">{video.thumbnail}</span>
        )}

        {/* Live Video Preview on Hover (CapCut Pro Style) */}
        {isHovered && video.url && (
          <video
            ref={videoRef}
            src={video.url}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-10"
          />
        )}

        {/* Live badge */}
        {isHovered && (
          <span className="absolute top-1 left-1 z-20 text-[8px] bg-red-600/90 text-white px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            LIVE
          </span>
        )}

        {/* Quick Add Overlay on Hover */}
        <div className="absolute inset-0 bg-black/30 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="px-2.5 py-1 rounded-full bg-cyan-500 text-black font-bold text-[10px] flex items-center gap-1 shadow-lg transform group-hover:scale-105 transition-transform">
            <Plus className="w-3 h-3 stroke-[3]" />
            <span>Add to Timeline</span>
          </div>
        </div>

        <span className="absolute bottom-1 right-1 z-20 text-[8px] bg-black/75 backdrop-blur-xs text-white px-1.5 py-0.5 rounded font-mono font-bold">
          {video.duration}s
        </span>
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <p className="text-[11px] font-medium text-gray-200 group-hover:text-cyan-200 line-clamp-2 leading-tight">
          {video.name}
        </p>
        <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-gray-800/40">
          <span className="text-[8px] text-cyan-400 font-medium tracking-wide bg-cyan-950/60 px-1.5 py-0.5 rounded-full truncate">
            {video.category}
          </span>
          <span className="text-[9px] text-gray-400 group-hover:text-cyan-300 font-medium flex items-center gap-0.5">
            + Add
          </span>
        </div>
      </div>
    </div>
  );
};

export const SURAHS = [
  { id: 1, name: '1. Al-Fatihah (The Opening)' },
  { id: 2, name: '2. Al-Baqarah (The Cow)' },
  { id: 3, name: '3. Ali \'Imran (Family of Imran)' },
  { id: 4, name: '4. An-Nisa (The Women)' },
  { id: 5, name: '5. Al-Ma\'idah (The Table Spread)' },
  { id: 6, name: '6. Al-An\'am (The Cattle)' },
  { id: 7, name: '7. Al-A\'raf (The Heights)' },
  { id: 8, name: '8. Al-Anfal (The Spoils of War)' },
  { id: 9, name: '9. At-Tawbah (The Repentance)' },
  { id: 10, name: '10. Yunus (Jonah)' },
  { id: 11, name: '11. Hud (Hud)' },
  { id: 12, name: '12. Yusuf (Joseph)' },
  { id: 13, name: '13. Ar-Ra\'d (The Thunder)' },
  { id: 14, name: '14. Ibrahim (Abraham)' },
  { id: 15, name: '15. Al-Hijr (The Rocky Tract)' },
  { id: 16, name: '16. An-Nahl (The Bee)' },
  { id: 17, name: '17. Al-Isra (The Night Journey)' },
  { id: 18, name: '18. Al-Kahf (The Cave)' },
  { id: 19, name: '19. Maryam (Mary)' },
  { id: 20, name: '20. Taha (Taha)' },
  { id: 21, name: '21. Al-Anbiya (The Prophets)' },
  { id: 22, name: '22. Al-Hajj (The Pilgrimage)' },
  { id: 23, name: '23. Al-Mu\'minun (The Believers)' },
  { id: 24, name: '24. An-Nur (The Light)' },
  { id: 25, name: '25. Al-Furqan (The Criterian)' },
  { id: 26, name: '26. Ash-Shu\'ara (The Poets)' },
  { id: 27, name: '27. An-Naml (The Ant)' },
  { id: 28, name: '28. Al-Qasas (The Stories)' },
  { id: 29, name: '29. Al-\'Ankabut (The Spider)' },
  { id: 30, name: '30. Ar-Rum (The Romans)' },
  { id: 31, name: '31. Luqman (Luqman)' },
  { id: 32, name: '32. As-Sajdah (The Prostration)' },
  { id: 33, name: '33. Al-Ahzab (The Combined Forces)' },
  { id: 34, name: '34. Saba (Sheba)' },
  { id: 35, name: '35. Fatir (Originator)' },
  { id: 36, name: '36. Ya-Sin (Ya-Sin)' },
  { id: 37, name: '37. As-Saffat (Those Who Set The Ranks)' },
  { id: 38, name: '38. Sad (Sad)' },
  { id: 39, name: '39. Az-Zumar (The Troops)' },
  { id: 40, name: '40. Ghafir (The Forgiver)' },
  { id: 41, name: '41. Fussilat (Explained In Detail)' },
  { id: 42, name: '42. Ash-Shura (The Consultation)' },
  { id: 43, name: '43. Az-Zukhruf (The Ornaments of Gold)' },
  { id: 44, name: '44. Ad-Dukhan (The Smoke)' },
  { id: 45, name: '45. Al-Jathiyah (The Crouching)' },
  { id: 46, name: '46. Al-Ahqaf (The Wind-Curved Sandhills)' },
  { id: 47, name: '47. Muhammad (Muhammad)' },
  { id: 48, name: '48. Al-Fath (The Victory)' },
  { id: 49, name: '49. Al-Hujurat (The Rooms)' },
  { id: 50, name: '50. Qaf (Qaf)' },
  { id: 51, name: '51. Adh-Dhariyat (The Winnowing Winds)' },
  { id: 52, name: '52. At-Tur (The Mount)' },
  { id: 53, name: '53. An-Najm (The Star)' },
  { id: 54, name: '54. Al-Qamar (The Moon)' },
  { id: 55, name: '55. Ar-Rahman (The Beneficent)' },
  { id: 56, name: '56. Al-Waqi\'ah (The Inevitable)' },
  { id: 57, name: '57. Al-Hadid (The Iron)' },
  { id: 58, name: '58. Al-Mujadila (The Pleading Woman)' },
  { id: 59, name: '59. Al-Hashr (The Exile)' },
  { id: 60, name: '60. Al-Mumtahanah (She That Is To Be Examined)' },
  { id: 61, name: '61. As-Saff (The Ranks)' },
  { id: 62, name: '62. Al-Jumu\'ah (The Congregation)' },
  { id: 63, name: '63. Al-Munafiqun (The Hypocrites)' },
  { id: 64, name: '64. At-Taghabun (The Mutual Disillusion)' },
  { id: 65, name: '65. At-Talaq (The Divorce)' },
  { id: 66, name: '66. At-Tahrim (The Prohibition)' },
  { id: 67, name: '67. Al-Mulk (The Sovereignty)' },
  { id: 68, name: '68. Al-Qalam (The Pen)' },
  { id: 69, name: '69. Al-Haqqah (The Inevitable Reality)' },
  { id: 70, name: '70. Al-Ma\'arij (The Ascending Stairways)' },
  { id: 71, name: '71. Nuh (Noah)' },
  { id: 72, name: '72. Al-Jinn (The Jinn)' },
  { id: 73, name: '73. Al-Muzzammil (The Enshrouded One)' },
  { id: 74, name: '74. Al-Muddaththir (The Cloaked One)' },
  { id: 75, name: '75. Al-Qiyamah (The Resurrection)' },
  { id: 76, name: '76. Al-Insan (The Man)' },
  { id: 77, name: '77. Al-Mursalat (Those Sent Forth)' },
  { id: 78, name: '78. An-Naba (The Tidings)' },
  { id: 79, name: '79. An-Nazi\'at (Those Who Drag Forth)' },
  { id: 80, name: '80. \'Abasa (He Frowned)' },
  { id: 81, name: '81. At-Takwir (The Overthrowing)' },
  { id: 82, name: '82. Al-Infitar (The Cleaving)' },
  { id: 83, name: '83. Al-Mutaffifin (The Defrauding)' },
  { id: 84, name: '84. Al-Inshiqaq (The Sundering)' },
  { id: 85, name: '85. Al-Buruj (The Mansions of the Stars)' },
  { id: 86, name: '86. At-Tariq (The Nightcomer)' },
  { id: 87, name: '87. Al-A\'la (The Most High)' },
  { id: 88, name: '88. Al-Ghashiyah (The Overwhelming)' },
  { id: 89, name: '89. Al-Fajr (The Dawn)' },
  { id: 90, name: '90. Al-Balad (The City)' },
  { id: 91, name: '91. Ash-Shams (The Sun)' },
  { id: 92, name: '92. Al-Layl (The Night)' },
  { id: 93, name: '93. Ad-Duhaa (The Morning Hours)' },
  { id: 94, name: '94. Ash-Sharh (The Relief)' },
  { id: 95, name: '95. At-Tin (The Fig)' },
  { id: 96, name: '96. Al-\'Alaq (The Clot)' },
  { id: 97, name: '97. Al-Qadr (The Power)' },
  { id: 98, name: '98. Al-Bayyinah (The Clear Proof)' },
  { id: 99, name: '99. Az-Zalzalah (The Earthquake)' },
  { id: 100, name: '100. Al-\'Adiyat (The Courser)' },
  { id: 101, name: '101. Al-Qari\'ah (The Calamity)' },
  { id: 102, name: '102. At-Takathur (The Rivalry in World Increase)' },
  { id: 103, name: '103. Al-\'Asr (The Declining Day)' },
  { id: 104, name: '104. Al-Humazah (The Traducer)' },
  { id: 105, name: '105. Al-Fil (The Elephant)' },
  { id: 106, name: '106. Quraysh (Quraysh)' },
  { id: 107, name: '107. Al-Ma\'un (The Small Kindnesses)' },
  { id: 108, name: '108. Al-Kawthar (The Abundance)' },
  { id: 109, name: '109. Al-Kafirun (The Disbelievers)' },
  { id: 110, name: '110. An-Nasr (The Divine Support)' },
  { id: 111, name: '111. Al-Masad (The Palm Fiber)' },
  { id: 112, name: '112. Al-Ikhlas (Sincerity)' },
  { id: 113, name: '113. Al-Falaq (The Daybreak)' },
  { id: 114, name: '114. An-Nas (Mankind)' }
];

interface MediaPanelProps {
  onAddClip: (clipData: Partial<Clip>) => void;
  selectedAspectRatio: string;
  tracks: Track[];
  onAlignQuran: (params: {
    surah: number | string;
    startAyah: number;
    mode: 'individual' | 'batch';
    style: string;
    selectionType?: 'single' | 'range' | 'list' | 'all';
    surahEnd?: number;
    surahList?: string;
    introMode?: 'both' | 'taawwuz-only' | 'bismillah-only' | 'none';
    recitationPace?: 'slow-tartil' | 'standard' | 'fast-hadr';
    enableDualTranslation?: boolean;
    dualTranslationLanguage?: string;
  }) => Promise<void> | void;
  aligningStatus: {
    status: 'idle' | 'running' | 'success' | 'error';
    progress: number;
    log: string[];
  } | null;
  quranArabicFont: string;
  setQuranArabicFont: (f: string) => void;
  quranArabicSize: number;
  setQuranArabicSize: (s: number) => void;
  quranArabicColor: string;
  setQuranArabicColor: (c: string) => void;
  quranArabicStyle: 'normal' | 'shadow' | 'outline' | 'neon' | 'gold-glow' | 'viral-reels';
  setQuranArabicStyle: (s: 'normal' | 'shadow' | 'outline' | 'neon' | 'gold-glow' | 'viral-reels') => void;
  quranArabicY: number;
  setQuranArabicY: (y: number) => void;
  quranArabicWrap: boolean;
  setQuranArabicWrap: (w: boolean) => void;
  quranArabicMaxWidth: number;
  setQuranArabicMaxWidth: (w: number) => void;
  quranArabicLineHeight: number;
  setQuranArabicLineHeight: (lh: number) => void;
  quranArabicAlign: 'left' | 'center' | 'right';
  setQuranArabicAlign: (a: 'left' | 'center' | 'right') => void;
  quranAyahSymbolStyle?: AyahSymbolStyle;
  setQuranAyahSymbolStyle?: (s: AyahSymbolStyle) => void;
  quranAyahDigitType?: AyahDigitType;
  setQuranAyahDigitType?: (d: AyahDigitType) => void;
  quranAyahSymbolPosition?: AyahSymbolPosition;
  setQuranAyahSymbolPosition?: (p: AyahSymbolPosition) => void;
  quranShowAyahSymbol?: boolean;
  setQuranShowAyahSymbol?: (s: boolean) => void;
  quranEnglishFont: string;
  setQuranEnglishFont: (f: string) => void;
  quranEnglishSize: number;
  setQuranEnglishSize: (s: number) => void;
  quranEnglishColor: string;
  setQuranEnglishColor: (c: string) => void;
  quranEnglishStyle: 'normal' | 'shadow' | 'outline' | 'neon' | 'gold-glow' | 'viral-reels';
  setQuranEnglishStyle: (s: 'normal' | 'shadow' | 'outline' | 'neon' | 'gold-glow' | 'viral-reels') => void;
  quranEnglishY: number;
  setQuranEnglishY: (y: number) => void;
  quranEnglishUppercase: boolean;
  setQuranEnglishUppercase: (u: boolean) => void;
  quranEnglishWrap: boolean;
  setQuranEnglishWrap: (w: boolean) => void;
  quranEnglishMaxWidth: number;
  setQuranEnglishMaxWidth: (w: number) => void;
  quranEnglishLineHeight: number;
  setQuranEnglishLineHeight: (lh: number) => void;
  quranEnglishAlign: 'left' | 'center' | 'right';
  quranAnimationIn?: any;
  setQuranAnimationIn?: (v: any) => void;
  quranAnimationOut?: any;
  setQuranAnimationOut?: (v: any) => void;
  quranAnimationDuration?: number;
  setQuranAnimationDuration?: (v: number) => void;
  quranBgStyle?: any;
  setQuranBgStyle?: (v: any) => void;
  quranBgColor?: string;
  setQuranBgColor?: (v: string) => void;
  quranBgOpacity?: number;
  setQuranBgOpacity?: (v: number) => void;
  quranBgBlur?: number;
  setQuranBgBlur?: (v: number) => void;
  quranBgPadding?: number;
  setQuranBgPadding?: (v: number) => void;
  quranBgRadius?: number;
  setQuranBgRadius?: (v: number) => void;
  setQuranEnglishAlign: (a: 'left' | 'center' | 'right') => void;
  quranTranslation?: string;
  setQuranTranslation?: (t: string) => void;
  quranIntroMode?: 'both' | 'taawwuz-only' | 'bismillah-only' | 'none';
  setQuranIntroMode?: (m: 'both' | 'taawwuz-only' | 'bismillah-only' | 'none') => void;
  quranBreathSegmentationMode?: 'full-ayah' | 'split-breaths';
  setQuranBreathSegmentationMode?: (m: 'full-ayah' | 'split-breaths') => void;
  quranRecitationPace?: 'slow-tartil' | 'standard' | 'fast-hadr';
  setQuranRecitationPace?: (p: 'slow-tartil' | 'standard' | 'fast-hadr') => void;
  quranEnableDualTranslation?: boolean;
  setQuranEnableDualTranslation?: (e: boolean) => void;
  quranDualTranslationLang?: string;
  setQuranDualTranslationLang?: (lang: string) => void;
  quranDualFont?: string;
  setQuranDualFont?: (f: string) => void;
  quranDualSize?: number;
  setQuranDualSize?: (s: number) => void;
  quranDualColor?: string;
  setQuranDualColor?: (c: string) => void;
  quranDualStyle?: 'normal' | 'shadow' | 'outline' | 'neon' | 'gold-glow' | 'viral-reels';
  setQuranDualStyle?: (s: 'normal' | 'shadow' | 'outline' | 'neon' | 'gold-glow' | 'viral-reels') => void;
  quranDualY?: number;
  setQuranDualY?: (y: number) => void;
  quranDualLineHeight?: number;
  setQuranDualLineHeight?: (lh: number) => void;
  quranDualMaxWidth?: number;
  setQuranDualMaxWidth?: (w: number) => void;
  quranDualWrap?: boolean;
  setQuranDualWrap?: (w: boolean) => void;
  quranDualAlign?: 'left' | 'center' | 'right';
  setQuranDualAlign?: (a: 'left' | 'center' | 'right') => void;
  onAutoSeparateDualTracks?: () => void;
  quranKaraokeHighlight?: boolean;
  setQuranKaraokeHighlight?: (k: boolean) => void;
  quranKaraokeColor?: string;
  setQuranKaraokeColor?: (c: string) => void;
  onReplaceBismillahWithTabarakallazi?: () => void;
  onApplyTranslationToTimeline?: (translationId?: string) => Promise<void> | void;
  onApplyDualTranslationToTimeline?: (dualLangId?: string) => Promise<void> | void;
  onApplyQuranStyles: (customParams?: any) => void;
  onApplyGlobalFontSize?: (size: number) => void;
  onApplyGlobalTextCase?: (casing: 'uppercase' | 'lowercase' | 'capitalize') => void;
  onOpenAISegmentation?: () => void;
  onOpen100Protocols?: () => void;
  watermark?: WatermarkSettings;
  setWatermark?: React.Dispatch<React.SetStateAction<WatermarkSettings>>;
  width?: number;
  selectedClip?: Clip | null;
  onUpdateClip?: (clipId: string, updates: Partial<Clip>) => void;

  // Auto-Segmentation & Acoustic Analysis Suite
  onAutoSegmentAudio?: (
    clipId?: string,
    sensitivity?: 'quran-ayah' | 'studio' | 'mosque' | 'tartil' | 'hadr' | 'custom' | 'smart-waqf',
    customOptions?: {
      minSilenceMs?: number;
      minSpeechMs?: number;
      startAyahNumber?: number;
      gapHandling?: 'preserve-gaps' | 'bridge-seamless' | 'label-pauses';
      paddingMs?: number;
      customThresholdDb?: number;
    }
  ) => void;
  onAutoSyncVideoToAyahs?: () => void;
  onAutoRemoveSilence?: (clipId?: string) => void;
  onAutoSegmentRhythm?: (clipId?: string, interval?: number) => void;
  onReplaceVideoTrackClips?: (clips: Partial<Clip>[]) => void;
  onReplaceTracks?: (tracks: Track[]) => void;
  onSeekTime?: (time: number) => void;
  currentTime?: number;
  onRepairQuranSync?: () => void;
  quranShowSurahHeader?: boolean;
  setQuranShowSurahHeader?: (show: boolean) => void;
  quranSurahHeaderStyle?: 'simple' | 'ornate' | 'border-only';
  setQuranSurahHeaderStyle?: (style: 'simple' | 'ornate' | 'border-only') => void;
  quranSurahHeaderFont?: string;
  setQuranSurahHeaderFont?: (font: string) => void;
  quranSurahHeaderSize?: number;
  setQuranSurahHeaderSize?: (size: number) => void;
  quranSurahHeaderColor?: string;
  setQuranSurahHeaderColor?: (color: string) => void;
  quranSurahHeaderY?: number;
  setQuranSurahHeaderY?: (y: number) => void;
  quranSurahHeaderFormat?: 'arabic' | 'english' | 'both';
  setQuranSurahHeaderFormat?: (format: 'arabic' | 'english' | 'both') => void;
  quranSurahHeaderBg?: 'none' | 'solid' | 'gradient' | 'blur';
  setQuranSurahHeaderBg?: (bg: 'none' | 'solid' | 'gradient' | 'blur') => void;
  quranSurahHeaderBgColor?: string;
  setQuranSurahHeaderBgColor?: (color: string) => void;
  quranSurahHeaderBgOpacity?: number;
  setQuranSurahHeaderBgOpacity?: (opacity: number) => void;
  // Single-Word (Lafz ba Lafz) Display Mode Props
  quranCaptionDisplayMode?: 'full-ayah' | 'single-word';
  setQuranCaptionDisplayMode?: (mode: 'full-ayah' | 'single-word') => void;
  quranSingleWordScale?: number;
  setQuranSingleWordScale?: (scale: number) => void;
  quranSingleWordPop?: boolean;
  setQuranSingleWordPop?: (pop: boolean) => void;
  // Qari / Reciter Badge Overlay Props
  quranShowQariBadge?: boolean;
  setQuranShowQariBadge?: (show: boolean) => void;
  quranQariName?: string;
  setQuranQariName?: (name: string) => void;
  quranQariBadgePosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  setQuranQariBadgePosition?: (pos: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left') => void;
  // Islamic Audio Waveform Visualizer Props
  quranShowWaveform?: boolean;
  setQuranShowWaveform?: (show: boolean) => void;
  quranWaveformStyle?: 'bars' | 'wave' | 'mirror';
  setQuranWaveformStyle?: (style: 'bars' | 'wave' | 'mirror') => void;
  quranWaveformColor?: string;
  setQuranWaveformColor?: (color: string) => void;
  quranWaveformY?: number;
  setQuranWaveformY?: (y: number) => void;
  // Quick Islamic Cards Callbacks
  onAddBismillahCard?: () => void;
  onAddSadaqallahCard?: () => void;
  // Audio Synchronization Calibration Offset Props
  quranKaraokeSyncOffsetMs?: number;
  setQuranKaraokeSyncOffsetMs?: (offsetMs: number) => void;
  // Veo AI Video Generation Callback
  onOpenVeoAnimateModal?: () => void;
  // AI Prompt-to-Video Studio Callback
  onOpenAiPromptStudio?: () => void;
  // Controlled tab selection
  initialTab?: 'ai-studio' | 'upload' | 'video' | 'audio' | 'sfx' | 'image' | 'text' | 'stickers' | 'effects' | 'transitions' | 'filters' | 'adjustment' | 'quran-visuals' | 'quran' | 'background' | 'watermark';
}

export default function MediaPanel({
  onAddClip,
  selectedAspectRatio,
  tracks,
  initialTab,
  onOpenVeoAnimateModal,
  onOpenAiPromptStudio,
  onAlignQuran,
  aligningStatus,
  quranArabicFont,
  setQuranArabicFont,
  quranArabicSize,
  setQuranArabicSize,
  quranArabicColor,
  setQuranArabicColor,
  quranArabicStyle,
  setQuranArabicStyle,
  quranArabicY,
  setQuranArabicY,
  quranArabicWrap,
  setQuranArabicWrap,
  quranArabicMaxWidth,
  setQuranArabicMaxWidth,
  quranArabicLineHeight,
  setQuranArabicLineHeight,
  quranArabicAlign,
  setQuranArabicAlign,
  quranAyahSymbolStyle = 'ornate-medallion',
  setQuranAyahSymbolStyle,
  quranAyahDigitType = 'arabic',
  setQuranAyahDigitType,
  quranAyahSymbolPosition = 'end',
  setQuranAyahSymbolPosition,
  quranShowAyahSymbol = true,
  setQuranShowAyahSymbol,
  quranEnglishFont,
  setQuranEnglishFont,
  quranEnglishSize,
  setQuranEnglishSize,
  quranEnglishColor,
  setQuranEnglishColor,
  quranEnglishStyle,
  setQuranEnglishStyle,
  quranEnglishY,
  setQuranEnglishY,
  quranEnglishUppercase,
  setQuranEnglishUppercase,
  quranEnglishWrap,
  setQuranEnglishWrap,
  quranEnglishMaxWidth,
  setQuranEnglishMaxWidth,
  quranEnglishLineHeight,
  setQuranEnglishLineHeight,
  quranEnglishAlign,
  quranAnimationIn,
  setQuranAnimationIn,
  quranAnimationOut,
  setQuranAnimationOut,
  quranAnimationDuration,
  setQuranAnimationDuration,
  quranBgStyle,
  setQuranBgStyle,
  quranBgColor,
  setQuranBgColor,
  quranBgOpacity,
  setQuranBgOpacity,
  quranBgBlur,
  setQuranBgBlur,
  quranBgPadding,
  setQuranBgPadding,
  quranBgRadius,
  setQuranBgRadius,
  setQuranEnglishAlign,
  quranTranslation = 'ur-jalandhry',
  setQuranTranslation,
  quranIntroMode = 'none',
  setQuranIntroMode,
  quranBreathSegmentationMode = 'split-breaths',
  setQuranBreathSegmentationMode,
  quranRecitationPace = 'standard',
  setQuranRecitationPace,
  quranEnableDualTranslation = false,
  setQuranEnableDualTranslation,
  quranDualTranslationLang = 'en-sahih',
  setQuranDualTranslationLang,
  quranDualFont = 'Jameel Noori Nastaleeq',
  setQuranDualFont,
  quranDualSize = 18,
  setQuranDualSize,
  quranDualColor = '#E0F2FE',
  setQuranDualColor,
  quranDualStyle = 'shadow',
  setQuranDualStyle,
  quranDualY = 86,
  setQuranDualY,
  quranDualLineHeight = 1.3,
  setQuranDualLineHeight,
  quranDualMaxWidth = 85,
  setQuranDualMaxWidth,
  quranDualWrap = true,
  setQuranDualWrap,
  quranDualAlign = 'center',
  setQuranDualAlign,
  onAutoSeparateDualTracks,
  quranKaraokeHighlight = false,
  setQuranKaraokeHighlight,
  quranKaraokeColor = '#F59E0B',
  setQuranKaraokeColor,
  quranKaraokeSyncOffsetMs = 150,
  setQuranKaraokeSyncOffsetMs,
  onReplaceBismillahWithTabarakallazi,
  onApplyTranslationToTimeline,
  onApplyDualTranslationToTimeline,
  onApplyQuranStyles,
  onApplyGlobalFontSize,
  onApplyGlobalTextCase,
  onOpenAISegmentation,
  onOpen100Protocols,
  watermark,
  setWatermark,
  width,
  selectedClip,
  onUpdateClip,
  onAutoSegmentAudio,
  onAutoSyncVideoToAyahs,
  onAutoRemoveSilence,
  onAutoSegmentRhythm,
  onReplaceVideoTrackClips,
  onReplaceTracks,
  onSeekTime,
  currentTime = 0,
  onRepairQuranSync,
  quranShowSurahHeader = false,
  setQuranShowSurahHeader,
  quranSurahHeaderStyle = 'ornate',
  setQuranSurahHeaderStyle,
  quranSurahHeaderFont = 'Playfair Display',
  setQuranSurahHeaderFont,
  quranSurahHeaderSize = 24,
  setQuranSurahHeaderSize,
  quranSurahHeaderColor = '#FFFFFF',
  setQuranSurahHeaderColor,
  quranSurahHeaderY = 15,
  setQuranSurahHeaderY,
  quranSurahHeaderFormat = 'both',
  setQuranSurahHeaderFormat,
  quranSurahHeaderBg = 'none',
  setQuranSurahHeaderBg,
  quranSurahHeaderBgColor = '#000000',
  setQuranSurahHeaderBgColor,
  quranSurahHeaderBgOpacity = 50,
  setQuranSurahHeaderBgOpacity,
  quranCaptionDisplayMode = 'full-ayah',
  setQuranCaptionDisplayMode,
  quranSingleWordScale = 1.35,
  setQuranSingleWordScale,
  quranSingleWordPop = true,
  setQuranSingleWordPop,
  quranShowQariBadge = false,
  setQuranShowQariBadge,
  quranQariName = 'Mishary Rashid Alafasy',
  setQuranQariName,
  quranQariBadgePosition = 'top-right',
  setQuranQariBadgePosition,
  quranShowWaveform = false,
  setQuranShowWaveform,
  quranWaveformStyle = 'bars',
  setQuranWaveformStyle,
  quranWaveformColor = '#F59E0B',
  setQuranWaveformColor,
  quranWaveformY = 86,
  setQuranWaveformY,
  onAddBismillahCard,
  onAddSadaqallahCard,
}: MediaPanelProps) {
  const [activeTab, setActiveTab] = useState<'ai-studio' | 'upload' | 'video' | 'audio' | 'sfx' | 'image' | 'text' | 'stickers' | 'effects' | 'transitions' | 'filters' | 'adjustment' | 'quran-visuals' | 'quran' | 'background' | 'watermark'>(initialTab || 'upload');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [addedFeedback, setAddedFeedback] = useState<string | null>(null);
  const showAddedToast = (name: string) => {
    setAddedFeedback(name);
    setTimeout(() => {
      setAddedFeedback((prev) => (prev === name ? null : prev));
    }, 2500);
  };
  const [customAssets, setCustomAssets] = useState<any[]>([]);
  const [importsViewMode, setImportsViewMode] = useState<'list' | 'grid'>('list');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CapCut Audio Preview Player State (from video at 1:25 - 1:36)
  const [previewAudioTrack, setPreviewAudioTrack] = useState<CapCutAudioItem | null>(null);
  const [isPlayingAudioPreview, setIsPlayingAudioPreview] = useState(false);
  const [previewAudioCurrentTime, setPreviewAudioCurrentTime] = useState(0);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // CapCut Audio Subtab & Filter category
  const [videoCategory, setVideoCategory] = useState<string>('All');
  const [videoSearchQuery, setVideoSearchQuery] = useState<string>('');
  const [imageCategory, setImageCategory] = useState<string>('Background');
  const [textCategory, setTextCategory] = useState<string>('Templates');

  const [audioSubTab, setAudioSubTab] = useState<'music' | 'sfx' | 'record'>('music');
  const [audioCategory, setAudioCategory] = useState<string>('Trending');

  // CapCut Sticker category
  const [stickerCategory, setStickerCategory] = useState<'islamic' | 'social' | 'trending' | 'emoji' | 'emphasis' | 'arrows' | 'celebration'>('islamic');

  // CapCut Effect category
  const [effectCategory, setEffectCategory] = useState<'spiritual' | 'particles' | 'trending' | 'opening' | 'lens' | 'retro' | 'party' | 'glitch'>('spiritual');

  // CapCut Transition category
  const [transitionCategory, setTransitionCategory] = useState<'spiritual' | 'trending' | 'basic' | 'overlay' | 'light' | 'camera' | '3d'>('spiritual');

  // CapCut Filter category
  const [filterCategory, setFilterCategory] = useState<'islamic' | 'cinematic' | 'featured' | 'life' | 'scenery' | 'movie' | 'retro' | 'night'>('islamic');

  // CapCut Upload category
  const [uploadCategory, setUploadCategory] = useState<'all' | 'video' | 'audio' | 'image'>('all');

  // Live Microphone Voiceover Recorder State
  const [isRecordingMic, setIsRecordingMic] = useState(false);
  const [micRecordingTime, setMicRecordingTime] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micTimerRef = useRef<any>(null);
  const micChunksRef = useRef<Blob[]>([]);

  const startMicRecording = async () => {
    setMicError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone recording is not supported in this browser environment.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      micChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          micChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(micChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const recordDuration = Math.max(1, micRecordingTime);

        const fileId = `voiceover-${Date.now()}`;
        const newAsset = {
          id: fileId,
          name: `Voiceover Recording (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})`,
          type: 'audio',
          url: audioUrl,
          duration: recordDuration,
          thumbnail: '🎙️',
          size: `${(audioBlob.size / (1024 * 1024)).toFixed(2)} MB`
        };

        setCustomAssets(prev => [newAsset, ...prev]);

        // Auto Add to Timeline Audio track
        onAddClip({
          name: newAsset.name,
          type: ClipType.AUDIO,
          url: audioUrl,
          duration: recordDuration,
          sourceStart: 0,
          sourceDuration: recordDuration,
          playbackRate: 1.0,
          volume: 1.0
        });

        if (micStreamRef.current) {
          micStreamRef.current.getTracks().forEach(t => t.stop());
          micStreamRef.current = null;
        }
      };

      recorder.start(100);
      setIsRecordingMic(true);
      setMicRecordingTime(0);

      if (micTimerRef.current) clearInterval(micTimerRef.current);
      micTimerRef.current = setInterval(() => {
        setMicRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Mic recording error:', err);
      setMicError(err.message || 'Microphone access denied or unreadable.');
      setIsRecordingMic(false);
    }
  };

  const stopMicRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (micTimerRef.current) {
      clearInterval(micTimerRef.current);
      micTimerRef.current = null;
    }
    setIsRecordingMic(false);
  };

  useEffect(() => {
    return () => {
      if (micTimerRef.current) clearInterval(micTimerRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Translation Suite Internal UI State
  const [isApplyingTranslation, setIsApplyingTranslation] = useState<boolean>(false);
  const [translationToast, setTranslationToast] = useState<string | null>(null);
  const [translationSearchQuery, setTranslationSearchQuery] = useState<string>('');

  const currentTranslation = getTranslationOptionById(quranTranslation);

  const handleSelectTranslation = async (transId: string, autoApplyToTimeline: boolean = false) => {
    if (setQuranTranslation) {
      setQuranTranslation(transId);
    }
    const opt = getTranslationOptionById(transId);
    
    // Auto adapt Translation font to optimal script font for the selected language
    if (opt.defaultFont) {
      setQuranEnglishFont(opt.defaultFont);
      onApplyQuranStyles({ englishFont: opt.defaultFont });
    }

    if (autoApplyToTimeline && onApplyTranslationToTimeline) {
      setIsApplyingTranslation(true);
      try {
        await onApplyTranslationToTimeline(transId);
        setTranslationToast(`✓ Applied ${opt.language} (${opt.translator}) to Timeline!`);
        setTimeout(() => setTranslationToast(null), 3500);
      } finally {
        setIsApplyingTranslation(false);
      }
    }
  };

  const handleTriggerApplyTranslation = async () => {
    if (!onApplyTranslationToTimeline) return;
    setIsApplyingTranslation(true);
    try {
      await onApplyTranslationToTimeline(quranTranslation);
      setTranslationToast(`✓ Applied ${currentTranslation.language} (${currentTranslation.translator}) to Timeline!`);
      setTimeout(() => setTranslationToast(null), 3500);
    } finally {
      setIsApplyingTranslation(false);
    }
  };

  // Global Typography & Text Transformation Suite state
  const [globalFontSize, setGlobalFontSize] = useState<number>(24);
  const [activeTextCase, setActiveTextCase] = useState<'uppercase' | 'lowercase' | 'capitalize' | null>(null);

  const handleGlobalFontSizeChange = (size: number) => {
    const validSize = Math.max(10, Math.min(80, size));
    setGlobalFontSize(validSize);
    if (onApplyGlobalFontSize) {
      onApplyGlobalFontSize(validSize);
    } else {
      onApplyQuranStyles({
        arabicSize: Math.max(16, Math.round(validSize * 1.35)),
        englishSize: validSize
      });
    }
  };

  const handleGlobalTextCaseChange = (casing: 'uppercase' | 'lowercase' | 'capitalize') => {
    setActiveTextCase(casing);
    if (onApplyGlobalTextCase) {
      onApplyGlobalTextCase(casing);
    } else {
      onApplyQuranStyles({
        englishUppercase: casing === 'uppercase'
      });
    }
  };

  // Tab horizontal scroll & bottom slider state
  const tabsRef = useRef<HTMLDivElement>(null);
  const [tabScrollPercent, setTabScrollPercent] = useState<number>(0);

  const handleTabScroll = () => {
    if (!tabsRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setTabScrollPercent((scrollLeft / maxScroll) * 100);
    } else {
      setTabScrollPercent(0);
    }
  };

  const handleBottomSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setTabScrollPercent(val);
    if (tabsRef.current) {
      const { scrollWidth, clientWidth } = tabsRef.current;
      const maxScroll = scrollWidth - clientWidth;
      tabsRef.current.scrollLeft = (val / 100) * maxScroll;
    }
  };

  useEffect(() => {
    if (!tabsRef.current) return;
    const activeBtn = tabsRef.current.querySelector(`#tab-${activeTab}`);
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeTab]);

  // Quran Form states
  const [quranSurahPreset, setQuranSurahPreset] = useState<string>('67');
  const [quranSurahCustom, setQuranSurahCustom] = useState<number>(67);
  const [surahDropdownOpen, setSurahDropdownOpen] = useState<boolean>(false);
  const [surahSearchText, setSurahSearchText] = useState<string>('');
  const [quranSelectionType, setQuranSelectionType] = useState<'single' | 'range' | 'list' | 'all' | 'mixed'>('all');
  const [quranSurahEnd, setQuranSurahEnd] = useState<number>(3);
  const [quranSurahList, setQuranSurahList] = useState<string>('112, 113, 114');
  const [quranStartAyah, setQuranStartAyah] = useState<number>(1);
  const [quranMode, setQuranMode] = useState<'individual' | 'batch'>('batch');
  const [quranStyle, setQuranStyle] = useState<string>('Imperial Gold');
  const [styleAppliedNotice, setStyleAppliedNotice] = useState<string | null>(null);
  const [bgSearchQuery, setBgSearchQuery] = useState<string>('');
  const [bgMediaType, setBgMediaType] = useState<'video' | 'image'>('video');
  const [stockSearchResults, setStockSearchResults] = useState<any[]>([]);
  const [isSearchingStock, setIsSearchingStock] = useState<boolean>(false);
  const [stockSourceProvider, setStockSourceProvider] = useState<'auto' | 'pexels' | 'pixabay'>('auto');
  const [stockSearchNotice, setStockSearchNotice] = useState<string | null>(null);

  // Direct download media from Pexels / Pixabay via server proxy to avoid CORS
  const downloadStockMedia = (url: string, filename: string) => {
    if (!url) return;
    const downloadEndpoint = `/api/stock/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
    const a = document.createElement('a');
    a.href = downloadEndpoint;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSearchStockMedia = async (queryToSearch?: string) => {
    const q = (queryToSearch !== undefined ? queryToSearch : bgSearchQuery).trim() || 'nature landscape';
    setIsSearchingStock(true);
    setStockSearchNotice(null);
    try {
      const isFileProtocol = typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';

      if (!isFileProtocol) {
        try {
          const res = await fetch(`/api/stock/search?query=${encodeURIComponent(q)}&mediaType=${bgMediaType}&source=${stockSourceProvider}&count=8`);
          if (res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data.items) && data.items.length > 0) {
              setStockSearchResults(data.items);
              setStockSearchNotice(`Found ${data.items.length} ${data.sourceUsed?.toUpperCase() || 'STOCK'} assets`);
              return;
            }
          }
        } catch (serverErr) {
          console.log('[MediaPanel] Server stock search bypassed, using client fallback:', serverErr);
        }
      }

      // Direct client search (works in Electron, Snap, file://, and offline environments)
      const clientRes = await searchMultiSourceStock(q, bgMediaType, 8, { source: stockSourceProvider });
      if (clientRes && Array.isArray(clientRes.items) && clientRes.items.length > 0) {
        setStockSearchResults(clientRes.items);
        setStockSearchNotice(`Found ${clientRes.items.length} ${clientRes.sourceUsed?.toUpperCase() || 'STOCK'} assets`);
      } else {
        setStockSearchNotice('No direct media found for query.');
      }
    } catch (e) {
      console.warn('Stock search failed', e);
      setStockSearchNotice('Error searching stock media.');
    } finally {
      setIsSearchingStock(false);
    }
  };

  // Helper to extract Ayahs currently placed on the timeline
  const getTimelineAyahs = () => {
    const textTracks = tracks.filter(t => t.type === 'text');
    const audioTracks = tracks.filter(t => t.type === 'audio');
    const result: Array<{ name: string; start: number; duration: number }> = [];

    textTracks.forEach(t => {
      t.clips.forEach(c => {
        if (c.type === 'text' && c.text?.trim()) {
          result.push({
            name: c.name || c.text.substring(0, 20),
            start: c.start,
            duration: c.duration
          });
        }
      });
    });

    if (result.length === 0) {
      audioTracks.forEach(t => {
        t.clips.forEach((c, idx) => {
          result.push({
            name: c.name || `Ayah Audio ${idx + 1}`,
            start: c.start,
            duration: c.duration
          });
        });
      });
    }

    return result.sort((a, b) => a.start - b.start);
  };

  const handleAutoAssignStockToTimeline = (items: any[]) => {
    if (!items || items.length === 0) return;
    const ayahs = getTimelineAyahs();
    if (ayahs.length === 0) {
      // Add first item normally to timeline
      const item = items[0];
      const isVid = item.mediaType === 'video';
      onAddClip({
        name: `Stock: ${item.title || 'Scene'} [${item.source.toUpperCase()}]`,
        type: isVid ? ClipType.VIDEO : ClipType.IMAGE,
        isImage: !isVid,
        url: item.url,
        poster: item.thumbnail,
        thumbnailUrl: item.thumbnail,
        fallbackUrl: item.thumbnail,
        duration: 15,
        sourceStart: 0,
        sourceDuration: 15,
        playbackRate: 1.0,
        volume: isVid ? 0 : 1.0
      });
      showAddedToast(`Added ${item.title || 'Stock media'} to timeline`);
      return;
    }

    // Assign 1 item per Ayah on timeline
    ayahs.forEach((ayah, i) => {
      const item = items[i % items.length];
      const isVid = item.mediaType === 'video';
      onAddClip({
        name: `Scene ${i + 1}: ${ayah.name} [${item.source.toUpperCase()}]`,
        type: isVid ? ClipType.VIDEO : ClipType.IMAGE,
        isImage: !isVid,
        url: item.url,
        poster: item.thumbnail,
        thumbnailUrl: item.thumbnail,
        fallbackUrl: item.thumbnail,
        duration: ayah.duration,
        start: ayah.start,
        sourceStart: 0,
        sourceDuration: ayah.duration,
        playbackRate: 1.0,
        volume: isVid ? 0 : 1.0
      });
    });

    showAddedToast(`Assigned ${ayahs.length} ${items[0].source.toUpperCase()} visuals matching each Ayah!`);
  };

  const handleOpenExternalUrl = async (url: string) => {
    await openExternalUrl(url);
  };

  const handleStylePresetChange = (presetName: string) => {
    setQuranStyle(presetName);
    if (presetName === 'Neon Glow') {
      setQuranArabicFont('Amiri');
      setQuranArabicSize(32);
      setQuranArabicColor('#00ffff');
      setQuranArabicStyle('neon');
      setQuranArabicY(35);

      setQuranEnglishFont('Space Grotesk');
      setQuranEnglishSize(22);
      setQuranEnglishColor('#ff00ff');
      setQuranEnglishStyle('neon');
      setQuranEnglishY(72);
      setQuranEnglishUppercase(true);

      onApplyQuranStyles({
        arabicFont: 'Amiri',
        arabicSize: 32,
        arabicColor: '#00ffff',
        arabicStyle: 'neon',
        arabicY: 35,
        englishFont: 'Space Grotesk',
        englishSize: 22,
        englishColor: '#ff00ff',
        englishStyle: 'neon',
        englishY: 72,
        englishUppercase: true
      });
    } else if (presetName === 'Imperial Gold') {
      setQuranArabicFont('Amiri');
      setQuranArabicSize(36);
      setQuranArabicColor('#ffd700');
      setQuranArabicStyle('outline');
      setQuranArabicY(35);

      setQuranEnglishFont('Inter');
      setQuranEnglishSize(20);
      setQuranEnglishColor('#ffffff');
      setQuranEnglishStyle('shadow');
      setQuranEnglishY(72);
      setQuranEnglishUppercase(false);

      onApplyQuranStyles({
        arabicFont: 'Amiri',
        arabicSize: 36,
        arabicColor: '#ffd700',
        arabicStyle: 'outline',
        arabicY: 35,
        englishFont: 'Inter',
        englishSize: 20,
        englishColor: '#ffffff',
        englishStyle: 'shadow',
        englishY: 72,
        englishUppercase: false
      });
    } else if (presetName === 'Subtle White') {
      setQuranArabicFont('Scheherazade New');
      setQuranArabicSize(32);
      setQuranArabicColor('#ffffff');
      setQuranArabicStyle('outline');
      setQuranArabicY(35);

      setQuranEnglishFont('Inter');
      setQuranEnglishSize(18);
      setQuranEnglishColor('#f3f4f6');
      setQuranEnglishStyle('shadow');
      setQuranEnglishY(72);
      setQuranEnglishUppercase(false);

      onApplyQuranStyles({
        arabicFont: 'Scheherazade New',
        arabicSize: 32,
        arabicColor: '#ffffff',
        arabicStyle: 'outline',
        arabicY: 35,
        englishFont: 'Inter',
        englishSize: 18,
        englishColor: '#f3f4f6',
        englishStyle: 'shadow',
        englishY: 72,
        englishUppercase: false
      });
    } else if (presetName === 'Chroma Green') {
      setQuranArabicFont('Amiri');
      setQuranArabicSize(34);
      setQuranArabicColor('#00ff00');
      setQuranArabicStyle('outline');
      setQuranArabicY(35);

      setQuranEnglishFont('Inter');
      setQuranEnglishSize(22);
      setQuranEnglishColor('#00ff00');
      setQuranEnglishStyle('outline');
      setQuranEnglishY(72);
      setQuranEnglishUppercase(false);

      onApplyQuranStyles({
        arabicFont: 'Amiri',
        arabicSize: 34,
        arabicColor: '#00ff00',
        arabicStyle: 'outline',
        arabicY: 35,
        englishFont: 'Inter',
        englishSize: 22,
        englishColor: '#00ff00',
        englishStyle: 'outline',
        englishY: 72,
        englishUppercase: false
      });
    }
  };

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the logger terminal
  useEffect(() => {
    if (activeTab === 'quran' && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aligningStatus?.log, activeTab]);

  // Handle Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  // Helper to format file sizes accurately
  const formatFileSize = (bytes: number): string => {
    if (!bytes || isNaN(bytes) || bytes <= 0) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  // Helper to extract a crisp video thumbnail image frame
  const generateVideoThumbnail = (videoUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const safeCrossOrigin = getSafeCrossOrigin(videoUrl);
      if (safeCrossOrigin) {
        video.crossOrigin = safeCrossOrigin;
      }
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute('webkit-playsinline', 'true');
      video.setAttribute('playsinline', 'true');
      video.preload = 'auto';
      video.src = videoUrl;

      let resolved = false;
      const captureFrame = () => {
        if (resolved) return;
        resolved = true;
        try {
          const canvas = document.createElement('canvas');
          const width = video.videoWidth || 320;
          const height = video.videoHeight || 180;
          const targetWidth = Math.min(320, width);
          const targetHeight = Math.round((height / (width || 1)) * targetWidth) || 180;
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          if (ctx && canvas.width > 0 && canvas.height > 0) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            resolve(dataUrl);
            return;
          }
        } catch (err) {
          console.warn('Video thumbnail capture failed', err);
        }
        resolve('');
      };

      video.addEventListener('loadeddata', () => {
        if (video.duration > 0.5) {
          video.currentTime = Math.min(1.0, video.duration * 0.1);
        } else {
          captureFrame();
        }
      });

      video.addEventListener('seeked', () => {
        captureFrame();
      });

      video.addEventListener('error', () => {
        if (!resolved) {
          resolved = true;
          resolve('');
        }
      });

      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve('');
        }
      }, 2500);
    });
  };

  // Process uploaded files and probe their duration locally
  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(async (file) => {
      const url = URL.createObjectURL(file);
      const fileNameLower = file.name.toLowerCase();
      const isImage = file.type.startsWith('image/') || /\.(jfif|jpe?g|png|webp|gif|bmp|svg|avif|ico)$/i.test(fileNameLower);
      const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v|mkv|avi|flv|wmv|ts)$/i.test(fileNameLower);
      const isAudio = file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac|flac|wma|opus)$/i.test(fileNameLower);

      if (!isVideo && !isAudio && !isImage) {
        alert('Please upload a valid Video, Audio, or Image file.');
        return;
      }

      const fileId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const formattedSize = formatFileSize(file.size);

      if (isImage) {
        // Images don't need duration probing, default to 10 seconds
        const newAsset = {
          id: fileId,
          name: file.name,
          type: 'video', // treated as video clip on timeline
          isImage: true,
          url: url,
          thumbnailUrl: url,
          duration: 10.0,
          thumbnail: '🖼️',
          size: formattedSize
        };
        setCustomAssets(prev => [newAsset, ...prev]);
        setActiveTab('upload');
      } else if (isVideo) {
        // Probe duration and capture video thumbnail
        const element = document.createElement('video');
        const safeCrossOrigin = getSafeCrossOrigin(url);
        if (safeCrossOrigin) {
          element.crossOrigin = safeCrossOrigin;
        }
        element.muted = true;
        element.defaultMuted = true;
        element.playsInline = true;
        element.setAttribute('webkit-playsinline', 'true');
        element.setAttribute('playsinline', 'true');
        element.src = url;

        let resolved = false;

        const handleSuccess = async () => {
          if (resolved) return;
          resolved = true;
          const duration = element.duration || 10;
          let thumbUrl = '';
          try {
            thumbUrl = await generateVideoThumbnail(url);
          } catch (e) {
            console.warn('Video thumb generation error:', e);
          }

          const newAsset = {
            id: fileId,
            name: file.name,
            type: 'video',
            isImage: false,
            url: url,
            thumbnailUrl: thumbUrl || undefined,
            duration: parseFloat(duration.toFixed(2)),
            thumbnail: '📹',
            size: formattedSize
          };

          setCustomAssets(prev => [newAsset, ...prev]);
          setActiveTab('upload');
          cleanup();
        };

        const handleError = () => {
          if (resolved) return;
          resolved = true;
          // Fallback to 10s on error
          const newAsset = {
            id: fileId,
            name: file.name,
            type: 'video',
            isImage: false,
            url: url,
            duration: 10.0,
            thumbnail: '📹',
            size: formattedSize
          };
          setCustomAssets(prev => [newAsset, ...prev]);
          setActiveTab('upload');
          cleanup();
        };

        const cleanup = () => {
          element.removeEventListener('loadedmetadata', handleSuccess);
          element.removeEventListener('error', handleError);
        };

        element.addEventListener('loadedmetadata', handleSuccess);
        element.addEventListener('error', handleError);

        // Safety timeout of 3.0 seconds in case loadedmetadata never fires
        setTimeout(() => {
          if (!resolved) {
            handleError();
          }
        }, 3000);
      } else if (isAudio) {
        // Probe duration for audio
        const element = document.createElement('audio');
        element.src = url;

        let resolved = false;

        const handleSuccess = () => {
          if (resolved) return;
          resolved = true;
          const duration = element.duration || 10;
          const newAsset = {
            id: fileId,
            name: file.name,
            type: 'audio',
            isImage: false,
            url: url,
            duration: parseFloat(duration.toFixed(2)),
            thumbnail: '🎵',
            size: formattedSize
          };

          setCustomAssets(prev => [newAsset, ...prev]);
          setActiveTab('upload');
          cleanup();
        };

        const handleError = () => {
          if (resolved) return;
          resolved = true;
          const newAsset = {
            id: fileId,
            name: file.name,
            type: 'audio',
            isImage: false,
            url: url,
            duration: 10.0,
            thumbnail: '🎵',
            size: formattedSize
          };
          setCustomAssets(prev => [newAsset, ...prev]);
          setActiveTab('upload');
          cleanup();
        };

        const cleanup = () => {
          element.removeEventListener('loadedmetadata', handleSuccess);
          element.removeEventListener('error', handleError);
        };

        element.addEventListener('loadedmetadata', handleSuccess);
        element.addEventListener('error', handleError);

        setTimeout(() => {
          if (!resolved) {
            handleError();
          }
        }, 3000);
      }
    });
  };

  const addPresetVideo = (video: typeof STOCK_VIDEOS[0]) => {
    showAddedToast(video.name);
    const isExplicitImage = video.isImage === true;
    onAddClip({
      name: video.name,
      type: ClipType.VIDEO,
      isImage: isExplicitImage,
      url: video.url,
      poster: video.thumbnail,
      thumbnailUrl: video.thumbnail,
      fallbackUrl: video.thumbnail,
      duration: video.duration,
      sourceStart: 0,
      sourceDuration: video.duration,
      playbackRate: 1.0,
      volume: 1.0,
      filters: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        grayscale: 0,
        sepia: 0,
        invert: 0,
        hueRotate: 0,
        chromaKey: {
          enabled: false,
          color: '#00ff00',
          threshold: 30,
          smoothness: 10
        }
      }
    });
  };

  const addPresetAudio = (audio: typeof STOCK_AUDIOS[0]) => {
    showAddedToast(audio.name);
    onAddClip({
      name: audio.name,
      type: ClipType.AUDIO,
      url: audio.url,
      duration: audio.duration,
      sourceStart: 0,
      sourceDuration: audio.duration,
      playbackRate: 1.0,
      volume: 1.0
    });
  };

  const addPresetImage = (image: typeof STOCK_IMAGES[0]) => {
    showAddedToast(image.name);
    onAddClip({
      name: image.name,
      type: ClipType.IMAGE,
      url: image.url,
      poster: image.thumbnail || image.url,
      thumbnailUrl: image.thumbnail || image.url,
      fallbackUrl: image.thumbnail || image.url,
      duration: image.duration || 8,
      sourceStart: 0,
      sourceDuration: image.duration || 8,
      playbackRate: 1.0,
      volume: 1.0,
      isImage: true,
      filters: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        grayscale: 0,
        sepia: 0,
        invert: 0,
        hueRotate: 0,
        chromaKey: {
          enabled: false,
          color: '#00ff00',
          threshold: 30,
          smoothness: 10
        }
      }
    });
  };

  const addPresetText = (preset: typeof TEXT_PRESETS[0]) => {
    showAddedToast(preset.name);
    onAddClip({
      name: preset.name,
      type: ClipType.TEXT,
      text: preset.text,
      fontSize: preset.size,
      color: preset.color,
      fontFamily: (preset as any).fontFamily || 'sans-serif',
      textStyle: preset.style as any,
      textX: 50,
      textY: 50,
      duration: 5, // Default 5 seconds
      sourceStart: 0,
      sourceDuration: 5,
      playbackRate: 1.0,
      volume: 1.0
    });
  };

  const addCapCutAudio = (track: CapCutAudioItem) => {
    showAddedToast(track.name);
    onAddClip({
      name: track.name,
      type: ClipType.AUDIO,
      url: track.url,
      duration: Math.min(track.duration, 30),
      sourceStart: 0,
      sourceDuration: track.duration,
      volume: 1.0,
      playbackRate: 1.0,
    });
  };

  const addDefaultText = () => {
    showAddedToast('Default text');
    onAddClip({
      name: 'Default text',
      type: ClipType.TEXT,
      text: 'Default text',
      fontSize: 48,
      color: '#FFFFFF',
      fontFamily: 'Montserrat',
      textX: 50,
      textY: 50,
      duration: 5,
      sourceStart: 0,
      sourceDuration: 5,
      playbackRate: 1.0,
      volume: 1.0,
    });
  };

  const addSticker = (sticker: typeof CAPCUT_STICKERS[0]) => {
    showAddedToast(`Sticker: ${sticker.emoji}`);
    onAddClip({
      name: `Sticker - ${sticker.name}`,
      type: ClipType.TEXT,
      text: sticker.emoji,
      fontSize: 72,
      color: '#FFFFFF',
      textX: 50,
      textY: 50,
      duration: 4,
      sourceStart: 0,
      sourceDuration: 4,
      playbackRate: 1.0,
      volume: 1.0,
    });
  };

  const addCapCutEffect = (eff: typeof CAPCUT_EFFECTS[0]) => {
    showAddedToast(eff.name);
    onAddClip({
      name: `Effect: ${eff.name}`,
      type: ClipType.VIDEO,
      url: '',
      duration: 4,
      sourceStart: 0,
      sourceDuration: 4,
      blendMode: 'screen',
      videoEffects: {
        blur: eff.category === 'opening' ? 4 : 0,
        shake: eff.id === 'eff-prickle-warp',
        glitch: eff.id === 'eff-vhs-glitch',
        filmGrain: eff.id === 'eff-film-grain',
        rgbSplit: eff.category === 'party',
        goldenDust: eff.id === 'eff-golden-dust',
        noorRays: eff.id === 'eff-noor-rays',
        floatingStars: eff.id === 'eff-floating-stars',
        dreamyGlow: eff.id === 'eff-dreamy-glow',
        vignette: true,
      },
      playbackRate: 1.0,
      volume: 0,
    });
  };

  const addCapCutFilter = (filt: typeof CAPCUT_FILTERS[0]) => {
    showAddedToast(filt.name);
    onAddClip({
      name: `Filter: ${filt.name}`,
      type: ClipType.VIDEO,
      url: '',
      duration: 5,
      sourceStart: 0,
      sourceDuration: 5,
      blendMode: 'soft-light',
      filters: {
        brightness: filt.settings.brightness ?? 100,
        contrast: filt.settings.contrast ?? 100,
        saturation: filt.settings.saturation ?? 100,
        sepia: filt.settings.sepia ?? 0,
        grayscale: 0,
        invert: 0,
        hueRotate: 0,
        chromaKey: { enabled: false, color: '#00ff00', threshold: 30, smoothness: 10 }
      },
      playbackRate: 1.0,
      volume: 0,
    });
  };

  const addAdjustmentLayer = () => {
    showAddedToast('Adjustment Layer');
    onAddClip({
      name: 'Adjustment Layer 1',
      type: ClipType.VIDEO,
      url: '',
      duration: 6,
      sourceStart: 0,
      sourceDuration: 6,
      blendMode: 'normal',
      filters: {
        brightness: 100,
        contrast: 105,
        saturation: 110,
        grayscale: 0,
        sepia: 0,
        invert: 0,
        hueRotate: 0,
        chromaKey: { enabled: false, color: '#00ff00', threshold: 30, smoothness: 10 }
      },
      playbackRate: 1.0,
      volume: 0,
    });
  };

  const togglePlayAudioPreview = (track: CapCutAudioItem) => {
    if (previewAudioTrack?.id === track.id) {
      if (isPlayingAudioPreview) {
        previewAudioRef.current?.pause();
        setIsPlayingAudioPreview(false);
      } else {
        previewAudioRef.current?.play().catch(() => {});
        setIsPlayingAudioPreview(true);
      }
    } else {
      setPreviewAudioTrack(track);
      setIsPlayingAudioPreview(true);
      if (previewAudioRef.current) {
        previewAudioRef.current.src = track.url;
        previewAudioRef.current.currentTime = 0;
        previewAudioRef.current.play().catch(() => {});
      }
    }
  };

  const deleteCustomAsset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomAssets(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div
      id="media-panel"
      className="bg-[#141418] rounded-lg border border-[#23232b] flex flex-col h-full select-none overflow-hidden shadow-sm flex-shrink-0"
      style={{ width: width !== undefined ? `${width}px` : undefined }}
    >
      {/* CapCut Top Horizontal Tab Navigation Menu Bar (Icon on Top, Text Below) */}
      <div className="border-b border-[#23232b] bg-[#121216] px-2 py-1 flex items-center gap-1 overflow-x-auto custom-scrollbar flex-shrink-0">
        {[
          { id: 'ai-studio', label: 'AI Video', icon: Sparkles, isPurple: true, isAmber: false, isEmerald: false },
          { id: 'upload', label: 'Media', icon: Upload, isPurple: false, isAmber: false, isEmerald: false },
          { id: 'video', label: 'Stock', icon: Film, isPurple: false, isAmber: false, isEmerald: false },
          { id: 'audio', label: 'Audio', icon: Music, isPurple: false, isAmber: false, isEmerald: false },
          { id: 'sfx', label: 'Sound FX', icon: Bell, isPurple: false, isAmber: false, isEmerald: false },
          { id: 'text', label: 'Text', icon: Type, isPurple: false, isAmber: false, isEmerald: false },
          { id: 'stickers', label: 'Stickers', icon: Smile, isPurple: false, isAmber: false, isEmerald: false },
          { id: 'effects', label: 'Effects', icon: Wand2, isPurple: false, isAmber: false, isEmerald: false },
          { id: 'transitions', label: 'Transitions', icon: Blend, isPurple: false, isAmber: false, isEmerald: false },
          { id: 'filters', label: 'Filters', icon: Palette, isPurple: false, isAmber: false, isEmerald: false },
          { id: 'adjustment', label: 'Adjust', icon: Sliders, isPurple: false, isAmber: false, isEmerald: false },
          { id: 'quran', label: 'Quran AI', icon: BookOpen, isPurple: false, isAmber: true, isEmerald: false },
          { id: 'quran-visuals', label: 'Visuals', icon: Sparkles, isPurple: false, isAmber: false, isEmerald: true },
          { id: 'background', label: 'Free BG', icon: Globe, isPurple: false, isAmber: false, isEmerald: false },
          { id: 'watermark', label: 'Branding', icon: Shield, isPurple: false, isAmber: false, isEmerald: false },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          let activeStyles = 'text-cyan-400 bg-[#20202a] font-bold border-b-2 border-cyan-400';
          let inactiveStyles = 'text-gray-400 hover:text-gray-200 hover:bg-[#181820] border-b-2 border-transparent';
          
          if (tab.isPurple) {
            activeStyles = 'text-purple-300 bg-purple-950/50 font-bold border-b-2 border-purple-400';
            inactiveStyles = 'text-purple-400/80 hover:text-purple-200 hover:bg-purple-950/20 border-b-2 border-transparent';
          } else if (tab.isAmber) {
            activeStyles = 'text-amber-300 bg-amber-950/40 font-bold border-b-2 border-amber-400';
            inactiveStyles = 'text-amber-400/80 hover:text-amber-200 hover:bg-amber-950/20 border-b-2 border-transparent';
          } else if (tab.isEmerald) {
            activeStyles = 'text-emerald-300 bg-emerald-950/40 font-bold border-b-2 border-emerald-400';
            inactiveStyles = 'text-emerald-400/80 hover:text-emerald-200 hover:bg-emerald-950/20 border-b-2 border-transparent';
          }

          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-t-lg transition flex-shrink-0 min-w-[58px] ${isActive ? activeStyles : inactiveStyles}`}
            >
              <Icon className="w-4 h-4 mb-1" />
              <span className="text-[10px] tracking-wide whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className={`flex-1 min-h-0 flex flex-col ${['video', 'audio', 'sfx', 'text', 'stickers', 'effects', 'transitions', 'filters', 'adjustment', 'upload'].includes(activeTab) ? 'overflow-hidden p-0' : 'overflow-y-auto p-4 custom-scrollbar'}`}>
        {activeTab === 'ai-studio' && (
          <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {/* AI Studio Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-950/80 via-[#1a1226] to-[#0d0914] border border-purple-500/40 p-5 shadow-xl">
              <div className="relative z-10 space-y-3">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-900/60 border border-purple-400/40 text-[10px] font-bold text-purple-200">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                  <span>AI Video Director & Story Studio</span>
                </div>
                <h3 className="text-lg font-black text-white tracking-tight">
                  Turn Prompts & Photos into Complete Videos
                </h3>
                <p className="text-xs text-purple-200/80 leading-relaxed max-w-md">
                  CuteCut Pro automatically writes scripts, generates synchronized voiceover, designs visual scenes, and places them directly onto your 4 timeline tracks!
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      if (onOpenAiPromptStudio) onOpenAiPromptStudio();
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-xs rounded-xl transition shadow-lg shadow-purple-900/40 flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>Open AI Prompt-to-Video Studio</span>
                  </button>
                  <button
                    onClick={() => {
                      if (onOpenVeoAnimateModal) onOpenVeoAnimateModal();
                    }}
                    className="px-4 py-2.5 bg-[#201733] hover:bg-[#2c2045] text-purple-200 border border-purple-500/30 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Film className="w-4 h-4 text-cyan-400" />
                    <span>Veo 3.1 Photo Animator</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div
                onClick={() => {
                  if (onOpenAiPromptStudio) onOpenAiPromptStudio();
                }}
                className="p-3.5 bg-[#171722] hover:bg-[#1f1f30] border border-gray-800 hover:border-purple-500/50 rounded-xl transition cursor-pointer space-y-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-900/40 border border-purple-500/40 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
                  <Wand2 className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Prompt to Full Video</h4>
                <p className="text-[11px] text-gray-400 leading-normal">
                  Give any topic and AI builds the storyboard, visuals, audio narration, and subtitles.
                </p>
              </div>

              <div
                onClick={() => {
                  if (onOpenAiPromptStudio) onOpenAiPromptStudio();
                }}
                className="p-3.5 bg-[#171722] hover:bg-[#1f1f30] border border-gray-800 hover:border-purple-500/50 rounded-xl transition cursor-pointer space-y-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-900/40 border border-indigo-500/40 flex items-center justify-center text-indigo-300 group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Story Photos to Motion</h4>
                <p className="text-[11px] text-gray-400 leading-normal">
                  Upload photos or comic panels; AI weaves a narration story with camera motion and BGM.
                </p>
              </div>

              <div
                onClick={() => {
                  if (onOpenAiPromptStudio) onOpenAiPromptStudio();
                }}
                className="p-3.5 bg-[#171722] hover:bg-[#1f1f30] border border-gray-800 hover:border-amber-500/50 rounded-xl transition cursor-pointer space-y-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-900/40 border border-amber-500/40 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                  <Film className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Islamic 1-Click Reels</h4>
                <p className="text-[11px] text-gray-400 leading-normal">
                  Generate 9:16 Shorts/Reels with Quranic calligraphy, recitation, and Urdu/English translation.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'video' && (
          <div className="flex flex-row h-full overflow-hidden">
            {/* CapCut Left Sidebar for Stock Categories */}
            <div className="w-36 border-r border-[#23232b] bg-[#111116] p-2 flex flex-col gap-1 overflow-y-auto custom-scrollbar shrink-0">
              <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider px-2 py-1">Categories</span>
              {[
                { id: 'All', label: 'All Stock', icon: '🎬' },
                { id: 'Social & Trending', label: 'Social & Trending', icon: '🔥' },
                { id: 'Atmosphere & Mood', label: 'Atmosphere & Mood', icon: '🌌' },
                { id: 'Islamic & Holy', label: 'Islamic & Holy', icon: '🕋' },
                { id: 'Nature & Skies', label: 'Nature & Skies', icon: '🌲' },
                { id: 'Rain & Water', label: 'Rain & Water', icon: '🌧️' },
                { id: 'Cosmic & Stars', label: 'Cosmic & Stars', icon: '✨' },
                { id: 'VFX & Noor', label: 'VFX & Noor', icon: '☀️' },
                { id: 'Green Screen', label: 'Green Screen', icon: '🟩' },
              ].map((cat) => {
                const isSelected = videoCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setVideoCategory(cat.id)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition text-left ${isSelected ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-xs' : 'text-gray-400 hover:text-white hover:bg-[#1a1a22]'}`}
                  >
                    <span className="text-sm shrink-0">{cat.icon}</span>
                    <span className="truncate text-[11px]">{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Video Content: Search & Grid */}
            <div className="flex-1 flex flex-col h-full overflow-hidden p-3 space-y-3">
              {/* Search Bar */}
              <div className="relative shrink-0">
                <input
                  type="text"
                  value={videoSearchQuery}
                  onChange={(e) => setVideoSearchQuery(e.target.value)}
                  placeholder="Search Stock (Makkah, Rain, Dawn, Stars...)"
                  className="w-full bg-[#181820] border border-gray-800 rounded-lg pl-3 pr-8 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/60"
                />
                {videoSearchQuery && (
                  <button
                    onClick={() => setVideoSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Veo AI Video Generation Quick Action */}
              {onOpenVeoAnimateModal && (
                <div
                  onClick={onOpenVeoAnimateModal}
                  className="bg-gradient-to-r from-cyan-950/40 via-[#141e2e] to-[#101018] border border-cyan-500/30 hover:border-cyan-400/80 rounded-xl p-2.5 flex items-center justify-between cursor-pointer transition shrink-0 group"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
                    <span className="text-[11px] font-bold text-cyan-200">Generate Video with Veo AI (From Photo)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-mono font-bold">
                    VEO 3.1
                  </span>
                </div>
              )}

              {/* Video Cards Grid */}
              <div className="grid grid-cols-2 gap-2.5 flex-1 overflow-y-auto pr-1 custom-scrollbar content-start">
                {STOCK_VIDEOS.filter((v) => {
                  const matchesCategory = videoCategory === 'All' || v.category === videoCategory;
                  const matchesSearch = !videoSearchQuery.trim() ||
                    v.name.toLowerCase().includes(videoSearchQuery.toLowerCase()) ||
                    v.category.toLowerCase().includes(videoSearchQuery.toLowerCase());
                  return matchesCategory && matchesSearch;
                }).map((video) => (
                  <StockVideoItemCard
                    key={video.id}
                    video={video}
                    onAdd={() => addPresetVideo(video)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="flex flex-row h-full overflow-hidden">
            {/* Audio Hidden Preview Player Element */}
            <audio
              ref={previewAudioRef}
              onEnded={() => setIsPlayingAudioPreview(false)}
              onTimeUpdate={(e) => setPreviewAudioCurrentTime(e.currentTarget.currentTime)}
            />

            {/* CapCut Left Sidebar for Audio Categories */}
            <div className="w-36 border-r border-[#23232b] bg-[#111116] p-2 flex flex-col gap-1 overflow-y-auto custom-scrollbar shrink-0">
              <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider px-2 py-1">Source</span>
              {[
                { id: 'music', label: 'Music', icon: '🎵' },
                { id: 'sfx', label: 'Sound FX', icon: '🔔' },
                { id: 'record', label: 'Record Voice', icon: '🎙️' },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setAudioSubTab(sub.id as any)}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition text-left ${audioSubTab === sub.id ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-xs' : 'text-gray-400 hover:text-white hover:bg-[#1a1a22]'}`}
                >
                  <span className="text-sm shrink-0">{sub.icon}</span>
                  <span className="truncate text-[11px]">{sub.label}</span>
                </button>
              ))}

              {audioSubTab !== 'record' && (
                <>
                  <div className="w-full h-px bg-gray-800 my-1.5" />
                  <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider px-2 py-0.5">Genres</span>
                  {[
                    { id: 'All', label: 'All Audio', icon: '🎧' },
                    { id: 'Spiritual', label: 'Spiritual', icon: '🕊️' },
                    { id: 'Trending', label: 'Trending', icon: '🔥' },
                    { id: 'Summer', label: 'Summer', icon: '☀️' },
                    { id: 'Vlog', label: 'Vlog', icon: '📹' },
                    { id: 'Travel', label: 'Travel', icon: '✈️' },
                    { id: 'Beat', label: 'Beat', icon: '🥁' },
                    { id: 'Lo-fi', label: 'Lo-fi', icon: '☕' },
                    { id: 'Pop', label: 'Pop', icon: '🎸' },
                  ].map((cat) => {
                    const isSelected = audioCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setAudioCategory(cat.id)}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition text-left ${isSelected ? (cat.id === 'Spiritual' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40') : 'text-gray-400 hover:text-white hover:bg-[#1a1a22]'}`}
                      >
                        <span className="text-xs shrink-0">{cat.icon}</span>
                        <span className="truncate text-[11px]">{cat.label}</span>
                      </button>
                    );
                  })}
                </>
              )}
            </div>

            {/* Right Audio Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden p-3 space-y-3">

            {audioSubTab === 'sfx' ? (
              <div className="flex-1 h-full overflow-hidden -m-3">
                <SoundEffectsPanel onAddClip={onAddClip} showAddedToast={showAddedToast} />
              </div>
            ) : audioSubTab === 'record' ? (
              <div className="space-y-4 p-3 bg-[#1c1c24] rounded-lg border border-gray-800 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-red-950/40 text-red-400 border border-red-800/40 flex items-center justify-center">
                  <Mic className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Live Microphone Voiceover</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Record clear commentary directly onto the audio track</p>
                </div>
                {isRecordingMic ? (
                  <button
                    onClick={stopMicRecording}
                    className="w-full py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition flex items-center justify-center gap-2"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop Recording ({micRecordingTime}s)</span>
                  </button>
                ) : (
                  <button
                    onClick={startMicRecording}
                    className="w-full py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition flex items-center justify-center gap-2"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Start Voiceover</span>
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Track List */}
                <div className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                  {CAPCUT_AUDIO_TRACKS.filter(t => audioCategory === 'All' || t.category === audioCategory).map((track) => {
                    const isCurrentPlaying = previewAudioTrack?.id === track.id && isPlayingAudioPreview;
                    return (
                      <div
                        key={track.id}
                        id={`capcut-audio-${track.id}`}
                        onClick={() => togglePlayAudioPreview(track)}
                        className={`group rounded-lg p-2 flex items-center gap-2.5 transition cursor-pointer border ${isCurrentPlaying ? 'bg-[#242430] border-cyan-500/40' : 'bg-[#1e1e26] hover:bg-[#252530] border-transparent hover:border-gray-700'}`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePlayAudioPreview(track);
                          }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition shrink-0 ${isCurrentPlaying ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30' : 'bg-[#2b2b36] group-hover:bg-[#343442] text-white'}`}
                        >
                          {isCurrentPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${isCurrentPlaying ? 'text-cyan-300' : 'text-white'}`}>{track.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] text-cyan-400 bg-cyan-950/50 px-1 rounded uppercase font-mono">{track.category}</span>
                            <span className="text-[9px] text-gray-400 font-mono">{track.durationFormatted}</span>
                          </div>
                        </div>
                        <button
                          id={`add-capcut-audio-${track.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            addCapCutAudio(track);
                          }}
                          className="p-1.5 rounded bg-[#2c2c38] hover:bg-cyan-500 hover:text-black text-gray-300 transition shrink-0"
                          title="Add to Timeline"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* CapCut Sticky Audio Bottom Preview Bar */}
                {previewAudioTrack && (
                  <div className="mt-auto p-2 bg-[#181820] border border-gray-800 rounded-lg shadow-lg flex items-center gap-2">
                    <button
                      onClick={() => togglePlayAudioPreview(previewAudioTrack)}
                      className="w-7 h-7 rounded-full bg-cyan-500 text-black flex items-center justify-center shrink-0"
                    >
                      {isPlayingAudioPreview ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-white truncate">{previewAudioTrack.name}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden flex items-center">
                          <div
                            className="h-full bg-cyan-400 rounded-full transition-all"
                            style={{ width: `${Math.min(100, (previewAudioCurrentTime / previewAudioTrack.duration) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-gray-400 font-mono">
                          {Math.floor(previewAudioCurrentTime)}s / {previewAudioTrack.durationFormatted}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => addCapCutAudio(previewAudioTrack)}
                      className="p-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-[10px] flex items-center gap-1 shadow"
                      title="Add to Timeline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                )}
              </>
            )}
            </div>
          </div>
        )}

        {activeTab === 'sfx' && (
          <div className="flex-1 h-full overflow-hidden">
            <SoundEffectsPanel onAddClip={onAddClip} showAddedToast={showAddedToast} />
          </div>
        )}

        {activeTab === 'text' && (
          <div className="flex flex-row h-full overflow-hidden">
            {/* CapCut Left Sidebar for Text Categories */}
            <div className="w-36 border-r border-[#23232b] bg-[#111116] p-2 flex flex-col gap-1 overflow-y-auto custom-scrollbar shrink-0">
              <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider px-2 py-1">Categories</span>
              {[
                { id: 'Templates', label: 'Templates', icon: '📝' },
                { id: 'Viral Reels', label: 'Viral Reels', icon: '🔥' },
                { id: 'Quranic Ayah', label: 'Quranic Ayah', icon: '🕋' },
                { id: 'WordArt', label: 'WordArt', icon: '✨' },
                { id: 'Basic', label: 'Basic Text', icon: '➕' },
              ].map((cat) => {
                const isSelected = textCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setTextCategory(cat.id)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition text-left ${isSelected ? (cat.id === 'Quranic Ayah' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : cat.id === 'Viral Reels' ? 'bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/40' : 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40') : 'text-gray-400 hover:text-white hover:bg-[#1a1a22]'}`}
                  >
                    <span className="text-sm shrink-0">{cat.icon}</span>
                    <span className="truncate text-[11px]">{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Text Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden p-3 space-y-3">
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-4 content-start">
              {textCategory === 'Viral Reels' && (
                <div className="space-y-2">
                  <p className="text-[10px] text-gray-400">High-retention captions styled for TikTok, Instagram Reels & YouTube Shorts:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { name: 'Yellow Pop on Black Box', text: 'VIRAL REELS CAPTION', color: '#facc15', bg: '#000000', font: 'Montserrat', glow: 0, gradient: false },
                      { name: 'Pure White Clean Bold', text: 'MODERN MINIMAL REEL', color: '#ffffff', bg: 'transparent', font: 'Inter', glow: 0, shadow: true },
                      { name: 'Neon Lime Highlight', text: 'HIGH RETENTION HOOK', color: '#a3e635', bg: '#09090b', font: 'Space Grotesk', glow: 15, gradient: false },
                      { name: 'Cyber Cyan Glow', text: 'DYNAMIC CAPTION TEXT', color: '#22d3ee', bg: 'transparent', font: 'Montserrat', glow: 22, gradient: false },
                    ].map((vr, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          onAddClip({
                            name: vr.name,
                            type: ClipType.TEXT,
                            text: vr.text,
                            fontSize: 44,
                            color: vr.color,
                            fontFamily: vr.font,
                            textX: 50,
                            textY: 75,
                            duration: 4,
                            sourceStart: 0,
                            sourceDuration: 4,
                            textLetterSpacing: 1,
                            textGlowIntensity: vr.glow,
                            text3DShadow: vr.shadow ? { enabled: true, blur: 14, offsetX: 4, offsetY: 4, color: 'rgba(0,0,0,0.95)' } : undefined,
                            playbackRate: 1.0,
                            volume: 1.0,
                          });
                          showAddedToast(vr.name);
                        }}
                        className="p-2.5 bg-[#1a1a24] hover:bg-[#232332] border border-gray-800 hover:border-yellow-500/50 rounded-xl cursor-pointer flex items-center justify-between transition group"
                      >
                        <div>
                          <p className="text-[10px] text-gray-400">{vr.name}</p>
                          <p className="text-xs font-bold mt-0.5 tracking-wider" style={{ color: vr.color, fontFamily: vr.font }}>
                            {vr.text}
                          </p>
                        </div>
                        <button className="p-1.5 rounded-lg bg-[#272733] group-hover:bg-yellow-500 group-hover:text-black transition">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {textCategory === 'Quranic Ayah' && (
                <div className="space-y-2">
                  <p className="text-[10px] text-amber-300/80">Imperial Arabic calligraphy & Quranic subtitle layouts:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { name: 'Royal Gold Uthmani', text: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', font: 'Amiri', gradient: 'royal-gold' },
                      { name: 'Emerald Sanctuary Calligraphy', text: 'إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا', font: 'Amiri', gradient: 'emerald-glow' },
                      { name: 'Moonlit White Ayah with 3D Shadow', text: 'فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ', font: 'Amiri', shadow: true },
                      { name: 'Urdu Nastaleeq Translation', text: 'اور بے شک مشکل کے ساتھ آسانی ہے', font: 'Noto Nastaliq Urdu', color: '#fef08a' },
                    ].map((qa, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          onAddClip({
                            name: qa.name,
                            type: ClipType.TEXT,
                            text: qa.text,
                            fontSize: 46,
                            color: qa.color || '#fef08a',
                            fontFamily: qa.font,
                            textX: 50,
                            textY: 50,
                            duration: 5,
                            sourceStart: 0,
                            sourceDuration: 5,
                            textGradient: qa.gradient ? { enabled: true, style: qa.gradient as any } : undefined,
                            text3DShadow: { enabled: true, blur: 16, offsetX: 4, offsetY: 4, color: 'rgba(0,0,0,0.95)' },
                            playbackRate: 1.0,
                            volume: 1.0,
                          });
                          showAddedToast(qa.name);
                        }}
                        className="p-3 bg-[#1c1c24] hover:bg-[#252532] border border-amber-900/30 hover:border-amber-400/60 rounded-xl cursor-pointer flex items-center justify-between transition group"
                      >
                        <div className="flex-1 pr-2">
                          <p className="text-[10px] text-amber-400 font-semibold">{qa.name}</p>
                          <p className="text-sm font-bold mt-1 text-amber-100 line-clamp-1" dir="rtl" style={{ fontFamily: qa.font }}>
                            {qa.text}
                          </p>
                        </div>
                        <button className="p-1.5 rounded-lg bg-[#272733] group-hover:bg-amber-400 group-hover:text-black transition">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {textCategory === 'Basic' && (
                <div className="bg-gradient-to-br from-[#1e2028] to-[#161820] border border-cyan-500/20 rounded-xl p-3.5 relative overflow-hidden shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-wide">ADD TEXT</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">Click + to insert default styled subtitle to track</p>
                    </div>
                    <button
                      id="btn-add-default-text"
                      onClick={addDefaultText}
                      className="w-8 h-8 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center transition shadow-lg shadow-cyan-500/30"
                      title="Add Default Text to Timeline"
                    >
                      <Plus className="w-4 h-4 font-bold" />
                    </button>
                  </div>
                  <div
                    onClick={addDefaultText}
                    className="mt-3 p-3 bg-black/40 rounded-lg border border-dashed border-gray-700 hover:border-cyan-500 cursor-pointer flex items-center justify-center transition"
                  >
                    <span className="text-sm font-semibold text-gray-200 tracking-wider">Default text</span>
                  </div>
                </div>
              )}

              {textCategory === 'WordArt' && (
                <div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Gold Luxury', color: '#fbbf24', font: 'Playfair Display' },
                      { name: 'Cyan Glow', color: '#22d3ee', font: 'Montserrat' },
                      { name: 'Neon Purple', color: '#c084fc', font: 'Space Grotesk' },
                      { name: 'Bold Minimal', color: '#ffffff', font: 'Inter' },
                    ].map((eff) => (
                      <div
                        key={eff.name}
                        onClick={() => {
                          onAddClip({
                            name: eff.name,
                            type: ClipType.TEXT,
                            text: eff.name,
                            fontSize: 48,
                            color: eff.color,
                            fontFamily: eff.font,
                            textX: 50,
                            textY: 50,
                            duration: 5,
                            sourceStart: 0,
                            sourceDuration: 5,
                            playbackRate: 1.0,
                            volume: 1.0,
                          });
                        }}
                        className="p-3 bg-[#1e1e26] hover:bg-[#262632] border border-gray-800 hover:border-cyan-500/40 rounded-lg cursor-pointer flex flex-col items-center justify-center text-center transition group"
                      >
                        <span className="text-sm font-bold truncate max-w-full" style={{ color: eff.color, fontFamily: eff.font }}>
                          {eff.name}
                        </span>
                        <span className="text-[9px] text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5 text-cyan-400">
                          <Plus className="w-2.5 h-2.5" /> Add
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {textCategory === 'Templates' && (
                <div className="grid grid-cols-1 gap-2">
                  {TEXT_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      id={`text-preset-${preset.id}`}
                      onClick={() => addPresetText(preset)}
                      className="bg-[#202026] hover:bg-[#282830] rounded-lg p-2.5 flex items-center justify-between border border-transparent hover:border-gray-700 transition cursor-pointer shadow-sm"
                    >
                      <div className="flex-1 pr-3">
                        <p className="text-[11px] font-medium text-gray-300">{preset.name}</p>
                        <p className="text-xs font-bold mt-0.5 tracking-wide truncate" style={{ color: preset.color }}>
                          {preset.text}
                        </p>
                      </div>
                      <button
                        id={`add-text-btn-${preset.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          addPresetText(preset);
                        }}
                        className="p-1.5 rounded-md bg-[#2d2d38] hover:bg-cyan-500 hover:text-black transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </div>
          </div>
        )}

        {activeTab === 'stickers' && (
          <div className="flex flex-row h-full overflow-hidden">
            {/* CapCut Left Sidebar for Sticker Categories */}
            <div className="w-36 border-r border-[#23232b] bg-[#111116] p-2 flex flex-col gap-1 overflow-y-auto custom-scrollbar shrink-0">
              <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider px-2 py-1">Categories</span>
              {[
                { id: 'islamic', label: 'Islamic', icon: '🕋' },
                { id: 'social', label: 'Social & Bell', icon: '🔔' },
                { id: 'trending', label: 'Trending', icon: '🔥' },
                { id: 'emoji', label: 'Emoji', icon: '😀' },
                { id: 'emphasis', label: 'Emphasis', icon: '⚡' },
                { id: 'arrows', label: 'Arrows', icon: '↗️' },
                { id: 'celebration', label: 'Celebration', icon: '🎉' },
              ].map((cat) => {
                const isSelected = stickerCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setStickerCategory(cat.id as any)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition text-left ${isSelected ? (cat.id === 'islamic' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40') : 'text-gray-400 hover:text-white hover:bg-[#1a1a22]'}`}
                  >
                    <span className="text-sm shrink-0">{cat.icon}</span>
                    <span className="truncate text-[11px]">{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Sticker Content Grid */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
              <div className="grid grid-cols-3 gap-2.5">
                {CAPCUT_STICKERS.filter(s => s.category === stickerCategory).map((st) => (
                  <div
                    key={st.id}
                    id={`sticker-${st.id}`}
                    onClick={() => addSticker(st)}
                    className="group bg-[#1e1e26] hover:bg-[#252532] border border-gray-800 hover:border-cyan-500/50 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition relative"
                  >
                    <span className="text-3xl filter drop-shadow-md group-hover:scale-110 transition-transform">{st.emoji}</span>
                    <span className="text-[9px] text-gray-400 mt-1.5 text-center truncate max-w-full">{st.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addSticker(st);
                      }}
                      className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-1 rounded-full bg-cyan-500 text-black transition"
                      title="Add to Timeline"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'effects' && (
          <div className="flex flex-row h-full overflow-hidden">
            {/* CapCut Left Sidebar for Effects Categories */}
            <div className="w-36 border-r border-[#23232b] bg-[#111116] p-2 flex flex-col gap-1 overflow-y-auto custom-scrollbar shrink-0">
              <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider px-2 py-1">Categories</span>
              {[
                { id: 'spiritual', label: 'Spiritual Noor', icon: '✨' },
                { id: 'particles', label: 'Particles', icon: '⭐' },
                { id: 'trending', label: 'Trending', icon: '🔥' },
                { id: 'opening', label: 'Opening', icon: '🎬' },
                { id: 'lens', label: 'Lens Flare', icon: '🔍' },
                { id: 'retro', label: 'Retro Film', icon: '🎞️' },
                { id: 'party', label: 'Party Glow', icon: '🪩' },
                { id: 'glitch', label: 'Glitch VFX', icon: '⚡' },
              ].map((cat) => {
                const isSelected = effectCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setEffectCategory(cat.id as any)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition text-left ${isSelected ? (cat.id === 'spiritual' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40') : 'text-gray-400 hover:text-white hover:bg-[#1a1a22]'}`}
                  >
                    <span className="text-sm shrink-0">{cat.icon}</span>
                    <span className="truncate text-[11px]">{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Effects Grid */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
              <div className="grid grid-cols-2 gap-2.5">
                {CAPCUT_EFFECTS.filter(e => e.category === effectCategory).map((eff) => (
                  <div
                    key={eff.id}
                    id={`effect-${eff.id}`}
                    onClick={() => addCapCutEffect(eff)}
                    className="group bg-[#1e1e26] hover:bg-[#252532] border border-gray-800 hover:border-cyan-500/50 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition relative h-26"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{eff.icon}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addCapCutEffect(eff);
                        }}
                        className="p-1 rounded bg-[#2c2c38] hover:bg-cyan-500 hover:text-black text-gray-300 transition"
                        title="Add Effect to Timeline"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white truncate">{eff.name}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5 line-clamp-1">{eff.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transitions' && (
          <div className="flex flex-row h-full overflow-hidden">
            {/* CapCut Left Sidebar for Transition Categories */}
            <div className="w-36 border-r border-[#23232b] bg-[#111116] p-2 flex flex-col gap-1 overflow-y-auto custom-scrollbar shrink-0">
              <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider px-2 py-1">Categories</span>
              {[
                { id: 'spiritual', label: 'Spiritual', icon: '🕊️' },
                { id: 'trending', label: 'Trending', icon: '🔥' },
                { id: 'basic', label: 'Basic', icon: '⚡' },
                { id: 'overlay', label: 'Overlay', icon: '🎞️' },
                { id: 'light', label: 'Light FX', icon: '💡' },
                { id: 'camera', label: 'Camera', icon: '📷' },
                { id: '3d', label: '3D Warp', icon: '🧊' },
              ].map((cat) => {
                const isSelected = transitionCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setTransitionCategory(cat.id as any)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition text-left ${isSelected ? (cat.id === 'spiritual' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40') : 'text-gray-400 hover:text-white hover:bg-[#1a1a22]'}`}
                  >
                    <span className="text-sm shrink-0">{cat.icon}</span>
                    <span className="truncate text-[11px]">{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Transitions Grid */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
              <div className="grid grid-cols-2 gap-2.5">
                {CAPCUT_TRANSITIONS.filter(t => t.category === transitionCategory).map((trans) => (
                  <div
                    key={trans.id}
                    id={`transition-${trans.id}`}
                    onClick={() => {
                      onAddClip({
                        name: `Transition: ${trans.name}`,
                        type: ClipType.VIDEO,
                        url: '',
                        duration: 1.5,
                        sourceStart: 0,
                        sourceDuration: 1.5,
                        blendMode: 'screen',
                        playbackRate: 1.0,
                        volume: 0,
                      });
                    }}
                    className="group bg-[#1e1e26] hover:bg-[#252532] border border-gray-800 hover:border-cyan-500/50 rounded-xl p-2.5 flex flex-col items-center justify-center cursor-pointer transition text-center relative"
                  >
                    <LiveAnimationPreview
                      type="transition"
                      id={trans.id}
                      name={trans.name}
                      icon={trans.icon}
                    />
                    <button
                      className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-1 rounded bg-cyan-500 text-black transition"
                      title="Add Transition"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'filters' && (
          <div className="flex flex-row h-full overflow-hidden">
            {/* CapCut Left Sidebar for Filters Categories */}
            <div className="w-36 border-r border-[#23232b] bg-[#111116] p-2 flex flex-col gap-1 overflow-y-auto custom-scrollbar shrink-0">
              <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider px-2 py-1">Categories</span>
              {[
                { id: 'islamic', label: 'Islamic', icon: '🕌' },
                { id: 'cinematic', label: 'Cinematic', icon: '🎬' },
                { id: 'featured', label: 'Featured', icon: '⭐' },
                { id: 'life', label: 'Life', icon: '🌿' },
                { id: 'scenery', label: 'Scenery', icon: '🏞️' },
                { id: 'movie', label: 'Movie', icon: '🎥' },
                { id: 'retro', label: 'Retro', icon: '📻' },
                { id: 'night', label: 'Night Scene', icon: '🌙' },
              ].map((cat) => {
                const isSelected = filterCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setFilterCategory(cat.id as any)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition text-left ${isSelected ? (cat.id === 'islamic' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40') : 'text-gray-400 hover:text-white hover:bg-[#1a1a22]'}`}
                  >
                    <span className="text-sm shrink-0">{cat.icon}</span>
                    <span className="truncate text-[11px]">{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Filters Grid */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
              <div className="grid grid-cols-2 gap-2.5">
                {CAPCUT_FILTERS.filter(f => f.category === filterCategory).map((filt) => (
                  <div
                    key={filt.id}
                    id={`filter-${filt.id}`}
                    onClick={() => addCapCutFilter(filt)}
                    className="group bg-[#1e1e26] hover:bg-[#252532] border border-gray-800 hover:border-cyan-500/50 rounded-xl p-2.5 flex items-center gap-2.5 cursor-pointer transition"
                  >
                    <div
                      className="w-9 h-9 rounded-lg shrink-0 shadow-inner flex items-center justify-center font-bold text-black text-xs"
                      style={{ backgroundColor: filt.previewColor }}
                    >
                      ✦
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{filt.name}</p>
                      <p className="text-[9px] text-gray-400 capitalize">{filt.category}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addCapCutFilter(filt);
                      }}
                      className="p-1 rounded bg-[#2c2c38] hover:bg-cyan-500 hover:text-black text-gray-300 transition shrink-0"
                      title="Apply Filter"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'adjustment' && (
          <div className="flex flex-row h-full overflow-hidden">
            {/* CapCut Left Sidebar for Adjustment Categories */}
            <div className="w-36 border-r border-[#23232b] bg-[#111116] p-2 flex flex-col gap-1 overflow-y-auto custom-scrollbar shrink-0">
              <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider px-2 py-1">Tools</span>
              {[
                { id: 'adjustment', label: 'Color Adjust', icon: '🎨' },
                { id: 'luts', label: 'LUTs & Profiles', icon: '🌈' },
                { id: 'auto', label: 'Auto Enhance', icon: '🪄' },
              ].map((sub, idx) => (
                <button
                  key={sub.id}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition text-left ${idx === 0 ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-xs' : 'text-gray-400 hover:text-white hover:bg-[#1a1a22]'}`}
                >
                  <span className="text-sm shrink-0">{sub.icon}</span>
                  <span className="truncate text-[11px]">{sub.label}</span>
                </button>
              ))}
            </div>

            {/* Right Adjustment Content */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-4">
              <div className="bg-gradient-to-br from-[#1e2028] to-[#161820] border border-cyan-500/20 rounded-xl p-3.5 relative overflow-hidden shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-wide">ADJUSTMENT LAYER</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Apply color grades and filters across multiple underlying tracks</p>
                  </div>
                  <button
                    onClick={addAdjustmentLayer}
                    className="w-8 h-8 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center transition shadow-lg shadow-cyan-500/30"
                    title="Add Adjustment Layer"
                  >
                    <Plus className="w-4 h-4 font-bold" />
                  </button>
                </div>
                <div
                  onClick={addAdjustmentLayer}
                  className="mt-3 p-3 bg-black/40 rounded-lg border border-dashed border-gray-700 hover:border-cyan-500 cursor-pointer flex items-center justify-center transition"
                >
                  <span className="text-sm font-semibold text-gray-200 tracking-wider">+ Add adjustment</span>
                </div>
              </div>

              {/* 1-Click Pro Color Profiles */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-300">PRESET COLOR GRADES</h4>
                  <span className="text-[10px] text-cyan-400">1-Click Layer</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Warm Haramain', color: '#d97706', b: 102, c: 115, s: 120, sepia: 25 },
                    { name: 'Deep Moody Blue', color: '#2563eb', b: 96, c: 125, s: 85, sepia: 0 },
                    { name: 'Cinematic Emerald', color: '#059669', b: 104, c: 118, s: 110, sepia: 10 },
                    { name: 'Vibrant Reel Pop', color: '#ec4899', b: 108, c: 112, s: 135, sepia: 0 },
                  ].map((preset, pIdx) => (
                    <div
                      key={pIdx}
                      onClick={() => {
                        onAddClip({
                          name: `Grade: ${preset.name}`,
                          type: ClipType.VIDEO,
                          url: '',
                          duration: 6,
                          sourceStart: 0,
                          sourceDuration: 6,
                          blendMode: 'soft-light',
                          filters: {
                            brightness: preset.b,
                            contrast: preset.c,
                            saturation: preset.s,
                            sepia: preset.sepia,
                            grayscale: 0,
                            invert: 0,
                            hueRotate: 0,
                            chromaKey: { enabled: false, color: '#00ff00', threshold: 30, smoothness: 10 }
                          },
                          playbackRate: 1.0,
                          volume: 0,
                        });
                        showAddedToast(preset.name);
                      }}
                      className="p-2.5 bg-[#1e1e26] hover:bg-[#252532] border border-gray-800 hover:border-cyan-500/50 rounded-xl cursor-pointer flex items-center justify-between transition group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.color }} />
                        <span className="text-xs font-semibold text-gray-200">{preset.name}</span>
                      </div>
                      <Plus className="w-3 h-3 text-gray-400 group-hover:text-cyan-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'image' && (
          <div className="flex flex-row h-full overflow-hidden">
            {/* CapCut Left Sidebar for Image Categories */}
            <div className="w-36 border-r border-[#23232b] bg-[#111116] p-2 flex flex-col gap-1 overflow-y-auto custom-scrollbar shrink-0">
              <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider px-2 py-1">Categories</span>
              {[
                { id: 'All', label: 'All Photos', icon: '🖼️' },
                { id: 'Islamic', label: 'Islamic', icon: '🕌' },
                { id: 'Nature', label: 'Nature', icon: '🌿' },
                { id: 'Background', label: 'Background', icon: '🌄' },
                { id: 'Space', label: 'Space & Cosmos', icon: '🌌' },
                { id: 'Abstract', label: 'Abstract & 3D', icon: '🎨' },
              ].map((cat) => {
                const isSelected = imageCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setImageCategory(cat.id)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition text-left ${isSelected ? (cat.id === 'Islamic' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40') : 'text-gray-400 hover:text-white hover:bg-[#1a1a22]'}`}
                  >
                    <span className="text-sm shrink-0">{cat.icon}</span>
                    <span className="truncate text-[11px]">{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Images Grid */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-3">
              {/* Veo AI Image Animation Banner */}
              {onOpenVeoAnimateModal && (
                <div
                  onClick={onOpenVeoAnimateModal}
                  className="bg-gradient-to-r from-cyan-950/60 via-[#132034] to-blue-950/60 border border-cyan-500/40 hover:border-cyan-400 rounded-xl p-3 flex items-center justify-between cursor-pointer transition shadow-lg group hover:shadow-cyan-950/40"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition">
                      <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">Animate Photo to Video</span>
                        <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-mono font-bold border border-cyan-500/40">
                          VEO 3.1 AI
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400">
                        Turn any still image into a cinematic 16:9 or 9:16 video clip
                      </p>
                    </div>
                  </div>
                  <button className="px-2.5 py-1 rounded-lg bg-cyan-500 text-black font-bold text-[10px] group-hover:bg-cyan-400 transition shadow">
                    Animate Now
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                {STOCK_IMAGES.filter(img => imageCategory === 'All' || img.category === imageCategory).map((img) => (
                  <div
                    key={img.id}
                    id={`stock-img-${img.id}`}
                    onClick={() => addPresetImage(img)}
                    className="group bg-[#1e1e26] hover:bg-[#252532] border border-gray-800 hover:border-cyan-500/50 rounded-xl p-2 flex flex-col cursor-pointer transition relative shadow-sm h-28"
                  >
                    <div className="w-full h-14 bg-slate-800 rounded-lg flex items-center justify-center text-2xl relative overflow-hidden shrink-0 mb-1.5 border border-white/5">
                      {img.url ? (
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        img.thumbnail
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <Plus className="w-4 h-4 text-white animate-pulse" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <p className="text-[10px] font-semibold text-white line-clamp-1">{img.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[8px] text-cyan-400 uppercase font-mono bg-cyan-950/40 px-1 rounded truncate">{img.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        

        {activeTab === 'upload' && (
          <div className="flex flex-row h-full overflow-hidden">
            {/* CapCut Left Sidebar for Upload Categories */}
            <div className="w-36 border-r border-[#23232b] bg-[#111116] p-2 flex flex-col gap-1 overflow-y-auto custom-scrollbar shrink-0">
              <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider px-2 py-1">Import</span>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition text-left bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-sm"
              >
                <Upload className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate text-[11px]">Import File</span>
              </button>

              <div className="w-full h-px bg-gray-800 my-1.5" />
              <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider px-2 py-0.5">Media Library</span>

              {[
                { id: 'all', label: 'All Files', icon: '📁', count: customAssets.length },
                { id: 'video', label: 'Videos', icon: '🎬', count: customAssets.filter(a => a.type === 'video').length },
                { id: 'audio', label: 'Audios', icon: '🎵', count: customAssets.filter(a => a.type === 'audio').length },
                { id: 'image', label: 'Images', icon: '🖼️', count: customAssets.filter(a => a.isImage).length },
              ].map((sub) => {
                const isSelected = uploadCategory === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setUploadCategory(sub.id as any)}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition text-left ${isSelected ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-xs' : 'text-gray-400 hover:text-white hover:bg-[#1a1a22]'}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm shrink-0">{sub.icon}</span>
                      <span className="truncate text-[11px]">{sub.label}</span>
                    </div>
                    {sub.count > 0 && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-black/40 text-gray-400 font-mono">
                        {sub.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Upload Content */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-3">
              <div
                id="drop-zone"
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[120px] ${dragActive ? 'border-cyan-400 bg-cyan-950/20' : 'border-gray-700 hover:border-gray-500 bg-[#202026]/40'}`}
              >
                <Upload className={`w-7 h-7 mb-2 transition ${dragActive ? 'text-cyan-400 animate-bounce' : 'text-gray-500'}`} />
                <p className="text-xs font-medium text-gray-300">Drag & drop files here</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Supports MP4, MP3, MOV, PNG, JPG, JFIF, WEBP (Max 50MB)</p>
                <button
                  id="browse-btn"
                  className="mt-2 text-[10px] bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-1 px-3 rounded-full transition"
                >
                  Browse Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="video/*,audio/*,image/*,.jfif,.jpg,.jpeg,.png,.webp,.gif,.bmp,.svg,.avif,.mp4,.webm,.mov,.m4v,.mp3,.wav,.ogg,.m4a"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>

            {/* Custom Assets List */}
            {customAssets.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
                      {uploadCategory === 'all' ? 'All Imports' : uploadCategory === 'video' ? 'Imported Videos' : uploadCategory === 'audio' ? 'Imported Audios' : 'Imported Images'}
                    </h4>
                    <span className="text-[10px] bg-cyan-950/80 text-cyan-400 font-mono px-1.5 py-0.2 rounded-full border border-cyan-800/40">
                      {customAssets.filter(a => uploadCategory === 'all' ? true : uploadCategory === 'video' ? (a.type === 'video' && !a.isImage) : uploadCategory === 'audio' ? a.type === 'audio' : !!a.isImage).length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-[#14141a] p-0.5 rounded-md border border-white/5">
                    <button
                      type="button"
                      onClick={() => setImportsViewMode('list')}
                      className={`p-1 rounded text-xs transition ${importsViewMode === 'list' ? 'bg-[#2a2a38] text-cyan-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                      title="List View"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setImportsViewMode('grid')}
                      className={`p-1 rounded text-xs transition ${importsViewMode === 'grid' ? 'bg-[#2a2a38] text-cyan-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                      title="Grid View"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {importsViewMode === 'list' ? (
                  <div className="space-y-2">
                    {customAssets
                      .filter(a => uploadCategory === 'all' ? true : uploadCategory === 'video' ? (a.type === 'video' && !a.isImage) : uploadCategory === 'audio' ? a.type === 'audio' : !!a.isImage)
                      .map((asset) => (
                      <div
                        key={asset.id}
                        onClick={() => {
                          const computedType = asset.isImage ? ClipType.IMAGE : (asset.type === 'video' ? ClipType.VIDEO : ClipType.AUDIO);
                          showAddedToast(asset.name);
                          onAddClip({
                            name: asset.name,
                            type: computedType,
                            url: asset.url,
                            duration: asset.duration,
                            sourceStart: 0,
                            sourceDuration: asset.duration,
                            playbackRate: 1.0,
                            volume: 1.0,
                            isImage: asset.isImage,
                            filters: asset.type === 'video' ? {
                              brightness: 100,
                              contrast: 100,
                              saturation: 100,
                              grayscale: 0,
                              sepia: 0,
                              invert: 0,
                              hueRotate: 0,
                              chromaKey: {
                                enabled: false,
                                color: '#00ff00',
                                threshold: 30,
                                smoothness: 10
                              }
                            } : undefined
                          });
                        }}
                        className="group bg-[#1b1b22] hover:bg-[#23232c] rounded-lg p-2 flex items-center gap-3 border border-gray-800 hover:border-cyan-500/40 transition shadow-sm cursor-pointer"
                      >
                        {/* Thumbnail container */}
                        <div className="w-12 h-12 bg-[#101016] rounded-md overflow-hidden flex items-center justify-center shrink-0 border border-white/10 relative shadow-inner">
                          {asset.thumbnailUrl ? (
                            <img
                              src={asset.thumbnailUrl}
                              alt={asset.name}
                              className="w-full h-full object-cover rounded-md"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="text-xl">
                              {asset.type === 'audio' ? '🎵' : asset.isImage ? '🖼️' : '🎬'}
                            </div>
                          )}

                          {/* Media Type Icon Badge */}
                          {asset.type === 'video' && !asset.isImage && (
                            <div className="absolute bottom-0.5 right-0.5 bg-black/80 rounded px-1 text-[8px] font-mono text-cyan-400 flex items-center gap-0.5 backdrop-blur-xs">
                              <Film className="w-2.5 h-2.5" />
                            </div>
                          )}
                          {asset.isImage && (
                            <div className="absolute bottom-0.5 right-0.5 bg-black/80 rounded px-1 text-[8px] font-mono text-amber-400 flex items-center gap-0.5 backdrop-blur-xs">
                              <ImageIcon className="w-2.5 h-2.5" />
                            </div>
                          )}
                          {asset.type === 'audio' && (
                            <div className="absolute bottom-0.5 right-0.5 bg-black/80 rounded px-1 text-[8px] font-mono text-emerald-400 flex items-center gap-0.5 backdrop-blur-xs">
                              <Volume2 className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white truncate" title={asset.name}>{asset.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1 font-mono">
                            <span className="bg-gray-800/80 px-1.5 py-0.5 rounded text-gray-300">{asset.size}</span>
                            <span>•</span>
                            <span className="text-cyan-400">{asset.duration}s</span>
                            {asset.isImage && (
                              <span className="text-amber-400 bg-amber-950/40 px-1 py-0.5 rounded text-[9px]">IMG</span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const computedType = asset.isImage ? ClipType.IMAGE : (asset.type === 'video' ? ClipType.VIDEO : ClipType.AUDIO);
                              showAddedToast(asset.name);
                              onAddClip({
                                name: asset.name,
                                type: computedType,
                                url: asset.url,
                                duration: asset.duration,
                                sourceStart: 0,
                                sourceDuration: asset.duration,
                                playbackRate: 1.0,
                                volume: 1.0,
                                isImage: asset.isImage,
                                filters: asset.type === 'video' ? {
                                  brightness: 100,
                                  contrast: 100,
                                  saturation: 100,
                                  grayscale: 0,
                                  sepia: 0,
                                  invert: 0,
                                  hueRotate: 0,
                                  chromaKey: {
                                    enabled: false,
                                    color: '#00ff00',
                                    threshold: 30,
                                    smoothness: 10
                                  }
                                } : undefined
                              });
                            }}
                            className="p-1.5 rounded-md bg-[#2d2d38] hover:bg-cyan-500 hover:text-black transition text-gray-200 flex items-center gap-1 text-xs font-medium"
                            title="Add to Timeline"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => deleteCustomAsset(asset.id, e)}
                            className="p-1.5 rounded-md bg-[#2d2d38] hover:bg-red-500/20 hover:text-red-400 transition text-gray-400"
                            title="Remove file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Grid View */
                  <div className="grid grid-cols-2 gap-2.5">
                    {customAssets
                      .filter(a => uploadCategory === 'all' ? true : uploadCategory === 'video' ? (a.type === 'video' && !a.isImage) : uploadCategory === 'audio' ? a.type === 'audio' : !!a.isImage)
                      .map((asset) => (
                      <div
                        key={asset.id}
                        onClick={() => {
                          const computedType = asset.isImage ? ClipType.IMAGE : (asset.type === 'video' ? ClipType.VIDEO : ClipType.AUDIO);
                          showAddedToast(asset.name);
                          onAddClip({
                            name: asset.name,
                            type: computedType,
                            url: asset.url,
                            duration: asset.duration,
                            sourceStart: 0,
                            sourceDuration: asset.duration,
                            playbackRate: 1.0,
                            volume: 1.0,
                            isImage: asset.isImage,
                            filters: asset.type === 'video' ? {
                              brightness: 100,
                              contrast: 100,
                              saturation: 100,
                              grayscale: 0,
                              sepia: 0,
                              invert: 0,
                              hueRotate: 0,
                              chromaKey: {
                                enabled: false,
                                color: '#00ff00',
                                threshold: 30,
                                smoothness: 10
                              }
                            } : undefined
                          });
                        }}
                        className="group bg-[#1b1b22] hover:bg-[#23232c] rounded-lg overflow-hidden border border-gray-800 hover:border-cyan-500/40 transition flex flex-col relative shadow-sm cursor-pointer"
                      >
                        <div className="aspect-video w-full bg-[#101016] relative overflow-hidden flex items-center justify-center">
                          {asset.thumbnailUrl ? (
                            <img
                              src={asset.thumbnailUrl}
                              alt={asset.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="text-2xl">
                              {asset.type === 'audio' ? '🎵' : asset.isImage ? '🖼️' : '🎬'}
                            </div>
                          )}

                          {/* Top duration & format badge */}
                          <div className="absolute top-1 right-1 bg-black/80 rounded px-1.5 py-0.5 text-[9px] font-mono text-cyan-300 flex items-center gap-1 backdrop-blur-xs">
                            {asset.isImage ? <ImageIcon className="w-2.5 h-2.5 text-amber-400" /> : asset.type === 'video' ? <Film className="w-2.5 h-2.5 text-cyan-400" /> : <Volume2 className="w-2.5 h-2.5 text-emerald-400" />}
                            <span>{asset.duration}s</span>
                          </div>

                          {/* Quick Add Overlay on Hover */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const computedType = asset.isImage ? ClipType.IMAGE : (asset.type === 'video' ? ClipType.VIDEO : ClipType.AUDIO);
                                showAddedToast(asset.name);
                                onAddClip({
                                  name: asset.name,
                                  type: computedType,
                                  url: asset.url,
                                  duration: asset.duration,
                                  sourceStart: 0,
                                  sourceDuration: asset.duration,
                                  playbackRate: 1.0,
                                  volume: 1.0,
                                  isImage: asset.isImage,
                                  filters: asset.type === 'video' ? {
                                    brightness: 100,
                                    contrast: 100,
                                    saturation: 100,
                                    grayscale: 0,
                                    sepia: 0,
                                    invert: 0,
                                    hueRotate: 0,
                                    chromaKey: {
                                      enabled: false,
                                      color: '#00ff00',
                                      threshold: 30,
                                      smoothness: 10
                                    }
                                  } : undefined
                                });
                              }}
                              className="p-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg transition transform hover:scale-110"
                              title="Add to Timeline"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => deleteCustomAsset(asset.id, e)}
                              className="p-2 rounded-full bg-black/70 hover:bg-red-500 text-white shadow-lg transition transform hover:scale-110"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title & Size in Grid */}
                        <div className="p-2">
                          <p className="text-[11px] font-semibold text-white truncate" title={asset.name}>{asset.name}</p>
                          <p className="text-[9px] text-gray-400 font-mono mt-0.5">{asset.size}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        )}

        {activeTab === 'quran-visuals' && (
          <QuranVisualsPanel
            tracks={tracks}
            onAddClip={onAddClip}
            onReplaceVideoTrackClips={onReplaceVideoTrackClips}
            onUpdateClip={onUpdateClip}
            quranTranslation={quranTranslation}
            currentTime={currentTime}
          />
        )}

        {activeTab === 'quran' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-amber-500/10 to-yellow-600/10 border border-amber-500/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-amber-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>QURAN ALIGNMENT SUITE V4</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  1-Click AI
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Automated AI Quran alignment engine. Analyzes audio frequencies, fetches Uthmani scripture & translation from Quran.com, and generates multi-track synchronized captions.
              </p>
            </div>

            {aligningStatus?.status === 'running' ? (
              <div className="bg-[#15151a] border border-amber-500/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2.5 text-amber-400 font-bold text-xs">
                  <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-amber-400" />
                  <span>⚡ AI is analyzing voice frequencies and fetching Surah verses... Please wait.</span>
                </div>
                <div className="w-full bg-[#202026] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 h-full transition-all duration-300 animate-pulse"
                    style={{ width: `${Math.max(10, aligningStatus.progress || 20)}%` }}
                  />
                </div>
                <div className="bg-black/80 rounded-lg p-2.5 text-[10px] font-mono text-amber-300/90 h-24 overflow-y-auto space-y-1 border border-amber-500/20 custom-scrollbar">
                  {aligningStatus.log.map((logMsg, idx) => (
                    <div key={idx} className="leading-snug">
                      {logMsg}
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                </div>
              </div>
            ) : (
              <div className="bg-[#15151a] border border-gray-800 rounded-xl p-4 space-y-4">
                {/* BLOCK 1: SELECT SURAH / CHAPTER (Custom Interactive Dropdown to bypass Linux/Snap select popup bug) */}
                <div className="space-y-1.5 relative">
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wide flex items-center justify-between">
                    <span>SELECT SURAH / CHAPTER</span>
                    <span className="text-[10px] text-amber-400 font-mono">114 Chapters</span>
                  </label>

                  {(() => {
                    const currentSurahId = quranSurahPreset === 'custom' ? quranSurahCustom : parseInt(quranSurahPreset, 10) || 67;
                    const selectedSurah = SURAHS.find((s) => s.id === currentSurahId) || SURAHS[66];
                    const filteredSurahs = SURAHS.filter((s) => 
                      s.name.toLowerCase().includes(surahSearchText.toLowerCase()) || 
                      String(s.id).includes(surahSearchText.trim())
                    );

                    return (
                      <div className="relative">
                        {/* Custom Dropdown Trigger Button */}
                        <button
                          type="button"
                          id="select-surah-chapter"
                          onClick={() => setSurahDropdownOpen(!surahDropdownOpen)}
                          className="w-full bg-[#0a0a0d] border border-gray-800 hover:border-amber-500/70 focus:border-amber-500 rounded-lg p-2.5 text-xs text-white font-medium focus:outline-none transition cursor-pointer flex items-center justify-between text-left shadow-inner"
                        >
                          <span className="truncate pr-2 font-semibold text-amber-300">
                            {selectedSurah.name}
                          </span>
                          <svg
                            className={`w-4 h-4 text-amber-400 transition-transform duration-200 flex-shrink-0 ${
                              surahDropdownOpen ? 'rotate-180 text-amber-300' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Interactive Dropdown Popover */}
                        {surahDropdownOpen && (
                          <>
                            {/* Backdrop overlay to close when clicking anywhere outside */}
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => {
                                setSurahDropdownOpen(false);
                                setSurahSearchText('');
                              }}
                            />

                            <div className="absolute left-0 right-0 top-full mt-1 bg-[#121218] border border-amber-500/40 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-72 backdrop-blur-md">
                              {/* Search Bar inside Dropdown */}
                              <div className="p-2 border-b border-gray-800 bg-[#0d0d12]">
                                <div className="relative">
                                  <input
                                    type="text"
                                    autoFocus
                                    placeholder="🔍 Search Surah (e.g. Yasin, Mulk, 36)..."
                                    value={surahSearchText}
                                    onChange={(e) => setSurahSearchText(e.target.value)}
                                    className="w-full bg-[#181822] border border-gray-700 focus:border-amber-500 text-xs text-white rounded-lg px-3 py-1.5 outline-none placeholder-gray-500 transition"
                                  />
                                  {surahSearchText && (
                                    <button
                                      type="button"
                                      onClick={() => setSurahSearchText('')}
                                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Surah List Items */}
                              <div className="overflow-y-auto divide-y divide-gray-800/50 flex-1 custom-scrollbar">
                                {filteredSurahs.length > 0 ? (
                                  filteredSurahs.map((s) => {
                                    const isSelected = s.id === currentSurahId;
                                    return (
                                      <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => {
                                          setQuranSurahPreset(String(s.id));
                                          setQuranSurahCustom(s.id);
                                          setSurahDropdownOpen(false);
                                          setSurahSearchText('');
                                        }}
                                        className={`w-full text-left px-3.5 py-2 text-xs transition flex items-center justify-between cursor-pointer ${
                                          isSelected
                                            ? 'bg-amber-500/20 text-amber-300 font-bold border-l-4 border-amber-400'
                                            : 'text-gray-300 hover:bg-gray-800/80 hover:text-white'
                                        }`}
                                      >
                                        <span className="truncate">{s.name}</span>
                                        {isSelected && (
                                          <span className="text-amber-400 text-xs font-mono ml-2">✓ Selected</span>
                                        )}
                                      </button>
                                    );
                                  })
                                ) : (
                                  <div className="p-4 text-center text-xs text-gray-500">
                                    No Surah found matching &quot;{surahSearchText}&quot;
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* BLOCK 2: ALIGNMENT SCOPE */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wide flex items-center justify-between">
                    <span>ALIGNMENT SCOPE</span>
                    <span className="text-[10px] text-amber-400 font-medium">
                      {quranSelectionType === 'all'
                        ? '✨ Single Whole Surah'
                        : quranSelectionType === 'list'
                        ? `🕌 Multi-Surahs (${quranSurahList})`
                        : quranSelectionType === 'mixed'
                        ? `📚 Mixed/Collection (${quranSurahList})`
                        : `Ayah #${quranStartAyah}`}
                    </span>
                  </label>
                  <div className="grid grid-cols-4 gap-1 p-1 bg-[#0a0a0d] border border-gray-800 rounded-lg">
                    <button
                      type="button"
                      id="scope-all"
                      onClick={() => setQuranSelectionType('all')}
                      className={`py-2 px-1 text-[11px] font-bold rounded-md transition flex items-center justify-center gap-0.5 cursor-pointer border ${
                        quranSelectionType === 'all'
                          ? 'bg-black text-white border-white shadow-md font-extrabold'
                          : 'bg-[#15151e] border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }`}
                    >
                      <span>Whole</span>
                    </button>
                    <button
                      type="button"
                      id="scope-list"
                      onClick={() => setQuranSelectionType('list')}
                      className={`py-2 px-1 text-[11px] font-bold rounded-md transition flex items-center justify-center gap-0.5 cursor-pointer border ${
                        quranSelectionType === 'list'
                          ? 'bg-black text-white border-white shadow-md font-extrabold'
                          : 'bg-[#15151e] border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }`}
                      title="Multi-Surahs in one audio with automatic opening rules"
                    >
                      <span>Multi</span>
                    </button>
                    <button
                      type="button"
                      id="scope-mixed"
                      onClick={() => {
                        setQuranSelectionType('mixed');
                        setQuranSurahList('manzil'); // default to Manzil Preset
                      }}
                      className={`py-2 px-1 text-[11px] font-bold rounded-md transition flex items-center justify-center gap-0.5 cursor-pointer border ${
                        quranSelectionType === 'mixed'
                          ? 'bg-black text-white border-white shadow-md font-extrabold'
                          : 'bg-[#15151e] border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }`}
                      title="Mixed Ayah / Surah / Custom Collections (e.g. Manzil, 40 Rabbana)"
                    >
                      <Blend className="w-3 h-3 text-amber-400" />
                      <span>Mixed</span>
                    </button>
                    <button
                      type="button"
                      id="scope-single"
                      onClick={() => setQuranSelectionType('single')}
                      className={`py-2 px-1 text-[11px] font-bold rounded-md transition flex items-center justify-center gap-0.5 cursor-pointer border ${
                        quranSelectionType === 'single'
                          ? 'bg-black text-white border-white shadow-md font-extrabold'
                          : 'bg-[#15151e] border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }`}
                    >
                      <span>Ayah</span>
                    </button>
                  </div>

                  {quranSelectionType === 'list' && (
                    <div className="space-y-1.5 pt-1.5 p-2.5 bg-amber-500/5 border border-amber-500/30 rounded-lg">
                      <div className="flex items-center justify-between text-xs">
                        <label className="text-[11px] font-bold text-amber-300">Surah Numbers (comma-separated):</label>
                        <span className="text-[9px] text-amber-400/80 font-mono">e.g. 112, 113, 114</span>
                      </div>
                      <input
                        type="text"
                        id="input-multi-surah-list"
                        value={quranSurahList}
                        onChange={(e) => setQuranSurahList(e.target.value)}
                        placeholder="112, 113, 114 (Ikhlas, Falaq, Nas)"
                        className="w-full bg-[#0a0a0d] border border-amber-500/40 focus:border-amber-400 rounded-md px-2.5 py-1.5 text-xs text-amber-200 font-mono focus:outline-none"
                      />
                      <div className="flex flex-wrap gap-1 pt-1">
                        <span className="text-[10px] text-gray-400">Quick sets:</span>
                        {[
                          { label: '4 Quls (109-114)', val: '109, 112, 113, 114' },
                          { label: '3 Quls (112-114)', val: '112, 113, 114' },
                          { label: 'Falaq & Nas', val: '113, 114' },
                          { label: 'Juz 30 (Last 5)', val: '110, 111, 112, 113, 114' },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setQuranSurahList(preset.val)}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/20 text-amber-300 font-mono transition cursor-pointer"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
 
                  {quranSelectionType === 'mixed' && (
                    <div className="space-y-2 pt-1.5 p-2.5 bg-amber-500/5 border border-amber-500/30 rounded-lg">
                      <div className="flex items-center justify-between text-xs">
                        <label className="text-[11px] font-bold text-amber-300">SELECT PRESET COLLECTION:</label>
                        <span className="text-[9px] text-amber-400/80 font-mono">Auto-Segments</span>
                      </div>
                      
                      <select
                        id="select-mixed-collection"
                        value={FAMOUS_MIX_COLLECTIONS.some(c => c.id === quranSurahList) ? quranSurahList : 'custom'}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val !== 'custom') {
                            setQuranSurahList(val);
                          }
                        }}
                        className="w-full bg-[#0a0a0d] border border-gray-800 focus:border-amber-500 rounded-md p-2 text-xs text-white focus:outline-none transition cursor-pointer font-medium"
                      >
                        <option value="custom">-- Custom Reference String --</option>
                        {FAMOUS_MIX_COLLECTIONS.map((col) => (
                          <option key={col.id} value={col.id}>
                            {col.nameEnglish} ({col.id})
                          </option>
                        ))}
                      </select>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-gray-400 uppercase tracking-wider">OR CUSTOM RANGE/LIST STRING:</span>
                          <span className="text-amber-400 font-mono">e.g., 1:1-5, 2:255, 36:1-10</span>
                        </div>
                        <input
                          type="text"
                          id="input-mixed-verses-list"
                          value={quranSurahList}
                          onChange={(e) => setQuranSurahList(e.target.value)}
                          placeholder="e.g. 1:1-7, 2:255, 112:1-4, 113:1-5, 114:1-6"
                          className="w-full bg-[#0a0a0d] border border-gray-800 focus:border-amber-500 rounded-md px-2.5 py-1.5 text-xs text-amber-200 font-mono focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {quranSelectionType === 'single' && (
                    <div className="flex items-center gap-2 pt-1">
                      <label className="text-xs text-gray-400 whitespace-nowrap">Ayah Number:</label>
                      <input
                        type="number"
                        id="input-single-ayah"
                        min="1"
                        max="286"
                        value={quranStartAyah}
                        onChange={(e) => setQuranStartAyah(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 bg-[#0a0a0d] border border-gray-800 focus:border-amber-500 rounded-md px-2 py-1 text-xs text-white font-mono text-center focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* BLOCK 2.5: 🌐 MULTI-TRANSLATION LANGUAGE & TRANSLATOR SUITE */}
                <div className="bg-[#101016] border border-cyan-500/30 rounded-xl p-3.5 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between pb-1 border-b border-gray-800/80">
                    <label className="text-xs font-extrabold text-cyan-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Languages className="w-3.5 h-3.5 text-cyan-400" />
                      <span>TRANSLATION LANGUAGE & TRANSLATOR</span>
                    </label>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-bold border border-cyan-500/20 flex items-center gap-1">
                      <span>{currentTranslation.flag}</span>
                      <span>{currentTranslation.language.split(' ')[0]}</span>
                    </span>
                  </div>

                  {/* Toast notification when translation applied */}
                  {translationToast && (
                    <div className="p-2 bg-teal-500/20 border border-teal-500/40 rounded-lg text-[11px] font-bold text-teal-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span>{translationToast}</span>
                    </div>
                  )}

                  {/* 1. Quick Language Selection Grid */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">SELECT LANGUAGE:</span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                      {[
                        { code: 'ur', id: 'ur-jalandhry', label: 'Urdu', flag: '🇵🇰' },
                        { code: 'hi', id: 'hi-suhel', label: 'Hindi', flag: '🇮🇳' },
                        { code: 'en', id: 'en-sahih', label: 'English', flag: '🇬🇧' },
                        { code: 'id', id: 'id-kemenag', label: 'Indonesian', flag: '🇮🇩' },
                        { code: 'tr', id: 'tr-diyanet', label: 'Turkish', flag: '🇹🇷' },
                        { code: 'fr', id: 'fr-hamidullah', label: 'French', flag: '🇫🇷' },
                        { code: 'bn', id: 'bn-muhiuddin', label: 'Bengali', flag: '🇧🇩' },
                        { code: 'fa', id: 'fa-kaldari', label: 'Persian', flag: '🇮🇷' },
                        { code: 'es', id: 'es-garcia', label: 'Spanish', flag: '🇪🇸' },
                        { code: 'de', id: 'de-bubenheim', label: 'German', flag: '🇩🇪' },
                        { code: 'ru', id: 'ru-kuliev', label: 'Russian', flag: '🇷🇺' },
                        { code: 'none', id: 'none', label: 'Arabic Only', flag: '🕌' },
                      ].map((lang) => {
                        const isSelected = currentTranslation.languageCode === lang.code;
                        return (
                          <button
                            key={lang.id}
                            type="button"
                            id={`btn-lang-${lang.code}`}
                            onClick={() => handleSelectTranslation(lang.id)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition border cursor-pointer ${
                              isSelected
                                ? 'bg-black text-white border-white font-extrabold shadow-md'
                                : 'bg-[#15151e] border-gray-800 text-gray-300 hover:text-white hover:bg-gray-800/80 hover:border-gray-700'
                            }`}
                          >
                            <span>{lang.flag}</span>
                            <span className="text-[11px] truncate">{lang.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Specific Translator Dropdown Selector */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ALL TRANSLATORS & AUTHORS:</span>
                      <span className="text-[10px] text-cyan-400 font-mono font-bold">{currentTranslation.direction === 'rtl' ? 'RTL Script' : 'LTR Script'}</span>
                    </div>
                    <select
                      id="select-quran-translation-option"
                      value={quranTranslation}
                      onChange={(e) => handleSelectTranslation(e.target.value)}
                      className="w-full bg-[#0a0a0d] border border-cyan-500/40 focus:border-cyan-400 rounded-lg p-2.5 text-xs text-cyan-300 font-semibold focus:outline-none transition cursor-pointer"
                    >
                      <optgroup label="🇵🇰 Urdu Translations (اردو تراجم)">
                        <option value="ur-jalandhry">🇵🇰 Fateh Muhammad Jalandhry (فتح محمد جالندھری)</option>
                        <option value="ur-tahir">🇵🇰 Dr. Tahir-ul-Qadri - Irfan-ul-Quran (طاہر القادری)</option>
                        <option value="ur-raza">🇵🇰 Ahmed Raza Khan - Kanzul Iman (احمد رضا خان)</option>
                        <option value="ur-maududi">🇵🇰 Abul A'la Maududi - Tafhim al-Qur'an (مودودی)</option>
                      </optgroup>
                      <optgroup label="🇮🇳 Hindi Translations (हिन्दी अनुवाद)">
                        <option value="hi-suhel">🇮🇳 Suhel Farooq Khan & Saifur Rahman (सुहेल फ़ारूक़ ख़ान)</option>
                        <option value="hi-farooq">🇮🇳 Muhammad Farooq Khan (मुहम्मद फ़ारूक़ ख़ान)</option>
                      </optgroup>
                      <optgroup label="🇬🇧 English Translations">
                        <option value="en-sahih">🇬🇧 Sahih International</option>
                        <option value="en-khattab">🇬🇧 Dr. Mustafa Khattab (The Clear Quran)</option>
                        <option value="en-hilali">🇬🇧 Muhsin Khan & Taqi-ud-Din al-Hilali</option>
                        <option value="en-yusufali">🇬🇧 Abdullah Yusuf Ali</option>
                      </optgroup>
                      <optgroup label="🇮🇩 Indonesian (Bahasa)">
                        <option value="id-kemenag">🇮🇩 Kementerian Agama RI (Kemenag)</option>
                      </optgroup>
                      <optgroup label="🇹🇷 Turkish (Türkçe)">
                        <option value="tr-diyanet">🇹🇷 Diyanet İşleri Başkanlığı</option>
                        <option value="tr-yazir">🇹🇷 Elmalılı Hamdi Yazır</option>
                      </optgroup>
                      <optgroup label="🇫🇷 French (Français)">
                        <option value="fr-hamidullah">🇫🇷 Muhammad Hamidullah</option>
                      </optgroup>
                      <optgroup label="🇧🇩 Bengali (বাংলা)">
                        <option value="bn-muhiuddin">🇧🇩 Muhiuddin Khan (মুহিউদ্দীন খান)</option>
                        <option value="bn-taisirul">🇧🇩 Taisirul Quran (তাইসিরুল কুরআন)</option>
                      </optgroup>
                      <optgroup label="🇪🇸 Spanish (Español)">
                        <option value="es-garcia">🇪🇸 Muhammad Isa García</option>
                      </optgroup>
                      <optgroup label="🇩🇪 German (Deutsch)">
                        <option value="de-bubenheim">🇩🇪 Frank Bubenheim & Nadeem Elyas</option>
                      </optgroup>
                      <optgroup label="🇷🇺 Russian (Русский)">
                        <option value="ru-kuliev">🇷🇺 Эльмир Кулиев (Elmir Kuliev)</option>
                      </optgroup>
                      <optgroup label="🇮🇷 Persian (فارسی)">
                        <option value="fa-kaldari">🇮🇷 حسین تاجی کل‌داری (Hussein Taji Kal Dari)</option>
                        <option value="fa-ghomshei">🇮🇷 مهدی الهی قمشه‌ای (Mahdi Elahi Ghomshei)</option>
                      </optgroup>
                      <optgroup label="🇲🇾 Malay & 🇮🇳 Tamil">
                        <option value="ms-basmeih">🇲🇾 Abdullah Muhammad Basmeih</option>
                        <option value="ta-jantrust">🇮🇳 Jan Trust Foundation (ஜான் டிரஸ்ட்)</option>
                      </optgroup>
                      <optgroup label="🕌 Arabic Scripture Only">
                        <option value="none">🕌 None (Arabic Scripture Only)</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* 3. ⚡ Apply Translation to Timeline Button */}
                  <button
                    type="button"
                    id="btn-apply-translation-to-timeline"
                    onClick={handleTriggerApplyTranslation}
                    disabled={isApplyingTranslation}
                    className="w-full py-2.5 px-3 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-bold rounded-lg text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {isApplyingTranslation ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                        <span>Applying {currentTranslation.language} Translation to Timeline...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-cyan-400" />
                        <span>⚡ Apply {currentTranslation.flag} {currentTranslation.language.split(' ')[0]} Translation to Timeline</span>
                      </>
                    )}
                  </button>
                </div>

                {/* BLOCK 2.8: OPENING / INTRO RECITION SELECTOR (BISMILLAH & TAAWWUZ) */}
                <div className="bg-[#101016] border border-amber-500/30 rounded-xl p-3 space-y-2 shadow-md">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>OPENING VERSES</span>
                    </label>
                    <span className="text-[10px] text-amber-300 font-mono font-bold">
                      {quranIntroMode === 'both' ? '⭐ A’udhu + Bismillah' : quranIntroMode === 'bismillah-only' ? 'Bismillah Only' : quranIntroMode === 'taawwuz-only' ? 'A’udhu Only' : 'Direct Ayah 1'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'both', label: '⭐ A’udhu + Bismillah', desc: 'Include Both' },
                      { id: 'bismillah-only', label: 'Bismillah Only', desc: 'Bismillah Only' },
                      { id: 'taawwuz-only', label: 'A’udhu Only', desc: 'A’udhu Only' },
                      { id: 'none', label: 'Direct Ayah 1', desc: 'Direct Ayah' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        id={`btn-intro-mode-${mode.id}`}
                        onClick={() => {
                          if (setQuranIntroMode) {
                            setQuranIntroMode(mode.id as any);
                          }
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex flex-col items-center justify-center border cursor-pointer ${
                          quranIntroMode === mode.id
                            ? 'bg-black text-white border-white shadow-md'
                            : 'bg-[#15151e] border-gray-800 text-gray-300 hover:text-white hover:bg-gray-800/80'
                        }`}
                      >
                        <span className="text-[11px] leading-tight">{mode.label}</span>
                        <span className={`text-[9px] ${quranIntroMode === mode.id ? 'text-white/80 font-semibold' : 'text-gray-400'}`}>{mode.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* BLOCK 2.9: BREATH & WAQF SEGMENTATION MODE */}
                <div className="bg-[#101016] border border-amber-500/30 rounded-xl p-3 space-y-2 shadow-md">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>BREATH & WAQF MODE</span>
                    </label>
                    <span className="text-[10px] text-amber-300 font-mono font-bold">
                      {quranBreathSegmentationMode === 'full-ayah' ? '📖 Full Ayah Display' : '✂️ Split Breath Phrases'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      {
                        id: 'full-ayah',
                        label: '📖 Full Ayah Display',
                        desc: 'Full Ayah intact (continuous screen display)',
                      },
                      {
                        id: 'split-breaths',
                        label: '✂️ Split Breath Phrases',
                        desc: 'Separate phrase per breath ([1/2], [2/2]) for long Ayahs',
                      },
                    ].map((bMode) => (
                      <button
                        key={bMode.id}
                        type="button"
                        id={`btn-breath-mode-${bMode.id}`}
                        onClick={() => {
                          if (setQuranBreathSegmentationMode) {
                            setQuranBreathSegmentationMode(bMode.id as any);
                          }
                        }}
                        className={`py-2 px-2 rounded-lg text-xs font-bold transition flex flex-col items-center justify-center border cursor-pointer text-center ${
                          quranBreathSegmentationMode === bMode.id
                            ? 'bg-black text-white border-white shadow-md'
                            : 'bg-[#15151e] border-gray-800 text-gray-300 hover:text-white hover:bg-gray-800/80'
                        }`}
                      >
                        <span className="text-[11px] font-extrabold leading-tight">{bMode.label}</span>
                        <span className={`text-[9px] mt-0.5 ${quranBreathSegmentationMode === bMode.id ? 'text-white/80 font-semibold' : 'text-gray-400'}`}>
                          {bMode.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[9px] text-amber-300/80 italic pt-0.5 leading-snug">
                    💡 Note: An Ayah recited in a single breath will never be split into parts.
                  </p>
                </div>

                {/* BLOCK 2.95: RECITATION PACE & TEMPO SELECTOR */}
                <div className="bg-[#101016] border border-amber-500/30 rounded-xl p-3 space-y-2 shadow-md">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>RECITATION PACE & TEMPO</span>
                    </label>
                    <span className="text-[10px] text-amber-300 font-mono font-bold">
                      {quranRecitationPace === 'slow-tartil' ? '🐢 Slow Tartil' : quranRecitationPace === 'fast-hadr' ? '⚡ Fast Hadr' : '⚖️ Standard'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'slow-tartil', label: '🐢 Tartil (Slow)', desc: 'Abdul Basit, Husary' },
                      { id: 'standard', label: '⚖️ Standard', desc: 'Mishary, Ghamdi' },
                      { id: 'fast-hadr', label: '⚡ Hadr (Fast)', desc: 'Sudais, Shuraim' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        id={`btn-pace-${p.id}`}
                        onClick={() => {
                          if (setQuranRecitationPace) {
                            setQuranRecitationPace(p.id as any);
                          }
                        }}
                        className={`py-2 px-1.5 rounded-lg text-xs font-bold transition flex flex-col items-center justify-center border cursor-pointer text-center ${
                          quranRecitationPace === p.id
                            ? 'bg-black text-white border-white shadow-md'
                            : 'bg-[#15151e] border-gray-800 text-gray-300 hover:text-white hover:bg-gray-800/80'
                        }`}
                      >
                        <span className="text-[10px] font-extrabold leading-tight">{p.label}</span>
                        <span className={`text-[8px] mt-0.5 ${quranRecitationPace === p.id ? 'text-white/80' : 'text-gray-400'}`}>
                          {p.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* BLOCK 2.98: DUAL TRANSLATION SIMULTANEOUS TRACKS */}
                <div className="bg-[#101016] border border-cyan-500/30 rounded-xl p-3 space-y-2 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-xs font-extrabold text-cyan-400 uppercase tracking-wide flex items-center gap-1.5">
                        <Languages className="w-3.5 h-3.5 text-cyan-400" />
                        <span>DUAL SUBTITLE TRACKS</span>
                      </label>
                      <p className="text-[9px] text-gray-400">Generate 2nd translation simultaneously (Urdu + English)</p>
                    </div>
                    <button
                      type="button"
                      id="toggle-dual-translation"
                      onClick={() => {
                        if (setQuranEnableDualTranslation) {
                          setQuranEnableDualTranslation(!quranEnableDualTranslation);
                        }
                      }}
                      className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer border ${
                        quranEnableDualTranslation ? 'bg-cyan-500 border-cyan-400 justify-end' : 'bg-gray-800 border-gray-700 justify-start'
                      }`}
                    >
                      <span className="bg-black w-3.5 h-3.5 rounded-full shadow-md" />
                    </button>
                  </div>
                  {quranEnableDualTranslation && (
                    <div className="space-y-2 pt-1 border-t border-gray-800">
                      <div>
                        <span className="text-[10px] text-gray-300 font-semibold">Secondary Translation:</span>
                        <select
                          id="select-secondary-translation"
                          value={quranDualTranslationLang}
                          onChange={(e) => {
                            const newLang = e.target.value;
                            if (setQuranDualTranslationLang) {
                              setQuranDualTranslationLang(newLang);
                            }
                            if (onApplyDualTranslationToTimeline) {
                              onApplyDualTranslationToTimeline(newLang);
                            }
                          }}
                          className="w-full mt-1 bg-[#0a0a0d] border border-cyan-500/40 focus:border-cyan-400 rounded-md p-1.5 text-xs text-cyan-200 font-medium focus:outline-none cursor-pointer"
                        >
                          <option value="en-sahih">🇬🇧 English (Sahih International)</option>
                          <option value="ur-jalandhry">🇵🇰 Urdu (Fateh Muhammad Jalandhry)</option>
                          <option value="hi-suhel">🇮🇳 Hindi (Suhel Farooq Khan)</option>
                          <option value="id-kemenag">🇮🇩 Indonesian (Kemenag)</option>
                          <option value="tr-diyanet">🇹🇷 Turkish (Diyanet)</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        id="btn-apply-dual-translation"
                        onClick={() => {
                          if (onApplyDualTranslationToTimeline) {
                            onApplyDualTranslationToTimeline(quranDualTranslationLang);
                          }
                        }}
                        className="w-full py-1.5 px-2 bg-gradient-to-r from-cyan-950/80 to-blue-950/80 hover:from-cyan-900 hover:to-blue-900 border border-cyan-500/50 hover:border-cyan-400 text-cyan-200 font-bold rounded-lg text-[11px] transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>Apply Dual Translation Track Now</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* BLOCK 3: ✨ 1-CLICK AUTO-GENERATE CAPTIONS BUTTON */}
                <button
                  type="button"
                  id="btn-1click-auto-generate"
                  onClick={() => {
                    const selectedSurahNum = quranSurahPreset === 'custom' ? quranSurahCustom : parseInt(quranSurahPreset, 10) || 1;
                    onAlignQuran({
                      surah: (quranSelectionType === 'list' || quranSelectionType === 'mixed') ? quranSurahList : selectedSurahNum,
                      startAyah: quranSelectionType === 'single' ? quranStartAyah : 1,
                      mode: (quranSelectionType === 'single' || quranSelectionType === 'mixed') ? 'individual' : 'batch',
                      style: 'Imperial Gold',
                      selectionType: quranSelectionType,
                      surahList: quranSurahList,
                      surahEnd: quranSurahEnd,
                      introMode: quranIntroMode,
                      recitationPace: quranRecitationPace,
                      enableDualTranslation: quranEnableDualTranslation,
                      dualTranslationLanguage: quranDualTranslationLang,
                    });
                  }}
                  className="w-full py-3.5 px-4 bg-black text-white hover:bg-gray-900 font-extrabold rounded-xl text-xs sm:text-sm transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer border border-amber-400/80"
                >
                  <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>
                    ✨ 1-Click Auto-Generate Captions (
                    {quranSelectionType === 'list'
                      ? `Multi-Surah: ${quranSurahList}`
                      : quranSelectionType === 'mixed'
                      ? `Mixed: ${quranSurahList}`
                      : quranSelectionType === 'all'
                      ? 'Whole Surah'
                      : `Ayah ${quranStartAyah}`}
                    {' '}• Arabic + {currentTranslation.language.split(' ')[0]}
                    {quranEnableDualTranslation ? ' + Dual Track' : ''})
                  </span>
                </button>

                {/* AUTO-SYNC B-ROLL VIDEO CLIP CUTS TO AYAH BOUNDARIES */}
                {onAutoSyncVideoToAyahs && (
                  <button
                    type="button"
                    id="btn-media-sync-video-ayahs"
                    onClick={onAutoSyncVideoToAyahs}
                    className="w-full py-2.5 px-3 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/40 hover:border-purple-400 text-purple-200 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>🎬 Auto-Sync B-Roll Video to Ayahs (B-Roll Switcher)</span>
                  </button>
                )}



                {/* BLOCK 3.8: 👑 SURAH HEADER OVERLAY CONTROLS */}
                <div className="bg-[#121218] border border-amber-500/30 rounded-xl p-3.5 space-y-3.5 mt-2 shadow-lg">
                  <div className="flex items-center justify-between pb-1 border-b border-gray-800/80">
                    <label className="text-xs font-extrabold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      <span>SURAH HEADER OVERLAY</span>
                    </label>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                      Top Overlay
                    </span>
                  </div>

                  {/* 1. ENABLE SWITCH */}
                  <div className="flex items-center justify-between p-2.5 bg-[#0a0a0d] border border-gray-800 rounded-lg">
                    <span className="text-xs font-bold text-gray-300">Show Surah Header Overlay</span>
                    <button
                      type="button"
                      id="btn-toggle-surah-header"
                      onClick={() => setQuranShowSurahHeader && setQuranShowSurahHeader(!quranShowSurahHeader)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        quranShowSurahHeader ? 'bg-amber-500' : 'bg-gray-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          quranShowSurahHeader ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {quranShowSurahHeader && (
                    <div className="space-y-3.5 pt-1 border-t border-gray-800/50">
                      {/* 2. STYLE OPTIONS */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">LAYOUT STYLE</label>
                          <select
                            id="select-surah-header-style"
                            value={quranSurahHeaderStyle}
                            onChange={(e) => setQuranSurahHeaderStyle && setQuranSurahHeaderStyle(e.target.value as any)}
                            className="w-full bg-[#0a0a0d] border border-gray-800 focus:border-amber-500 rounded-lg p-2 text-xs text-white focus:outline-none cursor-pointer"
                          >
                            <option value="simple">Simple Text</option>
                            <option value="ornate">Ornate Borders</option>
                            <option value="border-only">Border Only</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">NAME FORMAT</label>
                          <select
                            id="select-surah-header-format"
                            value={quranSurahHeaderFormat}
                            onChange={(e) => setQuranSurahHeaderFormat && setQuranSurahHeaderFormat(e.target.value as any)}
                            className="w-full bg-[#0a0a0d] border border-gray-800 focus:border-amber-500 rounded-lg p-2 text-xs text-white focus:outline-none cursor-pointer"
                          >
                            <option value="both">Arabic & English</option>
                            <option value="arabic">Arabic Only</option>
                            <option value="english">English Only</option>
                          </select>
                        </div>
                      </div>

                      {/* 3. FONT SELECTION & SIZE */}
                      <div className="space-y-3.5 p-2.5 bg-[#0a0a0d] border border-gray-800 rounded-lg">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">FONT FAMILY</span>
                          </div>
                          <select
                            id="select-surah-header-font"
                            value={quranSurahHeaderFont}
                            onChange={(e) => setQuranSurahHeaderFont && setQuranSurahHeaderFont(e.target.value)}
                            className="w-full bg-[#0a0a0d] border border-gray-800 focus:border-amber-500 rounded-md p-1.5 text-xs text-amber-200 focus:outline-none cursor-pointer"
                          >
                            <option value="Playfair Display">📖 Playfair Display (Serif)</option>
                            <option value="Amiri">🕌 Amiri (Arabic Naskh)</option>
                            <option value="Jameel Noori Nastaleeq">🇵🇰 Jameel Noori Nastaleeq</option>
                            <option value="Cinzel">🏛️ Cinzel (Classic display)</option>
                            <option value="Georgia">📜 Georgia (Elegant Editorial)</option>
                            <option value="Montserrat">📐 Montserrat (Modern Geometric Sans)</option>
                            <option value="Arial">📏 Arial (Simple Sans)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">FONT SIZE</span>
                            <span className="font-mono text-amber-400 font-bold text-[11px]">{quranSurahHeaderSize}PX</span>
                          </div>
                          <input
                            type="range"
                            id="slider-surah-header-size"
                            min="14"
                            max="64"
                            step="1"
                            value={quranSurahHeaderSize}
                            onChange={(e) => setQuranSurahHeaderSize && setQuranSurahHeaderSize(parseInt(e.target.value, 10))}
                            className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Y-POSITION OVERLAY</span>
                            <span className="font-mono text-amber-400 font-bold text-[11px]">{quranSurahHeaderY}%</span>
                          </div>
                          <input
                            type="range"
                            id="slider-surah-header-y"
                            min="2"
                            max="90"
                            step="1"
                            value={quranSurahHeaderY}
                            onChange={(e) => setQuranSurahHeaderY && setQuranSurahHeaderY(parseInt(e.target.value, 10))}
                            className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                          />
                        </div>
                      </div>

                      {/* 4. COLOR & BACKDROP SETTINGS */}
                      <div className="space-y-3 p-2.5 bg-[#0a0a0d] border border-gray-800 rounded-lg">
                        {/* Font Color */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">HEADER COLOR</span>
                            <span className="font-mono text-amber-400 font-bold text-[11px] uppercase">{quranSurahHeaderColor}</span>
                          </div>
                          <div className="flex items-center gap-2 pt-0.5">
                            <label
                              className="w-6 h-6 rounded border border-gray-750 cursor-pointer relative shrink-0 shadow-sm flex items-center justify-center transition hover:scale-105"
                              style={{ backgroundColor: quranSurahHeaderColor }}
                            >
                              <input
                                type="color"
                                value={quranSurahHeaderColor}
                                onChange={(e) => setQuranSurahHeaderColor && setQuranSurahHeaderColor(e.target.value)}
                                className="opacity-0 w-full h-full cursor-pointer absolute inset-0"
                              />
                            </label>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {['#FFFFFF', '#FFD700', '#F3F4F6', '#93C5FD', '#FDE047'].map((col) => (
                                <button
                                  key={col}
                                  type="button"
                                  onClick={() => setQuranSurahHeaderColor && setQuranSurahHeaderColor(col)}
                                  className={`w-4.5 h-4.5 rounded-full transition-transform hover:scale-110 cursor-pointer border ${
                                    quranSurahHeaderColor.toLowerCase() === col.toLowerCase()
                                      ? 'ring-2 ring-amber-400 border-white'
                                      : 'border-transparent opacity-90'
                                  }`}
                                  style={{ backgroundColor: col }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Backdrop Backdrop Type */}
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-800/40">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">BACKDROP STYLE</label>
                            <select
                              id="select-surah-header-bg"
                              value={quranSurahHeaderBg}
                              onChange={(e) => setQuranSurahHeaderBg && setQuranSurahHeaderBg(e.target.value as any)}
                              className="w-full bg-[#101015] border border-gray-800 focus:border-amber-500 rounded p-1 text-[11px] text-white focus:outline-none cursor-pointer"
                            >
                              <option value="none">No Backdrop</option>
                              <option value="solid">Solid Box</option>
                              <option value="gradient">Gradient Banner</option>
                              <option value="blur">Glass Blur</option>
                            </select>
                          </div>

                          {quranSurahHeaderBg !== 'none' && (
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">BACKDROP COLOR</label>
                              <div className="flex items-center gap-1.5">
                                <label
                                  className="w-5 h-5 rounded border border-gray-850 cursor-pointer relative shrink-0 shadow-sm"
                                  style={{ backgroundColor: quranSurahHeaderBgColor }}
                                >
                                  <input
                                    type="color"
                                    value={quranSurahHeaderBgColor}
                                    onChange={(e) => setQuranSurahHeaderBgColor && setQuranSurahHeaderBgColor(e.target.value)}
                                    className="opacity-0 w-full h-full cursor-pointer absolute inset-0"
                                  />
                                </label>
                                <select
                                  id="select-surah-header-bg-opacity"
                                  value={quranSurahHeaderBgOpacity}
                                  onChange={(e) => setQuranSurahHeaderBgOpacity && setQuranSurahHeaderBgOpacity(parseInt(e.target.value, 10))}
                                  className="bg-[#101015] border border-gray-800 focus:border-amber-500 rounded p-1 text-[11px] text-white focus:outline-none cursor-pointer"
                                >
                                  <option value={20}>20%</option>
                                  <option value={40}>40%</option>
                                  <option value={50}>50%</option>
                                  <option value={60}>60%</option>
                                  <option value={80}>80%</option>
                                  <option value={100}>100%</option>
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* BLOCK 3.9: ⚡ SINGLE-WORD / LAFZ BA LAFZ DISPLAY MODE (VIRAL CAPTION FOCUS) */}
                <div className="bg-[#121218] border border-cyan-500/30 rounded-xl p-3.5 space-y-3.5 mt-2 shadow-lg">
                  <div className="flex items-center justify-between pb-1 border-b border-gray-800/80">
                    <label className="text-xs font-extrabold text-cyan-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>SINGLE WORD (LAFZ BA LAFZ) MODE</span>
                    </label>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-bold border border-cyan-500/20">
                      Viral Reels
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Show only the current spoken word on screen in large punchy typography instead of the entire ayah.
                  </p>

                  {/* Mode Selector Buttons */}
                  <div className="grid grid-cols-2 gap-2 bg-[#0a0a0d] p-1.5 rounded-lg border border-gray-800">
                    <button
                      type="button"
                      id="btn-mode-full-ayah"
                      onClick={() => setQuranCaptionDisplayMode && setQuranCaptionDisplayMode('full-ayah')}
                      className={`py-2 px-2.5 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        quranCaptionDisplayMode === 'full-ayah'
                          ? 'bg-gray-800 text-white shadow-sm border border-gray-700'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <span>📜 Full Ayah</span>
                    </button>
                    <button
                      type="button"
                      id="btn-mode-single-word"
                      onClick={() => setQuranCaptionDisplayMode && setQuranCaptionDisplayMode('single-word')}
                      className={`py-2 px-2.5 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        quranCaptionDisplayMode === 'single-word'
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md border border-cyan-400'
                          : 'text-gray-400 hover:text-cyan-300'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5 text-cyan-300" />
                      <span>⚡ Lafz ba Lafz</span>
                    </button>
                  </div>

                  {quranCaptionDisplayMode === 'single-word' && (
                    <div className="space-y-3 p-2.5 bg-[#0a0a0d] border border-cyan-500/20 rounded-lg">
                      {/* Scale Multiplier Slider */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">WORD SIZE BOOST</span>
                          <span className="font-mono text-cyan-400 font-bold text-[11px]">{quranSingleWordScale}x</span>
                        </div>
                        <input
                          type="range"
                          id="slider-single-word-scale"
                          min="1.0"
                          max="2.2"
                          step="0.05"
                          value={quranSingleWordScale}
                          onChange={(e) => setQuranSingleWordScale && setQuranSingleWordScale(parseFloat(e.target.value))}
                          className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>

                      {/* Micro Pop Animation Switch */}
                      <div className="flex items-center justify-between pt-1 border-t border-gray-800/60">
                        <span className="text-xs text-gray-300 font-medium">Punchy Pop Animation</span>
                        <button
                          type="button"
                          id="btn-toggle-word-pop"
                          onClick={() => setQuranSingleWordPop && setQuranSingleWordPop(!quranSingleWordPop)}
                          className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            quranSingleWordPop ? 'bg-cyan-500' : 'bg-gray-800'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              quranSingleWordPop ? 'translate-x-3.5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Audio Sync Calibration for Single-Word Mode */}
                      <div className="pt-2 border-t border-gray-800/60 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <Timer className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">AUDIO SYNC CALIBRATION</span>
                          </div>
                          <span className="font-mono text-cyan-400 font-bold text-[10px]">
                            {quranKaraokeSyncOffsetMs > 0 ? `+${quranKaraokeSyncOffsetMs}ms (Ahead)` : quranKaraokeSyncOffsetMs < 0 ? `${quranKaraokeSyncOffsetMs}ms` : '0ms (Exact)'}
                          </span>
                        </div>
                        <p className="text-[9px] text-gray-400 leading-tight">
                          Agar aawaz pehle aaye to offset barhaen taake lafz ba lafz aawaz ke sath bilkul bar-waqt chale.
                        </p>
                        <input
                          type="range"
                          id="slider-single-word-sync-offset"
                          min="-200"
                          max="600"
                          step="25"
                          value={quranKaraokeSyncOffsetMs}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 0;
                            if (setQuranKaraokeSyncOffsetMs) setQuranKaraokeSyncOffsetMs(val);
                            onApplyQuranStyles({ syncOffsetMs: val });
                          }}
                          className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (setQuranKaraokeSyncOffsetMs) setQuranKaraokeSyncOffsetMs(0);
                              onApplyQuranStyles({ syncOffsetMs: 0 });
                            }}
                            className={`px-2 py-0.5 rounded text-[9px] font-medium border cursor-pointer transition ${
                              quranKaraokeSyncOffsetMs === 0 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                            }`}
                          >
                            0ms (Exact)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (setQuranKaraokeSyncOffsetMs) setQuranKaraokeSyncOffsetMs(150);
                              onApplyQuranStyles({ syncOffsetMs: 150 });
                            }}
                            className={`px-2 py-0.5 rounded text-[9px] font-medium border cursor-pointer transition ${
                              quranKaraokeSyncOffsetMs === 150 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                            }`}
                          >
                            ⚡ +150ms (Recommended)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (setQuranKaraokeSyncOffsetMs) setQuranKaraokeSyncOffsetMs(300);
                              onApplyQuranStyles({ syncOffsetMs: 300 });
                            }}
                            className={`px-2 py-0.5 rounded text-[9px] font-medium border cursor-pointer transition ${
                              quranKaraokeSyncOffsetMs === 300 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                            }`}
                          >
                            🚀 +300ms (Fast Pace)
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* BLOCK 3.10: 🎙️ RECITER / QARI CREDIT BADGE OVERLAY */}
                <div className="bg-[#121218] border border-amber-500/30 rounded-xl p-3.5 space-y-3.5 mt-2 shadow-lg">
                  <div className="flex items-center justify-between pb-1 border-b border-gray-800/80">
                    <label className="text-xs font-extrabold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-amber-400" />
                      <span>QARI / RECITER BADGE</span>
                    </label>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                      Credit Pill
                    </span>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex items-center justify-between p-2.5 bg-[#0a0a0d] border border-gray-800 rounded-lg">
                    <span className="text-xs font-bold text-gray-300">Show Qari Credit Badge</span>
                    <button
                      type="button"
                      id="btn-toggle-qari-badge"
                      onClick={() => setQuranShowQariBadge && setQuranShowQariBadge(!quranShowQariBadge)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        quranShowQariBadge ? 'bg-amber-500' : 'bg-gray-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          quranShowQariBadge ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {quranShowQariBadge && (
                    <div className="space-y-3 pt-1 border-t border-gray-800/50">
                      {/* Reciter Selector */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">RECITER NAME</label>
                        <select
                          id="select-qari-name"
                          value={quranQariName}
                          onChange={(e) => setQuranQariName && setQuranQariName(e.target.value)}
                          className="w-full bg-[#0a0a0d] border border-gray-800 focus:border-amber-500 rounded-lg p-2 text-xs text-amber-200 focus:outline-none cursor-pointer"
                        >
                          <option value="Mishary Rashid Alafasy">Mishary Rashid Alafasy</option>
                          <option value="Abdul Rahman Al-Sudais">Abdul Rahman Al-Sudais</option>
                          <option value="Maher Al-Muaiqly">Maher Al-Muaiqly</option>
                          <option value="Yasser Al-Dosari">Yasser Al-Dosari</option>
                          <option value="Abdul Basit Abdul Samad">Abdul Basit Abdul Samad</option>
                          <option value="Saad Al-Ghamdi">Saad Al-Ghamdi</option>
                          <option value="Saud Al-Shuraim">Saud Al-Shuraim</option>
                          <option value="Islam Sobhi">Islam Sobhi</option>
                          <option value="Abu Bakr Al-Shatri">Abu Bakr Al-Shatri</option>
                          <option value="Nasser Al-Qatami">Nasser Al-Qatami</option>
                        </select>
                      </div>

                      {/* Custom Name Input */}
                      <div className="space-y-1">
                        <input
                          type="text"
                          id="input-custom-qari-name"
                          value={quranQariName}
                          onChange={(e) => setQuranQariName && setQuranQariName(e.target.value)}
                          placeholder="Or type custom reciter name..."
                          className="w-full bg-[#0a0a0d] border border-gray-800 focus:border-amber-500 rounded-lg p-2 text-xs text-white placeholder-gray-600 focus:outline-none"
                        />
                      </div>

                      {/* Badge Position */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">BADGE POSITION</label>
                        <select
                          id="select-qari-badge-position"
                          value={quranQariBadgePosition}
                          onChange={(e) => setQuranQariBadgePosition && setQuranQariBadgePosition(e.target.value as any)}
                          className="w-full bg-[#0a0a0d] border border-gray-800 focus:border-amber-500 rounded-lg p-2 text-xs text-white focus:outline-none cursor-pointer"
                        >
                          <option value="top-right">Top Right</option>
                          <option value="top-left">Top Left</option>
                          <option value="bottom-right">Bottom Right</option>
                          <option value="bottom-left">Bottom Left</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* BLOCK 3.11: 🌊 ISLAMIC AUDIO WAVEFORM VISUALIZER */}
                <div className="bg-[#121218] border border-amber-500/30 rounded-xl p-3.5 space-y-3.5 mt-2 shadow-lg">
                  <div className="flex items-center justify-between pb-1 border-b border-gray-800/80">
                    <label className="text-xs font-extrabold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>AUDIO WAVEFORM VISUALIZER</span>
                    </label>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                      Live Audio FX
                    </span>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex items-center justify-between p-2.5 bg-[#0a0a0d] border border-gray-800 rounded-lg">
                    <span className="text-xs font-bold text-gray-300">Show Waveform Visualizer</span>
                    <button
                      type="button"
                      id="btn-toggle-waveform"
                      onClick={() => setQuranShowWaveform && setQuranShowWaveform(!quranShowWaveform)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        quranShowWaveform ? 'bg-amber-500' : 'bg-gray-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          quranShowWaveform ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {quranShowWaveform && (
                    <div className="space-y-3 pt-1 border-t border-gray-800/50">
                      {/* Waveform Style */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">VISUALIZER STYLE</label>
                        <select
                          id="select-waveform-style"
                          value={quranWaveformStyle}
                          onChange={(e) => setQuranWaveformStyle && setQuranWaveformStyle(e.target.value as any)}
                          className="w-full bg-[#0a0a0d] border border-gray-800 focus:border-amber-500 rounded-lg p-2 text-xs text-white focus:outline-none cursor-pointer"
                        >
                          <option value="bars">📊 Neon Equalizer Bars</option>
                          <option value="wave">〰️ Glowing Sine Wave</option>
                          <option value="mirror">🪞 Symmetrical Mirror Bars</option>
                        </select>
                      </div>

                      {/* Color Picker */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">GLOW COLOR</span>
                          <span className="font-mono text-amber-400 font-bold text-[11px] uppercase">{quranWaveformColor}</span>
                        </div>
                        <div className="flex items-center gap-2 pt-0.5">
                          <label
                            className="w-6 h-6 rounded border border-gray-750 cursor-pointer relative shrink-0 shadow-sm"
                            style={{ backgroundColor: quranWaveformColor }}
                          >
                            <input
                              type="color"
                              value={quranWaveformColor}
                              onChange={(e) => setQuranWaveformColor && setQuranWaveformColor(e.target.value)}
                              className="opacity-0 w-full h-full cursor-pointer absolute inset-0"
                            />
                          </label>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {['#F59E0B', '#06B6D4', '#10B981', '#A855F7', '#EF4444', '#FFFFFF'].map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setQuranWaveformColor && setQuranWaveformColor(c)}
                                className={`w-4.5 h-4.5 rounded-full transition-transform hover:scale-110 cursor-pointer border ${
                                  quranWaveformColor.toLowerCase() === c.toLowerCase()
                                    ? 'ring-2 ring-amber-400 border-white'
                                    : 'border-transparent opacity-90'
                                }`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Y-Position Slider */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">VERTICAL POSITION</span>
                          <span className="font-mono text-amber-400 font-bold text-[11px]">{quranWaveformY}%</span>
                        </div>
                        <input
                          type="range"
                          id="slider-waveform-y"
                          min="20"
                          max="95"
                          step="1"
                          value={quranWaveformY}
                          onChange={(e) => setQuranWaveformY && setQuranWaveformY(parseInt(e.target.value, 10))}
                          className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* BLOCK 3.12: 🌟 1-CLICK ISLAMIC CALLIGRAPHY CARDS */}
                <div className="bg-[#121218] border border-amber-500/30 rounded-xl p-3.5 space-y-3 mt-2 shadow-lg">
                  <div className="flex items-center justify-between pb-1 border-b border-gray-800/80">
                    <label className="text-xs font-extrabold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>QUICK ISLAMIC CALLIGRAPHY CARDS</span>
                    </label>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                      1-Click
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-400">
                    Instantly insert cinematic opening and closing cards onto your timeline.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      id="btn-add-bismillah-card"
                      onClick={() => onAddBismillahCard && onAddBismillahCard()}
                      className="py-2.5 px-3 bg-gradient-to-r from-amber-950/50 to-amber-900/30 hover:from-amber-900/60 hover:to-amber-800/40 border border-amber-500/40 hover:border-amber-400 text-amber-200 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm text-left"
                    >
                      <Plus className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="text-[11px] font-bold">Add Bismillah Opening</div>
                        <div className="text-[9px] text-amber-400/80 font-mono">بِسْمِ اللّٰهِ (4 sec)</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      id="btn-add-sadaqallah-card"
                      onClick={() => onAddSadaqallahCard && onAddSadaqallahCard()}
                      className="py-2.5 px-3 bg-gradient-to-r from-purple-950/50 to-purple-900/30 hover:from-purple-900/60 hover:to-purple-800/40 border border-purple-500/40 hover:border-purple-400 text-purple-200 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm text-left"
                    >
                      <Plus className="w-4 h-4 text-purple-400 shrink-0" />
                      <div>
                        <div className="text-[11px] font-bold">Add Sadaqallah Outro</div>
                        <div className="text-[9px] text-purple-400/80 font-mono">صَدَقَ اللّٰهُ (3.5 sec)</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* BLOCK 4: ARABIC SCRIPTURE TYPOGRAPHY & AYAH SYMBOL CONTROLS */}
                <div className="bg-[#121218] border border-amber-500/30 rounded-xl p-3.5 space-y-3.5 mt-2 shadow-lg">
                  <div className="flex items-center justify-between pb-1 border-b border-gray-800/80">
                    <label className="text-xs font-extrabold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>ARABIC SCRIPTURE (UTHMANI)</span>
                    </label>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                      Live Customization
                    </span>
                  </div>

                  {/* 1. QURANIC FONT FAMILY */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">QURANIC / ARABIC FONT</span>
                      <span className="font-mono text-amber-400 font-bold text-[10px] truncate max-w-[120px]">{quranArabicFont}</span>
                    </div>
                    <select
                      id="select-quran-arabic-font"
                      value={quranArabicFont}
                      onChange={(e) => {
                        const val = e.target.value;
                        setQuranArabicFont(val);
                        onApplyQuranStyles({ arabicFont: val });
                      }}
                      className="w-full bg-[#0a0a0d] border border-amber-500/40 focus:border-amber-400 rounded-lg p-2.5 text-xs text-amber-300 font-semibold focus:outline-none transition cursor-pointer"
                    >
                      <option value="QPC Uthmani Hafs">📖 QPC Uthmani Hafs (Quran.com Madinah Mushaf)</option>
                      <option value="Uthmani">📖 Uthmani (KFGQPC Madinah Mushaf Script)</option>
                      <option value="Amiri Quran">🕌 Amiri Quran (Classical Uthmani Scripture)</option>
                      <option value="KFGQPC Uthmanic Script HAFS">📜 KFGQPC Hafs Script (Official Mushaf)</option>
                      <option value="Noto Naskh Arabic">📜 Noto Naskh Arabic (Crisp Readable Naskh)</option>
                      <option value="Amiri">🕌 Amiri (Classical Calligraphic)</option>
                      <option value="Scheherazade New">🕌 Scheherazade New (Traditional Arabic)</option>
                      <option value="Lateef">🕌 Lateef (Perso-Arabic Quranic)</option>
                      <option value="Reem Kufi">🕌 Reem Kufi (Geometric Kufic Modern)</option>
                      <option value="Noto Nastaliq Urdu">🇵🇰 Noto Nastaliq Urdu (Nastaliq Calligraphy)</option>
                    </select>
                  </div>



                  {/* 3. FONT SIZE */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">FONT SIZE</span>
                      <span className="font-mono text-amber-400 font-bold text-xs">{quranArabicSize}PX</span>
                    </div>
                    <input
                      type="range"
                      id="slider-quran-arabic-size"
                      min="16"
                      max="72"
                      step="1"
                      value={quranArabicSize}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 36;
                        setQuranArabicSize(val);
                        onApplyQuranStyles({ arabicSize: val });
                      }}
                      className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>

                  {/* 4. FONT COLOR */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">FONT COLOR</span>
                      <span className="font-mono text-amber-400 font-bold text-xs uppercase">{quranArabicColor}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-0.5">
                      {/* Active Color Preview & Picker */}
                      <label
                        className="w-7 h-7 rounded border border-gray-700 cursor-pointer relative shrink-0 shadow-sm flex items-center justify-center transition hover:scale-105"
                        style={{ backgroundColor: quranArabicColor }}
                        title="Pick custom color"
                      >
                        <input
                          type="color"
                          value={quranArabicColor}
                          onChange={(e) => {
                            setQuranArabicColor(e.target.value);
                            onApplyQuranStyles({ arabicColor: e.target.value });
                          }}
                          className="opacity-0 w-full h-full cursor-pointer absolute inset-0"
                        />
                      </label>
                      {/* Preset Color Swatches */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {['#FFD700', '#FFFF00', '#00FFFF', '#00FF66', '#FFFFFF', '#FDE047', '#FF8C00'].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              setQuranArabicColor(c);
                              onApplyQuranStyles({ arabicColor: c });
                            }}
                            className={`w-5 h-5 rounded-full transition-transform hover:scale-125 cursor-pointer border ${
                              quranArabicColor.toLowerCase() === c.toLowerCase()
                                ? 'ring-2 ring-amber-400 border-white scale-110'
                                : 'border-transparent opacity-90 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3. TEXT EFFECT / GLOW */}
                  <div className="space-y-1.5">
                    <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">TEXT EFFECT / GLOW</span>
                    <div className="space-y-1.5">
                      {/* Row 1 */}
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['normal', 'shadow', 'outline'] as const).map((styleKey) => (
                          <button
                            key={styleKey}
                            type="button"
                            id={`btn-arabic-effect-${styleKey}`}
                            onClick={() => {
                              setQuranArabicStyle(styleKey);
                              onApplyQuranStyles({ arabicStyle: styleKey });
                            }}
                            className={`py-2 px-2 text-xs font-semibold rounded-lg transition capitalize border cursor-pointer ${
                              quranArabicStyle === styleKey
                                ? 'bg-black text-white border-white shadow-md font-bold'
                                : 'bg-[#181822] text-gray-300 hover:text-white hover:bg-gray-800 border-gray-800'
                            }`}
                          >
                            {styleKey}
                          </button>
                        ))}
                      </div>
                      {/* Row 2 */}
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          id="btn-arabic-effect-neon"
                          onClick={() => {
                            setQuranArabicStyle('neon');
                            onApplyQuranStyles({ arabicStyle: 'neon' });
                          }}
                          className={`py-2 px-1 text-xs font-semibold rounded-lg transition border cursor-pointer ${
                            quranArabicStyle === 'neon'
                              ? 'bg-black text-white border-white shadow-md font-bold'
                              : 'bg-[#181822] text-gray-300 hover:text-white hover:bg-gray-800 border-gray-800'
                          }`}
                        >
                          Neon
                        </button>
                        <button
                          type="button"
                          id="btn-arabic-effect-gold-glow"
                          onClick={() => {
                            setQuranArabicStyle('gold-glow');
                            onApplyQuranStyles({ arabicStyle: 'gold-glow' });
                          }}
                          className={`py-2 px-1 text-xs font-semibold rounded-lg transition border cursor-pointer ${
                            quranArabicStyle === 'gold-glow'
                              ? 'bg-black text-white border-white shadow-md font-bold'
                              : 'bg-[#181822] text-gray-300 hover:text-white hover:bg-gray-800 border-gray-800'
                          }`}
                        >
                          ✨ Gold Glow
                        </button>
                        <button
                          type="button"
                          id="btn-arabic-effect-viral-reels"
                          onClick={() => {
                            setQuranArabicStyle('viral-reels');
                            onApplyQuranStyles({ arabicStyle: 'viral-reels' });
                          }}
                          className={`py-2 px-1 text-xs font-semibold rounded-lg transition border cursor-pointer ${
                            quranArabicStyle === 'viral-reels'
                              ? 'bg-black text-white border-white shadow-md font-bold'
                              : 'bg-[#181822] text-gray-300 hover:text-white hover:bg-gray-800 border-gray-800'
                          }`}
                        >
                          🔥 Viral Reels
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 4. VERTICAL ALIGNMENT (Y-AXIS) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">VERTICAL ALIGNMENT (Y-AXIS)</span>
                      <span className="font-mono text-amber-400 font-bold text-xs">{quranArabicY}%</span>
                    </div>
                    <input
                      type="range"
                      id="slider-quran-arabic-y"
                      min="5"
                      max="90"
                      step="1"
                      value={quranArabicY}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 35;
                        setQuranArabicY(val);
                        onApplyQuranStyles({ arabicY: val });
                      }}
                      className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>

                  {/* 5. Auto Word Wrap Switch */}
                  <div className="flex items-center justify-between bg-[#0b0b0f] p-3 rounded-lg border border-gray-800">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-white">Auto Word Wrap</p>
                      <p className="text-[10px] text-gray-400">Wrap long Arabic text to multiple lines</p>
                    </div>
                    <button
                      type="button"
                      id="toggle-quran-arabic-wrap"
                      onClick={() => {
                        const next = !quranArabicWrap;
                        setQuranArabicWrap(next);
                        onApplyQuranStyles({ arabicWrap: next });
                      }}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer border ${
                        quranArabicWrap ? 'bg-amber-500 border-amber-400 justify-end' : 'bg-gray-800 border-gray-700 justify-start'
                      }`}
                    >
                      <span className="bg-black w-4 h-4 rounded-full shadow-md" />
                    </button>
                  </div>

                  {/* 6. MAX LINE WIDTH (CANVAS %) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">MAX LINE WIDTH (CANVAS %)</span>
                      <span className="font-mono text-amber-400 font-bold text-xs">{quranArabicMaxWidth}%</span>
                    </div>
                    <input
                      type="range"
                      id="slider-quran-arabic-max-width"
                      min="40"
                      max="100"
                      step="1"
                      value={quranArabicMaxWidth}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 80;
                        setQuranArabicMaxWidth(val);
                        onApplyQuranStyles({ arabicMaxWidth: val });
                      }}
                      className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>

                  {/* 7. LINE SPACING (HEIGHT) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">LINE SPACING (HEIGHT)</span>
                      <span className="font-mono text-amber-400 font-bold text-xs">{quranArabicLineHeight}X</span>
                    </div>
                    <input
                      type="range"
                      id="slider-quran-arabic-line-height"
                      min="1.0"
                      max="2.5"
                      step="0.1"
                      value={quranArabicLineHeight}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 1.3;
                        setQuranArabicLineHeight(val);
                        onApplyQuranStyles({ arabicLineHeight: val });
                      }}
                      className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>

                  {/* 8. TEXT ALIGNMENT */}
                  <div className="space-y-1.5">
                    <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">TEXT ALIGNMENT</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['left', 'center', 'right'] as const).map((alignKey) => (
                        <button
                          key={alignKey}
                          type="button"
                          id={`btn-arabic-align-${alignKey}`}
                          onClick={() => {
                            setQuranArabicAlign(alignKey);
                            onApplyQuranStyles({ arabicAlign: alignKey });
                          }}
                          className={`py-2 px-2 text-xs font-semibold rounded-lg transition capitalize border cursor-pointer ${
                            quranArabicAlign === alignKey
                              ? 'bg-black text-white border-white shadow-md font-bold'
                              : 'bg-[#181822] text-gray-300 hover:text-white hover:bg-gray-800 border-gray-800'
                          }`}
                        >
                          {alignKey}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* BLOCK 4.5: ⚜️ AYAH NUMBER SYMBOL & MEDALLION (LIVE CUSTOMIZATION) */}
                <div className="bg-[#121218] border border-amber-500/30 rounded-xl p-3.5 space-y-3.5 mt-2 shadow-lg">
                  <div className="flex items-center justify-between pb-1 border-b border-gray-800/80">
                    <label className="text-xs font-extrabold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                      <span className="text-amber-400 text-sm">۝</span>
                      <span>AYAH END SYMBOL & MEDALLION</span>
                    </label>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                      Crowned Cartouche
                    </span>
                  </div>

                  {/* 1. Toggle Ayah Symbol On/Off */}
                  <div className="flex items-center justify-between bg-[#0b0b0f] p-2.5 rounded-lg border border-gray-800">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-white">Show Ayah End Symbol</p>
                      <p className="text-[10px] text-gray-400">Display ornate verse medallion on Quranic Ayahs</p>
                    </div>
                    <button
                      type="button"
                      id="toggle-quran-show-ayah-symbol"
                      onClick={() => {
                        const next = !quranShowAyahSymbol;
                        if (setQuranShowAyahSymbol) setQuranShowAyahSymbol(next);
                        onApplyQuranStyles({ showAyahSymbol: next });
                      }}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer border ${
                        quranShowAyahSymbol ? 'bg-amber-500 border-amber-400 justify-end' : 'bg-gray-800 border-gray-700 justify-start'
                      }`}
                    >
                      <span className="bg-black w-4 h-4 rounded-full shadow-md" />
                    </button>
                  </div>

                  {quranShowAyahSymbol && (
                    <>
                      {/* Visual Live Reference Badge */}
                      <div className="bg-[#0b0b12] border border-amber-500/20 rounded-lg p-2.5 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold uppercase text-amber-400">Current Symbol Preview</span>
                          <p className="text-[9px] text-gray-400">Authentic Mushaf cartouche with verse number</p>
                        </div>
                        <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded border border-amber-500/30">
                          {/* Mini visual representation */}
                          <svg className="w-7 h-9 text-amber-300" viewBox="-35 -60 70 120" fill="none" stroke="currentColor">
                            {/* Outer oval */}
                            <path d="M 0 -42 C 18 -42 30 -24 30 0 C 30 24 18 43 0 43 C -18 43 -30 24 -30 0 C -30 -24 -18 -42 0 -42 Z" strokeWidth="3" />
                            {/* Crown crest */}
                            <path d="M -12 -39 C -12 -47 -6 -48 -4.5 -42.5 C -5.5 -53 5.5 -53 4.5 -42.5 C 6 -48 12 -47 12 -39" strokeWidth="2.5" />
                            {/* Top scrolls */}
                            <path d="M -2 -37 C -12 -37 -23 -31 -24.5 -18 C -24.5 -11 -14 -12 -11 -18 C -9 -22 -14 -26 -17 -24" strokeWidth="2.5" />
                            <path d="M 2 -37 C 12 -37 23 -31 24.5 -18 C 24.5 -11 14 -12 11 -18 C 9 -22 14 -26 17 -24" strokeWidth="2.5" />
                            {/* Bottom scrolls */}
                            <path d="M -2 37 C -12 37 -23 31 -24.5 18 C -24.5 11 -14 12 -11 18 C -9 22 -14 26 -17 24" strokeWidth="2.5" />
                            <path d="M 2 37 C 12 37 23 31 24.5 18 C 24.5 11 14 12 11 18 C 9 22 14 26 17 24" strokeWidth="2.5" />
                            {/* Center digit 5 */}
                            <text x="0" y="5" textAnchor="middle" fill="currentColor" fontSize="28" fontWeight="bold" fontFamily="sans-serif">
                              {quranAyahDigitType === 'latin' ? '5' : '٥'}
                            </text>
                          </svg>
                          <span className="text-xs font-bold text-amber-300 font-mono">
                            {quranAyahSymbolStyle === 'ornate-medallion' ? 'Classic Medallion' : quranAyahSymbolStyle}
                          </span>
                        </div>
                      </div>

                      {/* 2. AYAH SYMBOL STYLE */}
                      <div className="space-y-1.5">
                        <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">MEDALLION STYLE</span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { key: 'ornate-medallion', label: 'Classic Medallion (۝)', badge: 'Reference Design' },
                            { key: 'uthmani-circle', label: 'Uthmani Rosette (⊙)', badge: 'Quran.com' },
                            { key: 'ornate-brackets', label: 'Ornate Brackets ﴿﴾', badge: 'Floral' },
                            { key: 'parentheses', label: 'Parentheses (5)', badge: 'Simple' }
                          ].map((item) => (
                            <button
                              key={item.key}
                              type="button"
                              id={`btn-ayah-symbol-style-${item.key}`}
                              onClick={() => {
                                if (setQuranAyahSymbolStyle) setQuranAyahSymbolStyle(item.key as any);
                                onApplyQuranStyles({ ayahSymbolStyle: item.key, showAyahSymbol: true });
                              }}
                              className={`p-2 text-left rounded-lg transition border cursor-pointer ${
                                quranAyahSymbolStyle === item.key
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-md'
                                  : 'bg-[#181822] text-gray-300 hover:text-white hover:bg-gray-800 border-gray-800'
                              }`}
                            >
                              <p className="text-xs font-bold">{item.label}</p>
                              <span className="text-[9px] text-gray-400">{item.badge}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 3. SYMBOL POSITION */}
                      <div className="space-y-1.5">
                        <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">SYMBOL POSITION</span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { key: 'end', label: 'End of Ayah' },
                            { key: 'divider', label: 'Divider Card' },
                            { key: 'start', label: 'Start of Ayah' }
                          ].map((pos) => (
                            <button
                              key={pos.key}
                              type="button"
                              id={`btn-ayah-symbol-pos-${pos.key}`}
                              onClick={() => {
                                if (setQuranAyahSymbolPosition) setQuranAyahSymbolPosition(pos.key as any);
                                onApplyQuranStyles({ ayahSymbolPosition: pos.key, showAyahSymbol: true });
                              }}
                              className={`py-2 px-1 text-center text-xs font-semibold rounded-lg transition border cursor-pointer ${
                                quranAyahSymbolPosition === pos.key
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-md font-bold'
                                  : 'bg-[#181822] text-gray-300 hover:text-white hover:bg-gray-800 border-gray-800'
                              }`}
                            >
                              {pos.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 4. DIGIT TYPE */}
                      <div className="space-y-1.5">
                        <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">VERSE DIGIT NUMERALS</span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { key: 'arabic', label: 'Arabic Digits (١، ۲، ۳، ٤، ٥)' },
                            { key: 'latin', label: 'English Digits (1, 2, 3, 4, 5)' }
                          ].map((dig) => (
                            <button
                              key={dig.key}
                              type="button"
                              id={`btn-ayah-digit-${dig.key}`}
                              onClick={() => {
                                if (setQuranAyahDigitType) setQuranAyahDigitType(dig.key as any);
                                onApplyQuranStyles({ ayahDigitType: dig.key, showAyahSymbol: true });
                              }}
                              className={`py-2 px-2 text-center text-xs font-semibold rounded-lg transition border cursor-pointer ${
                                quranAyahDigitType === dig.key
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-md font-bold'
                                  : 'bg-[#181822] text-gray-300 hover:text-white hover:bg-gray-800 border-gray-800'
                              }`}
                            >
                              {dig.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="bg-[#121218] border border-cyan-500/30 rounded-xl p-3.5 space-y-3.5 mt-2 shadow-lg">
                  <div className="flex items-center justify-between pb-1 border-b border-gray-800/80">
                    <label className="text-xs font-extrabold text-cyan-400 uppercase tracking-wide flex items-center gap-1.5">
                      <span>{currentTranslation.flag}</span>
                      <span>{currentTranslation.language.toUpperCase()} TRANSLATION</span>
                    </label>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-bold border border-cyan-500/20">
                      Live Typography
                    </span>
                  </div>

                  {/* 1. TRANSLATION FONT FAMILY */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">TRANSLATION FONT FAMILY</span>
                      <span className="text-[10px] text-cyan-400 font-mono font-bold">{quranEnglishFont}</span>
                    </div>
                    <select
                      id="select-quran-english-font"
                      value={quranEnglishFont}
                      onChange={(e) => {
                        const val = e.target.value;
                        setQuranEnglishFont(val);
                        onApplyQuranStyles({ englishFont: val });
                      }}
                      className="w-full bg-[#0a0a0d] border border-gray-800 focus:border-cyan-500 rounded-lg p-2.5 text-xs text-white font-medium focus:outline-none transition cursor-pointer"
                    >
                      <optgroup label={`⭐ Recommended for ${currentTranslation.language.split(' ')[0]} (${currentTranslation.flag})`}>
                        {getSuggestedFontsForLanguage(currentTranslation.languageCode).map((f) => (
                          <option key={`rec-${f.family}`} value={f.family}>
                            {f.label}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="🇵🇰 Urdu & Nastaliq Calligraphy">
                        <option value="Noto Nastaliq Urdu">🇵🇰 Noto Nastaliq Urdu (Traditional Calligraphy)</option>
                        <option value="Gulzar">🇵🇰 Gulzar (Modern Nastaliq Display)</option>
                        <option value="Lateef">🇵🇰 Lateef (Perso-Arabic Naskh-Nastaliq)</option>
                      </optgroup>
                      <optgroup label="🇮🇳 Hindi & Devanagari (हिन्दी)">
                        <option value="Noto Sans Devanagari">🇮🇳 Noto Sans Devanagari (Crisp Modern)</option>
                        <option value="Noto Serif Devanagari">🇮🇳 Noto Serif Devanagari (Literary Classical)</option>
                        <option value="Poppins">🇮🇳 Poppins (Devanagari & Latin Geometric)</option>
                        <option value="Rozha One">🇮🇳 Rozha One (Bold Editorial)</option>
                        <option value="Mukta">🇮🇳 Mukta (Contemporary Devanagari)</option>
                        <option value="Kalam">🇮🇳 Kalam (Handwritten Brush)</option>
                        <option value="Tiro Devanagari Hindi">🇮🇳 Tiro Devanagari Hindi (Formal Academic)</option>
                      </optgroup>
                      <optgroup label="🇧🇩 Bengali & Bangla (বাংলা)">
                        <option value="Noto Sans Bengali">🇧🇩 Noto Sans Bengali (Clear Modern)</option>
                        <option value="Noto Serif Bengali">🇧🇩 Noto Serif Bengali (Traditional Literary)</option>
                        <option value="Hind Siliguri">🇧🇩 Hind Siliguri (Clean Editorial Sans)</option>
                        <option value="Galada">🇧🇩 Galada (Bengali Cursive Display)</option>
                        <option value="Atma">🇧🇩 Atma (Charming Display)</option>
                        <option value="Tiro Bangla">🇧🇩 Tiro Bangla (Scholarly Bengali)</option>
                      </optgroup>
                      <optgroup label="🇮🇳 Tamil (தமிழ்)">
                        <option value="Noto Sans Tamil">🇮🇳 Noto Sans Tamil (Clean Sans)</option>
                        <option value="Noto Serif Tamil">🇮🇳 Noto Serif Tamil (Classic Serif)</option>
                        <option value="Mukta Malar">🇮🇳 Mukta Malar (Modern Tamil)</option>
                      </optgroup>
                      <optgroup label="🇮🇷 Persian & Farsi (فارسی)">
                        <option value="Vazirmatn">🇮🇷 Vazirmatn (Modern Persian UI)</option>
                        <option value="Lalezar">🇮🇷 Lalezar (Bold Persian Vintage Poster)</option>
                      </optgroup>
                      <optgroup label="🇷🇺 Russian & Cyrillic (Русский)">
                        <option value="Cormorant Garamond">🇷🇺 Cormorant Garamond (Royal Classical Cyrillic)</option>
                        <option value="Merriweather">🇷🇺 Merriweather (High-Legibility Cyrillic Serif)</option>
                        <option value="Roboto Slab">🇷🇺 Roboto Slab (Modern Slab Serif)</option>
                      </optgroup>
                      <optgroup label="🔤 English, Turkish, Indonesian & European">
                        <option value="Inter">🇬🇧 Inter (Ultra-Clean Global Sans)</option>
                        <option value="Outfit">🇹🇷 Outfit (Sleek Geometric Modern)</option>
                        <option value="Cinzel">👑 Cinzel (Royal Cinematic Classical)</option>
                        <option value="Cinzel Decorative">👑 Cinzel Decorative (Grand Capitals)</option>
                        <option value="Lora">📖 Lora (Contemporary Literary Serif)</option>
                        <option value="Montserrat">⚡ Montserrat (Bold High-Impact Sans)</option>
                        <option value="Playfair Display">✨ Playfair Display (Luxury Editorial Serif)</option>
                        <option value="Space Grotesk">🚀 Space Grotesk (Tech Modernist)</option>
                        <option value="JetBrains Mono">💻 JetBrains Mono (Technical Monospace)</option>
                      </optgroup>
                      <optgroup label="🕌 Arabic & Perso-Arabic Calligraphy">
                        <option value="Amiri">🕌 Amiri (Classical Calligraphic)</option>
                        <option value="Noto Naskh Arabic">📜 Noto Naskh Arabic (Crisp Readable Naskh)</option>
                        <option value="Scheherazade New">🕌 Scheherazade New (Traditional Arabic)</option>
                        <option value="Reem Kufi">🕌 Reem Kufi (Geometric Kufic Modern)</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* 2. FONT SIZE */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">FONT SIZE</span>
                      <span className="font-mono text-cyan-400 font-bold text-xs">{quranEnglishSize}PX</span>
                    </div>
                    <input
                      type="range"
                      id="slider-quran-english-size"
                      min="10"
                      max="60"
                      step="1"
                      value={quranEnglishSize}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 20;
                        setQuranEnglishSize(val);
                        onApplyQuranStyles({ englishSize: val });
                      }}
                      className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* 3. FONT COLOR */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">FONT COLOR</span>
                      <span className="font-mono text-cyan-400 font-bold text-xs uppercase">{quranEnglishColor}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-0.5">
                      {/* Active Color Preview & Picker */}
                      <label
                        className="w-7 h-7 rounded border border-gray-700 cursor-pointer relative shrink-0 shadow-sm flex items-center justify-center transition hover:scale-105"
                        style={{ backgroundColor: quranEnglishColor }}
                        title="Pick custom color"
                      >
                        <input
                          type="color"
                          value={quranEnglishColor}
                          onChange={(e) => {
                            setQuranEnglishColor(e.target.value);
                            onApplyQuranStyles({ englishColor: e.target.value });
                          }}
                          className="opacity-0 w-full h-full cursor-pointer absolute inset-0"
                        />
                      </label>
                      {/* Preset Color Swatches */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {['#FFFFFF', '#E2E8F0', '#FEF3C7', '#FEF08A', '#EC4899', '#06B6D4', '#94A3B8'].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              setQuranEnglishColor(c);
                              onApplyQuranStyles({ englishColor: c });
                            }}
                            className={`w-5 h-5 rounded-full transition-transform hover:scale-125 cursor-pointer border ${
                              quranEnglishColor.toLowerCase() === c.toLowerCase()
                                ? 'ring-2 ring-cyan-400 border-white scale-110'
                                : 'border-transparent opacity-90 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 4. TEXT EFFECT / GLOW */}
                  <div className="space-y-1.5">
                    <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">TEXT EFFECT / GLOW</span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['normal', 'shadow', 'outline', 'neon'] as const).map((styleKey) => (
                        <button
                          key={styleKey}
                          type="button"
                          id={`btn-english-effect-${styleKey}`}
                          onClick={() => {
                            setQuranEnglishStyle(styleKey);
                            onApplyQuranStyles({ englishStyle: styleKey });
                          }}
                          className={`py-2 px-1 text-xs font-semibold rounded-lg transition capitalize border cursor-pointer ${
                            quranEnglishStyle === styleKey
                              ? 'bg-black text-white border-white shadow-md font-bold'
                              : 'bg-[#181822] text-gray-300 hover:text-white hover:bg-gray-800 border-gray-800'
                          }`}
                        >
                          {styleKey}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 5. VERTICAL ALIGNMENT (Y-AXIS) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">VERTICAL ALIGNMENT (Y-AXIS)</span>
                      <span className="font-mono text-cyan-400 font-bold text-xs">{quranEnglishY}%</span>
                    </div>
                    <input
                      type="range"
                      id="slider-quran-english-y"
                      min="10"
                      max="95"
                      step="1"
                      value={quranEnglishY}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 72;
                        setQuranEnglishY(val);
                        onApplyQuranStyles({ englishY: val });
                      }}
                      className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* 6. Capitalize Translation Switch */}
                  <div className="flex items-center justify-between bg-[#0b0b0f] p-3 rounded-lg border border-gray-800">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-white">Capitalize Translation</p>
                      <p className="text-[10px] text-gray-400">Converts English clips to UPPERCASE</p>
                    </div>
                    <button
                      type="button"
                      id="toggle-quran-english-uppercase"
                      onClick={() => {
                        const next = !quranEnglishUppercase;
                        setQuranEnglishUppercase(next);
                        onApplyQuranStyles({ englishUppercase: next });
                      }}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer border ${
                        quranEnglishUppercase ? 'bg-cyan-500 border-cyan-400 justify-end' : 'bg-gray-800 border-gray-700 justify-start'
                      }`}
                    >
                      <span className="bg-black w-4 h-4 rounded-full shadow-md" />
                    </button>
                  </div>

                  {/* 7. Auto Word Wrap Switch */}
                  <div className="flex items-center justify-between bg-[#0b0b0f] p-3 rounded-lg border border-gray-800">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-white">Auto Word Wrap</p>
                      <p className="text-[10px] text-gray-400">Wrap long English text to multiple lines</p>
                    </div>
                    <button
                      type="button"
                      id="toggle-quran-english-wrap"
                      onClick={() => {
                        const next = !quranEnglishWrap;
                        setQuranEnglishWrap(next);
                        onApplyQuranStyles({ englishWrap: next });
                      }}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer border ${
                        quranEnglishWrap ? 'bg-cyan-500 border-cyan-400 justify-end' : 'bg-gray-800 border-gray-700 justify-start'
                      }`}
                    >
                      <span className="bg-black w-4 h-4 rounded-full shadow-md" />
                    </button>
                  </div>

                  {/* 8. MAX LINE WIDTH (CANVAS %) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">MAX LINE WIDTH (CANVAS %)</span>
                      <span className="font-mono text-cyan-400 font-bold text-xs">{quranEnglishMaxWidth}%</span>
                    </div>
                    <input
                      type="range"
                      id="slider-quran-english-max-width"
                      min="40"
                      max="100"
                      step="1"
                      value={quranEnglishMaxWidth}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 85;
                        setQuranEnglishMaxWidth(val);
                        onApplyQuranStyles({ englishMaxWidth: val });
                      }}
                      className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* 9. LINE SPACING (HEIGHT) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">LINE SPACING (HEIGHT)</span>
                      <span className="font-mono text-cyan-400 font-bold text-xs">{quranEnglishLineHeight}X</span>
                    </div>
                    <input
                      type="range"
                      id="slider-quran-english-line-height"
                      min="1.0"
                      max="2.5"
                      step="0.1"
                      value={quranEnglishLineHeight}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 1.3;
                        setQuranEnglishLineHeight(val);
                        onApplyQuranStyles({ englishLineHeight: val });
                      }}
                      className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* 10. TEXT ALIGNMENT */}
                  <div className="space-y-1.5">
                    <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">TEXT ALIGNMENT</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['left', 'center', 'right'] as const).map((alignKey) => (
                        <button
                          key={alignKey}
                          type="button"
                          id={`btn-english-align-${alignKey}`}
                          onClick={() => {
                            setQuranEnglishAlign(alignKey);
                            onApplyQuranStyles({ englishAlign: alignKey });
                          }}
                          className={`py-2 px-2 text-xs font-semibold rounded-lg transition capitalize border cursor-pointer ${
                            quranEnglishAlign === alignKey
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-md font-bold'
                              : 'bg-[#181822] text-gray-300 hover:text-white hover:bg-gray-800 border-gray-800'
                          }`}
                        >
                          {alignKey}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* DUAL TRANSLATION TRACK STYLING & POSITION ADJUSTMENTS (2nd Track / Urdu) */}
                <div className="bg-[#121218] border border-sky-500/30 rounded-xl p-3.5 space-y-3.5 mt-2 shadow-lg">
                  <div className="flex items-center justify-between pb-1 border-b border-gray-800/80">
                    <label className="text-xs font-extrabold text-sky-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Languages className="w-3.5 h-3.5 text-sky-400" />
                      <span>DUAL TRANSLATION ADJUSTMENT (2ND TRACK / URDU)</span>
                    </label>
                    <span className="text-[10px] font-mono bg-sky-950/60 border border-sky-600/40 text-sky-300 px-2 py-0.5 rounded-full font-bold">
                      {quranDualTranslationLang.toUpperCase()}
                    </span>
                  </div>

                  {/* Auto-Separate / Spacing helper button */}
                  <div className="bg-sky-950/30 border border-sky-500/30 rounded-lg p-2.5 flex items-center justify-between gap-2">
                    <div className="text-[11px] text-gray-300 leading-tight">
                      <span className="font-bold text-sky-300 block">Auto-Separate Tracks</span>
                      Automatically prevents English & Urdu captions from overlapping.
                    </div>
                    <button
                      type="button"
                      id="btn-auto-separate-dual-tracks"
                      onClick={() => {
                        if (onAutoSeparateDualTracks) {
                          onAutoSeparateDualTracks();
                        } else {
                          const targetDualY = Math.min(95, quranEnglishY + 14);
                          if (setQuranDualY) setQuranDualY(targetDualY);
                          onApplyQuranStyles({ dualY: targetDualY });
                        }
                      }}
                      className="px-2.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-black font-bold text-[11px] rounded-md transition shadow flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Auto-Separate</span>
                    </button>
                  </div>

                  {/* 1. DUAL FONT FAMILY */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">SECONDARY FONT FAMILY</span>
                      <span className="font-mono text-sky-400 font-bold text-[11px] truncate max-w-[130px]">{quranDualFont}</span>
                    </div>
                    <select
                      id="select-quran-dual-font"
                      value={quranDualFont}
                      onChange={(e) => {
                        const font = e.target.value;
                        if (setQuranDualFont) setQuranDualFont(font);
                        onApplyQuranStyles({ dualFont: font });
                      }}
                      className="w-full bg-[#181822] border border-gray-700/80 rounded-lg px-2.5 py-2 text-xs text-gray-200 focus:outline-none focus:border-sky-500 font-sans"
                    >
                      <optgroup label="Urdu & Nastaleeq (Recommended for Urdu)">
                        <option value="Jameel Noori Nastaleeq">Jameel Noori Nastaleeq (Classic Urdu)</option>
                        <option value="Noto Nastaliq Urdu">Noto Nastaliq Urdu (Google)</option>
                        <option value="Lateef">Lateef (Flowing Indo-Pak)</option>
                        <option value="Gulzar">Gulzar (Ornate Nastaleeq)</option>
                        <option value="Scheherazade New">Scheherazade New</option>
                      </optgroup>
                      <optgroup label="Hindi & Devanagari">
                        <option value="Noto Sans Devanagari">Noto Sans Devanagari</option>
                        <option value="Rozha One">Rozha One</option>
                        <option value="Poppins">Poppins</option>
                      </optgroup>
                      <optgroup label="Bengali & Regional">
                        <option value="Noto Sans Bengali">Noto Sans Bengali</option>
                        <option value="Galada">Galada</option>
                      </optgroup>
                      <optgroup label="English & Latin">
                        <option value="Inter">Inter (Clean Modern)</option>
                        <option value="Outfit">Outfit (Geometric Bold)</option>
                        <option value="Cinzel">Cinzel (Regal Serif)</option>
                        <option value="Montserrat">Montserrat (Modern Sans)</option>
                        <option value="Lora">Lora (Literary Book Serif)</option>
                        <option value="Playfair Display">Playfair Display (High Fashion)</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* 2. DUAL FONT SIZE */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">SECONDARY FONT SIZE</span>
                      <span className="font-mono text-sky-400 font-bold text-xs">{quranDualSize}PX</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        id="slider-quran-dual-size"
                        min="10"
                        max="60"
                        step="1"
                        value={quranDualSize}
                        onChange={(e) => {
                          const size = parseInt(e.target.value) || 18;
                          if (setQuranDualSize) setQuranDualSize(size);
                          onApplyQuranStyles({ dualSize: size });
                        }}
                        className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                      />
                      <span className="text-[11px] font-mono text-gray-400 w-8 text-right">{quranDualSize}px</span>
                    </div>
                  </div>

                  {/* 3. DUAL FONT COLOR */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">SECONDARY FONT COLOR</span>
                      <span className="font-mono text-sky-400 font-bold text-xs uppercase">{quranDualColor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="picker-quran-dual-color"
                        value={quranDualColor}
                        onChange={(e) => {
                          const color = e.target.value;
                          if (setQuranDualColor) setQuranDualColor(color);
                          onApplyQuranStyles({ dualColor: color });
                        }}
                        className="w-8 h-8 rounded-lg border border-gray-700 bg-transparent cursor-pointer p-0.5 shrink-0"
                      />
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {['#E0F2FE', '#FEF08A', '#A7F3D0', '#FFFFFF', '#FBCFE8', '#38BDF8', '#FBBF24'].map((swatch) => (
                          <button
                            key={swatch}
                            type="button"
                            onClick={() => {
                              if (setQuranDualColor) setQuranDualColor(swatch);
                              onApplyQuranStyles({ dualColor: swatch });
                            }}
                            className="w-5 h-5 rounded-md border border-gray-600/70 hover:scale-110 transition shadow cursor-pointer"
                            style={{ backgroundColor: swatch }}
                            title={swatch}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 4. DUAL TEXT EFFECT / GLOW */}
                  <div className="space-y-1.5">
                    <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">TEXT EFFECT / GLOW</span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['normal', 'shadow', 'outline', 'neon'] as const).map((styleKey) => (
                        <button
                          key={styleKey}
                          type="button"
                          id={`btn-dual-style-${styleKey}`}
                          onClick={() => {
                            if (setQuranDualStyle) setQuranDualStyle(styleKey);
                            onApplyQuranStyles({ dualStyle: styleKey });
                          }}
                          className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg transition capitalize border cursor-pointer ${
                            quranDualStyle === styleKey
                              ? 'bg-sky-500/20 text-sky-300 border-sky-400 shadow-md font-bold'
                              : 'bg-[#181822] text-gray-300 hover:text-white hover:bg-gray-800 border-gray-800'
                          }`}
                        >
                          {styleKey}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 5. VERTICAL POSITION (Y-AXIS) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">VERTICAL POSITION (Y-AXIS)</span>
                      <span className="font-mono text-sky-400 font-bold text-xs">{quranDualY}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        id="slider-quran-dual-y"
                        min="10"
                        max="98"
                        step="1"
                        value={quranDualY}
                        onChange={(e) => {
                          const y = parseInt(e.target.value) || 86;
                          if (setQuranDualY) setQuranDualY(y);
                          onApplyQuranStyles({ dualY: y });
                        }}
                        className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                      />
                      <span className="text-[11px] font-mono text-gray-400 w-8 text-right">{quranDualY}%</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      {[
                        { label: 'Top', val: 25 },
                        { label: 'Mid', val: 50 },
                        { label: 'Bottom', val: 86 },
                        { label: 'Sub-Low', val: 92 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            if (setQuranDualY) setQuranDualY(preset.val);
                            onApplyQuranStyles({ dualY: preset.val });
                          }}
                          className={`py-1 text-[10px] font-semibold rounded border cursor-pointer transition ${
                            quranDualY === preset.val
                              ? 'bg-sky-500/20 text-sky-300 border-sky-400 font-bold'
                              : 'bg-[#181822] text-gray-400 border-gray-800 hover:text-white'
                          }`}
                        >
                          {preset.label} ({preset.val}%)
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 6. LINE SPACING (HEIGHT) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">LINE SPACING (HEIGHT)</span>
                      <span className="font-mono text-sky-400 font-bold text-xs">{quranDualLineHeight}X</span>
                    </div>
                    <input
                      type="range"
                      id="slider-quran-dual-line-height"
                      min="1.0"
                      max="2.5"
                      step="0.1"
                      value={quranDualLineHeight}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 1.3;
                        if (setQuranDualLineHeight) setQuranDualLineHeight(val);
                        onApplyQuranStyles({ dualLineHeight: val });
                      }}
                      className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                    />
                  </div>

                  {/* 7. MAX WIDTH & WORD WRAP */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">MAX WIDTH</span>
                        <span className="font-mono text-sky-400 font-bold text-[10px]">{quranDualMaxWidth}%</span>
                      </div>
                      <input
                        type="range"
                        id="slider-quran-dual-max-width"
                        min="40"
                        max="100"
                        step="5"
                        value={quranDualMaxWidth}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 85;
                          if (setQuranDualMaxWidth) setQuranDualMaxWidth(val);
                          onApplyQuranStyles({ dualMaxWidth: val });
                        }}
                        className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase">WORD WRAP</span>
                      <button
                        type="button"
                        id="btn-toggle-dual-wrap"
                        onClick={() => {
                          const val = !quranDualWrap;
                          if (setQuranDualWrap) setQuranDualWrap(val);
                          onApplyQuranStyles({ dualWrap: val });
                        }}
                        className={`w-full py-1.5 px-2 text-xs font-semibold rounded-lg transition border cursor-pointer ${
                          quranDualWrap
                            ? 'bg-sky-500/20 text-sky-300 border-sky-400 font-bold'
                            : 'bg-[#181822] text-gray-400 border-gray-800 hover:text-white'
                        }`}
                      >
                        {quranDualWrap ? 'Wrap ON' : 'Wrap OFF'}
                      </button>
                    </div>
                  </div>

                  {/* 8. TEXT ALIGNMENT */}
                  <div className="space-y-1.5">
                    <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">TEXT ALIGNMENT</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['left', 'center', 'right'] as const).map((alignKey) => (
                        <button
                          key={alignKey}
                          type="button"
                          id={`btn-dual-align-${alignKey}`}
                          onClick={() => {
                            if (setQuranDualAlign) setQuranDualAlign(alignKey);
                            onApplyQuranStyles({ dualAlign: alignKey });
                          }}
                          className={`py-2 px-2 text-xs font-semibold rounded-lg transition capitalize border cursor-pointer ${
                            quranDualAlign === alignKey
                              ? 'bg-sky-500/20 text-sky-300 border-sky-400 shadow-md font-bold'
                              : 'bg-[#181822] text-gray-300 hover:text-white hover:bg-gray-800 border-gray-800'
                          }`}
                        >
                          {alignKey}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 9. APPLY TO ALL DUAL CLIPS */}
                  <button
                    type="button"
                    id="btn-apply-dual-styles-timeline"
                    onClick={() => {
                      onApplyQuranStyles({
                        dualFont: quranDualFont,
                        dualSize: quranDualSize,
                        dualColor: quranDualColor,
                        dualStyle: quranDualStyle,
                        dualY: quranDualY,
                        dualLineHeight: quranDualLineHeight,
                        dualMaxWidth: quranDualMaxWidth,
                        dualWrap: quranDualWrap,
                        dualAlign: quranDualAlign
                      });
                    }}
                    className="w-full py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs rounded-lg transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Apply Style to Dual Track Clips</span>
                  </button>
                </div>

                {/* BLOCK 6: MASTER APPLY ACTION BUTTON */}
                {/* BLOCK 5.5: ANIMATIONS & KEYFRAMING */}
                <div className="bg-[#121218] border border-cyan-500/30 rounded-xl p-3.5 space-y-3.5 mt-2 shadow-lg">
                  <div className="flex items-center justify-between pb-1 border-b border-gray-800/80">
                    <label className="text-xs font-extrabold text-cyan-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>ANIMATIONS & TRANSITIONS</span>
                    </label>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">ENTRANCE ANIMATION</span>
                      <span className="font-mono text-cyan-400 font-bold text-[10px] uppercase truncate max-w-[120px]">{quranAnimationIn}</span>
                    </div>
                    <select
                      value={quranAnimationIn}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (setQuranAnimationIn) setQuranAnimationIn(val);
                        onApplyQuranStyles({ animationIn: val });
                      }}
                      className="w-full bg-[#0a0a0c] border border-cyan-900/50 rounded-lg text-white text-xs px-3 py-2.5 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
                    >
                      <option value="none">None (Instant)</option>
                      <option value="karaoke">🎤 Karaoke Word Glow (Real-Time)</option>
                      <option value="fade">Fade In</option>
                      <option value="pop">Scale Pop</option>
                      <option value="slide-up">Slide Up</option>
                      <option value="slide-down">Slide Down</option>
                      <option value="slide-left">Slide Left</option>
                      <option value="slide-right">Slide Right</option>
                      <option value="typewriter">Typewriter Effect</option>
                      <option value="zoom-in">Zoom In Blur</option>
                      <option value="bounce">Bounce</option>
                    </select>
                  </div>

                  {/* KARAOKE WORD-BY-WORD HIGHLIGHT TOGGLE */}
                  <div className="bg-[#0a0a0e] border border-amber-500/30 rounded-lg p-2.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                          <span>🎤 KARAOKE WORD GLOW</span>
                        </span>
                        <p className="text-[9px] text-gray-400">Highlight each word as recited in real-time</p>
                      </div>
                      <button
                        type="button"
                        id="toggle-karaoke-highlight"
                        onClick={() => {
                          const nextState = !quranKaraokeHighlight;
                          if (setQuranKaraokeHighlight) setQuranKaraokeHighlight(nextState);
                          onApplyQuranStyles({
                            karaokeHighlight: nextState,
                            karaokeColor: quranKaraokeColor,
                            animationIn: nextState ? 'karaoke' : quranAnimationIn
                          });
                        }}
                        className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer border ${
                          quranKaraokeHighlight ? 'bg-amber-500 border-amber-400 justify-end' : 'bg-gray-800 border-gray-700 justify-start'
                        }`}
                      >
                        <span className="bg-black w-3.5 h-3.5 rounded-full shadow-md" />
                      </button>
                    </div>

                    {quranKaraokeHighlight && (
                      <>
                        <div className="flex items-center justify-between pt-1 border-t border-gray-800">
                          <span className="text-[10px] text-gray-300 font-semibold">Highlight Glow Color:</span>
                          <div className="flex items-center gap-1.5">
                            {['#F59E0B', '#10B981', '#06B6D4', '#EC4899', '#FFFFFF'].map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => {
                                  if (setQuranKaraokeColor) setQuranKaraokeColor(color);
                                  onApplyQuranStyles({ karaokeColor: color });
                                }}
                                className={`w-5 h-5 rounded-full border cursor-pointer transition ${
                                  quranKaraokeColor === color ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Audio Sync Offset Calibration for Karaoke Word Glow */}
                        <div className="pt-2 border-t border-gray-800/80 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                              <Timer className="w-3.5 h-3.5 text-amber-400" />
                              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">AUDIO SYNC CALIBRATION</span>
                            </div>
                            <span className="font-mono text-amber-400 font-bold text-[10px]">
                              {quranKaraokeSyncOffsetMs > 0 ? `+${quranKaraokeSyncOffsetMs}ms (Ahead)` : quranKaraokeSyncOffsetMs < 0 ? `${quranKaraokeSyncOffsetMs}ms` : '0ms (Exact)'}
                            </span>
                          </div>
                          <p className="text-[9px] text-gray-400 leading-tight">
                            Agar aawaz pehle aaye to slider aage (+ms) barhaen taake karaoke glow lafzon ke sath bilkul barabar chale.
                          </p>
                          <input
                            type="range"
                            id="slider-karaoke-sync-offset"
                            min="-200"
                            max="600"
                            step="25"
                            value={quranKaraokeSyncOffsetMs}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 0;
                              if (setQuranKaraokeSyncOffsetMs) setQuranKaraokeSyncOffsetMs(val);
                              onApplyQuranStyles({ syncOffsetMs: val });
                            }}
                            className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                          />
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (setQuranKaraokeSyncOffsetMs) setQuranKaraokeSyncOffsetMs(0);
                                onApplyQuranStyles({ syncOffsetMs: 0 });
                              }}
                              className={`px-2 py-0.5 rounded text-[9px] font-medium border cursor-pointer transition ${
                                quranKaraokeSyncOffsetMs === 0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                              }`}
                            >
                              0ms (Exact)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (setQuranKaraokeSyncOffsetMs) setQuranKaraokeSyncOffsetMs(150);
                                onApplyQuranStyles({ syncOffsetMs: 150 });
                              }}
                              className={`px-2 py-0.5 rounded text-[9px] font-medium border cursor-pointer transition ${
                                quranKaraokeSyncOffsetMs === 150 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                              }`}
                            >
                              ⚡ +150ms (Recommended)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (setQuranKaraokeSyncOffsetMs) setQuranKaraokeSyncOffsetMs(300);
                                onApplyQuranStyles({ syncOffsetMs: 300 });
                              }}
                              className={`px-2 py-0.5 rounded text-[9px] font-medium border cursor-pointer transition ${
                                quranKaraokeSyncOffsetMs === 300 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                              }`}
                            >
                              🚀 +300ms (Fast Pace)
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">TRANSITION SPEED</span>
                      <span className="font-mono text-cyan-400 font-bold text-[10px] uppercase">{quranAnimationDuration?.toFixed(1)}s</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="2.0"
                      step="0.1"
                      value={quranAnimationDuration}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (setQuranAnimationDuration) setQuranAnimationDuration(val);
                        onApplyQuranStyles({ animationDuration: val });
                      }}
                      className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>
                </div>

                {/* BLOCK 5.6: TEXT BACKGROUND OVERLAY */}
                <div className="bg-[#121218] border border-fuchsia-500/30 rounded-xl p-3.5 space-y-3.5 mt-2 shadow-lg">
                  <div className="flex items-center justify-between pb-1 border-b border-gray-800/80">
                    <label className="text-xs font-extrabold text-fuchsia-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-fuchsia-400" />
                      <span>TEXT BACKGROUND OVERLAY</span>
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">BACKGROUND STYLE</span>
                      <span className="font-mono text-fuchsia-400 font-bold text-[10px] uppercase truncate max-w-[120px]">{quranBgStyle}</span>
                    </div>
                    <select
                      value={quranBgStyle}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (setQuranBgStyle) setQuranBgStyle(val);
                        if (val === 'strip') {
                          if (setQuranBgOpacity && (!quranBgOpacity || quranBgOpacity < 0.6)) setQuranBgOpacity(0.65);
                          if (setQuranBgRadius && (!quranBgRadius || quranBgRadius < 16)) setQuranBgRadius(20);
                          if (setQuranBgPadding && (!quranBgPadding || quranBgPadding < 16)) setQuranBgPadding(18);
                          onApplyQuranStyles({ bgStyle: val, bgOpacity: 0.65, bgRadius: 20, bgPadding: 18 });
                        } else {
                          onApplyQuranStyles({ bgStyle: val });
                        }
                      }}
                      className="w-full bg-[#0a0a0c] border border-fuchsia-900/50 rounded-lg text-white text-xs px-3 py-2.5 focus:outline-none focus:border-fuchsia-500 transition-colors shadow-inner font-medium"
                    >
                      <option value="none">None (Clear Text)</option>
                      <option value="strip">Full-Width Strip (Quran.com Cinema Card)</option>
                      <option value="box">Rounded Padding Box</option>
                      <option value="glow">Subtle Radial Glow</option>
                    </select>
                  </div>

                  {quranBgStyle === 'strip' && (
                    <div className="p-2.5 rounded-lg bg-fuchsia-950/40 border border-fuchsia-800/40 text-[11px] text-fuchsia-200 flex items-start gap-2">
                      <span className="text-base leading-none mt-0.5">✨</span>
                      <span className="leading-tight"><strong>Quran.com Cinema Mode:</strong> Renders a high-end cinematic translucent dark card with soft drop shadow and subtle 1.2px white border framing across the verse & translation.</span>
                    </div>
                  )}

                  {quranBgStyle !== 'none' && (
                    <>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">OVERLAY COLOR</span>
                          <span className="font-mono text-fuchsia-400 font-bold text-[10px] uppercase">{quranBgColor}</span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={quranBgColor || '#000000'}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (setQuranBgColor) setQuranBgColor(val);
                              onApplyQuranStyles({ bgColor: val });
                            }}
                            className="w-10 h-10 rounded border-none bg-transparent cursor-pointer p-0"
                          />
                          <input
                            type="text"
                            value={quranBgColor || '#000000'}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (setQuranBgColor) setQuranBgColor(val);
                              onApplyQuranStyles({ bgColor: val });
                            }}
                            className="flex-1 bg-[#0a0a0c] border border-fuchsia-900/50 rounded-lg text-white text-xs px-3 focus:outline-none focus:border-fuchsia-500 font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">OPACITY (TRANSPARENCY)</span>
                          <span className="font-mono text-fuchsia-400 font-bold text-[10px] uppercase">{Math.round((quranBgOpacity || 0) * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1.0"
                          step="0.05"
                          value={quranBgOpacity}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (setQuranBgOpacity) setQuranBgOpacity(val);
                            onApplyQuranStyles({ bgOpacity: val });
                          }}
                          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">BACKDROP BLUR</span>
                          <span className="font-mono text-fuchsia-400 font-bold text-[10px] uppercase">{quranBgBlur}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          step="1"
                          value={quranBgBlur}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (setQuranBgBlur) setQuranBgBlur(val);
                            onApplyQuranStyles({ bgBlur: val });
                          }}
                          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">PADDING</span>
                          <span className="font-mono text-fuchsia-400 font-bold text-[10px] uppercase">{quranBgPadding}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="60"
                          step="2"
                          value={quranBgPadding}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (setQuranBgPadding) setQuranBgPadding(val);
                            onApplyQuranStyles({ bgPadding: val });
                          }}
                          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">BORDER RADIUS</span>
                          <span className="font-mono text-fuchsia-400 font-bold text-[10px] uppercase">{quranBgRadius}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="60"
                          step="2"
                          value={quranBgRadius}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (setQuranBgRadius) setQuranBgRadius(val);
                            onApplyQuranStyles({ bgRadius: val });
                          }}
                          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                        />
                      </div>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  id="btn-apply-style-all-quran-clips"
                  onClick={() => onApplyQuranStyles()}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600/90 via-yellow-600/90 to-amber-700/90 hover:from-amber-500 hover:to-yellow-500 text-white font-extrabold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-amber-900/30 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer border border-amber-500/40 mt-1"
                >
                  <Sliders className="w-4 h-4 text-amber-300" />
                  <span>⚡ Apply Style to All Existing Quran Clips</span>
                </button>

                {onRepairQuranSync && (
                  <button
                    type="button"
                    id="btn-snap-quran-speech-silence"
                    onClick={onRepairQuranSync}
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-800/80 via-teal-800/80 to-emerald-900/80 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer border border-emerald-500/30 mt-1"
                    title="Snap & fit all Arabic Ayah text and translations to the active recitation audio waveform, removing any clips squeezed in silence gaps."
                  >
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                    <span>🧲 Snap Captions to Recitation (Fix Silence Gaps)</span>
                  </button>
                )}

                {/* Status Notifications */}
                {aligningStatus?.status === 'success' && (
                  <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-lg p-3 text-center space-y-1">
                    <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Quran Captions Successfully Generated!</span>
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Arabic & English tracks synced to timeline. Click Play on preview to view captions.
                    </p>
                  </div>
                )}

                {aligningStatus?.status === 'error' && (
                  <div className="bg-rose-950/40 border border-rose-500/30 rounded-lg p-3 text-center space-y-1">
                    <p className="text-xs font-bold text-rose-400">
                      Alignment Error
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {aligningStatus.log[aligningStatus.log.length - 1] || 'Unable to process audio.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'background' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border border-emerald-500/20 rounded-xl p-3.5 space-y-2">
              <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                <span>FREE BG PORTAL (DYNAMIC SEARCH)</span>
              </h3>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Download premium, copyright-free high-definition background loops and photos for your video edits. Click items to add them directly to your active timeline video track using safe Tauri asset resolution.
              </p>
            </div>

            {/* Toggle Tabs: Image Background vs Video Background */}
            <div className="flex items-center gap-2 bg-[#16161c] p-1 rounded-xl border border-gray-800">
              <button
                type="button"
                id="tab-bg-video"
                onClick={() => setBgMediaType('video')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  bgMediaType === 'video'
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-[#22222a]'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Video Background</span>
              </button>
              <button
                type="button"
                id="tab-bg-image"
                onClick={() => setBgMediaType('image')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  bgMediaType === 'image'
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-[#22222a]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Image Background</span>
              </button>
            </div>

            {/* Direct Search Bar */}
            <div className="space-y-2.5 bg-[#202026]/50 p-3 rounded-xl border border-gray-800">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  Direct Stock Search (Pexels & Pixabay)
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setStockSourceProvider('auto')}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition ${
                      stockSourceProvider === 'auto' ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:text-white bg-[#1a1a22]'
                    }`}
                  >
                    Both
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockSourceProvider('pexels')}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition ${
                      stockSourceProvider === 'pexels' ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:text-white bg-[#1a1a22]'
                    }`}
                  >
                    Pexels
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockSourceProvider('pixabay')}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition ${
                      stockSourceProvider === 'pixabay' ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:text-white bg-[#1a1a22]'
                    }`}
                  >
                    Pixabay
                  </button>
                </div>
              </div>

              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder={
                      bgMediaType === 'video'
                        ? 'e.g. stars galaxy, rain, clouds, ocean...'
                        : 'e.g. mosque, starry night, sunset, desert...'
                    }
                    value={bgSearchQuery}
                    onChange={(e) => setBgSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearchStockMedia();
                      }
                    }}
                    className="w-full bg-[#15151a] border border-gray-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
                </div>
                <button
                  type="button"
                  onClick={() => handleSearchStockMedia()}
                  disabled={isSearchingStock}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold text-xs rounded-lg flex items-center gap-1 transition shrink-0"
                >
                  {isSearchingStock ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Search className="w-3 h-3" />
                  )}
                  <span>Search</span>
                </button>
              </div>

              {stockSearchNotice && (
                <div className="text-[10px] text-emerald-400 font-medium px-1 flex items-center justify-between">
                  <span>{stockSearchNotice}</span>
                  {stockSearchResults.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setStockSearchResults([])}
                      className="text-gray-500 hover:text-gray-300 text-[9px]"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}

              {/* Direct Web Portal Links */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                {bgMediaType === 'video' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleOpenExternalUrl(`https://www.pexels.com/search/video/${encodeURIComponent(bgSearchQuery || 'background loop')}/`)}
                      className="py-1.5 px-2 bg-[#2d2d38] hover:bg-[#3d3d4c] rounded-md transition text-[10px] text-white flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Browse Pexels</span>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenExternalUrl(`https://pixabay.com/videos/search/${encodeURIComponent(bgSearchQuery || 'background loop')}/`)}
                      className="py-1.5 px-2 bg-[#2d2d38] hover:bg-[#3d3d4c] rounded-md transition text-[10px] text-white flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Browse Pixabay</span>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleOpenExternalUrl(`https://www.pexels.com/search/${encodeURIComponent(bgSearchQuery || 'background')}/`)}
                      className="py-1.5 px-2 bg-[#2d2d38] hover:bg-[#3d3d4c] rounded-md transition text-[10px] text-white flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Browse Pexels</span>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenExternalUrl(`https://pixabay.com/images/search/${encodeURIComponent(bgSearchQuery || 'background')}/`)}
                      className="py-1.5 px-2 bg-[#2d2d38] hover:bg-[#3d3d4c] rounded-md transition text-[10px] text-white flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Browse Pixabay</span>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Live Stock Search Results Grid (if search returned items) */}
            {stockSearchResults.length > 0 && (
              <div className="space-y-2 bg-[#181820] border border-emerald-500/30 rounded-xl p-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Live {stockSourceProvider.toUpperCase()} Results ({stockSearchResults.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAutoAssignStockToTimeline(stockSearchResults)}
                    className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-[10px] rounded-md flex items-center gap-1 transition"
                    title="Distribute media files evenly matching all Ayahs on timeline"
                  >
                    <Layers className="w-3 h-3" />
                    Auto-Assign 1 Per Ayah
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                  {stockSearchResults.map((item, idx) => {
                    const isVid = item.mediaType === 'video';
                    return (
                      <div
                        key={idx}
                        className="bg-[#202028] border border-gray-800 hover:border-emerald-500/50 rounded-lg p-1.5 space-y-1 group transition"
                      >
                        <div className="relative aspect-video rounded bg-black overflow-hidden">
                          {isVid ? (
                            <video
                              src={item.url}
                              className="w-full h-full object-cover"
                              muted
                              loop
                              playsInline
                              onMouseEnter={(e) => e.currentTarget.play()}
                              onMouseLeave={(e) => e.currentTarget.pause()}
                            />
                          ) : (
                            <img
                              src={item.thumbnail || item.url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <span className="absolute top-1 left-1 px-1 py-0.2 bg-black/70 text-emerald-400 rounded text-[8px] font-bold uppercase">
                            {item.source}
                          </span>
                        </div>

                        <p className="text-[10px] text-gray-200 font-medium truncate px-0.5">{item.title}</p>

                        <div className="flex items-center gap-1 pt-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              onAddClip({
                                name: `${item.title || 'Stock'} [${item.source.toUpperCase()}]`,
                                type: ClipType.VIDEO,
                                isImage: !isVid,
                                url: item.url,
                                poster: item.thumbnail,
                                thumbnailUrl: item.thumbnail,
                                fallbackUrl: item.thumbnail,
                                duration: item.duration || 15,
                                sourceStart: 0,
                                sourceDuration: item.duration || 15,
                                playbackRate: 1.0,
                                volume: isVid ? 0 : 1.0
                              });
                              showAddedToast(item.title);
                            }}
                            className="flex-1 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[9px] font-bold flex items-center justify-center gap-1 transition"
                          >
                            <Plus className="w-2.5 h-2.5" />
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadStockMedia(item.downloadUrl || item.url, `${item.title || 'stock'}.${isVid ? 'mp4' : 'jpg'}`)}
                            className="p-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition"
                            title="Download MP4 / JPG to computer"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Keyword Suggestions */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wide px-1">
                Suggested {bgMediaType === 'video' ? 'Video' : 'Image'} Topics
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(bgMediaType === 'video'
                  ? [
                      { label: '🌌 Stars', query: 'stars galaxy universe background' },
                      { label: '🌧️ Rain', query: 'rain water droplets background' },
                      { label: '☁️ Slow Clouds', query: 'clouds timelapse sunset' },
                      { label: '✨ Particles', query: 'golden light particles rays' },
                      { label: '🌊 Waves', query: 'ocean waves turquoise' },
                      { label: '🌲 Dark Forest', query: 'misty forest mountains' },
                      { label: '🕋 Makkah', query: 'makkah madinah kaaba' },
                    ]
                  : [
                      { label: '🕌 Mosque Dome', query: 'mosque dome architecture' },
                      { label: '✨ Night Sky', query: 'starry night galaxy' },
                      { label: '📜 Calligraphy', query: 'quran calligraphy gold' },
                      { label: '🌅 Sunset Peak', query: 'misty mountain sunset' },
                      { label: '🏜️ Desert Dunes', query: 'desert sand dunes' },
                      { label: '🌿 Islamic Art', query: 'islamic geometry pattern' },
                    ]
                ).map((tag) => (
                  <button
                    key={tag.label}
                    onClick={() => {
                      setBgSearchQuery(tag.query);
                      handleSearchStockMedia(tag.query);
                    }}
                    className="text-[10px] bg-[#1a1a22] hover:bg-[#282834] text-gray-300 px-2 py-1 rounded border border-gray-800 hover:border-gray-700 transition cursor-pointer"
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Curated Background Gallery Grid */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  Royalty-Free Stock {bgMediaType === 'video' ? 'Video Loops (Pexels / Pixabay)' : 'Background Photos'}
                </h4>
                <span className="text-[9px] text-emerald-400 font-semibold bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                  Direct CDN
                </span>
              </div>
              <div className="space-y-2">
                {(bgMediaType === 'video'
                  ? [
                      {
                        id: 'bg-stars',
                        name: 'Stars & Galaxy Loop (Video)',
                        url: 'https://videos.pexels.com/video-files/853889/853889-hd_1920_1080_25fps.mp4',
                        duration: 20,
                        thumbnail: '🌌',
                        category: 'Space',
                        source: 'Pexels',
                        isImage: false,
                      },
                      {
                        id: 'bg-rain',
                        name: 'Rain On Water Ripples (Video)',
                        url: 'https://videos.pexels.com/video-files/1409899/1409899-hd_1920_1080_25fps.mp4',
                        duration: 16,
                        thumbnail: '🌧️',
                        category: 'Nature',
                        source: 'Pexels',
                        isImage: false,
                      },
                      {
                        id: 'bg-clouds',
                        name: 'Floating Sunset Clouds Timelapse (Video)',
                        url: 'https://videos.pexels.com/video-files/3015510/3015510-hd_1920_1080_24fps.mp4',
                        duration: 20,
                        thumbnail: '☁️',
                        category: 'Clouds',
                        source: 'Pexels',
                        isImage: false,
                      },
                      {
                        id: 'bg-particles',
                        name: 'Golden Morning Sunbeams (Video)',
                        url: 'https://videos.pexels.com/video-files/3163534/3163534-hd_1920_1080_30fps.mp4',
                        duration: 20,
                        thumbnail: '✨',
                        category: 'VFX',
                        source: 'Pexels',
                        isImage: false,
                      },
                      {
                        id: 'bg-waves',
                        name: 'Ocean Turquoise Waves (Video)',
                        url: 'https://videos.pexels.com/video-files/853889/853889-hd_1920_1080_25fps.mp4',
                        duration: 20,
                        thumbnail: '🌊',
                        category: 'Nature',
                        source: 'Pixabay',
                        isImage: false,
                      },
                      {
                        id: 'bg-waterfall',
                        name: 'Cascading Mountain Forest (Video)',
                        url: 'https://videos.pexels.com/video-files/3015510/3015510-hd_1920_1080_24fps.mp4',
                        duration: 20,
                        thumbnail: '🌲',
                        category: 'Scenic',
                        source: 'Pexels',
                        isImage: false,
                      },
                    ]
                  : [
                      {
                        id: 'bg-img-mosque',
                        name: 'Islamic Mosque Silhouette',
                        url: 'https://images.pexels.com/photos/2087391/pexels-photo-2087391.jpeg?auto=compress&cs=tinysrgb&w=1920',
                        duration: 10,
                        thumbnail: '🕌',
                        category: 'Architecture',
                        source: 'Pexels',
                        isImage: true,
                      },
                      {
                        id: 'bg-img-galaxy',
                        name: 'Deep Space Starry Cosmos',
                        url: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=1920',
                        duration: 10,
                        thumbnail: '🌌',
                        category: 'Cosmos',
                        source: 'Pexels',
                        isImage: true,
                      },
                      {
                        id: 'bg-img-sunset',
                        name: 'Misty Mountain Sunset Glow',
                        url: 'https://images.pexels.com/photos/531756/pexels-photo-531756.jpeg?auto=compress&cs=tinysrgb&w=1920',
                        duration: 10,
                        thumbnail: '🌅',
                        category: 'Nature',
                        source: 'Pexels',
                        isImage: true,
                      },
                      {
                        id: 'bg-img-quran',
                        name: 'Golden Quranic Manuscript',
                        url: 'https://images.pexels.com/photos/38136/pexels-photo-38136.jpeg?auto=compress&cs=tinysrgb&w=1920',
                        duration: 10,
                        thumbnail: '📜',
                        category: 'Islamic Art',
                        source: 'Pexels',
                        isImage: true,
                      },
                      {
                        id: 'bg-img-desert',
                        name: 'Golden Sand Dunes Evening',
                        url: 'https://images.pexels.com/photos/1001435/pexels-photo-1001435.jpeg?auto=compress&cs=tinysrgb&w=1920',
                        duration: 10,
                        thumbnail: '🏜️',
                        category: 'Landscape',
                        source: 'Pexels',
                        isImage: true,
                      },
                      {
                        id: 'bg-img-pattern',
                        name: 'Dark Emerald Geometric Motif',
                        url: 'https://images.pexels.com/photos/1420440/pexels-photo-1420440.jpeg?auto=compress&cs=tinysrgb&w=1920',
                        duration: 10,
                        thumbnail: '🌿',
                        category: 'Pattern',
                        source: 'Pixabay',
                        isImage: true,
                      },
                    ]
                ).map((bg) => (
                  <div
                    key={bg.id}
                    className="group bg-[#202026] hover:bg-[#282830] rounded-lg p-2 flex items-center gap-2.5 border border-transparent hover:border-emerald-800/50 transition cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-slate-800 rounded flex items-center justify-center text-lg relative overflow-hidden shrink-0">
                      {bg.isImage ? (
                        <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                      ) : (
                        bg.thumbnail
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{bg.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] text-emerald-400 bg-emerald-950/40 px-1 py-0.2 rounded uppercase font-mono">{bg.category}</span>
                        <span className="text-[9px] text-teal-300 bg-teal-950/40 px-1 py-0.2 rounded uppercase font-mono">{bg.source}</span>
                        <span className="text-[9px] text-gray-400 font-mono">{bg.isImage ? 'IMAGE' : `${bg.duration}s`}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Direct Download via Proxy to ensure clean CORS download */}
                      <button
                        type="button"
                        onClick={() => downloadStockMedia(bg.url, `${bg.name}.${bg.isImage ? 'jpg' : 'mp4'}`)}
                        className="p-1.5 rounded bg-[#2a2a34] hover:bg-emerald-500 hover:text-black transition text-gray-400 cursor-pointer"
                        title="Download Asset File"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      {/* Add directly to CuteCut timeline using safe Tauri asset URL */}
                      <button
                        onClick={() => {
                          const safeUrl = resolveTauriAssetUrl(bg.url);
                          showAddedToast(bg.name);
                          onAddClip({
                            name: bg.name,
                            type: ClipType.VIDEO,
                            isImage: bg.isImage,
                            url: safeUrl,
                            poster: bg.url,
                            thumbnailUrl: bg.url,
                            fallbackUrl: bg.url,
                            duration: bg.duration,
                            sourceStart: 0,
                            sourceDuration: bg.duration,
                            playbackRate: 1.0,
                            volume: 1.0,
                            filters: {
                              brightness: 100,
                              contrast: 100,
                              saturation: 100,
                              grayscale: 0,
                              sepia: 0,
                              invert: 0,
                              hueRotate: 0,
                              chromaKey: {
                                enabled: false,
                                color: '#00ff00',
                                threshold: 30,
                                smoothness: 10,
                              },
                            },
                          });
                        }}
                        className="p-1.5 rounded bg-[#2a2a34] hover:bg-emerald-500 hover:text-black transition text-white cursor-pointer"
                        title="Add to Editor Timeline"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'watermark' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-amber-500/10 to-yellow-600/10 border border-amber-500/20 rounded-xl p-3.5 space-y-2">
              <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>🛡️ ADD CHANNEL WATERMARK / LOGO</span>
              </h3>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Overlay your YouTube channel emblem, Islamic branding badge, or custom watermark graphic seamlessly onto the video canvas viewport.
              </p>
            </div>

            {/* Toggle Watermark Switch */}
            <div className="bg-[#202026] p-3 rounded-xl border border-gray-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Enable Channel Logo</p>
                <p className="text-[10px] text-gray-400">Display persistent brand overlay on canvas</p>
              </div>
              <input
                id="watermark-toggle"
                type="checkbox"
                checked={watermark?.enabled ?? false}
                onChange={(e) => {
                  if (setWatermark) {
                    setWatermark(prev => ({ ...prev, enabled: e.target.checked }));
                  }
                }}
                className="w-5 h-5 rounded text-amber-500 bg-gray-800 border-gray-700 cursor-pointer accent-amber-500"
              />
            </div>

            {/* Logo Selection & Custom Upload */}
            <div className="space-y-3 bg-[#202026] p-3 rounded-xl border border-gray-800">
              <h4 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                1. Upload Custom Logo or Select Preset
              </h4>

              {/* Custom Upload Button */}
              <label
                htmlFor="watermark-file-upload"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-[#16161c] hover:bg-[#282832] border border-dashed border-gray-700 rounded-lg cursor-pointer text-xs font-semibold text-amber-400 transition"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Custom Logo (.PNG / .SVG)</span>
                <input
                  id="watermark-file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0] && setWatermark) {
                      const file = e.target.files[0];
                      const url = URL.createObjectURL(file);
                      setWatermark(prev => ({ ...prev, url, enabled: true }));
                    }
                  }}
                />
              </label>

              {/* Preset Islamic Logos Grid */}
              <div className="space-y-1.5 pt-2 border-t border-gray-800">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Preset Branding Stamps</span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {[
                    { id: 'wm-bismillah', name: '🕌 Bismillah Badge', url: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=300&auto=format&fit=crop&q=80' },
                    { id: 'wm-crescent', name: '🌙 Gold Crescent', url: 'https://images.unsplash.com/photo-1564121211835-e88c852648ab?w=300&auto=format&fit=crop&q=80' },
                    { id: 'wm-quran', name: '📜 Quranic Medallion', url: 'https://images.unsplash.com/photo-1584282676008-ef0fef197e70?w=300&auto=format&fit=crop&q=80' },
                    { id: 'wm-neon', name: '✨ Neon Glow Emblem', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300&auto=format&fit=crop&q=80' },
                    { id: 'wm-hd', name: '🎥 HD Recitation Seal', url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=300&auto=format&fit=crop&q=80' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        if (setWatermark) {
                          setWatermark(prev => ({ ...prev, url: preset.url, enabled: true }));
                        }
                      }}
                      className={`p-2 rounded-lg border text-left flex items-center gap-2.5 transition ${watermark?.url === preset.url ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-[#16161c] border-gray-800 text-gray-300 hover:border-gray-600'}`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-7 h-7 rounded object-cover border border-amber-500/30" />
                      <span className="text-[10px] font-bold truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Corner Alignment Selection */}
            <div className="space-y-3 bg-[#202026] p-3 rounded-xl border border-gray-800">
              <h4 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                2. Screen Corner Alignment
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { pos: 'top-left', label: '↖️ Top Left' },
                  { pos: 'top-right', label: '↗️ Top Right' },
                  { pos: 'bottom-left', label: '↙️ Bottom Left' },
                  { pos: 'bottom-right', label: '↘️ Bottom Right' },
                ].map(({ pos, label }) => (
                  <button
                    key={pos}
                    onClick={() => {
                      if (setWatermark) {
                        setWatermark(prev => ({ ...prev, position: pos as any }));
                      }
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${watermark?.position === pos ? 'bg-amber-500 text-black border-amber-400' : 'bg-[#16161c] text-gray-300 border-gray-800 hover:text-white'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Transparency & Scale Controls */}
            <div className="space-y-3 bg-[#202026] p-3 rounded-xl border border-gray-800">
              <h4 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                3. Transparency & Size
              </h4>

              {/* Opacity Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>Logo Opacity (Transparency)</span>
                  <span className="font-mono text-amber-400 font-bold">{Math.round((watermark?.opacity ?? 0.8) * 100)}%</span>
                </div>
                <input
                  id="watermark-opacity-slider"
                  type="range"
                  min="10"
                  max="100"
                  value={Math.round((watermark?.opacity ?? 0.8) * 100)}
                  onChange={(e) => {
                    if (setWatermark) {
                      const val = parseInt(e.target.value) / 100;
                      setWatermark(prev => ({ ...prev, opacity: val }));
                    }
                  }}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              {/* Scale Slider */}
              <div className="space-y-1 pt-2 border-t border-gray-800">
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>Logo Size / Scale</span>
                  <span className="font-mono text-amber-400 font-bold">{watermark?.scale ?? 22}%</span>
                </div>
                <input
                  id="watermark-scale-slider"
                  type="range"
                  min="10"
                  max="50"
                  value={watermark?.scale ?? 22}
                  onChange={(e) => {
                    if (setWatermark) {
                      setWatermark(prev => ({ ...prev, scale: parseInt(e.target.value) }));
                    }
                  }}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {addedFeedback && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[#101015]/95 border border-cyan-500/50 text-cyan-200 text-[10px] font-bold tracking-wider uppercase px-4 py-2.5 rounded shadow-[0_4px_25px_rgba(6,182,212,0.35)] flex items-center gap-2 z-[999] backdrop-blur-md animate-bounce">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
          <span>Added "{addedFeedback}" to Timeline</span>
        </div>
      )}
    </div>
  );
}
