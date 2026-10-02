import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Scissors,
  Film,
  Music,
  Type,
  Layers,
  Wand2,
  Brain,
  Play,
  Plus,
  FolderOpen,
  ArrowRight,
  CheckCircle2,
  Crown,
  Cloud,
  Layout,
  Sliders,
  Share2,
  Video,
  Mic,
  Palette,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  Globe,
  Radio,
  Download,
  BookOpen,
  Coffee,
  Monitor,
  Apple,
  Terminal,
  Package,
  Check,
  Smartphone,
  Youtube,
  Trash2,
  RotateCw,
  Search,
  Grid,
  List,
  Clock,
  HardDrive,
  Copy,
  LogOut,
  Maximize2,
  Volume2,
  VolumeX,
  Pause,
  FileText,
  Info,
  Mail,
  Lock,
  Menu,
  X
} from 'lucide-react';
import { UserProfile } from './AuthModal';
import { SavedProjectSession } from './ProjectSaveModal';
import { fetchLatestRelease, fallbackReleaseInfo, ReleaseInfo } from '../utils/releaseService';
import { getUserNamedProjects, deleteUserNamedProject } from '../utils/firebaseConfig';
import { ProLicenseService } from '../services/proLicenseService';
import LegalPagesModal, { LegalTab } from './legal/LegalPagesModal';
import { PWAInstallButton } from './PWAInstallButton';

export interface LandingPortalProps {
  user: UserProfile | null;
  onOpenEditor: (aspectRatio?: '16:9' | '9:16' | '1:1') => void;
  onOpenAuth: () => void;
  onOpenProjectModal: () => void;
  onLoadTemplate: (templateId: string) => void;
  recentProjects?: SavedProjectSession[];
  onLoadProject?: (project: SavedProjectSession) => void;
  onOpenAiPromptStudio?: () => void;
  onOpenVeoAnimate?: () => void;
  onOpenQuranStudio?: () => void;
  onOpenGeminiIntelligence?: () => void;
  onOpenSoraPhoto?: () => void;
  onSignOut?: () => void;
  onDirectGoogleSignIn?: () => void;
  onOpenPreferences?: () => void;
}

const PROJECT_STORAGE_KEY = 'cutecut_pro_saved_projects';

// Sample starter template projects if the user has no saved projects yet
const STARTER_SAMPLE_PROJECTS: SavedProjectSession[] = [
  {
    id: 'starter_quran_al_mulk',
    name: '0211 (1) — Surah Al-Mulk 4K Reel',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    duration: 15,
    trackCount: 4,
    clipCount: 8,
    data: {
      tracks: [],
      duration: 15,
      zoom: 35,
      aspectRatio: '9:16'
    }
  },
  {
    id: 'starter_cinematic_nature',
    name: '0211 (2) — Cinematic Nature Documentary',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    duration: 30,
    trackCount: 3,
    clipCount: 6,
    data: {
      tracks: [],
      duration: 30,
      zoom: 30,
      aspectRatio: '16:9'
    }
  },
  {
    id: 'starter_viral_shorts',
    name: '0211 (3) — AI Script Viral Short',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    duration: 20,
    trackCount: 3,
    clipCount: 5,
    data: {
      tracks: [],
      duration: 20,
      zoom: 35,
      aspectRatio: '9:16'
    }
  },
  {
    id: 'starter_square_promo',
    name: '0211 (4) — Islamic Calligraphy Promo',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    duration: 25,
    trackCount: 3,
    clipCount: 7,
    data: {
      tracks: [],
      duration: 25,
      zoom: 35,
      aspectRatio: '1:1'
    }
  }
];

export interface CapCutTemplate {
  id: string;
  title: string;
  category: 'all' | 'quran' | 'viral' | 'podcast' | 'cinematic';
  categoryLabel: string;
  source: 'Pexels' | 'Pixabay';
  sourceBadge: string;
  videoUrl: string;
  thumbnailUrl: string;
  aspectRatio: '9:16' | '16:9' | '1:1';
  duration: number;
  description: string;
  badge: 'Trending' | 'Popular' | 'Hot' | 'Free' | 'Pro';
  badgeColor: string;
  gradient: string;
  accentColor: string;
  stats: { uses: string; likes: string };
  highlights: string[];
}

export const CAPCUT_PRESET_TEMPLATES: CapCutTemplate[] = [
  {
    id: 'tpl-quran-reels',
    title: 'Surah Al-Mulk 4K Islamic Reel',
    category: 'quran',
    categoryLabel: 'Quran & Islamic',
    source: 'Pexels',
    sourceBadge: 'Pexels 4K Video',
    videoUrl: 'https://videos.pexels.com/video-files/853889/853889-hd_1920_1080_25fps.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=400',
    aspectRatio: '9:16',
    duration: 30,
    description: 'Gold Uthmanic Arabic Calligraphy, English translation, dynamic audio waveforms, and 4K Pexels starry galaxy time-lapse.',
    badge: 'Trending',
    badgeColor: 'bg-emerald-500 text-white',
    gradient: 'from-emerald-950 via-[#10241b] to-[#0a1410]',
    accentColor: 'text-emerald-400',
    stats: { uses: '48.2K', likes: '12.4K' },
    highlights: ['Pexels 4K Starry Sky', 'Uthmanic Arabic Script', 'Mishari Rashid Audio', 'Live Waveform']
  },
  {
    id: 'tpl-surah-yasin',
    title: 'Surah Yasin Full Landscape YouTube',
    category: 'quran',
    categoryLabel: 'Quran & Islamic',
    source: 'Pixabay',
    sourceBadge: 'Pixabay 4K Video',
    videoUrl: 'https://cdn.pixabay.com/video/2020/05/25/40131-424759600_large.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=400',
    aspectRatio: '16:9',
    duration: 60,
    description: 'Full-screen 16:9 YouTube documentary landscape with dual-language subtitles and Pixabay deep space milky way footage.',
    badge: 'Popular',
    badgeColor: 'bg-cyan-500 text-black',
    gradient: 'from-cyan-950 via-[#102028] to-[#081216]',
    accentColor: 'text-cyan-400',
    stats: { uses: '36.5K', likes: '8.9K' },
    highlights: ['Pixabay 4K Milky Way', 'YouTube 16:9 4K', 'Dual Subtitles', 'Deep Space Nebula']
  },
  {
    id: 'tpl-ocean-sunset',
    title: 'Peaceful Ocean Waves & Ayah Reflection',
    category: 'quran',
    categoryLabel: 'Quran & Islamic',
    source: 'Pixabay',
    sourceBadge: 'Pixabay 4K Video',
    videoUrl: 'https://cdn.pixabay.com/video/2016/08/21/4847-180860541_large.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=400',
    aspectRatio: '9:16',
    duration: 30,
    description: 'Pixabay royalty-free 4K crystal ocean waves at golden hour with heartfelt Quran recitation and glowing white calligraphy.',
    badge: 'Trending',
    badgeColor: 'bg-amber-400 text-black',
    gradient: 'from-amber-950 via-[#261d10] to-[#120e06]',
    accentColor: 'text-amber-400',
    stats: { uses: '62.4K', likes: '18.1K' },
    highlights: ['Pixabay 4K Ocean Waves', 'Golden Hour Lighting', 'Peaceful Reflection', 'Synced Subtitles']
  },
  {
    id: 'tpl-cinematic-documentary',
    title: 'Misty Pine Forest & Sunlight Documentary',
    category: 'cinematic',
    categoryLabel: 'Cinematic',
    source: 'Pexels',
    sourceBadge: 'Pexels 4K Video',
    videoUrl: 'https://videos.pexels.com/video-files/3015510/3015510-hd_1920_1080_24fps.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/15286/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400',
    aspectRatio: '16:9',
    duration: 45,
    description: 'Slow cinematic Ken Burns camera drift through Pexels green pine forest sunbeams, atmospheric strings, and filmic letterbox bars.',
    badge: 'Pro',
    badgeColor: 'bg-gradient-to-r from-amber-400 to-orange-500 text-black',
    gradient: 'from-emerald-950 via-[#142c1c] to-[#0a160e]',
    accentColor: 'text-emerald-400',
    stats: { uses: '19.4K', likes: '4.2K' },
    highlights: ['Pexels 4K Forest Sunbeams', 'Slow Motion Ken Burns', 'Ambient Audio', 'Filmic 2.35:1 Bars']
  },
  {
    id: 'tpl-desert-dunes',
    title: 'Golden Desert Dunes Sunset Reel',
    category: 'quran',
    categoryLabel: 'Quran & Islamic',
    source: 'Pixabay',
    sourceBadge: 'Pixabay 4K Video',
    videoUrl: 'https://cdn.pixabay.com/video/2021/04/19/71542-539075726_large.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=400',
    aspectRatio: '9:16',
    duration: 25,
    description: 'Breathtaking Pixabay 4K footage of rolling desert sand dunes under purple twilight with surah contemplation.',
    badge: 'Hot',
    badgeColor: 'bg-orange-500 text-white',
    gradient: 'from-orange-950 via-[#2c140a] to-[#160804]',
    accentColor: 'text-orange-400',
    stats: { uses: '41.2K', likes: '11.5K' },
    highlights: ['Pixabay 4K Desert Dunes', 'Sunset Color Grading', 'Islamic Reflection', 'Full Mobile 9:16']
  },
  {
    id: 'tpl-viral-captions',
    title: 'Alex Hormozi Style Kinetic Captions',
    category: 'viral',
    categoryLabel: 'Viral Shorts',
    source: 'Pexels',
    sourceBadge: 'Pexels 4K Video',
    videoUrl: 'https://videos.pexels.com/video-files/3163534/3163534-hd_1920_1080_30fps.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=400',
    aspectRatio: '9:16',
    duration: 15,
    description: 'Bold yellow pop-up word animations, high-energy pacing, punch-in cuts, and Pexels deep space particles motion background.',
    badge: 'Hot',
    badgeColor: 'bg-amber-400 text-black',
    gradient: 'from-amber-950 via-[#261d10] to-[#120e06]',
    accentColor: 'text-amber-400',
    stats: { uses: '105K', likes: '34.8K' },
    highlights: ['Pexels 4K Dynamic Motion', 'Kinetic Typography', 'High-Converting Pacing', 'Sound Markers']
  },
  {
    id: 'tpl-podcast-clip',
    title: 'Podcast Clip with Audio Waveform',
    category: 'podcast',
    categoryLabel: 'Podcast',
    source: 'Pixabay',
    sourceBadge: 'Pixabay 4K Video',
    videoUrl: 'https://cdn.pixabay.com/video/2019/04/16/22880-330689947_large.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg?auto=compress&cs=tinysrgb&w=400',
    aspectRatio: '9:16',
    duration: 30,
    description: 'Pixabay ambient studio motion with real-time responsive circular and bar audio frequency visualizers, subtitles, and progress bar.',
    badge: 'Trending',
    badgeColor: 'bg-purple-500 text-white',
    gradient: 'from-purple-950 via-[#20102e] to-[#100816]',
    accentColor: 'text-purple-400',
    stats: { uses: '22.1K', likes: '5.6K' },
    highlights: ['Pixabay 4K Ambient Motion', 'Circular Waveform', 'Dual Speaker Layout', 'Clean Captions']
  },
  {
    id: 'tpl-islamic-quote',
    title: 'Hadith & Islamic Quote Post',
    category: 'quran',
    categoryLabel: 'Quran & Islamic',
    source: 'Pexels',
    sourceBadge: 'Pexels 4K Video',
    videoUrl: 'https://videos.pexels.com/video-files/1409899/1409899-hd_1920_1080_25fps.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/1409899/pexels-photo-1409899.jpeg?auto=compress&cs=tinysrgb&w=400',
    aspectRatio: '1:1',
    duration: 20,
    description: 'Square 1:1 Instagram post with Pexels 4K calm sunset reflections, sacred geometric motion, and smooth typography fade-ins.',
    badge: 'Free',
    badgeColor: 'bg-teal-500 text-white',
    gradient: 'from-teal-950 via-[#102422] to-[#081412]',
    accentColor: 'text-teal-400',
    stats: { uses: '31.0K', likes: '7.3K' },
    highlights: ['Pexels 4K Ocean Reflections', 'Instagram 1:1 Feed', 'Sacred Geometry', 'Ambient Audio']
  }
];

