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
} from 'lucide-react';
import { Clip, ClipType, Track } from '../types';

interface VeoAnimateImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClip: (clip: Clip) => void;
  tracks?: Track[];
  currentTime?: number;
  availableImages?: { id: string; name: string; url: string }[];
}

const MOTION_PRESETS = [
  {
    id: 'cinematic-push',
    name: 'Cinematic Slow Push-In',
    prompt: 'Slow cinematic push-in camera movement with gentle ambient light shimmer and natural depth of field.',
    icon: '🎥',
  },
  {
    id: 'ambient-nature',
    name: 'Breeze & Nature Sway',
    prompt: 'Gentle wind blowing softly causing natural foliage and elements to sway smoothly with warm atmospheric sunlight.',
    icon: '🍃',
  },
  {
    id: 'water-ripples',
    name: 'Ocean Waves & Fluid Ripple',
    prompt: 'Gentle water ripples and rolling wave motion with realistic fluid dynamics and sparkling surface reflections.',
    icon: '🌊',
  },
  {
    id: 'drone-orbit',
    name: 'Drone Aerial Float',
    prompt: 'Smooth drone sweeping aerial orbit motion with expanding landscape perspective and volumetric light rays.',
    icon: '🚁',
  },
  {
    id: 'cloud-timelapse',
    name: 'Time-Lapse Sky Drift',
    prompt: 'Dynamic moving clouds drifting across the sky with shifting soft shadows and golden hour glow.',
    icon: '☁️',
  },
  {
    id: 'parallax-3d',
    name: '3D Parallax Separation',
    prompt: 'Subtle 3D camera parallax effect separating foreground and background with realistic spatial depth.',
    icon: '✨',
  },
];

const REASSURING_MESSAGES = [
  'Connecting to Veo neural video generation engine (veo-3.1-fast-generate-preview)...',
  'Analyzing image composition, spatial layers, and semantic depth...',
  'Synthesizing continuous motion vectors and temporal consistency...',
  'Simulating natural physical light scattering and fluid dynamics...',
  'Rendering coherent motion frames with high temporal stability...',
  'Finalizing video stream compression and H.264 encoding...',
];

