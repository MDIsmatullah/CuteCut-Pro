import React, { useState, useEffect } from 'react';
import {
  Save, FolderOpen, Trash2, Clock, Check, X, FileJson, Sparkles,
  Palette, Cloud, CloudUpload, RefreshCw, Plus, Layers, Type, Sliders, Wand2,
  Filter, Flame, Film, BookOpen, Search
} from 'lucide-react';
import { Track, WatermarkSettings, VisualStylePreset, Clip, AyahSymbolStyle } from '../types';
import { UserProfile } from './AuthModal';
import { saveUserStylePreset, getUserStylePresets, deleteUserStylePreset } from '../utils/firebaseConfig';

export interface SavedProjectSession {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  duration: number;
  trackCount: number;
  clipCount: number;
  data: {
    tracks: Track[];
    duration: number;
    zoom: number;
    aspectRatio: '16:9' | '9:16' | '1:1';
    watermark?: WatermarkSettings;
  };
}

interface ProjectSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTracks: Track[];
  currentDuration: number;
  currentZoom: number;
  currentAspectRatio: '16:9' | '9:16' | '1:1';
  watermark?: WatermarkSettings;
  userProfile?: UserProfile | null;
  selectedClip?: Clip | null;
  onLoadProject: (project: SavedProjectSession) => void;
  onApplyStylePreset?: (preset: VisualStylePreset) => void;
}

const PROJECT_STORAGE_KEY = 'cutecut_pro_saved_projects';
const PRESETS_STORAGE_KEY = 'cutecut_user_style_presets';

export type StyleCategoryFilter = 'all' | 'quranic' | 'viral_reels' | 'cinematic';

export function getPresetCategoryType(preset: VisualStylePreset): 'quranic' | 'viral_reels' | 'cinematic' {
  if (preset.category === 'quranic' || preset.category === 'quranic_calligraphy') return 'quranic';
  if (preset.category === 'viral_reels' || preset.category === 'caption_style') return 'viral_reels';
  if (preset.category === 'cinematic' || preset.category === 'relighting_effects' || preset.category === 'full_theme') return 'cinematic';

  // Fallback heuristic based on textStyle, fonts, or name
  const font = (preset.styleConfig?.fontFamily || '').toLowerCase();
  const name = (preset.name || '').toLowerCase();
  const textStyle = (preset.styleConfig?.textStyle || '').toLowerCase();

  if (preset.styleConfig?.relightingStyle || /cinematic|film|lighting|mood|noir|sunset|golden/i.test(name)) {
    return 'cinematic';
  }
  if (textStyle === 'viral-reels' || /reels|tiktok|viral|caption|hype|punchy|shorts/i.test(name) || font.includes('inter') || font.includes('montserrat')) {
    return 'viral_reels';
  }
  if (/amiri|scheherazade|naskh|kufi|cairo|tajawal|quran|ayah|uthmani/i.test(font + ' ' + name)) {
    return 'quranic';
  }
  return 'quranic';
}

