import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Scissors,
  Music,
  Video,
  Smartphone,
  CheckCircle2,
  Sliders,
  Type,
  Layers,
  HelpCircle,
  ExternalLink,
  Laptop,
  Play
} from 'lucide-react';

export interface GuidesPageViewProps {
  theme: 'dark' | 'light';
  onOpenEditor: (aspectRatio?: '16:9' | '9:16' | '1:1') => void;
  onOpenQuranStudio?: () => void;
  onBackToWebsite: () => void;
}

interface GuideItem {
  id: string;
  title: string;
  category: 'quran' | 'audio' | 'mobile' | 'export';
  categoryLabel: string;
  readTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
  aspectRatioPref: '9:16' | '16:9' | '1:1';
  steps: { title: string; instruction: string; tip?: string }[];
  faqs: { q: string; a: string }[];
}

const ALL_GUIDES: GuideItem[] = [
  {
    id: 'guide-quran-subtitles',
    title: 'How to Create Word-by-Word Quran Subtitles (Lafz ba Lafz) & Tajweed Colors',
    category: 'quran',
    categoryLabel: 'Quran & Islamic',
    readTime: '4 min read',
    difficulty: 'Beginner',
    summary: 'Learn how to generate synced Arabic calligraphy, translation subtitles, and real-time karaoke glowing word highlights for TikTok, YouTube Shorts, and Reels.',
    aspectRatioPref: '9:16',
    steps: [
      {
        title: 'Step 1: Open Quran Studio & Choose Surah',
        instruction: 'Click on the Quran Studio button in the toolbar. Select your desired Surah (e.g. Surah Al-Mulk, Surah Ar-Rahman, or Surah Yasin) and pick your preferred reciter audio (Mishari Rashid, Al-Ghamdi, or Minshawi).',
        tip: 'You can also upload your own recitation MP3 file into the Media Panel if you have custom voiceover audio.'
      },
      {
        title: 'Step 2: Choose Caption Display Mode',
        instruction: 'Under Caption Mode, choose either "Full Ayah with Karaoke Word Glow" or "Single-Word (Lafz ba Lafz) Viral Pop". The system automatically sets up Uthmanic Arabic calligraphy with end-of-verse medallions.',
        tip: 'CuteCut Pro uses authentic King Fahd Complex Hafs typography for 100% scripture accuracy.'
      },
      {
        title: 'Step 3: Fine-Tune Timing on the Multi-Track Timeline',
        instruction: 'Drag your Quran Arabic track and Translation track on the timeline. Touch or click any word on the preview canvas to drag its location or resize it using corner brackets.',
        tip: 'On Android, you can pinch-to-zoom on the timeline bar to edit split-second Tajweed timings.'
      },
      {
        title: 'Step 4: Export in 9:16 Ultra HD without Watermark',
        instruction: 'Hit the Export button at top right. Select 1080p or 4K 60FPS. Your exported video renders directly in your browser with zero watermarks.',
        tip: 'Enable Smart Bitrate to get crisp 1080p Reels files under 25MB for instant uploading.'
      }
    ],
    faqs: [
      {
        q: 'Do I need to type the Arabic Ayahs manually?',
        a: 'No! CuteCut Pro has all 114 Surahs and 6,236 Ayahs built-in with verified Uthmanic text and English/Urdu translations.'
      },
      {
        q: 'Can I add Ayah numbers and ornate circles?',
        a: 'Yes, end-of-verse crowned medallions (Ayah symbols) are placed automatically and formatted according to Islamic calligraphy standards.'
      }
    ]
  },
  {
    id: 'guide-audio-editing',
    title: 'How to Edit, Cut & Multi-Track Audio with Studio Waveforms',
    category: 'audio',
    categoryLabel: 'Audio Engineering',
    readTime: '5 min read',
    difficulty: 'Intermediate',
    summary: 'Master audio trimming, blade splits, background noise reduction, EQ frequency shaping, and real-time waveform visualizers.',
    aspectRatioPref: '16:9',
    steps: [
      {
        title: 'Step 1: Import Vocal & Background Audio Tracks',
        instruction: 'Import your primary voiceover/reciter MP3 onto the primary audio track and ambient soundscapes onto the secondary BGM track in the timeline.',
        tip: 'Keep background music volume between 15% and 25% so vocals remain crystal clear.'
      },
      {
        title: 'Step 2: Use Blade Split to Cut Breathing Pauses',
        instruction: 'Place the yellow playhead at the pause you want to remove. Tap the Blade Split tool (or press "S" on keyboard) to split the audio clip, then delete the silence slice.',
        tip: 'CuteCut Pro has an Auto-Remove Silence tool in the toolbar that detects dead space automatically.'
      },
      {
        title: 'Step 3: Apply 32-Bit Float Studio Limiter & Reverb',
        instruction: 'Select your audio clip, open Inspector, and enable Studio Reverb (Cathedral or Sacred Room) for an authentic reciter acoustic feel.',
        tip: 'The built-in Peak Limiter prevents harsh digital clipping even when boosting volume.'
      },
      {
        title: 'Step 4: Enable Islamic Audio Waveform Visualizer',
        instruction: 'Toggle "Show Audio Waveform" in player settings. Choose between Bars, Floating Wave, or Mirror style to give viewers an interactive visual experience.',
        tip: 'Set waveform color to Amber Gold (#F59E0B) for classic aesthetic reels.'
      }
    ],
    faqs: [
      {
        q: 'Does CuteCut Pro support multi-track audio mixing?',
        a: 'Yes, you can stack unlimited vocal, sound effects, and background music tracks with individual volume and mute controls.'
      },
      {
        q: 'Will my audio lose quality upon export?',
        a: 'No, audio is processed using lossless Web Audio API DSP and encoded in high-fidelity 320kbps AAC stereo.'
      }
    ]
  },
  {
    id: 'guide-android-mobile',
    title: 'Android & Mobile Touch Timeline Workflow: CapCut Style Guide',
    category: 'mobile',
    categoryLabel: 'Mobile & Android',
    readTime: '3 min read',
    difficulty: 'Beginner',
    summary: 'A fast guide to mobile gesture controls, pinch-to-zoom timeline navigation, on-canvas tap selection, and 9:16 vertical reels creation.',
    aspectRatioPref: '9:16',
    steps: [
      {
        title: 'Step 1: Install PWA for Native Fullscreen App Experience',
        instruction: 'Tap the "Install App" button in Chrome or Safari to add CuteCut Pro directly to your Android home screen as a standalone offline APK/PWA.',
        tip: 'The installed version runs with zero browser address bars and native 60FPS hardware acceleration.'
      },
      {
        title: 'Step 2: Navigate with Touch Gestures',
        instruction: 'Use two fingers to pinch-to-zoom on the timeline ruler. Drag clips with a single finger touch to slide their start and end points.',
        tip: 'Tap directly on text on the preview canvas to drag it anywhere on screen.'
      },
      {
        title: 'Step 3: Quick 1-Tap Aspect Ratio Switching',
        instruction: 'Use the top-left ratio button to switch instantly between 9:16 (TikTok/Reels), 16:9 (YouTube), and 1:1 (Instagram Feed).',
        tip: 'All text layers automatically adjust their optical bounds when you change screen orientations.'
      }
    ],
    faqs: [
      {
        q: 'Can I use CuteCut Pro on low-end Android phones?',
        a: 'Yes, the lightweight WebCodecs engine uses minimal RAM compared to heavy native video editing apps.'
      },
      {
        q: 'Does it work without internet connection?',
        a: 'Yes! Once loaded or installed as a PWA, CuteCut Pro caches its engine and works completely offline.'
      }
    ]
  },
  {
    id: 'guide-export-4k',
    title: 'How to Export 4K Ultra HD & Smart Bitrate Videos with Zero Watermark',
    category: 'export',
    categoryLabel: 'Export & Quality',
    readTime: '3 min read',
    difficulty: 'Beginner',
    summary: 'Understand bitrate settings, 60 FPS frame rates, WebM/MP4 container formats, and how to get maximum viral clarity on social media.',
    aspectRatioPref: '9:16',
    steps: [
      {
        title: 'Step 1: Configure Resolution & Target Frame Rate',
        instruction: 'Click the Export button. Choose 1080p (Full HD) for everyday reels or 4K (2160p) for high-end cinematic YouTube uploads.',
        tip: 'For TikTok and Instagram Reels, 1080p at 60 FPS is recommended by algorithm compression standards.'
      },
      {
        title: 'Step 2: Choose Smart Bitrate Mode',
        instruction: 'Select "Smart Compact Bitrate (~25MB)" to avoid heavy file sizes, or "Mastering Bitrate (~80MB)" for studio archiving.',
        tip: 'Smart Bitrate utilizes adaptive perceptual quantization to keep crisp details with small file sizes.'
      },
      {
        title: 'Step 3: Save Directly to Device Gallery',
        instruction: 'Click "Start Export". Once rendering finishes, tap "Save to Photos/Gallery" to download the file directly to your smartphone or PC.',
        tip: 'CuteCut Pro never stamps any watermark or logo on your exports, even on the free version.'
      }
    ],
    faqs: [
      {
        q: 'Why does social media compress my video?',
        a: 'Platforms compress files over 100MB heavily. Using CuteCut Pro\'s Smart Bitrate keeps files under 30MB, preserving sharpness.'
      },
      {
        q: 'Is there a limit on how many videos I can export?',
        a: 'No, you have unlimited free exports forever with zero restrictions.'
      }
    ]
  }
];

