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
  Cloud,
  Layers,
  Music,
  Video,
  Play,
  ExternalLink,
  Cpu,
  Laptop,
  Check,
  Star,
  Server,
  Lock,
  Sun,
  Moon
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
  onSwitchToStudioHub: () => void;
  onOpenLegalModal: (tab: 'privacy' | 'terms' | 'about' | 'contact') => void;
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
  onOpenLegalModal,
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
            instant Quran 4K ayah auto-sync, 32-bit DSP audio mastering, and automatic Firebase Cloud draft backups.
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
              onClick={onSwitchToStudioHub}
              className={`px-6 py-3.5 rounded-2xl font-bold text-sm border transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                isDark 
                  ? 'bg-[#161628] hover:bg-[#202038] border-[#2c2c46] text-white hover:border-cyan-400/50' 
                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800 shadow-sm'
              }`}
            >
              <Scissors className="w-4 h-4 text-cyan-400" />
              <span>🎬 Open Desktop Studio Hub</span>
            </button>

            <a
              href="#native-downloads-section"
              className={`px-5 py-3.5 rounded-2xl font-semibold text-xs border transition flex items-center gap-2 ${
                isDark
                  ? 'bg-black/40 hover:bg-black/60 border-white/10 text-gray-300 hover:text-white'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download Native Apps</span>
            </a>
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
      {/* 2. FIREBASE CLOUD ECOSYSTEM & MULTI-DEVICE SYNC SHOWCASE                 */}
      {/* ========================================================================= */}
      <section className={`p-6 sm:p-10 rounded-3xl border ${
        isDark ? 'bg-[#12121e] border-[#222238]' : 'bg-white border-slate-200 shadow-md'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-gray-500/20">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Cloud className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Firebase Cloud Ecosystem</span>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Seamless Multi-Device Draft Sync & Cloud Storage
            </h2>
            <p className={`text-xs sm:text-sm max-w-2xl ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
              Sign in once with Google to automatically backup your timeline drafts. Start on your Windows or Mac PC, review on Android, and finalize in your Web Browser.
            </p>
          </div>

          {/* User Sign-In CTA or Profile */}
          {user ? (
            <div className={`p-3.5 rounded-2xl border flex items-center gap-3 shrink-0 ${
              isDark ? 'bg-[#18182c] border-[#2a2a44]' : 'bg-slate-50 border-slate-200'
            }`}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full border border-cyan-400 object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-600 text-black font-extrabold flex items-center justify-center">
                  {user.displayName ? user.displayName.charAt(0) : 'U'}
                </div>
              )}
              <div>
                <div className="text-xs font-bold truncate max-w-[150px]">{user.displayName || 'Creator'}</div>
                <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Cloud Active
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                if (onDirectGoogleSignIn) onDirectGoogleSignIn();
                else onOpenAuth();
              }}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-gray-100 text-slate-950 font-extrabold text-xs shadow-lg hover:scale-105 transition flex items-center gap-2.5 cursor-pointer shrink-0"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Connect Google & Firebase Sync</span>
            </button>
          )}
        </div>

        {/* 3 Pillars of Firebase Architecture */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-8">
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#151526] border-[#25253c]' : 'bg-slate-50 border-slate-200'}`}>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold mb-1">Single Sign-On (SSO)</h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
              One-click instant Google Sign-In with zero friction. No cumbersome password management.
            </p>
          </div>

          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#151526] border-[#25253c]' : 'bg-slate-50 border-slate-200'}`}>
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold mb-1">Firestore Realtime Storage</h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
              High-speed distributed cloud storage for project schemas, timeline tracks, and custom presets.
            </p>
          </div>

          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#151526] border-[#25253c]' : 'bg-slate-50 border-slate-200'}`}>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold mb-1">100% Private & Encrypted</h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
              Your video files stay private on your local storage. Only blueprint metadata syncs securely.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. NATIVE DESKTOP & MOBILE APPS DOWNLOAD HUB MATRIX                      */}
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
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
          <h2 className={`text-2xl sm:text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Why Creators Choose CuteCut Pro
          </h2>
          <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
            A side-by-side comparison with mainstream commercial video editors:
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className={`border-b ${isDark ? 'border-[#26263c] text-gray-400' : 'border-slate-200 text-slate-500'}`}>
                <th className="py-3 px-4 font-bold">Feature / Capability</th>
                <th className="py-3 px-4 font-extrabold text-cyan-400 bg-cyan-500/10 rounded-t-xl">CuteCut Pro v2.5.3</th>
                <th className="py-3 px-4 font-semibold">CapCut Pro</th>
                <th className="py-3 px-4 font-semibold">Wondershare Filmora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-500/15">
              <tr>
                <td className="py-3 px-4 font-semibold">4K 60FPS Hardware Export</td>
                <td className="py-3 px-4 text-emerald-400 font-bold bg-cyan-500/5">✅ 100% Free & Unlimited</td>
                <td className="py-3 px-4 text-amber-400">⚠️ Paid Subscription</td>
                <td className="py-3 px-4 text-amber-400">⚠️ Watermarked / Paid</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">Offline Operation (No Internet)</td>
                <td className="py-3 px-4 text-emerald-400 font-bold bg-cyan-500/5">✅ 100% Offline Standalone</td>
                <td className="py-3 px-4 text-rose-400">❌ Requires Login / Cloud</td>
                <td className="py-3 px-4 text-amber-400">⚠️ Account Lock</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">Smart Bitrate 1080p Export</td>
                <td className="py-3 px-4 text-emerald-400 font-bold bg-cyan-500/5">✅ ~25MB Ultra Compact HD</td>
                <td className="py-3 px-4 text-gray-400">~110MB File Size</td>
                <td className="py-3 px-4 text-gray-400">~95MB File Size</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">Quran 4K Ayah & Subtitle Sync</td>
                <td className="py-3 px-4 text-emerald-400 font-bold bg-cyan-500/5">✅ Automated Tajweed Engine</td>
                <td className="py-3 px-4 text-rose-400">❌ None</td>
                <td className="py-3 px-4 text-rose-400">❌ None</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">32-Bit Float DSP Studio EQ & Limiter</td>
                <td className="py-3 px-4 text-emerald-400 font-bold bg-cyan-500/5">✅ Built-in Mastering</td>
                <td className="py-3 px-4 text-gray-400">Basic Audio</td>
                <td className="py-3 px-4 text-gray-400">Basic Audio</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">Watermark Policy</td>
                <td className="py-3 px-4 text-emerald-400 font-bold bg-cyan-500/5">✅ Zero Watermark Ever</td>
                <td className="py-3 px-4 text-amber-400">Removable via app</td>
                <td className="py-3 px-4 text-rose-400">❌ Big Watermark in Free</td>
              </tr>
            </tbody>
          </table>
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

        <div className="text-center text-[11px] text-gray-500 pb-2">
          Copyright © 2026 Asmatullah Developer. All rights reserved. Powered by WebCodecs, FFmpeg, and WebAssembly.
        </div>
      </footer>

    </div>
  );
};
