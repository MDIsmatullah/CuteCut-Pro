import React, { useState, useEffect } from 'react';
import { Sliders, Volume2, Sparkles, Wand2, Type, Gauge, Palette, Play, Plus, RefreshCw, RotateCcw, FileText, Move, CircleDot, Trash2, Clock, Target, ChevronLeft, ChevronRight, Blend, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Layers, Zap, Check, Merge } from 'lucide-react';
import { Clip, ClipType, VideoFilters, Keyframe, Track, TransitionType, ClipTransition, ColorGrading } from '../types';
import { PRESET_LUTS, ColorGradingPreset } from '../data/presetAssets';
import { ColorGradingSection } from './ColorGradingSection';
import { DEFAULT_COLOR_GRADING } from '../utils/editorUtils';
import { CapCutAudioInspector } from './CapCutAudioInspector';
import { CapCutVideoInspector } from './CapCutVideoInspector';
import { CapCutTextInspector } from './CapCutTextInspector';

interface InspectorProps {
  selectedClip: Clip | null;
  selectedClipIds?: string[];
  tracks?: Track[];
  onUpdateClip: (clipId: string, updates: Partial<Clip>) => void;
  onBatchUpdateClips?: (updates: { id: string; updates: Partial<Clip> }[]) => void;
  onGenerateAICaptions: (transcript: string, style: string) => Promise<void>;
  onGenerateTTS: (text: string, voice: string) => Promise<void>;
  width?: number;
  currentTime?: number;
  onSeek?: (time: number) => void;
  onMergeClips?: () => void;
}

