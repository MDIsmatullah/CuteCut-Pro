import React, { useState } from 'react';
import {
  Sparkles,
  Scissors,
  Download,
  CheckCircle2,
  Zap,
  Globe,
  Monitor,
  Apple,
  Terminal,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  Layers,
  Music,
  Video,
  Play,
  ExternalLink,
  Cpu,
  Laptop,
  Check,
  Star,
  Sun,
  Moon,
  BookOpen,
  FileText,
  Youtube,
  Heart,
  CreditCard,
  Radio,
  MessageCircle
} from 'lucide-react';
import { UserProfile } from '../AuthModal';
import { ReleaseInfo } from '../../utils/releaseService';
import { PWAInstallButton } from '../PWAInstallButton';

export interface WebsiteShowcaseViewProps {
  theme: 'dark' | 'light';
  user: UserProfile | null;
  release: ReleaseInfo;
  onOpenEditor: (aspectRatio?: '16:9' | '9:16' | '1:1') => void;
  onOpenAuth: () => void;
  onDirectGoogleSignIn?: () => void;
  onOpenQuranStudio?: () => void;
  onOpenAiPromptStudio?: () => void;
  onSwitchToStudioHub?: () => void;
  onSwitchToAiHub?: () => void;
  onOpenLegalModal: (tab: 'privacy' | 'terms' | 'about' | 'contact') => void;
  onOpenGuides?: () => void;
  onOpenReviews?: () => void;
  onOpenBlog?: () => void;
  onOpenChannelsModal?: () => void;
  onOpenBuyLicenseModal?: () => void;
  onOpenDonateModal?: () => void;
  onOpenCreatorFeed?: () => void;
}

