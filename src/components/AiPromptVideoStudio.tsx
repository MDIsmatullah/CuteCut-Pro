import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Film, Image as ImageIcon, Mic, Play, Pause, Layers, Wand2, RefreshCw, CheckCircle, ChevronRight, Upload, Video, Music, Type, AlertCircle, Clock, Volume2, Sliders, ArrowRight, Crown, Lock } from 'lucide-react';
import { Clip, ClipType, Track } from '../types';
import { ProLicenseService, ProLicenseState } from '../services/proLicenseService';
import { CuteCutProPaywallModal } from './CuteCutProPaywallModal';
import { generateSceneVoiceoverAudio } from '../utils/audioSynthesizer';

interface AiScenePlan {
  sceneNumber: number;
  durationSeconds: number;
  narration: string;
  subtitle: string;
  visualPrompt: string;
  stockSearchKeywords: string;
  cameraMotion?: string;
  bgmMood?: string;
  generatedImageUrl?: string;
  generatedVideoUrl?: string;
  generatedAudioUrl?: string;
  isGeneratingMedia?: boolean;
}

interface AiPromptVideoStudioProps {
  tracks: Track[];
  onSetTracks: (newTracks: Track[]) => void;
  onSetDuration: (duration: number) => void;
  onClose?: () => void;
  currentAspectRatio?: string;
  onSelectAspectRatio?: (ratio: string) => void;
}