export const VeoAnimateImageModal: React.FC<VeoAnimateImageModalProps> = ({
  isOpen,
  onClose,
  onAddClip,
  tracks = [],
  currentTime = 0,
  availableImages = [],
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [prompt, setPrompt] = useState<string>(MOTION_PRESETS[0].prompt);
  const [activePreset, setActivePreset] = useState<string>(MOTION_PRESETS[0].id);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<number>(0);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [operationName, setOperationName] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
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

  // Handle local image file upload
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
    if (!imageSrc) {
      setError('Please upload or select an image to animate.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedVideoUrl(null);
    setAddedSuccess(false);
    setProgressStep(0);
    setElapsedSec(0);

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
      // 1. Call backend to initiate generation with veo-3.1-fast-generate-preview
      const initRes = await fetch('/api/ai/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim() || 'Smooth cinematic natural motion animation',
          image: imageSrc,
          aspectRatio,
          resolution,
          model: 'veo-3.1-fast-generate-preview',
        }),
      });

      const initData = await initRes.json();
      if (!initRes.ok || initData.error) {
        throw new Error(initData.error || 'Failed to initiate Veo video generation');
      }

      const opName = initData.operationName;
      setOperationName(opName);

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
              const errJson = await downloadRes.json().catch(() => ({}));
              throw new Error(errJson.error || 'Failed to retrieve generated video file');
            }

            const videoBlob = await downloadRes.blob();
            const localVideoUrl = URL.createObjectURL(videoBlob);

            setGeneratedVideoUrl(localVideoUrl);
            setIsGenerating(false);
          }
        } catch (pollErr: any) {
          console.error('Polling error:', pollErr);
        }
      }, 4000);
    } catch (err: any) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      setIsGenerating(false);
      setError(err?.message || 'Failed to generate video with Veo');
    }
  };

  // Add generated video to timeline
  const handleAddToTimeline = () => {
    if (!generatedVideoUrl) return;

    // Determine target track (Track 1 or highest video track)
    const videoTrack = tracks.find((t) => t.type === 'video') || tracks[0];
    const targetTrackId = videoTrack ? videoTrack.id : 'track-1';

    // Calculate start time based on current playhead or last clip in track
    const trackClips = videoTrack ? videoTrack.clips : [];
    const lastClipEnd = trackClips.reduce((acc, c) => Math.max(acc, c.start + c.duration), 0);
    const startPos = currentTime > 0 ? currentTime : lastClipEnd;

    const newClip: Clip = {
      id: `veo-clip-${Date.now()}`,
      name: `Veo AI: ${imageName ? imageName.replace(/\.[^/.]+$/, '') : 'Animated Video'}`,
      type: ClipType.VIDEO,
      start: startPos,
      duration: 5.0, // Default Veo duration
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
    a.download = `veo-animated-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-[#111118] border border-cyan-500/30 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#232333] flex items-center justify-between bg-gradient-to-r from-[#161622] via-[#12121c] to-[#0c1322]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-950">
              <Film className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Animate Image into Video
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-500/40">
                  VEO 3.1 AI
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Transform still photos into smooth motion videos using Google Veo Fast Generative Model
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {error && (
            <div className="bg-red-950/40 border border-red-500/50 rounded-xl p-3.5 flex items-start gap-3 text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Generation Issue: </span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Grid Layout: Left Upload & Preview, Right Controls */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: Image / Video Display (5 cols) */}
            <div className="md:col-span-5 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                  <span>1. Source Photo</span>
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

                {/* Upload Area / Dropzone / Preview */}
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
                  /* Generated Video Preview */
                  <div className="relative rounded-xl overflow-hidden border border-cyan-500/40 bg-black aspect-video flex items-center justify-center group shadow-lg shadow-cyan-950/40">
                    <video
                      ref={videoRef}
                      src={generatedVideoUrl}
                      loop
                      playsInline
                      className="w-full h-full object-contain"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onClick={() => {
                        if (videoRef.current) {
                          if (isPlaying) videoRef.current.pause();
                          else videoRef.current.play();
                        }
                      }}
                    />
                    {/* Play/Pause overlay button */}
                    <button
                      onClick={() => {
                        if (videoRef.current) {
                          if (isPlaying) videoRef.current.pause();
                          else videoRef.current.play();
                        }
                      }}
                      className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-sm"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-cyan-500 text-black font-bold text-[10px] shadow">
                      Veo Video Ready
                    </div>
                  </div>
                ) : (
                  /* Selected Source Image Preview */
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
              </div>

              {/* Sample / Existing Project Images */}
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

            {/* Right Column: Generation Controls & Prompt (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              {/* 2. Aspect Ratio Selection (Mandatory 16:9 / 9:16) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300">
                  2. Video Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setAspectRatio('16:9')}
                    className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                      aspectRatio === '16:9'
                        ? 'bg-cyan-950/40 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-950/40'
                        : 'bg-[#151520] border-gray-800 text-gray-400 hover:bg-[#1a1a28] hover:text-gray-200'
                    }`}
                  >
                    <div className="w-10 h-6 border-2 border-current rounded flex items-center justify-center font-mono text-[9px] font-bold">
                      16:9
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">16:9 Landscape</div>
                      <div className="text-[10px] text-gray-400">YouTube, Desktop, Widescreen</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setAspectRatio('9:16')}
                    className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                      aspectRatio === '9:16'
                        ? 'bg-cyan-950/40 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-950/40'
                        : 'bg-[#151520] border-gray-800 text-gray-400 hover:bg-[#1a1a28] hover:text-gray-200'
                    }`}
                  >
                    <div className="w-6 h-10 border-2 border-current rounded flex items-center justify-center font-mono text-[9px] font-bold">
                      9:16
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">9:16 Portrait</div>
                      <div className="text-[10px] text-gray-400">TikTok, Reels, Shorts, Mobile</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* 3. Motion Prompt & Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-300">
                    3. Motion Style & Prompt
                  </label>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {prompt.length}/300
                  </span>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {MOTION_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActivePreset(p.id);
                        setPrompt(p.prompt);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition flex items-center gap-1.5 border ${
                        activePreset === p.id
                          ? 'bg-cyan-500 text-black font-bold border-cyan-400 shadow-sm'
                          : 'bg-[#161622] text-gray-300 border-gray-800 hover:border-gray-700 hover:text-white'
                      }`}
                    >
                      <span>{p.icon}</span>
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>

                {/* Custom Prompt Input Area */}
                <textarea
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    setActivePreset('');
                  }}
                  rows={3}
                  placeholder="Describe how the camera and scene elements should move..."
                  className="w-full bg-[#14141e] border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition resize-none custom-scrollbar"
                />
              </div>

              {/* 4. Model Specs & Resolution Info */}
              <div className="bg-[#141420] rounded-xl p-3 border border-[#232333] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-gray-300 font-medium">Model:</span>
                  <code className="text-cyan-300 font-mono text-[11px] bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40 font-bold">
                    veo-3.1-fast-generate-preview
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
                  <span>Generating Video with Veo AI...</span>
                  <span className="font-mono text-cyan-300 text-xs px-2 py-0.5 bg-black/40 rounded">
                    {elapsedSec}s
                  </span>
                </h3>
                <p className="text-xs text-cyan-200/90 font-medium animate-pulse">
                  {REASSURING_MESSAGES[progressStep]}
                </p>
                <p className="text-[10px] text-gray-400 pt-1">
                  Veo high-fidelity temporal synthesis generates 120+ video frames. Usually completes in ~30–60 seconds.
                </p>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden border border-cyan-900/50">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-1000 animate-pulse"
                  style={{ width: `${Math.min(95, (elapsedSec / 45) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#232333] bg-[#0d0d14] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {generatedVideoUrl ? (
              <>
                <button
                  onClick={handleDownloadMp4}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-[#1a1a28] hover:bg-[#222234] border border-gray-700 transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download MP4</span>
                </button>

                <button
                  onClick={handleAddToTimeline}
                  disabled={addedSuccess}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 shadow-lg shadow-cyan-950 transition flex items-center gap-2"
                >
                  {addedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Added to Timeline!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add Video to Timeline</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={handleStartGeneration}
                disabled={isGenerating || !imageSrc}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-950 transition flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating with Veo...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Generate Video (Veo AI)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
