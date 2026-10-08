import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Youtube,
  Music,
  Video,
  FileText,
  Heart,
  Share2,
  ExternalLink,
  Plus,
  Trash2,
  Play,
  Pause,
  Upload,
  ArrowRight,
  ShieldCheck,
  Radio,
  Check,
  MessageCircle,
  Copy,
  Lock,
  Unlock,
  Sliders,
  Volume2
} from 'lucide-react';
import { UserProfile } from '../AuthModal';
import { CreatorPost, CreatorFeedService, ADMIN_EMAIL } from '../../services/creatorFeedService';
import { YOUTUBE_CHANNELS } from '../modals/CreatorChannelsModal';

export interface CreatorFeedPageViewProps {
  theme?: 'dark' | 'light';
  user: UserProfile | null;
  onOpenEditor: (aspectRatio?: '16:9' | '9:16' | '1:1') => void;
  onOpenQuranStudio?: () => void;
  onBackToWebsite?: () => void;
  onOpenChannelsModal?: () => void;
  onOpenDonateModal?: () => void;
  onImportMediaToEditor?: (url: string, type: 'audio' | 'video', name: string) => void;
}

export const CreatorFeedPageView: React.FC<CreatorFeedPageViewProps> = ({
  user,
  onOpenEditor,
  onOpenQuranStudio,
  onBackToWebsite,
  onOpenChannelsModal,
  onOpenDonateModal,
  onImportMediaToEditor
}) => {
  const [posts, setPosts] = useState<CreatorPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'audio' | 'video' | 'announcement'>('all');

  // Currently playing audio in feed
  const [playingPostId, setPlayingPostId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Admin state
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [showAdminPasscodeModal, setShowAdminPasscodeModal] = useState(false);

  // New post form state
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<'announcement' | 'audio' | 'video'>('audio');
  const [postMediaUrl, setPostMediaUrl] = useState('');
  const [postMediaName, setPostMediaName] = useState('');
  const [postYoutubeUrl, setPostYoutubeUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Check admin status: email matches guldastaislamorquran@gmail.com or passcode unlocked
  const isActualAdmin = (user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) || isAdminUnlocked;

  useEffect(() => {
    loadPosts();
    return () => {
      if (audioElement) {
        audioElement.pause();
      }
    };
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    const data = await CreatorFeedService.fetchPosts();
    setPosts(data);
    setIsLoading(false);
  };

  const handleTogglePlayAudio = (postId: string, mediaUrl: string) => {
    if (playingPostId === postId) {
      if (audioElement) {
        audioElement.pause();
      }
      setPlayingPostId(null);
    } else {
      if (audioElement) {
        audioElement.pause();
      }
      const audio = new Audio(mediaUrl);
      audio.play().catch(() => {});
      audio.onended = () => setPlayingPostId(null);
      setAudioElement(audio);
      setPlayingPostId(postId);
    }
  };

  const handleLike = async (postId: string) => {
    const newLikes = await CreatorFeedService.likePost(postId);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: newLikes } : p));
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this creator post?')) return;
    await CreatorFeedService.deletePost(postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await CreatorFeedService.createPost({
        authorEmail: ADMIN_EMAIL,
        authorName: 'CuteCut Pro Creator Hub',
        title: postTitle.trim(),
        content: postContent.trim(),
        type: postType,
        mediaUrl: postMediaUrl.trim() || undefined,
        mediaName: postMediaName.trim() || undefined,
        youtubeUrl: postYoutubeUrl.trim() || undefined,
        isPinned: false
      });

      setPosts(prev => [created, ...prev]);
      setShowNewPostForm(false);
      setPostTitle('');
      setPostContent('');
      setPostMediaUrl('');
      setPostMediaName('');
      setPostYoutubeUrl('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasscode === 'guldasta786' || adminPasscode === 'cutecutadmin') {
      setIsAdminUnlocked(true);
      setShowAdminPasscodeModal(false);
    } else {
      alert('Incorrect creator passcode.');
    }
  };

  const filteredPosts = posts.filter(p => {
    if (filterType === 'all') return true;
    return p.type === filterType;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Hero Creator Header */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 border border-red-500/30 bg-gradient-to-r from-[#1c0c16] via-[#121326] to-[#0c1824] shadow-2xl">
        <div className="absolute -top-24 -left-20 w-80 h-80 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span>OFFICIAL CREATOR BROADCAST HUB</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
                Guldasta Islam & CuteCut Pro
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              Creator Audio, Video & Official Updates
            </h1>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Official community board where our creator posts Quran recitations, sound effects, tutorial clips, and template updates. Listen to audios, watch tutorials, or import them directly into your timeline editor!
            </p>

            {/* Official Channels Quick Links */}
            <div className="flex items-center gap-3 pt-2 flex-wrap">
              {YOUTUBE_CHANNELS.map(ch => (
                <a
                  key={ch.id}
                  href={ch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Youtube className="w-3.5 h-3.5 text-red-400" />
                  <span className="truncate max-w-[200px]">{ch.name.split('(')[0]}</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              ))}

              {onOpenChannelsModal && (
                <button
                  onClick={onOpenChannelsModal}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>View All Socials</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action Box */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
            {isActualAdmin ? (
              <button
                onClick={() => setShowNewPostForm(prev => !prev)}
                className="w-full px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{showNewPostForm ? 'Close Post Form' : '➕ Create New Update / Post'}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAdminPasscodeModal(true)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                title="Creator Admin Access"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Login (Post Updates)</span>
              </button>
            )}

            {onOpenDonateModal && (
              <button
                onClick={onOpenDonateModal}
                className="w-full px-4 py-2.5 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/40" />
                <span>Support the Creator</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Admin Quick Unlock Modal */}
      {showAdminPasscodeModal && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#121422] border border-amber-500/40 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Creator Admin Authentication</span>
              </div>
              <button
                onClick={() => setShowAdminPasscodeModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Only the channel creator (guldastaislamorquran@gmail.com) can publish audio, video, and announcements for website audience.
            </p>
            <form onSubmit={handleAdminUnlock} className="space-y-3">
              <input
                type="password"
                placeholder="Enter creator passcode"
                value={adminPasscode}
                onChange={(e) => setAdminPasscode(e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs rounded-xl transition"
              >
                Unlock Creator Publishing
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Post Creation Form (Visible to Admin only) */}
      {isActualAdmin && showNewPostForm && (
        <div className="p-5 sm:p-6 rounded-3xl bg-[#131526] border border-red-500/40 shadow-xl space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">Publish New Audio, Video or Text to Audience</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
              Verified Creator Mode
            </span>
          </div>

          <form onSubmit={handleCreatePost} className="space-y-4">
            {/* Post Type Selector */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPostType('audio')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  postType === 'audio'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>Audio (Tilawat / BGM)</span>
              </button>

              <button
                type="button"
                onClick={() => setPostType('video')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  postType === 'video'
                    ? 'bg-red-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video (Clip / Tutorial)</span>
              </button>

              <button
                type="button"
                onClick={() => setPostType('announcement')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  postType === 'announcement'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Text Announcement</span>
              </button>
            </div>

            {/* Inputs */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Post Title</label>
              <input
                type="text"
                placeholder="e.g. Surah Al-Mulk Beautiful Recitation with 4K Waveform..."
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                required
                className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:border-red-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Description & Details</label>
              <textarea
                rows={3}
                placeholder="Write your announcement, instructions, translation notes, or tutorial details..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                required
                className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:border-red-400"
              />
            </div>

            {/* Media URL (for audio or video) */}
            {(postType === 'audio' || postType === 'video') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Direct Audio/Video URL (.mp3, .mp4, CDN, Pixabay)
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/audio.mp3"
                    value={postMediaUrl}
                    onChange={(e) => setPostMediaUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:border-red-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Optional YouTube Channel / Video Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/channel/UCVP3RNRdficqmriDszLjzcQ"
                    value={postYoutubeUrl}
                    onChange={(e) => setPostYoutubeUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:border-red-400"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewPostForm(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-md shadow-red-600/30 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Update to Website'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-1.5 bg-[#121424] p-1 rounded-2xl border border-white/10 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              filterType === 'all'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All Updates ({posts.length})
          </button>
          <button
            onClick={() => setFilterType('audio')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition cursor-pointer ${
              filterType === 'audio'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5 text-emerald-400" />
            <span>Audio & Tilawat</span>
          </button>
          <button
            onClick={() => setFilterType('video')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition cursor-pointer ${
              filterType === 'video'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-red-400" />
            <span>Video & Tutorials</span>
          </button>
          <button
            onClick={() => setFilterType('announcement')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition cursor-pointer ${
              filterType === 'announcement'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Announcements</span>
          </button>
        </div>

        <div className="text-xs text-gray-400 font-mono">
          Updated live from Creator Studio
        </div>
      </div>

      {/* Feed Posts List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            Loading creator feed updates...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#121424] border border-white/10 text-gray-400 text-xs">
            No updates found in this category yet.
          </div>
        ) : (
          filteredPosts.map(post => {
            const isAudioPlaying = playingPostId === post.id;

            return (
              <div
                key={post.id}
                className="p-5 sm:p-6 rounded-3xl bg-[#131526] border border-white/10 hover:border-white/20 transition shadow-lg space-y-4 relative overflow-hidden group"
              >
                {post.isPinned && (
                  <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-2xl bg-amber-500/20 text-amber-300 border-l border-b border-amber-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>PINNED BY CREATOR</span>
                  </div>
                )}

                {/* Post Top Row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-md ${
                      post.type === 'audio'
                        ? 'bg-gradient-to-br from-emerald-600 to-teal-500 shadow-emerald-600/30'
                        : post.type === 'video'
                        ? 'bg-gradient-to-br from-red-600 to-rose-600 shadow-red-600/30'
                        : 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-600/30'
                    }`}>
                      {post.type === 'audio' && <Music className="w-5 h-5" />}
                      {post.type === 'video' && <Video className="w-5 h-5" />}
                      {post.type === 'announcement' && <FileText className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">{post.authorName}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10">
                          {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          post.type === 'audio'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : post.type === 'video'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {post.type}
                        </span>
                      </div>
                      <h2 className="text-base sm:text-lg font-bold text-white mt-1 group-hover:text-red-300 transition">
                        {post.title}
                      </h2>
                    </div>
                  </div>

                  {/* Admin Delete Action */}
                  {isActualAdmin && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                      title="Delete Post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Post Content */}
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>

                {/* Embedded Media Player (If Audio) */}
                {post.type === 'audio' && post.mediaUrl && (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-black/40 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        onClick={() => handleTogglePlayAudio(post.id, post.mediaUrl!)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer shrink-0 shadow-md ${
                          isAudioPlaying
                            ? 'bg-emerald-500 text-black'
                            : 'bg-emerald-600/30 text-emerald-400 hover:bg-emerald-600 hover:text-white'
                        }`}
                        title={isAudioPlaying ? 'Pause Audio' : 'Play Audio'}
                      >
                        {isAudioPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{post.mediaName || 'Studio Master Recitation Audio'}</span>
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {isAudioPlaying ? 'Playing preview now...' : 'Click play to listen preview'}
                        </div>
                      </div>
                    </div>

                    {/* Button to load directly into timeline */}
                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                      <button
                        onClick={() => {
                          if (onImportMediaToEditor) {
                            onImportMediaToEditor(post.mediaUrl!, 'audio', post.title);
                          } else {
                            onOpenEditor('9:16');
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Use Audio in CuteCut Timeline</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* External YouTube / Channel Link */}
                {post.youtubeUrl && (
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={post.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-white text-xs font-bold transition cursor-pointer"
                    >
                      <Youtube className="w-4 h-4 text-red-500" />
                      <span>Watch Full Video on YouTube Channel</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  </div>
                )}

                {/* Post Footer Actions */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-1.5 hover:text-rose-400 transition cursor-pointer group/like"
                    >
                      <Heart className="w-4 h-4 text-rose-500 group-hover/like:scale-125 transition fill-rose-500/20" />
                      <span>{post.likes} Likes</span>
                    </button>

                    <button
                      onClick={() => {
                        try {
                          navigator.clipboard.writeText(window.location.origin + '/updates#' + post.id);
                          setCopiedLink(post.id);
                          setTimeout(() => setCopiedLink(null), 2000);
                        } catch {}
                      }}
                      className="flex items-center gap-1.5 hover:text-cyan-400 transition cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{copiedLink === post.id ? 'Copied Link!' : 'Share'}</span>
                    </button>
                  </div>

                  {post.tags && post.tags.length > 0 && (
                    <div className="hidden sm:flex items-center gap-1.5">
                      {post.tags.map(tag => (
                        <span key={tag} className="text-[10px] text-gray-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CreatorFeedPageView;
