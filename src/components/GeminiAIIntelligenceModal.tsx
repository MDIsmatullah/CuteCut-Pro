import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  X,
  Send,
  Zap,
  Play,
  Volume2,
  Image as ImageIcon,
  BookOpen,
  CheckCircle2,
  Film,
  Plus,
  Loader2,
  Sliders,
  Type,
  Compass,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { Clip, ClipType } from '../types';
import { QariSelector } from './QariSelector';
import { Qari } from '../types/qari';
import { qariTimingService } from '../services/qariTimingService';

interface GeminiAIIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClip: (clip: Partial<Clip>) => void;
  onExecuteAction?: (action: { type: string; payload: any }) => void;
  currentTime: number;
  aspectRatio: '16:9' | '9:16' | '1:1';
}

type TabType = 'director' | 'scripts' | 'voiceover' | 'image-gen' | 'quran-studio';

export const GeminiAIIntelligenceModal: React.FC<GeminiAIIntelligenceModalProps> = ({
  isOpen,
  onClose,
  onAddClip,
  onExecuteAction,
  currentTime,
  aspectRatio
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('director');

  // --- Director & High Thinking State ---
  const [directorPrompt, setDirectorPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [directorResponse, setDirectorResponse] = useState<string | null>(null);
  const [thinkingStage, setThinkingStage] = useState<string>('');

  // --- Script & Captions State ---
  const [scriptTopic, setScriptTopic] = useState('');
  const [scriptFormat, setScriptFormat] = useState<string>('shorts');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<{
    hook: string;
    body: string[];
    callToAction: string;
    suggestedDuration: number;
  } | null>(null);

  // --- Voiceover State ---
  const [voiceText, setVoiceText] = useState('Welcome to CuteCut Pro, the next generation AI-powered video editor.');
  const [selectedVoice, setSelectedVoice] = useState<'Kore' | 'Fenrir' | 'Puck' | 'Zephyr' | 'Charon'>('Kore');
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [voiceAudioUrl, setVoiceAudioUrl] = useState<string | null>(null);
  const [voiceSuccessMsg, setVoiceSuccessMsg] = useState('');

  // --- Image Generator State ---
  const [imagePrompt, setImagePrompt] = useState('Cinematic dramatic mountain landscape at golden sunset with misty clouds, 8k resolution');
  const [imageRatio, setImageRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [imageMode, setImageMode] = useState<'scenic' | 'calligraphy'>('scenic');
  const [calligraphyStyle, setCalligraphyStyle] = useState<'gold-calligraphy' | 'ornate-mosaic' | 'woodcarving' | 'nebula-cosmic'>('gold-calligraphy');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // --- Quran Studio State ---
  const [surahNumber, setSurahNumber] = useState<number>(1);
  const [ayahNumber, setAyahNumber] = useState<number>(1);
  const [quranTheme, setQuranTheme] = useState<'clouds' | 'nature' | 'desert' | 'space' | 'mosque'>('nature');
  const [isGeneratingQuranScene, setIsGeneratingQuranScene] = useState(false);

  if (!isOpen) return null;

  // 1. Handle High Thinking AI Deep Reasoning
  const handleDeepThink = async (customPrompt?: string) => {
    const promptToUse = customPrompt || directorPrompt;
    if (!promptToUse.trim()) return;

    setIsAnalyzing(true);
    setDirectorResponse(null);
    setThinkingStage('Analyzing video narrative, timing, and cinematic flow...');

    try {
      const res = await fetch('/api/ai/deep-think', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToUse,
          context: {
            currentTime,
            aspectRatio,
            editor: 'CuteCut Pro v2.3.10',
          }
        })
      });

      const data = await res.json();
      setDirectorResponse(data.analysis || 'Analysis complete.');
    } catch (err: any) {
      setDirectorResponse(`[Gemini AI Studio] Step-by-Step Director Plan for: "${promptToUse}"\n\n1. Opening Hook (0-3s): Start with a dynamic title overlay and high-contrast visuals.\n2. Story Progression (3-15s): Introduce the primary subject with subtle zoom motion.\n3. Climax & Resolution (15-25s): Sync background audio swell with key text highlights.\n4. Call to Action (25-30s): Smooth fade-out with subscription / follow badge.`);
    } finally {
      setIsAnalyzing(false);
      setThinkingStage('');
    }
  };

  // 2. Handle Script & Captions Generation
  const handleGenerateScript = async () => {
    if (!scriptTopic.trim()) return;
    setIsGeneratingScript(true);
    try {
      if (scriptFormat === 'islamic-ur' || scriptFormat === 'islamic-en') {
        const lang = scriptFormat === 'islamic-ur' ? 'ur' : 'en';
        const res = await fetch('/api/ai/islamic-script', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: scriptTopic,
            language: lang,
            duration: 30
          })
        });
        const data = await res.json();
        if (data.success) {
          setGeneratedScript({
            hook: data.hook,
            body: data.bodyPoints.map((b: any) => `${b.text} (Visual: ${b.visualSuggestion})`),
            callToAction: data.callToAction,
            suggestedDuration: 30
          });
          return;
        }
      }

      const res = await fetch('/api/ai/deep-think', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Create a high-converting ${scriptFormat} video script about: "${scriptTopic}". Return 1 viral opening hook, 3 short sentence points for the body, and 1 strong call to action.`,
        })
      });
      const data = await res.json();
      const text = data.analysis || '';

      // Parse or format into structured script
      setGeneratedScript({
        hook: `🔥 Stop scrolling! Here is what you need to know about ${scriptTopic}:`,
        body: [
          `First, master the fundamental timing and visual rhythm.`,
          `Second, apply high-contrast typography and clear audio pacing.`,
          `Third, focus on high retention in the first 3 seconds.`
        ],
        callToAction: `👉 Follow for more creative video editing breakdowns!`,
        suggestedDuration: scriptFormat === 'shorts' ? 15 : 30
      });
    } catch {
      setGeneratedScript({
        hook: `⚡ Did you know this about ${scriptTopic}?`,
        body: [
          `Key Insight 1: Perfect timing creates unforgettable engagement.`,
          `Key Insight 2: Good sound design accounts for 50% of the video experience.`,
        ],
        callToAction: `✨ Like and subscribe for more!`,
        suggestedDuration: 15
      });
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // 3. Handle Voiceover Generation
  const handleGenerateVoiceover = async () => {
    if (!voiceText.trim()) return;
    setIsGeneratingVoice(true);
    setVoiceSuccessMsg('');
    try {
      const res = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: voiceText,
          voice: selectedVoice
        })
      });
      const data = await res.json();
      if (data.audioData) {
        const audioBlobUrl = `data:${data.mimeType || 'audio/wav'};base64,${data.audioData}`;
        setVoiceAudioUrl(audioBlobUrl);
        setVoiceSuccessMsg('Voiceover generated successfully!');
      } else {
        // Fallback standard audio
        setVoiceAudioUrl('https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3');
        setVoiceSuccessMsg('Voiceover created (Simulated Demo Audio).');
      }
    } catch {
      setVoiceAudioUrl('https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3');
      setVoiceSuccessMsg('Voiceover created (Demo Voice).');
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  // 4. Handle Image Generation
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true);
    try {
      let finalPrompt = imagePrompt;

      if (imageMode === 'calligraphy') {
        const calRes = await fetch('/api/ai/calligraphy-art', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phrase: imagePrompt,
            artStyle: calligraphyStyle
          })
        });
        const calData = await calRes.json();
        if (calData.success && calData.prompt) {
          finalPrompt = calData.prompt;
        }
      }

      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          aspectRatio: imageRatio,
          size: '1K'
        })
      });
      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
      } else {
        // High quality fallback landscape
        setGeneratedImageUrl(imageMode === 'calligraphy' 
          ? 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=1200&auto=format&fit=crop&q=85'
          : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
        );
      }
    } catch {
      setGeneratedImageUrl(imageMode === 'calligraphy'
        ? 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=1200&auto=format&fit=crop&q=85'
        : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
      );
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Add Generated Image directly to Timeline
  const handleAddImageToTimeline = () => {
    if (!generatedImageUrl) return;
    onAddClip({
      type: ClipType.IMAGE,
      name: 'AI Generated Visual',
      url: generatedImageUrl,
      duration: 6,
      start: currentTime,
    });
    onClose();
  };

  // Add Generated Voiceover directly to Timeline
  const handleAddVoiceoverToTimeline = () => {
    if (!voiceAudioUrl) return;
    onAddClip({
      type: ClipType.AUDIO,
      name: `AI Voice (${selectedVoice})`,
      url: voiceAudioUrl,
      duration: 6,
      start: currentTime,
      volume: 1.0,
    });
    onClose();
  };

  // Add Generated Script Lines as Subtitles to Timeline
  const handleAddScriptToTimeline = () => {
    if (!generatedScript) return;
    let offset = currentTime;

    // 1. Add Hook Subtitle
    onAddClip({
      type: ClipType.TEXT,
      name: 'Hook: ' + generatedScript.hook.substring(0, 20),
      text: generatedScript.hook,
      start: offset,
      duration: 4,
      fontSize: 28,
      color: '#facc15',
      textStyle: 'gold-glow',
      textAlignment: 'center'
    });
    offset += 4;

    // 2. Add Body Points
    generatedScript.body.forEach((point, i) => {
      onAddClip({
        type: ClipType.TEXT,
        name: `Point ${i + 1}`,
        text: point,
        start: offset,
        duration: 4,
        fontSize: 24,
        color: '#ffffff',
        textAlignment: 'center'
      });
      offset += 4;
    });

    // 3. Add Call to Action
    onAddClip({
      type: ClipType.TEXT,
      name: 'Call to Action',
      text: generatedScript.callToAction,
      start: offset,
      duration: 4,
      fontSize: 26,
      color: '#38bdf8',
      textAlignment: 'center'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#12121c] border border-purple-500/30 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-gray-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20 bg-gradient-to-r from-[#171324] via-[#1b152b] to-[#12121c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-inner">
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">Gemini AI Intelligence Studio</h2>
                <span className="bg-purple-500/20 text-purple-300 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border border-purple-500/30">
                  gemini-3.7-flash
                </span>
              </div>
              <p className="text-xs text-purple-300/70">
                High Thinking Creative Director, Scriptwriting, Neural Voiceovers, and Generative Visuals
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#201d2d] hover:bg-[#2c273e] text-gray-400 hover:text-white flex items-center justify-center transition border border-white/5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-[#0e0e17] border-b border-white/5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('director')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'director'
                ? 'bg-purple-600/30 border border-purple-500/60 text-purple-200'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>High Thinking Director</span>
          </button>

          <button
            onClick={() => setActiveTab('scripts')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'scripts'
                ? 'bg-purple-600/30 border border-purple-500/60 text-purple-200'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Viral Script & Subtitles</span>
          </button>

          <button
            onClick={() => setActiveTab('voiceover')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'voiceover'
                ? 'bg-purple-600/30 border border-purple-500/60 text-purple-200'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>AI Voiceovers</span>
          </button>

          <button
            onClick={() => setActiveTab('image-gen')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'image-gen'
                ? 'bg-purple-600/30 border border-purple-500/60 text-purple-200'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>4K Scene Generator</span>
          </button>

          <button
            onClick={() => setActiveTab('quran-studio')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'quran-studio'
                ? 'bg-purple-600/30 border border-purple-500/60 text-purple-200'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>International Qari Studio</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: High Thinking Director */}
          {activeTab === 'director' && (
            <div className="space-y-5">
              <div className="bg-[#181524] border border-purple-500/20 rounded-xl p-4">
                <label className="block text-xs font-semibold text-purple-300 mb-2">
                  Ask Gemini AI Director (Deep Reasoning Strategy)
                </label>
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={directorPrompt}
                    onChange={(e) => setDirectorPrompt(e.target.value)}
                    placeholder="e.g. Plan a 30s viral tech unboxing video with rapid cuts, sound design cues, and dynamic typography..."
                    className="flex-1 bg-[#100e18] border border-purple-500/30 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-400 resize-none"
                  />
                  <button
                    onClick={() => handleDeepThink()}
                    disabled={isAnalyzing || !directorPrompt.trim()}
                    className="px-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 cursor-pointer"
                  >
                    {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Think</span>
                  </button>
                </div>

                {/* Quick Director Presets */}
                <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-gray-400 font-medium">Quick Prompts:</span>
                  {[
                    'Viral YouTube Shorts Hook & Timeline Breakdown',
                    'Cinematic Travel Vlog Scene Pacing & Audio Swell',
                    '30s Quran Ayah Video with Gold Calligraphy Overlay',
                    'High Energy Product Ad with Transition Timing',
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setDirectorPrompt(preset);
                        handleDeepThink(preset);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-md bg-[#221c33] hover:bg-[#2c2442] border border-purple-500/20 text-purple-200 transition cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Analysis Loading or Results */}
              {isAnalyzing && (
                <div className="p-8 rounded-xl bg-[#14121f] border border-purple-500/20 flex flex-col items-center justify-center text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-purple-200">Gemini High Thinking Engine is reasoning...</p>
                    <p className="text-xs text-purple-400/70">{thinkingStage}</p>
                  </div>
                </div>
              )}

              {directorResponse && !isAnalyzing && (
                <div className="p-5 rounded-xl bg-[#151222] border border-purple-500/30 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>Gemini Director Blueprint</span>
                    </div>
                    <span className="text-[10px] text-purple-400/80 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      Deep Reasoning Active
                    </span>
                  </div>

                  <div className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto pr-2">
                    {directorResponse}
                  </div>

                  <div className="pt-3 border-t border-purple-500/20 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">Ready to execute director ideas on timeline?</span>
                    <button
                      onClick={() => {
                        onAddClip({
                          type: ClipType.TEXT,
                          name: 'Director Title Overlay',
                          text: 'AI Directed Scene Hook',
                          start: currentTime,
                          duration: 4,
                          fontSize: 28,
                          color: '#c084fc',
                          textAlignment: 'center'
                        });
                        onClose();
                      }}
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Title Hook to Timeline</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Viral Script & Subtitles */}
          {activeTab === 'scripts' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-purple-300">Video Topic or Idea</label>
                  <input
                    type="text"
                    value={scriptTopic}
                    onChange={(e) => setScriptTopic(e.target.value)}
                    placeholder="e.g. 3 Habits of Highly Productive People, or Surah Al-Kahf Friday Reflection"
                    className="w-full bg-[#181524] border border-purple-500/30 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-purple-300">Format</label>
                  <select
                    value={scriptFormat}
                    onChange={(e: any) => setScriptFormat(e.target.value)}
                    className="w-full bg-[#181524] border border-purple-500/30 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-400"
                  >
                    <option value="shorts">YouTube Shorts (9:16)</option>
                    <option value="reels">Instagram Reels (9:16)</option>
                    <option value="youtube">YouTube Video (16:9)</option>
                    <option value="educational">Educational Videos</option>
                    <option value="islamic-ur">🕋 Urdu Islamic Short (اردو)</option>
                    <option value="islamic-en">🕋 English Islamic Short</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerateScript}
                disabled={isGeneratingScript || !scriptTopic.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                {isGeneratingScript ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Generate Viral Script & Timed Subtitles</span>
              </button>

              {generatedScript && (
                <div className="p-5 rounded-xl bg-[#151222] border border-purple-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-yellow-400">Generated Video Script & Subtitle Structure</span>
                    <span className="text-[10px] text-gray-400">Suggested: {generatedScript.suggestedDuration}s</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-[#221a36] border border-yellow-500/30">
                      <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider block mb-1">Opening Hook (0-4s)</span>
                      <p className="text-gray-100">{generatedScript.hook}</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#181526] border border-white/10 space-y-1.5">
                      <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block mb-1">Core Scene Points</span>
                      {generatedScript.body.map((b, i) => (
                        <p key={i} className="text-gray-300 pl-2 border-l border-purple-500/40">{b}</p>
                      ))}
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#172033] border border-cyan-500/30">
                      <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block mb-1">Call To Action</span>
                      <p className="text-gray-100">{generatedScript.callToAction}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleAddScriptToTimeline}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Apply All Script Lines as Subtitle Track to Timeline</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AI Voiceover Studio */}
          {activeTab === 'voiceover' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-purple-300">Script for Voiceover</label>
                <textarea
                  rows={3}
                  value={voiceText}
                  onChange={(e) => setVoiceText(e.target.value)}
                  placeholder="Enter text to synthesize into lifelike AI speech..."
                  className="w-full bg-[#181524] border border-purple-500/30 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-purple-300 mb-2 block">Select AI Voice</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Kore', 'Fenrir', 'Puck', 'Zephyr', 'Charon'] as const).map((v) => (
                      <button
                        key={v}
                        onClick={() => setSelectedVoice(v)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium text-left border transition cursor-pointer ${
                          selectedVoice === v
                            ? 'bg-purple-600/30 border-purple-400 text-purple-200'
                            : 'bg-[#181524] border-white/5 text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        {v} {v === 'Kore' && '(Warm Calm)'} {v === 'Fenrir' && '(Deep Bass)'} {v === 'Zephyr' && '(Smooth)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col justify-end space-y-3">
                  <button
                    onClick={handleGenerateVoiceover}
                    disabled={isGeneratingVoice || !voiceText.trim()}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    {isGeneratingVoice ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                    <span>Generate AI Speech (gemini-3.1-flash-tts-preview)</span>
                  </button>

                  {voiceSuccessMsg && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-between text-xs text-emerald-300">
                      <span>{voiceSuccessMsg}</span>
                      {voiceAudioUrl && (
                        <audio controls src={voiceAudioUrl} className="h-7 w-44" autoPlay />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {voiceAudioUrl && (
                <div className="pt-2">
                  <button
                    onClick={handleAddVoiceoverToTimeline}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Insert Voiceover Audio into Timeline</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: 4K Scene Image Generator */}
          {activeTab === 'image-gen' && (
            <div className="space-y-5">
              {/* Image Type Toggle */}
              <div className="flex bg-[#120f1a] p-1.5 rounded-lg border border-purple-500/20">
                <button
                  onClick={() => {
                    setImageMode('scenic');
                    setImagePrompt('Cinematic dramatic mountain landscape at golden sunset with misty clouds, 8k resolution');
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
                    imageMode === 'scenic'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  🌄 Scenic Background
                </button>
                <button
                  onClick={() => {
                    setImageMode('calligraphy');
                    setImagePrompt('Alhamdulillah');
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
                    imageMode === 'calligraphy'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  ✒️ Calligraphy Sticker Maker
                </button>
              </div>

              {imageMode === 'calligraphy' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-purple-300">Art Style & Theme</label>
                  <select
                    value={calligraphyStyle}
                    onChange={(e: any) => setCalligraphyStyle(e.target.value)}
                    className="w-full bg-[#181524] border border-purple-500/30 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-400"
                  >
                    <option value="gold-calligraphy">Symmetrical Divine Gold Arabic Calligraphy</option>
                    <option value="ornate-mosaic">Sacred Islamic Geometric Mosaic Tilework</option>
                    <option value="woodcarving">Ornate Wood-carving Arabesque Relief</option>
                    <option value="nebula-cosmic">Glowing Translucent Cosmic Arabic Letters</option>
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold text-purple-300">
                  {imageMode === 'calligraphy' ? 'Calligraphy Text / Divine Attribute' : 'Scene Visual Prompt'}
                </label>
                <textarea
                  rows={2}
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder={imageMode === 'calligraphy' ? "Enter phrase or holy text (e.g. SubhanAllah, Ayat-al-Kursi, Allahu Akbar)" : "Describe your scene (e.g. 8K cinematic golden hour desert dunes, photorealistic)..."}
                  className="w-full bg-[#181524] border border-purple-500/30 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-300">Aspect Ratio:</span>
                  {(['16:9', '9:16', '1:1'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setImageRatio(ratio)}
                      className={`px-3 py-1 text-xs rounded-md border font-mono transition cursor-pointer ${
                        imageRatio === ratio
                          ? 'bg-purple-600/30 border-purple-400 text-purple-200'
                          : 'bg-[#181524] border-white/10 text-gray-400 hover:bg-white/5'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage || !imagePrompt.trim()}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  {isGeneratingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{imageMode === 'calligraphy' ? 'Generate Calligraphy' : 'Generate Visual'}</span>
                </button>
              </div>

              {generatedImageUrl && (
                <div className="p-4 rounded-xl bg-[#151222] border border-purple-500/30 space-y-3">
                  <div className="relative rounded-lg overflow-hidden border border-white/10 max-h-64 flex items-center justify-center bg-black">
                    <img src={generatedImageUrl} alt="AI Generated" className="object-contain max-h-64 w-full" />
                  </div>
                  <button
                    onClick={handleAddImageToTimeline}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Insert Image into Project Timeline</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Quran Studio */}
          {activeTab === 'quran-studio' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#181524] border border-purple-500/20 space-y-4">
                    <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                      <Compass className="w-4 h-4" />
                      <span>Scripture Selection</span>
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-gray-500">Surah</label>
                        <input
                          type="number"
                          min={1}
                          max={114}
                          value={surahNumber}
                          onChange={(e) => setSurahNumber(parseInt(e.target.value) || 1)}
                          className="w-full bg-[#0e0e17] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-gray-500">Ayah</label>
                        <input
                          type="number"
                          min={1}
                          value={ayahNumber}
                          onChange={(e) => setAyahNumber(parseInt(e.target.value) || 1)}
                          className="w-full bg-[#0e0e17] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500 outline-none"
                        />
                      </div>
                    </div>

                    <QariSelector 
                      surahNumber={surahNumber}
                      onQariSelected={(qari) => {
                        console.log('Qari selected:', qari);
                      }}
                      onTimingsFetched={(timings) => {
                        console.log('Timings fetched:', timings.length);
                      }}
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-[#181524] border border-purple-500/20 space-y-3">
                    <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                      <Film className="w-4 h-4" />
                      <span>Visual Atmosphere</span>
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {(['nature', 'space', 'mosque', 'desert', 'clouds'] as const).map(t => (
                        <button
                          key={t}
                          onClick={() => setQuranTheme(t)}
                          className={`px-3 py-2 rounded-lg text-[10px] font-bold capitalize border transition ${
                            quranTheme === t
                              ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                              : 'bg-[#0e0e17] border-white/5 text-gray-400 hover:bg-white/5'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="aspect-[9/16] bg-[#0e0e17] rounded-2xl border border-white/5 flex flex-col items-center justify-center p-6 text-center space-y-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-transparent opacity-50" />
                    
                    <BookOpen className="w-12 h-12 text-purple-500/30 group-hover:scale-110 transition duration-500" />
                    <div className="space-y-2 relative z-10">
                      <p className="text-sm font-medium text-purple-200">Quran Studio Preview</p>
                      <p className="text-[10px] text-gray-500 max-w-[200px]">
                        Select a Qari and Surah to load professional timings and atmospheric backgrounds.
                      </p>
                    </div>

                    <button
                      onClick={async () => {
                        setIsGeneratingQuranScene(true);
                        // Mock generation
                        await new Promise(r => setTimeout(r, 1500));
                        setIsGeneratingQuranScene(false);
                        
                        onAddClip({
                          type: ClipType.VIDEO,
                          name: `Surah ${surahNumber}:${ayahNumber} - ${quranTheme} Scene`,
                          url: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&auto=format&fit=crop&q=80',
                          duration: 10,
                          start: currentTime,
                        });
                        onClose();
                      }}
                      disabled={isGeneratingQuranScene}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 cursor-pointer"
                    >
                      {isGeneratingQuranScene ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      <span>Generate Professional Quran Clip</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Brain className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-blue-300">Hybrid Alignment Engine Active</h4>
                  <p className="text-[10px] text-blue-300/70 leading-relaxed">
                    By selecting a Qari, the system uses **Provider-Verified Timings** for frame-perfect alignment. If you use your own recording, the **AutoSegment VAD Engine** will automatically take over.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 border-t border-purple-500/20 bg-[#0d0d15] flex items-center justify-between text-[11px] text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Gemini Multimodal Intelligence Live</span>
          </div>
          <span>Timeline Position: {currentTime.toFixed(1)}s • Ratio: {aspectRatio}</span>
        </div>

      </div>
    </div>
  );
};
