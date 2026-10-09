import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Heart,
  Globe,
  Sparkles,
  ExternalLink,
  Smartphone,
  ChevronDown,
  ChevronUp,
  X,
  MessageCircle,
  TrendingUp
} from 'lucide-react';

interface PostExportSupportCardProps {
  onOpenPromoteModal?: () => void;
  className?: string;
}

export const PostExportSupportCard: React.FC<PostExportSupportCardProps> = ({
  onOpenPromoteModal,
  className = '',
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedTags, setCopiedTags] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasShared, setHasShared] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const officialWebsiteUrl = 'https://cutecutpro.com';
  const shareTitle = 'CuteCut Pro Video & Audio Studio';
  const shareMessageEnglish = `🎬 Check out CuteCut Pro! It's a 100% free Video & Audio Studio with AI Quran Auto-Captions, 4K rendering & No Watermarks:\n👉 ${officialWebsiteUrl}`;
  const viralHashtags = `#CuteCutPro #QuranReels #IslamicStatus #QuranRecitation #QuranVideo #VideoEditor #CapCutAlternative #AudioEditor #4K`;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(officialWebsiteUrl);
      setCopiedLink(true);
      setHasShared(true);
      showToast('Official website link copied! Paste & share with friends 🎉');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      showToast(`Link: ${officialWebsiteUrl}`);
    }
  };

  const handleCopyHashtags = async () => {
    try {
      await navigator.clipboard.writeText(viralHashtags);
      setCopiedTags(true);
      showToast('Viral hashtags copied! Ready for Reels & TikTok 🚀');
      setTimeout(() => setCopiedTags(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareMessageEnglish,
          url: officialWebsiteUrl,
        });
        setHasShared(true);
        showToast('Thank you so much for sharing CuteCut Pro! ❤️');
      } catch {
        // User cancelled native share sheet
      }
    } else {
      handleCopyLink();
    }
  };

  const handlePlatformShare = (platform: 'whatsapp' | 'facebook' | 'twitter' | 'instagram' | 'tiktok') => {
    setHasShared(true);

    if (platform === 'whatsapp') {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessageEnglish)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      showToast('Opening WhatsApp to share with friends! ✨');
    } else if (platform === 'facebook') {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(officialWebsiteUrl)}&quote=${encodeURIComponent(shareMessageEnglish)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      showToast('Opening Facebook sharer! ✨');
    } else if (platform === 'twitter') {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessageEnglish)}&hashtags=CuteCutPro,VideoEditor,FreeApp`;
      window.open(url, '_blank', 'noopener,noreferrer');
      showToast('Opening X (Twitter) to post! ✨');
    } else if (platform === 'instagram') {
      navigator.clipboard?.writeText(officialWebsiteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
      showToast('Link copied! Paste in your Instagram Story or DM 📸');
    } else if (platform === 'tiktok') {
      navigator.clipboard?.writeText(officialWebsiteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      window.open('https://www.tiktok.com/', '_blank', 'noopener,noreferrer');
      showToast('Link copied! Share CuteCut Pro with your TikTok community 🎵');
    }
  };

  if (isDismissed) {
    return (
      <div className="w-full max-w-xl mx-auto flex items-center justify-between px-3 py-2 bg-[#12141f]/70 border border-gray-800 rounded-lg text-xs text-gray-400">
        <span className="flex items-center gap-1.5 text-[11px]">
          <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400/20" />
          <span>Support CuteCut Pro</span>
        </span>
        <button
          type="button"
          onClick={() => setIsDismissed(false)}
          className="text-cyan-400 hover:text-cyan-300 font-semibold text-[11px] underline cursor-pointer"
        >
          Show Support & Share Card
        </button>
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-xl mx-auto rounded-xl bg-gradient-to-b from-[#161826] to-[#10121c] border border-cyan-500/35 shadow-xl shadow-cyan-950/20 text-left overflow-hidden relative transition-all duration-200 ${className}`}
    >
      {/* Top Gradient Accent Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500" />

      {/* Card Header */}
      <div className="p-4 pb-3 flex items-start justify-between gap-3 border-b border-[#23263b]">
        <div className="flex items-start gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5 shadow-inner">
            <Heart className="w-4 h-4 text-pink-400 fill-pink-400/30 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 text-[9.5px] font-bold bg-pink-500/15 text-pink-300 border border-pink-500/30 rounded-full flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" /> Support Free Creator Mission
              </span>
              <span className="px-2 py-0.5 text-[9.5px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full">
                100% Free Forever
              </span>
            </div>
            <h4 className="text-sm font-bold text-white tracking-wide mt-1 flex items-center gap-1.5">
              Support CuteCut Pro — Share with Friends! 🚀
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setIsCollapsed(prev => !prev)}
            className="p-1 text-gray-400 hover:text-white rounded hover:bg-white/5 transition cursor-pointer"
            title={isCollapsed ? 'Expand card' : 'Collapse card'}
            aria-label={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1 text-gray-400 hover:text-white rounded hover:bg-white/5 transition cursor-pointer"
            title="Dismiss card"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <div className="p-4 space-y-3.5 text-xs">
          {/* Polite English Message Body */}
          <div className="p-3 rounded-lg bg-[#0e101a] border border-[#21253a] space-y-1.5">
            <p className="text-gray-200 leading-relaxed font-normal text-[11.5px]">
              Enjoyed your video? CuteCut Pro is <strong className="text-cyan-300 font-semibold">100% free with no watermarks, no fees, and no locked features</strong>.
              It takes just <span className="text-amber-300 font-bold">5 seconds</span> to support our studio by sharing our website link with your friends on WhatsApp, TikTok, Instagram, or Facebook!
            </p>
            <p className="text-[10.5px] text-gray-400 leading-normal">
              Sharing is totally voluntary — your exported video is already saved & ready. Baqi aapki marzi! Every share helps fellow creators find us and keeps our free servers running.
            </p>
          </div>

          {/* Website Link Copy Box */}
          <div className="flex items-center justify-between gap-2 p-2 bg-[#0b0c14] border border-[#23273e] rounded-lg">
            <div className="flex items-center gap-2 min-w-0 pl-1">
              <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-[9px] text-gray-400 uppercase font-semibold">Official Website Link</div>
                <div className="text-xs font-mono font-bold text-cyan-300 truncate">{officialWebsiteUrl}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-sm ${
                copiedLink
                  ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25'
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          {/* Social Platform Share Buttons Grid */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-400 font-medium">1-Tap Share to Social Media:</span>
              {hasShared && (
                <span className="text-emerald-400 font-bold flex items-center gap-1 text-[10.5px]">
                  <Check className="w-3 h-3" /> Shared! Thank You ❤️
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {/* WhatsApp */}
              <button
                type="button"
                onClick={() => handlePlatformShare('whatsapp')}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/35 transition font-semibold text-[11px] cursor-pointer shadow-sm hover:scale-[1.01]"
              >
                <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.301-.15-1.782-.88-2.058-.98-.276-.101-.476-.15-.677.15-.2.301-.776.98-.952 1.18-.176.201-.351.226-.652.076-.301-.15-1.27-.468-2.42-1.493-.894-.798-1.498-1.784-1.674-2.085-.176-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.15-.175.2-.3.301-.501.1-.2.05-.376-.025-.526-.075-.15-.677-1.631-.928-2.235-.244-.588-.493-.509-.677-.518-.176-.009-.376-.01-.577-.01-.201 0-.526.075-.802.376-.276.301-1.053 1.028-1.053 2.508 0 1.48 1.078 2.909 1.228 3.11.15.201 2.122 3.24 5.14 4.544.718.31 1.279.496 1.716.635.721.229 1.377.197 1.895.12.578-.087 1.782-.728 2.032-1.431.25-.703.25-1.306.175-1.431-.075-.126-.275-.201-.576-.351zM12.05 21.785h-.002c-1.74 0-3.447-.467-4.949-1.353l-.355-.21-3.682.966.983-3.593-.231-.367a9.824 9.824 0 0 1-1.508-5.208c0-5.438 4.425-9.863 9.868-9.863 2.634.001 5.112 1.027 6.974 2.89 1.862 1.864 2.887 4.341 2.887 6.978 0 5.439-4.425 9.862-9.867 9.862zm0-21.785C5.405 0 0 5.405 0 12.05c0 2.12.553 4.188 1.603 6.009L0 24l6.104-1.601a12.006 12.006 0 0 0 5.946 1.571h.005c6.644 0 12.05-5.405 12.05-12.05 0-3.219-1.254-6.245-3.533-8.524C18.293 1.254 15.267 0 12.05 0z" />
                </svg>
                <span>WhatsApp</span>
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={() => handlePlatformShare('facebook')}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-[#1877F2]/15 hover:bg-[#1877F2]/25 text-[#1877F2] border border-[#1877F2]/35 transition font-semibold text-[11px] cursor-pointer shadow-sm hover:scale-[1.01]"
              >
                <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </button>

              {/* Twitter / X */}
              <button
                type="button"
                onClick={() => handlePlatformShare('twitter')}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/35 transition font-semibold text-[11px] cursor-pointer shadow-sm hover:scale-[1.01]"
              >
                <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>X (Twitter)</span>
              </button>

              {/* Instagram */}
              <button
                type="button"
                onClick={() => handlePlatformShare('instagram')}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-gradient-to-r from-[#833ab4]/15 via-[#fd1d1d]/15 to-[#fcb045]/15 hover:from-[#833ab4]/25 hover:to-[#fcb045]/25 text-[#f06595] border border-[#e1306c]/35 transition font-semibold text-[11px] cursor-pointer shadow-sm hover:scale-[1.01]"
              >
                <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>Instagram</span>
              </button>

              {/* TikTok */}
              <button
                type="button"
                onClick={() => handlePlatformShare('tiktok')}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-purple-900/20 hover:bg-purple-900/30 text-purple-300 border border-purple-500/35 transition font-semibold text-[11px] cursor-pointer shadow-sm hover:scale-[1.01]"
              >
                <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.5 6.3 6.3 0 0 0 1.86-4.49V8.75a8.28 8.28 0 0 0 4.86 1.57V6.87c-.32-.05-.64-.11-.95-.18z" />
                </svg>
                <span>TikTok</span>
              </button>

              {/* Mobile / System Share Sheet */}
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/35 transition font-semibold text-[11px] cursor-pointer shadow-sm hover:scale-[1.01]"
              >
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span>More Apps / Share</span>
              </button>
            </div>
          </div>

          {/* Viral Tags & Promotion Hub Bar */}
          <div className="pt-2 border-t border-[#23273e] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10.5px]">
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <span className="text-gray-400">Exported Video Tags:</span>
              <button
                type="button"
                onClick={handleCopyHashtags}
                className="text-cyan-400 hover:text-cyan-300 font-mono underline cursor-pointer flex items-center gap-1"
              >
                {copiedTags ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedTags ? 'Copied!' : 'Copy Tags (#CuteCutPro)'}</span>
              </button>
            </div>

            {onOpenPromoteModal && (
              <button
                type="button"
                onClick={onOpenPromoteModal}
                className="text-gray-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
              >
                <span>Creator Promotion Hub</span>
                <ExternalLink className="w-3 h-3 text-cyan-400" />
              </button>
            )}
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostExportSupportCard;
