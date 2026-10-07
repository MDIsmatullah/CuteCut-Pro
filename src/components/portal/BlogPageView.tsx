import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Sparkles,
  ArrowRight,
  Clock,
  User,
  Share2,
  Bookmark,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Play,
  X,
  Copy,
  Check,
  Tag
} from 'lucide-react';

export interface BlogPageViewProps {
  theme: 'dark' | 'light';
  onOpenEditor: (aspectRatio?: '16:9' | '9:16' | '1:1') => void;
  onOpenQuranStudio?: () => void;
  onBackToWebsite: () => void;
}

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: 'android' | 'viral' | 'quran' | 'audio' | 'comparison';
  categoryLabel: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  featured: boolean;
  image: string;
  excerpt: string;
  content: {
    intro: string;
    sections: { heading: string; body: string; bulletPoints?: string[] }[];
    conclusion: string;
  };
}

const ALL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-top-android-editors',
    slug: 'top-5-video-editors-android-2026',
    title: 'Top 5 Video Editors for Android in 2026: Why CuteCut Pro is the Best CapCut Alternative',
    category: 'android',
    categoryLabel: 'Android & Mobile',
    author: 'Asmatullah Developer',
    authorRole: 'Lead Video Systems Architect',
    date: 'Oct 6, 2026',
    readTime: '6 min read',
    featured: true,
    image: 'https://images.pexels.com/photos/1092671/pexels-photo-1092671.jpeg?auto=compress&cs=tinysrgb&w=800',
    excerpt: 'Looking for a powerful video editor on Android without watermarks, ads, or subscription fees? We compare CapCut, KineMaster, VN, Filmora, and CuteCut Pro.',
    content: {
      intro: 'Android users have long struggled with heavy video editors that constantly push $15/month subscriptions or lock basic features like 1080p 60FPS behind paywalls. In 2026, lightweight WebCodecs and PWA technology have revolutionized what is possible on mobile devices.',
      sections: [
        {
          heading: '1. The Problem with Mainstream Mobile Video Editors',
          body: 'Most native apps like CapCut and KineMaster suffer from three major drawbacks for daily creators:',
          bulletPoints: [
            'Forced Watermarks: Free tiers paste large intrusive logos on the final export.',
            'Aggressive Cloud Tracking: Projects and raw clips are uploaded to remote servers, compromising personal privacy.',
            'Massive App Size: Over 250MB storage footprint that chokes budget and mid-range Android phones.'
          ]
        },
        {
          heading: '2. Why CuteCut Pro is Different',
          body: 'CuteCut Pro was built from the ground up on modern WebAssembly and WebCodecs technology. It runs entirely inside your browser and can be installed with 1 tap as an offline PWA. Key advantages include:',
          bulletPoints: [
            'Zero Watermark Guarantee: Export in 1080p and 4K completely watermark-free.',
            'Dedicated Quran & Calligraphy Engine: Authentic Uthmanic Arabic typography with automatic ayah markers.',
            'Touch Pinch-to-Zoom Timeline: Fluid multi-track editing tailored specifically for mobile touch screens.'
          ]
        },
        {
          heading: '3. Performance & Battery Efficiency Benchmark',
          body: 'Because CuteCut Pro leverages hardware-accelerated WebGL and Web Audio APIs, rendering a 30-second 1080p reel uses up to 40% less battery compared to traditional native editors.'
        }
      ],
      conclusion: 'If you want a modern, watermark-free video editor that respects your privacy and supports professional multi-track audio and Arabic typography, CuteCut Pro is the definitive choice for Android in 2026.'
    }
  },
  {
    id: 'post-viral-quran-tiktok',
    slug: 'how-to-viral-quran-videos-tiktok-reels',
    title: 'How to Make Viral Quran Videos for TikTok & Reels (10M+ Views Formula)',
    category: 'viral',
    categoryLabel: 'Viral Content Strategy',
    author: 'Hamza Al-Basri',
    authorRole: 'Islamic Content Strategist',
    date: 'Oct 4, 2026',
    readTime: '5 min read',
    featured: false,
    image: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=800',
    excerpt: 'The secret algorithm behind viral Quran reels with millions of views: word-by-word pop captions, 4K starry backgrounds, and Tajweed karaoke synchronization.',
    content: {
      intro: 'Short-form platforms like TikTok, Instagram Reels, and YouTube Shorts prioritize watch time and emotional resonance. Islamic content consistently outperforms other niches when presented with aesthetic typography and cinematic pacing.',
      sections: [
        {
          heading: '1. The 3-Second Hook Rule',
          body: 'Viewers decide whether to stay on your video within the first 2.5 seconds. Start immediately with a striking visual background—such as starry galaxies, golden hour ocean waves, or misty pine forests—paired with an evocative reciter vocal.',
          bulletPoints: [
            'Use high-contrast 4K stock footage from Pexels or Pixabay.',
            'Ensure the Arabic scripture starts centered at eye-level (40% to 50% from screen top).',
            'Avoid lengthy intro titles or watermarks that distract the viewer.'
          ]
        },
        {
          heading: '2. Single-Word Pop (Lafz ba Lafz) vs Full Ayah',
          body: 'CuteCut Pro’s Single-Word mode shows each Arabic and translation word as it is spoken by the Qari. This dynamic micro-motion keeps eyes glued to the center of the screen, skyrocketing average percentage viewed (APV).'
        },
        {
          heading: '3. Sound Mastering & Reverb',
          body: 'Dry voiceovers sound amateurish on smartphone speakers. Adding CuteCut Pro’s Cathedral Reverb gives the reciter’s voice sacred acoustics that stop scrollers in their tracks.'
        }
      ],
      conclusion: 'Consistency and aesthetic quality are key. Use CuteCut Pro templates to produce 2 to 3 reels daily in under 15 minutes each.'
    }
  },
  {
    id: 'post-tajweed-karaoke-guide',
    slug: 'guide-tajweed-karaoke-subtitles-uthmani-fonts',
    title: 'The Complete Guide to Tajweed Karaoke Subtitles & Uthmanic Arabic Typography',
    category: 'quran',
    categoryLabel: 'Quran & Typography',
    author: 'Ustadh Bilal Tariq',
    authorRole: 'Arabic Calligraphy Consultant',
    date: 'Sep 29, 2026',
    readTime: '7 min read',
    featured: false,
    image: 'https://images.pexels.com/photos/4348404/pexels-photo-4348404.jpeg?auto=compress&cs=tinysrgb&w=800',
    excerpt: 'Why standard system fonts fail when displaying Quranic Arabic, and how CuteCut Pro implements authentic King Fahd Complex Uthmanic Hafs calligraphy.',
    content: {
      intro: 'Quranic Arabic contains specialized diacritical marks, dagger alifs, sukoons, and madd signs that standard web fonts (like Arial or system Arabic) frequently misplace or break. Presenting the Quran with typographical perfection is an obligation of reverence.',
      sections: [
        {
          heading: '1. Understanding Uthmanic Hafs Typography',
          body: 'The King Fahd Glorious Quran Printing Complex (KFGQPC) established the gold standard for digital Mushaf typography. CuteCut Pro bundles the complete authentic Hafs v14 and v20 font glyphs, ensuring zero ligature errors.'
        },
        {
          heading: '2. The Real-Time Karaoke Glow Engine',
          body: 'Instead of jumping from line to line, CuteCut Pro calculates phonetic duration weights for each Arabic word, gently illuminating the active word with an amber gold glow (#F59E0B) precisely as the reciter finishes reciting it.',
          bulletPoints: [
            'Phonetic Tajweed weighting prevents short words from lingering too long.',
            'Sub-pixel integer rendering eliminates shaking and micro-jitter on mobile displays.',
            'Automatic stripping ensures Ayah symbols only appear on genuine Arabic, never on translation text.'
          ]
        }
      ],
      conclusion: 'With CuteCut Pro, creating broadcast-quality Quran videos no longer requires years of graphic design experience.'
    }
  },
  {
    id: 'post-audio-mastering-reciters',
    slug: 'how-to-master-audio-quran-recitations',
    title: 'How to Master Audio for Quran Recitations: EQ, Reverb & Limiter Settings',
    category: 'audio',
    categoryLabel: 'Audio Engineering',
    author: 'Asmatullah Developer',
    authorRole: 'Lead Video Systems Architect',
    date: 'Sep 24, 2026',
    readTime: '5 min read',
    featured: false,
    image: 'https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg?auto=compress&cs=tinysrgb&w=800',
    excerpt: 'Turn raw phone recordings into rich studio-quality reciter vocals using CuteCut Pro 32-bit float Web Audio DSP and built-in acoustic reverbs.',
    content: {
      intro: 'Even the most beautiful recitation can sound dull if recorded in an untreated room with background air conditioning noise. Here is how to achieve clean, resonant acoustics in CuteCut Pro.',
      sections: [
        {
          heading: '1. Blade Split Silence Trimming',
          body: 'Cut out breathing pauses between verses using the Blade Split tool (Hotkey: S). Deleting the empty room tone prevents unwanted hiss during quiet moments.'
        },
        {
          heading: '2. Equalization & Vocal Presence',
          body: 'Boost high frequencies around 4kHz to 6kHz slightly to give the Arabic letters (like Haa and Saad) crisp articulation without becoming piercing.'
        },
        {
          heading: '3. Acoustic Reverberation',
          body: 'Enable Cathedral or Sanctuary Reverb with a decay time between 1.8s and 2.4s. Keep the wet/dry mix around 20% to 28% so the vocal remains forward and intelligible.'
        }
      ],
      conclusion: 'High quality audio is 50% of the video experience. CuteCut Pro gives you professional mastering tools right inside your browser.'
    }
  },
  {
    id: 'post-capcut-vs-filmora-comparison',
    slug: 'capcut-vs-filmora-vs-cutecut-pro-comparison',
    title: 'CapCut vs Filmora vs CuteCut Pro: Complete Comparison & Why Creators Are Switching',
    category: 'comparison',
    categoryLabel: 'Software Comparison',
    author: 'Hamza Al-Basri',
    authorRole: 'Video Tech Reviewer',
    date: 'Oct 5, 2026',
    readTime: '8 min read',
    featured: false,
    image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800',
    excerpt: 'Tired of Filmora watermarks and CapCut Pro cloud subscription lockouts? We break down features, export speeds, and pricing between the top 3 editors.',
    content: {
      intro: 'Both CapCut and Wondershare Filmora dominate the casual video editing space, but both have become increasingly aggressive with subscriptions and export restrictions. CuteCut Pro provides a breath of fresh air with unlimited 4K exports and zero watermarks.',
      sections: [
        {
          heading: '1. The Watermark & Subscription Trap',
          body: 'Filmora’s free version plasters a massive watermark across the center of your screen, rendering the exported video unusable for social media. CapCut Pro locks 4K 60FPS behind a recurring monthly plan.',
          bulletPoints: [
            'CuteCut Pro has zero watermarks on all exported formats.',
            'No account or credit card required to access full 4K 60FPS timeline tools.',
            'Runs on WebCodecs hardware acceleration directly in the browser or offline PWA.'
          ]
        },
        {
          heading: '2. Multi-Track Timeline & Audio Capabilities',
          body: 'CuteCut Pro features precision blade cutting, volume envelopes, and 32-bit float audio DSP that rivals desktop suites without requiring heavy multi-gigabyte downloads.'
        }
      ],
      conclusion: 'For creators who want fast, unrestricted video editing without monthly subscription bills, CuteCut Pro is the clear winner in 2026.'
    }
  },
  {
    id: 'post-premiere-davinci-alternatives',
    slug: 'free-alternatives-to-premiere-pro-and-davinci-resolve',
    title: 'Best Free Alternatives to Adobe Premiere Pro & DaVinci Resolve for Quick Social Media Edits',
    category: 'comparison',
    categoryLabel: 'Pro Alternatives',
    author: 'Asmatullah Developer',
    authorRole: 'Lead Video Systems Architect',
    date: 'Oct 3, 2026',
    readTime: '6 min read',
    featured: false,
    image: 'https://images.pexels.com/photos/256381/pexels-photo-256381.jpeg?auto=compress&cs=tinysrgb&w=800',
    excerpt: 'Do you really need 32GB RAM and an expensive workstation to make TikTok reels and YouTube videos? Why CuteCut Pro is the fastest lightweight alternative.',
    content: {
      intro: 'Adobe Premiere Pro and Blackmagic DaVinci Resolve are legendary industry workhorses. However, firing up a 10GB application with complex project trees just to slice a 45-second reel or add auto-captions is overkill.',
      sections: [
        {
          heading: '1. Hardware Demands & System Crashes',
          body: 'Premiere Pro frequently encounters playback cache stuttering unless running on powerful desktop hardware with dedicated GPUs. CuteCut Pro was engineered with WebAssembly to run silky smooth on lightweight laptops and Android phones.'
        },
        {
          heading: '2. Automated Captioning & Calligraphy Workflow',
          body: 'While DaVinci Resolve requires manual subtitle track styling, CuteCut Pro generates glowing word-by-word captions, authentic Uthmanic Arabic calligraphy, and translation text with a single click.'
        }
      ],
      conclusion: 'Keep your heavy software for feature films, but use CuteCut Pro for lightning-fast daily social media publishing.'
    }
  }
];