export const WebsiteShowcaseView: React.FC<WebsiteShowcaseViewProps> = ({
  theme,
  user,
  release,
  onOpenEditor,
  onOpenAuth,
  onDirectGoogleSignIn,
  onOpenQuranStudio,
  onOpenAiPromptStudio,
  onSwitchToStudioHub,
  onSwitchToAiHub,
  onOpenLegalModal,
  onOpenGuides,
  onOpenReviews,
  onOpenBlog,
  onOpenChannelsModal,
  onOpenBuyLicenseModal,
  onOpenDonateModal,
  onOpenCreatorFeed,
}) => {
  const isDark = theme === 'dark';
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const handleDownload = (platform: string, filename: string) => {
    setDownloadToast(`Starting download for ${platform} (${filename})...`);
    setTimeout(() => setDownloadToast(null), 4500);
  };

  return (
    <div className={`w-full space-y-12 sm:space-y-16 pb-16 ${isDark ? 'text-gray-100' : 'text-slate-800'}`}>
      
      {/* Download toast notification */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. HERO SECTION: LUXURY GLOBAL SHOWCASE BANNER                          */}
      {/* ========================================================================= */}
      <section className={`relative rounded-3xl overflow-hidden p-6 sm:p-10 md:p-14 border ${
        isDark 
          ? 'bg-gradient-to-br from-[#180a32] via-[#0c1836] to-[#082430] border-white/10 shadow-2xl' 
          : 'bg-gradient-to-br from-indigo-50 via-cyan-50 to-emerald-50 border-slate-200 shadow-xl'
      }`}>
        {/* Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Release Version Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-400 text-xs font-black tracking-wide shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>CuteCut Pro v2.5.3 — Official Production Release</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>

          {/* Master Headline */}
          <h1 className={`text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.15] ${
            isDark ? 'text-white' : 'text-slate-950'
          }`}>
            The Next-Generation <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Offline-First 4K Video Editor
            </span>
          </h1>

          {/* Subtitle */}
          <p className={`text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed ${
            isDark ? 'text-gray-300' : 'text-slate-600'
          }`}>
            Full hardware-accelerated 60 FPS WebCodecs engine, frame-accurate multi-track timeline, 
            instant Quran 4K ayah auto-sync, 32-bit DSP audio mastering, and local timeline draft autosave.
          </p>

          {/* CTAs Row */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => onOpenEditor('16:9')}
              className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-slate-950 font-black text-sm shadow-xl hover:shadow-cyan-400/30 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2.5 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>🚀 Launch Web Studio (Free)</span>
            </button>

            <button
              onClick={() => {
                if (onSwitchToAiHub) onSwitchToAiHub();
                else if (onSwitchToStudioHub) onSwitchToStudioHub();
              }}
              className={`px-6 py-3.5 rounded-2xl font-bold text-sm border transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                isDark 
                  ? 'bg-[#161628] hover:bg-[#202038] border-[#2c2c46] text-white hover:border-emerald-400/50' 
                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800 shadow-sm'
              }`}
            >
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>⚡ Explore AI Models & Engine</span>
            </button>
          </div>

          {/* Creator & Monetization Action Bar (Buy AI License | Donate | YouTube Channels | Creator Updates) */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs font-bold">
            {onOpenBuyLicenseModal && (
              <button
                onClick={onOpenBuyLicenseModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition cursor-pointer active:scale-95 animate-pulse"
                title="Buy AI Model Pro License ($19 / PKR 3,500 Lifetime)"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>⚡ Buy AI License (PRO)</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono font-black">$19</span>
              </button>
            )}

            {onOpenDonateModal && (
              <button
                onClick={onOpenDonateModal}
                className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                title="Support & Donate to CuteCut Pro (Sadqah-e-Jariyah)"
              >
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/40" />
                <span>❤️ Donate (Support)</span>
              </button>
            )}

            {onOpenChannelsModal && (
              <button
                onClick={onOpenChannelsModal}
                className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                title="Official YouTube Channels: Guldasta Islam & CuteCut Pro"
              >
                <Youtube className="w-3.5 h-3.5 text-red-400" />
                <span>📺 YouTube Channels</span>
              </button>
            )}

            {onOpenCreatorFeed && (
              <button
                onClick={onOpenCreatorFeed}
                className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                title="Creator Audio, Video & Official Broadcast Updates"
              >
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>📢 Creator Updates & Audio</span>
              </button>
            )}
          </div>

          {/* User Help, Social Proof & Ranking Booster Quick Links (Guides | Reviews | Blog) */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-bold">
            <button
              onClick={onOpenGuides}
              className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
              title="Step-by-step guides for Quran subtitles, audio editing & mobile timelines"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guides & Tutorials</span>
            </button>
            <span className="text-gray-600">•</span>
            <button
              onClick={onOpenReviews}
              className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition cursor-pointer"
              title="Verified 5-star user feedback, trust ratings and creator proof"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>Reviews (4.9★)</span>
            </button>
            <span className="text-gray-600">•</span>
            <button
              onClick={onOpenBlog}
              className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 transition cursor-pointer"
              title="Creator blog posts, Android video tips, and viral algorithm secrets"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Creator Blog & Tips</span>
            </button>
          </div>

          {/* Quick Value Points */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-semibold text-gray-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> 100% Free & Open-Source
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <CheckCircle2 className="w-4 h-4" /> Zero Watermark Forever
            </span>
            <span className="flex items-center gap-1.5 text-purple-400">
              <CheckCircle2 className="w-4 h-4" /> 100% Offline C++ Engine
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <CheckCircle2 className="w-4 h-4" /> Compact ~25MB 1080p Exports
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. NATIVE DESKTOP & MOBILE APPS DOWNLOAD HUB MATRIX                      */}
      {/* ========================================================================= */}
      <section id="native-downloads-section" className={`p-6 sm:p-10 rounded-3xl border ${
        isDark ? 'bg-[#12121e] border-[#222238]' : 'bg-white border-slate-200 shadow-md'
      }`}>
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Cross-Platform Binaries (v2.5.3)</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Download CuteCut Pro for Your Operating System
          </h2>
          <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
            Pure offline C++ & WebCodecs performance with zero cloud latency. Choose your preferred package below:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Windows Package */}
          <div className={`p-6 rounded-2xl border flex flex-col justify-between transition hover:border-cyan-400/60 ${
            isDark ? 'bg-[#151528] border-[#25253c]' : 'bg-slate-50 border-slate-200 shadow-sm'
          }`}>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Monitor className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold">Windows 10 / 11</h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">64-Bit (.exe NSIS Installer & Portable)</p>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-400 pt-2 border-t border-gray-500/20">
                <li className="flex items-center gap-1.5 text-emerald-400"><Check className="w-3.5 h-3.5" /> NVENC & Intel QSV Acceleration</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-cyan-400" /> 100% Offline Standalone</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-cyan-400" /> NSIS 1-Click Setup & Shortcuts</li>
              </ul>
            </div>

            <div className="pt-5 space-y-2">
              <a
                href={release.assets.windowsExe}
                download
                onClick={() => handleDownload('Windows', 'CuteCut.Pro.Setup.2.5.3.exe')}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition"
              >
                <Download className="w-4 h-4" />
                <span>Download .exe (Installer)</span>
              </a>
              <a
                href={release.assets.windowsPortable}
                download
                onClick={() => handleDownload('Windows Portable', 'cutecut-pro-Portable-2.5.3.exe')}
                className={`w-full py-2 rounded-xl text-xs font-semibold text-center block border transition ${
                  isDark ? 'bg-black/30 hover:bg-black/60 border-white/10 text-gray-300' : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                Portable Version (.exe)
              </a>
            </div>
          </div>

          {/* macOS Package */}
          <div className={`p-6 rounded-2xl border flex flex-col justify-between transition hover:border-purple-400/60 ${
            isDark ? 'bg-[#151528] border-[#25253c]' : 'bg-slate-50 border-slate-200 shadow-sm'
          }`}>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Apple className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold">Apple macOS</h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">Apple Silicon (M1-M4) & Intel (.dmg)</p>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-400 pt-2 border-t border-gray-500/20">
                <li className="flex items-center gap-1.5 text-emerald-400"><Check className="w-3.5 h-3.5" /> Apple Metal & VideoToolbox</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-400" /> Movies Folder Auto-Save</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-400" /> Native Retina Display 60 FPS</li>
              </ul>
            </div>

            <div className="pt-5 space-y-2">
              <a
                href={release.assets.macDmg}
                download
                onClick={() => handleDownload('macOS', 'CuteCut-Pro-2.5.3.dmg')}
                className="w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition"
              >
                <Download className="w-4 h-4" />
                <span>Download .dmg (Universal)</span>
              </a>
              <a
                href={release.assets.macZip}
                download
                onClick={() => handleDownload('macOS Zip', 'CuteCut-Pro-2.5.3-mac.zip')}
                className={`w-full py-2 rounded-xl text-xs font-semibold text-center block border transition ${
                  isDark ? 'bg-black/30 hover:bg-black/60 border-white/10 text-gray-300' : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                Standalone .zip
              </a>
            </div>
          </div>

          {/* Linux Package */}
          <div className={`p-6 rounded-2xl border flex flex-col justify-between transition hover:border-amber-400/60 ${
            isDark ? 'bg-[#151528] border-[#25253c]' : 'bg-slate-50 border-slate-200 shadow-sm'
          }`}>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Terminal className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold">Linux Desktop</h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">AppImage, .deb, Snap & Flatpak</p>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-400 pt-2 border-t border-gray-500/20">
                <li className="flex items-center gap-1.5 text-emerald-400"><Check className="w-3.5 h-3.5" /> Universal .AppImage (All distros)</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-400" /> Ubuntu / Debian .deb package</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-400" /> Hardware VA-API encoding</li>
              </ul>
            </div>

            <div className="pt-5 space-y-2">
              <a
                href={release.assets.linuxAppImage}
                download
                onClick={() => handleDownload('Linux AppImage', 'CuteCut-Pro-2.5.3.AppImage')}
                className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition"
              >
                <Download className="w-4 h-4" />
                <span>Download .AppImage</span>
              </a>
              <a
                href={release.assets.linuxDeb}
                download
                onClick={() => handleDownload('Linux Debian', 'cutecut-pro_2.5.3_amd64.deb')}
                className={`w-full py-2 rounded-xl text-xs font-semibold text-center block border transition ${
                  isDark ? 'bg-black/30 hover:bg-black/60 border-white/10 text-gray-300' : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                Debian / Ubuntu (.deb)
              </a>
            </div>
          </div>

          {/* Android Mobile & PWA */}
          <div className={`p-6 rounded-2xl border flex flex-col justify-between transition hover:border-emerald-400/60 ${
            isDark ? 'bg-[#151528] border-[#25253c]' : 'bg-slate-50 border-slate-200 shadow-sm'
          }`}>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold">Android & PWA</h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">Android APK & 1-Click PWA App</p>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-400 pt-2 border-t border-gray-500/20">
                <li className="flex items-center gap-1.5 text-emerald-400"><Check className="w-3.5 h-3.5" /> High-speed Mobile UI</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Touch Gesture Timeline</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> 1-Click PWA Offline install</li>
              </ul>
            </div>

            <div className="pt-5 space-y-2">
              <a
                href={release.assets.androidApk}
                download
                onClick={() => handleDownload('Android', 'cutecut-pro-v2.5.3.apk')}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition"
              >
                <Download className="w-4 h-4" />
                <span>Download Android APK</span>
              </a>
              <div className="pt-1">
                <PWAInstallButton />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. COMPARISON MATRIX: CUTECUT PRO VS CAPCUT & FILMORA                     */}
      {/* ========================================================================= */}
      <section className={`p-6 sm:p-10 rounded-3xl border ${
        isDark ? 'bg-[#12121e] border-[#222238]' : 'bg-white border-slate-200 shadow-md'
      }`}>
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
            <span>⚔️ Software Comparison & Benchmarks</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            The Free Alternative to CapCut, Filmora, Premiere Pro & DaVinci Resolve
          </h2>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
            Compare CuteCut Pro side-by-side with heavy commercial suites. Get professional multi-track speed, 4K 60FPS export, and AI captions without monthly subscriptions or intrusive watermarks.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[650px]">
            <thead>
              <tr className={`border-b ${isDark ? 'border-[#26263c] text-gray-400' : 'border-slate-200 text-slate-500'}`}>
                <th className="py-3 px-4 font-bold">Feature / Capability</th>
                <th className="py-3 px-4 font-extrabold text-cyan-400 bg-cyan-500/10 rounded-t-xl">CuteCut Pro v2.5.3</th>
                <th className="py-3 px-4 font-semibold">CapCut Pro</th>
                <th className="py-3 px-4 font-semibold">Filmora 14</th>
                <th className="py-3 px-4 font-semibold">Premiere Pro</th>
                <th className="py-3 px-4 font-semibold">DaVinci Resolve</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-500/15">
              <tr>
                <td className="py-3 px-4 font-semibold">4K 60FPS Hardware Export</td>
                <td className="py-3 px-4 text-emerald-400 font-bold bg-cyan-500/5">✅ 100% Free & Unlimited</td>
                <td className="py-3 px-4 text-amber-400">⚠️ Paid Subscription</td>
                <td className="py-3 px-4 text-amber-400">⚠️ Watermarked / Paid</td>
                <td className="py-3 px-4 text-gray-300">Full Support</td>
                <td className="py-3 px-4 text-gray-300">Full Support</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">Offline Operation (No Internet)</td>
                <td className="py-3 px-4 text-emerald-400 font-bold bg-cyan-500/5">✅ 100% Offline Standalone</td>
                <td className="py-3 px-4 text-rose-400">❌ Requires Login / Cloud</td>
                <td className="py-3 px-4 text-amber-400">⚠️ Account Lock</td>
                <td className="py-3 px-4 text-amber-400">⚠️ Creative Cloud Login</td>
                <td className="py-3 px-4 text-emerald-400">✅ Offline Standalone</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">Smart Bitrate 1080p Export</td>
                <td className="py-3 px-4 text-emerald-400 font-bold bg-cyan-500/5">✅ ~25MB Ultra Compact HD</td>
                <td className="py-3 px-4 text-gray-400">~110MB File Size</td>
                <td className="py-3 px-4 text-gray-400">~95MB File Size</td>
                <td className="py-3 px-4 text-gray-400">Complex Encoding</td>
                <td className="py-3 px-4 text-gray-400">Complex Encoding</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">Hardware Footprint & RAM</td>
                <td className="py-3 px-4 text-emerald-400 font-bold bg-cyan-500/5">✅ Lightweight (2GB RAM)</td>
                <td className="py-3 px-4 text-gray-300">Moderate Mobile</td>
                <td className="py-3 px-4 text-amber-400">Heavy Installer</td>
                <td className="py-3 px-4 text-rose-400">Heavy (16GB+ RAM)</td>
                <td className="py-3 px-4 text-rose-400">Heavy (Dedicated GPU)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">Quran 4K Ayah & Subtitle Sync</td>
                <td className="py-3 px-4 text-emerald-400 font-bold bg-cyan-500/5">✅ Automated Tajweed Engine</td>
                <td className="py-3 px-4 text-rose-400">❌ None</td>
                <td className="py-3 px-4 text-rose-400">❌ None</td>
                <td className="py-3 px-4 text-rose-400">❌ Manual Only</td>
                <td className="py-3 px-4 text-rose-400">❌ Manual Only</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">32-Bit Float DSP Studio Audio</td>
                <td className="py-3 px-4 text-emerald-400 font-bold bg-cyan-500/5">✅ Built-in Mastering</td>
                <td className="py-3 px-4 text-gray-400">Basic Audio</td>
                <td className="py-3 px-4 text-gray-400">Basic Audio</td>
                <td className="py-3 px-4 text-gray-300">Audition Linked</td>
                <td className="py-3 px-4 text-emerald-400">✅ Fairlight Audio</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">Watermark Policy</td>
                <td className="py-3 px-4 text-emerald-400 font-bold bg-cyan-500/5">✅ Zero Watermark Ever</td>
                <td className="py-3 px-4 text-amber-400">Removable via app</td>
                <td className="py-3 px-4 text-rose-400">❌ Big Watermark in Free</td>
                <td className="py-3 px-4 text-gray-300">No Watermark</td>
                <td className="py-3 px-4 text-gray-300">No Watermark</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Competitor Alternative SEO Explainer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/5">
          <div className={`p-4 rounded-2xl border space-y-1.5 ${
            isDark ? 'bg-[#0f0f1c] border-[#222236]' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className="font-bold text-xs text-cyan-400">
              Why CuteCut Pro is the #1 Free CapCut Alternative:
            </h4>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Unlike CapCut, CuteCut Pro never forces watermarks on free exports, does not harvest user media on remote servers, and does not lock 60FPS or 4K rendering behind a paywall. Everything renders client-side on your local hardware.
            </p>
          </div>

          <div className={`p-4 rounded-2xl border space-y-1.5 ${
            isDark ? 'bg-[#0f0f1c] border-[#222236]' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className="font-bold text-xs text-amber-400">
              Better than Wondershare Filmora for Everyday Creators:
            </h4>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Filmora places a giant watermark across free exported videos and charges expensive renewal fees. CuteCut Pro gives you frame-accurate blade splitting, audio waveforms, and transitions 100% free with zero export watermarks.
            </p>
          </div>

          <div className={`p-4 rounded-2xl border space-y-1.5 ${
            isDark ? 'bg-[#0f0f1c] border-[#222236]' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className="font-bold text-xs text-purple-400">
              Lightweight Alternative to Adobe Premiere Pro:
            </h4>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Premiere Pro requires high-end workstations with 16GB+ RAM and expensive monthly Creative Cloud plans. CuteCut Pro runs instantly in any browser or lightweight laptop, letting you slice, grade, and export reels in seconds.
            </p>
          </div>

          <div className={`p-4 rounded-2xl border space-y-1.5 ${
            isDark ? 'bg-[#0f0f1c] border-[#222236]' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className="font-bold text-xs text-emerald-400">
              Fast Alternative to DaVinci Resolve for Reels & Shorts:
            </h4>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              While DaVinci Resolve is ideal for Hollywood color grading, its steep learning curve and massive GPU requirements make fast social media editing tedious. CuteCut Pro delivers instant 9:16 vertical workflows and automated subtitles on any device.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FOOTER & LEGAL LINKS                                                 */}
      {/* ========================================================================= */}
      <footer className={`pt-10 border-t ${isDark ? 'border-[#1f1f32] text-gray-400' : 'border-slate-200 text-slate-500'}`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 flex items-center justify-center">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white">CuteCut Pro</span>
              <span className="text-[10px] text-gray-400 block font-mono">v2.5.3 • Asmatullah Developer</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
            {onOpenBuyLicenseModal && (
              <>
                <button onClick={onOpenBuyLicenseModal} className="text-blue-400 hover:text-blue-300 transition cursor-pointer font-bold">
                  ⚡ Buy AI License
                </button>
                <span>•</span>
              </>
            )}
            {onOpenDonateModal && (
              <>
                <button onClick={onOpenDonateModal} className="text-rose-400 hover:text-rose-300 transition cursor-pointer font-bold">
                  ❤️ Donate / Support
                </button>
                <span>•</span>
              </>
            )}
            {onOpenChannelsModal && (
              <>
                <button onClick={onOpenChannelsModal} className="text-red-400 hover:text-red-300 transition cursor-pointer font-bold flex items-center gap-1">
                  <Youtube className="w-3.5 h-3.5" />
                  <span>YouTube Channels</span>
                </button>
                <span>•</span>
              </>
            )}
            {onOpenCreatorFeed && (
              <>
                <button onClick={onOpenCreatorFeed} className="text-emerald-400 hover:text-emerald-300 transition cursor-pointer font-bold flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>Creator Updates</span>
                </button>
                <span>•</span>
              </>
            )}
            <button onClick={onOpenGuides} className="hover:text-cyan-400 transition cursor-pointer">
              Guides & Help
            </button>
            <span>•</span>
            <button onClick={onOpenReviews} className="hover:text-amber-400 transition cursor-pointer">
              Reviews (4.9★)
            </button>
            <span>•</span>
            <button onClick={onOpenBlog} className="hover:text-purple-400 transition cursor-pointer">
              Blog & Posts
            </button>
            <span>•</span>
            <button onClick={() => onOpenLegalModal('privacy')} className="hover:text-cyan-400 transition cursor-pointer">
              Privacy Policy
            </button>
            <span>•</span>
            <button onClick={() => onOpenLegalModal('terms')} className="hover:text-cyan-400 transition cursor-pointer">
              Terms of Service
            </button>
            <span>•</span>
            <button onClick={() => onOpenLegalModal('about')} className="hover:text-cyan-400 transition cursor-pointer">
              About & Engine
            </button>
            <span>•</span>
            <button onClick={() => onOpenLegalModal('contact')} className="hover:text-cyan-400 transition cursor-pointer">
              Contact & Support
            </button>
          </div>
        </div>

        {/* Social Channels Bar */}
        <div className="py-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Official Channels:</span>
            <a
              href="https://www.youtube.com/channel/UCVP3RNRdficqmriDszLjzcQ"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>Guldasta Islam (Quran)</span>
            </a>
            <span className="text-gray-600">•</span>
            <a
              href="https://www.youtube.com/channel/UCgTnf68omNLAr4kHTYXa10g"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>CuteCut Pro Studio</span>
            </a>
          </div>

          <div className="flex items-center gap-3 text-gray-400 text-xs">
            <a href="https://whatsapp.com/channel/cutecutpro" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp Channel</span>
            </a>
          </div>
        </div>

        <div className="text-center text-[11px] text-gray-500 pb-2">
          Copyright © 2026 Asmatullah Developer. All rights reserved. Powered by WebCodecs, FFmpeg, and WebAssembly.
        </div>
      </footer>

    </div>
  );
};
