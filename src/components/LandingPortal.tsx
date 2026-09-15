import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Scissors,
  Film,
  Music,
  Type,
  Layers,
  Wand2,
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
  Check
} from 'lucide-react';
import { UserProfile } from './AuthModal';
import { SavedProjectSession } from './ProjectSaveModal';

interface LandingPortalProps {
  user: UserProfile | null;
  onOpenEditor: () => void;
  onOpenAuth: () => void;
  onOpenProjectModal: () => void;
  onLoadTemplate: (templateId: string) => void;
  recentProjects?: SavedProjectSession[];
}

export const LandingPortal: React.FC<LandingPortalProps> = ({
  user,
  onOpenEditor,
  onOpenAuth,
  onOpenProjectModal,
  onLoadTemplate,
  recentProjects = [],
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'quran' | 'shorts' | 'cinematic' | 'calligraphy'>('all');
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 4);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const slideshowSlides = [
    {
      title: "Automated Quranic Ayah Alignment",
      subtitle: "Microsecond Speech-to-Text Precision",
      desc: "Instantly segments and aligns continuous full-surah audio tracks matching the exact canonical Uthmani script coordinates.",
      badge: "AI Align Engine v2.3.10",
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
      icon: BookOpen,
      visual: (
        <div className="w-full h-full bg-[#07070b] border border-[#1f1f2e] rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden h-[180px]">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[9px] font-mono text-gray-400">
              <span>Reciter: Al-Husary (Murattal)</span>
              <span className="text-emerald-400">Aligned • 45.2 ms MAE</span>
            </div>
            
            <div className="h-10 flex items-end gap-[2px] pt-1">
              {[20, 45, 10, 80, 95, 30, 40, 60, 20, 15, 85, 90, 70, 10, 30, 40, 85, 95, 60, 30, 10, 75, 80, 20, 50, 90, 35, 10, 60, 80, 95].map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all duration-500 ${
                    i < 16 ? 'bg-emerald-500' : 'bg-[#1a1a26]'
                  }`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          <div className="bg-[#12121d] border border-[#222238] rounded-xl p-2 flex flex-col items-center justify-center text-center">
            <div className="text-emerald-400 font-bold font-mono text-[8px] uppercase tracking-wider mb-0.5">
              Ayah 1 Alignment Status
            </div>
            <div className="text-xs font-bold text-white mb-0.5" dir="rtl">
              صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ
            </div>
            <div className="text-[9px] text-gray-400 italic">
              "The path of those upon whom You have bestowed favor..."
            </div>
          </div>

          <div className="flex items-center justify-between text-[8px] font-mono text-gray-500">
            <span>00:00.00</span>
            <span className="text-emerald-500 font-bold">Words synced: 4/4</span>
            <span>00:10.15</span>
          </div>
        </div>
      )
    },
    {
      title: "CapCut-Grade Timeline Engine",
      subtitle: "Multi-Track Video, Audio & Subtitles",
      desc: "Trims, splits, and ripple-deletes infinite overlaps with zero lag. Features smooth sub-frame scrubbing.",
      badge: "Real-Time GPU Render",
      color: "from-cyan-500/20 to-indigo-500/10 border-cyan-500/30 text-cyan-400",
      icon: Scissors,
      visual: (
        <div className="w-full h-full bg-[#07070b] border border-[#1f1f2e] rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden h-[180px]">
          <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-slate-900 border border-[#1f1f2e] h-20">
            <img 
              src="https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=400&auto=format&fit=crop&q=80" 
              className="w-full h-full object-cover brightness-75"
              alt="Video Preview"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-8 h-8 rounded-full bg-cyan-500/95 text-black flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
              </div>
            </div>
          </div>

          <div className="space-y-1 mt-1 font-mono text-[8px]">
            <div className="flex items-center gap-2">
              <span className="w-5 text-gray-400 shrink-0">V1</span>
              <div className="flex-1 bg-[#161622] border border-[#2c2c3e] rounded-md h-4 flex items-center px-1.5 relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-2/3 bg-cyan-500/20 border-r-2 border-cyan-400" />
                <span className="text-gray-300 relative z-10 truncate text-[8px]">tilawat_drone_footage.mp4</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 text-gray-400 shrink-0">A1</span>
              <div className="flex-1 bg-[#161622] border border-[#2c2c3e] rounded-md h-4 flex items-center px-1.5 relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-2/3 bg-emerald-500/20 border-r-2 border-emerald-400" />
                <span className="text-gray-300 relative z-10 truncate text-[8px]">recitation_stereo_mix.wav</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Viral Word-by-Word Subtitles",
      subtitle: "Dynamic Subtitle Animations",
      desc: "Generates punchy social captions with customizable active color highlights, glow shadows, and entrance triggers.",
      badge: "TikTok/Shorts Ready",
      color: "from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400",
      icon: Type,
      visual: (
        <div className="w-full h-full bg-[#07070b] border border-[#1f1f2e] rounded-2xl p-4 flex flex-col justify-center items-center relative overflow-hidden h-[180px]">
          <div className="space-y-2 text-center">
            <span className="text-[8px] font-mono text-gray-400 tracking-wider uppercase block">Active Preset: "GLOW POP"</span>
            
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-lg font-black tracking-tight">
              <span className="text-white">Create</span>
              <span className="text-white">Viral</span>
              <span className="text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg shadow-lg shadow-cyan-500/20 scale-105 border border-cyan-400/30 animate-pulse">Tilawat</span>
              <span className="text-white">Videos</span>
            </div>

            <div className="text-[9px] text-gray-400 italic">
              "Word highlight synchronized with active voice peak detection"
            </div>
          </div>
          
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[8px] font-mono text-gray-500">
            <span>Font: Montserrat</span>
            <span className="text-cyan-400 font-bold">Glow Active</span>
          </div>
        </div>
      )
    },
    {
      title: "Royal 3D Calligraphy",
      subtitle: "Custom Shaders & Glows",
      desc: "Applies 3D gold foil, chrome outlines, and neon ambient glows to any Arabic calligraphy preset with real-time adjustments.",
      badge: "WebGL Shader Engine",
      color: "from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400",
      icon: Palette,
      visual: (
        <div className="w-full h-full bg-[#07070b] border border-[#1f1f2e] rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden h-[180px]">
          <div className="flex items-center justify-between text-[9px] font-mono text-gray-400">
            <span>Material: Gold Foil</span>
            <span className="text-amber-400 font-bold">Shader Live</span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-1">
            <div className="text-xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(234,179,8,0.3)] select-none" dir="rtl">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </div>
            <div className="text-[8px] bg-amber-500/10 border border-amber-500/30 text-amber-400 px-1.5 py-0.2 rounded-full font-mono uppercase font-bold">
              3D Metallic Extruded
            </div>
          </div>

          <div className="flex items-center justify-between text-[8px] font-mono text-gray-500">
            <span>Depth: 12px</span>
            <span>Reflectivity: 85%</span>
          </div>
        </div>
      )
    }
  ];


  const templates = [
    {
      id: 'tpl-quran-reels',
      title: 'Quran Tilawat 9:16 Reels',
      category: 'quran',
      badge: 'POPULAR',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      duration: '30s',
      aspectRatio: '9:16',
      desc: 'Golden Uthmani calligraphy with synchronized Urdu/English translations and glowing ornate medallion markers.',
      gradient: 'from-emerald-950/60 via-slate-900 to-black',
      thumbnailUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'tpl-viral-captions',
      title: 'Viral Social Shorts & Captions',
      category: 'shorts',
      badge: 'TRENDING',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      duration: '15s',
      aspectRatio: '9:16',
      desc: 'CapCut-style dynamic punchy subtitles with word-by-word highlights, sound FX, and speed ramps.',
      gradient: 'from-cyan-950/60 via-slate-900 to-black',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'tpl-cinematic-documentary',
      title: '4K Cinematic Islamic Docu',
      category: 'cinematic',
      badge: '4K PRO',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      duration: '45s',
      aspectRatio: '16:9',
      desc: 'Slow zoom Ken Burns drone footage, atmospheric soundscapes, and elegant title typography.',
      gradient: 'from-amber-950/60 via-slate-900 to-black',
      thumbnailUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'tpl-surah-yasin',
      title: 'Surah Yasin Full Track Visualizer',
      category: 'quran',
      badge: 'AI SYNC',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      duration: '60s',
      aspectRatio: '16:9',
      desc: 'Continuous recitation track with automated multi-verse subtitle alignment and live particle spectrum.',
      gradient: 'from-purple-950/60 via-slate-900 to-black',
      thumbnailUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'tpl-cyber-calligraphy',
      title: 'Cyber Neon Calligraphy Showcase',
      category: 'calligraphy',
      badge: 'VFX GLOW',
      badgeColor: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      duration: '20s',
      aspectRatio: '1:1',
      desc: 'Multi-layer 3D metallic calligraphy with neon chroma stroking and audio-reactive ripples.',
      gradient: 'from-pink-950/60 via-slate-900 to-black',
      thumbnailUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'tpl-podcast-clip',
      title: 'Audio Spectrum Islamic Podcast',
      category: 'shorts',
      badge: 'WAVEFORM',
      badgeColor: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      duration: '30s',
      aspectRatio: '9:16',
      desc: 'Dynamic live audio visualizer bar, floating speaker lower-thirds, and auto-scrolling lyrics.',
      gradient: 'from-teal-950/60 via-slate-900 to-black',
      thumbnailUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80',
    }
  ];

  const filteredTemplates = activeCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === activeCategory);

  const featureCards = [
    {
      icon: Wand2,
      title: 'Full Surah Auto Subtitle Sync',
      desc: 'Microsecond audio-to-verse speech alignment across all 114 Surahs with Arabic Uthmani and Urdu/English translations.',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      icon: Film,
      title: 'CapCut-Grade Multi-Track Engine',
      desc: 'Uncapped video, audio, text, VFX overlay tracks with precise trimming, ripple delete, and sub-frame scrubbing.',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
    },
    {
      icon: Cloud,
      title: 'Cloud Firestore Real-Time Sync',
      desc: 'Instant cloud saving and loading for your video timeline projects across browser, desktop, and mobile devices.',
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    },
    {
      icon: Mic,
      title: 'Gemini Voice & AI Thinking Director',
      desc: 'Real-time conversational voice assistant to command trims, transitions, and automated text generation.',
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
    },
    {
      icon: Palette,
      title: '3D Calligraphy & Medallion Presets',
      desc: 'Royal gold leaf, cyber neon, and animated Ayah end medallion markers rendered with real-time WebGL shaders.',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    },
    {
      icon: Zap,
      title: 'Zero-Lag 4K 60FPS WASM Export',
      desc: 'Client-side hardware accelerated rendering for YouTube 16:9, TikTok/Reels 9:16, and Instagram 1:1 formats.',
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top CapCut / Filmora Style Navbar */}
      <header className="sticky top-0 z-40 bg-[#0e0e16]/90 backdrop-blur-xl border-b border-[#1f1f2e] px-4 lg:px-8 py-3.5 flex items-center justify-between transition-all">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onOpenEditor}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-indigo-600 p-[2px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#0d0d14] rounded-[10px] flex items-center justify-center">
              <Scissors className="w-5 h-5 text-cyan-400 transform -rotate-45" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black tracking-wider text-white">CUTECUT</span>
              <span className="text-[10px] bg-gradient-to-r from-amber-300 to-yellow-400 text-black font-extrabold px-1.5 py-0.2 rounded font-mono shadow-sm">
                PRO
              </span>
            </div>
            <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-widest">
              Cloud Video Suite
            </span>
          </div>
        </div>

        {/* Center Quick Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-gray-300">
          <a href="#templates" className="hover:text-cyan-400 transition">Templates</a>
          <a href="#features" className="hover:text-cyan-400 transition">Features</a>
          <a href="#cloud" className="hover:text-cyan-400 transition">Cloud Sync</a>
          <button 
            onClick={onOpenProjectModal} 
            className="hover:text-cyan-400 transition cursor-pointer flex items-center gap-1"
          >
            <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>My Projects</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#171724] hover:bg-[#202032] border border-[#2a2a3e] text-xs font-semibold text-gray-200 transition"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full object-cover border border-cyan-400/50" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-[10px] flex items-center justify-center">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="hidden sm:inline max-w-[120px] truncate">{user.name}</span>
                <span className="text-[9px] font-mono bg-cyan-400/20 text-cyan-300 px-1 py-0.5 rounded uppercase font-bold">
                  {user.tier}
                </span>
              </button>

              <button
                onClick={onOpenEditor}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-black font-bold text-xs shadow-lg shadow-cyan-500/25 transition cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>Open Editor</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 rounded-xl bg-[#171724] hover:bg-[#202032] border border-[#2a2a3e] text-xs font-semibold text-gray-200 transition cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={onOpenEditor}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-black font-bold text-xs shadow-lg shadow-cyan-500/25 transition cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Start Editing</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Showcase Section (CapCut/Filmora Style) */}
      <section className="relative pt-12 pb-20 px-4 lg:px-8 max-w-7xl mx-auto w-full flex flex-col items-center text-center overflow-hidden">
        
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/15 via-teal-500/10 to-indigo-500/15 blur-[120px] pointer-events-none rounded-full" />
        
        {/* Hero Top Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161928] border border-cyan-500/30 text-cyan-300 text-xs font-medium mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Professional Web Video & Tilawat Subtitle Suite</span>
          <span className="bg-cyan-400 text-black text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase">
            Firebase Cloud
          </span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl leading-[1.15] mb-6">
          Create Viral Tilawat & Short Videos <br />
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            Directly in Your Browser
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-sm sm:text-base text-gray-400 max-w-2xl leading-relaxed mb-10">
          CapCut and Filmora grade timeline editing with automated Quranic Ayah alignment, 
          multi-language translations, 3D Uthmani calligraphy styles, and instant Firebase Cloud synchronization.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
          <button
            onClick={onOpenEditor}
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-black font-extrabold text-sm shadow-xl shadow-cyan-500/30 hover:scale-[1.02] active:scale-95 transition cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Create New Video Project</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={onOpenProjectModal}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#161622] hover:bg-[#202030] border border-[#2e2e42] hover:border-cyan-500/40 text-gray-200 font-bold text-sm transition cursor-pointer"
          >
            <FolderOpen className="w-4 h-4 text-cyan-400" />
            <span>Open Saved Cloud Project</span>
          </button>

          <a
            href="https://buymeacoffee.com/asdevolper"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#FFDD00] hover:bg-[#FFEA3D] text-black font-extrabold text-sm shadow-xl shadow-yellow-500/10 hover:scale-[1.02] active:scale-95 transition cursor-pointer"
          >
            <Coffee className="w-5 h-5 fill-black stroke-[2]" />
            <span>Buy Me a Coffee</span>
          </a>
        </div>

        {/* Desktop Downloads Bar (Windows, macOS, Linux, Debian, Snapcraft, Flathub) */}
        <div className="flex flex-col items-center justify-center gap-3 mb-14 w-full max-w-5xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Download Desktop Native Apps (v2.3.10)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 w-full">
            {/* Windows Download */}
            <a
              href="https://github.com/MDIsmatullah/CuteCut-Pro/releases/download/v2.3.10/CUTECUT.PRO.Setup.2.3.10.exe"
              download="CUTECUT.PRO.Setup.2.3.10.exe"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#14141f] hover:bg-[#1c1c2b] border border-[#28283c] hover:border-cyan-400/60 text-gray-200 hover:text-white transition group cursor-pointer shadow-lg shadow-black/40"
              title="Download for Windows 10/11 64-bit (.exe Setup)"
            >
              <Monitor className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition shrink-0" />
              <div className="text-left min-w-0">
                <div className="text-xs font-bold leading-tight truncate">Windows</div>
                <div className="text-[10px] text-gray-400 font-mono">.exe Setup</div>
              </div>
            </a>

            {/* macOS Download */}
            <a
              href="https://github.com/MDIsmatullah/CuteCut-Pro/releases/download/v2.3.10/CUTECUT.PRO-2.3.10-arm64.dmg"
              download="CUTECUT.PRO-2.3.10-arm64.dmg"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#14141f] hover:bg-[#1c1c2b] border border-[#28283c] hover:border-gray-200/60 text-gray-200 hover:text-white transition group cursor-pointer shadow-lg shadow-black/40"
              title="Download for macOS Apple Silicon arm64 (.dmg)"
            >
              <Apple className="w-4 h-4 text-gray-300 group-hover:scale-110 transition shrink-0" />
              <div className="text-left min-w-0">
                <div className="text-xs font-bold leading-tight truncate">macOS</div>
                <div className="text-[10px] text-gray-400 font-mono">.dmg arm64</div>
              </div>
            </a>

            {/* Linux AppImage */}
            <a
              href="https://github.com/MDIsmatullah/CuteCut-Pro/releases/download/v2.3.10/CUTECUT.PRO-2.3.10.AppImage"
              download="CUTECUT.PRO-2.3.10.AppImage"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#14141f] hover:bg-[#1c1c2b] border border-[#28283c] hover:border-emerald-400/60 text-gray-200 hover:text-white transition group cursor-pointer shadow-lg shadow-black/40"
              title="Download Linux Portable .AppImage"
            >
              <Terminal className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition shrink-0" />
              <div className="text-left min-w-0">
                <div className="text-xs font-bold leading-tight truncate">Linux</div>
                <div className="text-[10px] text-gray-400 font-mono">.AppImage</div>
              </div>
            </a>

            {/* Linux DEB */}
            <a
              href="https://github.com/MDIsmatullah/CuteCut-Pro/releases/download/v2.3.10/cutecut-pro_2.3.10_amd64.deb"
              download="cutecut-pro_2.3.10_amd64.deb"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#14141f] hover:bg-[#1c1c2b] border border-[#28283c] hover:border-blue-400/60 text-gray-200 hover:text-white transition group cursor-pointer shadow-lg shadow-black/40"
              title="Download Debian / Ubuntu .deb package"
            >
              <Terminal className="w-4 h-4 text-blue-400 group-hover:scale-110 transition shrink-0" />
              <div className="text-left min-w-0">
                <div className="text-xs font-bold leading-tight truncate">Debian/Ubuntu</div>
                <div className="text-[10px] text-gray-400 font-mono">.deb 64-bit</div>
              </div>
            </a>

            {/* Snapcraft Store */}
            <a
              href="https://snapcraft.io/cutecut-pro"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#14141f] hover:bg-[#1c1c2b] border border-[#28283c] hover:border-orange-400/60 text-gray-200 hover:text-white transition group cursor-pointer shadow-lg shadow-black/40"
              title="Install from Snap Store (Snapcraft)"
            >
              <Package className="w-4 h-4 text-orange-400 group-hover:scale-110 transition shrink-0" />
              <div className="text-left min-w-0">
                <div className="text-xs font-bold leading-tight truncate">Snapcraft</div>
                <div className="text-[10px] text-gray-400 font-mono">Snap Store</div>
              </div>
            </a>

            {/* Flathub / Flatpak */}
            <a
              href="https://flathub.org/apps/org.guldasta.cutecutpro"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#14141f] hover:bg-[#1c1c2b] border border-[#28283c] hover:border-purple-400/60 text-gray-200 hover:text-white transition group cursor-pointer shadow-lg shadow-black/40"
              title="Install from Flathub (Flatpak)"
            >
              <Package className="w-4 h-4 text-purple-400 group-hover:scale-110 transition shrink-0" />
              <div className="text-left min-w-0">
                <div className="text-xs font-bold leading-tight truncate">Flathub</div>
                <div className="text-[10px] text-gray-400 font-mono">Flatpak</div>
              </div>
            </a>
          </div>
        </div>

        {/* Quick Quick-Action Toolbar Dashboard Banner */}
        <div className="w-full max-w-5xl bg-[#11111a] border border-[#252538] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#202030]">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-gray-400 ml-2 font-bold uppercase tracking-wider">CUTECUT PRO — Studio Dashboard</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Real-Time WebGL + WASM</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left side: The 4 Interactive Template Options */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-3.5">
              <div className="text-left">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-extrabold block mb-1">Interactive Studio</span>
                <h3 className="text-lg font-black text-white leading-tight">Timeline & Auto-Alignment Preview</h3>
                <p className="text-[11px] text-gray-400 leading-relaxed mt-1">
                  Select any preset below to instantly preview the live auto-segmentation track, metallic 3D calligraphy shaders, or the viral multi-track CapCut-grade editor layout.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {[
                  { id: 'tpl-quran-reels', title: 'Quran Tilawat Reels', desc: '9:16 Auto Arabic & Urdu text', borderClass: 'border-emerald-500/50', textClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10', icon: BookOpen, slideIdx: 0 },
                  { id: 'tpl-cinematic-documentary', title: '16:9 YouTube Docu', desc: 'Cinematic landscape layout with transitions', borderClass: 'border-cyan-500/50', textClass: 'text-cyan-400', bgClass: 'bg-cyan-500/10', icon: Film, slideIdx: 1 },
                  { id: 'tpl-viral-captions', title: 'Viral Captions', desc: 'Word-by-word dynamic glowing text', borderClass: 'border-purple-500/50', textClass: 'text-purple-400', bgClass: 'bg-purple-500/10', icon: Type, slideIdx: 2 },
                  { id: 'tpl-cyber-calligraphy', title: '3D Calligraphy', desc: 'Gold foil, metallic stroke & neon glow', borderClass: 'border-amber-500/50', textClass: 'text-amber-400', bgClass: 'bg-amber-500/10', icon: Palette, slideIdx: 3 }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = currentSlide === item.slideIdx;
                  return (
                    <div 
                      key={item.id}
                      onClick={() => {
                        setCurrentSlide(item.slideIdx);
                        onLoadTemplate(item.id);
                      }}
                      className={`p-3 rounded-2xl text-left transition cursor-pointer flex items-center gap-3 border ${
                        isActive 
                          ? `bg-[#181a2e] ${item.borderClass} shadow-xl shadow-cyan-500/5` 
                          : 'bg-[#151522] border-[#222238] hover:bg-[#1b1b2a] hover:border-cyan-500/30'
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${item.bgClass} ${item.textClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white mb-0.5">{item.title}</h4>
                        <p className="text-[10px] text-gray-400 truncate">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right side: The Auto-Playing Slideshow showing video editing / auto-segmentation previews */}
            <div className="lg:col-span-7 flex flex-col justify-between bg-[#12121c]/80 border border-[#232336] rounded-3xl p-5 relative overflow-hidden shadow-2xl min-h-[350px]">
              {/* Slideshow Ambient Background */}
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-transparent pointer-events-none" />

              {/* Active Slide Header */}
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-black tracking-wider uppercase px-2 py-0.5 rounded-full border bg-[#151928] border-cyan-500/30 text-cyan-400">
                    {slideshowSlides[currentSlide].badge}
                  </span>
                  <span className="text-[10px] text-gray-500 font-semibold">• Slide Showcase</span>
                </div>
                {/* Slide indicator dots */}
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2, 3].map((idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        idx === currentSlide ? 'bg-cyan-400 w-4' : 'bg-gray-600 hover:bg-gray-500'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Slide Visual (The Auto-Alignment or Timeline layout) */}
              <div className="flex-1 flex flex-col justify-center relative z-10 mb-4 transition-all duration-500 ease-in-out">
                {slideshowSlides[currentSlide].visual}
              </div>

              {/* Active Slide Description */}
              <div className="relative z-10 border-t border-[#1f1f2e] pt-4 text-left">
                <div className="flex items-center gap-2 text-xs font-black text-white mb-1.5">
                  {React.createElement(slideshowSlides[currentSlide].icon, { className: "w-4 h-4 text-cyan-400" })}
                  <span className="uppercase tracking-wide text-xs">{slideshowSlides[currentSlide].title}</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  {slideshowSlides[currentSlide].desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Templates Showcase Section (CapCut Gallery Style) */}
      <section id="templates" className="py-16 px-4 lg:px-8 max-w-7xl mx-auto w-full border-t border-[#1a1a28]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2 font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ready-To-Use Video Presets</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Popular Video Templates</h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {(['all', 'quran', 'shorts', 'cinematic', 'calligraphy'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                    : 'bg-[#151520] hover:bg-[#1f1f2e] text-gray-400 hover:text-white border border-[#272738]'
                }`}
              >
                {cat === 'all' ? 'All Templates' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => onLoadTemplate(tpl.id)}
              className="group relative bg-[#12121c] border border-[#222234] hover:border-cyan-500/60 rounded-3xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                <img
                  src={tpl.thumbnailUrl}
                  alt={tpl.title}
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${tpl.gradient}`} />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${tpl.badgeColor} backdrop-blur-md`}>
                    {tpl.badge}
                  </span>
                  <span className="text-[10px] font-mono bg-black/60 text-gray-300 px-2 py-0.5 rounded-full backdrop-blur-md">
                    {tpl.aspectRatio}
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 text-[10px] font-mono bg-black/70 text-white px-2 py-0.5 rounded-md backdrop-blur-md">
                  {tpl.duration}
                </div>

                {/* Hover Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-xs">
                  <div className="w-12 h-12 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-lg shadow-cyan-400/40 transform scale-75 group-hover:scale-100 transition-transform">
                    <Play className="w-5 h-5 fill-black ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Template Content Info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition mb-1.5">
                    {tpl.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {tpl.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1f1f2e] flex items-center justify-between text-xs font-semibold text-cyan-400">
                  <span>Open in Video Studio</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Powerful Feature Highlights (Filmora / CapCut Comparison) */}
      <section id="features" className="py-16 px-4 lg:px-8 max-w-7xl mx-auto w-full border-t border-[#1a1a28]">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-widest mb-2 font-mono">
            <Zap className="w-3.5 h-3.5" />
            <span>High Performance Web Studio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            Engineered for Creators & Tilawat Channels
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            Everything you need to produce broadcast-quality videos with zero watermarks and full cloud persistence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-[#12121c] border border-[#202030] hover:border-[#35354e] transition flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border ${feat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Cloud & Realtime Database Section (Farbase / Firestore) */}
      <section id="cloud" className="py-16 px-4 lg:px-8 max-w-7xl mx-auto w-full border-t border-[#1a1a28]">
        <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-teal-950/40 border border-cyan-500/30 rounded-3xl p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold mb-4">
              <Cloud className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cloud Firestore Database Connected</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">
              Never Lose Your Edits with Automatic Cloud Sync
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
              Sign in with Google to securely store all your audio tracks, video clips, 
              custom calligraphy presets, and multi-track timelines directly in Google Cloud Firestore.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={user ? onOpenEditor : onOpenAuth}
                className="px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs shadow-lg shadow-cyan-400/25 transition cursor-pointer"
              >
                {user ? 'Continue Editing Project' : 'Connect Google Cloud Account'}
              </button>
              <button
                onClick={onOpenProjectModal}
                className="px-5 py-3 rounded-xl bg-[#161624] hover:bg-[#212136] border border-[#2d2d42] text-gray-200 font-bold text-xs transition cursor-pointer"
              >
                Manage Saved Projects
              </button>
            </div>
          </div>

          {/* Cloud Info Visual Badge */}
          <div className="w-full md:w-auto p-6 rounded-2xl bg-[#0f0f18]/80 border border-[#25253a] space-y-3 font-mono text-xs text-gray-300">
            <div className="flex items-center justify-between gap-6 pb-2 border-b border-[#202030]">
              <span className="text-gray-400">Database Engine:</span>
              <span className="text-cyan-400 font-bold">Cloud Firestore</span>
            </div>
            <div className="flex items-center justify-between gap-6 pb-2 border-b border-[#202030]">
              <span className="text-gray-400">Auto Save Interval:</span>
              <span className="text-emerald-400 font-bold">Continuous</span>
            </div>
            <div className="flex items-center justify-between gap-6 pb-2 border-b border-[#202030]">
              <span className="text-gray-400">Export Engine:</span>
              <span className="text-amber-400 font-bold">WASM 4K 60FPS</span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-gray-400">Cloud Status:</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Active
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#181826] bg-[#0c0c14] py-8 px-4 lg:px-8 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-300 font-bold">CUTECUT PRO Suite</span>
            <span>— Free High-Performance Video Editor</span>
          </div>
          <p className="text-[11px] text-gray-400 font-mono">
            Designed for Quran Tilawat Channels & Content Creators • Cloud Powered
          </p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPortal;