export const DEFAULT_STYLE_PRESETS: VisualStylePreset[] = [
  // --- 1. QURANIC PRESETS ---
  {
    id: 'preset-default-uthmani-gold',
    name: 'Royal Uthmani Gold Calligraphy',
    category: 'quranic',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFirestoreSynced: true,
    styleConfig: {
      fontFamily: 'Amiri',
      fontSize: 34,
      color: '#f59e0b',
      textStyle: 'gold-glow',
      textGlowColor: '#fbbf24',
      textGlowIntensity: 25,
      textStrokeColor: '#78350f',
      textStrokeWidth: 2,
      text3D: {
        metallicBorder: true,
        dropShadowBlur: 15,
        depth3D: 6,
        neonGlowColor: '#d97706'
      },
      ayahSymbolStyle: 'ornate-medallion'
    }
  },
  {
    id: 'preset-default-naskh-elegance',
    name: 'Classic Naskh Emerald Theme',
    category: 'quranic',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFirestoreSynced: true,
    styleConfig: {
      fontFamily: 'Noto Naskh Arabic',
      fontSize: 30,
      color: '#10b981',
      textStyle: 'shadow',
      textGlowColor: '#34d399',
      textGlowIntensity: 15,
      textStrokeColor: '#064e3b',
      textStrokeWidth: 2,
      relightingStyle: 'quran-gold',
      relightingIntensity: 70,
      ayahSymbolStyle: 'ornate-brackets'
    }
  },
  {
    id: 'preset-default-cyber-neon',
    name: 'Cyber Neon Quranic Glow',
    category: 'quranic',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFirestoreSynced: true,
    styleConfig: {
      fontFamily: 'Scheherazade New',
      fontSize: 32,
      color: '#22d3ee',
      textStyle: 'neon',
      textGlowColor: '#06b6d4',
      textGlowIntensity: 35,
      textStrokeColor: '#083344',
      textStrokeWidth: 2,
      relightingStyle: 'neon-cyan',
      relightingIntensity: 85,
      ayahSymbolStyle: 'uthmani-circle'
    }
  },
  {
    id: 'preset-default-kufi-minimal',
    name: 'Modern Kufi Slate Minimal',
    category: 'quranic',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFirestoreSynced: true,
    styleConfig: {
      fontFamily: 'Cairo',
      fontSize: 32,
      color: '#f8fafc',
      textStyle: 'outline',
      textGlowColor: '#94a3b8',
      textGlowIntensity: 10,
      textStrokeColor: '#0f172a',
      textStrokeWidth: 3,
      ayahSymbolStyle: 'parentheses'
    }
  },

  // --- 2. VIRAL REELS PRESETS ---
  {
    id: 'preset-default-viral-reels',
    name: 'Viral Reels Bold Captions',
    category: 'viral_reels',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFirestoreSynced: true,
    styleConfig: {
      fontFamily: 'Inter',
      fontSize: 36,
      color: '#ffffff',
      textStyle: 'viral-reels',
      textGlowColor: '#06b6d4',
      textGlowIntensity: 18,
      textStrokeColor: '#000000',
      textStrokeWidth: 4,
      text3D: {
        metallicBorder: false,
        dropShadowBlur: 10,
        depth3D: 4,
        neonGlowColor: '#22d3ee'
      }
    }
  },
  {
    id: 'preset-default-tiktok-punchy-yellow',
    name: 'TikTok Punchy Dynamic Yellow',
    category: 'viral_reels',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFirestoreSynced: true,
    styleConfig: {
      fontFamily: 'Montserrat',
      fontSize: 38,
      color: '#facc15',
      textStyle: 'viral-reels',
      textGlowColor: '#eab308',
      textGlowIntensity: 22,
      textStrokeColor: '#000000',
      textStrokeWidth: 5,
      text3D: {
        metallicBorder: false,
        dropShadowBlur: 12,
        depth3D: 5,
        neonGlowColor: '#ca8a04'
      }
    }
  },
  {
    id: 'preset-default-hype-cyberpunk',
    name: 'Shorts Hype Neon Pink Pop',
    category: 'viral_reels',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFirestoreSynced: true,
    styleConfig: {
      fontFamily: 'Inter',
      fontSize: 35,
      color: '#f43f5e',
      textStyle: 'neon',
      textGlowColor: '#fb7185',
      textGlowIntensity: 30,
      textStrokeColor: '#4c0519',
      textStrokeWidth: 3,
      text3D: {
        metallicBorder: true,
        dropShadowBlur: 14,
        depth3D: 4,
        neonGlowColor: '#e11d48'
      }
    }
  },

  // --- 3. CINEMATIC PRESETS ---
  {
    id: 'preset-default-cinematic-sunset',
    name: 'Cinematic Amber Sunset Mood',
    category: 'cinematic',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFirestoreSynced: true,
    styleConfig: {
      fontFamily: 'Amiri',
      fontSize: 33,
      color: '#fb923c',
      textStyle: 'gold-glow',
      textGlowColor: '#f97316',
      textGlowIntensity: 28,
      textStrokeColor: '#431407',
      textStrokeWidth: 2,
      relightingStyle: 'studio-sunset',
      relightingIntensity: 85,
      text3D: {
        metallicBorder: true,
        dropShadowBlur: 18,
        depth3D: 6,
        neonGlowColor: '#ea580c'
      },
      ayahSymbolStyle: 'ornate-medallion'
    }
  },
  {
    id: 'preset-default-cinematic-neonoir',
    name: 'Cinematic Neo-Noir Teal & Blue',
    category: 'cinematic',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFirestoreSynced: true,
    styleConfig: {
      fontFamily: 'Scheherazade New',
      fontSize: 32,
      color: '#38bdf8',
      textStyle: 'shadow',
      textGlowColor: '#0284c7',
      textGlowIntensity: 20,
      textStrokeColor: '#082f49',
      textStrokeWidth: 2.5,
      relightingStyle: 'neon-cyan',
      relightingIntensity: 90,
      text3D: {
        metallicBorder: false,
        dropShadowBlur: 20,
        depth3D: 5,
        neonGlowColor: '#0369a1'
      },
      ayahSymbolStyle: 'uthmani-circle'
    }
  },
  {
    id: 'preset-default-cinematic-golden-master',
    name: 'Golden Hour Studio Masterpiece',
    category: 'cinematic',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFirestoreSynced: true,
    styleConfig: {
      fontFamily: 'Noto Naskh Arabic',
      fontSize: 34,
      color: '#fef08a',
      textStyle: 'gold-glow',
      textGlowColor: '#eab308',
      textGlowIntensity: 30,
      textStrokeColor: '#713f12',
      textStrokeWidth: 2,
      relightingStyle: 'amber-glow',
      relightingIntensity: 80,
      text3D: {
        metallicBorder: true,
        dropShadowBlur: 16,
        depth3D: 6,
        neonGlowColor: '#ca8a04'
      },
      ayahSymbolStyle: 'ornate-brackets'
    }
  }
];