export const BlogPageView: React.FC<BlogPageViewProps> = ({
  theme,
  onOpenEditor,
  onOpenQuranStudio,
  onBackToWebsite,
}) => {
  const isDark = theme === 'dark';
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const filteredPosts = useMemo(() => {
    return ALL_BLOG_POSTS.filter((p) => {
      const matchesCat = activeCategory === 'all' || p.category === activeCategory;
      const matchesQuery =
        searchQuery.trim().length === 0 ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className={`w-full max-w-5xl mx-auto space-y-10 pb-16 ${isDark ? 'text-gray-100' : 'text-slate-800'}`}>
      
      {/* Top Breadcrumb Navigation */}
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
        isDark ? 'bg-gradient-to-b from-[#1a1236] to-[#0d0d1a] border-white/10 shadow-2xl' : 'bg-gradient-to-b from-purple-50 to-white border-slate-200 shadow-lg'
      }`}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold">
          <FileText className="w-3.5 h-3.5" />
          <span>CuteCut Pro Insights, Tutorials & Algorithm Secrets</span>
        </div>

        <h1 className={`text-2xl sm:text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          The Creator Blog & Ranking Booster
        </h1>

        <p className="max-w-2xl mx-auto text-xs sm:text-sm text-gray-400 leading-relaxed">
          Master the art of viral video editing, Islamic content production, audio DSP mastering, and mobile video workflows.
        </p>

        {/* Search */}
        <div className="max-w-md mx-auto pt-2">
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition ${
            isDark ? 'bg-[#0f0f1c] border-[#292942] focus-within:border-cyan-400' : 'bg-white border-slate-300 focus-within:border-cyan-500 shadow-sm'
          }`}>
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles (e.g. Android, viral, tajweed)..."
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
          { id: 'all', label: 'All Articles' },
          { id: 'comparison', label: '⚔️ CapCut & Filmora Comparisons' },
          { id: 'android', label: '📱 Android Editors' },
          { id: 'viral', label: '🔥 Viral Strategy' },
          { id: 'quran', label: '📖 Quran Typography' },
          { id: 'audio', label: '🎙️ Audio Mastering' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : isDark
                ? 'bg-[#141424] text-gray-400 hover:text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Featured Article Banner if 'all' */}
      {activeCategory === 'all' && !searchQuery && (
        <div
          onClick={() => setSelectedPost(ALL_BLOG_POSTS[0])}
          className={`rounded-3xl border overflow-hidden cursor-pointer transition group ${
            isDark ? 'bg-[#131324] border-[#25253e] hover:border-cyan-500/50' : 'bg-white border-slate-200 shadow-md'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="h-56 sm:h-72 overflow-hidden relative">
              <img
                src={ALL_BLOG_POSTS[0].image}
                alt={ALL_BLOG_POSTS[0].title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute top-4 left-4 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-black text-amber-400 uppercase tracking-wider">
                ⭐ Featured Article
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-3">
              <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold uppercase tracking-wider">
                <span>{ALL_BLOG_POSTS[0].categoryLabel}</span>
                <span>•</span>
                <span className="text-gray-400">{ALL_BLOG_POSTS[0].readTime}</span>
              </div>

              <h2 className={`text-xl sm:text-2xl font-black leading-snug group-hover:text-cyan-400 transition ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {ALL_BLOG_POSTS[0].title}
              </h2>

              <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                {ALL_BLOG_POSTS[0].excerpt}
              </p>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-gray-400">
                  By <span className="font-bold text-white">{ALL_BLOG_POSTS[0].author}</span>
                </div>

                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition">
                  Read Article →
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Articles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className={`rounded-2xl border overflow-hidden cursor-pointer transition flex flex-col justify-between group ${
              isDark ? 'bg-[#121222] border-[#222238] hover:border-cyan-500/40' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div>
              <div className="h-44 overflow-hidden relative">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold text-cyan-300">
                  {post.categoryLabel}
                </div>
              </div>

              <div className="p-5 space-y-2.5">
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>{post.date}</span>
                  <span>•</span>
                  <Clock className="w-3 h-3" />
                  <span>{post.readTime}</span>
                </div>

                <h3 className={`text-base font-bold leading-snug group-hover:text-cyan-400 transition ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {post.title}
                </h3>

                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0 flex items-center justify-between text-xs border-t border-white/5 pt-3">
              <span className="text-[11px] text-gray-400">
                {post.author}
              </span>
              <span className="text-cyan-400 font-bold flex items-center gap-1">
                Read →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Full Article Reader Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className={`w-full max-w-3xl rounded-3xl border my-auto p-6 sm:p-10 space-y-6 relative max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-[#141424] border-white/10 text-gray-200 shadow-2xl' : 'bg-white border-slate-300 text-slate-900 shadow-2xl'
          }`}>
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Post Header */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-cyan-400 font-bold">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                  {selectedPost.categoryLabel}
                </span>
                <span>•</span>
                <span className="text-gray-400">{selectedPost.date}</span>
                <span>•</span>
                <span className="text-gray-400">{selectedPost.readTime}</span>
              </div>

              <h1 className={`text-2xl sm:text-3xl font-black leading-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {selectedPost.title}
              </h1>

              <div className="flex items-center justify-between gap-4 pt-1 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                    {selectedPost.author.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{selectedPost.author}</div>
                    <div className="text-[10px] text-gray-400">{selectedPost.authorRole}</div>
                  </div>
                </div>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Share Article'}</span>
                </button>
              </div>
            </div>

            {/* Featured Image */}
            <div className="rounded-2xl overflow-hidden h-60 sm:h-80">
              <img
                src={selectedPost.image}
                alt={selectedPost.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Article Body */}
            <div className="space-y-6 text-xs sm:text-sm text-gray-300 leading-relaxed">
              <p className="text-sm sm:text-base font-medium text-gray-100 italic border-l-2 border-cyan-400 pl-4">
                {selectedPost.content.intro}
              </p>

              {selectedPost.content.sections.map((sec, sIdx) => (
                <div key={sIdx} className="space-y-2.5 pt-2">
                  <h3 className={`text-base sm:text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {sec.heading}
                  </h3>
                  <p className="text-gray-300">{sec.body}</p>

                  {sec.bulletPoints && (
                    <ul className="space-y-1.5 pl-4 list-disc text-gray-400">
                      {sec.bulletPoints.map((bp, bpIdx) => (
                        <li key={bpIdx}>{bp}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-200">
                <span className="font-bold">Key Takeaway: </span>
                {selectedPost.content.conclusion}
              </div>
            </div>

            {/* Bottom Action CTA */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs text-gray-400">
                Put these techniques into practice right now:
              </span>
              <button
                onClick={() => {
                  setSelectedPost(null);
                  onOpenEditor('9:16');
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black text-xs font-black shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Open CuteCut Pro Editor</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