export const LandingPortal: React.FC<LandingPortalProps> = ({
  user,
  onOpenEditor,
  onOpenAuth,
  onOpenProjectModal,
  onLoadTemplate,
  recentProjects = [],
  onLoadProject,
  onOpenAiPromptStudio,
  onOpenVeoAnimate,
  onOpenQuranStudio,
  onOpenGeminiIntelligence,
  onOpenSoraPhoto,
  onSignOut,
  onDirectGoogleSignIn,
  onOpenPreferences,
}) => {
  const [activeNav, setActiveNav] = useState<'home' | 'templates' | 'projects' | 'ai' | 'quran' | 'downloads'>('home');
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<'all' | 'quran' | 'viral' | 'podcast' | 'cinematic'>('all');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<'all' | 'Pexels' | 'Pixabay'>('all');
  const [showTemplateGuide, setShowTemplateGuide] = useState(false);
  const [savedProjects, setSavedProjects] = useState<SavedProjectSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSyncing, setIsSyncing] = useState(false);
  const [release, setRelease] = useState<ReleaseInfo>(fallbackReleaseInfo);
  const [isPro, setIsPro] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [downloadToast, setDownloadToast] = useState<{ platform: string; filename: string } | null>(null);

  const handleDownloadClick = (platform: string, filename: string) => {
    setDownloadToast({ platform, filename });
    setTimeout(() => {
      setDownloadToast(null);
    }, 4500);
  };

  // Dedicated interactive modals that stay on Home Portal
  const [showQuranStudioModal, setShowQuranStudioModal] = useState(false);
  const [showAutoReframeModal, setShowAutoReframeModal] = useState(false);
  const [showVoiceoverTtsModal, setShowVoiceoverTtsModal] = useState(false);
  const [showImageEnhanceModal, setShowImageEnhanceModal] = useState(false);
  const [previewTemplateModal, setPreviewTemplateModal] = useState<CapCutTemplate | null>(null);

  // Legal & AdSense Compliance Pages Modal State
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab>('privacy');

  // Quran Studio state
  const [quranSurah, setQuranSurah] = useState<'067' | '036' | '055' | '001' | '094'>('067');
  const [quranReciter, setQuranReciter] = useState('Mishari Rashid Alafasy');
  const [quranAspect, setQuranAspect] = useState<'9:16' | '16:9'>('9:16');
  const [isPlayingQuranAudio, setIsPlayingQuranAudio] = useState(false);
  const [quranAudioRef, setQuranAudioRef] = useState<HTMLAudioElement | null>(null);

  // Mobile Drawer State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Auto Reframe State
  const [reframeRatio, setReframeRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [reframeMode, setReframeMode] = useState<'smart_crop' | 'blur_padding' | 'pan_scan'>('smart_crop');

  // AI TTS Voiceover State
  const [ttsText, setTtsText] = useState('السلام عليكم! کیوٹ کٹ پرو میں خوش آمدید۔ Welcome to CuteCut Pro AI Voice Studio.');
  const [ttsLang, setTtsLang] = useState<'ur' | 'ar' | 'en'>('ur');
  const [ttsSpeed, setTtsSpeed] = useState(1);
  const [isPlayingTts, setIsPlayingTts] = useState(false);

  // 4K Image Enhancement State
  const [enhanceUpscale, setEnhanceUpscale] = useState<'4k' | 'hdr'>('4k');
  const [enhanceFilter, setEnhanceFilter] = useState<'gold' | 'cinematic' | 'vibrant'>('gold');
  const [enhanceSharpness, setEnhanceSharpness] = useState(85);

  // Quran recitation audio handler
  const handleToggleQuranAudio = (surahCode: string) => {
    if (isPlayingQuranAudio && quranAudioRef) {
      quranAudioRef.pause();
      setIsPlayingQuranAudio(false);
      return;
    }

    if (quranAudioRef) {
      quranAudioRef.pause();
    }

    const audioUrl =
      surahCode === '067'
        ? 'https://everyayah.com/data/Alafasy_128kbps/067001.mp3'
        : surahCode === '036'
        ? 'https://everyayah.com/data/Alafasy_128kbps/036001.mp3'
        : surahCode === '055'
        ? 'https://everyayah.com/data/Alafasy_128kbps/055013.mp3'
        : surahCode === '094'
        ? 'https://everyayah.com/data/Alafasy_128kbps/094005.mp3'
        : 'https://everyayah.com/data/Alafasy_128kbps/001001.mp3';

    const audio = new Audio(audioUrl);
    audio.onended = () => setIsPlayingQuranAudio(false);
    audio.onerror = () => setIsPlayingQuranAudio(false);
    audio.play().catch(() => {});
    setQuranAudioRef(audio);
    setIsPlayingQuranAudio(true);
  };

  // TTS Speech Synthesis handler
  const handleToggleTtsPreview = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (isPlayingTts) {
      window.speechSynthesis.cancel();
      setIsPlayingTts(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(ttsText);
    utterance.lang = ttsLang === 'ur' ? 'ur-PK' : ttsLang === 'ar' ? 'ar-SA' : 'en-US';
    utterance.rate = ttsSpeed;
    utterance.onend = () => setIsPlayingTts(false);
    utterance.onerror = () => setIsPlayingTts(false);
    setIsPlayingTts(true);
    window.speechSynthesis.speak(utterance);
  };

  // Load Pro Status
  useEffect(() => {
    try {
      const state = ProLicenseService.getInstance().getState();
      setIsPro(state.isPro);
    } catch {}
  }, []);

  // Fetch Latest GitHub Release
  useEffect(() => {
    fetchLatestRelease().then((data) => {
      if (data) setRelease(data);
    });
  }, []);

  // Load Saved Projects from LocalStorage & Firestore
  const syncProjects = async () => {
    setIsSyncing(true);
    let localList: SavedProjectSession[] = [];
    try {
      const raw = localStorage.getItem(PROJECT_STORAGE_KEY);
      if (raw) {
        localList = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to parse local projects:', e);
    }

    if (user?.uid) {
      try {
        const cloudProjects = await getUserNamedProjects(user.uid);
        if (cloudProjects && cloudProjects.length > 0) {
          const map = new Map<string, SavedProjectSession>();
          localList.forEach((p) => map.set(p.id, p));
          cloudProjects.forEach((cp) => {
            if (cp.id) {
              map.set(cp.id, {
                id: cp.id,
                name: cp.name || 'Untitled Video Project',
                createdAt: typeof cp.updatedAt === 'string' ? cp.updatedAt : new Date().toISOString(),
                updatedAt: typeof cp.updatedAt === 'string' ? cp.updatedAt : new Date().toISOString(),
                duration: cp.duration || 20,
                trackCount: cp.tracks?.length || 0,
                clipCount: cp.tracks?.reduce((sum: number, t: any) => sum + (t.clips?.length || 0), 0) || 0,
                data: {
                  tracks: cp.tracks || [],
                  duration: cp.duration || 20,
                  zoom: 35,
                  aspectRatio: (cp.aspectRatio as any) || '16:9',
                  watermark: cp.watermark,
                },
              });
            }
          });
          localList = Array.from(map.values());
          localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(localList));
        }
      } catch (err) {
        console.warn('Cloud projects sync failed:', err);
      }
    }

    // Sort by updated time descending
    localList.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
    setSavedProjects(localList);
    setTimeout(() => setIsSyncing(false), 400);
  };

  useEffect(() => {
    syncProjects();
  }, [user]);

  // Combined list: saved projects or starter samples if empty
  const displayProjects = savedProjects.length > 0 ? savedProjects : STARTER_SAMPLE_PROJECTS;
  const filteredProjects = displayProjects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // Handle Project Open
  const handleOpenProject = (project: SavedProjectSession) => {
    if (onLoadProject) {
      onLoadProject(project);
    } else {
      onOpenEditor(project.data?.aspectRatio || '16:9');
    }
  };

  // Handle Project Delete
  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    const updated = savedProjects.filter((p) => p.id !== id);
    setSavedProjects(updated);
    try {
      localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(updated));
      if (user?.uid) {
        await deleteUserNamedProject(user.uid, id);
      }
    } catch {}
  };

  // Handle Project Duplicate
  const handleDuplicateProject = (project: SavedProjectSession, e: React.MouseEvent) => {
    e.stopPropagation();
    const copy: SavedProjectSession = {
      ...project,
      id: `copy_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `${project.name} (Copy)`,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [copy, ...savedProjects];
    setSavedProjects(updated);
    try {
      localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Format date helper
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  // Format duration helper
  const formatDuration = (seconds?: number) => {
    const s = Math.round(seconds || 0);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  // Render sidebar contents (shared across desktop permanent sidebar & mobile drawer)
  const renderSidebarContent = (isMobile: boolean = false) => (
    <>
      {/* Top: Logo & User Profile & Navigation */}
      <div className="p-4 space-y-4">
        {/* Brand Logo Header */}
        <div className="flex items-center justify-between px-1 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-500 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#0d0d16] rounded-[10px] flex items-center justify-center">
                <Scissors className="w-4 h-4 text-cyan-400 rotate-90" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">CuteCut</span>
                <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-sm">
                  PRO
                </span>
              </div>
              <div className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                <span>v2.5.2</span>
                <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                <span className="text-emerald-400">Native Engine</span>
              </div>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          {isMobile && (
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-1.5 rounded-xl bg-[#141422] hover:bg-[#1f1f32] text-gray-400 hover:text-white transition cursor-pointer border border-[#242438]"
              title="Close Menu"
              aria-label="Close Menu"
            >
              <X className="w-5 h-5 text-gray-300" />
            </button>
          )}
        </div>

        {/* User Sign-In / Profile Card */}
        <div className="bg-[#141422] border border-[#242438] rounded-2xl p-3 shadow-md">
          {user ? (
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full border border-cyan-400/50 object-cover shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-sm text-sm shrink-0">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">
                    {user.displayName || 'CuteCut Creator'}
                  </div>
                  <div className="text-[10px] text-gray-400 truncate font-mono">
                    {user.email || 'Cloud Account'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#202034] text-[10px]">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Cloud Synced
                </span>
                {onSignOut ? (
                  <button
                    onClick={() => {
                      if (isMobile) setIsMobileSidebarOpen(false);
                      onSignOut();
                    }}
                    className="text-gray-400 hover:text-red-400 flex items-center gap-1 transition cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sign out</span>
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <div className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-[10px]">
                  G
                </div>
                <span>Google Account Sync</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-snug">
                Sign in with Google to backup & sync your video drafts across web and desktop.
              </p>
              <button
                onClick={() => {
                  if (isMobile) setIsMobileSidebarOpen(false);
                  if (onDirectGoogleSignIn) onDirectGoogleSignIn();
                  else if (onOpenAuth) onOpenAuth();
                }}
                className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Sign in with Google</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Items (CapCut Style) */}
        <nav className="space-y-1 pt-1">
          <button
            onClick={() => {
              setActiveNav('home');
              if (isMobile) setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeNav === 'home'
                ? 'bg-gradient-to-r from-cyan-500/15 to-transparent text-cyan-400 border-l-2 border-cyan-400'
                : 'text-gray-400 hover:bg-[#161626] hover:text-white'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span className="flex-1 text-left">Home / Studio</span>
          </button>

          <button
            onClick={() => {
              setActiveNav('templates');
              if (isMobile) setIsMobileSidebarOpen(false);
              const el = document.getElementById('capcut-templates-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeNav === 'templates'
                ? 'bg-gradient-to-r from-amber-500/15 to-transparent text-amber-400 border-l-2 border-amber-400'
                : 'text-gray-400 hover:bg-[#161626] hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="flex-1 text-left">Templates (ٹیمپلیٹس)</span>
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              CapCut
            </span>
          </button>

          <button
            onClick={() => {
              setActiveNav('projects');
              if (isMobile) setIsMobileSidebarOpen(false);
              const el = document.getElementById('recent-projects-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeNav === 'projects'
                ? 'bg-gradient-to-r from-cyan-500/15 to-transparent text-cyan-400 border-l-2 border-cyan-400'
                : 'text-gray-400 hover:bg-[#161626] hover:text-white'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span className="flex-1 text-left">My Projects</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#202034] text-gray-300">
              {savedProjects.length}
            </span>
          </button>

          <button
            onClick={() => {
              if (isMobile) setIsMobileSidebarOpen(false);
              if (onOpenAiPromptStudio) onOpenAiPromptStudio();
              else onOpenEditor();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:bg-[#161626] hover:text-purple-300 transition cursor-pointer group"
          >
            <Wand2 className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition" />
            <span className="flex-1 text-left">AI Video Studio</span>
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              PRO
            </span>
          </button>

          <button
            onClick={() => {
              if (isMobile) setIsMobileSidebarOpen(false);
              if (onOpenGeminiIntelligence) onOpenGeminiIntelligence();
              else onOpenEditor();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:bg-[#161626] hover:text-indigo-300 transition cursor-pointer group"
          >
            <Brain className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition" />
            <span className="flex-1 text-left">Gemini AI Intelligence</span>
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              PRO
            </span>
          </button>

          <button
            onClick={() => {
              if (isMobile) setIsMobileSidebarOpen(false);
              if (onOpenVeoAnimate) onOpenVeoAnimate();
              else onOpenEditor();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:bg-[#161626] hover:text-cyan-300 transition cursor-pointer group"
          >
            <Film className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
            <span className="flex-1 text-left">Veo AI Video</span>
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              VEO 3.1
            </span>
          </button>

          <button
            onClick={() => {
              if (isMobile) setIsMobileSidebarOpen(false);
              if (onOpenSoraPhoto) onOpenSoraPhoto();
              else if (onOpenVeoAnimate) onOpenVeoAnimate();
              else onOpenEditor();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:bg-[#161626] hover:text-rose-300 transition cursor-pointer group"
          >
            <Sparkles className="w-4 h-4 text-rose-400 group-hover:scale-110 transition" />
            <span className="flex-1 text-left">Sora Photo</span>
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              SORA
            </span>
          </button>

          <button
            onClick={() => {
              if (isMobile) setIsMobileSidebarOpen(false);
              setShowQuranStudioModal(true);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:bg-[#161626] hover:text-emerald-300 transition cursor-pointer group"
          >
            <BookOpen className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
            <span className="flex-1 text-left">Quran 4K Studio</span>
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Free
            </span>
          </button>

          <button
            onClick={() => {
              if (isMobile) setIsMobileSidebarOpen(false);
              onOpenProjectModal();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:bg-[#161626] hover:text-white transition cursor-pointer"
          >
            <HardDrive className="w-4 h-4 text-cyan-400" />
            <span className="flex-1 text-left">Project Save & Export</span>
          </button>

          <button
            onClick={() => {
              if (isMobile) setIsMobileSidebarOpen(false);
              setLegalModalTab('privacy');
              setShowLegalModal(true);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:bg-[#161626] hover:text-cyan-300 transition cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="flex-1 text-left">Privacy & Legal</span>
            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              AdSense
            </span>
          </button>
        </nav>
      </div>

      {/* Bottom Banner */}
      <div className="p-4">
        <div className="rounded-2xl p-3.5 bg-gradient-to-br from-indigo-950/60 via-[#161628] to-[#121220] border border-indigo-500/30 shadow-lg relative overflow-hidden group">
          <div className="absolute -top-6 -right-6 w-16 h-16 bg-cyan-500/20 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-300">
              Recommended
            </span>
          </div>
          <div className="text-xs font-bold text-white mb-0.5">
            CuteCut Pro v2.5.2
          </div>
          <p className="text-[10px] text-gray-400 leading-tight mb-2.5">
            Filmora & CapCut Speed • 60 FPS Native FFmpeg • 100% Free & Open
          </p>
          <div className="flex items-center justify-between text-[10px] text-cyan-400 font-medium">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Offline-First Ready
            </span>
            <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-white transition" />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-screen bg-[#0a0a10] text-gray-100 font-sans overflow-hidden select-none">
      
      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR (DESKTOP: PERMANENT, LG+ SCREENS)          */}
      {/* ========================================================= */}
      <aside className="hidden lg:flex w-64 xl:w-72 bg-[#0e0e18] border-r border-[#1e1e2e] flex-col justify-between shrink-0 z-20 shadow-2xl overflow-y-auto custom-scrollbar">
        {renderSidebarContent(false)}
      </aside>

      {/* ========================================================= */}
      {/* 1.B MOBILE / TABLET SLIDE-OUT DRAWER OVERLAY (< LG)       */}
      {/* ========================================================= */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Dark Blurred Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-fadeIn"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          {/* Sliding Drawer Container */}
          <aside className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#0e0e18] border-r border-[#1e1e2e] flex flex-col justify-between shadow-2xl overflow-y-auto custom-scrollbar animate-slideRight">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. MAIN WORKSPACE / CAPCUT-GRADE DASHBOARD AREA           */}
      {/* ========================================================= */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto bg-[#0a0a12] custom-scrollbar w-full min-w-0">
        
        {/* Top Header Controls Bar */}
        <header className="h-14 sm:h-16 border-b border-[#1c1c2c] px-3 sm:px-6 flex items-center justify-between bg-[#0e0e18]/80 backdrop-blur-md sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile / Tablet Hamburger Menu Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-[#141422] border border-[#26263a] text-cyan-400 hover:text-white transition cursor-pointer shrink-0"
              title="Open Navigation Menu"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs sm:text-sm font-bold text-white truncate">
                CuteCut Pro Studio
              </span>
              <span className="hidden sm:inline text-gray-500">•</span>
              <span className="hidden md:inline text-xs font-normal text-gray-400 truncate">
                {user?.displayName ? `Signed in as ${user.displayName}` : 'CuteCutPro.com'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-24 sm:w-40 md:w-60 bg-[#141422] border border-[#26263a] rounded-xl pl-7 sm:pl-8 pr-2.5 sm:pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            {/* Sync Button */}
            <button
              onClick={syncProjects}
              disabled={isSyncing}
              className="p-1.5 sm:p-2 rounded-xl bg-[#141422] border border-[#26263a] hover:border-cyan-400/50 text-gray-300 hover:text-white transition cursor-pointer flex items-center gap-1 text-xs font-medium shrink-0"
              title="Sync Projects"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>

            {/* Desktop App Download Button */}
            <a
              href={release.assets.windowsExe}
              download
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141422] border border-[#26263a] hover:border-emerald-400/50 text-xs font-semibold text-gray-300 hover:text-white transition cursor-pointer shrink-0"
              title="Download Windows App"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Get Native App</span>
            </a>

            {/* 1-Click PWA Desktop / Mobile Install Button */}
            <PWAInstallButton />

            {/* Header User Profile or Google Sign In Button */}
            {user ? (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-xl bg-[#141422] border border-[#26263a] hover:border-cyan-400/50 text-xs text-white transition cursor-pointer shrink-0"
                title="Account Settings & Cloud Storage"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-5 h-5 rounded-full border border-cyan-400/60 object-cover" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 text-black font-extrabold text-[10px] flex items-center justify-center">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'G'}
                  </div>
                )}
                <span className="font-semibold hidden md:inline max-w-[100px] truncate">{user.displayName || 'Creator'}</span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-cyan-400 text-black">PRO</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (onDirectGoogleSignIn) onDirectGoogleSignIn();
                  else if (onOpenAuth) onOpenAuth();
                }}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-slate-950 font-bold text-xs shadow-md hover:scale-[1.02] transition active:scale-95 cursor-pointer shrink-0"
                title="Sign in with Google"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="hidden sm:inline">Sign in with Google</span>
                <span className="sm:hidden">Sign in</span>
              </button>
            )}
          </div>
        </header>

        {/* Dashboard Main Scrollable Content */}
        <div className="p-3.5 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full min-w-0">
          
          {/* ========================================================= */}
          {/* 3. HERO BANNER: "+ CREATE PROJECT" (AURORA GLOW)          */}
          {/* ========================================================= */}
          <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-6 md:p-8 border border-white/[0.08] bg-gradient-to-r from-[#201040] via-[#102048] to-[#0c3848]">
            {/* Ambient Background Aura Lights */}
            <div className="absolute -top-24 -left-20 w-80 h-80 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-20 w-80 h-80 bg-cyan-500/25 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left w-full md:w-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-cyan-300 text-xs font-bold tracking-wide">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Next-Generation Filmora & CapCut Engine</span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-md">
                  Create Stunning Video in Seconds
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 max-w-xl leading-relaxed mx-auto md:mx-0">
                  Hardware-accelerated 60 FPS multi-track timeline, frame-accurate split/trim, instant Quran Ayah alignment, and neural script-to-video AI.
                </p>

                {/* Aspect Ratio Fast Selectors */}
                <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-1.5 sm:gap-2 text-xs">
                  <span className="text-gray-400 font-medium mr-1 text-xs">Canvas Format:</span>
                  <button
                    onClick={() => setSelectedRatio('16:9')}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer text-xs ${
                      selectedRatio === '16:9'
                        ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                        : 'bg-black/40 text-gray-300 hover:text-white border border-white/10'
                    }`}
                  >
                    <Youtube className="w-3.5 h-3.5" />
                    <span>16:9 Landscape</span>
                  </button>

                  <button
                    onClick={() => setSelectedRatio('9:16')}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer text-xs ${
                      selectedRatio === '9:16'
                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-black/40 text-gray-300 hover:text-white border border-white/10'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>9:16 Shorts / Reel</span>
                  </button>

                  <button
                    onClick={() => setSelectedRatio('1:1')}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer text-xs ${
                      selectedRatio === '1:1'
                        ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30'
                        : 'bg-black/40 text-gray-300 hover:text-white border border-white/10'
                    }`}
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>1:1 Square</span>
                  </button>
                </div>
              </div>

              {/* Magnificent Create Project Giant Button */}
              <div className="shrink-0 flex flex-col items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => onOpenEditor(selectedRatio)}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-5 rounded-2xl bg-white hover:bg-gray-100 text-black font-black text-sm sm:text-base shadow-2xl hover:shadow-cyan-400/40 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-xl bg-black text-white flex items-center justify-center group-hover:rotate-90 transition duration-300">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span>Create project</span>
                </button>
                <span className="text-[10px] text-cyan-200/70 font-mono tracking-wider">
                  Ready to edit in {selectedRatio}
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 4. QUICK TOOLS ROW (FREE & PRO BADGES - CAPCUT STYLE)     */}
          {/* ========================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Instant Creative Tools</span>
              </h3>
              <span className="text-[11px] text-gray-500">
                Pick a workflow to start instantly
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              
              {/* Tool 1: AI Video Studio [PRO] */}
              <button
                onClick={() => {
                  if (onOpenAiPromptStudio) onOpenAiPromptStudio();
                  else onOpenEditor('16:9');
                }}
                className="relative p-4 rounded-2xl bg-[#131322] hover:bg-[#1a1a30] border-2 border-purple-500/80 shadow-lg shadow-purple-500/20 text-left transition group cursor-pointer flex flex-col justify-between h-32"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/40 group-hover:scale-110 transition">
                    <Wand2 className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500 text-white shadow-sm">
                    PRO
                  </span>
                </div>
                <div>
                  <div className="text-xs font-extrabold text-white group-hover:text-purple-300 transition">
                    AI Video Studio
                  </div>
                  <div className="text-[10px] text-gray-400 leading-tight mt-0.5">
                    Prompt & Story to Full Video
                  </div>
                </div>
              </button>

              {/* Tool 2: Gemini AI Intelligence [PRO] */}
              <button
                onClick={() => {
                  if (onOpenGeminiIntelligence) onOpenGeminiIntelligence();
                  else onOpenEditor('16:9');
                }}
                className="p-4 rounded-2xl bg-[#131322] hover:bg-[#1a1a30] border border-indigo-500/50 hover:border-indigo-400 text-left transition group cursor-pointer flex flex-col justify-between h-32 shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/40 group-hover:scale-110 transition">
                    <Brain className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    PRO
                  </span>
                </div>
                <div>
                  <div className="text-xs font-extrabold text-white group-hover:text-indigo-300 transition">
                    Gemini AI Intelligence
                  </div>
                  <div className="text-[10px] text-gray-400 leading-tight mt-0.5">
                    High Thinking Creative Director
                  </div>
                </div>
              </button>

              {/* Tool 3: Veo AI Video [VEO 3.1] */}
              <button
                onClick={() => {
                  if (onOpenVeoAnimate) onOpenVeoAnimate();
                  else onOpenEditor('16:9');
                }}
                className="p-4 rounded-2xl bg-[#131322] hover:bg-[#1a1a30] border border-cyan-500/40 hover:border-cyan-400 text-left transition group cursor-pointer flex flex-col justify-between h-32 shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40 group-hover:scale-110 transition">
                    <Film className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    VEO 3.1
                  </span>
                </div>
                <div>
                  <div className="text-xs font-extrabold text-white group-hover:text-cyan-300 transition">
                    Veo AI Video
                  </div>
                  <div className="text-[10px] text-gray-400 leading-tight mt-0.5">
                    Google Veo 3.1 Text to Video
                  </div>
                </div>
              </button>

              {/* Tool 4: Sora Photo [SORA] */}
              <button
                onClick={() => {
                  if (onOpenSoraPhoto) onOpenSoraPhoto();
                  else if (onOpenVeoAnimate) onOpenVeoAnimate();
                  else onOpenEditor('16:9');
                }}
                className="p-4 rounded-2xl bg-[#131322] hover:bg-[#1a1a30] border border-rose-500/40 hover:border-rose-400 text-left transition group cursor-pointer flex flex-col justify-between h-32 shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40 group-hover:scale-110 transition">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    SORA
                  </span>
                </div>
                <div>
                  <div className="text-xs font-extrabold text-white group-hover:text-rose-300 transition">
                    Sora Photo
                  </div>
                  <div className="text-[10px] text-gray-400 leading-tight mt-0.5">
                    Cinematic Photo to Video Motion
                  </div>
                </div>
              </button>

              {/* Tool 5: Voiceover & TTS [Free] */}
              <button
                onClick={() => setShowVoiceoverTtsModal(true)}
                className="p-4 rounded-2xl bg-[#131322] hover:bg-[#1a1a30] border border-[#24243a] hover:border-blue-500/60 text-left transition group cursor-pointer flex flex-col justify-between h-32 shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/40 group-hover:scale-110 transition">
                    <Mic className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Free
                  </span>
                </div>
                <div>
                  <div className="text-xs font-extrabold text-white group-hover:text-blue-300 transition">
                    Voiceover & TTS
                  </div>
                  <div className="text-[10px] text-gray-400 leading-tight mt-0.5">
                    Neural multi-lingual speech
                  </div>
                </div>
              </button>

              {/* Tool 6: Image Enhancement [Pro] */}
              <button
                onClick={() => setShowImageEnhanceModal(true)}
                className="p-4 rounded-2xl bg-[#131322] hover:bg-[#1a1a30] border border-[#24243a] hover:border-indigo-500/60 text-left transition group cursor-pointer flex flex-col justify-between h-32 shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/40 group-hover:scale-110 transition">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Pro
                  </span>
                </div>
                <div>
                  <div className="text-xs font-extrabold text-white group-hover:text-indigo-300 transition">
                    Image enhancement
                  </div>
                  <div className="text-[10px] text-gray-400 leading-tight mt-0.5">
                    4K HDR AI upscale & filter
                  </div>
                </div>
              </button>

            </div>
          </div>

          {/* ========================================================= */}
          {/* 5. SAVED PROJECTS SECTION (BELOW INSTANT CREATIVE TOOLS)  */}
          {/* ========================================================= */}
          <section id="recent-projects-section" className="space-y-4 pt-2">
            
            {/* Projects Header & Filters (Matching Screenshot) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#1c1c2c] pb-3">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>Projects</span>
                  <span className="text-xs font-mono font-normal text-gray-400 bg-[#141422] px-2 py-0.5 rounded-full border border-[#242438]">
                    {filteredProjects.length}
                  </span>
                </h3>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-[#141422] border border-[#242438] rounded-xl p-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition ${
                      viewMode === 'grid' ? 'bg-[#222238] text-white' : 'text-gray-400 hover:text-white'
                    }`}
                    title="Grid View"
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition ${
                      viewMode === 'list' ? 'bg-[#222238] text-white' : 'text-gray-400 hover:text-white'
                    }`}
                    title="List View"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Project Sync Button (Matching Screenshot) */}
                <button
                  onClick={syncProjects}
                  className="px-3 py-1.5 bg-[#141422] hover:bg-[#1c1c2e] border border-[#242438] hover:border-cyan-400/50 rounded-xl text-gray-300 hover:text-white font-medium flex items-center gap-1.5 transition cursor-pointer"
                  title="Project Sync"
                >
                  <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Project sync</span>
                </button>

                {/* Trash Button (Matching Screenshot) */}
                <button
                  onClick={() => {
                    if (savedProjects.length === 0) return;
                    if (window.confirm('Delete all saved projects in this browser?')) {
                      setSavedProjects([]);
                      localStorage.removeItem(PROJECT_STORAGE_KEY);
                    }
                  }}
                  className="px-3 py-1.5 bg-[#141422] hover:bg-red-950/40 border border-[#242438] hover:border-red-500/50 rounded-xl text-gray-400 hover:text-red-300 font-medium flex items-center gap-1.5 transition cursor-pointer"
                  title="Trash"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Trash</span>
                </button>
              </div>
            </div>

            {/* Projects Grid / Cards */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                
                {/* 1st Card: Quick New Project Slot */}
                <div
                  onClick={() => onOpenEditor('16:9')}
                  className="group relative aspect-[4/3] rounded-2xl border-2 border-dashed border-[#24243c] hover:border-cyan-400/80 bg-[#12121e]/50 hover:bg-[#16162a] transition-all flex flex-col items-center justify-center p-4 text-center cursor-pointer shadow-md"
                >
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-black transition">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-white group-hover:text-cyan-300">
                    New Blank Project
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                    Start from scratch
                  </div>
                </div>

                {/* Existing / Sample Project Cards */}
                {filteredProjects.map((project, idx) => {
                  const isShort = project.data?.aspectRatio === '9:16';
                  return (
                    <div
                      key={project.id || idx}
                      onClick={() => handleOpenProject(project)}
                      className="group relative aspect-[4/3] rounded-2xl bg-[#141422] hover:bg-[#1a1a2e] border border-[#222236] hover:border-cyan-400/60 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer shadow-lg hover:shadow-cyan-500/10"
                    >
                      {/* Thumbnail Preview Area */}
                      <div className="relative flex-1 bg-gradient-to-br from-[#1c1c30] to-[#0e0e18] overflow-hidden flex items-center justify-center">
                        {/* Abstract Decorative Waveform Preview */}
                        <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition flex items-center justify-center gap-1 px-4">
                          {[30, 60, 45, 80, 20, 95, 40, 70, 50, 85, 30, 60, 90, 40].map((h, i) => (
                            <div
                              key={i}
                              className="flex-1 bg-cyan-400 rounded-full"
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>

                        {/* Central Play Badge */}
                        <div className="w-9 h-9 rounded-full bg-black/60 group-hover:bg-cyan-500 text-white group-hover:text-black flex items-center justify-center shadow-md transition duration-200 z-10 backdrop-blur-sm">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>

                        {/* Aspect Ratio & Duration Tag */}
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[9px] font-mono text-gray-300 z-10">
                          <span className={`px-1.5 py-0.5 rounded font-bold ${
                            isShort ? 'bg-purple-600/80 text-white' : 'bg-black/70 text-cyan-300'
                          }`}>
                            {project.data?.aspectRatio || '16:9'}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-black/70 font-bold text-white">
                            {formatDuration(project.duration || project.data?.duration)}
                          </span>
                        </div>
                      </div>

                      {/* Card Info Footer */}
                      <div className="p-2.5 bg-[#10101c] border-t border-[#1e1e30] flex flex-col justify-between">
                        <div className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition" title={project.name}>
                          {project.name}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {formatDate(project.updatedAt)}
                          </span>
                          <span>
                            {project.clipCount || project.data?.tracks?.length || 1} clips
                          </span>
                        </div>
                      </div>

                      {/* Hover Action Buttons */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex items-center gap-1 z-20">
                        <button
                          onClick={(e) => handleDuplicateProject(project, e)}
                          className="p-1 rounded-md bg-black/80 hover:bg-cyan-600 text-white shadow transition cursor-pointer"
                          title="Duplicate"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteProject(project.id, e)}
                          className="p-1 rounded-md bg-black/80 hover:bg-red-600 text-white shadow transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}

              </div>
            ) : (
              /* List View Mode */
              <div className="space-y-2">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleOpenProject(project)}
                    className="p-3 rounded-2xl bg-[#141422] hover:bg-[#1a1a2e] border border-[#222236] hover:border-cyan-400/60 transition flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow">
                        <Film className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {project.name}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono flex items-center gap-2 mt-0.5">
                          <span>{project.data?.aspectRatio || '16:9'}</span>
                          <span>•</span>
                          <span>Duration: {formatDuration(project.duration || project.data?.duration)}</span>
                          <span>•</span>
                          <span>Updated: {formatDate(project.updatedAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenProject(project);
                        }}
                        className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs rounded-xl shadow transition cursor-pointer"
                      >
                        Open
                      </button>
                      <button
                        onClick={(e) => handleDeleteProject(project.id, e)}
                        className="p-2 text-gray-400 hover:text-red-400 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ========================================================= */}
          {/* 6. NATIVE APPS DOWNLOAD SECTION (CROSS-PLATFORM)          */}
          {/* ========================================================= */}
          <div className="rounded-3xl p-6 bg-[#0e0e18] border border-[#1e1e2e] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Download CuteCut Pro Native Apps ({release.tagName})</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  100% offline-ready with hardware GPU acceleration. Choose your platform:
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Universal v2.5.2
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-2.5">
              {/* Windows EXE */}
              <a
                href={release.assets.windowsExe}
                download
                onClick={() => handleDownloadClick('Windows', 'CuteCut.Pro.Setup.2.5.2.exe')}
                className="p-3 rounded-xl bg-[#141422] hover:bg-[#1a1a2e] border border-[#242438] hover:border-cyan-400 text-gray-200 hover:text-white transition flex flex-col items-start gap-1.5 cursor-pointer shadow group"
                title="Download Windows 64-bit EXE (WinGet Supported)"
              >
                <div className="flex items-center justify-between w-full">
                  <Monitor className="w-4 h-4 text-cyan-400 shrink-0 group-hover:scale-110 transition" />
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-500/15 text-cyan-300 font-bold">WinGet</span>
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs font-bold truncate">Windows</div>
                  <div className="text-[10px] text-gray-400 font-mono">.exe 64-bit</div>
                </div>
              </a>

              {/* macOS DMG */}
              <a
                href={release.assets.macDmg}
                download
                onClick={() => handleDownloadClick('macOS DMG', 'CuteCut.Pro-2.5.2-arm64.dmg')}
                className="p-3 rounded-xl bg-[#141422] hover:bg-[#1a1a2e] border border-[#242438] hover:border-gray-300 text-gray-200 hover:text-white transition flex flex-col items-start gap-1.5 cursor-pointer shadow group"
                title="Download macOS DMG (Apple Silicon & Intel)"
              >
                <div className="flex items-center justify-between w-full">
                  <Apple className="w-4 h-4 text-gray-300 shrink-0 group-hover:scale-110 transition" />
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-gray-500/20 text-gray-300 font-bold">DMG</span>
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs font-bold truncate">macOS</div>
                  <div className="text-[10px] text-gray-400 font-mono">.dmg Apple</div>
                </div>
              </a>

              {/* macOS / Universal PKG */}
              <a
                href={release.assets.macPkg || release.assets.windowsExe}
                download
                onClick={() => handleDownloadClick('macOS PKG', 'CuteCut.Pro-2.5.2.pkg')}
                className="p-3 rounded-xl bg-[#141422] hover:bg-[#1a1a2e] border border-[#242438] hover:border-amber-400 text-gray-200 hover:text-white transition flex flex-col items-start gap-1.5 cursor-pointer shadow group"
                title="Download Native .PKG Installer"
              >
                <div className="flex items-center justify-between w-full">
                  <Package className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition" />
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">PKG</span>
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs font-bold truncate">Package</div>
                  <div className="text-[10px] text-gray-400 font-mono">.pkg Installer</div>
                </div>
              </a>

              {/* Linux AppImage */}
              <a
                href={release.assets.linuxAppImage}
                download
                onClick={() => handleDownloadClick('Linux AppImage', 'CuteCut.Pro-2.5.2-x86_64.AppImage')}
                className="p-3 rounded-xl bg-[#141422] hover:bg-[#1a1a2e] border border-[#242438] hover:border-emerald-400 text-gray-200 hover:text-white transition flex flex-col items-start gap-1.5 cursor-pointer shadow group"
                title="Download Linux AppImage (AppImageHub Supported)"
              >
                <div className="flex items-center justify-between w-full">
                  <Terminal className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition" />
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">AppImage</span>
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs font-bold truncate">Linux</div>
                  <div className="text-[10px] text-gray-400 font-mono">.AppImage</div>
                </div>
              </a>

              {/* Debian / Ubuntu .deb */}
              <a
                href={release.assets.linuxDeb}
                download
                onClick={() => handleDownloadClick('Debian / Ubuntu', 'cutecut-pro_2.5.2_amd64.deb')}
                className="p-3 rounded-xl bg-[#141422] hover:bg-[#1a1a2e] border border-[#242438] hover:border-blue-400 text-gray-200 hover:text-white transition flex flex-col items-start gap-1.5 cursor-pointer shadow group"
                title="Download Debian/Ubuntu .deb package"
              >
                <div className="flex items-center justify-between w-full">
                  <Terminal className="w-4 h-4 text-blue-400 shrink-0 group-hover:scale-110 transition" />
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold">DEB</span>
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs font-bold truncate">Debian</div>
                  <div className="text-[10px] text-gray-400 font-mono">.deb package</div>
                </div>
              </a>

              {/* Linux Tar / Arch PKG */}
              <a
                href={release.assets.linuxPkg || release.assets.linuxDeb}
                download
                onClick={() => handleDownloadClick('Linux Tar PKG', 'cutecut-pro-2.5.2.tar.gz')}
                className="p-3 rounded-xl bg-[#141422] hover:bg-[#1a1a2e] border border-[#242438] hover:border-teal-400 text-gray-200 hover:text-white transition flex flex-col items-start gap-1.5 cursor-pointer shadow group"
                title="Download Linux Universal Tar / PKG"
              >
                <div className="flex items-center justify-between w-full">
                  <Package className="w-4 h-4 text-teal-400 shrink-0 group-hover:scale-110 transition" />
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-teal-500/20 text-teal-300 font-bold">TAR</span>
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs font-bold truncate">Linux PKG</div>
                  <div className="text-[10px] text-gray-400 font-mono">.tar.gz / pkg</div>
                </div>
              </a>

              {/* Android APK */}
              <a
                href={release.assets.androidApk || 'https://github.com/MDIsmatullah/CuteCut-Pro/releases/latest'}
                download
                onClick={() => handleDownloadClick('Android APK', 'CuteCut-Pro-v2.5.2.apk')}
                className="p-3 rounded-xl bg-[#141422] hover:bg-[#1a1a2e] border border-[#242438] hover:border-green-400 text-gray-200 hover:text-white transition flex flex-col items-start gap-1.5 cursor-pointer shadow group"
                title="Download Android APK Direct"
              >
                <div className="flex items-center justify-between w-full">
                  <Smartphone className="w-4 h-4 text-green-400 shrink-0 group-hover:scale-110 transition" />
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-green-500/20 text-green-300 font-bold">APK</span>
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs font-bold truncate">Android</div>
                  <div className="text-[10px] text-gray-400 font-mono">.apk Mobile</div>
                </div>
              </a>

              {/* F-Droid Store */}
              <a
                href={release.assets.fdroidUrl || 'https://github.com/MDIsmatullah/CuteCut-Pro/raw/main/fdroid/metadata/org.guldasta.cutecutpro.yml'}
                target="_blank"
                rel="noreferrer"
                onClick={() => handleDownloadClick('F-Droid Store', 'F-Droid Metadata Recipe')}
                className="p-3 rounded-xl bg-[#141422] hover:bg-[#1a1a2e] border border-[#242438] hover:border-emerald-400 text-gray-200 hover:text-white transition flex flex-col items-start gap-1.5 cursor-pointer shadow group"
                title="F-Droid Open Source Repository Recipe"
              >
                <div className="flex items-center justify-between w-full">
                  <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition" />
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">F-Droid</span>
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs font-bold truncate">F-Droid</div>
                  <div className="text-[10px] text-gray-400 font-mono">Store Catalog</div>
                </div>
              </a>

              {/* Flathub / Flatpak */}
              <a
                href={release.assets.flatpak || 'https://flathub.org/apps/org.guldasta.cutecutpro'}
                target="_blank"
                rel="noreferrer"
                onClick={() => handleDownloadClick('Flatpak', 'Flathub Portal')}
                className="p-3 rounded-xl bg-[#141422] hover:bg-[#1a1a2e] border border-[#242438] hover:border-purple-400 text-gray-200 hover:text-white transition flex flex-col items-start gap-1.5 cursor-pointer shadow group"
                title="Flathub Linux Portal"
              >
                <div className="flex items-center justify-between w-full">
                  <Package className="w-4 h-4 text-purple-400 shrink-0 group-hover:scale-110 transition" />
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold">Flatpak</span>
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs font-bold truncate">Flathub</div>
                  <div className="text-[10px] text-gray-400 font-mono">Linux Flatpak</div>
                </div>
              </a>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 4.5 CAPCUT-STYLE TRENDING TEMPLATES SECTION (ٹیمپلیٹس)     */}
          {/* ========================================================= */}
          <section id="capcut-templates-section" className="space-y-4 pt-2">
            
            {/* Templates Section Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-[#1c1c2c] pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>Trending Templates</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-black">
                      CapCut Style
                    </span>
                  </h3>
                </div>
                <p className="text-[11px] text-gray-400">
                  Ready-made video timelines. Click <strong>Use Template</strong> to load clips, subtitles, and waveforms instantly!
                </p>
              </div>

              {/* Category & Source Filter Pills & Guide Button */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'quran', label: '📖 Quran & Islamic' },
                    { id: 'viral', label: '🔥 Viral Shorts' },
                    { id: 'podcast', label: '🎙️ Podcast' },
                    { id: 'cinematic', label: '🎬 Cinematic' },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedTemplateCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer text-xs ${
                      selectedTemplateCategory === cat.id
                        ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                        : 'bg-[#141422] text-gray-400 hover:text-white border border-[#242438]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}

                {/* Pexels / Pixabay Source Filter Switcher */}
                <div className="flex items-center bg-[#10101c] border border-[#262640] rounded-xl p-0.5 ml-1">
                  <button
                    onClick={() => setSelectedSourceFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      selectedSourceFilter === 'all' ? 'bg-[#22223c] text-white shadow' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    All Media
                  </button>
                  <button
                    onClick={() => setSelectedSourceFilter('Pexels')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                      selectedSourceFilter === 'Pexels' ? 'bg-emerald-600 text-white shadow' : 'text-gray-400 hover:text-emerald-400'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Pexels 4K</span>
                  </button>
                  <button
                    onClick={() => setSelectedSourceFilter('Pixabay')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                      selectedSourceFilter === 'Pixabay' ? 'bg-cyan-600 text-white shadow' : 'text-gray-400 hover:text-cyan-400'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span>Pixabay 4K</span>
                  </button>
                </div>

                {/* How to add templates helper button */}
                <button
                  onClick={() => setShowTemplateGuide(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-purple-300 font-medium text-xs flex items-center gap-1 transition cursor-pointer ml-1"
                  title="How to create & add templates"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">How to Add?</span>
                </button>
              </div>
            </div>

            {/* Templates Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CAPCUT_PRESET_TEMPLATES.filter(
                (tpl) =>
                  (selectedTemplateCategory === 'all' || tpl.category === selectedTemplateCategory) &&
                  (selectedSourceFilter === 'all' || tpl.source === selectedSourceFilter)
              ).map((template) => (
                <div
                  key={template.id}
                  className="group relative rounded-2xl bg-[#12121e] hover:bg-[#161628] border border-[#222236] hover:border-amber-400/60 transition-all duration-300 overflow-hidden flex flex-col shadow-xl hover:shadow-amber-500/10"
                >
                  {/* Top Preview Card Area with Real Pexels/Pixabay Photo/Video Thumbnail */}
                  <div
                    className={`relative h-44 bg-gradient-to-br ${template.gradient} p-4 flex flex-col justify-between overflow-hidden border-b border-[#202034]`}
                  >
                    {/* Real Pexels / Pixabay Background Image Preview */}
                    <div className="absolute inset-0 z-0">
                      <img
                        src={template.thumbnailUrl}
                        alt={template.title}
                        className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#12121e] via-black/40 to-transparent" />
                    </div>

                    {/* Top Row: Aspect Ratio Badge, Source Badge, & Trending Badge */}
                    <div className="relative z-10 flex items-center justify-between gap-1">
                      <span className="px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-mono font-bold text-gray-200 border border-white/10 flex items-center gap-1">
                        {template.aspectRatio === '9:16' ? (
                          <Smartphone className="w-3 h-3 text-purple-400" />
                        ) : template.aspectRatio === '16:9' ? (
                          <Youtube className="w-3 h-3 text-red-400" />
                        ) : (
                          <Maximize2 className="w-3 h-3 text-amber-400" />
                        )}
                        <span>{template.aspectRatio}</span>
                        <span className="text-gray-400">• {template.duration}s</span>
                      </span>

                      <div className="flex items-center gap-1">
                        {/* Pexels or Pixabay Tag */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm backdrop-blur-md ${
                            template.source === 'Pexels'
                              ? 'bg-emerald-500/90 text-white border border-emerald-400/40'
                              : 'bg-cyan-500/90 text-black border border-cyan-300/40'
                          }`}
                        >
                          <Video className="w-2.5 h-2.5" />
                          <span>{template.sourceBadge}</span>
                        </span>

                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${template.badgeColor} shadow-sm`}>
                          {template.badge}
                        </span>
                      </div>
                    </div>

                    {/* Center Icon & Play Hover */}
                    <div className="relative z-10 my-auto flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-black/70 group-hover:bg-amber-400 text-white group-hover:text-black flex items-center justify-center shadow-lg transition-all duration-200 backdrop-blur-md group-hover:scale-110">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Bottom Stats (CapCut Style: Uses & Likes) */}
                    <div className="relative z-10 flex items-center justify-between text-[10px] text-gray-200 font-mono">
                      <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-white/5">
                        🔥 {template.stats.uses} uses
                      </span>
                      <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-white/5">
                        ❤️ {template.stats.likes}
                      </span>
                    </div>
                  </div>

                  {/* Template Details & Action Footer */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-black text-white group-hover:text-amber-300 transition truncate">
                          {template.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 shrink-0 font-medium">
                          {template.categoryLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-snug mt-1 line-clamp-2">
                        {template.description}
                      </p>

                      {/* Feature Highlights Pills */}
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {template.highlights.map((h, i) => (
                          <span
                            key={i}
                            className="text-[9px] px-2 py-0.5 rounded-md bg-[#18182c] border border-[#262640] text-gray-300 font-medium"
                          >
                            ✓ {h}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions: Quick Preview on Portal & Use Template */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setPreviewTemplateModal(template)}
                        className="px-3.5 py-2.5 rounded-xl bg-[#1a1a2e] hover:bg-[#24243e] border border-[#2c2c44] hover:border-amber-400/50 text-gray-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        title="Watch Preview on Home Portal"
                      >
                        <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
                        <span>Preview</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onLoadTemplate(template.id)}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all duration-200 cursor-pointer active:scale-95 group-hover:shadow-amber-500/30"
                      >
                        <Sparkles className="w-3.5 h-3.5 fill-black" />
                        <span>Use Template</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Template Information Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/30 via-[#18182a] to-cyan-950/30 border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>How CapCut Templates work in CuteCut Pro?</span>
                </div>
                <p className="text-[11px] text-gray-400 max-w-2xl leading-relaxed">
                  When you click <strong>Use Template</strong>, CuteCut Pro automatically populates the multi-track timeline with pre-timed video backgrounds, audio recitations, audio visualizers, and Uthmanic Arabic calligraphy subtitles. You only need to replace media or text!
                </p>
              </div>

              <button
                onClick={() => setShowTemplateGuide(true)}
                className="px-4 py-2 rounded-xl bg-[#222238] hover:bg-[#2c2c48] border border-gray-700 text-white font-bold text-xs shrink-0 flex items-center gap-2 transition cursor-pointer"
              >
                <span>Read Full Guide</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 5.5 GOOGLE ADSENSE COMPLIANT PLATFORM FOOTER             */}
          {/* ========================================================= */}
          <footer className="pt-8 pb-4 mt-8 border-t border-[#1c1c2e] space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              
              {/* Brand & Description */}
              <div className="space-y-1.5 max-w-md">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center p-0.5">
                    <Scissors className="w-3 h-3 text-black rotate-90" />
                  </div>
                  <span className="font-extrabold text-white text-sm">CuteCut Pro Studio</span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-400 text-black">
                    v2.5.2
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Next-generation Filmora & CapCut-style web video editor. Hardware-accelerated 60 FPS multi-track timeline, instant Quran Ayah alignment, 4K Pexels & Pixabay stock loops, and client-side rendering.
                </p>
              </div>

              {/* Legal & Policy Navigation Buttons (AdSense Mandatory) */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold">
                <button
                  onClick={() => {
                    setLegalModalTab('privacy');
                    setShowLegalModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#141424] hover:bg-[#1c1c32] border border-[#25253c] hover:border-cyan-400/50 text-gray-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Privacy Policy (رازداری)</span>
                </button>

                <button
                  onClick={() => {
                    setLegalModalTab('terms');
                    setShowLegalModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#141424] hover:bg-[#1c1c32] border border-[#25253c] hover:border-purple-400/50 text-gray-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  <span>Terms of Service (ضوابط)</span>
                </button>

                <button
                  onClick={() => {
                    setLegalModalTab('about');
                    setShowLegalModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#141424] hover:bg-[#1c1c32] border border-[#25253c] hover:border-amber-400/50 text-gray-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
                >
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  <span>About Us (ہمارے بارے میں)</span>
                </button>

                <button
                  onClick={() => {
                    setLegalModalTab('contact');
                    setShowLegalModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#141424] hover:bg-[#1c1c32] border border-[#25253c] hover:border-emerald-400/50 text-gray-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Contact Us (رابطہ)</span>
                </button>
              </div>

            </div>

            {/* AdSense Disclosures & Cookie Transparency Badge */}
            <div className="p-3.5 rounded-2xl bg-[#10101c] border border-[#202034] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-gray-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>AdSense & Cookie Policy:</strong> Third-party vendors, including Google, use cookies to serve ads based on user visits. Client-side video processing ensures media privacy.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 font-mono text-[10px] text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Domain: CuteCutPro.com</span>
              </div>
            </div>

            {/* Copyright & Support Email */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-gray-500 pt-2 border-t border-[#181826]">
              <div>
                © 2026 CuteCut Pro Studio. All rights reserved. Created by <strong>Guldasta Islam</strong> & Community.
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setLegalModalTab('contact');
                    setShowLegalModal(true);
                  }}
                  className="hover:text-cyan-400 text-cyan-300 font-mono transition cursor-pointer"
                >
                  Support: support@cutecutpro.com
                </button>
              </div>
            </div>
          </footer>

        </div>
      </main>

      {/* ========================================================= */}
      {/* TEMPLATE CREATION & HOW-TO GUIDE MODAL                   */}
      {/* ========================================================= */}
      {showTemplateGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121220] border border-[#282842] rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowTemplateGuide(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-[#1c1c30] text-gray-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">How CapCut Templates Work in CuteCut Pro?</h3>
                <p className="text-xs text-gray-400">ٹیمپلیٹس کیسے کام کرتے ہیں اور نیا ٹیمپلیٹ کیسے بنائیں؟</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-gray-300">
              <div className="p-3 rounded-2xl bg-[#18182c] border border-[#262640] flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-white mb-0.5">Use Template (ایک کلک پر استعمال)</h4>
                  <p className="text-gray-400 leading-relaxed">
                    کسی بھی ٹیمپلیٹ کے نیچے <strong>Use Template</strong> بٹن پر کلک کریں۔ کیوٹ کٹ پرو ٹائم لائن میں تمام ویڈیو ٹریکس، بیک گراؤنڈز، لائیو ویوفارمز اور عربی سب ٹائٹلز کو سیکنڈوں میں خودکار سیٹ کر دے گا۔
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#18182c] border border-[#262640] flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-white mb-0.5">Customize Media & Text (اپنی ویڈیو یا آڈیو تبدیل کریں)</h4>
                  <p className="text-gray-400 leading-relaxed">
                    ٹائم لائن میں موجود بیک گراؤنڈ ویڈیو یا آڈیو پر کلک کر کے اپنی فائل یا نئی سورۃ منتخب کریں — تمام ٹیکسٹ اینیمیشن اور کیپشن اسٹائلز بغیر کسی محنت کے برقرار رہیں گے!
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#18182c] border border-[#262640] flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-white mb-0.5">Save Your Project as Template (اپنا نیا ٹیمپلیٹ بنائیں)</h4>
                  <p className="text-gray-400 leading-relaxed">
                    جب آپ کوئی بہترین ویڈیو بنا لیں تو ٹاپ بار میں <strong>Project Save & Export</strong> کھولیں اور <strong>Export Project JSON</strong> کریں یا کلاؤڈ میں سیو کر لیں — آپ کا پروجیکٹ مستقبل کے لیے بطور ٹیمپلیٹ ہمیشہ کے لیے تیار ہو جائے گا!
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowTemplateGuide(false);
                  onLoadTemplate('tpl-quran-reels');
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Try Quran 4K Template Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================= */}
      {/* 6. MODALS THAT OPEN DIRECTLY ON HOME PORTAL               */}
      {/* ========================================================= */}

      {/* 6.1 QURAN 4K AYAH & RECITER STUDIO MODAL */}
      {showQuranStudioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-[#12121e] border border-[#2e2e46] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#222238] bg-[#161628]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>Quran 4K Ayah Studio & Reciter Sync</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                      100% Free
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    قرآن پاک کی آیات، مستند قاریوں کی تلاوت اور 4K کائناتی ویڈیوز کا سیکنڈوں میں انتخاب کریں
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (quranAudioRef) quranAudioRef.pause();
                  setIsPlayingQuranAudio(false);
                  setShowQuranStudioModal(false);
                }}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              
              {/* Surah Selector Cards */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Select Surah / سورت کا انتخاب:</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {[
                    { id: '067', name: 'Surah Al-Mulk', arabic: 'سُورَةُ المُلْك', ayahs: '30 Ayahs', meaning: 'The Sovereignty' },
                    { id: '036', name: 'Surah Yasin', arabic: 'سُورَةُ يس', ayahs: '83 Ayahs', meaning: 'Heart of the Quran' },
                    { id: '055', name: 'Surah Ar-Rahman', arabic: 'سُورَةُ الرَّحْمَٰن', ayahs: '78 Ayahs', meaning: 'The Beneficent' },
                    { id: '001', name: 'Surah Al-Fatiha', arabic: 'سُورَةُ الفَاتِحَة', ayahs: '7 Ayahs', meaning: 'The Opening' },
                    { id: '094', name: 'Surah Ash-Sharh', arabic: 'سُورَةُ الشَّرْح', ayahs: '8 Ayahs', meaning: 'The Relief' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setQuranSurah(s.id as any)}
                      className={`p-3 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                        quranSurah === s.id
                          ? 'bg-emerald-950/40 border-emerald-400 text-white shadow-lg shadow-emerald-500/10'
                          : 'bg-[#161626] border-[#25253c] text-gray-400 hover:text-white hover:border-[#383858]'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{s.name}</div>
                        <div className="text-[10px] text-gray-400">{s.meaning} • {s.ayahs}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-arabic font-bold text-amber-300">{s.arabic}</div>
                        {quranSurah === s.id && (
                          <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Selected</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reciter & Audio Preview Player Row */}
              <div className="p-4 rounded-2xl bg-[#161628] border border-[#262640] space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <Mic className="w-4 h-4 text-cyan-400" />
                      <span>Authentic Reciter (تلاوت قاری صاحب):</span>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      High-fidelity 128kbps crystal-clear EveryAyah audio recitation
                    </div>
                  </div>

                  {/* Audio Play/Pause Test Preview Button */}
                  <button
                    onClick={() => handleToggleQuranAudio(quranSurah)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
                  >
                    {isPlayingQuranAudio ? (
                      <>
                        <Pause className="w-4 h-4 fill-black" />
                        <span>Pause Recitation (آڈیو روکیں)</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-black" />
                        <span>Play Audio Preview (آواز سنیں)</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {['Mishari Rashid Alafasy', 'Abdul Basit Murattal', 'Abdul Rahman Al-Sudais', 'Saud Al-Shuraim'].map((reciter) => (
                    <button
                      key={reciter}
                      onClick={() => setQuranReciter(reciter)}
                      className={`p-2.5 rounded-xl border text-center font-medium transition cursor-pointer ${
                        quranReciter === reciter
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-[#12121c] border-[#222234] text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className="truncate font-semibold">{reciter}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Format & Background Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Format selection */}
                <div className="p-4 rounded-2xl bg-[#161628] border border-[#262640] space-y-2">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Canvas Video Format:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setQuranAspect('9:16')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                        quranAspect === '9:16'
                          ? 'bg-purple-950/40 border-purple-400 text-white shadow'
                          : 'bg-[#12121c] border-[#222234] text-gray-400 hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold">9:16 Shorts / Reel</span>
                      <span className="text-[10px] text-gray-500">TikTok & Reels</span>
                    </button>

                    <button
                      onClick={() => setQuranAspect('16:9')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                        quranAspect === '16:9'
                          ? 'bg-cyan-950/40 border-cyan-400 text-white shadow'
                          : 'bg-[#12121c] border-[#222234] text-gray-400 hover:text-white'
                      }`}
                    >
                      <Youtube className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold">16:9 Landscape</span>
                      <span className="text-[10px] text-gray-500">YouTube Full 4K</span>
                    </button>
                  </div>
                </div>

                {/* Stock 4K Background Info */}
                <div className="p-4 rounded-2xl bg-[#161628] border border-[#262640] space-y-2">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Included 4K Footage Sources:</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-gray-400">
                    <div className="flex items-center gap-2 text-cyan-300">
                      <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Pexels 4K Deep Galaxy Starry Sky Video</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Pixabay 4K Milky Way Timelapse</span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-300">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Gold Uthmanic Arabic Calligraphy & Subtitles</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 px-6 border-t border-[#222238] bg-[#161628] flex items-center justify-between">
              <button
                onClick={() => {
                  if (quranAudioRef) quranAudioRef.pause();
                  setIsPlayingQuranAudio(false);
                  setShowQuranStudioModal(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#202034] hover:bg-[#282842] text-gray-300 hover:text-white text-xs font-semibold transition cursor-pointer"
              >
                Close (بند کریں)
              </button>

              <button
                onClick={() => {
                  if (quranAudioRef) quranAudioRef.pause();
                  setIsPlayingQuranAudio(false);
                  setShowQuranStudioModal(false);
                  const targetTemplate =
                    quranSurah === '036'
                      ? 'tpl-surah-yasin'
                      : quranSurah === '055'
                      ? 'tpl-surah-rahman'
                      : 'tpl-quran-reels';
                  onLoadTemplate(targetTemplate);
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-black font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 fill-black" />
                <span>Open & Edit in Multi-Track Timeline (ٹائم لائن میں کھولیں)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6.2 AUTO REFRAME STUDIO MODAL */}
      {showAutoReframeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#12121e] border border-[#2e2e46] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#222238] bg-[#161628]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Maximize2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Auto Reframe & Canvas Studio</h3>
                  <p className="text-xs text-gray-400">تبدیل کریں 16:9 یوٹیوب ویڈیو کو 9:16 شارٹس یا ریلز میں</p>
                </div>
              </div>
              <button
                onClick={() => setShowAutoReframeModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Target Aspect Ratio:</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: '9:16', title: '9:16 Shorts / Reel', desc: 'TikTok, Instagram Reels, YT Shorts' },
                    { id: '16:9', title: '16:9 Landscape', desc: 'YouTube Standard, TV, Desktop' },
                    { id: '1:1', title: '1:1 Square', desc: 'Instagram Feed, Facebook Post' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setReframeRatio(r.id as any)}
                      className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                        reframeRatio === r.id
                          ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                          : 'bg-[#161626] border-[#25253c] text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold text-white">{r.title}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Framing & Fill Mode:</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'smart_crop', title: 'Smart Center Focus', desc: 'Auto-centers subjects in viewport' },
                    { id: 'blur_padding', title: 'Blurred Mirror Canvas', desc: 'Fills bars with blurred background' },
                    { id: 'pan_scan', title: 'Motion Pan & Scan', desc: 'Smooth dynamic horizontal pan' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setReframeMode(m.id as any)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        reframeMode === m.id
                          ? 'bg-purple-950/40 border-purple-400 text-white'
                          : 'bg-[#161626] border-[#25253c] text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold text-white">{m.title}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#161628] border border-[#25253c] flex items-center justify-between text-xs">
                <span className="text-gray-400">Current Timeline Target:</span>
                <span className="text-cyan-400 font-mono font-bold">{reframeRatio} ({reframeMode})</span>
              </div>
            </div>

            <div className="p-4 px-6 border-t border-[#222238] bg-[#161628] flex items-center justify-between">
              <button
                onClick={() => setShowAutoReframeModal(false)}
                className="px-4 py-2.5 rounded-xl bg-[#202034] text-gray-300 hover:text-white text-xs font-semibold transition cursor-pointer"
              >
                Close (بند کریں)
              </button>
              <button
                onClick={() => {
                  setShowAutoReframeModal(false);
                  onOpenEditor(reframeRatio);
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
              >
                <span>Apply & Open Timeline ({reframeRatio})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6.3 NEURAL VOICEOVER & TTS STUDIO MODAL */}
      {showVoiceoverTtsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#12121e] border border-[#2e2e46] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#222238] bg-[#161628]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">AI Neural Voiceover & TTS Studio</h3>
                  <p className="text-xs text-gray-400">اردو، عربی اور انگلش میں فوری آواز بنائیں</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
                  setIsPlayingTts(false);
                  setShowVoiceoverTtsModal(false);
                }}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Language Selector */}
              <div className="flex items-center gap-2">
                {[
                  { id: 'ur', label: 'Urdu (اردو)', defaultText: 'السلام عليكم! کیوٹ کٹ پرو میں خوش آمدید۔ آپ کا ویڈیو ایڈیٹنگ سفر اب شروع ہوتا ہے۔' },
                  { id: 'ar', label: 'Arabic (العربية)', defaultText: 'بسم الله الرحمن الرحيم، الحمد لله رب العالمين والصلاة والسلام على رسول الله' },
                  { id: 'en', label: 'English (US)', defaultText: 'Welcome to CuteCut Pro. Build stunning high-converting 4K videos in seconds.' },
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => {
                      setTtsLang(l.id as any);
                      setTtsText(l.defaultText);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      ttsLang === l.id
                        ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                        : 'bg-[#18182a] text-gray-400 hover:text-white border border-[#25253c]'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              {/* Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Voiceover Script / عبارت:</label>
                <textarea
                  rows={4}
                  value={ttsText}
                  onChange={(e) => setTtsText(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-[#161626] border border-[#2c2c44] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 transition"
                  placeholder="Type your script here..."
                />
              </div>

              {/* Speed slider */}
              <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-[#161628] border border-[#25253c]">
                <span className="text-gray-400">Speech Rate / رفتار: {ttsSpeed}x</span>
                <div className="flex items-center gap-2">
                  {[0.75, 1, 1.25, 1.5].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setTtsSpeed(speed)}
                      className={`px-2 py-0.5 rounded-lg font-bold text-[11px] transition ${
                        ttsSpeed === speed ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 px-6 border-t border-[#222238] bg-[#161628] flex items-center justify-between">
              <button
                onClick={handleToggleTtsPreview}
                className="px-4 py-2.5 rounded-xl bg-[#202038] hover:bg-[#2a2a48] text-cyan-300 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
              >
                {isPlayingTts ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlayingTts ? 'Stop Preview' : 'Listen Preview (آواز سنیں)'}</span>
              </button>

              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
                  setIsPlayingTts(false);
                  setShowVoiceoverTtsModal(false);
                  onOpenEditor('16:9');
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Add to Timeline & Edit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6.4 4K AI IMAGE & VIDEO ENHANCEMENT MODAL */}
      {showImageEnhanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#12121e] border border-[#2e2e46] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#222238] bg-[#161628]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">4K AI Image & Video Enhancement</h3>
                  <p className="text-xs text-gray-400">سپر ریزولیوشن 4K اور سنیماٹک کلر گریڈنگ</p>
                </div>
              </div>
              <button
                onClick={() => setShowImageEnhanceModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Color Grading Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Cinematic Color Grade (کلر فلٹر):</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'gold', title: 'Golden Islamic Reflection', color: 'from-amber-500/30 to-orange-500/10' },
                    { id: 'cinematic', title: 'Teal & Orange Cinema', color: 'from-cyan-500/30 to-blue-500/10' },
                    { id: 'vibrant', title: 'Ultra HDR Vibrant Nature', color: 'from-emerald-500/30 to-teal-500/10' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setEnhanceFilter(f.id as any)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer bg-gradient-to-br ${f.color} ${
                        enhanceFilter === f.id ? 'border-amber-400 text-white shadow' : 'border-[#282840] text-gray-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{f.title}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upscale Resolution */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">AI Upscale Engine:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setEnhanceUpscale('4k')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      enhanceUpscale === '4k' ? 'bg-indigo-950/40 border-indigo-400 text-white' : 'bg-[#161626] border-[#25253c] text-gray-400'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">4K UHD Upscale (2160p)</div>
                    <div className="text-[10px] text-gray-400">Hardware-accelerated edge super-sampling</div>
                  </button>
                  <button
                    onClick={() => setEnhanceUpscale('hdr')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      enhanceUpscale === 'hdr' ? 'bg-indigo-950/40 border-indigo-400 text-white' : 'bg-[#161626] border-[#25253c] text-gray-400'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">HDR Dynamic Tone Map</div>
                    <div className="text-[10px] text-gray-400">10-bit color spectrum dynamic range</div>
                  </button>
                </div>
              </div>

              {/* Sharpness slider */}
              <div className="p-3.5 rounded-xl bg-[#161628] border border-[#25253c] space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Detail Sharpness Boost:</span>
                  <span className="text-indigo-400 font-bold font-mono">{enhanceSharpness}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={enhanceSharpness}
                  onChange={(e) => setEnhanceSharpness(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-4 px-6 border-t border-[#222238] bg-[#161628] flex items-center justify-between">
              <button
                onClick={() => setShowImageEnhanceModal(false)}
                className="px-4 py-2.5 rounded-xl bg-[#202034] text-gray-300 hover:text-white text-xs font-semibold transition cursor-pointer"
              >
                Close (بند کریں)
              </button>
              <button
                onClick={() => {
                  setShowImageEnhanceModal(false);
                  onOpenEditor('16:9');
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Apply Enhancement to Timeline</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6.5 TEMPLATE QUICK PREVIEW MODAL */}
      {previewTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-[#12121e] border border-[#2e2e46] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#222238] bg-[#161628]">
              <div className="flex items-center gap-2.5">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${previewTemplateModal.badgeColor}`}>
                  {previewTemplateModal.badge}
                </span>
                <h3 className="text-sm font-bold text-white">{previewTemplateModal.title}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {previewTemplateModal.sourceBadge}
                </span>
              </div>
              <button
                onClick={() => setPreviewTemplateModal(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              {/* Video Player Preview with 4K MP4 loop */}
              <div className="relative rounded-2xl overflow-hidden bg-black border border-[#282840] aspect-video flex items-center justify-center shadow-inner">
                <video
                  src={previewTemplateModal.videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs text-gray-300 leading-relaxed">
                  {previewTemplateModal.description}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-[#18182c] border border-[#2a2a44] text-cyan-300 font-mono">
                    Format: {previewTemplateModal.aspectRatio}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#18182c] border border-[#2a2a44] text-amber-300 font-mono">
                    Duration: {previewTemplateModal.duration}s
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#18182c] border border-[#2a2a44] text-gray-300">
                    Category: {previewTemplateModal.categoryLabel}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {previewTemplateModal.highlights.map((h, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-[#18182c] border border-[#25253c] text-emerald-300">
                      ✓ {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 px-6 border-t border-[#222238] bg-[#161628] flex items-center justify-between">
              <button
                onClick={() => setPreviewTemplateModal(null)}
                className="px-4 py-2.5 rounded-xl bg-[#202034] text-gray-300 hover:text-white text-xs font-semibold transition cursor-pointer"
              >
                Close Preview (بند کریں)
              </button>

              <button
                onClick={() => {
                  const id = previewTemplateModal.id;
                  setPreviewTemplateModal(null);
                  onLoadTemplate(id);
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 fill-black" />
                <span>Use Template & Open in Timeline</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Starting Toast Notification */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-[#12121e] border-2 border-emerald-500/50 rounded-2xl shadow-2xl p-4 max-w-sm w-full animate-fadeIn flex items-center gap-3 backdrop-blur-xl">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <span>Starting Download...</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                {downloadToast.platform}
              </span>
            </div>
            <div className="text-[11px] text-gray-300 font-mono truncate mt-0.5">
              {downloadToast.filename}
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>CuteCut Pro v2.5.2 Official Binary</span>
            </div>
          </div>
          <button
            onClick={() => setDownloadToast(null)}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 6.6 GOOGLE ADSENSE & LEGAL POLICIES MODAL */}
      <LegalPagesModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
        initialTab={legalModalTab}
      />
    </div>
  );
};

export default LandingPortal;
