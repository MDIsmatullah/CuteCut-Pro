import React, { useState, useRef, useEffect } from 'react';
import {
  Film,
  Sparkles,
  Upload,
  Play,
  Pause,
  Plus,
  Download,
  X,
  RefreshCw,
  Sliders,
  Zap,
  CheckCircle2,
  AlertCircle,
  Eye,
  Layers,
  ArrowRight,
  Maximize2,
  Image as ImageIcon,
  Check,
  Compass,
  Clock,
  Wand2,
  Video,
  Type,
  Shuffle,
  ChevronRight,
  Crown,
  Mic,
  Volume2,
} from 'lucide-react';
import { Clip, ClipType, Track } from '../types';
import { ProLicenseService, ProLicenseState } from '../services/proLicenseService';
import { CuteCutProPaywallModal } from './CuteCutProPaywallModal';

interface VeoAnimateImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClip: (clip: Clip) => void;
  tracks?: Track[];
  currentTime?: number;
  availableImages?: { id: string; name: string; url: string }[];
}

export type VeoStudioMode = 'prompt_to_video' | 'image_to_video' | 'first_last_frame';

const MOTION_PRESETS = [
  {
    id: 'cinematic-push',
    name: 'Cinematic Push-In',
    prompt: 'Slow cinematic push-in camera movement with gentle ambient light shimmer and natural depth of field.',
    icon: '🎥',
  },
  {
    id: 'ambient-nature',
    name: 'Nature Sway & Breeze',
    prompt: 'Gentle wind blowing softly causing foliage and natural elements to sway smoothly with warm sunlight.',
    icon: '🍃',
  },
  {
    id: 'water-ripples',
    name: 'Ocean Waves & Fluid',
    prompt: 'Gentle water ripples and rolling wave motion with realistic fluid dynamics and sparkling surface reflections.',
    icon: '🌊',
  },
  {
    id: 'drone-orbit',
    name: 'Drone Aerial Orbit',
    prompt: 'Smooth drone sweeping aerial orbit motion with expanding landscape perspective and volumetric light rays.',
    icon: '🚁',
  },
  {
    id: 'cloud-timelapse',
    name: 'Sky & Cloud Drift',
    prompt: 'Dynamic moving clouds drifting across the sky with shifting soft shadows and golden hour glow.',
    icon: '☁️',
  },
  {
    id: 'parallax-3d',
    name: '3D Spatial Parallax',
    prompt: 'Subtle 3D camera parallax effect separating foreground and background with realistic spatial depth.',
    icon: '✨',
  },
];

const SORA_PROMPT_PRESETS = [
  {
    category: 'Cinematic & Nature',
    items: [
      {
        title: 'Eagle Mountain Flight',
        prompt: 'Majestic golden eagle soaring gracefully across snow-capped Himalayan peaks during sunset, volumetric golden rays, 8k hyper-realistic slow-motion cinematic drone footage',
        icon: '🦅',
      },
      {
        title: 'Bioluminescent Waves',
        prompt: 'Glowing turquoise bioluminescent waves gently crashing on black volcanic sand at night under a starlit galaxy sky, ultra-clear liquid motion, photorealistic',
        icon: '🌊',
      },
      {
        title: 'Autumn Forest Mist',
        prompt: 'Sunlight filtering through morning fog in an ancient redwood forest with vibrant red and golden autumn leaves drifting softly to the forest floor',
        icon: '🍂',
      },
    ],
  },
  {
    category: 'Islamic Spiritual & History',
    items: [
      {
        title: 'Spiritual Mosque Twilight',
        prompt: 'Grand Islamic mosque dome with intricate ornate calligraphy illuminated by gentle lanterns at blue twilight, peaceful spiritual atmosphere, slow cinematic pan',
        icon: '🕌',
      },
      {
        title: 'Desert Caravan Sunset',
        prompt: 'Bedouin caravan with camels moving across majestic golden sand dunes during twilight, gentle warm breeze, cinematic historical documentary aesthetic',
        icon: '🐪',
      },
      {
        title: 'Golden Age Science Library',
        prompt: 'Historical 9th-century House of Wisdom in Baghdad, brass astrolabes reflecting candle light, parchment scrolls, scholars in ornate robes, warm ambient lighting',
        icon: '📜',
      },
    ],
  },
  {
    category: 'Sci-Fi & Urban',
    items: [
      {
        title: 'Cyberpunk Neon Rain',
        prompt: 'Futuristic city street at night during gentle rain, glowing neon signs in cyan and magenta reflecting in puddles, sleek flying vehicles passing above',
        icon: '🚗',
      },
      {
        title: 'Cosmic Nebula Rings',
        prompt: 'Deep space exploration camera flying past iridescent cosmic gas nebula with sparkling stardust, orbiting crystalline asteroid rings in 8k quality',
        icon: '🌌',
      },
    ],
  },
];

