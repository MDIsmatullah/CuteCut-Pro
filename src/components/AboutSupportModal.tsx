import React, { useState } from 'react';
import {
  Heart,
  Coffee,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  X,
  ShieldCheck,
  Zap,
  Layers,
  BookOpen,
  Download,
  Share2,
  Video,
  Music,
  Code2,
  Crown
} from 'lucide-react';
import { GUMROAD_PURCHASE_URL } from '../services/proLicenseService';

interface AboutSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSupportClick: () => void;
  donationUrl: string;
}

export const AboutSupportModal: React.FC<AboutSupportModalProps> = ({
  isOpen,
  onClose,
  onSupportClick,
  donationUrl,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(donationUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {});
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#0f0f16] border border-[#272738] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Hero Image / Banner */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden shrink-0">
          <img
            src="https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=1200&auto=format&fit=crop&q=80"
            alt="CuteCut Pro Background"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transform scale-105 filter brightness-75"
          />
          {/* Subtle multi-stop gradient for readable text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f16] via-[#0f0f16]/60 to-black/40" />

          {/* Close button in top-right */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 border border-white/15 text-gray-300 hover:text-white transition cursor-pointer z-20"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Hero Content Overlay */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[11px] font-semibold mb-2">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Next-Gen Video Editing & Quran Studio</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                CuteCut Pro
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 drop-shadow-sm mt-0.5">
                Modern Filmora & CapCut-Style Timeline Editor • Free & Open Creative Tool
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                v2.5.0 Pro
              </span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-gray-300 custom-scrollbar">
          {/* About App Description */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5" />
              <span>App Ke Bare Me / About CuteCut Pro</span>
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-gray-300 bg-[#161622] p-3.5 rounded-xl border border-[#232334]">
              <strong className="text-white">CuteCut Pro</strong> ek high-performance, professional-grade browser aur native desktop/mobile video editor hai jo Filmora aur CapCut jaise powerful features faraham karta hai. Isme multi-track visual timeline, frame-accurate split/trim, Quranic automated Ayah sync, Uthmani calligraphy overlays, live audio waveform visualizer aur high-speed offline WebCodecs/FFmpeg export shamil hain.
            </p>
          </div>

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#14141e] border border-[#222232] rounded-xl p-3 flex flex-col gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Layers className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Multi-Track Lanes</h4>
              <p className="text-[11px] text-gray-400 leading-normal">
                Dedicated Text, Image, Video aur Audio tracks frame-by-frame precision ke sath.
              </p>
            </div>

            <div className="bg-[#14141e] border border-[#222232] rounded-xl p-3 flex flex-col gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Quran Video Studio</h4>
              <p className="text-[11px] text-gray-400 leading-normal">
                Automated Ayah segmentation, Word-by-word karaoke, Urdu/English translations.
              </p>
            </div>

            <div className="bg-[#14141e] border border-[#222232] rounded-xl p-3 flex flex-col gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Fast Export</h4>
              <p className="text-[11px] text-gray-400 leading-normal">
                Up to 4K Ultra-HD MP4 export bina kisi watermark ya hidden fees ke.
              </p>
            </div>
          </div>

          {/* Support & Donation Card (Sadqa-e-Jariyah / Buy Me a Coffee) */}
          <div className="bg-gradient-to-br from-[#1d1524] via-[#1a1526] to-[#12121e] border-2 border-pink-500/40 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-md">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-[11px] font-bold">
                  <Heart className="w-3 h-3 fill-pink-400 text-pink-400" />
                  <span>Support The Project / Sadqa-e-Jariyah</span>
                </div>
                <h4 className="text-base font-extrabold text-white">
                  Hamari App Ko Upgrade Aur Enhance Karne Me Madad Karen
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Aapki choti si donation ya support humen mazeed behtareen features, cloud storage, fast rendering aur nayi Islamic tools add karne me hosla aur resources faraham karegi.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col w-full sm:w-auto gap-2 shrink-0">
                <a
                  href={GUMROAD_PURCHASE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition cursor-pointer"
                  title="Buy CuteCut Pro Lifetime License on Gumroad"
                >
                  <Crown className="w-4 h-4 fill-black text-black" />
                  <span>Get CuteCut Pro License</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                </a>

                <button
                  onClick={onSupportClick}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFDD00] hover:bg-[#FFE338] text-black font-extrabold text-xs shadow-lg shadow-yellow-500/20 active:scale-95 transition cursor-pointer"
                  title="Buy Me a Coffee"
                >
                  <Coffee className="w-4 h-4 fill-black stroke-[2]" />
                  <span>Buy Me a Coffee</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                </button>

                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#241a2c] hover:bg-[#30213b] border border-pink-500/30 text-pink-200 text-xs font-medium transition cursor-pointer"
                  title="Copy Donation Link"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300 font-semibold">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-pink-400" />
                      <span>Copy Donation Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#20202e] bg-[#12121c] flex items-center justify-between text-xs text-gray-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[11px]">CuteCut Pro • 100% Free Creative Editor</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#1f1f2d] hover:bg-[#2c2c3e] text-gray-200 hover:text-white font-medium text-xs transition cursor-pointer"
          >
            Start Editing
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutSupportModal;
