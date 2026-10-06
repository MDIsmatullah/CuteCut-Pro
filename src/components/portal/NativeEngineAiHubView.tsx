import React from 'react';
import {
  Sparkles,
  Scissors,
  Brain,
  Wand2,
  Film,
  Mic,
  Palette,
  BookOpen,
  Globe,
  CheckCircle2,
  Zap,
  Cpu,
  Monitor,
  Apple,
  Terminal,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Layers,
  HardDrive
} from 'lucide-react';
import { detectSystemHardwareProfile } from '../../utils/systemCapabilityDetector';
import { detectPlatformAndOptimalEngine } from '../../utils/platformEngineDetector';

export interface NativeEngineAiHubViewProps {
  theme: 'dark' | 'light';
  onOpenEditor: (aspectRatio?: '16:9' | '9:16' | '1:1') => void;
  onOpenAiPromptStudio?: () => void;
  onOpenVeoAnimate?: () => void;
  onOpenQuranStudio?: () => void;
  onOpenGeminiIntelligence?: () => void;
  onOpenSoraPhoto?: () => void;
  onOpenVoiceoverTts?: () => void;
  onOpenImageEnhance?: () => void;
  onSwitchToWebsite?: () => void;
  onSwitchToStudioHub?: () => void;
}

export const NativeEngineAiHubView: React.FC<NativeEngineAiHubViewProps> = ({
  theme,
  onOpenEditor,
  onOpenAiPromptStudio,
  onOpenVeoAnimate,
  onOpenQuranStudio,
  onOpenGeminiIntelligence,
  onOpenSoraPhoto,
  onOpenVoiceoverTts,
  onOpenImageEnhance,
  onSwitchToWebsite,
  onSwitchToStudioHub,
}) => {
  const isDark = theme === 'dark';
  const sysProfile = detectSystemHardwareProfile();
  const platformInfo = detectPlatformAndOptimalEngine();

  const aiModelsList = [
    {
      id: 'ai-script-video',
      title: 'AI Script-to-Video Engine',
      badge: 'PRO GENERATIVE',
      badgeColor: 'bg-purple-500 text-white',
      icon: <Wand2 className="w-6 h-6 text-purple-400" />,
      accentColor: 'border-purple-500/40 hover:border-purple-400',
      description: 'Transforms raw text prompts, stories, and scripts into full multi-track video timelines with curated footage, synced audio, and captions.',
      capabilities: ['Multi-Scene Script Generation', 'Auto Footage Matching', 'Soundtrack Mixing', 'Instant Subtitles'],
      onAction: onOpenAiPromptStudio || (() => onOpenEditor('16:9')),
      btnText: 'Launch AI Video Studio',
      btnColor: 'bg-purple-500 hover:bg-purple-400 text-white'
    },
    {
      id: 'gemini-intelligence',
      title: 'Gemini AI Creative Intelligence',
      badge: 'DIRECTOR AI',
      badgeColor: 'bg-indigo-500 text-white',
      icon: <Brain className="w-6 h-6 text-indigo-400" />,
      accentColor: 'border-indigo-500/40 hover:border-indigo-400',
      description: 'Deep-thinking video director AI that writes engaging hooks, structures viral pacing, generates creative scene descriptions, and optimizes retention.',
      capabilities: ['Viral Hook Generation', 'Scene-by-Scene Storyboards', 'Audience Retention AI', 'Title & Tag Generator'],
      onAction: onOpenGeminiIntelligence || (() => onOpenEditor('16:9')),
      btnText: 'Launch Gemini Director',
      btnColor: 'bg-indigo-500 hover:bg-indigo-400 text-white'
    },
    {
      id: 'veo-video',
      title: 'Google Veo 3.1 AI Video Generation',
      badge: 'VEO 3.1 NEURAL',
      badgeColor: 'bg-cyan-500 text-black',
      icon: <Film className="w-6 h-6 text-cyan-400" />,
      accentColor: 'border-cyan-500/40 hover:border-cyan-400',
      description: 'High-definition cinematic text-to-video diffusion model generating photorealistic fluid motion, natural lighting, and cinematic camera drifts.',
      capabilities: ['Cinematic Diffusion 4K', 'Dynamic Camera Motions', 'Photorealistic Lighting', '16:9 & 9:16 Framing'],
      onAction: onOpenVeoAnimate || (() => onOpenEditor('16:9')),
      btnText: 'Generate Veo AI Video',
      btnColor: 'bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold'
    },
    {
      id: 'sora-photo',
      title: 'Sora Photo Motion AI',
      badge: 'SORA MOTION',
      badgeColor: 'bg-rose-500 text-white',
      icon: <Sparkles className="w-6 h-6 text-rose-400" />,
      accentColor: 'border-rose-500/40 hover:border-rose-400',
      description: 'Animates static photos, portrait portraits, landscapes, and artwork into silky 60 FPS motion videos with 3D depth and parallax.',
      capabilities: ['3D Depth Parallax', 'Facial & Eye Animation', 'Atmospheric Particle FX', 'Fluid 60 FPS Motion'],
      onAction: onOpenSoraPhoto || onOpenVeoAnimate || (() => onOpenEditor('9:16')),
      btnText: 'Launch Photo Motion AI',
      btnColor: 'bg-rose-500 hover:bg-rose-400 text-white'
    },
    {
      id: 'quran-studio',
      title: 'CuteCut Pro Quran AI Model Engine',
      badge: 'UNIVERSAL 114 SURAHS',
      badgeColor: 'bg-emerald-500 text-black',
      icon: <BookOpen className="w-6 h-6 text-emerald-400" />,
      accentColor: 'border-emerald-500/40 hover:border-emerald-400',
      description: 'Auto-detects any Surah (Al-Baqarah to An-Nas) & auto-segments Mukammal Surah with Quran.com API text/translations. Syncs 1-breath 1-ayah with zero drift, aligns multi-ayahs in 1 breath (Wasl), and splits long ayahs over 2-4 breaths with voice matching.',
      capabilities: ['114 Surahs (Al-Baqarah to An-Nas)', 'Quran.com API Uthmani & Urdu/English', '1-Breath 1-Ayah Voice Sync (Zero Drift)', '2-4 Ayahs in 1 Breath (Wasl Sync)', 'Long Ayah 2-4 Breaths Intra-Waqf Split'],
      onAction: onOpenQuranStudio || (() => onOpenEditor('9:16')),
      btnText: 'Open CuteCut Quran AI Model',
      btnColor: 'bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold'
    },
    {
      id: 'voiceover-tts',
      title: 'Multilingual Neural Voiceover (TTS)',
      badge: 'NEURAL SPEECH',
      badgeColor: 'bg-blue-500 text-white',
      icon: <Mic className="w-6 h-6 text-blue-400" />,
      accentColor: 'border-blue-500/40 hover:border-blue-400',
      description: 'Human-like studio voice generation in Urdu (اردو), Arabic (العربية), and English with dynamic rate, pitch, and timbre adjustments.',
      capabilities: ['Natural Human Intonation', 'Urdu Nastaliq Voice Engine', 'Arabic Classical Dialect', 'Instant Audio Bus Muxing'],
      onAction: onOpenVoiceoverTts || (() => onOpenEditor('16:9')),
      btnText: 'Open Neural Voiceover',
      btnColor: 'bg-blue-500 hover:bg-blue-400 text-white'
    },
    {
      id: 'image-enhance',
      title: '4K AI Image & Video Upscale HDR',
      badge: 'HDR SUPER-RES',
      badgeColor: 'bg-amber-400 text-black',
      icon: <Palette className="w-6 h-6 text-amber-400" />,
      accentColor: 'border-amber-400/40 hover:border-amber-300',
      description: 'Neural edge sharpening, micro-contrast enhancement, noise reduction, and HDR 10-bit color grading for cinematic clarity.',
      capabilities: ['Edge Detail Sharpening', 'HDR Tone Mapping', 'Chroma Noise Reduction', 'Lossless 4K Canvas Raster'],
      onAction: onOpenImageEnhance || (() => onOpenEditor('16:9')),
      btnText: 'Open 4K AI Enhancer',
      btnColor: 'bg-amber-400 hover:bg-amber-300 text-black font-extrabold'
    }
  ];

  return (
    <div className={`w-full space-y-8 pb-16 ${isDark ? 'text-gray-100' : 'text-slate-800'}`}>
      
      {/* ========================================================================= */}
      {/* 1. NATIVE ENGINE & OFFLINE HARDWARE STATUS HERO                          */}
      {/* ========================================================================= */}
      <div className={`p-6 sm:p-10 rounded-3xl border ${
        isDark 
          ? 'bg-gradient-to-br from-[#120e28] via-[#101432] to-[#0c1e2e] border-[#222238] shadow-2xl' 
          : 'bg-gradient-to-br from-indigo-50 via-cyan-50 to-emerald-50 border-slate-200 shadow-md'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-400 text-xs font-bold border border-cyan-500/30">
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Native Offline Engine & Hardware SDKs Active</span>
            </div>
            <h1 className={`text-2xl sm:text-4xl font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>
              Creative AI Models & Offline Engine Hub
            </h1>
            <p className={`text-xs sm:text-sm max-w-2xl ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
              Running on <strong>{platformInfo.platformName}</strong> with <strong>{sysProfile.cpuCores} CPU Cores</strong> and <strong>{platformInfo.hardwareEncoderName}</strong>. All AI pipelines execute with local GPU acceleration and zero cloud latency.
            </p>
          </div>

          {/* Navigation Action Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            {onSwitchToStudioHub ? (
              <button
                onClick={onSwitchToStudioHub}
                className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs shadow-lg flex items-center gap-2 transition hover:scale-105 cursor-pointer"
              >
                <Scissors className="w-4 h-4 text-black" />
                <span>🎬 Back to Studio Hub</span>
              </button>
            ) : onSwitchToWebsite ? (
              <button
                onClick={onSwitchToWebsite}
                className="px-5 py-3 rounded-2xl bg-white hover:bg-gray-100 text-slate-950 font-black text-xs shadow-lg flex items-center gap-2 transition hover:scale-105 cursor-pointer"
              >
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Visit Official Website (CuteCutPro.com)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            ) : (
              <a
                href="https://cutecutpro.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-2xl bg-white hover:bg-gray-100 text-slate-950 font-black text-xs shadow-lg flex items-center gap-2 transition hover:scale-105 cursor-pointer"
              >
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Visit Official Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Live Hardware Telemetry Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-gray-500/20 text-xs font-mono">
          <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#151528] border-[#25253c]' : 'bg-white border-slate-200'}`}>
            <div className="text-[10px] text-cyan-400 font-bold uppercase">Platform</div>
            <div className="text-xs font-extrabold truncate mt-0.5">{platformInfo.platformBadge}</div>
          </div>

          <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#151528] border-[#25253c]' : 'bg-white border-slate-200'}`}>
            <div className="text-[10px] text-amber-400 font-bold uppercase">Speed Tier</div>
            <div className="text-xs font-extrabold text-emerald-400 truncate mt-0.5">{sysProfile.targetExportFps}</div>
          </div>

          <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#151528] border-[#25253c]' : 'bg-white border-slate-200'}`}>
            <div className="text-[10px] text-purple-400 font-bold uppercase">Hardware Encoder</div>
            <div className="text-xs font-extrabold truncate mt-0.5">{sysProfile.gpuVendor} GPU Core</div>
          </div>

          <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#151528] border-[#25253c]' : 'bg-white border-slate-200'}`}>
            <div className="text-[10px] text-emerald-400 font-bold uppercase">Audio Engine</div>
            <div className="text-xs font-extrabold truncate mt-0.5">32-Bit Float DSP</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CREATIVE AI MODELS SUITE GRID                                          */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Integrated Creative AI Models Suite</span>
          </div>
          <span className="text-xs text-gray-400">7 Active Offline Neural Engines</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {aiModelsList.map((model) => (
            <div
              key={model.id}
              className={`p-6 rounded-3xl border flex flex-col justify-between transition-all duration-200 hover:shadow-xl ${
                isDark 
                  ? `bg-[#131322] border-[#222238] ${model.accentColor}` 
                  : `bg-white border-slate-200 shadow-sm ${model.accentColor}`
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    {model.icon}
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${model.badgeColor}`}>
                    {model.badge}
                  </span>
                </div>

                <div>
                  <h3 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {model.title}
                  </h3>
                  <p className={`text-xs leading-relaxed mt-1 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                    {model.description}
                  </p>
                </div>

                <div className="space-y-1 pt-2 border-t border-gray-500/15 text-[11px] font-medium text-gray-400">
                  {model.capabilities.map((cap, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-gray-300">
                      <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="truncate">{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-5 mt-4">
                <button
                  onClick={model.onAction}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition hover:scale-[1.02] active:scale-95 cursor-pointer ${model.btnColor}`}
                >
                  <span>{model.btnText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. NATIVE DESKTOP PRIVACY & OFFLINE CREDENTIALS                          */}
      {/* ========================================================================= */}
      <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${
        isDark ? 'bg-[#121220] border-[#222238] text-gray-400' : 'bg-slate-100 border-slate-200 text-slate-700'
      }`}>
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            <strong>100% Offline & Private:</strong> CuteCut Pro Desktop & Android Native Engine operates entirely on your local machine. No telemetry or audio/video uploads.
          </span>
        </div>
        <div className="font-mono text-cyan-400 font-bold shrink-0">
          CuteCut Pro v2.5.3 Native
        </div>
      </div>

    </div>
  );
};