export const AiPromptVideoStudio: React.FC<AiPromptVideoStudioProps> = ({
  tracks,
  onSetTracks,
  onSetDuration,
  onClose,
  currentAspectRatio = '16:9',
  onSelectAspectRatio,
}) => {
  const licenseService = ProLicenseService.getInstance();
  const [proState, setProState] = useState<ProLicenseState>(licenseService.getState());
  const [showPaywallModal, setShowPaywallModal] = useState<boolean>(false);

  const refreshLicense = () => {
    setProState(licenseService.getState());
  };

  useEffect(() => {
    refreshLicense();
  }, []);
  // Mode selection
  const [studioMode, setStudioMode] = useState<'prompt_to_video' | 'story_images_to_video' | 'quran_hadith_reel'>('prompt_to_video');

  // Input states
  const [promptText, setPromptText] = useState<string>('The wonders of the deep universe and cosmic galaxies');
  const [targetDuration, setTargetDuration] = useState<number>(30);
  const [aspectRatio, setAspectRatio] = useState<string>(currentAspectRatio || '16:9');
  const [language, setLanguage] = useState<'en' | 'ur' | 'ar' | 'hi'>('en');
  const [voiceTone, setVoiceTone] = useState<string>('inspirational');
  const [voicePersona, setVoicePersona] = useState<string>('Kore');
  const [visualStyle, setVisualStyle] = useState<string>('cinematic_realistic');
  const [mediaEngine, setMediaEngine] = useState<'hybrid_stock_ai' | 'gemini_ai_image' | 'veo_ai_video'>('hybrid_stock_ai');

  // Uploaded images for story_images_to_video mode
  const [uploadedStoryImages, setUploadedStoryImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generation status
  const [isPlanning, setIsPlanning] = useState<boolean>(false);
  const [planProgressMessage, setPlanProgressMessage] = useState<string>('');
  const [storyboardScenes, setStoryboardScenes] = useState<AiScenePlan[]>([]);
  const [storyTitle, setStoryTitle] = useState<string>('');
  const [storySynopsis, setStorySynopsis] = useState<string>('');
  const [isAssembling, setIsAssembling] = useState<boolean>(false);
  const [assembleSuccess, setAssembleSuccess] = useState<boolean>(false);

  // Audio preview
  const [playingAudioIndex, setPlayingAudioIndex] = useState<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Popular Prompt Inspiration Templates
  const PROMPT_TEMPLATES = [
    {
      category: '🌌 Science & Universe',
      prompts: [
        'The mysteries of black holes and the edge of the observable universe',
        'How water travels from distant comets to life on Earth',
        '5 mind-blowing facts about the human brain and consciousness',
      ],
    },
    {
      category: '🕌 Islamic History & Stories',
      prompts: [
        'The story of Prophet Yunus (Jonah) and the whale with deep spiritual reflection',
        'The Golden Age of Islamic science, astronomy, and medicine in Baghdad and Cordoba',
        'Virtues of Surah Al-Mulk: The protective light of the night',
      ],
    },
    {
      category: '✨ Inspiration & Motivation',
      prompts: [
        'The power of daily consistency and waking up before sunrise',
        'How overcoming failure builds unbreakable character',
        'Finding inner peace and calmness in a noisy world',
      ],
    },
  ];

  // Handle image upload for Story Image to Video
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedStoryImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Step 1: Generate Storyboard Plan using Gemini AI Director
  const handleGenerateStoryboard = async () => {
    if (!promptText.trim() && uploadedStoryImages.length === 0) return;

    // Check Pro License or Credit balance
    if (!licenseService.hasAccess()) {
      setShowPaywallModal(true);
      return;
    }

    setIsPlanning(true);
    setAssembleSuccess(false);
    setPlanProgressMessage('🎬 AI Director is analyzing your concept and pacing scenes...');

    // Deduct 1 credit if not on Pro
    const creditRes = licenseService.consumeCredit();
    refreshLicense();

    try {
      const response = await fetch('/api/ai/story-to-video-plan', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(proState.customApiKey ? { 'x-gemini-api-key': proState.customApiKey } : {})
        },
        body: JSON.stringify({
          prompt: promptText,
          mode: studioMode,
          targetDuration,
          aspectRatio,
          language,
          visualStyle,
          voiceTone,
          images: uploadedStoryImages,
        }),
      });

      const data = await response.json();
      if (data && data.scenes && data.scenes.length > 0) {
        setStoryTitle(data.title || 'Untitled AI Story Project');
        setStorySynopsis(data.synopsis || '');
        setStoryboardScenes(data.scenes);
        setPlanProgressMessage('');

        // Automatically synthesize audio for each scene in parallel background
        setTimeout(() => {
          data.scenes.forEach((sc: AiScenePlan, idx: number) => {
            if (sc.narration) {
              generateSceneVoiceoverAudio(
                sc.narration,
                voicePersona || 'Kore',
                voiceTone || 'Inspiring',
                sc.durationSeconds || 4,
                proState.customApiKey || undefined
              ).then((url) => {
                if (url) {
                  setStoryboardScenes((prev) => {
                    const copy = [...prev];
                    if (copy[idx]) {
                      copy[idx] = { ...copy[idx], generatedAudioUrl: url };
                    }
                    return copy;
                  });
                }
              }).catch(() => {});
            }
          });
        }, 100);
      } else {
        throw new Error('Failed to parse storyboard scenes');
      }
    } catch (err) {
      console.error('Storyboard planning failed:', err);
      // Construct fallback scene array
      const count = Math.max(3, Math.round(targetDuration / 6));
      const dur = Math.round(targetDuration / count);
      const fallbackScenes: AiScenePlan[] = Array.from({ length: count }, (_, i) => ({
        sceneNumber: i + 1,
        durationSeconds: dur,
        narration: `Scene ${i + 1}: ${promptText} presented in breathtaking cinematic detail.`,
        subtitle: `${promptText.slice(0, 30)} - Part ${i + 1}`,
        visualPrompt: `8k cinematic masterpiece, ${promptText}, ${visualStyle}, photorealistic lighting`,
        stockSearchKeywords: `${promptText.split(' ')[0] || 'nature'} cinematic`,
        cameraMotion: 'Slow cinematic push-in',
        bgmMood: 'Inspirational atmospheric soundtrack',
      }));
      setStoryTitle(promptText);
      setStorySynopsis(`AI generated story for: ${promptText}`);
      setStoryboardScenes(fallbackScenes);

      // Pre-synthesize fallback scene audio
      setTimeout(() => {
        fallbackScenes.forEach((sc: AiScenePlan, idx: number) => {
          generateSceneVoiceoverAudio(
            sc.narration,
            voicePersona || 'Kore',
            voiceTone || 'Inspiring',
            sc.durationSeconds || 4,
            proState.customApiKey || undefined
          ).then((url) => {
            if (url) {
              setStoryboardScenes((prev) => {
                const copy = [...prev];
                if (copy[idx]) {
                  copy[idx] = { ...copy[idx], generatedAudioUrl: url };
                }
                return copy;
              });
            }
          }).catch(() => {});
        });
      }, 100);
    } finally {
      setIsPlanning(false);
    }
  };

  // Synthesize Voiceover Audio for a scene
  const handleGenerateSceneAudio = async (sceneIndex: number) => {
    const scene = storyboardScenes[sceneIndex];
    if (!scene || !scene.narration) return;

    const updated = [...storyboardScenes];
    updated[sceneIndex].isGeneratingMedia = true;
    setStoryboardScenes(updated);

    try {
      const audioUrl = await generateSceneVoiceoverAudio(
        scene.narration,
        voicePersona || 'Kore',
        voiceTone || 'Inspiring, clear, and professional',
        scene.durationSeconds || 4,
        proState.customApiKey || undefined
      );
      if (audioUrl) {
        updated[sceneIndex].generatedAudioUrl = audioUrl;
      }
    } catch (err) {
      console.error('Scene audio generation failed:', err);
    } finally {
      updated[sceneIndex].isGeneratingMedia = false;
      setStoryboardScenes([...updated]);
    }
  };

  // Generate Visual Image for a scene
  const handleGenerateSceneImage = async (sceneIndex: number) => {
    const scene = storyboardScenes[sceneIndex];
    if (!scene) return;

    const updated = [...storyboardScenes];
    updated[sceneIndex].isGeneratingMedia = true;
    setStoryboardScenes(updated);

    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: scene.visualPrompt,
          aspectRatio,
          imageSize: '1K',
        }),
      });
      const data = await response.json();
      if (data.imageUrl) {
        updated[sceneIndex].generatedImageUrl = data.imageUrl;
      }
    } catch (err) {
      console.error('Scene image generation failed:', err);
    } finally {
      updated[sceneIndex].isGeneratingMedia = false;
      setStoryboardScenes([...updated]);
    }
  };

  // Generate Google Veo AI Video for a scene
  const handleGenerateSceneVeoVideo = async (sceneIndex: number) => {
    const scene = storyboardScenes[sceneIndex];
    if (!scene) return;

    // Check Pro License or Credit balance
    if (!licenseService.hasAccess()) {
      setShowPaywallModal(true);
      return;
    }

    // Deduct 1 credit if not on Pro
    licenseService.consumeCredit();
    refreshLicense();

    const updated = [...storyboardScenes];
    updated[sceneIndex].isGeneratingMedia = true;
    setStoryboardScenes(updated);

    try {
      const response = await fetch('/api/ai/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: scene.visualPrompt || promptText,
          aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9',
          resolution: '720p',
          model: 'veo-3.1-lite-generate-preview',
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.operationName) {
        throw new Error(data.error || 'Failed to start Veo video generation');
      }

      const opName = data.operationName;
      let attempts = 0;
      const maxAttempts = 30;
      const interval = setInterval(async () => {
        attempts++;
        try {
          const statusRes = await fetch('/api/ai/video-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName: opName }),
          });
          const statusData = await statusRes.json();
          if (statusData.done || attempts >= maxAttempts) {
            clearInterval(interval);
            if (statusData.done) {
              const downloadRes = await fetch('/api/ai/video-download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ operationName: opName }),
              });
              if (downloadRes.ok) {
                const blob = await downloadRes.blob();
                const videoUrl = URL.createObjectURL(blob);
                setStoryboardScenes((prev) => {
                  const copy = [...prev];
                  if (copy[sceneIndex]) {
                    copy[sceneIndex] = {
                      ...copy[sceneIndex],
                      generatedVideoUrl: videoUrl,
                      isGeneratingMedia: false,
                    };
                  }
                  return copy;
                });
                return;
              }
            }
            setStoryboardScenes((prev) => {
              const copy = [...prev];
              if (copy[sceneIndex]) {
                copy[sceneIndex] = { ...copy[sceneIndex], isGeneratingMedia: false };
              }
              return copy;
            });
          }
        } catch {
          clearInterval(interval);
          setStoryboardScenes((prev) => {
            const copy = [...prev];
            if (copy[sceneIndex]) {
              copy[sceneIndex] = { ...copy[sceneIndex], isGeneratingMedia: false };
            }
            return copy;
          });
        }
      }, 5000);
    } catch (err) {
      console.error('Scene Veo video generation failed:', err);
      updated[sceneIndex].isGeneratingMedia = false;
      setStoryboardScenes([...updated]);
    }
  };

  // Step 3: 1-Click Multi-Track Timeline Assembly
  const handleAssembleToTimeline = async () => {
    if (storyboardScenes.length === 0) return;
    setIsAssembling(true);

    try {
      if (onSelectAspectRatio) {
        onSelectAspectRatio(aspectRatio);
      }

      // 1. Identify or initialize target tracks
      const newTracks: Track[] = tracks.map((t) => ({ ...t, clips: [...t.clips] }));

      let videoTrack = newTracks.find((t) => t.type === ClipType.VIDEO || t.name.toLowerCase().includes('video'));
      if (!videoTrack) {
        videoTrack = {
          id: `track-video-${Date.now()}`,
          name: 'Video & Visuals',
          type: ClipType.VIDEO,
          hidden: false,
          muted: false,
          locked: false,
          clips: [],
        };
        newTracks.unshift(videoTrack);
      }

      let audioTrack = newTracks.find((t) => t.type === ClipType.AUDIO || t.name.toLowerCase().includes('voice') || t.name.toLowerCase().includes('audio'));
      if (!audioTrack) {
        audioTrack = {
          id: `track-audio-${Date.now()}`,
          name: 'AI Voiceover & Narration',
          type: ClipType.AUDIO,
          hidden: false,
          muted: false,
          locked: false,
          clips: [],
        };
        newTracks.push(audioTrack);
      }

      let subtitleTrack = newTracks.find((t) => t.type === ClipType.TEXT || t.name.toLowerCase().includes('subtitle') || t.name.toLowerCase().includes('text'));
      if (!subtitleTrack) {
        subtitleTrack = {
          id: `track-text-${Date.now()}`,
          name: 'Dynamic Subtitles',
          type: ClipType.TEXT,
          hidden: false,
          muted: false,
          locked: false,
          clips: [],
        };
        newTracks.push(subtitleTrack);
      }

      let bgmTrack = newTracks.find((t) => t.name.toLowerCase().includes('bgm') || t.name.toLowerCase().includes('music'));
      if (!bgmTrack) {
        bgmTrack = {
          id: `track-bgm-${Date.now()}`,
          name: 'Atmospheric BGM',
          type: ClipType.AUDIO,
          hidden: false,
          muted: false,
          locked: false,
          clips: [],
        };
        newTracks.push(bgmTrack);
      }

      // Stock fallback images when offline or fast preview
      const DEFAULT_VISUAL_ASSETS = [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1280&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1280&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1280&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1280&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1280&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1280&auto=format&fit=crop&q=80',
      ];

      // Calculate sequential clip timestamps
      let currentTimelineOffset = 0;
      const newVideoClips: Clip[] = [];
      const newAudioClips: Clip[] = [];
      const newSubtitleClips: Clip[] = [];

      for (let i = 0; i < storyboardScenes.length; i++) {
        const scene = storyboardScenes[i];
        const sceneDuration = Math.max(3, scene.durationSeconds || 5);
        const clipIdSuffix = `${Date.now()}-${i}`;

        // 1. Visual Clip (Image or Video)
        const visualUrl = scene.generatedVideoUrl || scene.generatedImageUrl || (uploadedStoryImages[i] || DEFAULT_VISUAL_ASSETS[i % DEFAULT_VISUAL_ASSETS.length]);
        const visualClip: Clip = {
          id: `clip-visual-${clipIdSuffix}`,
          name: `Scene ${scene.sceneNumber}: ${storyTitle || 'Visual'}`,
          type: scene.generatedVideoUrl ? ClipType.VIDEO : ClipType.IMAGE,
          trackId: videoTrack.id,
          start: currentTimelineOffset,
          duration: sceneDuration,
          sourceStart: 0,
          sourceDuration: sceneDuration,
          playbackRate: 1,
          url: visualUrl,
          volume: 1,
        };
        newVideoClips.push(visualClip);

        // 2. Narration Audio Clip (Always ensure audio is present and synthesized)
        let sceneAudioUrl = scene.generatedAudioUrl;
        if (!sceneAudioUrl && scene.narration) {
          sceneAudioUrl = await generateSceneVoiceoverAudio(
            scene.narration,
            voicePersona || 'Kore',
            voiceTone || 'Inspiring, clear, and professional',
            sceneDuration,
            proState.customApiKey || undefined
          );
        }

        if (sceneAudioUrl) {
          const audioClip: Clip = {
            id: `clip-voice-${clipIdSuffix}`,
            name: `Narration: Scene ${scene.sceneNumber}`,
            type: ClipType.AUDIO,
            trackId: audioTrack.id,
            start: currentTimelineOffset,
            duration: sceneDuration,
            sourceStart: 0,
            sourceDuration: sceneDuration,
            playbackRate: 1,
            url: sceneAudioUrl,
            volume: 1.0,
          };
          newAudioClips.push(audioClip);
        }

        // 3. Subtitle Clip
        const subtitleClip: Clip = {
          id: `clip-sub-${clipIdSuffix}`,
          name: scene.subtitle || scene.narration,
          type: ClipType.TEXT,
          trackId: subtitleTrack.id,
          start: currentTimelineOffset,
          duration: sceneDuration,
          sourceStart: 0,
          sourceDuration: sceneDuration,
          playbackRate: 1,
          volume: 1,
          text: scene.subtitle || scene.narration,
          fontFamily: language === 'ur' || language === 'ar' ? 'Noto Nastaliq Urdu' : 'Inter',
          fontSize: aspectRatio === '9:16' ? 24 : 28,
          color: '#FFFFFF',
          textStyle: 'normal',
          textAlignment: 'center',
          textX: 50,
          textY: 85,
        };
        newSubtitleClips.push(subtitleClip);

        currentTimelineOffset += sceneDuration;
      }

      // Add ambient background music across entire project
      const bgmClip: Clip = {
        id: `clip-bgm-${Date.now()}`,
        name: `BGM: ${storyboardScenes[0]?.bgmMood || 'Cinematic Ambient'}`,
        type: ClipType.AUDIO,
        trackId: bgmTrack.id,
        start: 0,
        duration: currentTimelineOffset,
        sourceStart: 0,
        sourceDuration: currentTimelineOffset,
        playbackRate: 1,
        url: 'https://actions.google.com/sounds/v1/ambiences/ambient_hum_drone.ogg',
        volume: 0.15, // Soft background level
      };

      // Merge into tracks
      videoTrack.clips = [...videoTrack.clips, ...newVideoClips];
      if (newAudioClips.length > 0) {
        audioTrack.clips = [...audioTrack.clips, ...newAudioClips];
      }
      subtitleTrack.clips = [...subtitleTrack.clips, ...newSubtitleClips];
      bgmTrack.clips = [...bgmTrack.clips, bgmClip];

      // Update total project duration
      onSetDuration(Math.max(currentTimelineOffset + 2, 20));
      onSetTracks(newTracks);

      setAssembleSuccess(true);
      setTimeout(() => {
        if (onClose) onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to assemble timeline:', err);
    } finally {
      setIsAssembling(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d12] text-white rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
      {/* Studio Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#181824] via-[#1f1b2e] to-[#14141f] border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black tracking-wide text-white">AI PROMPT-TO-VIDEO STUDIO</h2>
              <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full">
                Veo & Gemini 3.8
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Generate full cinematic videos, narration, subtitles & visuals in 1-Click</p>
          </div>
        </div>

        {/* Right Header Section: Mode Selector & PRO Badge */}
        <div className="flex items-center gap-3">
          {/* Mode Selector */}
          <div className="flex items-center bg-[#0a0a0e] p-1 rounded-xl border border-gray-800">
            <button
              onClick={() => setStudioMode('prompt_to_video')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                studioMode === 'prompt_to_video'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              Prompt to Video
            </button>
            <button
              onClick={() => setStudioMode('story_images_to_video')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                studioMode === 'story_images_to_video'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Story Photos to Video
            </button>
            <button
              onClick={() => setStudioMode('quran_hadith_reel')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                studioMode === 'quran_hadith_reel'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              Islamic Reel Maker
            </button>
          </div>

          {/* Golden PRO / Credits Pill */}
          <button
            onClick={() => setShowPaywallModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow cursor-pointer ${
              proState.isPro
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black border border-amber-400 shadow-amber-500/20'
                : 'bg-[#1a1626] hover:bg-[#251f38] text-amber-300 border border-amber-500/40 hover:border-amber-400'
            }`}
            title="Manage Pro License & AI Credits"
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
        </div>
      </div>

      {/* Main Studio Body: 2 Columns */}
      <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0 custom-scrollbar">
        {/* Left Column: Configuration Controls (5 Cols) */}
        <div className="lg:col-span-5 p-5 border-r border-gray-800/80 bg-[#101017] space-y-4">
          {/* 1. Prompt / Idea Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5" />
                {studioMode === 'prompt_to_video'
                  ? 'Video Topic / Story Prompt'
                  : studioMode === 'story_images_to_video'
                  ? 'Story Narration Context'
                  : 'Islamic Verse / Hadith Theme'}
              </label>
              <span className="text-[10px] text-gray-500">AI Director Scripting</span>
            </div>

            <textarea
              rows={3}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="e.g. The journey of Prophet Musa and Mount Sinai, with peaceful spiritual atmosphere and 4K visuals..."
              className="w-full bg-[#181822] border border-gray-700/80 focus:border-purple-500 rounded-xl p-3 text-xs text-white placeholder-gray-500 outline-none transition resize-none shadow-inner"
            />

            {/* Quick Inspiration Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-gray-500 self-center">Try:</span>
              {PROMPT_TEMPLATES[0].prompts.slice(0, 2).map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setPromptText(p)}
                  className="px-2 py-1 text-[10px] bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 rounded-lg border border-purple-800/40 transition truncate max-w-[200px]"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Upload Photos Section (for Story Photos to Video Mode) */}
          {studioMode === 'story_images_to_video' && (
            <div className="p-3.5 bg-[#161622] rounded-xl border border-dashed border-purple-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-300">Upload Story Images / Comic Panels</span>
                <span className="text-[10px] text-gray-400">{uploadedStoryImages.length} photos</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded-lg text-xs font-medium transition flex items-center justify-center gap-2"
              >
                <Upload className="w-3.5 h-3.5" />
                Select Photos from Computer
              </button>

              {/* Uploaded Previews */}
              {uploadedStoryImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2 pt-2">
                  {uploadedStoryImages.map((img, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden border border-gray-700 aspect-video bg-black">
                      <img src={img} alt={`Scene ${i + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 left-1 bg-black/70 px-1 text-[9px] rounded text-white font-mono">#{i + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. Aspect Ratio & Target Duration Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Aspect Ratio */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wide">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-1 bg-[#15151e] p-1 rounded-xl border border-gray-800">
                {[
                  { id: '16:9', label: '16:9', sub: 'YouTube' },
                  { id: '9:16', label: '9:16', sub: 'Reels/Shorts' },
                  { id: '1:1', label: '1:1', sub: 'Square' },
                ].map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => setAspectRatio(ratio.id)}
                    className={`py-1.5 px-1 text-center rounded-lg transition ${
                      aspectRatio === ratio.id
                        ? 'bg-purple-600 text-white font-bold shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="text-[11px] font-mono">{ratio.label}</div>
                    <div className="text-[8px] opacity-75">{ratio.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Duration */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wide flex items-center justify-between">
                <span>Duration</span>
                <span className="text-purple-400 font-mono text-[10px]">{targetDuration}s</span>
              </label>
              <div className="grid grid-cols-3 gap-1 bg-[#15151e] p-1 rounded-xl border border-gray-800">
                {[15, 30, 60].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setTargetDuration(sec)}
                    className={`py-2 text-center rounded-lg transition text-xs font-semibold ${
                      targetDuration === sec
                        ? 'bg-purple-600 text-white font-bold shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Language & Voice Tone */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wide">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full bg-[#181822] border border-gray-700/80 rounded-xl p-2 text-xs text-white outline-none focus:border-purple-500"
              >
                <option value="en">🇺🇸 English</option>
                <option value="ur">🇵🇰 Urdu (اردو)</option>
                <option value="ar">🇸🇦 Arabic (العربية)</option>
                <option value="hi">🇮🇳 Hindi (हिंदी)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wide">Voice Persona</label>
              <select
                value={voicePersona}
                onChange={(e) => setVoicePersona(e.target.value)}
                className="w-full bg-[#181822] border border-gray-700/80 rounded-xl p-2 text-xs text-white outline-none focus:border-purple-500"
              >
                <option value="Kore">🎙️ Kore (Clear Studio)</option>
                <option value="Puck">📻 Puck (Deep Cinematic)</option>
                <option value="Zephyr">🌸 Zephyr (Warm & Gentle)</option>
                <option value="Fenrir">⚡ Fenrir (Authoritative)</option>
                <option value="Charon">🕊️ Charon (Calm Spiritual)</option>
              </select>
            </div>
          </div>

          {/* 4. Visual Style & Media Engine */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wide">Visual Aesthetic</label>
              <select
                value={visualStyle}
                onChange={(e) => setVisualStyle(e.target.value)}
                className="w-full bg-[#181822] border border-gray-700/80 rounded-xl p-2 text-xs text-white outline-none focus:border-purple-500"
              >
                <option value="cinematic_realistic">🎬 8K Hyper-Realistic Cinematic</option>
                <option value="islamic_spiritual">🕌 Islamic Golden Age & Spiritual Glow</option>
                <option value="anime_art">🎨 Modern Anime & Studio Ghibli Aesthetic</option>
                <option value="3d_fantasy">🌌 3D Unreal Engine 5 Fantasy</option>
                <option value="documentary_stock">📸 Documentary 4K Real Stock</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wide flex items-center justify-between">
                <span>Scene Media Generator</span>
                <span className="text-[9px] text-cyan-400 font-mono">Veo / Gemini</span>
              </label>
              <select
                value={mediaEngine}
                onChange={(e) => setMediaEngine(e.target.value as any)}
                className="w-full bg-[#181822] border border-gray-700/80 rounded-xl p-2 text-xs text-white outline-none focus:border-cyan-500 font-medium"
              >
                <option value="veo_ai_video">🎥 Google Veo 3.1 Neural Video (Continuous Motion)</option>
                <option value="gemini_ai_image">🎨 Gemini 3.1 Flash Neural Images (Ultra-Sharp)</option>
                <option value="hybrid_stock_ai">📸 Hybrid Stock Assets + Neural AI</option>
              </select>
            </div>
          </div>

          {/* 5. Generate Storyboard Button */}
          <button
            onClick={handleGenerateStoryboard}
            disabled={isPlanning}
            className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isPlanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Directing Storyboard...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Step 1: Direct & Plan Storyboard</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Interactive Storyboard & Timeline Assembly (7 Cols) */}
        <div className="lg:col-span-7 p-5 bg-[#0e0e15] flex flex-col justify-between space-y-4">
          {storyboardScenes.length > 0 ? (
            <div className="space-y-4 flex-1">
              {/* Storyboard Header Summary */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <div>
                  <h3 className="text-sm font-bold text-purple-300">{storyTitle}</h3>
                  <p className="text-[11px] text-gray-400 line-clamp-1">{storySynopsis}</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono bg-[#181824] px-2.5 py-1 rounded-lg border border-gray-800 text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{storyboardScenes.length} Scenes (~{targetDuration}s)</span>
                </div>
              </div>

              {/* Scene Cards List */}
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                {storyboardScenes.map((scene, index) => (
                  <div
                    key={index}
                    className="p-3.5 bg-[#14141f] rounded-xl border border-gray-800 hover:border-purple-500/50 transition space-y-2.5 shadow-sm"
                  >
                    {/* Scene Top Bar */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-purple-400 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-purple-900/60 border border-purple-500/50 flex items-center justify-center text-[10px]">
                          {scene.sceneNumber}
                        </span>
                        Scene #{scene.sceneNumber} ({scene.durationSeconds}s)
                      </span>
                      <span className="text-[10px] text-gray-400 italic">{scene.cameraMotion || 'Cinematic Pan'}</span>
                    </div>

                    {/* Scene Narration */}
                    <div className="p-2.5 bg-[#0a0a0f] rounded-lg border border-gray-800/80">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Mic className="w-3 h-3 text-pink-400" />
                        Narration & Subtitle
                      </div>
                      <p className="text-xs text-gray-200 leading-relaxed">{scene.narration}</p>
                    </div>

                    {/* Scene Visual Prompt */}
                    <div className="text-[11px] text-gray-400 flex items-start gap-1.5">
                      <Video className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2 italic text-gray-300">&quot;{scene.visualPrompt}&quot;</span>
                    </div>

                    {/* Action Buttons: Generate Individual Media */}
                    <div className="flex items-center flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => handleGenerateSceneAudio(index)}
                        disabled={scene.isGeneratingMedia}
                        className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg border transition flex items-center gap-1 ${
                          scene.generatedAudioUrl
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                            : 'bg-[#1c1c2b] border-gray-700 text-gray-300 hover:text-white'
                        }`}
                      >
                        <Volume2 className="w-3 h-3" />
                        {scene.generatedAudioUrl ? 'Audio Ready ✓' : 'Synthesize Voice'}
                      </button>

                      <button
                        onClick={() => handleGenerateSceneImage(index)}
                        disabled={scene.isGeneratingMedia}
                        className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg border transition flex items-center gap-1 ${
                          scene.generatedImageUrl
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                            : 'bg-[#1c1c2b] border-gray-700 text-gray-300 hover:text-white'
                        }`}
                      >
                        <ImageIcon className="w-3 h-3" />
                        {scene.generatedImageUrl ? 'Image Ready ✓' : 'Generate AI Image'}
                      </button>

                      <button
                        onClick={() => handleGenerateSceneVeoVideo(index)}
                        disabled={scene.isGeneratingMedia}
                        className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg border transition flex items-center gap-1 ${
                          scene.generatedVideoUrl
                            ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
                            : 'bg-[#14202b] border-cyan-800/60 text-cyan-300 hover:text-white hover:border-cyan-400'
                        }`}
                      >
                        <Film className="w-3 h-3 text-cyan-400" />
                        {scene.generatedVideoUrl ? 'Veo Video Ready ✓' : 'Generate Veo AI Video'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Empty State Placeholder */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-gray-800 rounded-2xl bg-[#11111a]">
              <div className="w-14 h-14 rounded-2xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center mb-3">
                <Wand2 className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Storyboard Ready to Direct</h3>
              <p className="text-xs text-gray-400 max-w-sm">
                Enter your prompt or select story photos on the left, then click{' '}
                <span className="text-purple-300 font-semibold">&quot;Step 1: Direct & Plan Storyboard&quot;</span>.
              </p>
            </div>
          )}

          {/* Bottom Action Bar: Step 2 1-Click Multi-Track Timeline Assembly */}
          <div className="pt-4 border-t border-gray-800">
            <button
              onClick={handleAssembleToTimeline}
              disabled={storyboardScenes.length === 0 || isAssembling}
              className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-xl flex items-center justify-center gap-2.5 cursor-pointer ${
                assembleSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-emerald-600/20 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              {isAssembling ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Assembling 4 Tracks on Timeline...</span>
                </>
              ) : assembleSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Success! Placed on Video, Audio, BGM & Subtitle Tracks ✓</span>
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4" />
                  <span>Step 2: ⚡ 1-Click Auto Assemble on 4-Track Timeline</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CuteCut Pro Paywall Modal */}
      <CuteCutProPaywallModal
        isOpen={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        onActivated={refreshLicense}
      />
    </div>
  );
};

export default AiPromptVideoStudio;