export const ProjectSaveModal: React.FC<ProjectSaveModalProps> = ({
  isOpen,
  onClose,
  currentTracks,
  currentDuration,
  currentZoom,
  currentAspectRatio,
  watermark,
  userProfile,
  selectedClip,
  onLoadProject,
  onApplyStylePreset,
}) => {
  const [savedProjects, setSavedProjects] = useState<SavedProjectSession[]>([]);
  const [userPresets, setUserPresets] = useState<VisualStylePreset[]>([]);
  const [projectName, setProjectName] = useState('My Video Project');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [presetSaveSuccess, setPresetSaveSuccess] = useState(false);
  const [isSyncingFirestore, setIsSyncingFirestore] = useState(false);
  const [activeTab, setActiveTab] = useState<'save_proj' | 'load_proj' | 'presets'>('save_proj');
  const [presetSubTab, setPresetSubTab] = useState<'library' | 'create'>('library');

  // Category Filter & Search State
  const [presetCategoryFilter, setPresetCategoryFilter] = useState<StyleCategoryFilter>('all');
  const [presetSearchQuery, setPresetSearchQuery] = useState('');

  // New Preset Builder Form state
  const [newPresetName, setNewPresetName] = useState('My Custom Style');
  const [newPresetCategory, setNewPresetCategory] = useState<'quranic' | 'viral_reels' | 'cinematic' | 'full_theme'>('quranic');
  const [builderFontFamily, setBuilderFontFamily] = useState('Amiri');
  const [builderFontSize, setBuilderFontSize] = useState(32);
  const [builderColor, setBuilderColor] = useState('#f59e0b');
  const [builderTextStyle, setBuilderTextStyle] = useState<'normal' | 'shadow' | 'outline' | 'neon' | 'gold-glow' | 'viral-reels'>('gold-glow');
  const [builderGlowColor, setBuilderGlowColor] = useState('#fbbf24');
  const [builderGlowIntensity, setBuilderGlowIntensity] = useState(20);
  const [builderStrokeColor, setBuilderStrokeColor] = useState('#78350f');
  const [builderStrokeWidth, setBuilderStrokeWidth] = useState(2);
  const [builderAyahSymbol, setBuilderAyahSymbol] = useState<AyahSymbolStyle>('ornate-medallion');
  const [builderRelighting, setBuilderRelighting] = useState<'amber-glow' | 'neon-cyan' | 'studio-sunset' | 'quran-gold'>('quran-gold');

  // Sync state from selectedClip if available
  useEffect(() => {
    if (selectedClip && selectedClip.type === 'text') {
      if (selectedClip.fontFamily) setBuilderFontFamily(selectedClip.fontFamily);
      if (selectedClip.fontSize) setBuilderFontSize(selectedClip.fontSize);
      if (selectedClip.color) setBuilderColor(selectedClip.color);
      if (selectedClip.textStyle) setBuilderTextStyle(selectedClip.textStyle);
      if (selectedClip.textGlowColor) setBuilderGlowColor(selectedClip.textGlowColor);
      if (selectedClip.textGlowIntensity !== undefined) setBuilderGlowIntensity(selectedClip.textGlowIntensity);
      if (selectedClip.textStrokeColor) setBuilderStrokeColor(selectedClip.textStrokeColor);
      if (selectedClip.textStrokeWidth !== undefined) setBuilderStrokeWidth(selectedClip.textStrokeWidth);
    }
  }, [selectedClip?.id]);

  // Load saved projects & presets on modal open
  useEffect(() => {
    if (isOpen) {
      // 1. Projects
      try {
        const rawProj = localStorage.getItem(PROJECT_STORAGE_KEY);
        if (rawProj) {
          setSavedProjects(JSON.parse(rawProj));
        }
      } catch (e) {
        console.error('Failed to parse saved projects:', e);
      }

      // 2. Presets (LocalStorage + Firestore profile sync)
      loadAllPresets();
    }
  }, [isOpen, userProfile?.uid]);

  const loadAllPresets = async () => {
    let localList: VisualStylePreset[] = [];
    try {
      const rawPresets = localStorage.getItem(PRESETS_STORAGE_KEY);
      if (rawPresets) {
        localList = JSON.parse(rawPresets);
      }
    } catch (e) {
      console.error('Failed to parse local presets:', e);
    }

    // Merge default presets if local is empty or ensure default presets exist
    if (localList.length === 0) {
      localList = [...DEFAULT_STYLE_PRESETS];
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(localList));
    } else {
      // Ensure all current defaults are present in the list
      const existingIds = new Set(localList.map(p => p.id));
      const missingDefaults = DEFAULT_STYLE_PRESETS.filter(dp => !existingIds.has(dp.id));
      if (missingDefaults.length > 0) {
        localList = [...localList, ...missingDefaults];
        localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(localList));
      }
    }

    // If user is authenticated, fetch Firestore user presets and merge
    if (userProfile?.uid) {
      setIsSyncingFirestore(true);
      try {
        const firestorePresets = await getUserStylePresets(userProfile.uid);
        if (firestorePresets.length > 0) {
          const mergedMap = new Map<string, VisualStylePreset>();
          localList.forEach(p => mergedMap.set(p.id, p));
          firestorePresets.forEach(p => mergedMap.set(p.id, { ...p, isFirestoreSynced: true }));
          const mergedList = Array.from(mergedMap.values());
          setUserPresets(mergedList);
          localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(mergedList));
        } else {
          setUserPresets(localList);
        }
      } catch (err) {
        console.warn('Firestore presets fetch failed:', err);
        setUserPresets(localList);
      } finally {
        setIsSyncingFirestore(false);
      }
    } else {
      setUserPresets(localList);
    }
  };

  if (!isOpen) return null;

  const totalClips = currentTracks.reduce((sum, t) => sum + (t.clips?.length || 0), 0);

  // --- PROJECT SAVING HANDLERS ---
  const handleSaveCurrentProject = () => {
    const now = new Date().toISOString();
    const newSession: SavedProjectSession = {
      id: `proj-${Date.now()}`,
      name: projectName.trim() || 'Untitled Project',
      createdAt: now,
      updatedAt: now,
      duration: currentDuration,
      trackCount: currentTracks.length,
      clipCount: totalClips,
      data: {
        tracks: currentTracks,
        duration: currentDuration,
        zoom: currentZoom,
        aspectRatio: currentAspectRatio,
        watermark: watermark,
      }
    };

    const updated = [newSession, ...savedProjects];
    setSavedProjects(updated);
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(updated));

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleDeleteProject = (id: string) => {
    const updated = savedProjects.filter(p => p.id !== id);
    setSavedProjects(updated);
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(updated));
  };

  const handleExportProjectJSON = (project: SavedProjectSession) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${project.name.replace(/\s+/g, '_')}_cutecut.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // --- USER PRESETS HANDLERS ---
  const handleCreateNewPreset = async () => {
    if (!newPresetName.trim()) return;

    const now = new Date().toISOString();
    const newPreset: VisualStylePreset = {
      id: `preset-${Date.now()}`,
      userId: userProfile?.uid,
      name: newPresetName.trim(),
      category: newPresetCategory,
      createdAt: now,
      updatedAt: now,
      isFirestoreSynced: false,
      styleConfig: {
        fontFamily: builderFontFamily,
        fontSize: builderFontSize,
        color: builderColor,
        textStyle: builderTextStyle,
        textGlowColor: builderGlowColor,
        textGlowIntensity: builderGlowIntensity,
        textStrokeColor: builderStrokeColor,
        textStrokeWidth: builderStrokeWidth,
        ayahSymbolStyle: builderAyahSymbol,
        relightingStyle: builderRelighting,
        watermark: watermark
      }
    };

    // Save locally
    const updatedPresets = [newPreset, ...userPresets];
    setUserPresets(updatedPresets);
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updatedPresets));

    // Save & sync to Firestore profile if user logged in
    if (userProfile?.uid) {
      setIsSyncingFirestore(true);
      await saveUserStylePreset(userProfile.uid, { ...newPreset, isFirestoreSynced: true });
      const syncedUpdated = updatedPresets.map(p => p.id === newPreset.id ? { ...p, isFirestoreSynced: true } : p);
      setUserPresets(syncedUpdated);
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(syncedUpdated));
      setIsSyncingFirestore(false);
    }

    setPresetSaveSuccess(true);
    setTimeout(() => {
      setPresetSaveSuccess(false);
      setPresetSubTab('library');
    }, 1000);
  };

  const handleSyncPresetToFirestore = async (preset: VisualStylePreset) => {
    if (!userProfile?.uid) {
      alert('Please sign in to your Firestore profile to sync custom presets to the cloud!');
      return;
    }

    setIsSyncingFirestore(true);
    await saveUserStylePreset(userProfile.uid, { ...preset, isFirestoreSynced: true });
    const updated = userPresets.map(p => p.id === preset.id ? { ...p, isFirestoreSynced: true } : p);
    setUserPresets(updated);
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updated));
    setIsSyncingFirestore(false);
  };

  const handleDeletePreset = async (id: string) => {
    const updated = userPresets.filter(p => p.id !== id);
    setUserPresets(updated);
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updated));

    if (userProfile?.uid) {
      await deleteUserStylePreset(userProfile.uid, id);
    }
  };

  const handleApplyPreset = (preset: VisualStylePreset) => {
    if (onApplyStylePreset) {
      onApplyStylePreset(preset);
    }
    onClose();
  };

  const handleExportPresetJSON = (preset: VisualStylePreset) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(preset, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${preset.name.replace(/\s+/g, '_')}_preset.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#14141a] border border-[#2e2e3a] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a36] bg-[#181822]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 text-cyan-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>Projects & Style Presets Manager</span>
                {userProfile?.uid && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold flex items-center gap-1">
                    <Cloud className="w-3 h-3 text-cyan-400" />
                    <span>Firestore Synced</span>
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-gray-400">
                Save multi-track timeline states & sync visual style configurations to cloud profile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#252532] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Main Tab Switcher */}
        <div className="flex border-b border-[#2a2a36] bg-[#101016]">
          <button
            onClick={() => setActiveTab('save_proj')}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'save_proj'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>Save Current Project</span>
          </button>
          <button
            onClick={() => setActiveTab('load_proj')}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'load_proj'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Saved Projects ({savedProjects.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'presets'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>User Style Presets ({userPresets.length})</span>
          </button>
        </div>

        {/* Modal Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1">

          {/* TAB 1: Save Current Project */}
          {activeTab === 'save_proj' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Project Session Title</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Surah Al-Fatihah Micro-Sync Video"
                  className="w-full bg-[#1c1c26] border border-[#2d2d3c] rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition font-medium"
                />
              </div>

              {/* Summary Stats Badge */}
              <div className="p-4 rounded-xl bg-[#1a1a24] border border-[#2e2e3e] grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-mono">Tracks</p>
                  <p className="text-base font-black text-cyan-400">{currentTracks.length}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-mono">Clips</p>
                  <p className="text-base font-black text-cyan-400">{totalClips}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-mono">Duration</p>
                  <p className="text-base font-black text-cyan-400">{currentDuration}s</p>
                </div>
              </div>

              {saveSuccess ? (
                <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold flex items-center justify-center gap-2">
                  <Check className="w-5 h-5 text-teal-400" />
                  <span>Project session saved to local workspace!</span>
                </div>
              ) : (
                <button
                  onClick={handleSaveCurrentProject}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Timeline Session to Local Storage</span>
                </button>
              )}
            </div>
          )}

          {/* TAB 2: Load Saved Projects */}
          {activeTab === 'load_proj' && (
            <div className="space-y-3">
              {savedProjects.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-xs space-y-2">
                  <FolderOpen className="w-8 h-8 mx-auto opacity-30 text-cyan-400" />
                  <p>No saved projects found in local workspace.</p>
                  <p className="text-[11px] text-gray-600">Click 'Save Current Project' to save your work.</p>
                </div>
              ) : (
                savedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 rounded-xl bg-[#1a1a24] hover:bg-[#20202e] border border-[#2e2e3e] flex items-center justify-between gap-4 transition group"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{project.name}</h4>
                      <div className="flex items-center gap-3 text-[10px] font-mono text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          {new Date(project.updatedAt).toLocaleDateString()} {new Date(project.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>•</span>
                        <span>{project.data.tracks?.length || 0} Tracks</span>
                        <span>•</span>
                        <span>{project.clipCount} Clips</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          onLoadProject(project);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Load</span>
                      </button>

                      <button
                        onClick={() => handleExportProjectJSON(project)}
                        title="Download JSON Backup"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#2c2c3e] transition cursor-pointer"
                      >
                        <FileJson className="w-4 h-4 text-teal-400" />
                      </button>

                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        title="Delete Saved Project"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: USER STYLE PRESETS (Visual Styles / Quranic Calligraphy / Captions) */}
          {activeTab === 'presets' && (() => {
            const countQuranic = userPresets.filter(p => getPresetCategoryType(p) === 'quranic').length;
            const countViralReels = userPresets.filter(p => getPresetCategoryType(p) === 'viral_reels').length;
            const countCinematic = userPresets.filter(p => getPresetCategoryType(p) === 'cinematic').length;

            const filteredPresets = userPresets.filter(preset => {
              if (presetCategoryFilter !== 'all') {
                const type = getPresetCategoryType(preset);
                if (type !== presetCategoryFilter) return false;
              }

              if (presetSearchQuery.trim()) {
                const query = presetSearchQuery.toLowerCase().trim();
                const nameMatch = preset.name.toLowerCase().includes(query);
                const fontMatch = (preset.styleConfig?.fontFamily || '').toLowerCase().includes(query);
                const styleMatch = (preset.styleConfig?.textStyle || '').toLowerCase().includes(query);
                const categoryMatch = preset.category.toLowerCase().includes(query);
                if (!nameMatch && !fontMatch && !styleMatch && !categoryMatch) return false;
              }

              return true;
            });

            return (
              <div className="space-y-4">
                
                {/* Presets Sub-Header / View Switcher */}
                <div className="flex items-center justify-between border-b border-[#282836] pb-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPresetSubTab('library')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        presetSubTab === 'library'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                          : 'text-gray-400 hover:text-white hover:bg-[#1d1d28]'
                      }`}
                    >
                      <Palette className="w-3.5 h-3.5 text-amber-400" />
                      <span>Preset Library ({userPresets.length})</span>
                    </button>
                    <button
                      onClick={() => setPresetSubTab('create')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        presetSubTab === 'create'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                          : 'text-gray-400 hover:text-white hover:bg-[#1d1d28]'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Create Custom Preset</span>
                    </button>
                  </div>

                  {userProfile?.uid && (
                    <button
                      onClick={loadAllPresets}
                      disabled={isSyncingFirestore}
                      title="Reload & Sync with Firestore Profile"
                      className="flex items-center gap-1.5 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 transition cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncingFirestore ? 'animate-spin' : ''}`} />
                      <span>Sync Cloud Profile</span>
                    </button>
                  )}
                </div>

                {/* SUB-TAB A: PRESET LIBRARY */}
                {presetSubTab === 'library' && (
                  <div className="space-y-3.5">
                    
                    {/* STYLE CATEGORY FILTER BAR */}
                    <div className="p-2.5 rounded-xl bg-[#13131d] border border-[#262638] flex flex-wrap items-center justify-between gap-2.5 shadow-inner">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400 mr-1 shrink-0">
                          <Filter className="w-3.5 h-3.5 text-amber-400" />
                          <span>Style Category:</span>
                        </div>

                        {/* All */}
                        <button
                          onClick={() => setPresetCategoryFilter('all')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            presetCategoryFilter === 'all'
                              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md shadow-amber-500/20 font-black'
                              : 'bg-[#1b1b28] text-gray-300 hover:text-white hover:bg-[#252538] border border-[#2a2a3e]'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>All</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            presetCategoryFilter === 'all' ? 'bg-black/25 text-black font-extrabold' : 'bg-black/40 text-gray-400'
                          }`}>
                            {userPresets.length}
                          </span>
                        </button>

                        {/* Quranic Filter */}
                        <button
                          onClick={() => setPresetCategoryFilter('quranic')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            presetCategoryFilter === 'quranic'
                              ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-md shadow-amber-500/10 font-black'
                              : 'bg-[#1b1b28] text-gray-300 hover:text-amber-300 hover:bg-[#252538] border border-[#2a2a3e]'
                          }`}
                        >
                          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                          <span>Quranic</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            presetCategoryFilter === 'quranic' ? 'bg-amber-400/20 text-amber-300' : 'bg-black/40 text-gray-400'
                          }`}>
                            {countQuranic}
                          </span>
                        </button>

                        {/* Viral Reels Filter */}
                        <button
                          onClick={() => setPresetCategoryFilter('viral_reels')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            presetCategoryFilter === 'viral_reels'
                              ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-500/10 font-black'
                              : 'bg-[#1b1b28] text-gray-300 hover:text-cyan-300 hover:bg-[#252538] border border-[#2a2a3e]'
                          }`}
                        >
                          <Flame className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Viral Reels</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            presetCategoryFilter === 'viral_reels' ? 'bg-cyan-400/20 text-cyan-300' : 'bg-black/40 text-gray-400'
                          }`}>
                            {countViralReels}
                          </span>
                        </button>

                        {/* Cinematic Filter */}
                        <button
                          onClick={() => setPresetCategoryFilter('cinematic')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            presetCategoryFilter === 'cinematic'
                              ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50 shadow-md shadow-rose-500/10 font-black'
                              : 'bg-[#1b1b28] text-gray-300 hover:text-rose-300 hover:bg-[#252538] border border-[#2a2a3e]'
                          }`}
                        >
                          <Film className="w-3.5 h-3.5 text-rose-400" />
                          <span>Cinematic</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            presetCategoryFilter === 'cinematic' ? 'bg-rose-400/20 text-rose-300' : 'bg-black/40 text-gray-400'
                          }`}>
                            {countCinematic}
                          </span>
                        </button>
                      </div>

                      {/* Search Filter Box */}
                      <div className="relative min-w-[140px] max-w-[200px]">
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search styles..."
                          value={presetSearchQuery}
                          onChange={(e) => setPresetSearchQuery(e.target.value)}
                          className="w-full bg-[#181824] border border-[#2c2c3e] rounded-lg pl-8 pr-7 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                        />
                        {presetSearchQuery && (
                          <button
                            onClick={() => setPresetSearchQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Presets List Rendering */}
                    {userPresets.length === 0 ? (
                      <div className="py-10 text-center text-gray-500 text-xs space-y-2">
                        <Sparkles className="w-8 h-8 mx-auto opacity-30 text-amber-400" />
                        <p>No visual style presets created yet.</p>
                        <p className="text-[11px] text-gray-600">Click 'Create Custom Preset' or select built-in styles below.</p>
                      </div>
                    ) : filteredPresets.length === 0 ? (
                      <div className="py-10 text-center text-gray-400 text-xs space-y-3 bg-[#151520] rounded-xl border border-[#262636] p-6">
                        <Filter className="w-7 h-7 mx-auto opacity-40 text-amber-400" />
                        <p className="font-semibold text-gray-300">No presets match the selected filter or search.</p>
                        <div className="flex items-center justify-center gap-2 pt-1">
                          <button
                            onClick={() => {
                              setPresetCategoryFilter('all');
                              setPresetSearchQuery('');
                            }}
                            className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30 transition cursor-pointer"
                          >
                            Reset Filter to All
                          </button>
                          <button
                            onClick={() => {
                              if (presetCategoryFilter !== 'all') {
                                setNewPresetCategory(presetCategoryFilter);
                              }
                              setPresetSubTab('create');
                            }}
                            className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold hover:bg-cyan-500/30 transition cursor-pointer"
                          >
                            Create in this Category
                          </button>
                        </div>
                      </div>
                    ) : (
                      filteredPresets.map((preset) => {
                        const cfg = preset.styleConfig;
                        const catType = getPresetCategoryType(preset);

                        const badgeConfig = catType === 'quranic'
                          ? { label: '🕌 Quranic', style: 'bg-amber-500/20 text-amber-300 border-amber-500/30' }
                          : catType === 'viral_reels'
                          ? { label: '⚡ Viral Reels', style: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' }
                          : { label: '🎬 Cinematic', style: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };

                        return (
                          <div
                            key={preset.id}
                            className="p-4 rounded-xl bg-[#181822] hover:bg-[#1e1e2c] border border-[#2c2c3e] transition space-y-3 group"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-xs font-extrabold text-white">{preset.name}</h4>
                                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${badgeConfig.style}`}>
                                    {badgeConfig.label}
                                  </span>
                                  {preset.isFirestoreSynced ? (
                                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
                                      <Cloud className="w-2.5 h-2.5 text-teal-400" />
                                      <span>Synced</span>
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-400">
                                      Local
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-gray-400 font-mono mt-1">
                                  Updated: {new Date(preset.updatedAt).toLocaleDateString()}
                                </p>
                              </div>

                              {/* Preset Actions */}
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => handleApplyPreset(preset)}
                                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
                                >
                                  <Wand2 className="w-3.5 h-3.5" />
                                  <span>Apply Style</span>
                                </button>

                                {userProfile?.uid && !preset.isFirestoreSynced && (
                                  <button
                                    onClick={() => handleSyncPresetToFirestore(preset)}
                                    title="Sync to Firestore Profile"
                                    className="p-1.5 rounded-lg text-cyan-400 hover:text-white hover:bg-cyan-500/20 transition cursor-pointer"
                                  >
                                    <CloudUpload className="w-4 h-4" />
                                  </button>
                                )}

                                <button
                                  onClick={() => handleExportPresetJSON(preset)}
                                  title="Download Preset JSON"
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#2b2b3d] transition cursor-pointer"
                                >
                                  <FileJson className="w-4 h-4 text-teal-400" />
                                </button>

                                <button
                                  onClick={() => handleDeletePreset(preset.id)}
                                  title="Delete Preset"
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Live Visual Mini Swatch Box */}
                            <div className="p-3 rounded-lg bg-[#111118] border border-[#252535] flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 text-xs">
                                <span
                                  className="inline-block w-4 h-4 rounded-full border border-white/20 shrink-0"
                                  style={{ backgroundColor: cfg.color || '#f59e0b' }}
                                />
                                <div className="font-mono text-[11px] text-gray-300">
                                  <span className="font-bold text-white">{cfg.fontFamily || 'Amiri'}</span> • {cfg.fontSize || 32}px •{' '}
                                  <span className="text-amber-400 uppercase">{cfg.textStyle || 'normal'}</span>
                                  {cfg.relightingStyle && (
                                    <span className="ml-1.5 text-rose-400 uppercase text-[9px] px-1 rounded bg-rose-500/10 border border-rose-500/20">
                                      {cfg.relightingStyle}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Rendered Arabic/English Sample */}
                              <div
                                className="text-right truncate max-w-[240px] font-bold"
                                style={{
                                  fontFamily: cfg.fontFamily || 'Amiri',
                                  color: cfg.color || '#f59e0b',
                                  textShadow: cfg.textStyle === 'gold-glow'
                                    ? `0 0 ${cfg.textGlowIntensity || 20}px ${cfg.textGlowColor || '#fbbf24'}`
                                    : cfg.textStyle === 'neon'
                                    ? `0 0 15px ${cfg.textGlowColor || '#22d3ee'}`
                                    : 'none',
                                  WebkitTextStroke: cfg.textStrokeWidth
                                    ? `${cfg.textStrokeWidth}px ${cfg.textStrokeColor || '#000000'}`
                                    : 'none'
                                }}
                              >
                                {catType === 'viral_reels' ? 'VIRAL REELS ⚡' : 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ'}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* SUB-TAB B: CREATE CUSTOM PRESET BUILDER */}
                {presetSubTab === 'create' && (
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-300 text-xs flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span>Configure your custom Quranic calligraphy & caption style theme</span>
                      </span>
                      {selectedClip?.type === 'text' && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-500/30">
                          Auto-filled from selected clip!
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-300 mb-1">Preset Title</label>
                        <input
                          type="text"
                          value={newPresetName}
                          onChange={(e) => setNewPresetName(e.target.value)}
                          placeholder="e.g. Royal Emerald Calligraphy"
                          className="w-full bg-[#1c1c26] border border-[#2d2d3c] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-300 mb-1">Style Category</label>
                        <select
                          value={newPresetCategory}
                          onChange={(e: any) => setNewPresetCategory(e.target.value)}
                          className="w-full bg-[#1c1c26] border border-[#2d2d3c] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                        >
                          <option value="quranic">🕌 Quranic Calligraphy Theme</option>
                          <option value="viral_reels">⚡ Viral Reels & Captions</option>
                          <option value="cinematic">🎬 Cinematic & Mood Relighting</option>
                          <option value="full_theme">🎨 Full Visual Theme</option>
                        </select>
                      </div>
                    </div>

                    {/* Typography & Style Settings */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-[#181822] border border-[#2b2b3c]">
                      <div>
                        <label className="block text-[10px] text-gray-400 font-mono mb-1">Font Family</label>
                        <select
                          value={builderFontFamily}
                          onChange={(e) => setBuilderFontFamily(e.target.value)}
                          className="w-full bg-[#12121a] border border-[#2a2a3a] rounded px-2 py-1.5 text-xs text-white"
                        >
                          <option value="Amiri">Amiri (Classical Uthmani)</option>
                          <option value="Scheherazade New">Scheherazade New</option>
                          <option value="Noto Naskh Arabic">Noto Naskh Arabic</option>
                          <option value="Reem Kufi">Reem Kufi</option>
                          <option value="Cairo">Cairo (Modern Kufi)</option>
                          <option value="Tajawal">Tajawal</option>
                          <option value="Inter">Inter (Clean Reels)</option>
                          <option value="Montserrat">Montserrat (Bold Header)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-gray-400 font-mono mb-1">Text Style Effect</label>
                        <select
                          value={builderTextStyle}
                          onChange={(e: any) => setBuilderTextStyle(e.target.value)}
                          className="w-full bg-[#12121a] border border-[#2a2a3a] rounded px-2 py-1.5 text-xs text-white"
                        >
                          <option value="gold-glow">Gold Metallic Glow</option>
                          <option value="neon">Cyber Neon Glow</option>
                          <option value="viral-reels">Viral Reels Pop</option>
                          <option value="shadow">Drop Shadow</option>
                          <option value="outline">Heavy Stroke Outline</option>
                          <option value="normal">Clean Normal</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-gray-400 font-mono mb-1">Ayah End Symbol</label>
                        <select
                          value={builderAyahSymbol}
                          onChange={(e: any) => setBuilderAyahSymbol(e.target.value)}
                          className="w-full bg-[#12121a] border border-[#2a2a3a] rounded px-2 py-1.5 text-xs text-white"
                        >
                          <option value="ornate-medallion">Ornate Medallion (۝)</option>
                          <option value="uthmani-circle">Uthmani Circle (⊙)</option>
                          <option value="ornate-brackets">Ornate Brackets (﴾﴿)</option>
                          <option value="parentheses">Parentheses (())</option>
                          <option value="none">None</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-gray-400 font-mono mb-1">Font Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={builderColor}
                            onChange={(e) => setBuilderColor(e.target.value)}
                            className="w-7 h-7 rounded border-none bg-transparent cursor-pointer"
                          />
                          <span className="text-xs font-mono text-gray-300">{builderColor}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-gray-400 font-mono mb-1">Glow Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={builderGlowColor}
                            onChange={(e) => setBuilderGlowColor(e.target.value)}
                            className="w-7 h-7 rounded border-none bg-transparent cursor-pointer"
                          />
                          <span className="text-xs font-mono text-gray-300">{builderGlowColor}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-gray-400 font-mono mb-1">Glow Intensity ({builderGlowIntensity}px)</label>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={builderGlowIntensity}
                          onChange={(e) => setBuilderGlowIntensity(parseInt(e.target.value))}
                          className="w-full accent-cyan-400"
                        />
                      </div>
                    </div>

                    {/* Interactive Real-Time Sample Preview Box */}
                    <div className="p-4 rounded-xl bg-gradient-to-b from-[#0f0f15] to-[#14141f] border border-cyan-500/30 text-center space-y-2">
                      <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Interactive Calligraphy Live Preview</p>
                      <div
                        className="py-3 text-2xl font-bold transition-all duration-200"
                        style={{
                          fontFamily: builderFontFamily,
                          color: builderColor,
                          textShadow: builderTextStyle === 'gold-glow'
                            ? `0 0 ${builderGlowIntensity}px ${builderGlowColor}`
                            : builderTextStyle === 'neon'
                            ? `0 0 ${builderGlowIntensity}px ${builderGlowColor}`
                            : 'none',
                          WebkitTextStroke: builderStrokeWidth ? `${builderStrokeWidth}px ${builderStrokeColor}` : 'none'
                        }}
                      >
                        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ۝
                      </div>
                    </div>

                    {presetSaveSuccess ? (
                      <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold text-center flex items-center justify-center gap-2">
                        <Check className="w-4 h-4 text-teal-400" />
                        <span>Custom style preset saved & synced to profile!</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleCreateNewPreset}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Preset to Profile & Local Library</span>
                      </button>
                    )}
                  </div>
                )}

              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
};

export default ProjectSaveModal;