export const GuidesPageView: React.FC<GuidesPageViewProps> = ({
  theme,
  onOpenEditor,
  onOpenQuranStudio,
  onBackToWebsite,
}) => {
  const isDark = theme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'quran' | 'audio' | 'mobile' | 'export'>('all');
  const [expandedGuideId, setExpandedGuideId] = useState<string>('guide-quran-subtitles');

  const filteredGuides = useMemo(() => {
    return ALL_GUIDES.filter((g) => {
      const matchesCategory = activeCategory === 'all' || g.category === activeCategory;
      const matchesQuery =
        searchQuery.trim().length === 0 ||
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className={`w-full max-w-5xl mx-auto space-y-10 pb-16 ${isDark ? 'text-gray-100' : 'text-slate-800'}`}>
      
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <button
          onClick={onBackToWebsite}
          className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer ${
            isDark ? 'bg-[#181828] text-gray-300 hover:text-white hover:bg-[#222238]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <span>← Back to Showcase</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenEditor('9:16')}
            className="flex items-center gap-2 text-xs font-extrabold px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-lg shadow-cyan-500/20 transition cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>Launch CuteCut Editor</span>
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <div className={`rounded-3xl p-6 sm:p-10 border text-center space-y-4 relative overflow-hidden ${
        isDark ? 'bg-gradient-to-b from-[#16122e] to-[#0d0d18] border-white/10 shadow-2xl' : 'bg-gradient-to-b from-blue-50 to-white border-slate-200 shadow-lg'
      }`}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>CuteCut Pro Knowledge Base & User Guides</span>
        </div>

        <h1 className={`text-2xl sm:text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Step-by-Step Tutorials & Masterclasses
        </h1>

        <p className="max-w-2xl mx-auto text-xs sm:text-sm text-gray-400 leading-relaxed">
          Learn how to create viral Quran TikTok reels, edit multi-track audio, master mobile touch timelines, and export 4K videos without watermarks.
        </p>

        {/* Search Bar */}
        <div className="max-w-md mx-auto pt-2">
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition ${
            isDark ? 'bg-[#0f0f1c] border-[#292942] focus-within:border-cyan-400' : 'bg-white border-slate-300 focus-within:border-cyan-500 shadow-sm'
          }`}>
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides (e.g. subtitles, audio, 4K)..."
              className="w-full bg-transparent text-xs outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-xs text-gray-400 hover:text-white">
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {[
          { id: 'all', label: 'All Guides' },
          { id: 'quran', label: '📖 Quran & Subtitles' },
          { id: 'audio', label: '🎙️ Audio & Voiceover' },
          { id: 'mobile', label: '📱 Android & Mobile' },
          { id: 'export', label: '⚡ 4K & Export' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                : isDark
                ? 'bg-[#141424] text-gray-400 hover:text-white hover:bg-[#1e1e32]'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Guides List */}
      <div className="space-y-6">
        {filteredGuides.map((guide) => {
          const isExpanded = expandedGuideId === guide.id;

          return (
            <div
              key={guide.id}
              className={`rounded-2xl border transition-all ${
                isDark ? 'bg-[#121222] border-[#222238]' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              {/* Header Accordion Bar */}
              <div
                onClick={() => setExpandedGuideId(isExpanded ? '' : guide.id)}
                className="p-5 sm:p-6 flex items-start sm:items-center justify-between gap-4 cursor-pointer select-none"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    <span className="font-bold text-cyan-400 uppercase tracking-wider text-[10px]">
                      {guide.categoryLabel}
                    </span>
                    <span>•</span>
                    <span>{guide.readTime}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-medium">{guide.difficulty}</span>
                  </div>

                  <h3 className={`text-base sm:text-lg font-black leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {guide.title}
                  </h3>

                  <p className="text-xs text-gray-400 line-clamp-2">
                    {guide.summary}
                  </p>
                </div>

                <div className="shrink-0 p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {/* Expanded Guide Content */}
              {isExpanded && (
                <div className={`p-5 sm:p-6 pt-0 border-t space-y-6 ${isDark ? 'border-[#1e1e30]' : 'border-slate-100'}`}>
                  
                  {/* Step-by-Step Sections */}
                  <div className="space-y-4 pt-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      Step-by-Step Instructions
                    </h4>

                    <div className="grid grid-cols-1 gap-3.5">
                      {guide.steps.map((st, sIdx) => (
                        <div
                          key={sIdx}
                          className={`p-4 rounded-xl border space-y-1.5 ${
                            isDark ? 'bg-[#0e0e1a] border-[#222238]' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>{st.title}</span>
                          </div>
                          <p className="text-xs text-gray-300 leading-relaxed pl-6">
                            {st.instruction}
                          </p>
                          {st.tip && (
                            <div className="ml-6 mt-1 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                              <span className="font-bold">Pro Tip: </span>
                              {st.tip}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Frequently Asked Questions */}
                  {guide.faqs.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                        <HelpCircle className="w-3.5 h-3.5" />
                        Frequently Asked Questions
                      </h4>

                      <div className="space-y-2">
                        {guide.faqs.map((faq, fIdx) => (
                          <div
                            key={fIdx}
                            className={`p-3.5 rounded-xl border ${
                              isDark ? 'bg-[#0f0f1e] border-[#202036]' : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="font-bold text-xs text-white mb-1">
                              Q: {faq.q}
                            </div>
                            <div className="text-xs text-gray-400 leading-relaxed">
                              {faq.a}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action CTA */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                    <span className="text-xs text-gray-400">
                      Ready to apply this guide in your project?
                    </span>
                    <button
                      onClick={() => onOpenEditor(guide.aspectRatioPref)}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-extrabold shadow-md flex items-center gap-2 transition cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>Open Editor with {guide.aspectRatioPref} Preset</span>
                    </button>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