export default function Inspector({
  selectedClip,
  selectedClipIds = [],
  tracks = [],
  onUpdateClip,
  onBatchUpdateClips,
  onGenerateAICaptions,
  onGenerateTTS,
  width,
  currentTime,
  onSeek,
  onMergeClips,
}: InspectorProps) {
  const [activeSubTab, setActiveSubTab] = useState<'capcut' | 'transform' | 'adjust' | 'speed' | 'chroma' | 'effects' | 'transitions' | 'ai' | 'keyframes'>('capcut');
  const [savedPresets, setSavedPresets] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('quran_text_presets');
      // Ensure existing presets have an id and category if they don't
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed.map((p: any, i: number) => ({
        ...p,
        id: p.id || `preset-${Date.now()}-${i}`,
        category: p.category || 'Quranic'
      }));
    } catch(e) { return []; }
  });
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetCategory, setNewPresetCategory] = useState('Quranic');
  const [presetFilter, setPresetFilter] = useState('All');
  const [isSavingPreset, setIsSavingPreset] = useState(false);

  const handleSavePreset = () => {
    if (!newPresetName.trim() || !selectedClip) return;
    const newPreset = {
      id: `preset-${Date.now()}`,
      name: newPresetName.trim(),
      category: newPresetCategory,
      textAnimation: selectedClip.textAnimation || {},
      textBackgroundStyle: selectedClip.textBackgroundStyle,
      textBackgroundColor: selectedClip.textBackgroundColor,
      textBackgroundOpacity: selectedClip.textBackgroundOpacity,
      textBackgroundBlur: selectedClip.textBackgroundBlur,
      textBackgroundPadding: selectedClip.textBackgroundPadding,
      textBackgroundRadius: selectedClip.textBackgroundRadius,
    };
    const updated = [...savedPresets, newPreset];
    setSavedPresets(updated);
    localStorage.setItem('quran_text_presets', JSON.stringify(updated));
    setNewPresetName('');
    setIsSavingPreset(false);
  };

  const handleApplySavedPreset = (preset: any) => {
    if (!selectedClip) return;
    onUpdateClip(selectedClip.id, {
      textAnimation: preset.textAnimation,
      textBackgroundStyle: preset.textBackgroundStyle,
      textBackgroundColor: preset.textBackgroundColor,
      textBackgroundOpacity: preset.textBackgroundOpacity,
      textBackgroundBlur: preset.textBackgroundBlur,
      textBackgroundPadding: preset.textBackgroundPadding,
      textBackgroundRadius: preset.textBackgroundRadius,
    });
  };

  const handleDeleteSavedPreset = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = savedPresets.filter(p => p.id !== id);
    setSavedPresets(updated);
    localStorage.setItem('quran_text_presets', JSON.stringify(updated));
  };
  const [filterCategory, setFilterCategory] = useState<'All' | 'Cinematic' | 'Retro' | 'B&W' | 'Stylized'>('All');
  const [filterSectionView, setFilterSectionView] = useState<'all' | 'wheels' | 'presets' | 'basic'>('all');
  const [aiTranscript, setAiTranscript] = useState('');
  const [aiCaptionStyle, setAiCaptionStyle] = useState('Dynamic');
  const [aiIsGenerating, setAiIsGenerating] = useState(false);
  const [ttsText, setTtsText] = useState('');
  const [ttsVoice, setTtsVoice] = useState('Kore');
  const [ttsIsGenerating, setTtsIsGenerating] = useState(false);

  // Transition Tab State
  const [transType, setTransType] = useState<TransitionType>('dissolve');
  const [transScope, setTransScope] = useState<'in' | 'out' | 'both'>('both');
  const [transDuration, setTransDuration] = useState<number>(1.0);
  const [adjacentMode, setAdjacentMode] = useState<'joint-prev' | 'joint-next' | 'both-joints' | 'all-track-clips' | 'clip-only'>('both-joints');

  // Keyframe property state
  const currentClipOffset = selectedClip && currentTime !== undefined
    ? Math.max(0, Math.min(selectedClip.duration, Number((currentTime - selectedClip.start).toFixed(2))))
    : 0;

  const [kfTime, setKfTime] = useState<number>(0);
  const [kfOpacity, setKfOpacity] = useState<number>(100);
  const [kfPosX, setKfPosX] = useState<number>(0);
  const [kfPosY, setKfPosY] = useState<number>(0);
  const [kfScale, setKfScale] = useState<number>(100);
  const [kfRotation, setKfRotation] = useState<number>(0);
  const [kfVolume, setKfVolume] = useState<number>(100);

  useEffect(() => {
    if (selectedClip) {
      setKfTime(currentClipOffset);
      const targetOpacity = Math.round((selectedClip.opacity ?? 1) * 100);
      setKfOpacity(targetOpacity);
      const targetPosX = selectedClip.transform?.posX ?? 0;
      setKfPosX(targetPosX);
      const targetPosY = selectedClip.transform?.posY ?? 0;
      setKfPosY(targetPosY);
      const targetScale = selectedClip.transform?.scale ?? 100;
      setKfScale(targetScale);
      const targetRotation = selectedClip.transform?.rotation ?? 0;
      setKfRotation(targetRotation);
      const targetVolume = Math.round((selectedClip.volume ?? 1) * 100);
      setKfVolume(targetVolume);

      // Sync transition state from clip transition & videoEffects properties
      const fxTrans = selectedClip.videoEffects?.transition;
      const effectiveType = selectedClip.transition?.type ||
        (typeof fxTrans === 'string' ? fxTrans : fxTrans?.type) ||
        selectedClip.videoEffects?.transitionIn ||
        'dissolve';
      if (effectiveType && effectiveType !== 'none') {
        setTransType(effectiveType as TransitionType);
      }
      const effectiveDuration = selectedClip.transition?.duration || selectedClip.videoEffects?.transitionDuration || 1.0;
      setTransDuration(effectiveDuration);

      // --- DEVELOPMENT ASSERTIONS ---
      // Check if there is a mismatch between the current clip metadata and the canonical identity
      if (selectedClip.ayahKey) {
        let nameMatches = selectedClip.name.includes(selectedClip.ayahKey);
        const isBisKey = selectedClip.ayahKey === 'bis' || selectedClip.ayahKey === 'basm' || selectedClip.ayahKey === 'bismillah';
        const isTawKey = selectedClip.ayahKey === 'aux' || selectedClip.ayahKey === 'taw' || selectedClip.ayahKey === 'taawwuz';

        if (isTawKey && (selectedClip.name.includes("Ta'awwuz") || selectedClip.name.includes("Taawwuz") || selectedClip.name.includes("Isti'adha"))) {
          nameMatches = true;
        }
        if (isBisKey && (selectedClip.name.includes("Tasmiyah") || selectedClip.name.includes("Bismillah") || selectedClip.name.includes("Basmala") || selectedClip.name.includes("Tasmeea"))) {
          nameMatches = true;
        }
        const cleanAyahKey = selectedClip.ayahKey.split(' ')[0];
        if (cleanAyahKey && selectedClip.name.includes(cleanAyahKey)) {
          nameMatches = true;
        }
        if (!nameMatches) {
          console.warn(`[QURAN INSPECTOR] Clip ID ${selectedClip.id} with ayahKey ${selectedClip.ayahKey} has custom name "${selectedClip.name}".`);
        }
      }
    }
  }, [selectedClip?.id]);

  if (!selectedClip) {
    return (
      <div
        id="inspector-panel"
        className="bg-[#141418] rounded-lg border border-[#23232b] h-full flex flex-col items-center justify-center p-6 text-center select-none shadow-sm flex-shrink-0"
        style={{ width: width !== undefined ? `${width}px` : undefined }}
      >
        <Sliders className="w-10 h-10 text-gray-600 mb-3" />
        <h3 className="text-xs font-semibold text-gray-300 tracking-wider">NO CLIP SELECTED</h3>
        <p className="text-[11px] text-gray-500 mt-1 max-w-[200px]">
          Click on any Video, Audio, or Text clip inside the timeline grid to reveal details.
        </p>
      </div>
    );
  }

  const isVideo = selectedClip.type === ClipType.VIDEO;
  const isAudio = selectedClip.type === ClipType.AUDIO;
  const isText = selectedClip.type === ClipType.TEXT;

  // Keyframe Action Handlers
  const handleAddKeyframeAtTimestamp = (customTime?: number) => {
    const targetTime = customTime !== undefined ? customTime : kfTime;
    const boundedTime = Math.max(0, Math.min(selectedClip.duration, Number(targetTime.toFixed(2))));
    const existingKeyframes = selectedClip.keyframes ? [...selectedClip.keyframes] : [];

    const newKf: Keyframe = {
      id: `kf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: boundedTime,
      opacity: Number((kfOpacity / 100).toFixed(2)),
      posX: kfPosX,
      posY: kfPosY,
      scale: kfScale,
      rotation: kfRotation,
      volume: Number((kfVolume / 100).toFixed(2))
    };

    const existingIdx = existingKeyframes.findIndex(k => Math.abs(k.timestamp - newKf.timestamp) < 0.05);
    if (existingIdx >= 0) {
      existingKeyframes[existingIdx] = newKf;
    } else {
      existingKeyframes.push(newKf);
    }

    existingKeyframes.sort((a, b) => a.timestamp - b.timestamp);
    onUpdateClip(selectedClip.id, { keyframes: existingKeyframes });
  };

  const handleDeleteKeyframe = (id: string) => {
    if (!selectedClip.keyframes) return;
    const updated = selectedClip.keyframes.filter(k => k.id !== id);
    onUpdateClip(selectedClip.id, { keyframes: updated });
  };

  const handleLoadKeyframeValues = (kf: Keyframe) => {
    setKfTime(kf.timestamp);
    setKfOpacity(Math.round((kf.opacity ?? (selectedClip.opacity ?? 1)) * 100));
    setKfPosX(kf.posX ?? (selectedClip.transform?.posX ?? 0));
    setKfPosY(kf.posY ?? (selectedClip.transform?.posY ?? 0));
    setKfScale(kf.scale ?? (selectedClip.transform?.scale ?? 100));
    setKfRotation(kf.rotation ?? (selectedClip.transform?.rotation ?? 0));
    setKfVolume(Math.round((kf.volume ?? selectedClip.volume) * 100));
  };

  const handleJumpToKeyframe = (kf: Keyframe) => {
    handleLoadKeyframeValues(kf);
    if (onSeek && selectedClip) {
      onSeek(selectedClip.start + kf.timestamp);
    }
  };

  const handleJumpPrevKeyframe = () => {
    if (!selectedClip?.keyframes || selectedClip.keyframes.length === 0) return;
    const sorted = [...selectedClip.keyframes].sort((a, b) => a.timestamp - b.timestamp);
    const prev = sorted.filter(k => k.timestamp < currentClipOffset - 0.05).pop();
    if (prev) {
      handleJumpToKeyframe(prev);
    } else {
      handleJumpToKeyframe(sorted[0]);
    }
  };

  const handleJumpNextKeyframe = () => {
    if (!selectedClip?.keyframes || selectedClip.keyframes.length === 0) return;
    const sorted = [...selectedClip.keyframes].sort((a, b) => a.timestamp - b.timestamp);
    const next = sorted.find(k => k.timestamp > currentClipOffset + 0.05);
    if (next) {
      handleJumpToKeyframe(next);
    } else {
      handleJumpToKeyframe(sorted[sorted.length - 1]);
    }
  };

  const defaultFilters: VideoFilters = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: 0,
    sepia: 0,
    invert: 0,
    hueRotate: 0,
    chromaKey: {
      enabled: false,
      color: '#00ff00',
      threshold: 30,
      smoothness: 10
    },
    colorGrading: DEFAULT_COLOR_GRADING
  };

  const currentFilters: VideoFilters = selectedClip.filters || defaultFilters;

  // Handle color grading 3-way wheels and white balance
  const handleColorGradingChange = (grading: ColorGrading) => {
    const base = selectedClip.filters || defaultFilters;
    const updatedFilters: VideoFilters = {
      ...base,
      colorGrading: grading
    };
    const targetIds = selectedClipIds && selectedClipIds.length > 0
      ? selectedClipIds
      : [selectedClip.id];

    if (onBatchUpdateClips && targetIds.length > 1) {
      onBatchUpdateClips(targetIds.map(id => ({ id, updates: { filters: updatedFilters } })));
    } else {
      targetIds.forEach(id => onUpdateClip(id, { filters: updatedFilters }));
    }
  };

  const handleResetColorGrading = () => {
    handleColorGradingChange(DEFAULT_COLOR_GRADING);
  };

  // Handle individual filter adjustments
  const handleFilterChange = (key: keyof VideoFilters, value: any) => {
    const base = selectedClip.filters || defaultFilters;
    const updatedFilters = {
      ...base,
      [key]: value
    };
    onUpdateClip(selectedClip.id, { filters: updatedFilters });
  };

  const handleResetSingleFilter = (key: keyof VideoFilters) => {
    const base = selectedClip.filters || defaultFilters;
    const defaultValue = defaultFilters[key];
    const updatedFilters = {
      ...base,
      [key]: defaultValue
    };
    onUpdateClip(selectedClip.id, { filters: updatedFilters });
  };

  const handleResetAllFilters = () => {
    const base = selectedClip.filters || defaultFilters;
    const reset: VideoFilters = {
      ...defaultFilters,
      chromaKey: base.chromaKey,
      colorGrading: DEFAULT_COLOR_GRADING
    };
    const targetIds = selectedClipIds && selectedClipIds.length > 0
      ? selectedClipIds
      : [selectedClip.id];

    if (onBatchUpdateClips && targetIds.length > 1) {
      onBatchUpdateClips(targetIds.map(id => ({ id, updates: { filters: reset } })));
    } else {
      targetIds.forEach(id => onUpdateClip(id, { filters: reset }));
    }
  };

  const handleChromaChange = (key: 'enabled' | 'color' | 'threshold' | 'smoothness', value: any) => {
    const base = selectedClip.filters || defaultFilters;
    const updatedFilters = {
      ...base,
      chromaKey: {
        ...base.chromaKey,
        [key]: value
      }
    };
    onUpdateClip(selectedClip.id, { filters: updatedFilters });
  };

  // Quick speed ramp adjustments
  const handleSpeedChange = (rate: number) => {
    onUpdateClip(selectedClip.id, { playbackRate: rate });
  };

  // Quick preset LUT application (supports batch multi-clip applying)
  const applyPresetLUT = (lut: ColorGradingPreset) => {
    const base = selectedClip.filters || defaultFilters;
    const newFilters: VideoFilters = {
      ...base,
      ...lut.filters,
      chromaKey: base.chromaKey
    };

    const targetIds = selectedClipIds && selectedClipIds.length > 0
      ? selectedClipIds
      : [selectedClip.id];

    if (onBatchUpdateClips && targetIds.length > 1) {
      onBatchUpdateClips(targetIds.map(id => ({ id, updates: { filters: newFilters } })));
    } else {
      targetIds.forEach(id => onUpdateClip(id, { filters: newFilters }));
    }
  };

  const isPresetActive = (lut: ColorGradingPreset): boolean => {
    if (!selectedClip.filters) return lut.id === 'lut-none';
    const f = selectedClip.filters;
    const lf = lut.filters;
    return (
      Math.abs(f.brightness - lf.brightness) <= 2 &&
      Math.abs(f.contrast - lf.contrast) <= 2 &&
      Math.abs(f.saturation - lf.saturation) <= 2 &&
      Math.abs(f.grayscale - lf.grayscale) <= 2 &&
      Math.abs(f.sepia - lf.sepia) <= 2 &&
      Math.abs((f.hueRotate || 0) - lf.hueRotate) <= 3
    );
  };

  // Run AI captions endpoint trigger
  const triggerAICaptions = async () => {
    if (!aiTranscript.trim()) return;
    setAiIsGenerating(true);
    try {
      await onGenerateAICaptions(aiTranscript, aiCaptionStyle);
      setAiTranscript('');
    } catch (err) {
      alert('Error calling AI Captions. Please try again.');
    } finally {
      setAiIsGenerating(false);
    }
  };

  // Run AI Text to Speech endpoint trigger
  const triggerAITTS = async () => {
    if (!ttsText.trim()) return;
    setTtsIsGenerating(true);
    try {
      await onGenerateTTS(ttsText, ttsVoice);
      setTtsText('');
    } catch (err) {
      alert('Error calling Gemini TTS. Please try again.');
    } finally {
      setTtsIsGenerating(false);
    }
  };

  return (
    <div
      id="inspector-panel"
      className="bg-[#141418] rounded-lg border border-[#23232b] h-full flex flex-col select-none overflow-hidden shadow-sm flex-shrink-0"
      style={{ width: width !== undefined ? `${width}px` : undefined }}
    >
      {/* Header Info */}
      <div className="p-3.5 border-b border-[#2a2a30] bg-[#141418]">
        <div className="flex items-center justify-between gap-2">
          <input
            id="clip-title-input"
            type="text"
            value={
              selectedClip.name ||
              (selectedClip.ayahKey && selectedClip.language
                ? `${selectedClip.language.toUpperCase()}: ${
                    selectedClip.ayahKey === 'bis' ? 'Tasmiyah' : selectedClip.ayahKey === 'aux' || selectedClip.ayahKey === 'taw' ? "Ta'awwuz" : selectedClip.ayahKey
                  }`
                : '')
            }
            onChange={(e) => onUpdateClip(selectedClip.id, { name: e.target.value })}
            disabled={!!(selectedClip.ayahKey && selectedClip.language)}
            className="text-xs font-bold text-white bg-[#1a1a20] border border-gray-800 rounded px-2 py-1 flex-1 focus:outline-none focus:border-cyan-500 font-mono min-w-0"
          />
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              id="btn-capcut-inspector"
              onClick={() => setActiveSubTab('capcut')}
              className={`px-2 py-1 text-[10px] font-bold rounded border transition ${
                activeSubTab === 'capcut'
                  ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300'
                  : 'border-gray-800 bg-[#1a1a20] text-gray-400 hover:text-white'
              }`}
            >
              Inspector
            </button>
            <button
              id="btn-add-keyframe-header"
              onClick={() => {
                setActiveSubTab(activeSubTab === 'keyframes' ? 'capcut' : 'keyframes');
                handleAddKeyframeAtTimestamp(currentClipOffset);
              }}
              className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded border transition ${
                activeSubTab === 'keyframes'
                  ? 'border-purple-400 bg-purple-950/60 text-purple-300'
                  : 'border-gray-800 bg-[#1a1a20] text-gray-400 hover:text-white'
              }`}
              title="Keyframe Controls"
            >
              <CircleDot className="w-3 h-3 text-purple-400" />
              <span>Keyframes</span>
            </button>
            {isVideo && (
              <button
                onClick={() => setActiveSubTab(activeSubTab === 'transitions' ? 'capcut' : 'transitions')}
                className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded border transition ${
                  activeSubTab === 'transitions'
                    ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300'
                    : 'border-gray-800 bg-[#1a1a20] text-gray-400 hover:text-white'
                }`}
                title="Transitions"
              >
                <Blend className="w-3 h-3 text-cyan-400" />
                <span>Transitions</span>
              </button>
            )}
          </div>
          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase flex-shrink-0 ${isVideo ? 'bg-cyan-950 text-cyan-400' : isAudio ? 'bg-teal-950 text-teal-400' : 'bg-purple-950 text-purple-400'}`}>
            {selectedClip.type}
          </span>
        </div>
      </div>

      {/* CapCut Native Inspector View */}
      {activeSubTab === 'capcut' ? (
        <div className="flex-1 overflow-hidden flex flex-col">
          {isAudio ? (
            <CapCutAudioInspector clip={selectedClip} onUpdateClip={onUpdateClip} />
          ) : isText ? (
            <CapCutTextInspector clip={selectedClip} onUpdateClip={onUpdateClip} onGenerateTTS={onGenerateTTS} />
          ) : (
            <CapCutVideoInspector clip={selectedClip} onUpdateClip={onUpdateClip} />
          )}
        </div>
      ) : (
        <>
          {/* Sub tabs for categories of controls */}
          <div className="flex border-b border-[#2a2a30] text-gray-400 text-[10px] font-bold overflow-x-auto custom-scrollbar">
            {isVideo && (
              <>
                <button
                  onClick={() => setActiveSubTab('transform')}
                  className={`px-2.5 py-2 text-center transition whitespace-nowrap ${activeSubTab === 'transform' ? 'text-cyan-400 bg-[#202024] border-b-2 border-cyan-400' : 'hover:text-white'}`}
                >
                  Transform
                </button>
                <button
                  id="subtab-filters"
                  onClick={() => setActiveSubTab('adjust')}
                  className={`px-2.5 py-2 text-center transition whitespace-nowrap flex items-center gap-1 ${activeSubTab === 'adjust' ? 'text-cyan-400 bg-[#202024] border-b-2 border-cyan-400 font-extrabold' : 'hover:text-white'}`}
                >
                  <Palette className="w-3 h-3 text-cyan-400" />
                  <span>Filters</span>
                </button>
                <button
                  onClick={() => setActiveSubTab('speed')}
                  className={`px-2.5 py-2 text-center transition whitespace-nowrap ${activeSubTab === 'speed' ? 'text-cyan-400 bg-[#202024] border-b-2 border-cyan-400' : 'hover:text-white'}`}
                >
                  Speed
                </button>
                <button
                  onClick={() => setActiveSubTab('chroma')}
                  className={`px-2.5 py-2 text-center transition whitespace-nowrap ${activeSubTab === 'chroma' ? 'text-cyan-400 bg-[#202024] border-b-2 border-cyan-400' : 'hover:text-white'}`}
                >
                  Chroma
                </button>
                <button
                  onClick={() => setActiveSubTab('effects')}
                  className={`px-2.5 py-2 text-center transition whitespace-nowrap ${activeSubTab === 'effects' ? 'text-cyan-400 bg-[#202024] border-b-2 border-cyan-400' : 'hover:text-white'}`}
                >
                  FX
                </button>
              </>
            )}
            <button
              onClick={() => setActiveSubTab('transitions')}
              className={`px-2.5 py-2 text-center transition whitespace-nowrap flex items-center gap-1 ${activeSubTab === 'transitions' ? 'text-cyan-400 bg-[#202024] border-b-2 border-cyan-400 font-extrabold' : 'hover:text-white'}`}
            >
              <Blend className="w-3 h-3 text-cyan-400" />
              <span>Transitions</span>
            </button>
            <button
              onClick={() => setActiveSubTab('keyframes')}
              className={`px-2.5 py-2 text-center transition whitespace-nowrap flex items-center gap-1 ${activeSubTab === 'keyframes' ? 'text-purple-400 bg-[#202024] border-b-2 border-purple-400 font-extrabold' : 'hover:text-white'}`}
            >
              <CircleDot className="w-3 h-3 text-purple-400" />
              <span>Keyframes</span>
            </button>
            {isVideo && (
              <button
                onClick={() => setActiveSubTab('ai')}
                className={`px-2.5 py-2 text-center transition whitespace-nowrap ${activeSubTab === 'ai' ? 'text-cyan-400 bg-[#202024] border-b-2 border-cyan-400' : 'hover:text-white'}`}
              >
                AI Tools
              </button>
            )}
          </div>

          {/* Main Controls Area (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">

        {/* ------------------ KEYFRAMES TAB FOR ALL CLIP TYPES ------------------ */}
        {activeSubTab === 'keyframes' && (
          <div className="space-y-4">
            {/* Interactive Timeline Keyframe Marker Strip Container */}
            <div className="bg-[#202026] p-3.5 rounded-xl border border-purple-500/40 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <h4 className="text-[11px] font-bold text-purple-400 tracking-wider flex items-center gap-1.5 uppercase">
                  <CircleDot className="w-4 h-4 text-purple-400 animate-pulse" />
                  <span>Timeline Keyframe Controller</span>
                </h4>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleJumpPrevKeyframe}
                    disabled={!selectedClip.keyframes || selectedClip.keyframes.length === 0}
                    className="p-1 rounded bg-[#16161c] hover:bg-purple-900 text-purple-300 disabled:opacity-30 disabled:cursor-not-allowed border border-gray-800 transition cursor-pointer"
                    title="Jump to Previous Keyframe"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded font-bold border border-cyan-800/40">
                    📍 {currentClipOffset.toFixed(2)}s / {selectedClip.duration.toFixed(2)}s
                  </span>
                  <button
                    onClick={handleJumpNextKeyframe}
                    disabled={!selectedClip.keyframes || selectedClip.keyframes.length === 0}
                    className="p-1 rounded bg-[#16161c] hover:bg-purple-900 text-purple-300 disabled:opacity-30 disabled:cursor-not-allowed border border-gray-800 transition cursor-pointer"
                    title="Jump to Next Keyframe"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Visual Timeline Keyframe Strip Bar */}
              <div className="space-y-1.5 bg-[#16161c] p-2.5 rounded-lg border border-gray-800">
                <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold">
                  <span className="flex items-center gap-1 text-purple-300">
                    <Clock className="w-3 h-3 text-purple-400" />
                    <span>Timeline Keyframe Strip</span>
                  </span>
                  <span className="font-mono text-[10px] text-purple-300 font-bold">
                    {selectedClip.keyframes?.length || 0} Keyframe(s)
                  </span>
                </div>

                <div
                  id="keyframe-timeline-strip"
                  className="relative w-full h-9 bg-[#0b0b0f] rounded-md border border-purple-900/60 overflow-hidden cursor-pointer select-none group"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
                    const targetTime = Number(((clickX / rect.width) * selectedClip.duration).toFixed(2));
                    setKfTime(targetTime);
                    if (onSeek) {
                      onSeek(selectedClip.start + targetTime);
                    }
                  }}
                  title="Click anywhere on the keyframe strip to jump playhead and set timestamp"
                >
                  {/* Subtle Grid Lines */}
                  <div className="absolute inset-0 flex justify-between px-1 pointer-events-none opacity-20">
                    {[0, 25, 50, 75, 100].map((pct) => (
                      <div key={pct} className="h-full border-l border-white/40 flex flex-col justify-between">
                        <span className="text-[7px] text-white font-mono">{pct}%</span>
                      </div>
                    ))}
                  </div>

                  {/* Playhead Position Line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 z-20 pointer-events-none shadow-[0_0_8px_#06b6d4]"
                    style={{ left: `${Math.max(0, Math.min(100, (currentClipOffset / selectedClip.duration) * 100))}%` }}
                  >
                    <div className="absolute -top-0.5 -left-1 w-2.5 h-2.5 bg-cyan-400 rotate-45" />
                  </div>

                  {/* Diamond Keyframe Markers */}
                  {selectedClip.keyframes?.map((kf, idx) => {
                    const kfPct = Math.max(0, Math.min(100, (kf.timestamp / selectedClip.duration) * 100));
                    const isClosest = Math.abs(currentClipOffset - kf.timestamp) < 0.1;
                    return (
                      <button
                        key={kf.id || idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJumpToKeyframe(kf);
                        }}
                        className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 border transition-all cursor-pointer z-30 group/kf ${
                          isClosest
                            ? 'bg-cyan-400 border-white scale-125 shadow-[0_0_10px_#06b6d4]'
                            : 'bg-purple-500 hover:bg-purple-300 border-purple-200 hover:scale-125'
                        }`}
                        style={{ left: `${kfPct}%` }}
                        title={`Keyframe @ ${kf.timestamp.toFixed(2)}s - Click to Jump`}
                      />
                    );
                  })}
                </div>

                <div className="flex justify-between text-[9px] font-mono text-gray-500">
                  <span>0.00s</span>
                  <span className="text-cyan-400 font-bold">📍 Playhead @ {currentClipOffset.toFixed(2)}s</span>
                  <span>{selectedClip.duration.toFixed(2)}s</span>
                </div>
              </div>

              {/* Timestamp Offset Control */}
              <div className="space-y-1.5 bg-[#16161c] p-2.5 rounded-lg border border-gray-800">
                <div className="flex justify-between items-center text-[11px] text-gray-300 font-semibold">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span>Target Keyframe Timestamp</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-purple-300 font-bold">{kfTime.toFixed(2)}s</span>
                    <button
                      onClick={() => {
                        setKfTime(currentClipOffset);
                        if (onSeek) onSeek(selectedClip.start + currentClipOffset);
                      }}
                      className="px-2 py-0.5 text-[9px] font-bold bg-purple-950 hover:bg-purple-900 text-purple-300 rounded border border-purple-800 transition cursor-pointer"
                    >
                      Use Playhead ({currentClipOffset.toFixed(2)}s)
                    </button>
                  </div>
                </div>
                <input
                  id="keyframe-timestamp-slider"
                  type="range"
                  min="0"
                  max={Math.max(selectedClip.duration, 0.1)}
                  step="0.05"
                  value={kfTime}
                  onChange={(e) => {
                    const t = parseFloat(e.target.value);
                    setKfTime(t);
                    if (onSeek) onSeek(selectedClip.start + t);
                  }}
                  className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
                />
              </div>

              {/* Keyframe Property Sliders */}
              <div className="space-y-3 pt-1">
                {/* Opacity Slider */}
                <div className="space-y-1 bg-[#16161c] p-2 rounded-lg border border-gray-800/80">
                  <div className="flex justify-between text-[11px] text-gray-300 font-medium">
                    <span>Opacity (Transparency)</span>
                    <span className="font-mono text-cyan-400">{kfOpacity}%</span>
                  </div>
                  <input
                    id="kf-opacity-slider"
                    type="range"
                    min="0"
                    max="100"
                    value={kfOpacity}
                    onChange={(e) => setKfOpacity(parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                {/* Position X Slider */}
                <div className="space-y-1 bg-[#16161c] p-2 rounded-lg border border-gray-800/80">
                  <div className="flex justify-between text-[11px] text-gray-300 font-medium">
                    <span>Position X (Horizontal Shift)</span>
                    <span className="font-mono text-cyan-400">{kfPosX}px</span>
                  </div>
                  <input
                    id="kf-posx-slider"
                    type="range"
                    min="-300"
                    max="300"
                    value={kfPosX}
                    onChange={(e) => setKfPosX(parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                {/* Position Y Slider */}
                <div className="space-y-1 bg-[#16161c] p-2 rounded-lg border border-gray-800/80">
                  <div className="flex justify-between text-[11px] text-gray-300 font-medium">
                    <span>Position Y (Vertical Shift)</span>
                    <span className="font-mono text-cyan-400">{kfPosY}px</span>
                  </div>
                  <input
                    id="kf-posy-slider"
                    type="range"
                    min="-300"
                    max="300"
                    value={kfPosY}
                    onChange={(e) => setKfPosY(parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                {/* Scale Slider */}
                <div className="space-y-1 bg-[#16161c] p-2 rounded-lg border border-gray-800/80">
                  <div className="flex justify-between text-[11px] text-gray-300 font-medium">
                    <span>Scale (Zoom Size)</span>
                    <span className="font-mono text-cyan-400">{kfScale}%</span>
                  </div>
                  <input
                    id="kf-scale-slider"
                    type="range"
                    min="10"
                    max="200"
                    value={kfScale}
                    onChange={(e) => setKfScale(parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                {/* Rotation Slider */}
                <div className="space-y-1 bg-[#16161c] p-2 rounded-lg border border-gray-800/80">
                  <div className="flex justify-between text-[11px] text-gray-300 font-medium">
                    <span>Rotation Angle</span>
                    <span className="font-mono text-cyan-400">{kfRotation}°</span>
                  </div>
                  <input
                    id="kf-rotation-slider"
                    type="range"
                    min="0"
                    max="360"
                    value={kfRotation}
                    onChange={(e) => setKfRotation(parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                {/* Volume Slider */}
                <div className="space-y-1 bg-[#16161c] p-2 rounded-lg border border-gray-800/80">
                  <div className="flex justify-between text-[11px] text-gray-300 font-medium">
                    <span>Audio Volume Level</span>
                    <span className="font-mono text-cyan-400">{kfVolume}%</span>
                  </div>
                  <input
                    id="kf-volume-slider"
                    type="range"
                    min="0"
                    max="200"
                    value={kfVolume}
                    onChange={(e) => setKfVolume(parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
              </div>

              {/* Primary Save Keyframe Button */}
              <button
                id="btn-confirm-keyframe"
                onClick={() => handleAddKeyframeAtTimestamp(kfTime)}
                className="w-full mt-2 py-2.5 px-3 text-xs font-bold rounded-lg border border-purple-400 transition-all shadow-md bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Save Keyframe at {kfTime.toFixed(2)}s</span>
              </button>
            </div>

            {/* Keyframes List Section */}
            <div className="bg-[#202026] p-3 rounded-lg border border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Active Keyframes ({selectedClip.keyframes?.length || 0})</span>
                </h4>
              </div>

              {(!selectedClip.keyframes || selectedClip.keyframes.length === 0) ? (
                <div className="text-center py-6 border border-dashed border-gray-800 rounded-lg bg-[#16161c] p-4">
                  <CircleDot className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 font-medium">No keyframes created yet</p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Adjust timestamp and property sliders above, then click 'Save Keyframe' to save keyframes at specific timestamps.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                  {selectedClip.keyframes.map((kf, idx) => (
                    <div
                      key={kf.id || idx}
                      className="p-2.5 bg-[#16161c] rounded-lg border border-gray-800 hover:border-purple-500/50 transition flex items-center justify-between gap-2"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleJumpToKeyframe(kf)}
                            className="text-[10px] font-mono font-bold text-purple-300 bg-purple-950/80 hover:bg-purple-900 px-1.5 py-0.5 rounded border border-purple-800/50 flex items-center gap-1 cursor-pointer"
                            title="Click to jump playhead to keyframe"
                          >
                            <Target className="w-3 h-3 text-cyan-400" />
                            <span>@ {kf.timestamp.toFixed(2)}s</span>
                          </button>
                          <button
                            onClick={() => handleLoadKeyframeValues(kf)}
                            className="text-[9px] text-cyan-400 hover:underline font-bold cursor-pointer"
                          >
                            Edit Values
                          </button>
                        </div>
                        <div className="text-[10px] font-mono text-gray-400 flex flex-wrap gap-x-2 gap-y-0.5">
                          {kf.opacity !== undefined && <span>Opacity: {Math.round(kf.opacity * 100)}%</span>}
                          {(kf.posX !== undefined || kf.posY !== undefined) && (
                            <span>Pos: ({kf.posX ?? 0}px, {kf.posY ?? 0}px)</span>
                          )}
                          {kf.scale !== undefined && <span>Scale: {kf.scale}%</span>}
                          {kf.rotation !== undefined && <span>Rot: {kf.rotation}°</span>}
                          {kf.volume !== undefined && <span>Vol: {Math.round(kf.volume * 100)}%</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteKeyframe(kf.id)}
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-950/40 rounded transition flex-shrink-0 cursor-pointer"
                        title="Delete keyframe"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------ VIDEO CONTROLS ------------------ */}
        {activeSubTab !== 'keyframes' && isVideo && (
          <>
            {/* Transform Tab */}
            {activeSubTab === 'transform' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold text-gray-400 tracking-wider flex items-center gap-1">
                    <Move className="w-3 h-3 text-cyan-400" />
                    <span>CANVAS MATRIX TRANSFORM</span>
                  </h4>
                </div>

                <div className="bg-[#202026] p-4 rounded-xl border border-cyan-500/30 space-y-3">
                  <p className="text-xs text-gray-300">
                    Auto-align and center the selected video stream onto the 16:9 widescreen canvas.
                  </p>
                  
                  <button
                    onClick={() => {
                      onUpdateClip(selectedClip.id, {
                        transform: { scale: 100, posX: 0, posY: 0, rotation: 0 }
                      });
                    }}
                    className="w-full py-2.5 px-3 text-xs font-extrabold rounded-lg border transition-all shadow-md bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black border-cyan-300 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>📺 Auto Fit Full Screen</span>
                  </button>

                  <div className="pt-2 border-t border-gray-800 text-[10px] font-mono text-gray-400 flex justify-between">
                    <span>Scale: 100%</span>
                    <span>X: 0px | Y: 0px</span>
                    <span>Rotation: 0°</span>
                  </div>
                </div>
              </div>
            )}

            {/* Adjustment / Filters Tab */}
            {activeSubTab === 'adjust' && (
              <div className="space-y-4">
                {/* Sub-view switcher for Color & Filters */}
                <div className="flex items-center gap-1 p-1 bg-[#181820] rounded-lg border border-gray-800">
                  <button
                    onClick={() => setFilterSectionView('all')}
                    className={`flex-1 py-1 text-[10px] font-bold rounded transition cursor-pointer ${
                      filterSectionView === 'all'
                        ? 'bg-[#252532] text-cyan-400 border border-gray-700/60 shadow-xs'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    id="filter-view-wheels-btn"
                    onClick={() => setFilterSectionView('wheels')}
                    className={`flex-1 py-1 text-[10px] font-bold rounded transition cursor-pointer flex items-center justify-center gap-1 ${
                      filterSectionView === 'wheels'
                        ? 'bg-gradient-to-r from-indigo-950/90 via-purple-950/90 to-cyan-950/90 text-cyan-300 border border-cyan-700/60 font-extrabold shadow-sm'
                        : 'text-gray-400 hover:text-cyan-400'
                    }`}
                  >
                    <CircleDot className="w-3 h-3 text-cyan-400" />
                    <span>Color Wheels</span>
                  </button>
                  <button
                    onClick={() => setFilterSectionView('presets')}
                    className={`flex-1 py-1 text-[10px] font-bold rounded transition cursor-pointer flex items-center justify-center gap-1 ${
                      filterSectionView === 'presets'
                        ? 'bg-[#252532] text-amber-400 border border-gray-700/60 font-bold shadow-xs'
                        : 'text-gray-400 hover:text-amber-400'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>LUTs</span>
                  </button>
                  <button
                    onClick={() => setFilterSectionView('basic')}
                    className={`flex-1 py-1 text-[10px] font-bold rounded transition cursor-pointer flex items-center justify-center gap-1 ${
                      filterSectionView === 'basic'
                        ? 'bg-[#252532] text-gray-200 border border-gray-700/60 font-bold shadow-xs'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Sliders</span>
                  </button>
                </div>

                {/* 1. PROFESSIONAL COLOR GRADING SECTION (Lift, Gamma, Gain Color Wheels & White Balance) */}
                {(filterSectionView === 'all' || filterSectionView === 'wheels') && (
                  <ColorGradingSection
                    colorGrading={currentFilters.colorGrading}
                    onChange={handleColorGradingChange}
                    onReset={handleResetColorGrading}
                  />
                )}

                {/* 2. PRESET COLOR GRADING & FILTERS LIBRARY */}
                {(filterSectionView === 'all' || filterSectionView === 'presets') && (
                <div className="space-y-3 bg-[#202026] p-3 rounded-lg border border-gray-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold text-gray-300 tracking-wider flex items-center gap-1.5 uppercase">
                      <Palette className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Preset Look Library</span>
                    </h4>
                    <button
                      onClick={handleResetAllFilters}
                      className="flex items-center gap-1 text-[9px] text-gray-400 hover:text-cyan-400 transition font-mono px-1.5 py-0.5 rounded bg-[#18181c] border border-gray-700/60 cursor-pointer"
                      title="Reset all filters to Natural Rec.709"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>Reset Filters</span>
                    </button>
                  </div>

                  {/* Category Filter Switcher */}
                  <div className="flex gap-1 overflow-x-auto custom-scrollbar pb-1">
                    {(['All', 'Cinematic', 'Retro', 'B&W', 'Stylized'] as const).map((cat) => {
                      const count = cat === 'All' 
                        ? PRESET_LUTS.length 
                        : PRESET_LUTS.filter(l => l.category === cat).length;
                      return (
                        <button
                          key={cat}
                          onClick={() => setFilterCategory(cat)}
                          className={`px-2 py-1 text-[9px] font-bold rounded transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                            filterCategory === cat
                              ? 'bg-cyan-500 text-black shadow'
                              : 'bg-[#18181c] text-gray-400 hover:text-white border border-gray-800'
                          }`}
                        >
                          <span>{cat}</span>
                          <span className={`text-[8px] px-1 rounded-full ${filterCategory === cat ? 'bg-black/20 text-black' : 'bg-gray-800 text-gray-400'}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Preset Cards Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {PRESET_LUTS.filter(lut => filterCategory === 'All' || lut.category === filterCategory).map((lut) => {
                      const active = isPresetActive(lut);
                      return (
                        <button
                          key={lut.id}
                          id={`preset-lut-${lut.id}`}
                          onClick={() => applyPresetLUT(lut)}
                          className={`group relative flex flex-col text-left rounded-md overflow-hidden border transition-all p-0 cursor-pointer ${
                            active
                              ? 'border-cyan-400 bg-[#252530] shadow-md shadow-cyan-950/40 ring-1 ring-cyan-400'
                              : 'border-gray-800/80 bg-[#191920] hover:border-gray-600 hover:bg-[#1e1e26]'
                          }`}
                        >
                          {/* Preview Swatch Banner */}
                          <div className={`h-9 w-full bg-gradient-to-r ${lut.gradient} flex items-center justify-between px-2 relative`}>
                            <span className="text-sm drop-shadow-md">{lut.iconEmoji}</span>
                            {active && (
                              <span className="flex items-center gap-0.5 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-black/80 text-cyan-300 backdrop-blur-xs border border-cyan-400/50">
                                <Check className="w-2.5 h-2.5" />
                                <span>Active</span>
                              </span>
                            )}
                          </div>

                          {/* Preset Information */}
                          <div className="p-2 space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className={`text-[11px] font-bold truncate ${active ? 'text-cyan-300' : 'text-gray-200 group-hover:text-white'}`}>
                                {lut.name}
                              </span>
                            </div>
                            <p className="text-[9px] text-gray-400 line-clamp-2 leading-tight">
                              {lut.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Batch application option if multiple clips selected */}
                  {selectedClipIds && selectedClipIds.length > 1 && (
                    <div className="pt-2 border-t border-gray-800/60">
                      <div className="flex items-center justify-between text-[10px] text-gray-300 bg-[#16161c] p-2 rounded border border-cyan-500/30">
                        <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                          <Layers className="w-3 h-3" />
                          <span>Multi-Clip Grading Active</span>
                        </span>
                        <span className="text-[9px] text-gray-400 font-mono">
                          Applying to {selectedClipIds.length} clips
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                )}

                {/* 3. FINE-TUNING COLOR & LIGHT SLIDERS */}
                {(filterSectionView === 'all' || filterSectionView === 'basic') && (
                <div className="space-y-3 bg-[#202026] p-3 rounded-lg border border-gray-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold text-gray-400 tracking-wider flex items-center gap-1.5 uppercase">
                      <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Fine-Tuning Controls</span>
                    </h4>
                    <span className="text-[9px] font-mono text-gray-500">Pixel Engine</span>
                  </div>

                  {/* Brightness */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px] text-gray-300">
                      <span className="flex items-center gap-1">
                        <span>Brightness</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-cyan-400">{currentFilters.brightness}%</span>
                        {currentFilters.brightness !== 100 && (
                          <button
                            onClick={() => handleResetSingleFilter('brightness')}
                            className="text-gray-500 hover:text-cyan-400 transition"
                            title="Reset Brightness"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      id="brightness-slider"
                      type="range"
                      min="0"
                      max="200"
                      value={currentFilters.brightness}
                      onChange={(e) => handleFilterChange('brightness', parseInt(e.target.value))}
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* Contrast */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px] text-gray-300">
                      <span>Contrast</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-cyan-400">{currentFilters.contrast}%</span>
                        {currentFilters.contrast !== 100 && (
                          <button
                            onClick={() => handleResetSingleFilter('contrast')}
                            className="text-gray-500 hover:text-cyan-400 transition"
                            title="Reset Contrast"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      id="contrast-slider"
                      type="range"
                      min="0"
                      max="200"
                      value={currentFilters.contrast}
                      onChange={(e) => handleFilterChange('contrast', parseInt(e.target.value))}
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* Saturation */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px] text-gray-300">
                      <span>Saturation</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-cyan-400">{currentFilters.saturation}%</span>
                        {currentFilters.saturation !== 100 && (
                          <button
                            onClick={() => handleResetSingleFilter('saturation')}
                            className="text-gray-500 hover:text-cyan-400 transition"
                            title="Reset Saturation"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      id="saturation-slider"
                      type="range"
                      min="0"
                      max="200"
                      value={currentFilters.saturation}
                      onChange={(e) => handleFilterChange('saturation', parseInt(e.target.value))}
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* Hue Rotation */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px] text-gray-300">
                      <span>Hue Rotation</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-cyan-400">{currentFilters.hueRotate || 0}°</span>
                        {(currentFilters.hueRotate || 0) !== 0 && (
                          <button
                            onClick={() => handleResetSingleFilter('hueRotate')}
                            className="text-gray-500 hover:text-cyan-400 transition"
                            title="Reset Hue"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      id="huerotate-slider"
                      type="range"
                      min="0"
                      max="360"
                      value={currentFilters.hueRotate || 0}
                      onChange={(e) => handleFilterChange('hueRotate', parseInt(e.target.value))}
                      className="w-full h-1.5 bg-gradient-to-r from-red-500 via-green-500 via-blue-500 to-red-500 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* Grayscale */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px] text-gray-300">
                      <span>Grayscale</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-cyan-400">{currentFilters.grayscale}%</span>
                        {currentFilters.grayscale !== 0 && (
                          <button
                            onClick={() => handleResetSingleFilter('grayscale')}
                            className="text-gray-500 hover:text-cyan-400 transition"
                            title="Reset Grayscale"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      id="grayscale-slider"
                      type="range"
                      min="0"
                      max="100"
                      value={currentFilters.grayscale}
                      onChange={(e) => handleFilterChange('grayscale', parseInt(e.target.value))}
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* Sepia */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px] text-gray-300">
                      <span>Sepia Vintage Film</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-cyan-400">{currentFilters.sepia}%</span>
                        {currentFilters.sepia !== 0 && (
                          <button
                            onClick={() => handleResetSingleFilter('sepia')}
                            className="text-gray-500 hover:text-cyan-400 transition"
                            title="Reset Sepia"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      id="sepia-slider"
                      type="range"
                      min="0"
                      max="100"
                      value={currentFilters.sepia}
                      onChange={(e) => handleFilterChange('sepia', parseInt(e.target.value))}
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* Invert */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px] text-gray-300">
                      <span>Invert Colors</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-cyan-400">{currentFilters.invert}%</span>
                        {currentFilters.invert !== 0 && (
                          <button
                            onClick={() => handleResetSingleFilter('invert')}
                            className="text-gray-500 hover:text-cyan-400 transition"
                            title="Reset Invert"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      id="invert-slider"
                      type="range"
                      min="0"
                      max="100"
                      value={currentFilters.invert}
                      onChange={(e) => handleFilterChange('invert', parseInt(e.target.value))}
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                </div>
                )}

                {/* Volume slider */}
                <div className="space-y-1.5 bg-[#202026] p-3 rounded-lg border border-gray-800">
                  <div className="flex items-center justify-between text-xs text-gray-300">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Audio Volume</span>
                    </div>
                    <span className="font-mono text-[10px] text-gray-400">{(selectedClip.volume * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    id="volume-slider"
                    type="range"
                    min="0"
                    max="2"
                    step="0.05"
                    value={selectedClip.volume}
                    onChange={(e) => onUpdateClip(selectedClip.id, { volume: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
              </div>
            )}

            {/* Speed Tab */}
            {activeSubTab === 'speed' && (
              <div className="space-y-4">
                <div className="space-y-3 bg-[#202026] p-3 rounded-lg border border-gray-800">
                  <div className="flex items-center justify-between text-xs text-gray-300 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Speed Multiplier</span>
                    </div>
                    <span className="font-mono text-cyan-400 font-bold">{selectedClip.playbackRate.toFixed(2)}x</span>
                  </div>

                  <input
                    id="speed-slider"
                    type="range"
                    min="0.1"
                    max="10.0"
                    step="0.1"
                    value={selectedClip.playbackRate}
                    onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />

                  {/* Preset curves or fast speeds */}
                  <div className="grid grid-cols-4 gap-1.5 pt-2">
                    {[0.5, 1.0, 2.0, 5.0].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSpeedChange(s)}
                        className={`py-1 text-[10px] font-mono font-bold rounded transition ${selectedClip.playbackRate === s ? 'bg-cyan-500 text-black' : 'bg-[#18181c] text-gray-400 hover:text-white'}`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-cyan-950/20 border border-cyan-800/20 rounded-lg p-3">
                  <h5 className="text-[11px] font-bold text-cyan-400 flex items-center gap-1.5 uppercase">
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Dynamic Pitch Lock</span>
                  </h5>
                  <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                    Automatically preserves audio pitch using Web Audio API frequency-shifting. Modifying clip speeds from 0.1x (Slow-mo) to 10.0x (Fast-forward) won't cause annoying "chipmunk" pitch vocal distortions.
                  </p>
                </div>
              </div>
            )}

            {/* Chroma Key Tab */}
            {activeSubTab === 'chroma' && (
              <div className="space-y-4 bg-[#202026] p-3 rounded-lg border border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-xs font-semibold text-gray-300">Green Screen Mask</span>
                  </div>
                  <input
                    id="chroma-toggle"
                    type="checkbox"
                    checked={selectedClip.filters.chromaKey.enabled}
                    onChange={(e) => handleChromaChange('enabled', e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 bg-gray-700 focus:ring-0 cursor-pointer"
                  />
                </div>

                {selectedClip.filters.chromaKey.enabled && (
                  <div className="space-y-3 pt-2 border-t border-[#2d2d38]">
                    {/* Key Color Picker */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-400">Target Key Color</span>
                      <div className="flex items-center gap-2">
                        <input
                          id="chroma-color-picker"
                          type="color"
                          value={selectedClip.filters.chromaKey.color}
                          onChange={(e) => handleChromaChange('color', e.target.value)}
                          className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                        />
                        <span className="font-mono text-[10px] text-gray-500 uppercase">{selectedClip.filters.chromaKey.color}</span>
                      </div>
                    </div>

                    {/* Similarity Threshold */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-gray-400">
                        <span>Similarity Threshold</span>
                        <span className="font-mono">{selectedClip.filters.chromaKey.threshold}%</span>
                      </div>
                      <input
                        id="chroma-threshold-slider"
                        type="range"
                        min="5"
                        max="100"
                        value={selectedClip.filters.chromaKey.threshold}
                        onChange={(e) => handleChromaChange('threshold', parseInt(e.target.value))}
                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                    </div>

                    {/* Mask Smoothness */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-gray-400">
                        <span>Edge Smoothness</span>
                        <span className="font-mono">{selectedClip.filters.chromaKey.smoothness}%</span>
                      </div>
                      <input
                        id="chroma-smoothness-slider"
                        type="range"
                        min="0"
                        max="100"
                        value={selectedClip.filters.chromaKey.smoothness}
                        onChange={(e) => handleChromaChange('smoothness', parseInt(e.target.value))}
                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Video Effects Tab */}
            {activeSubTab === 'effects' && (
              <div className="space-y-4">
                <div className="bg-[#202026] p-3 rounded-lg border border-gray-800 space-y-3">
                  <h4 className="text-[10px] font-bold text-cyan-400 tracking-wider flex items-center gap-1 uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>CuteCut Pro Special Effects</span>
                  </h4>

                  {/* Vignette Toggle */}
                  <div className="flex items-center justify-between p-2 bg-[#16161c] rounded border border-gray-800">
                    <div>
                      <div className="text-xs font-semibold text-gray-200">Vignette Dark Edges</div>
                      <div className="text-[10px] text-gray-500">Darkens canvas perimeter for dramatic focus</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!selectedClip.videoEffects?.vignette}
                      onChange={(e) => {
                        onUpdateClip(selectedClip.id, {
                          videoEffects: {
                            ...(selectedClip.videoEffects || {}),
                            vignette: e.target.checked
                          }
                        });
                      }}
                      className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                    />
                  </div>

                  {/* Film Grain Toggle */}
                  <div className="flex items-center justify-between p-2 bg-[#16161c] rounded border border-gray-800">
                    <div>
                      <div className="text-xs font-semibold text-gray-200">35mm Film Grain</div>
                      <div className="text-[10px] text-gray-500">Analog noise particles for cinematic texture</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!selectedClip.videoEffects?.filmGrain}
                      onChange={(e) => {
                        onUpdateClip(selectedClip.id, {
                          videoEffects: {
                            ...(selectedClip.videoEffects || {}),
                            filmGrain: e.target.checked
                          }
                        });
                      }}
                      className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                    />
                  </div>

                  {/* Glitch Effect Toggle */}
                  <div className="flex items-center justify-between p-2 bg-[#16161c] rounded border border-gray-800">
                    <div>
                      <div className="text-xs font-semibold text-gray-200">VHS Glitch & RGB Shear</div>
                      <div className="text-[10px] text-gray-500">Periodic RGB chromatic shift, horizontal shear & VHS jitter</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!selectedClip.videoEffects?.glitch}
                      onChange={(e) => {
                        onUpdateClip(selectedClip.id, {
                          videoEffects: {
                            ...(selectedClip.videoEffects || {}),
                            glitch: e.target.checked
                          }
                        });
                      }}
                      className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                    />
                  </div>

                  {/* Gaussian Blur Radius Slider */}
                  <div className="space-y-1 p-2 bg-[#16161c] rounded border border-gray-800">
                    <div className="flex justify-between text-[11px] text-gray-300">
                      <span>Gaussian Soft Blur</span>
                      <span className="font-mono text-cyan-400">{selectedClip.videoEffects?.blur || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={selectedClip.videoEffects?.blur || 0}
                      onChange={(e) => {
                        onUpdateClip(selectedClip.id, {
                          videoEffects: {
                            ...(selectedClip.videoEffects || {}),
                            blur: parseInt(e.target.value)
                          }
                        });
                      }}
                      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* AI Tools Tab */}
            {activeSubTab === 'ai' && (
              <div className="space-y-4">
                {/* AI Auto-Captions Section */}
                <div className="bg-[#202026] p-3 rounded-lg border border-gray-800 space-y-3">
                  <h4 className="text-[11px] font-bold text-cyan-400 tracking-wider flex items-center gap-1.5 uppercase">
                    <Sparkles className="w-4 h-4" />
                    <span>Gemini Auto-Captions</span>
                  </h4>
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Type a speech transcript or scene dialogue, and let Gemini's structured models automatically generate perfectly synced text overlay subtitle clips across your timeline!
                  </p>
                  <textarea
                    id="ai-transcript-textarea"
                    placeholder="Enter transcript, e.g., 'In this scene, a robotic dinosaur bounces over neon grids exploring space...'"
                    value={aiTranscript}
                    onChange={(e) => setAiTranscript(e.target.value)}
                    className="w-full h-16 text-[10px] bg-[#16161c] border border-gray-800 rounded p-2 focus:outline-none focus:border-cyan-500 font-sans text-gray-200"
                  />
                  <div className="flex gap-2">
                    <select
                      value={aiCaptionStyle}
                      onChange={(e) => setAiCaptionStyle(e.target.value)}
                      className="text-[10px] bg-[#16161c] border border-gray-800 rounded px-2 py-1 text-gray-300 focus:outline-none"
                    >
                      <option value="Dynamic">Dynamic Bold</option>
                      <option value="Minimal">Minimal Header</option>
                      <option value="Neon">Retro Neon</option>
                    </select>
                    <button
                      id="btn-trigger-ai-captions"
                      onClick={triggerAICaptions}
                      disabled={aiIsGenerating || !aiTranscript.trim()}
                      className="flex-1 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-800 disabled:text-gray-600 text-black font-bold text-[10px] flex items-center justify-center gap-1 transition"
                    >
                      {aiIsGenerating ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <span>Generate Captions</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Gemini TTS Voiceover generator */}
                <div className="bg-[#202026] p-3 rounded-lg border border-gray-800 space-y-3">
                  <h4 className="text-[11px] font-bold text-teal-400 tracking-wider flex items-center gap-1.5 uppercase">
                    <FileText className="w-4 h-4" />
                    <span>Gemini Text-to-Speech</span>
                  </h4>
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Convert any written script into deep voiceovers! Utilizing <b>gemini-3.1-flash-tts-preview</b>, the AI automatically creates sound files inside the timeline.
                  </p>
                  <textarea
                    id="ai-tts-textarea"
                    placeholder="Enter voiceover script, e.g., 'Welcome back to the future. Let us code.'"
                    value={ttsText}
                    onChange={(e) => setTtsText(e.target.value)}
                    className="w-full h-16 text-[10px] bg-[#16161c] border border-gray-800 rounded p-2 focus:outline-none focus:border-teal-500 font-sans text-gray-200"
                  />
                  <div className="flex gap-2">
                    <select
                      value={ttsVoice}
                      onChange={(e) => setTtsVoice(e.target.value)}
                      className="text-[10px] bg-[#16161c] border border-gray-800 rounded px-2 py-1 text-gray-300 focus:outline-none"
                    >
                      <option value="Kore">Kore (Male Deep)</option>
                      <option value="Zephyr">Zephyr (Bright)</option>
                      <option value="Puck">Puck (Cheerful)</option>
                      <option value="Charon">Charon (Calm)</option>
                    </select>
                    <button
                      id="btn-trigger-ai-tts"
                      onClick={triggerAITTS}
                      disabled={ttsIsGenerating || !ttsText.trim()}
                      className="flex-1 py-1.5 rounded bg-teal-500 hover:bg-teal-400 disabled:bg-gray-800 disabled:text-gray-600 text-black font-bold text-[10px] flex items-center justify-center gap-1 transition"
                    >
                      {ttsIsGenerating ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Synthesizing...</span>
                        </>
                      ) : (
                        <span>Generate Audio</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Effects Tab (FX) */}
            {activeSubTab === 'effects' && (
              <div className="space-y-4">
                {/* Visual Video Effects Card */}
                <div className="space-y-3 bg-[#202026] p-3 rounded-lg border border-gray-800">
                  <h4 className="text-[10px] font-bold text-cyan-400 tracking-wider flex items-center gap-1 uppercase">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Video Style FX</span>
                  </h4>
                  
                  {/* Vignette Toggle */}
                  <div className="flex items-center justify-between p-1">
                    <label className="text-xs text-gray-300 font-medium cursor-pointer" htmlFor="fx-vignette">
                      Vignette (Dark Margins)
                    </label>
                    <input
                      id="fx-vignette"
                      type="checkbox"
                      checked={selectedClip.videoEffects?.vignette ?? false}
                      onChange={(e) => {
                        const current = selectedClip.videoEffects || {};
                        onUpdateClip(selectedClip.id, {
                          videoEffects: { ...current, vignette: e.target.checked }
                        });
                      }}
                      className="w-4 h-4 bg-gray-800 border-gray-700 text-cyan-500 rounded focus:ring-cyan-500 cursor-pointer"
                    />
                  </div>

                  {/* Film Grain Toggle */}
                  <div className="flex items-center justify-between p-1">
                    <label className="text-xs text-gray-300 font-medium cursor-pointer" htmlFor="fx-grain">
                      Vintage Film Grain
                    </label>
                    <input
                      id="fx-grain"
                      type="checkbox"
                      checked={selectedClip.videoEffects?.filmGrain ?? false}
                      onChange={(e) => {
                        const current = selectedClip.videoEffects || {};
                        onUpdateClip(selectedClip.id, {
                          videoEffects: { ...current, filmGrain: e.target.checked }
                        });
                      }}
                      className="w-4 h-4 bg-gray-800 border-gray-700 text-cyan-500 rounded focus:ring-cyan-500 cursor-pointer"
                    />
                  </div>

                  {/* Glitch Toggle */}
                  <div className="flex items-center justify-between p-1">
                    <label className="text-xs text-gray-300 font-medium cursor-pointer" htmlFor="fx-glitch">
                      Dynamic Glitch Slices
                    </label>
                    <input
                      id="fx-glitch"
                      type="checkbox"
                      checked={selectedClip.videoEffects?.glitch ?? false}
                      onChange={(e) => {
                        const current = selectedClip.videoEffects || {};
                        onUpdateClip(selectedClip.id, {
                          videoEffects: { ...current, glitch: e.target.checked }
                        });
                      }}
                      className="w-4 h-4 bg-gray-800 border-gray-700 text-cyan-500 rounded focus:ring-cyan-500 cursor-pointer"
                    />
                  </div>

                  {/* Blur Amount Slider */}
                  <div className="space-y-1.5 pt-2 border-t border-[#2d2d38]">
                    <div className="flex justify-between text-[11px] text-gray-400">
                      <span>Glow / Blur Radius</span>
                      <span className="font-mono text-cyan-400 font-bold">{selectedClip.videoEffects?.blur ?? 0}px</span>
                    </div>
                    <input
                      id="fx-blur-slider"
                      type="range"
                      min="0"
                      max="15"
                      step="1"
                      value={selectedClip.videoEffects?.blur ?? 0}
                      onChange={(e) => {
                        const current = selectedClip.videoEffects || {};
                        onUpdateClip(selectedClip.id, {
                          videoEffects: { ...current, blur: parseInt(e.target.value) }
                        });
                      }}
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                </div>

                {/* Vocal Audio Effects Card */}
                <div className="space-y-3 bg-[#202026] p-3 rounded-lg border border-gray-800">
                  <h4 className="text-[10px] font-bold text-teal-400 tracking-wider flex items-center gap-1 uppercase">
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Qiraat Audio FX</span>
                  </h4>
                  <p className="text-[10px] text-gray-400 leading-normal">
                    Apply vocal echo and low-shelf bass amplification tailored for pristine Quran recitation.
                  </p>

                  {/* Reverb Toggle */}
                  <div className="flex items-center justify-between p-1">
                    <label className="text-xs text-gray-300 font-medium cursor-pointer" htmlFor="video-fx-reverb">
                      Qiraat Hall Reverb
                    </label>
                    <input
                      id="video-fx-reverb"
                      type="checkbox"
                      checked={selectedClip.audioEffects?.reverb ?? false}
                      onChange={(e) => {
                        const current = selectedClip.audioEffects || {};
                        onUpdateClip(selectedClip.id, {
                          audioEffects: { ...current, reverb: e.target.checked }
                        });
                      }}
                      className="w-4 h-4 bg-gray-800 border-gray-700 text-teal-500 rounded focus:ring-teal-500 cursor-pointer"
                    />
                  </div>

                  {/* Echo Toggle */}
                  <div className="flex items-center justify-between p-1">
                    <label className="text-xs text-gray-300 font-medium cursor-pointer" htmlFor="video-fx-echo">
                      Recitation Echo Delay
                    </label>
                    <input
                      id="video-fx-echo"
                      type="checkbox"
                      checked={selectedClip.audioEffects?.echo ?? false}
                      onChange={(e) => {
                        const current = selectedClip.audioEffects || {};
                        onUpdateClip(selectedClip.id, {
                          audioEffects: { ...current, echo: e.target.checked }
                        });
                      }}
                      className="w-4 h-4 bg-gray-800 border-gray-700 text-teal-500 rounded focus:ring-teal-500 cursor-pointer"
                    />
                  </div>

                  {/* Bass Boost Toggle */}
                  <div className="flex items-center justify-between p-1">
                    <label className="text-xs text-gray-300 font-medium cursor-pointer" htmlFor="video-fx-bass">
                      Vocal Bass Boost
                    </label>
                    <input
                      id="video-fx-bass"
                      type="checkbox"
                      checked={selectedClip.audioEffects?.bassBoost ?? false}
                      onChange={(e) => {
                        const current = selectedClip.audioEffects || {};
                        onUpdateClip(selectedClip.id, {
                          audioEffects: { ...current, bassBoost: e.target.checked }
                        });
                      }}
                      className="w-4 h-4 bg-gray-800 border-gray-700 text-teal-500 rounded focus:ring-teal-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ------------------ AUDIO CONTROLS ------------------ */}
        {isAudio && (
          <div className="space-y-4 bg-[#202026] p-3 rounded-lg border border-gray-800">
            <h4 className="text-[10px] font-bold text-gray-400 tracking-wider flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-teal-400" />
              <span>AUDIO CONTROLS</span>
            </h4>

            {/* Volume */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>Volume</span>
                <span className="font-mono">{(selectedClip.volume * 100).toFixed(0)}%</span>
              </div>
              <input
                id="audio-volume-slider"
                type="range"
                min="0"
                max="2"
                step="0.05"
                value={selectedClip.volume}
                onChange={(e) => onUpdateClip(selectedClip.id, { volume: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
            </div>

            {/* Speed */}
            <div className="space-y-1 pt-2 border-t border-[#2d2d38]">
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>Playback Speed</span>
                <span className="font-mono text-teal-400 font-bold">{selectedClip.playbackRate.toFixed(2)}x</span>
              </div>
              <input
                id="audio-speed-slider"
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={selectedClip.playbackRate}
                onChange={(e) => onUpdateClip(selectedClip.id, { playbackRate: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
            </div>

            {/* Qiraat Audio Effects */}
            <div className="space-y-3 pt-3 border-t border-[#2d2d38]">
              <h5 className="text-[10px] font-bold text-teal-400 tracking-wider flex items-center gap-1 uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Qiraat Audio FX</span>
              </h5>
              
              {/* Reverb Toggle */}
              <div className="flex items-center justify-between p-1">
                <label className="text-xs text-gray-300 font-medium cursor-pointer" htmlFor="audio-fx-reverb">
                  Qiraat Hall Reverb
                </label>
                <input
                  id="audio-fx-reverb"
                  type="checkbox"
                  checked={selectedClip.audioEffects?.reverb ?? false}
                  onChange={(e) => {
                    const current = selectedClip.audioEffects || {};
                    onUpdateClip(selectedClip.id, {
                      audioEffects: { ...current, reverb: e.target.checked }
                    });
                  }}
                  className="w-4 h-4 bg-gray-800 border-gray-700 text-teal-500 rounded focus:ring-teal-500 cursor-pointer"
                />
              </div>

              {/* Echo Toggle */}
              <div className="flex items-center justify-between p-1">
                <label className="text-xs text-gray-300 font-medium cursor-pointer" htmlFor="audio-fx-echo">
                  Recitation Echo Delay
                </label>
                <input
                  id="audio-fx-echo"
                  type="checkbox"
                  checked={selectedClip.audioEffects?.echo ?? false}
                  onChange={(e) => {
                    const current = selectedClip.audioEffects || {};
                    onUpdateClip(selectedClip.id, {
                      audioEffects: { ...current, echo: e.target.checked }
                    });
                  }}
                  className="w-4 h-4 bg-gray-800 border-gray-700 text-teal-500 rounded focus:ring-teal-500 cursor-pointer"
                />
              </div>

              {/* Bass Boost Toggle */}
              <div className="flex items-center justify-between p-1">
                <label className="text-xs text-gray-300 font-medium cursor-pointer" htmlFor="audio-fx-bass">
                  Vocal Bass Boost
                </label>
                <input
                  id="audio-fx-bass"
                  type="checkbox"
                  checked={selectedClip.audioEffects?.bassBoost ?? false}
                  onChange={(e) => {
                    const current = selectedClip.audioEffects || {};
                    onUpdateClip(selectedClip.id, {
                      audioEffects: { ...current, bassBoost: e.target.checked }
                    });
                  }}
                  className="w-4 h-4 bg-gray-800 border-gray-700 text-teal-500 rounded focus:ring-teal-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* ------------------ TRANSITIONS CONTROLS ------------------ */}
        {activeSubTab === 'transitions' && (() => {
          const currentTrack = (tracks || []).find(t => t.clips.some(c => c.id === selectedClip.id));
          const trackClips = currentTrack ? [...currentTrack.clips].sort((a, b) => a.start - b.start) : [];
          const currentClipIndex = trackClips.findIndex(c => c.id === selectedClip.id);

          const prevClip = currentClipIndex > 0 ? trackClips[currentClipIndex - 1] : null;
          const nextClip = currentClipIndex >= 0 && currentClipIndex < trackClips.length - 1 ? trackClips[currentClipIndex + 1] : null;

          const handleApplyTransition = () => {
            const updatesMap = new Map<string, Partial<Clip>>();

            const makeFxObj = (existingFx: any, inT?: TransitionType, outT?: TransitionType) => ({
              ...(existingFx || {}),
              transition: transType,
              transitionIn: inT || 'none',
              transitionOut: outT || 'none',
              transitionDuration: transDuration,
            });

            const makeTransObj = (inT?: TransitionType, outT?: TransitionType): ClipTransition => ({
              type: transType,
              duration: transDuration,
              inType: inT || 'none',
              inDuration: transDuration,
              outType: outT || 'none',
              outDuration: transDuration,
            });

            if (adjacentMode === 'joint-prev' && prevClip) {
              updatesMap.set(prevClip.id, {
                transition: makeTransObj(prevClip.transition?.inType || 'none', transType),
                videoEffects: makeFxObj(prevClip.videoEffects, prevClip.videoEffects?.transitionIn || 'none', transType),
              });
              updatesMap.set(selectedClip.id, {
                transition: makeTransObj(transType, selectedClip.transition?.outType || 'none'),
                videoEffects: makeFxObj(selectedClip.videoEffects, transType, selectedClip.videoEffects?.transitionOut || 'none'),
              });
            } else if (adjacentMode === 'joint-next' && nextClip) {
              updatesMap.set(selectedClip.id, {
                transition: makeTransObj(selectedClip.transition?.inType || 'none', transType),
                videoEffects: makeFxObj(selectedClip.videoEffects, selectedClip.videoEffects?.transitionIn || 'none', transType),
              });
              updatesMap.set(nextClip.id, {
                transition: makeTransObj(transType, nextClip.transition?.outType || 'none'),
                videoEffects: makeFxObj(nextClip.videoEffects, transType, nextClip.videoEffects?.transitionOut || 'none'),
              });
            } else if (adjacentMode === 'both-joints') {
              if (prevClip) {
                updatesMap.set(prevClip.id, {
                  transition: makeTransObj(prevClip.transition?.inType || 'none', transType),
                  videoEffects: makeFxObj(prevClip.videoEffects, prevClip.videoEffects?.transitionIn || 'none', transType),
                });
              }
              const inT = prevClip ? transType : (transScope === 'out' ? 'none' : transType);
              const outT = nextClip ? transType : (transScope === 'in' ? 'none' : transType);
              updatesMap.set(selectedClip.id, {
                transition: makeTransObj(inT, outT),
                videoEffects: makeFxObj(selectedClip.videoEffects, inT, outT),
              });
              if (nextClip) {
                updatesMap.set(nextClip.id, {
                  transition: makeTransObj(transType, nextClip.transition?.outType || 'none'),
                  videoEffects: makeFxObj(nextClip.videoEffects, transType, nextClip.videoEffects?.transitionOut || 'none'),
                });
              }
            } else if (adjacentMode === 'all-track-clips' && trackClips.length > 0) {
              trackClips.forEach((c, idx) => {
                const hasPrev = idx > 0;
                const hasNext = idx < trackClips.length - 1;
                const inT = hasPrev ? transType : 'none';
                const outT = hasNext ? transType : 'none';

                updatesMap.set(c.id, {
                  transition: makeTransObj(inT, outT),
                  videoEffects: makeFxObj(c.videoEffects, inT, outT),
                });
              });
            } else {
              const targetIds = (selectedClipIds && selectedClipIds.length > 0) ? selectedClipIds : [selectedClip.id];
              const inT = transScope === 'out' ? 'none' : transType;
              const outT = transScope === 'in' ? 'none' : transType;

              targetIds.forEach(id => {
                const targetClip = trackClips.find(c => c.id === id) || selectedClip;
                updatesMap.set(id, {
                  transition: makeTransObj(inT, outT),
                  videoEffects: makeFxObj(targetClip.videoEffects, inT, outT),
                });
              });
            }

            const updatesList = Array.from(updatesMap.entries()).map(([id, updates]) => ({ id, updates }));
            if (onBatchUpdateClips) {
              onBatchUpdateClips(updatesList);
            } else {
              updatesList.forEach(u => onUpdateClip(u.id, u.updates));
            }
          };

          const handleClearTransition = () => {
            const targetIds = (selectedClipIds && selectedClipIds.length > 0) ? selectedClipIds : [selectedClip.id];
            const resetTrans: ClipTransition = { type: 'none', inType: 'none', outType: 'none', duration: 1.0 };
            
            const updatesList = targetIds.map(id => {
              const targetClip = trackClips.find(c => c.id === id) || selectedClip;
              const currentFx = targetClip.videoEffects || {};
              const { transition, transitionIn, transitionOut, transitionDuration, ...restFx } = currentFx;
              return {
                id,
                updates: {
                  transition: resetTrans,
                  videoEffects: restFx,
                }
              };
            });

            if (onBatchUpdateClips) {
              onBatchUpdateClips(updatesList);
            } else {
              updatesList.forEach(u => onUpdateClip(u.id, u.updates));
            }
          };

          return (
            <div className="space-y-4">
              {/* Multi-Clip Selection Matrix Status */}
              {selectedClipIds && selectedClipIds.length > 1 && (
                <div className="p-2.5 bg-gradient-to-r from-amber-950/90 via-yellow-950/90 to-amber-950/90 border border-amber-500/50 rounded-lg text-amber-200 text-xs font-bold flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span className="tracking-wide">MULTI-SELECTION: {selectedClipIds.length} CLIPS SELECTED</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {onMergeClips && (
                      <button
                        onClick={onMergeClips}
                        className="px-2 py-0.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-[10px] font-bold flex items-center gap-1 shadow transition cursor-pointer"
                        title="Merge selected adjacent text clips into one (Ctrl + M)"
                      >
                        <Merge className="w-3 h-3" />
                        <span>MERGE</span>
                      </button>
                    )}
                    <span className="text-[10px] bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded font-mono border border-amber-400/40">
                      BATCH MODE
                    </span>
                  </div>
                </div>
              )}

              {/* Current Clip Active Transition & videoEffects Status */}
              <div className="bg-[#202026] p-3 rounded-lg border border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Blend className="w-3.5 h-3.5 text-cyan-400" />
                    <span>ACTIVE TRANSITION & VIDEO EFFECTS</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                      selectedClip.videoEffects?.transition || (selectedClip.transition?.type && selectedClip.transition.type !== 'none')
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50'
                        : 'bg-gray-900 text-gray-500 border-gray-800'
                    }`}>
                      {String(selectedClip.videoEffects?.transition || selectedClip.transition?.type || selectedClip.transition?.inType || 'NONE').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Track Context Info */}
                <div className="text-[10px] text-gray-400 bg-[#141419] p-2 rounded border border-gray-800/80 flex justify-between items-center">
                  <span className="font-semibold text-gray-300">Track Context:</span>
                  <span className="font-mono text-cyan-400 font-bold">{currentTrack?.name || 'Track 1'} ({trackClips.length} Clips)</span>
                </div>

                {/* Live Animated Preview Card */}
                <div className="relative w-full h-24 bg-[#0d0d12] border border-[#2a2a36] rounded-lg overflow-hidden flex items-center justify-center p-2 shadow-inner">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px]" />
                  
                  {/* Visual Simulation of Selected Transition Effect */}
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    <div className="absolute left-2 w-16 h-12 rounded bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-[9px] font-bold text-white shadow-md z-10">
                      {prevClip ? prevClip.name.slice(0, 8) : 'CLIP A'}
                    </div>
                    <div className={`absolute right-2 w-16 h-12 rounded bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-[9px] font-bold text-white shadow-md z-20 transition-all duration-700 ${
                      transType === 'fade' ? 'animate-pulse' :
                      transType === 'slide-left' ? 'translate-x-1 animate-bounce' :
                      transType === 'slide-right' ? '-translate-x-1 animate-bounce' :
                      transType === 'slide-up' ? 'translate-y-1 animate-bounce' :
                      transType === 'slide-down' ? '-translate-y-1 animate-bounce' :
                      transType === 'zoom' ? 'scale-110 animate-pulse' :
                      transType === 'dissolve' || transType === 'cross-dissolve' ? 'opacity-80 animate-pulse' :
                      'opacity-100'
                    }`}>
                      {selectedClip.name ? selectedClip.name.slice(0, 8) : 'CLIP B'}
                    </div>
                    <div className="absolute bottom-1 right-2 text-[8px] font-mono text-cyan-400 bg-black/60 px-1 rounded">
                      EFFECT: {transType.toUpperCase()} ({transDuration.toFixed(1)}s)
                    </div>
                  </div>
                </div>
              </div>

              {/* Adjacent Clips on Same Track Section */}
              <div className="bg-[#202026] p-3 rounded-lg border border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>ADJACENT CLIPS ON TRACK</span>
                  </span>
                  <span className="text-[9px] text-gray-500 font-mono">
                    {currentClipIndex >= 0 ? `Clip ${currentClipIndex + 1} of ${trackClips.length}` : 'Selected'}
                  </span>
                </div>

                {/* Neighbor Clips Visual Diagram */}
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  {/* Prev Clip Card */}
                  <div className={`p-2 rounded border text-left flex flex-col justify-between text-[10px] ${
                    prevClip ? 'border-purple-500/40 bg-purple-950/20 text-purple-200' : 'border-gray-800 bg-[#16161c] text-gray-600'
                  }`}>
                    <div className="font-bold text-[9px] uppercase tracking-wider text-purple-400">Previous Clip</div>
                    <div className="font-semibold truncate my-1" title={prevClip?.name}>
                      {prevClip ? prevClip.name : 'None (Start)'}
                    </div>
                    <div className="text-[8px] font-mono text-gray-500">
                      {prevClip ? `${prevClip.start.toFixed(1)}s - ${(prevClip.start + prevClip.duration).toFixed(1)}s` : '--'}
                    </div>
                  </div>

                  {/* Current Selected Clip Card */}
                  <div className="p-2 rounded border border-cyan-400/60 bg-cyan-950/30 text-left flex flex-col justify-between text-[10px] shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                    <div className="font-bold text-[9px] uppercase tracking-wider text-cyan-300">Selected Clip</div>
                    <div className="font-bold text-cyan-200 truncate my-1" title={selectedClip.name}>
                      {selectedClip.name}
                    </div>
                    <div className="text-[8px] font-mono text-cyan-400">
                      {`${selectedClip.start.toFixed(1)}s - ${(selectedClip.start + selectedClip.duration).toFixed(1)}s`}
                    </div>
                  </div>

                  {/* Next Clip Card */}
                  <div className={`p-2 rounded border text-left flex flex-col justify-between text-[10px] ${
                    nextClip ? 'border-teal-500/40 bg-teal-950/20 text-teal-200' : 'border-gray-800 bg-[#16161c] text-gray-600'
                  }`}>
                    <div className="font-bold text-[9px] uppercase tracking-wider text-teal-400">Next Clip</div>
                    <div className="font-semibold truncate my-1" title={nextClip?.name}>
                      {nextClip ? nextClip.name : 'None (End)'}
                    </div>
                    <div className="text-[8px] font-mono text-gray-500">
                      {nextClip ? `${nextClip.start.toFixed(1)}s - ${(nextClip.start + nextClip.duration).toFixed(1)}s` : '--'}
                    </div>
                  </div>
                </div>

                {/* Transition Application Scope Selector */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    TRANSITION TARGET BOUNDARY
                  </label>
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setAdjacentMode('both-joints')}
                      className={`py-1.5 px-2 rounded border font-semibold text-left flex items-center justify-between transition cursor-pointer ${
                        adjacentMode === 'both-joints'
                          ? 'bg-cyan-500 text-black border-cyan-400 font-bold shadow'
                          : 'bg-[#16161c] text-gray-300 border-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <span>Prev & Next Joints</span>
                      {adjacentMode === 'both-joints' && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>

                    <button
                      type="button"
                      disabled={!prevClip}
                      onClick={() => setAdjacentMode('joint-prev')}
                      className={`py-1.5 px-2 rounded border font-semibold text-left flex items-center justify-between transition cursor-pointer ${
                        !prevClip ? 'opacity-40 cursor-not-allowed border-gray-800 bg-[#121217]' :
                        adjacentMode === 'joint-prev'
                          ? 'bg-cyan-500 text-black border-cyan-400 font-bold shadow'
                          : 'bg-[#16161c] text-gray-300 border-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <span>Prev ↔ Selected</span>
                      {adjacentMode === 'joint-prev' && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>

                    <button
                      type="button"
                      disabled={!nextClip}
                      onClick={() => setAdjacentMode('joint-next')}
                      className={`py-1.5 px-2 rounded border font-semibold text-left flex items-center justify-between transition cursor-pointer ${
                        !nextClip ? 'opacity-40 cursor-not-allowed border-gray-800 bg-[#121217]' :
                        adjacentMode === 'joint-next'
                          ? 'bg-cyan-500 text-black border-cyan-400 font-bold shadow'
                          : 'bg-[#16161c] text-gray-300 border-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <span>Selected ↔ Next</span>
                      {adjacentMode === 'joint-next' && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setAdjacentMode('all-track-clips')}
                      className={`py-1.5 px-2 rounded border font-semibold text-left flex items-center justify-between transition cursor-pointer ${
                        adjacentMode === 'all-track-clips'
                          ? 'bg-cyan-500 text-black border-cyan-400 font-bold shadow'
                          : 'bg-[#16161c] text-gray-300 border-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <span>All Track Joints ({trackClips.length})</span>
                      {adjacentMode === 'all-track-clips' && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Transition Preset Cards Grid */}
              <div className="bg-[#202026] p-3 rounded-lg border border-gray-800 space-y-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  SELECT TRANSITION EFFECT
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      id: 'dissolve',
                      name: 'Cross Dissolve',
                      desc: 'Smooth alpha cross blend',
                      icon: Blend,
                      color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/30'
                    },
                    {
                      id: 'fade',
                      name: 'Fade In / Out',
                      desc: 'Classic black/opacity dissolve',
                      icon: Zap,
                      color: 'text-amber-400 border-amber-500/40 bg-amber-950/30'
                    },
                    {
                      id: 'slide-left',
                      name: 'Slide Left',
                      desc: 'Horizontal entrance to left',
                      icon: ArrowLeft,
                      color: 'text-purple-400 border-purple-500/40 bg-purple-950/30'
                    },
                    {
                      id: 'slide-right',
                      name: 'Slide Right',
                      desc: 'Horizontal entrance to right',
                      icon: ArrowRight,
                      color: 'text-indigo-400 border-indigo-500/40 bg-indigo-950/30'
                    },
                    {
                      id: 'slide-up',
                      name: 'Slide Up',
                      desc: 'Vertical push upwards',
                      icon: ArrowUp,
                      color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30'
                    },
                    {
                      id: 'slide-down',
                      name: 'Slide Down',
                      desc: 'Vertical push downwards',
                      icon: ArrowDown,
                      color: 'text-teal-400 border-teal-500/40 bg-teal-950/30'
                    },
                    {
                      id: 'zoom',
                      name: 'Zoom Dissolve',
                      desc: 'Dynamic scale & opacity boom',
                      icon: Sparkles,
                      color: 'text-pink-400 border-pink-500/40 bg-pink-950/30'
                    },
                    {
                      id: 'wipe',
                      name: 'Sweep Wipe',
                      desc: 'Directional horizontal mask',
                      icon: Layers,
                      color: 'text-yellow-400 border-yellow-500/40 bg-yellow-950/30'
                    },
                  ].map((preset) => {
                    const isSelected = transType === preset.id;
                    const IconComp = preset.icon;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => setTransType(preset.id as TransitionType)}
                        className={`p-2.5 rounded-lg border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'border-cyan-400 bg-[#282834] shadow-[0_0_12px_rgba(6,182,212,0.35)] scale-[1.02]'
                            : 'border-gray-800 bg-[#16161c] hover:border-gray-600 hover:bg-[#1d1d26]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className={`p-1.5 rounded-md border ${preset.color}`}>
                            <IconComp className="w-3.5 h-3.5" />
                          </div>
                          {isSelected && (
                            <span className="p-0.5 rounded-full bg-cyan-500 text-black">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <div>
                          <p className={`text-[11px] font-bold ${isSelected ? 'text-cyan-300' : 'text-gray-200'}`}>
                            {preset.name}
                          </p>
                          <p className="text-[9px] text-gray-500 leading-tight line-clamp-1 mt-0.5">
                            {preset.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Transition Scope & Duration Controls */}
              <div className="bg-[#202026] p-3 rounded-lg border border-gray-800 space-y-3">
                {/* Duration Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-gray-400">
                    <span>Transition Duration</span>
                    <span className="font-mono text-cyan-400 font-bold">{transDuration.toFixed(1)}s</span>
                  </div>
                  <input
                    id="transition-duration-slider"
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.1"
                    value={transDuration}
                    onChange={(e) => setTransDuration(parseFloat(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="flex justify-between text-[8px] font-mono text-gray-600 px-0.5">
                    <button type="button" onClick={() => setTransDuration(0.5)} className="hover:text-cyan-400 cursor-pointer">0.5s Fast</button>
                    <button type="button" onClick={() => setTransDuration(1.0)} className="hover:text-cyan-400 cursor-pointer">1.0s Standard</button>
                    <button type="button" onClick={() => setTransDuration(2.0)} className="hover:text-cyan-400 cursor-pointer">2.0s Slow</button>
                  </div>
                </div>
              </div>

              {/* Actions & Apply Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  id="btn-apply-transition"
                  onClick={handleApplyTransition}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-cyan-950/50 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-black" />
                  <span>APPLY {transType.toUpperCase()} TO ADJACENT CLIPS</span>
                </button>

                <button
                  id="btn-auto-dissolve-all"
                  onClick={() => {
                    setAdjacentMode('all-track-clips');
                    setTransType('dissolve');
                    setTransDuration(0.8);
                    setTimeout(() => {
                      handleApplyTransition();
                    }, 0);
                  }}
                  className="w-full py-2 rounded-lg bg-[#22222a] hover:bg-[#2c2c36] text-cyan-300 font-bold text-[11px] border border-cyan-500/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Blend className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Auto-Apply Dissolve to All Track Clips</span>
                </button>

                {(selectedClip.transition?.type || selectedClip.videoEffects?.transition) && (
                  <button
                    id="btn-remove-transition"
                    onClick={handleClearTransition}
                    className="w-full py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 font-semibold text-[10px] border border-red-800/40 transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                    <span>Remove Transition & Video Effects Transition</span>
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {/* ------------------ TEXT CONTROLS ------------------ */}
        {isText && (
          <div className="space-y-4">
            {/* Text Editor content */}
            <div className="bg-[#202026] p-3 rounded-lg border border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold text-gray-400 tracking-wider flex items-center gap-1">
                  <Type className="w-3.5 h-3.5 text-purple-400" />
                  <span>EDIT SUBTITLE CONTENT</span>
                </h4>
                {selectedClip.confidenceScore !== undefined && (
                  <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1" title="Tasmeea Transcript Verification Score">
                    <Check className="w-3 h-3 text-emerald-400" />
                    TASMEEA {selectedClip.confidenceScore}% MATCH
                  </span>
                )}
              </div>
              <textarea
                id="text-content-textarea"
                rows={3}
                value={selectedClip.text || ''}
                onChange={(e) => onUpdateClip(selectedClip.id, { text: e.target.value })}
                className="w-full text-xs bg-[#16161c] border border-gray-800 rounded p-2 focus:outline-none focus:border-purple-500 font-sans text-gray-200"
              />
            </div>

            {/* Typography */}
            <div className="bg-[#202026] p-3 rounded-lg border border-gray-800 space-y-3">
              <h4 className="text-[10px] font-bold text-gray-400 tracking-wider flex items-center gap-1 uppercase">
                <span>Styling & Typography</span>
              </h4>

              {/* Font Family Dropdown */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  Font Family
                </label>
                <select
                  id="font-family-select"
                  value={selectedClip.fontFamily || 'Inter'}
                  onChange={(e) => onUpdateClip(selectedClip.id, { fontFamily: e.target.value })}
                  className="w-full bg-[#16161c] border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 font-sans"
                >
                  <optgroup label="🇵🇰 Urdu & Nastaliq Calligraphy">
                    <option value="Noto Nastaliq Urdu">🇵🇰 Noto Nastaliq Urdu (Traditional Calligraphy)</option>
                    <option value="Gulzar">🇵🇰 Gulzar (Modern Nastaliq Display)</option>
                    <option value="Lateef">🇵🇰 Lateef (Perso-Arabic Naskh-Nastaliq)</option>
                  </optgroup>
                  <optgroup label="🇮🇳 Hindi & Devanagari (हिन्दी)">
                    <option value="Noto Sans Devanagari">🇮🇳 Noto Sans Devanagari (Crisp Modern)</option>
                    <option value="Noto Serif Devanagari">🇮🇳 Noto Serif Devanagari (Classical Literary)</option>
                    <option value="Poppins">🇮🇳 Poppins (Devanagari & Latin Geometric)</option>
                    <option value="Rozha One">🇮🇳 Rozha One (Bold Editorial)</option>
                    <option value="Mukta">🇮🇳 Mukta (Contemporary Devanagari)</option>
                    <option value="Kalam">🇮🇳 Kalam (Handwritten Brush)</option>
                    <option value="Tiro Devanagari Hindi">🇮🇳 Tiro Devanagari Hindi (Formal Academic)</option>
                  </optgroup>
                  <optgroup label="🇧🇩 Bengali & Bangla (বাংলা)">
                    <option value="Noto Sans Bengali">🇧🇩 Noto Sans Bengali (Clear Modern)</option>
                    <option value="Noto Serif Bengali">🇧🇩 Noto Serif Bengali (Traditional Literary)</option>
                    <option value="Hind Siliguri">🇧🇩 Hind Siliguri (Clean Editorial Sans)</option>
                    <option value="Galada">🇧🇩 Galada (Bengali Cursive Display)</option>
                    <option value="Atma">🇧🇩 Atma (Charming Display)</option>
                    <option value="Tiro Bangla">🇧🇩 Tiro Bangla (Scholarly Bengali)</option>
                  </optgroup>
                  <optgroup label="🇮🇳 Tamil (தமிழ்)">
                    <option value="Noto Sans Tamil">🇮🇳 Noto Sans Tamil (Clean Sans)</option>
                    <option value="Noto Serif Tamil">🇮🇳 Noto Serif Tamil (Classic Serif)</option>
                    <option value="Mukta Malar">🇮🇳 Mukta Malar (Contemporary Tamil)</option>
                  </optgroup>
                  <optgroup label="🇮🇷 Persian & Farsi (فارسی)">
                    <option value="Vazirmatn">🇮🇷 Vazirmatn (Modern Persian UI)</option>
                    <option value="Lalezar">🇮🇷 Lalezar (Bold Vintage Poster Display)</option>
                  </optgroup>
                  <optgroup label="🇷🇺 Russian & Cyrillic (Русский)">
                    <option value="Cormorant Garamond">🇷🇺 Cormorant Garamond (Royal Classical Cyrillic)</option>
                    <option value="Merriweather">🇷🇺 Merriweather (High-Legibility Cyrillic Serif)</option>
                    <option value="Roboto Slab">🇷🇺 Roboto Slab (Punchy Modern Slab)</option>
                  </optgroup>
                  <optgroup label="🔤 English, Turkish, Indonesian & Latin Extended">
                    <option value="Inter">🇬🇧 Inter (Minimalist High-Legibility Sans)</option>
                    <option value="Outfit">🇹🇷 Outfit (Sleek Geometric Modern)</option>
                    <option value="Cinzel">👑 Cinzel (Royal Cinematic Classical)</option>
                    <option value="Cinzel Decorative">👑 Cinzel Decorative (Grand Capitals)</option>
                    <option value="Lora">📖 Lora (Contemporary Literary Serif)</option>
                    <option value="Montserrat">⚡ Montserrat (Bold High-Impact Sans)</option>
                    <option value="Playfair Display">✨ Playfair Display (Luxury Editorial Serif)</option>
                    <option value="Space Grotesk">🚀 Space Grotesk (Tech Modernist)</option>
                    <option value="JetBrains Mono">💻 JetBrains Mono (Technical Monospace)</option>
                  </optgroup>
                  <optgroup label="🕌 Arabic Scripture & Quranic Calligraphy">
                    <option value="QPC Uthmani Hafs">📖 QPC Uthmani Hafs (Quran.com Madinah Mushaf)</option>
                    <option value="Uthmani">📖 Uthmani (KFGQPC Madinah Mushaf Script)</option>
                    <option value="Amiri Quran">🕌 Amiri Quran (Classical Uthmani Scripture)</option>
                    <option value="KFGQPC Uthmanic Script HAFS">📜 KFGQPC Hafs Script (Official Mushaf)</option>
                    <option value="Noto Naskh Arabic">📜 Noto Naskh Arabic (Crisp Readable Naskh)</option>
                    <option value="Amiri">🕌 Amiri (Classical Calligraphic)</option>
                    <option value="Scheherazade New">🕌 Scheherazade New (Traditional Arabic)</option>
                    <option value="Reem Kufi">🕌 Reem Kufi (Geometric Kufic Modern)</option>
                  </optgroup>
                </select>
              </div>

              {/* Font size */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>Font Size</span>
                  <span className="font-mono">{selectedClip.fontSize || 24}px</span>
                </div>
                <input
                  id="font-size-slider"
                  type="range"
                  min="12"
                  max="100"
                  value={selectedClip.fontSize || 24}
                  onChange={(e) => onUpdateClip(selectedClip.id, { fontSize: parseInt(e.target.value) })}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
                />
              </div>

              {/* Color Selector */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-400">Font Color</span>
                <div className="flex items-center gap-2">
                  <input
                    id="text-color-picker"
                    type="color"
                    value={selectedClip.color || '#FFFFFF'}
                    onChange={(e) => onUpdateClip(selectedClip.id, { color: e.target.value })}
                    className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-[10px] text-gray-500 uppercase">{selectedClip.color || '#FFFFFF'}</span>
                </div>
              </div>

              {/* Color Palette (Color Plat) Presets */}
              <div className="space-y-1.5 pt-1.5 border-t border-gray-800">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cinematic Color Presets</span>
                <div className="grid grid-cols-5 gap-1.5 mt-1">
                  {[
                    { name: 'Imperial Gold', value: '#FFD700' },
                    { name: 'Rose Divine', value: '#FDA4AF' },
                    { name: 'Neon Emerald', value: '#10B981' },
                    { name: 'Royal Cyan', value: '#06B6D4' },
                    { name: 'Sunfire Orange', value: '#F97316' },
                    { name: 'Cosmic Violet', value: '#A855F7' },
                    { name: 'Chroma Green', value: '#00FF00' },
                    { name: 'Pristine White', value: '#FFFFFF' },
                    { name: 'Soft Ivory', value: '#FDFBF7' },
                    { name: 'Pure Silver', value: '#CBD5E1' }
                  ].map((preset) => {
                    const isActive = (selectedClip.color || '#FFFFFF').toUpperCase() === preset.value.toUpperCase();
                    return (
                      <button
                        key={preset.value}
                        title={preset.name}
                        onClick={() => onUpdateClip(selectedClip.id, { color: preset.value })}
                        className={`group relative h-7 rounded-md border flex items-center justify-center transition-all ${isActive ? 'border-purple-500 bg-[#252530] scale-105 shadow-md' : 'border-gray-800 bg-[#16161c] hover:border-gray-500'}`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full shadow-inner block"
                          style={{ backgroundColor: preset.value }}
                        />
                        {/* Tooltip */}
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 hidden group-hover:block bg-black text-[8px] text-white font-bold py-0.5 px-1 rounded shadow-lg whitespace-nowrap z-50">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Neon Glow Engine Controls */}
              <div className="space-y-2 pt-2 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wide">✨ Neon Glow Intensity</span>
                  <span className="font-mono text-[10px] text-cyan-300 font-bold">{selectedClip.textGlowIntensity ?? (selectedClip.textStyle === 'neon' ? 15 : 0)}px</span>
                </div>
                <input
                  id="neon-glow-slider"
                  type="range"
                  min="0"
                  max="60"
                  value={selectedClip.textGlowIntensity ?? (selectedClip.textStyle === 'neon' ? 15 : 0)}
                  onChange={(e) => onUpdateClip(selectedClip.id, { textGlowIntensity: parseInt(e.target.value) })}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-gray-400">Glow Aura Color</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      id="glow-color-picker"
                      type="color"
                      value={selectedClip.textGlowColor || selectedClip.color || '#00FFFF'}
                      onChange={(e) => onUpdateClip(selectedClip.id, { textGlowColor: e.target.value })}
                      className="w-5 h-5 rounded border-0 cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-[9px] text-gray-500 uppercase">{selectedClip.textGlowColor || selectedClip.color || '#00FFFF'}</span>
                  </div>
                </div>
              </div>

              {/* Stroke / Outline Boundary Pixels */}
              <div className="space-y-2 pt-2 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">🖋️ Stroke / Outline Thickness</span>
                  <span className="font-mono text-[10px] text-amber-300 font-bold">{selectedClip.textStrokeWidth ?? (selectedClip.textStyle === 'outline' ? 4 : 0)}px</span>
                </div>
                <input
                  id="stroke-width-slider"
                  type="range"
                  min="0"
                  max="20"
                  value={selectedClip.textStrokeWidth ?? (selectedClip.textStyle === 'outline' ? 4 : 0)}
                  onChange={(e) => onUpdateClip(selectedClip.id, { textStrokeWidth: parseInt(e.target.value) })}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-gray-400">Outline Boundary Color</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      id="stroke-color-picker"
                      type="color"
                      value={selectedClip.textStrokeColor || '#000000'}
                      onChange={(e) => onUpdateClip(selectedClip.id, { textStrokeColor: e.target.value })}
                      className="w-5 h-5 rounded border-0 cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-[9px] text-gray-500 uppercase">{selectedClip.textStrokeColor || '#000000'}</span>
                  </div>
                </div>
              </div>

              {/* Background Color & Padding */}
              <div className="space-y-2 pt-2 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wide">📦 Text Background Overlay</span>
                  <button
                    onClick={() => onUpdateClip(selectedClip.id, { 
                      textBackgroundColor: selectedClip.textBackgroundColor === 'transparent' ? '#000000' : 'transparent',
                      textBackgroundStyle: selectedClip.textBackgroundColor === 'transparent' ? (selectedClip.textBackgroundStyle || 'box') : 'none'
                    })}
                    className="text-[9px] bg-gray-800 hover:bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded transition"
                  >
                    {selectedClip.textBackgroundColor === 'transparent' || !selectedClip.textBackgroundColor ? 'Enable' : 'Disable'}
                  </button>
                </div>
                
                {selectedClip.textBackgroundColor && selectedClip.textBackgroundColor !== 'transparent' && (
                  <>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">Overlay Style</span>
                        <span className="font-mono text-[9px] text-purple-400 uppercase">{selectedClip.textBackgroundStyle || 'box'}</span>
                      </div>
                      <select
                        value={selectedClip.textBackgroundStyle || 'box'}
                        onChange={(e) => onUpdateClip(selectedClip.id, { textBackgroundStyle: e.target.value as any })}
                        className="w-full bg-[#18181c] border border-gray-700 rounded text-white text-[11px] px-2 py-1 focus:outline-none focus:border-purple-500"
                      >
                        <option value="box">Rounded Padding Box</option>
                        <option value="strip">Full-Width Strip (Quran.com Cinema)</option>
                        <option value="glow">Subtle Radial Glow</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-gray-400">Background Color</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          id="bg-color-picker"
                          type="color"
                          value={selectedClip.textBackgroundColor || '#000000'}
                          onChange={(e) => onUpdateClip(selectedClip.id, { textBackgroundColor: e.target.value })}
                          className="w-5 h-5 rounded border-0 cursor-pointer bg-transparent"
                        />
                        <span className="font-mono text-[9px] text-gray-500 uppercase">{selectedClip.textBackgroundColor || '#000000'}</span>
                      </div>
                    </div>

                    <div className="pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">Opacity</span>
                        <span className="font-mono text-[9px] text-gray-500">{Math.round((selectedClip.textBackgroundOpacity ?? 0.65) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={selectedClip.textBackgroundOpacity ?? 0.65}
                        onChange={(e) => onUpdateClip(selectedClip.id, { textBackgroundOpacity: parseFloat(e.target.value) })}
                        className="w-full h-1 mt-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
                      />
                    </div>
                    
                    <div className="pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">Padding</span>
                        <span className="font-mono text-[9px] text-gray-500">{selectedClip.textBackgroundPadding ?? 18}px</span>
                      </div>
                      <input
                        id="bg-padding-slider"
                        type="range"
                        min="0"
                        max="60"
                        value={selectedClip.textBackgroundPadding ?? 18}
                        onChange={(e) => onUpdateClip(selectedClip.id, { textBackgroundPadding: parseInt(e.target.value) })}
                        className="w-full h-1 mt-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
                      />
                    </div>

                    <div className="pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">Border Radius</span>
                        <span className="font-mono text-[9px] text-gray-500">{selectedClip.textBackgroundRadius ?? 20}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        value={selectedClip.textBackgroundRadius ?? 20}
                        onChange={(e) => onUpdateClip(selectedClip.id, { textBackgroundRadius: parseInt(e.target.value) })}
                        className="w-full h-1 mt-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Preset glow styles */}
              <div className="space-y-1 pt-2 border-t border-gray-800">
                <span className="text-[11px] text-gray-400">Quick FX Preset</span>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  {(['normal', 'shadow', 'outline', 'neon'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => onUpdateClip(selectedClip.id, { textStyle: style })}
                      className={`py-1 rounded text-[10px] font-bold capitalize border transition ${selectedClip.textStyle === style ? 'bg-purple-500 text-black border-purple-300' : 'bg-[#18181c] text-gray-400 border-gray-800 hover:text-white'}`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Screen layout adjustments */}
            <div className="bg-[#202026] p-3 rounded-lg border border-gray-800 space-y-3">
              <h4 className="text-[10px] font-bold text-gray-400 tracking-wider flex items-center gap-1 uppercase">
                <span>X/Y Coordinates</span>
              </h4>

              {/* X coordinate */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>Horizontal (X)</span>
                  <span className="font-mono">{selectedClip.textX ?? 50}%</span>
                </div>
                <input
                  id="text-x-slider"
                  type="range"
                  min="5"
                  max="95"
                  value={selectedClip.textX ?? 50}
                  onChange={(e) => onUpdateClip(selectedClip.id, { textX: parseInt(e.target.value) })}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
                />
              </div>

              {/* Y coordinate */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>Vertical (Y)</span>
                  <span className="font-mono">{selectedClip.textY ?? 50}%</span>
                </div>
                <input
                  id="text-y-slider"
                  type="range"
                  min="5"
                  max="95"
                  value={selectedClip.textY ?? 50}
                  onChange={(e) => onUpdateClip(selectedClip.id, { textY: parseInt(e.target.value) })}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
                />
              </div>
            </div>

            {/* ------------------ CapCut Text Animation Studio ------------------ */}
            <div className="bg-[#202026] p-3 rounded-lg border border-purple-500/30 space-y-3.5 shadow-lg">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-extrabold text-purple-300 tracking-wider flex items-center gap-1.5 uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                  <span>CapCut Text Animations</span>
                </h4>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/40 font-bold">
                  PRO FX
                </span>
              </div>

              {/* One-Click Presets */}
              {/* Custom Saved Presets */}
              <div className="space-y-2 pb-2 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wide flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Saved Animations
                  </span>
                  <button
                    onClick={() => setIsSavingPreset(!isSavingPreset)}
                    className="text-[9px] bg-cyan-900/50 hover:bg-cyan-800 text-cyan-300 px-2 py-0.5 rounded flex items-center gap-1 border border-cyan-700/50 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Save Current
                  </button>
                </div>
                
                {isSavingPreset && (
                  <div className="flex flex-col gap-1.5 bg-black/40 p-2 rounded border border-gray-800">
                    <input
                      type="text"
                      placeholder="Preset Name (e.g. Cinematic Glow)"
                      value={newPresetName}
                      onChange={e => setNewPresetName(e.target.value)}
                      className="w-full bg-transparent text-xs text-white px-2 py-1 outline-none border-b border-gray-600 focus:border-cyan-400"
                      autoFocus
                    />
                    <div className="flex gap-1.5 items-center justify-between mt-1">
                      <select 
                        value={newPresetCategory}
                        onChange={e => setNewPresetCategory(e.target.value)}
                        className="bg-gray-800 text-[10px] text-gray-200 px-1 py-1 rounded outline-none border border-gray-700 flex-1"
                      >
                        <option value="Quranic">🕌 Quranic</option>
                        <option value="Cinematic">🎬 Cinematic</option>
                        <option value="Viral">🔥 Viral</option>
                        <option value="Other">✨ Other</option>
                      </select>
                      <button
                        onClick={handleSavePreset}
                        className="text-[10px] bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 rounded font-bold"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsSavingPreset(false)}
                        className="text-[10px] bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {savedPresets.length > 0 && (
                  <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1">
                    {['All', 'Quranic', 'Cinematic', 'Viral', 'Other'].map(cat => {
                      const count = cat === 'All' ? savedPresets.length : savedPresets.filter(p => p.category === cat).length;
                      if (count === 0 && cat !== 'All') return null;
                      return (
                        <button
                          key={cat}
                          onClick={() => setPresetFilter(cat)}
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase transition whitespace-nowrap ${presetFilter === cat ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-[#1a1a20] text-gray-400 border border-transparent hover:text-white'}`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                )}

                {savedPresets.length > 0 ? (
                  <div className="grid grid-cols-2 gap-1.5 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
                    {savedPresets.filter(p => presetFilter === 'All' || p.category === presetFilter).map((preset) => (
                      <div key={preset.id} className="relative group">
                        <button
                          onClick={() => handleApplySavedPreset(preset)}
                          className="w-full text-left bg-[#1a1a20] hover:bg-cyan-900/30 border border-gray-700 hover:border-cyan-500/50 rounded p-1.5 transition-colors flex flex-col justify-center shadow-sm"
                        >
                          <span className="text-[10px] text-gray-200 font-medium truncate w-full pr-4">{preset.name}</span>
                          <span className="text-[8px] text-gray-500 font-mono mt-0.5 uppercase">{preset.category}</span>
                        </button>
                        <button
                          onClick={(e) => handleDeleteSavedPreset(e, preset.id)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:text-red-400 text-gray-500 p-1 transition-opacity bg-[#1a1a20] rounded"
                          title="Delete preset"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {savedPresets.filter(p => presetFilter === 'All' || p.category === presetFilter).length === 0 && (
                      <div className="col-span-2 text-[10px] text-gray-500 italic text-center py-2">No presets in this category</div>
                    )}
                  </div>
                ) : (
                  <div className="text-[10px] text-gray-500 italic text-center py-1">No saved presets yet</div>
                )}
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Quick CapCut Presets</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { name: '⚡ Pop & Bounce', inAnim: 'pop', loopAnim: 'bounce-loop', outAnim: 'fade' },
                    { name: '🎤 Karaoke Typewriter', inAnim: 'typewriter', loopAnim: 'shimmer', outAnim: 'fade' },
                    { name: '🚀 Viral Slide Up', inAnim: 'slide-up', loopAnim: 'pulse', outAnim: 'slide-down' },
                    { name: '🔮 Fade & Float', inAnim: 'fade', loopAnim: 'float', outAnim: 'fade' }
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => onUpdateClip(selectedClip.id, {
                        textAnimation: {
                          inAnimation: preset.inAnim as any,
                          inDuration: 0.4,
                          loopAnimation: preset.loopAnim as any,
                          outAnimation: preset.outAnim as any,
                          outDuration: 0.4
                        }
                      })}
                      className="px-2 py-1.5 rounded text-[10px] font-bold bg-[#16161c] text-purple-300 border border-purple-900/50 hover:border-purple-500 hover:bg-purple-950/40 transition text-left flex items-center justify-between"
                    >
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* IN Animations */}
              <div className="space-y-2 pt-2 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wide">In Animation (ورودی)</span>
                  <span className="text-[9px] font-mono text-gray-400 uppercase">{selectedClip.textAnimation?.inAnimation || 'none'}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { label: 'None', val: 'none' },
                    { label: 'Fade In', val: 'fade' },
                    { label: 'Pop In', val: 'pop' },
                    { label: 'Slide Up', val: 'slide-up' },
                    { label: 'Slide Down', val: 'slide-down' },
                    { label: 'Slide Left', val: 'slide-left' },
                    { label: 'Slide Right', val: 'slide-right' },
                    { label: 'Typewriter', val: 'typewriter' },
                    { label: 'Bounce', val: 'bounce' },
                    { label: 'Glitch', val: 'glitch' }
                  ].map((item) => {
                    const active = (selectedClip.textAnimation?.inAnimation || 'none') === item.val;
                    return (
                      <button
                        key={item.val}
                        onClick={() => {
                          const curr = selectedClip.textAnimation || {};
                          onUpdateClip(selectedClip.id, { textAnimation: { ...curr, inAnimation: item.val as any } });
                        }}
                        className={`py-1 rounded text-[9px] font-bold transition border ${active ? 'bg-emerald-500 text-black border-emerald-300 shadow' : 'bg-[#16161c] text-gray-300 border-gray-800 hover:text-white hover:border-gray-600'}`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                {/* In Duration */}
                {(selectedClip.textAnimation?.inAnimation && selectedClip.textAnimation.inAnimation !== 'none') && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                      <span>In Speed Duration</span>
                      <span>{(selectedClip.textAnimation?.inDuration ?? 0.4).toFixed(1)}s</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="2.0"
                      step="0.1"
                      value={selectedClip.textAnimation?.inDuration ?? 0.4}
                      onChange={(e) => {
                        const curr = selectedClip.textAnimation || {};
                        onUpdateClip(selectedClip.id, { textAnimation: { ...curr, inDuration: parseFloat(e.target.value) } });
                      }}
                      className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-emerald-400"
                    />
                  </div>
                )}
              </div>

              {/* OUT Animations */}
              <div className="space-y-2 pt-2 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wide">Out Animation (خروجی)</span>
                  <span className="text-[9px] font-mono text-gray-400 uppercase">{selectedClip.textAnimation?.outAnimation || 'none'}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { label: 'None', val: 'none' },
                    { label: 'Fade Out', val: 'fade' },
                    { label: 'Zoom Out', val: 'zoom-out' },
                    { label: 'Slide Down', val: 'slide-down' },
                    { label: 'Slide Up', val: 'slide-up' },
                    { label: 'Slide Left', val: 'slide-left' },
                    { label: 'Slide Right', val: 'slide-right' }
                  ].map((item) => {
                    const active = (selectedClip.textAnimation?.outAnimation || 'none') === item.val;
                    return (
                      <button
                        key={item.val}
                        onClick={() => {
                          const curr = selectedClip.textAnimation || {};
                          onUpdateClip(selectedClip.id, { textAnimation: { ...curr, outAnimation: item.val as any } });
                        }}
                        className={`py-1 rounded text-[9px] font-bold transition border ${active ? 'bg-rose-500 text-white border-rose-300 shadow' : 'bg-[#16161c] text-gray-300 border-gray-800 hover:text-white hover:border-gray-600'}`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                {/* Out Duration */}
                {(selectedClip.textAnimation?.outAnimation && selectedClip.textAnimation.outAnimation !== 'none') && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                      <span>Out Speed Duration</span>
                      <span>{(selectedClip.textAnimation?.outDuration ?? 0.4).toFixed(1)}s</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="2.0"
                      step="0.1"
                      value={selectedClip.textAnimation?.outDuration ?? 0.4}
                      onChange={(e) => {
                        const curr = selectedClip.textAnimation || {};
                        onUpdateClip(selectedClip.id, { textAnimation: { ...curr, outDuration: parseFloat(e.target.value) } });
                      }}
                      className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-rose-400"
                    />
                  </div>
                )}
              </div>

              {/* Loop Animations */}
              <div className="space-y-2 pt-2 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wide">Loop / Motion (مداوم)</span>
                  <span className="text-[9px] font-mono text-gray-400 uppercase">{selectedClip.textAnimation?.loopAnimation || 'none'}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { label: 'None', val: 'none' },
                    { label: 'Pulse', val: 'pulse' },
                    { label: 'Float', val: 'float' },
                    { label: 'Shimmer', val: 'shimmer' },
                    { label: 'Bounce Loop', val: 'bounce-loop' }
                  ].map((item) => {
                    const active = (selectedClip.textAnimation?.loopAnimation || 'none') === item.val;
                    return (
                      <button
                        key={item.val}
                        onClick={() => {
                          const curr = selectedClip.textAnimation || {};
                          onUpdateClip(selectedClip.id, { textAnimation: { ...curr, loopAnimation: item.val as any } });
                        }}
                        className={`py-1 rounded text-[9px] font-bold transition border ${active ? 'bg-cyan-500 text-black border-cyan-300 shadow' : 'bg-[#16161c] text-gray-300 border-gray-800 hover:text-white hover:border-gray-600'}`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Apply to ALL subtitles button */}
              {onBatchUpdateClips && tracks.length > 0 && (
                <div className="pt-2 border-t border-gray-800">
                  <button
                    onClick={() => {
                      const anim = selectedClip.textAnimation;
                      if (!anim) return;
                      const textTrack = tracks.find(t => t.id === selectedClip.trackId) || tracks.find(t => t.type === ClipType.TEXT);
                      if (textTrack) {
                        const batchUpdates = textTrack.clips.map(c => ({
                          id: c.id,
                          updates: { textAnimation: anim }
                        }));
                        onBatchUpdateClips(batchUpdates);
                      }
                    }}
                    className="w-full py-1.5 rounded text-[10px] font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                    <span>Apply Animation to ALL Text Clips</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
        </>
      )}
    </div>
  );
}
