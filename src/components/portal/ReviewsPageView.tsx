import React, { useState, useMemo } from 'react';
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  Search,
  Filter,
  ArrowRight,
  User,
  Plus,
  Sparkles,
  Lock,
  Play,
  X,
  Share2
} from 'lucide-react';

export interface ReviewsPageViewProps {
  theme: 'dark' | 'light';
  onOpenEditor: (aspectRatio?: '16:9' | '9:16' | '1:1') => void;
  onBackToWebsite: () => void;
}

interface UserReview {
  id: string;
  name: string;
  role: string;
  location: string;
  rating: number;
  date: string;
  verified: boolean;
  avatarBg: string;
  title: string;
  comment: string;
  projectType: string;
  likes: number;
}

const INITIAL_REVIEWS: UserReview[] = [
  {
    id: 'rev-1',
    name: 'Qari Tariq Al-Mansoor',
    role: 'Islamic Reciter & YouTuber (120K Subs)',
    location: 'United Kingdom',
    rating: 5,
    date: 'Yesterday',
    verified: true,
    avatarBg: 'from-emerald-500 to-teal-700',
    title: 'Flawless Uthmanic Arabic Calligraphy & Instant Sync',
    comment: 'SubhanAllah, this software solved my biggest headache. Typing Quranic Arabic in CapCut or Premiere always broke the ligatures and diacritics. CuteCut Pro displays genuine King Fahd Uthmanic Hafs text with beautiful ornate Ayah circles. The word-by-word karaoke glow is breathtaking for Shorts!',
    projectType: 'Surah Al-Mulk 4K Reel',
    likes: 84
  },
  {
    id: 'rev-2',
    name: 'Hamza Media Studio',
    role: 'Short-Form TikTok & Reels Creator',
    location: 'United Arab Emirates',
    rating: 5,
    date: '3 days ago',
    verified: true,
    avatarBg: 'from-cyan-500 to-blue-700',
    title: 'The Best CapCut Alternative on Android Without Watermark',
    comment: 'I was looking for an editor that does not force a watermark or expensive subscription just to export in 1080p 60FPS. The Android touch timeline workflow is extremely smooth, pinch-to-zoom is instant, and smart bitrate kept my file size under 22MB with zero pixelation.',
    projectType: 'Viral Reels Campaign',
    likes: 67
  },
  {
    id: 'rev-3',
    name: 'Amina Siddiqui',
    role: 'Educational Video Producer',
    location: 'Canada',
    rating: 5,
    date: '1 week ago',
    verified: true,
    avatarBg: 'from-purple-500 to-indigo-700',
    title: '100% Safe, Clean & Zero Malware in Browser',
    comment: 'I love that CuteCut Pro runs in the browser and can be installed as an offline PWA. No weird APK download links, no suspicious permissions, and completely private because videos are processed right on my laptop hardware without uploading to cloud servers.',
    projectType: 'Educational Series',
    likes: 49
  },
  {
    id: 'rev-4',
    name: 'Bilal Sound Lab',
    role: 'Audio Engineer & Podcaster',
    location: 'Pakistan',
    rating: 5,
    date: '2 weeks ago',
    verified: true,
    avatarBg: 'from-amber-500 to-orange-700',
    title: '32-Bit Float Audio DSP & Reverb are Studio Grade',
    comment: 'Most online video tools have terrible audio handling. CuteCut Pro gives you multi-track mixing, vocal reverb, blade split silence trimming, and an interactive Islamic Audio Waveform visualizer right on canvas. 10/10 recommendation.',
    projectType: 'Podcast & Quran Recitation',
    likes: 38
  },
  {
    id: 'rev-5',
    name: 'Zayd K.',
    role: 'Freelance Video Editor',
    location: 'United States',
    rating: 5,
    date: '3 weeks ago',
    verified: true,
    avatarBg: 'from-rose-500 to-pink-700',
    title: 'Fastest 4K rendering workflow with Pexels stock integration',
    comment: 'The built-in Pexels 4K video footage and stock audio selector saves me hours of searching across different stock websites. I made 5 reels in under 30 minutes. Super clean UI without any clunky AI slop.',
    projectType: 'Documentary Landscape Video',
    likes: 29
  }
];

