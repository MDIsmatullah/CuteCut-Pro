import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  QrCode, 
  Globe, 
  TrendingUp, 
  Download, 
  ExternalLink,
  MessageCircle, 
  Twitter, 
  Facebook, 
  Send,
  Code,
  Sparkles,
  Award,
  Smartphone
} from 'lucide-react';

interface PromoteShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstallPwa?: () => void;
  canInstallPwa?: boolean;
}

export const PromoteShareModal: React.FC<PromoteShareModalProps> = ({
  isOpen,
  onClose,
  onInstallPwa,
  canInstallPwa = false
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [language, setLanguage] = useState<'ur' | 'en'>('ur');
  const [activeTab, setActiveTab] = useState<'share' | 'hashtags' | 'qr' | 'embed'>('share');

  if (!isOpen) return null;

  const websiteUrl = 'https://cutecutpro.com';
  const snapcraftUrl = 'https://snapcraft.io/cutecut-pro';

  const shareTextUrdu = `🌟 CuteCut Pro - ویڈیو اور آڈیو ایڈیٹر (AI قرآن کیپشنز اور 4K ایکسپورٹ کے ساتھ بالکل مفت): ${websiteUrl}`;
  const shareTextEnglish = `🎬 CuteCut Pro - The powerful, free video & audio editor with AI Quran auto-captions, multi-track mixing & 4K export: ${websiteUrl}`;

  const currentShareText = language === 'ur' ? shareTextUrdu : shareTextEnglish;

  const viralHashtags = `#CuteCutPro #QuranReels #IslamicStatus #QuranRecitation #QuranVideo #VideoEditor #CapCutAlternative #AudioEditor #4KVideo`;

  const embedCode = `<a href="https://cutecutpro.com" target="_blank" rel="noopener noreferrer"><img src="https://cutecutpro.com/icon.png" width="32" height="32" alt="CuteCut Pro" style="vertical-align:middle;margin-right:6px;" /><strong>Edited with CuteCut Pro</strong></a>`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(websiteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyHashtags = async () => {
    try {
      await navigator.clipboard.writeText(viralHashtags);
      setCopiedHashtags(true);
      setTimeout(() => setCopiedHashtags(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CuteCut Pro Video & Audio Editor',
          text: currentShareText,
          url: websiteUrl,
        });
      } catch {
        // user cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(currentShareText)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(websiteUrl)}&text=${encodeURIComponent(currentShareText)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(currentShareText)}&hashtags=CuteCutPro,QuranVideo,VideoEditor`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(websiteUrl)}`,
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#12121a] border border-[#2b2b3d] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Header Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-amber-400"></div>

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232333] bg-[#161622]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
              <Share2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">CuteCut Pro Promotion & Viral Hub</h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                  <Award className="w-3 h-3" /> Live Verified
                </span>
              </div>
              <p className="text-xs text-gray-400">Expand your reach, grow viewers, and share with fellow creators</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Traction Banner */}
        <div className="px-6 py-3 bg-gradient-to-r from-cyan-950/40 via-emerald-950/30 to-purple-950/40 border-b border-[#232333]">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-black/40 border border-cyan-500/20 flex flex-col items-center justify-center">
              <div className="flex items-center gap-1 text-cyan-400 font-bold text-sm">
                <Smartphone className="w-3.5 h-3.5" /> 470+ Devices
              </div>
              <div className="text-[10px] text-gray-400">Weekly Active Devices</div>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-emerald-500/20 flex flex-col items-center justify-center">
              <div className="flex items-center gap-1 text-emerald-400 font-bold text-sm">
                <Globe className="w-3.5 h-3.5" /> 86 Countries
              </div>
              <div className="text-[10px] text-gray-400">Global Reach</div>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-amber-500/20 flex flex-col items-center justify-center">
              <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
                <TrendingUp className="w-3.5 h-3.5" /> Top 3 Google
              </div>
              <div className="text-[10px] text-gray-400">Page 1 Verified</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-[#232333] px-6 bg-[#14141f]">
          <button
            onClick={() => setActiveTab('share')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'share'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" /> 1-Click Social Share
          </button>
          <button
            onClick={() => setActiveTab('hashtags')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'hashtags'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Viral Hashtag Generator
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'qr'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" /> Mobile QR Scanner
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'embed'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" /> Web & Blog Badge
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-gray-300">
          
          {/* TAB 1: 1-Click Social Share */}
          {activeTab === 'share' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">Message Language:</span>
                <div className="flex items-center gap-1 bg-[#1a1a28] p-1 rounded-lg border border-[#2b2b3e]">
                  <button
                    onClick={() => setLanguage('ur')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                      language === 'ur' ? 'bg-cyan-600 text-white font-bold' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    اردو (Urdu)
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                      language === 'en' ? 'bg-cyan-600 text-white font-bold' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Message Box */}
              <div className="p-3 rounded-xl bg-[#161624] border border-[#2d2d42] text-xs text-gray-200 leading-relaxed font-sans relative">
                {currentShareText}
              </div>

              {/* Share Channels */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <a
                  href={shareLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition-all font-medium text-xs shadow-lg hover:scale-[1.02]"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" /> WhatsApp
                </a>
                <a
                  href={shareLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 transition-all font-medium text-xs shadow-lg hover:scale-[1.02]"
                >
                  <Send className="w-4 h-4 text-sky-400" /> Telegram
                </a>
                <a
                  href={shareLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 transition-all font-medium text-xs shadow-lg hover:scale-[1.02]"
                >
                  <Twitter className="w-4 h-4 text-blue-400" /> X (Twitter)
                </a>
                <a
                  href={shareLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 transition-all font-medium text-xs shadow-lg hover:scale-[1.02]"
                >
                  <Facebook className="w-4 h-4 text-indigo-400" /> Facebook
                </a>
              </div>

              {/* Copy URL Row */}
              <div className="flex items-center gap-2 pt-2">
                <div className="flex-1 flex items-center px-3 py-2 bg-[#181826] border border-[#2b2b3e] rounded-xl text-xs text-gray-300 font-mono select-all truncate">
                  {websiteUrl}
                </div>
                <button
                  onClick={handleCopyLink}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs transition-all ${
                    copiedLink
                      ? 'bg-emerald-600 text-white shadow-emerald-500/30 shadow-lg'
                      : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/20 shadow-lg'
                  }`}
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Link
                    </>
                  )}
                </button>
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    onClick={handleNativeShare}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#232338] hover:bg-[#2d2d48] text-white border border-[#393954] text-xs font-semibold transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5 text-amber-400" /> Share...
                  </button>
                )}
              </div>

              {/* PWA & Snapcraft Platforms */}
              <div className="pt-2 border-t border-[#232333] flex items-center justify-between text-xs">
                <a
                  href={snapcraftUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-orange-400 hover:text-orange-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Linux Snapcraft Store (470+ Active)
                  <ExternalLink className="w-3 h-3" />
                </a>

                {canInstallPwa && onInstallPwa && (
                  <button
                    onClick={onInstallPwa}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 transition-all font-medium"
                  >
                    <Smartphone className="w-3 h-3 text-emerald-400" /> Install PWA Offline
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Viral Hashtag Generator */}
          {activeTab === 'hashtags' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Recommended Reels / Shorts Hashtags</h4>
                  <p className="text-xs text-gray-400">Copy and paste these viral tags into your YouTube Shorts, TikTok, or Instagram Reels description to get maximum views.</p>
                </div>
                <button
                  onClick={handleCopyHashtags}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    copiedHashtags
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-black'
                  }`}
                >
                  {copiedHashtags ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedHashtags ? 'Copied All Tags!' : 'Copy Tags'}
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-[#151522] border border-[#2b2b3d] text-cyan-300 font-mono text-xs leading-relaxed break-words">
                {viralHashtags}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-lg bg-[#181826] border border-[#252538] space-y-1">
                  <div className="text-amber-400 font-bold">✨ YouTube Shorts & TikTok Tip:</div>
                  <div className="text-gray-300 text-[11px] leading-snug">
                    Use high quality 1080x1920 (9:16) format created in CuteCut Pro for 3x algorithmic reach.
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#181826] border border-[#252538] space-y-1">
                  <div className="text-emerald-400 font-bold">🎯 Quran Auto-Captions:</div>
                  <div className="text-gray-300 text-[11px] leading-snug">
                    Enable Word-by-Word highlighting to increase viewer retention rate above 85%.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Mobile QR Scanner */}
          {activeTab === 'qr' && (
            <div className="flex flex-col items-center justify-center space-y-4 text-center py-2">
              <div className="p-4 bg-white rounded-2xl shadow-xl border border-white/20 inline-block">
                {/* Clean SVG QR Code */}
                <svg
                  className="w-48 h-48"
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="200" height="200" fill="white"/>
                  {/* Outer corner top-left */}
                  <rect x="20" y="20" width="40" height="40" fill="black" rx="4"/>
                  <rect x="28" y="28" width="24" height="24" fill="white" rx="2"/>
                  <rect x="34" y="34" width="12" height="12" fill="black" rx="1"/>

                  {/* Outer corner top-right */}
                  <rect x="140" y="20" width="40" height="40" fill="black" rx="4"/>
                  <rect x="148" y="28" width="24" height="24" fill="white" rx="2"/>
                  <rect x="154" y="34" width="12" height="12" fill="black" rx="1"/>

                  {/* Outer corner bottom-left */}
                  <rect x="20" y="140" width="40" height="40" fill="black" rx="4"/>
                  <rect x="28" y="148" width="24" height="24" fill="white" rx="2"/>
                  <rect x="34" y="154" width="12" height="12" fill="black" rx="1"/>

                  {/* Data blocks */}
                  <rect x="70" y="20" width="15" height="15" fill="black"/>
                  <rect x="95" y="20" width="10" height="10" fill="black"/>
                  <rect x="115" y="20" width="15" height="15" fill="black"/>
                  <rect x="75" y="45" width="25" height="15" fill="black"/>
                  <rect x="110" y="45" width="20" height="20" fill="black"/>
                  
                  <rect x="20" y="70" width="15" height="15" fill="black"/>
                  <rect x="45" y="70" width="20" height="10" fill="black"/>
                  <rect x="75" y="70" width="15" height="20" fill="black"/>
                  <rect x="100" y="75" width="25" height="15" fill="black"/>
                  <rect x="135" y="70" width="15" height="15" fill="black"/>
                  <rect x="160" y="70" width="20" height="20" fill="black"/>

                  <rect x="20" y="95" width="20" height="20" fill="black"/>
                  <rect x="50" y="95" width="15" height="15" fill="black"/>
                  <rect x="75" y="100" width="25" height="25" fill="#0284c7" rx="3"/>
                  <rect x="110" y="100" width="20" height="15" fill="black"/>
                  <rect x="140" y="95" width="20" height="25" fill="black"/>
                  <rect x="170" y="100" width="10" height="20" fill="black"/>

                  <rect x="70" y="135" width="20" height="15" fill="black"/>
                  <rect x="100" y="130" width="15" height="25" fill="black"/>
                  <rect x="125" y="140" width="25" height="15" fill="black"/>
                  <rect x="160" y="130" width="20" height="20" fill="black"/>

                  <rect x="70" y="160" width="15" height="20" fill="black"/>
                  <rect x="95" y="165" width="30" height="15" fill="black"/>
                  <rect x="135" y="165" width="15" height="15" fill="black"/>
                  <rect x="160" y="160" width="20" height="20" fill="black"/>
                </svg>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white">Scan with Phone Camera</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-sm">
                  Scan this QR code with your iPhone or Android to open CuteCut Pro immediately on your phone without downloading heavy files.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: Web & Blog Badge */}
          {activeTab === 'embed' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Embed Badge for Website / GitHub</h4>
                  <p className="text-xs text-gray-400">Add this badge to your website, blog, or project repository.</p>
                </div>
                <button
                  onClick={handleCopyEmbed}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    copiedEmbed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                  }`}
                >
                  {copiedEmbed ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedEmbed ? 'Copied Code!' : 'Copy Code'}
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-[#151522] border border-[#2b2b3d] text-cyan-300 font-mono text-xs leading-relaxed break-all select-all">
                {embedCode}
              </div>

              {/* Preview */}
              <div className="p-4 rounded-xl bg-[#181826] border border-[#26263a] space-y-2">
                <span className="text-xs font-semibold text-gray-400">Live Preview:</span>
                <div className="p-2.5 rounded-lg bg-black/50 border border-gray-700/50 inline-flex items-center gap-2 text-white text-xs">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center font-black text-[10px] text-black">
                    CP
                  </div>
                  <span>Edited with <strong>CuteCut Pro</strong></span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#14141e] border-t border-[#232333] flex items-center justify-between text-xs">
          <span className="text-gray-400 font-medium">✨ Powered by 100% Free CuteCut Pro Studio</span>
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-[#252538] hover:bg-[#303048] text-white rounded-xl font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default PromoteShareModal;
