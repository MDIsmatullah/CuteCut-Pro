import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Sparkles,
  Heart,
  Globe,
  ExternalLink,
  Smartphone,
  ArrowRight,
  ShieldCheck,
  Video
} from 'lucide-react';

interface FirstTimeExportShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToExport: () => void;
  isMobileMode?: boolean;
}

export const FIRST_TIME_EXPORT_SHARED_KEY = 'cutecut_first_export_shared_v1';

export const FirstTimeExportShareModal: React.FC<FirstTimeExportShareModalProps> = ({
  isOpen,
  onClose,
  onProceedToExport,
  isMobileMode = false,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [hasShared, setHasShared] = useState(false);
  const [activePlatformNotice, setActivePlatformNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const officialWebsiteUrl = 'https://cutecutpro.com';
  const shareTitle = 'CuteCut Pro Video & Audio Studio';
  const shareMessage = `🎬 السلام علیکم! CuteCut Pro سے ویڈیو بنائی ہے، یہ مکمل فری ویڈیو ایڈیٹر ہے جس میں AI قرآن کیپشنز، 4K ایکسپورٹ اور ملٹی ٹریک آڈیو مکسنگ شامل ہے۔ ابھی وزٹ کریں:\n👉 ${officialWebsiteUrl}`;
  const shareMessageEn = `🎬 CuteCut Pro is a 100% free video & audio studio with AI Quran Auto-Captions, 4K rendering & multi-track mixing! Check out our official website:\n👉 ${officialWebsiteUrl}`;

  const markSharedAndUnlock = () => {
    try {
      localStorage.setItem(FIRST_TIME_EXPORT_SHARED_KEY, 'true');
    } catch {
      // safe fallback
    }
    setHasShared(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(officialWebsiteUrl);
      setCopiedLink(true);
      markSharedAndUnlock();
      setActivePlatformNotice('لینک کاپی ہوگیا! اب اپنے دوستوں اور سوشل میڈیا پر پیسٹ کریں۔');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setActivePlatformNotice('لینک: ' + officialWebsiteUrl);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareMessage,
          url: officialWebsiteUrl,
        });
        markSharedAndUnlock();
        setActivePlatformNotice('شیئر کرنے کا شکریہ! ایکسپورٹ انلاک ہوچکا ہے۔');
      } catch {
        // User cancelled share sheet
      }
    } else {
      handleCopyLink();
    }
  };

  const handlePlatformShare = (platform: 'whatsapp' | 'facebook' | 'instagram' | 'tiktok' | 'twitter') => {
    markSharedAndUnlock();

    if (platform === 'whatsapp') {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      setActivePlatformNotice('WhatsApp پر شیئر ہو رہا ہے۔ ایکسپورٹ انلاک ہوچکا ہے!');
    } else if (platform === 'facebook') {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(officialWebsiteUrl)}&quote=${encodeURIComponent(shareMessage)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      setActivePlatformNotice('Facebook پر شیئر ہو رہا ہے۔ ایکسپورٹ انلاک ہوچکا ہے!');
    } else if (platform === 'twitter') {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessageEn)}&hashtags=CuteCutPro,QuranVideo,VideoEditor`;
      window.open(url, '_blank', 'noopener,noreferrer');
      setActivePlatformNotice('Twitter/X پر شیئر ہو رہا ہے۔ ایکسپورٹ انلاک ہوچکا ہے!');
    } else if (platform === 'instagram') {
      // Instagram doesn't support direct text URL intents for web, copy link and open Instagram
      navigator.clipboard?.writeText(officialWebsiteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
      setActivePlatformNotice('لنک کاپی ہوگیا! Instagram Story یا DM میں اپنے دوستوں کو بھیجیں۔');
    } else if (platform === 'tiktok') {
      // TikTok copy link and open TikTok
      navigator.clipboard?.writeText(officialWebsiteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      window.open('https://www.tiktok.com/', '_blank', 'noopener,noreferrer');
      setActivePlatformNotice('لنک کاپی ہوگیا! TikTok پر دوستوں کو CuteCut Pro کی ویب سائٹ بتائیں۔');
    }
  };

  const handleConfirmAndProceed = () => {
    markSharedAndUnlock();
    onProceedToExport();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-time-export-title"
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-xl bg-[#121218] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Banner */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-400"></div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-[#232333] bg-[#161622]/90">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner shrink-0">
              <Share2 className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" /> 1-Time Milestone
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> 100% Free Forever
                </span>
              </div>
              <h3 id="first-time-export-title" className="text-base sm:text-lg font-bold text-white tracking-wide mt-1">
                پہلی بار ایکسپورٹ: دوستوں سے شیئر کریں
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-400">
                Share our official website with friends to unlock your first export
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-gray-300">
          
          {/* Friendly Urdu & English Explanation Box */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 to-emerald-950/30 border border-cyan-500/30 text-gray-200">
            <div className="flex items-start gap-2.5">
              <Heart className="w-4 h-4 text-pink-400 shrink-0 mt-0.5 fill-pink-400/30" />
              <div className="space-y-1">
                <p className="font-semibold text-white text-xs sm:text-sm leading-relaxed" dir="rtl">
                  پیارے ایڈیٹر! CuteCut Pro تمام فیچرز (AI قرآن کیپشنز، 4K ایکسپورٹ) بالکل مفت پیش کرتا ہے۔ پہلی بار ایکسپورٹ کرنے پر صرف 1 بار ہماری آفیشل ویب سائٹ کا لنک اپنے دوستوں کو WhatsApp، Instagram، Facebook یا TikTok پر شیئر کریں۔
                </p>
                <p className="text-[11px] text-gray-400">
                  CuteCut Pro is free for everyone. Help our community grow by sharing our website link with fellow creators!
                </p>
              </div>
            </div>
          </div>

          {/* Official Website Link Card */}
          <div className="p-3.5 rounded-xl bg-[#171724] border border-[#2b2b3f] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-900/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Official Website Link</div>
                <div className="text-sm font-bold text-cyan-300 font-mono truncate">{officialWebsiteUrl}</div>
                <div className="text-[10px] text-gray-400">Free AI Video & Audio Studio</div>
              </div>
            </div>
            <button
              onClick={handleCopyLink}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer ${
                copiedLink
                  ? 'bg-emerald-600 text-white border border-emerald-400'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-black font-bold'
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" /> لنک کاپی ہو گیا!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> کاپی لنک (Copy Link)
                </>
              )}
            </button>
          </div>

          {/* Social Media Share Channels (WhatsApp, Instagram, TikTok, Facebook, Twitter, Web Share) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
              <span>سوشل میڈیا پر شیئر کریں (Select Platform):</span>
              {hasShared && (
                <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                  <Check className="w-3.5 h-3.5" /> Shared & Unlocked!
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* WhatsApp Button */}
              <button
                onClick={() => handlePlatformShare('whatsapp')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/40 transition-all font-semibold text-xs shadow-lg hover:scale-[1.02] cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.301-.15-1.782-.88-2.058-.98-.276-.101-.476-.15-.677.15-.2.301-.776.98-.952 1.18-.176.201-.351.226-.652.076-.301-.15-1.27-.468-2.42-1.493-.894-.798-1.498-1.784-1.674-2.085-.176-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.15-.175.2-.3.301-.501.1-.2.05-.376-.025-.526-.075-.15-.677-1.631-.928-2.235-.244-.588-.493-.509-.677-.518-.176-.009-.376-.01-.577-.01-.201 0-.526.075-.802.376-.276.301-1.053 1.028-1.053 2.508 0 1.48 1.078 2.909 1.228 3.11.15.201 2.122 3.24 5.14 4.544.718.31 1.279.496 1.716.635.721.229 1.377.197 1.895.12.578-.087 1.782-.728 2.032-1.431.25-.703.25-1.306.175-1.431-.075-.126-.275-.201-.576-.351zM12.05 21.785h-.002c-1.74 0-3.447-.467-4.949-1.353l-.355-.21-3.682.966.983-3.593-.231-.367a9.824 9.824 0 0 1-1.508-5.208c0-5.438 4.425-9.863 9.868-9.863 2.634.001 5.112 1.027 6.974 2.89 1.862 1.864 2.887 4.341 2.887 6.978 0 5.439-4.425 9.862-9.867 9.862zm0-21.785C5.405 0 0 5.405 0 12.05c0 2.12.553 4.188 1.603 6.009L0 24l6.104-1.601a12.006 12.006 0 0 0 5.946 1.571h.005c6.644 0 12.05-5.405 12.05-12.05 0-3.219-1.254-6.245-3.533-8.524C18.293 1.254 15.267 0 12.05 0z" />
                </svg>
                <span>WhatsApp</span>
              </button>

              {/* Instagram Button */}
              <button
                onClick={() => handlePlatformShare('instagram')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#833ab4]/15 via-[#fd1d1d]/15 to-[#fcb045]/15 hover:from-[#833ab4]/25 hover:to-[#fcb045]/25 text-[#f06595] border border-[#e1306c]/40 transition-all font-semibold text-xs shadow-lg hover:scale-[1.02] cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>Instagram</span>
              </button>

              {/* TikTok Button */}
              <button
                onClick={() => handlePlatformShare('tiktok')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-purple-900/20 hover:bg-purple-900/30 text-purple-300 border border-purple-500/40 transition-all font-semibold text-xs shadow-lg hover:scale-[1.02] cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.5 6.3 6.3 0 0 0 1.86-4.49V8.75a8.28 8.28 0 0 0 4.86 1.57V6.87c-.32-.05-.64-.11-.95-.18z" />
                </svg>
                <span>TikTok</span>
              </button>

              {/* Facebook Button */}
              <button
                onClick={() => handlePlatformShare('facebook')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2]/25 text-[#1877F2] border border-[#1877F2]/40 transition-all font-semibold text-xs shadow-lg hover:scale-[1.02] cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </button>

              {/* Twitter / X Button */}
              <button
                onClick={() => handlePlatformShare('twitter')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/40 transition-all font-semibold text-xs shadow-lg hover:scale-[1.02] cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>X (Twitter)</span>
              </button>

              {/* Native System Share (Mobile / Android / Chrome) */}
              <button
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 transition-all font-semibold text-xs shadow-lg hover:scale-[1.02] cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>Mobile Share Sheet</span>
              </button>
            </div>
          </div>

          {/* Active Notice / Feedback Toast */}
          {activePlatformNotice && (
            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{activePlatformNotice}</span>
            </div>
          )}

          {/* Feature Highlight Pill */}
          <div className="pt-1 flex items-center justify-around text-[11px] text-gray-400 border-t border-[#232333]">
            <span className="flex items-center gap-1">
              <Video className="w-3.5 h-3.5 text-cyan-400" /> 4K Ultra HD Export
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Auto AI Captions
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> No Watermark
            </span>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-[#232333] bg-[#161622]/95">
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition cursor-pointer text-center"
            >
              Cancel (منسوخ کریں)
            </button>
            <button
              onClick={handleConfirmAndProceed}
              className="px-3 py-2 text-xs text-cyan-400/80 hover:text-cyan-300 rounded-lg hover:bg-cyan-950/30 transition cursor-pointer text-center underline font-medium"
            >
              Skip & Export (آگے بڑھیں)
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleConfirmAndProceed}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
                hasShared
                  ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-black shadow-cyan-500/30 ring-2 ring-cyan-300'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black shadow-cyan-500/25'
              }`}
            >
              <span>{hasShared ? '🎉 Thank You! Proceed to Export' : 'Proceed to Export (ایکسپورٹ شروع کریں)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstTimeExportShareModal;