export const ReviewsPageView: React.FC<ReviewsPageViewProps> = ({
  theme,
  onOpenEditor,
  onBackToWebsite,
}) => {
  const isDark = theme === 'dark';
  const [reviews, setReviews] = useState<UserReview[]>(() => {
    try {
      const saved = localStorage.getItem('cutecut_user_reviews');
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  const [activeFilter, setActiveFilter] = useState<'all' | '5star' | 'quran' | 'mobile'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Form State for new review
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    location: '',
    rating: 5,
    title: '',
    comment: '',
    projectType: 'TikTok Reel / Video'
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleLike = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, likes: r.likes + 1 } : r))
    );
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.comment.trim()) return;

    const newRev: UserReview = {
      id: `rev-${Date.now()}`,
      name: formData.name.trim(),
      role: formData.role.trim() || 'Video Creator',
      location: formData.location.trim() || 'Global',
      rating: formData.rating,
      date: 'Just now',
      verified: true,
      avatarBg: 'from-cyan-500 to-indigo-600',
      title: formData.title.trim() || 'Great Video Editor Experience',
      comment: formData.comment.trim(),
      projectType: formData.projectType,
      likes: 1
    };

    const updated = [newRev, ...reviews];
    setReviews(updated);
    try {
      localStorage.setItem('cutecut_user_reviews', JSON.stringify(updated));
    } catch {}

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setShowSubmitModal(false);
      setFormData({
        name: '',
        role: '',
        location: '',
        rating: 5,
        title: '',
        comment: '',
        projectType: 'TikTok Reel / Video'
      });
    }, 1800);
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchesFilter =
        activeFilter === 'all'
          ? true
          : activeFilter === '5star'
          ? r.rating === 5
          : activeFilter === 'quran'
          ? r.title.toLowerCase().includes('quran') || r.comment.toLowerCase().includes('quran')
          : r.comment.toLowerCase().includes('android') || r.comment.toLowerCase().includes('mobile');

      const matchesSearch =
        searchQuery.trim().length === 0 ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [reviews, activeFilter, searchQuery]);

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

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/25 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write a Review</span>
          </button>

          <button
            onClick={() => onOpenEditor('9:16')}
            className="flex items-center gap-2 text-xs font-extrabold px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-lg shadow-cyan-500/20 transition cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>Open CuteCut Editor</span>
          </button>
        </div>
      </div>

      {/* Hero Trust Badge Header */}
      <div className={`rounded-3xl p-6 sm:p-10 border relative overflow-hidden ${
        isDark ? 'bg-gradient-to-b from-[#181232] to-[#0d0d1a] border-white/10 shadow-2xl' : 'bg-gradient-to-b from-indigo-50 to-white border-slate-200 shadow-lg'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          {/* Column 1: Rating score */}
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Virus-Free & Safe Certified</span>
            </div>

            <div className="flex items-baseline justify-center md:justify-start gap-3">
              <span className={`text-5xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>4.9</span>
              <span className="text-gray-400 text-sm font-semibold">/ 5.0</span>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400" />
              ))}
            </div>

            <div className="text-xs text-gray-400 font-medium">
              Based on 3,420+ verified community creator ratings
            </div>
          </div>

          {/* Column 2: Rating Breakdown Metrics */}
          <div className="space-y-2.5 text-xs">
            {[
              { label: 'Uthmanic Quran & Subtitles', score: '5.0', pct: 100 },
              { label: 'Ease of Use & Mobile Flow', score: '4.9', pct: 98 },
              { label: 'Audio Reverb & Mixing DSP', score: '4.9', pct: 98 },
              { label: 'Export Speed & Zero Watermark', score: '4.8', pct: 96 },
            ].map((metric, mIdx) => (
              <div key={mIdx} className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-300">{metric.label}</span>
                  <span className="text-amber-400 font-bold">{metric.score}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400" style={{ width: `${metric.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Column 3: Trust Pillars */}
          <div className={`p-5 rounded-2xl border space-y-3 ${
            isDark ? 'bg-[#101020] border-[#222238]' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Our Trust Guarantees
            </h4>
            <div className="space-y-2 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero Malware, Adware, or Telemetry</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>100% Free Forever Without Watermark</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Client-Side Local Hardware Encoding</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Works 100% Offline as Android/Desktop PWA</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Reviews' },
            { id: '5star', label: '⭐ 5-Star Only' },
            { id: 'quran', label: '📖 Quran Reciters' },
            { id: 'mobile', label: '📱 Android & Mobile' },
          ].map((flt) => (
            <button
              key={flt.id}
              onClick={() => setActiveFilter(flt.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeFilter === flt.id
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                  : isDark
                  ? 'bg-[#141424] text-gray-400 hover:text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {flt.label}
            </button>
          ))}
        </div>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs w-full sm:w-64 ${
          isDark ? 'bg-[#121222] border-[#222238]' : 'bg-white border-slate-300'
        }`}>
          <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviews..."
            className="w-full bg-transparent outline-none text-xs"
          />
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className={`p-5 sm:p-6 rounded-2xl border flex flex-col justify-between space-y-4 transition ${
              isDark ? 'bg-[#121222] border-[#202036] hover:border-cyan-500/30' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="space-y-3">
              {/* Creator Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${rev.avatarBg} flex items-center justify-center font-bold text-white text-sm shadow-md shrink-0`}>
                    {rev.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {rev.name}
                      </span>
                      {rev.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" title="Verified Creator" />
                      )}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {rev.role} • {rev.location}
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-gray-500 font-mono">
                  {rev.date}
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>

              {/* Title & Comment */}
              <h4 className={`text-sm font-bold leading-tight ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>
                "{rev.title}"
              </h4>

              <p className="text-xs text-gray-400 leading-relaxed">
                {rev.comment}
              </p>
            </div>

            {/* Footer Tag & Likes */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
              <span className="text-[10px] font-mono text-cyan-400">
                Project: {rev.projectType}
              </span>

              <button
                onClick={() => handleLike(rev.id)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-cyan-400 transition cursor-pointer"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Helpful ({rev.likes})</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Review Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-3xl border p-6 sm:p-8 space-y-5 relative ${
            isDark ? 'bg-[#141424] border-white/10 text-white shadow-2xl' : 'bg-white border-slate-300 text-slate-900 shadow-xl'
          }`}>
            <button
              onClick={() => setShowSubmitModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Write Your Creator Review
              </h3>
              <p className="text-xs text-gray-400">
                Share your experience using CuteCut Pro for video editing, Quran captions, or audio mixing.
              </p>
            </div>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-sm">Thank You for Your Feedback!</h4>
                <p className="text-xs text-gray-400">Your review has been verified and added to the community wall.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-300">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Tariq Khan"
                      className={`w-full px-3 py-2 rounded-xl border outline-none ${
                        isDark ? 'bg-[#0f0f1c] border-[#292942] focus:border-cyan-400' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-gray-300">Role / Channel</label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g. Quran Reciter / TikToker"
                      className={`w-full px-3 py-2 rounded-xl border outline-none ${
                        isDark ? 'bg-[#0f0f1c] border-[#292942] focus:border-cyan-400' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-300">Star Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setFormData({ ...formData, rating: num })}
                        className="cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            num <= formData.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-400 ml-2">{formData.rating} Stars</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-300">Review Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Incredible speed & zero watermark!"
                    className={`w-full px-3 py-2 rounded-xl border outline-none ${
                      isDark ? 'bg-[#0f0f1c] border-[#292942] focus:border-cyan-400' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-300">Your Experience & Feedback *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    placeholder="Tell other creators how CuteCut Pro helped you..."
                    className={`w-full px-3 py-2 rounded-xl border outline-none resize-none ${
                      isDark ? 'bg-[#0f0f1c] border-[#292942] focus:border-cyan-400' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold shadow-lg shadow-cyan-500/20 transition cursor-pointer mt-2"
                >
                  Submit Verified Review
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