const REASSURING_MESSAGES = [
  'Connecting to Veo neural video generation engine (veo-3.1-lite-generate-preview)...',
  'Analyzing prompt semantics, temporal motion vectors, and physics...',
  'Synthesizing continuous 3D motion frames and photorealistic lighting...',
  'Simulating natural physical particle dynamics and atmospheric depth...',
  'Rendering coherent motion sequence with high temporal consistency...',
  'Finalizing video stream compression and H.264 video encoding...',
];

export const VeoAnimateImageModal: React.FC<VeoAnimateImageModalProps> = ({
  isOpen,
  onClose,
  onAddClip,
  tracks = [],
  currentTime = 0,
  availableImages = [],
}) => {
  // Modes: Prompt-to-video (Sora style), Image-to-video (photo animation), First-to-last-frame
  const [studioMode, setStudioMode] = useState<VeoStudioMode>('prompt_to_video');

  const licenseService = ProLicenseService.getInstance();
  const [proState, setProState] = useState<ProLicenseState>(licenseService.getState());
  const [showPaywallModal, setShowPaywallModal] = useState<boolean>(false);

  const refreshLicense = () => {
    setProState(licenseService.getState());
  };

  useEffect(() => {
    if (isOpen) {
      refreshLicense();
    }
  }, [isOpen]);

  // Input states
  const [prompt, setPrompt] = useState<string>(SORA_PROMPT_PRESETS[0].items[0].prompt);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [lastFrameSrc, setLastFrameSrc] = useState<string | null>(null);
  const [lastFrameName, setLastFrameName] = useState<string>('');

  // Generation options
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [model, setModel] = useState<'veo-3.1-lite-generate-preview' | 'veo-3.1-generate-preview'>('veo-3.1-lite-generate-preview');
  const [activeMotionPreset, setActiveMotionPreset] = useState<string>(MOTION_PRESETS[0].id);

  // Status & Operation polling
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<number>(0);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [operationName, setOperationName] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);
  const [includeVoiceover, setIncludeVoiceover] = useState<boolean>(true);
  const [voicePersona, setVoicePersona] = useState<string>('Kore');
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastFrameInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const pollIntervalRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  if (!isOpen) return null;

  // Handle local image file upload (First Frame)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageName(file.name);
    setError(null);
    setGeneratedVideoUrl(null);
    setAddedSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageSrc(result);
    };
    reader.readAsDataURL(file);
  };

  // Handle Ending Frame upload
  const handleLastFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLastFrameName(file.name);
    setError(null);
    setGeneratedVideoUrl(null);
    setAddedSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setLastFrameSrc(result);
    };
    reader.readAsDataURL(file);
  };

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    setImageName(file.name);
    setError(null);
    setGeneratedVideoUrl(null);
    setAddedSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageSrc(result);
    };
    reader.readAsDataURL(file);
  };

  // Select existing project image
  const handleSelectExistingImage = (img: { id: string; name: string; url: string }) => {
    setImageSrc(img.url);
    setImageName(img.name);
    setError(null);
    setGeneratedVideoUrl(null);
    setAddedSuccess(false);
  };

  // Start Generation
  const handleStartGeneration = async () => {
    // Check Pro License or Credit balance (2 free trials)
    if (!licenseService.hasAccess()) {
      setShowPaywallModal(true);
      return;
    }

    // Validation based on mode
    if (studioMode === 'prompt_to_video' && !prompt.trim()) {
      setError('Please enter a descriptive prompt for your AI video.');
      return;
    }

    if (studioMode === 'image_to_video' && !imageSrc) {
      setError('Please upload or select an image to animate into video.');
      return;
    }

    if (studioMode === 'first_last_frame' && (!imageSrc || !lastFrameSrc)) {
      setError('Please provide both the Starting Frame and Ending Frame.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedVideoUrl(null);
    setAddedSuccess(false);
    setProgressStep(0);
    setElapsedSec(0);

    // Deduct 1 credit if not Pro
    licenseService.consumeCredit();
    refreshLicense();

    // Start timer & message rotation
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setElapsedSec((prev) => {
        const next = prev + 1;
        if (next % 6 === 0) {
          setProgressStep((s) => (s + 1) % REASSURING_MESSAGES.length);
        }
        return next;
      });
    }, 1000);

    try {
      setGeneratedAudioUrl(null);

      // Synthesize parallel AI voiceover narration if enabled
      if (includeVoiceover && (prompt.trim() || imageName)) {
        const speechText = prompt.trim() || `Cinematic scene featuring ${imageName || 'visual animation'}`;
        fetch('/api/ai/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: speechText,
            voiceName: voicePersona || 'Kore',
            style: 'Cinematic, engaging, clear and inspiring',
          }),
        })
          .then((r) => r.json())
          .then((ttsData) => {
            if (ttsData.audioUrl) {
              setGeneratedAudioUrl(ttsData.audioUrl);
            }
          })
          .catch((e) => console.warn('[AI Voiceover] TTS synthesis note:', e));
      }

      // 1. Call backend to initiate generation with selected Veo model
      const payload: any = {
        prompt: prompt.trim() || 'Smooth cinematic natural motion video animation',
        aspectRatio,
        resolution,
        model,
      };

      if (studioMode === 'image_to_video' || studioMode === 'first_last_frame') {
        if (imageSrc) payload.image = imageSrc;
      }

      if (studioMode === 'first_last_frame' && lastFrameSrc) {
        payload.lastFrame = lastFrameSrc;
      }

      const initRes = await fetch('/api/ai/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const initData = await initRes.json();
      if (!initRes.ok || initData.error) {
        throw new Error(initData.error || 'Failed to initiate Veo video generation');
      }

      const opName = initData.operationName;
      setOperationName(opName);

      // Synthesize matching narration / story voiceover in parallel
      const voiceText = prompt.trim();
      if (voiceText) {
        const cleanNarration = voiceText.length > 200 
          ? voiceText.slice(0, 180) + '...'
          : voiceText;
        fetch('/api/ai/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: cleanNarration, voice: 'en-US-Journey-F' }),
        }).then(res => res.json()).then(ttsData => {
          if (ttsData.audioUrl) {
            setGeneratedAudioUrl(ttsData.audioUrl);
          }
        }).catch(() => {});
      }

      // 2. Poll video status
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch('/api/ai/video-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName: opName }),
          });
          const statusData = await statusRes.json();

          if (statusData.error) {
            clearInterval(pollIntervalRef.current);
            clearInterval(timerIntervalRef.current);
            setIsGenerating(false);
            setError(
              typeof statusData.error === 'string'
                ? statusData.error
                : statusData.error.message || 'Error occurred during video generation'
            );
            return;
          }

          if (statusData.done) {
            clearInterval(pollIntervalRef.current);
            clearInterval(timerIntervalRef.current);

            // 3. Download generated video binary and create blob URL
            const downloadRes = await fetch('/api/ai/video-download', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ operationName: opName }),
            });

            if (!downloadRes.ok) {
              throw new Error('Failed to download generated video stream');
            }

            const videoBlob = await downloadRes.blob();
            const blobUrl = URL.createObjectURL(videoBlob);

            setGeneratedVideoUrl(blobUrl);
            setIsGenerating(false);
          }
        } catch (pollErr: any) {
          console.error('Polling error:', pollErr);
        }
      }, 2000);
    } catch (err: any) {
      clearInterval(timerIntervalRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      setIsGenerating(false);
      setError(err?.message || 'Failed to generate video');
    }
  };

  // Add generated clip to video track
  const handleAddToTimeline = () => {
    if (!generatedVideoUrl) return;

    const videoTrack = tracks.find((t) => t.type === ClipType.VIDEO);
    const targetTrackId = videoTrack ? videoTrack.id : 'track-1';

    const trackClips = videoTrack ? videoTrack.clips : [];
    const lastClipEnd = trackClips.reduce((acc, c) => Math.max(acc, c.start + c.duration), 0);
    const startPos = currentTime > 0 ? currentTime : lastClipEnd;

    const clipName = studioMode === 'prompt_to_video'
      ? `Veo AI: ${prompt.slice(0, 24)}...`
      : `Veo AI: ${imageName ? imageName.replace(/\.[^/.]+$/, '') : 'Animated Video'}`;

    const newClip: Clip = {
      id: `veo-clip-${Date.now()}`,
      name: clipName,
      type: ClipType.VIDEO,
      start: startPos,
      duration: 5.0,
      sourceStart: 0,
      sourceDuration: 5.0,
      url: generatedVideoUrl,
      trackId: targetTrackId,
      playbackRate: 1.0,
      volume: 1.0,
      opacity: 1.0,
      blendMode: 'normal',
      color: '#06b6d4',
    };

    onAddClip(newClip);

    // If voiceover audio was synthesized, also add audio clip to Audio Track
    if (generatedAudioUrl) {
      const audioTrack = tracks.find((t) => t.type === ClipType.AUDIO);
      const audioTrackId = audioTrack ? audioTrack.id : 'track-audio';
      const audioClip: Clip = {
        id: `veo-voice-${Date.now()}`,
        name: `AI Voice: ${clipName}`,
        type: ClipType.AUDIO,
        start: startPos,
        duration: 5.0,
        sourceStart: 0,
        sourceDuration: 5.0,
        url: generatedAudioUrl,
        trackId: audioTrackId,
        playbackRate: 1.0,
        volume: 1.0,
        color: '#a855f7',
      };
      onAddClip(audioClip);
    }

    setAddedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Download MP4 to user's computer
  const handleDownloadMp4 = () => {
    if (!generatedVideoUrl) return;
    const a = document.createElement('a');
    a.href = generatedVideoUrl;
    a.download = `veo-video-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-[#0f1118] border border-cyan-500/30 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#232333] flex items-center justify-between bg-gradient-to-r from-[#141824] via-[#10141f] to-[#0c1322]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-950">
              <Film className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  AI Video Creator Studio
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-500/40">
                  Google Veo 3.1 & Sora-Style
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Generate high-definition AI videos from text prompts, animate photos, or create multi-frame morphs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Golden PRO / Credits Pill */}
            <button
              onClick={() => setShowPaywallModal(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow cursor-pointer ${
                proState.isPro
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black border border-amber-400 shadow-amber-500/20'
                  : 'bg-[#1a1626] hover:bg-[#251f38] text-amber-300 border border-amber-500/40 hover:border-amber-400'
              }`}
              title="Manage Pro License & Free Credits"
            >
              <Crown className={`w-3.5 h-3.5 ${proState.isPro ? 'fill-black text-black' : 'text-amber-400'}`} />
              <span>
                {proState.isPro ? 'PRO ACTIVE' : `${proState.creditsRemaining}/2 Free Left`}
              </span>
              {!proState.isPro && (
                <span className="bg-amber-400 text-black text-[9px] px-1 rounded font-extrabold ml-0.5">
                  UPGRADE
                </span>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/80 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Mode Switcher: 3 Core Methods */}
        <div className="px-6 py-2.5 bg-[#0a0d14] border-b border-gray-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center bg-[#151924] p-1 rounded-xl border border-gray-700/60">
            <button
              onClick={() => {
                setStudioMode('prompt_to_video');
                setError(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                studioMode === 'prompt_to_video'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-cyan-300" />
              <span>Prompt to Video (Text-to-Video)</span>
            </button>

            <button
              onClick={() => {
                setStudioMode('image_to_video');
                setError(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                studioMode === 'image_to_video'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-300" />
              <span>Image to Video (Animate Photo)</span>
            </button>

            <button
              onClick={() => {
                setStudioMode('first_last_frame');
                setError(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                studioMode === 'first_last_frame'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5 text-indigo-300" />
              <span>First & Last Frame Morph</span>
            </button>
          </div>

          <div className="text-[11px] text-gray-400 font-medium hidden sm:flex items-center gap-1">
            <span>Powered by:</span>
            <span className="text-cyan-400 font-mono font-bold">Google Veo 3.1 Neural Engine</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {error && (
            <div className="bg-red-950/40 border border-red-500/50 rounded-xl p-3.5 flex items-start gap-3 text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Generation Notice: </span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Grid Layout: Left Media / Preview, Right Generation Controls */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: Visual / Upload Display (5 cols) */}
            <div className="md:col-span-5 space-y-4">
              {/* Method A: Prompt to Video Display */}
              {studioMode === 'prompt_to_video' && (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                    <span>Video Output Preview</span>
                    <span className="text-[10px] text-cyan-400 font-mono">Neural Simulation</span>
                  </div>

                  {generatedVideoUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-cyan-500/40 bg-black aspect-video flex items-center justify-center group shadow-lg shadow-cyan-950/40">
                      <video
                        ref={videoRef}
                        src={generatedVideoUrl}
                        loop
                        playsInline
                        className="w-full h-full object-contain"
                        onPlay={() => {
                          setIsPlaying(true);
                          if (audioRef.current && generatedAudioUrl) {
                            audioRef.current.currentTime = 0;
                            audioRef.current.play().catch(() => {});
                          }
                        }}
                        onPause={() => {
                          setIsPlaying(false);
                          if (audioRef.current) audioRef.current.pause();
                        }}
                        onClick={() => {
                          if (videoRef.current) {
                            if (isPlaying) {
                              videoRef.current.pause();
                              if (audioRef.current) audioRef.current.pause();
                            } else {
                              videoRef.current.play();
                              if (audioRef.current && generatedAudioUrl) audioRef.current.play().catch(() => {});
                            }
                          }
                        }}
                      />
                      {generatedAudioUrl && (
                        <audio ref={audioRef} src={generatedAudioUrl} loop />
                      )}
                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            if (isPlaying) {
                              videoRef.current.pause();
                              if (audioRef.current) audioRef.current.pause();
                            } else {
                              videoRef.current.play();
                              if (audioRef.current && generatedAudioUrl) audioRef.current.play().catch(() => {});
                            }
                          }
                        }}
                        className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-sm"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </button>
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-cyan-500 text-black font-bold text-[10px] shadow flex items-center gap-1.5">
                        <span>AI Video Ready ✓</span>
                        {generatedAudioUrl && <span className="bg-purple-900/90 text-white px-1.5 py-0.2 rounded text-[9px] font-mono">🔊 Voice Active</span>}
                      </div>
                    </div>
                  ) : (
                    <div className="border border-gray-800 bg-[#141724] rounded-xl p-5 flex flex-col items-center justify-center text-center min-h-[220px] space-y-3">
                      <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                        <Wand2 className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white mb-1">
                          Direct Prompt-to-Video Engine
                        </p>
                        <p className="text-[11px] text-gray-400 max-w-xs">
                          Just like OpenAI Sora, Veo generates raw continuous video from text prompts without needing any initial image.
                        </p>
                      </div>
                      <div className="px-3 py-1 bg-cyan-950/40 border border-cyan-500/30 rounded-full text-[10px] text-cyan-300 font-mono">
                        Prompt → Neural Physics → 1080p Video
                      </div>
                    </div>
                  )}

                  {/* Sora Prompt Category Inspiration */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-semibold text-gray-400 flex items-center justify-between">
                      <span>Popular Sora Prompt Presets:</span>
                      <span className="text-[10px] text-gray-500">Click to apply</span>
                    </div>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                      {SORA_PROMPT_PRESETS.map((cat, ci) => (
                        <div key={ci} className="space-y-1">
                          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{cat.category}</div>
                          <div className="grid grid-cols-1 gap-1">
                            {cat.items.map((item, ii) => (
                              <button
                                key={ii}
                                onClick={() => setPrompt(item.prompt)}
                                className="text-left p-2 rounded-lg bg-[#141722] hover:bg-[#1a2030] border border-gray-800 hover:border-cyan-500/40 transition flex items-start gap-2 text-xs group"
                              >
                                <span className="text-sm shrink-0">{item.icon}</span>
                                <div className="flex-1 truncate">
                                  <div className="font-semibold text-gray-200 group-hover:text-cyan-300">{item.title}</div>
                                  <div className="text-[10px] text-gray-500 truncate">{item.prompt}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Method B: Image to Video Display */}
              {studioMode === 'image_to_video' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                    <span>Source Photo to Animate</span>
                    {imageSrc && (
                      <button
                        onClick={() => {
                          setImageSrc(null);
                          setImageName('');
                          setGeneratedVideoUrl(null);
                        }}
                        className="text-[11px] text-cyan-400 hover:underline"
                      >
                        Change Photo
                      </button>
                    )}
                  </label>

                  {!imageSrc ? (
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-700 hover:border-cyan-500/60 bg-[#161622] hover:bg-[#1a1a2a] rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition group min-h-[220px]"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <div className="w-12 h-12 rounded-full bg-cyan-500/10 group-hover:bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3 transition">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-medium text-white mb-1">
                        Click to upload or drag & drop photo
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Supports JPG, PNG, WebP (up to 20MB)
                      </p>
                    </div>
                  ) : generatedVideoUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-cyan-500/40 bg-black aspect-video flex items-center justify-center group shadow-lg shadow-cyan-950/40">
                      <video
                        ref={videoRef}
                        src={generatedVideoUrl}
                        loop
                        playsInline
                        className="w-full h-full object-contain"
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-cyan-500 text-black font-bold text-[10px] shadow">
                        Veo Animated Video Ready ✓
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`relative rounded-xl overflow-hidden border border-gray-700 bg-black flex items-center justify-center ${
                        aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[300px]' : 'aspect-video'
                      }`}
                    >
                      <img
                        src={imageSrc}
                        alt="Source for animation"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-black/70 backdrop-blur-sm text-[10px] text-gray-300 truncate">
                        {imageName || 'Selected Photo'}
                      </div>
                    </div>
                  )}

                  {availableImages.length > 0 && !imageSrc && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] text-gray-400 font-medium">Or choose from project assets:</div>
                      <div className="grid grid-cols-4 gap-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                        {availableImages.map((img) => (
                          <button
                            key={img.id}
                            onClick={() => handleSelectExistingImage(img)}
                            className="aspect-square rounded-lg overflow-hidden border border-gray-800 hover:border-cyan-400 transition relative group"
                          >
                            <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Method C: First & Last Frame Display */}
              {studioMode === 'first_last_frame' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {/* First Frame */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">1. Start Frame</div>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border border-dashed border-gray-700 hover:border-cyan-500/60 bg-[#161622] rounded-lg aspect-video flex flex-col items-center justify-center p-2 text-center cursor-pointer overflow-hidden relative"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        {imageSrc ? (
                          <img src={imageSrc} alt="Start frame" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-gray-400 text-[10px] flex flex-col items-center">
                            <Upload className="w-4 h-4 mb-1 text-cyan-400" />
                            <span>Upload Start</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Last Frame */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">2. End Frame</div>
                      <div
                        onClick={() => lastFrameInputRef.current?.click()}
                        className="border border-dashed border-gray-700 hover:border-cyan-500/60 bg-[#161622] rounded-lg aspect-video flex flex-col items-center justify-center p-2 text-center cursor-pointer overflow-hidden relative"
                      >
                        <input
                          ref={lastFrameInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLastFrameUpload}
                          className="hidden"
                        />
                        {lastFrameSrc ? (
                          <img src={lastFrameSrc} alt="End frame" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-gray-400 text-[10px] flex flex-col items-center">
                            <Upload className="w-4 h-4 mb-1 text-indigo-400" />
                            <span>Upload End</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-400 italic">
                    Veo will synthesize a natural, coherent transition morphing the start frame into the end frame.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Generation Controls & Settings (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              {/* Aspect Ratio & Resolution Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Aspect Ratio */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    Aspect Ratio
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setAspectRatio('16:9')}
                      className={`py-2 px-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                        aspectRatio === '16:9'
                          ? 'bg-cyan-950/40 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-950/40'
                          : 'bg-[#151520] border-gray-800 text-gray-400 hover:bg-[#1a1a28] hover:text-gray-200'
                      }`}
                    >
                      <div className="w-6 h-4 border border-current rounded flex items-center justify-center font-mono text-[8px] font-bold">
                        16:9
                      </div>
                      <div className="text-xs font-bold truncate">Landscape (16:9)</div>
                    </button>

                    <button
                      onClick={() => setAspectRatio('9:16')}
                      className={`py-2 px-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                        aspectRatio === '9:16'
                          ? 'bg-cyan-950/40 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-950/40'
                          : 'bg-[#151520] border-gray-800 text-gray-400 hover:bg-[#1a1a28] hover:text-gray-200'
                      }`}
                    >
                      <div className="w-4 h-6 border border-current rounded flex items-center justify-center font-mono text-[8px] font-bold">
                        9:16
                      </div>
                      <div className="text-xs font-bold truncate">Shorts/Reels (9:16)</div>
                    </button>
                  </div>
                </div>

                {/* Resolution & Model Tier */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    Resolution & Model
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setResolution('720p');
                        setModel('veo-3.1-lite-generate-preview');
                      }}
                      className={`py-2 px-2 rounded-xl border text-center transition ${
                        resolution === '720p' && model === 'veo-3.1-lite-generate-preview'
                          ? 'bg-cyan-950/40 border-cyan-400 text-cyan-200'
                          : 'bg-[#151520] border-gray-800 text-gray-400 hover:bg-[#1a1a28]'
                      }`}
                    >
                      <div className="text-xs font-bold">720p HD</div>
                      <div className="text-[9px] text-cyan-400/80">Veo Lite (Fast)</div>
                    </button>

                    <button
                      onClick={() => {
                        setResolution('1080p');
                        setModel('veo-3.1-generate-preview');
                      }}
                      className={`py-2 px-2 rounded-xl border text-center transition ${
                        resolution === '1080p' && model === 'veo-3.1-generate-preview'
                          ? 'bg-cyan-950/40 border-cyan-400 text-cyan-200'
                          : 'bg-[#151520] border-gray-800 text-gray-400 hover:bg-[#1a1a28]'
                      }`}
                    >
                      <div className="text-xs font-bold">1080p FHD</div>
                      <div className="text-[9px] text-cyan-400/80">Veo Pro (High-Q)</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Prompt & Motion Style */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      {studioMode === 'prompt_to_video'
                        ? 'Video Prompt (Sora / Veo Style)'
                        : 'Motion Guidance & Camera Movement'}
                    </span>
                  </label>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {prompt.length}/400
                  </span>
                </div>

                {/* Preset Motion Chips (for Image-to-video mode) */}
                {studioMode === 'image_to_video' && (
                  <div className="flex flex-wrap gap-1.5">
                    {MOTION_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setActiveMotionPreset(p.id);
                          setPrompt(p.prompt);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition flex items-center gap-1.5 border ${
                          activeMotionPreset === p.id
                            ? 'bg-cyan-500 text-black font-bold border-cyan-400 shadow-sm'
                            : 'bg-[#161622] text-gray-300 border-gray-800 hover:border-gray-700 hover:text-white'
                        }`}
                      >
                        <span>{p.icon}</span>
                        <span>{p.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Prompt Textarea */}
                <textarea
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    setActiveMotionPreset('');
                  }}
                  rows={4}
                  placeholder={
                    studioMode === 'prompt_to_video'
                      ? 'Describe what you want to see: camera angle, lighting, subject actions, atmosphere, photorealism...'
                      : 'Describe how the camera and scene elements should move...'
                  }
                  className="w-full bg-[#14141e] border border-gray-800 focus:border-cyan-500 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none transition resize-none custom-scrollbar"
                />
              </div>

              {/* Voiceover & Audio Narration Switcher (User voice requirement) */}
              <div className="bg-[#141422] rounded-xl p-3 border border-purple-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>AI Voiceover & Sound (AI بولتی ہوئی آواز)</span>
                        <span className="px-1.5 py-0.5 text-[9px] bg-purple-900/60 text-purple-300 rounded font-semibold border border-purple-500/30">Auto Narration</span>
                      </div>
                      <div className="text-[10px] text-gray-400">Synthesizes spoken narration voiceover so video has audio track</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeVoiceover}
                      onChange={(e) => setIncludeVoiceover(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {includeVoiceover && (
                  <div className="flex items-center gap-2 pt-1.5 border-t border-gray-800/80">
                    <span className="text-[11px] text-gray-400">Voice Persona:</span>
                    <select
                      value={voicePersona}
                      onChange={(e) => setVoicePersona(e.target.value)}
                      className="bg-[#0f0f18] text-xs text-purple-200 border border-purple-500/40 rounded-lg px-2 py-1 outline-none font-medium cursor-pointer"
                    >
                      <option value="Kore">Kore (Warm, Inspiring Female)</option>
                      <option value="Puck">Puck (Clear, Energetic Male)</option>
                      <option value="Charon">Charon (Deep, Cinematic Male)</option>
                      <option value="Fenrir">Fenrir (Authoritative Storyteller)</option>
                      <option value="Zephyr">Zephyr (Gentle, Serene Tone)</option>
                    </select>
                    {generatedAudioUrl && (
                      <span className="ml-auto text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Voice Synthesized
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Model Info Badge */}
              <div className="bg-[#141420] rounded-xl p-3 border border-[#232333] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-gray-300 font-medium">Active Engine:</span>
                  <code className="text-cyan-300 font-mono text-[11px] bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40 font-bold">
                    {model}
                  </code>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-gray-400">
                  <span>Output:</span>
                  <span className="font-bold text-white">{aspectRatio} • {resolution}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Generation Progress Screen */}
          {isGenerating && (
            <div className="bg-gradient-to-r from-cyan-950/50 via-[#10192b] to-blue-950/50 border border-cyan-500/40 rounded-2xl p-6 text-center space-y-4 shadow-xl">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                <Sparkles className="w-7 h-7 text-cyan-400 animate-pulse" />
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center justify-center gap-2">
                  <span>Generating AI Video with Google Veo</span>
                  <span className="font-mono text-cyan-300 text-xs">({elapsedSec}s)</span>
                </h3>
                <p className="text-xs text-cyan-200/90 font-medium transition-all duration-500">
                  {REASSURING_MESSAGES[progressStep]}
                </p>
                <p className="text-[10px] text-gray-400">
                  Neural video generation typically takes 30-90 seconds. You can monitor the progress here.
                </p>
              </div>

              <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden max-w-md mx-auto">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(95, elapsedSec * 2.2 + 5)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#232333] bg-[#0c0e15] flex items-center justify-between">
          <div className="text-xs text-gray-400 hidden sm:block">
            {generatedVideoUrl ? (
              <span className="text-cyan-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Video synthesized successfully! Add it to your timeline or download.
              </span>
            ) : (
              <span>Ready to synthesize coherent motion video</span>
            )}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {generatedVideoUrl ? (
              <>
                <button
                  onClick={handleDownloadMp4}
                  className="px-4 py-2.5 rounded-xl border border-gray-700 hover:border-gray-500 bg-[#161622] hover:bg-[#1f1f30] text-gray-200 text-xs font-semibold flex items-center gap-2 transition"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Download MP4</span>
                </button>

                <button
                  onClick={handleAddToTimeline}
                  disabled={addedSuccess}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs flex items-center gap-2 transition shadow-lg shadow-cyan-950/50 cursor-pointer disabled:opacity-50"
                >
                  {addedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Added to Video Track!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add to Timeline Track</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={handleStartGeneration}
                disabled={isGenerating}
                className={`px-6 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition shadow-lg disabled:opacity-50 cursor-pointer ${
                  !proState.isPro && proState.creditsRemaining === 0
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:from-amber-400 hover:to-orange-400 shadow-amber-500/20'
                    : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-950/50'
                }`}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Video...</span>
                  </>
                ) : !proState.isPro && proState.creditsRemaining === 0 ? (
                  <>
                    <Crown className="w-4 h-4 fill-black text-black" />
                    <span>Unlock Pro License (2 Free Uses Expired)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {studioMode === 'prompt_to_video'
                        ? 'Generate Video from Prompt (Sora Style)'
                        : studioMode === 'image_to_video'
                        ? 'Animate Photo into Video'
                        : 'Generate First & Last Frame Morph'}
                    </span>
                    {!proState.isPro && (
                      <span className="ml-1 px-1.5 py-0.5 rounded bg-black/40 text-[10px] text-cyan-200">
                        {proState.creditsRemaining}/2 Free
                      </span>
                    )}
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Pro Paywall Modal */}
        <CuteCutProPaywallModal
          isOpen={showPaywallModal}
          onClose={() => {
            setShowPaywallModal(false);
            refreshLicense();
          }}
          onActivated={() => {
            refreshLicense();
          }}
          featureName="Google Veo & Sora AI Video Creator"
        />
      </div>
    </div>
  );
};
