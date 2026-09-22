import React, { useState } from 'react';
import { Sliders, Move, RotateCcw, Sparkles, Blend, Palette, Wand2, Eye, Sun, Droplet, Layers, Scissors, Heart, Square, Circle, Shield, FlipHorizontal, FlipVertical, Moon, Flame, ZoomIn, Gauge, CircleDot, Activity, Camera, Film, SunMedium, Compass, Wind, Play, Zap } from 'lucide-react';
import { Clip, VideoFilters, ColorGrading } from '../types';
import { ColorGradingSection } from './ColorGradingSection';
import { SpeedCurveEditor } from './SpeedCurveEditor';
import { PRESET_LUTS } from '../data/presetAssets';

interface CuteCutVideoInspectorProps {
  clip: Clip;
  onUpdateClip: (clipId: string, updates: Partial<Clip>) => void;
  currentTime?: number;
  onSeek?: (time: number) => void;
}

export const CuteCutVideoInspector: React.FC<CuteCutVideoInspectorProps> = ({
  clip,
  onUpdateClip,
  currentTime,
  onSeek,
}) => {
  const [mainTab, setMainTab] = useState<'video' | 'speed' | 'animation' | 'adjust'>('video');
  const [videoSubTab, setVideoSubTab] = useState<'basic' | 'removeBg' | 'mask' | 'retouch' | 'cinematic'>('basic');
  const [animSubTab, setAnimSubTab] = useState<'in' | 'out' | 'combo'>('in');
  const [adjustSubTab, setAdjustSubTab] = useState<'basic' | 'hsl' | 'curves' | 'colorWheel'>('basic');
  const [speedMode, setSpeedMode] = useState<'normal' | 'curve'>('normal');
  const [smoothSlowMo, setSmoothSlowMo] = useState(false);
  const [preservePitch, setPreservePitch] = useState(true);

  const currentOffset = currentTime !== undefined ? Math.max(0, Math.min(clip.duration, currentTime - clip.start)) : 0;
  const hasKeyframeAtCurrent = clip.keyframes?.some(k => Math.abs(k.timestamp - currentOffset) < 0.1);

  const toggleKeyframeAtCurrent = () => {
    const existing = clip.keyframes ? [...clip.keyframes] : [];
    const index = existing.findIndex(k => Math.abs(k.timestamp - currentOffset) < 0.1);
    if (index >= 0) {
      existing.splice(index, 1);
    } else {
      existing.push({
        id: `kf-${Date.now()}`,
        timestamp: Number(currentOffset.toFixed(2)),
        scale: clip.transform?.scale || 100,
        posX: clip.transform?.posX || 0,
        posY: clip.transform?.posY || 0,
        rotation: clip.transform?.rotation || 0,
        opacity: (clip.opacity ?? 1),
      });
      existing.sort((a, b) => a.timestamp - b.timestamp);
    }
    onUpdateClip(clip.id, { keyframes: existing });
  };

  const SPEED_PRESETS = [
    { id: 'custom', name: 'Custom', curve: [1.0, 1.0, 1.0, 1.0, 1.0], desc: 'Adjust velocity manually' },
    { id: 'montage', name: 'Montage', curve: [0.5, 2.5, 4.0, 0.4, 1.0], desc: 'High energy beat drops' },
    { id: 'hero', name: 'Hero', curve: [0.3, 3.2, 3.0, 0.2, 0.4], desc: 'Fast rush into freeze frame' },
    { id: 'bullet', name: 'Bullet', curve: [4.5, 4.5, 0.2, 0.2, 4.5], desc: 'Matrix style slow-motion' },
    { id: 'jump-cut', name: 'Jump Cut', curve: [1.0, 3.5, 1.0, 3.5, 1.0], desc: 'Rapid velocity pulses' },
    { id: 'flash-in', name: 'Flash In', curve: [5.0, 2.0, 1.0, 0.6, 0.4], desc: 'Fast intro deceleration' },
  ];

  const transform = clip.transform || { scale: 100, posX: 0, posY: 0, rotation: 0 };
  const filters = clip.filters || { brightness: 100, contrast: 100, saturation: 100, grayscale: 0, sepia: 0, invert: 0, hueRotate: 0, chromaKey: { enabled: false, color: '#00ff00', threshold: 40, smoothness: 10 } };
  const mask = clip.mask || { type: 'none', feather: 0, roundness: 0, inverted: false, size: 100 };
  const retouch = clip.retouch || { smooth: 0, brightEye: 0, teethWhite: 0, contours: 0 };
  const opacity = clip.opacity !== undefined ? Math.round(clip.opacity * 100) : 100;
  const blendMode = clip.blendMode || 'source-over';

  const BLEND_MODES = [
    { id: 'source-over', label: 'Normal' },
    { id: 'darken', label: 'Darken' },
    { id: 'multiply', label: 'Multiply' },
    { id: 'color-burn', label: 'Color Burn' },
    { id: 'lighten', label: 'Lighten' },
    { id: 'screen', label: 'Screen' },
    { id: 'color-dodge', label: 'Color Dodge' },
    { id: 'overlay', label: 'Overlay' },
    { id: 'soft-light', label: 'Soft Light' },
    { id: 'hard-light', label: 'Hard Light' },
    { id: 'difference', label: 'Difference' },
    { id: 'exclusion', label: 'Exclusion' },
  ];

  const MASK_PRESETS = [
    { id: 'none', name: 'None', icon: '⊘' },
    { id: 'split', name: 'Split', icon: '▌' },
    { id: 'filmstrip', name: 'Filmstrip', icon: '🎞️' },
    { id: 'circle', name: 'Circle', icon: '⭕' },
    { id: 'rectangle', name: 'Rectangle', icon: '▭' },
    { id: 'mirror', name: 'Mirror', icon: '🪞' },
    { id: 'heart', name: 'Heart', icon: '❤️' },
    { id: 'star', name: 'Star', icon: '⭐' },
  ];

  const IN_ANIMATIONS = [
    { id: 'fade-in', name: 'Fade In', icon: '🌅' },
    { id: 'zoom-in-1', name: 'Zoom 1', icon: '🔍' },
    { id: 'zoom-in-2', name: 'Zoom 2', icon: '🔎' },
    { id: 'slide-right', name: 'Slide Right', icon: '➡️' },
    { id: 'slide-left', name: 'Slide Left', icon: '⬅️' },
    { id: 'slide-up', name: 'Slide Up', icon: '⬆️' },
    { id: 'slide-down', name: 'Slide Down', icon: '⬇️' },
    { id: 'spin-in', name: 'Spin', icon: '🌀' },
    { id: 'bounce-in', name: 'Bounce', icon: '⚡' },
    { id: 'mini-zoom', name: 'Mini Zoom', icon: '✨' },
  ];

  const OUT_ANIMATIONS = [
    { id: 'fade-out', name: 'Fade Out', icon: '🌇' },
    { id: 'zoom-out', name: 'Zoom Out', icon: '🔎' },
    { id: 'slide-out-left', name: 'Slide Left', icon: '⬅️' },
    { id: 'slide-out-right', name: 'Slide Right', icon: '➡️' },
    { id: 'spin-out', name: 'Spin Out', icon: '🌀' },
  ];

  const COMBO_ANIMATIONS = [
    { id: 'rock-vert', name: 'Rock Vertical', icon: '🌊' },
    { id: 'pendulum', name: 'Pendulum', icon: '🕰️' },
    { id: 'flash-white', name: 'Flash White', icon: '⚡' },
    { id: 'wobble', name: 'Wobble', icon: '📳' },
  ];

  return (
    <div className="flex flex-col h-full select-none text-gray-300">
      {/* Top Main Tabs: Video | Speed | Animation | Adjust */}
      <div className="flex border-b border-[#23232b] bg-[#141418] px-3 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setMainTab('video')}
          className={`px-4 py-2.5 text-xs font-semibold tracking-wide transition border-b-2 whitespace-nowrap ${
            mainTab === 'video'
              ? 'text-cyan-400 border-cyan-400 bg-[#1a1a22]'
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          {clip.type === 'image' ? 'Image' : 'Video'}
        </button>
        <button
          onClick={() => setMainTab('speed')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold tracking-wide transition border-b-2 whitespace-nowrap ${
            mainTab === 'speed'
              ? 'text-cyan-400 border-cyan-400 bg-[#1a1a22]'
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          <span>Speed</span>
        </button>
        <button
          onClick={() => setMainTab('animation')}
          className={`px-4 py-2.5 text-xs font-semibold tracking-wide transition border-b-2 whitespace-nowrap ${
            mainTab === 'animation'
              ? 'text-cyan-400 border-cyan-400 bg-[#1a1a22]'
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          Animation
        </button>
        <button
          onClick={() => setMainTab('adjust')}
          className={`px-4 py-2.5 text-xs font-semibold tracking-wide transition border-b-2 whitespace-nowrap ${
            mainTab === 'adjust'
              ? 'text-cyan-400 border-cyan-400 bg-[#1a1a22]'
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          Adjust
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
        
        {/* ================= VIDEO TAB ================= */}
        {mainTab === 'video' && (
          <div className="space-y-4">
            {/* Subtabs: Basic | Remove BG | Mask | Retouch | Cinematic & 3D */}
            <div className="flex border-b border-[#262633] pb-1 gap-2 overflow-x-auto custom-scrollbar">
              <button
                onClick={() => setVideoSubTab('basic')}
                className={`text-[11px] pb-1 font-semibold transition whitespace-nowrap ${
                  videoSubTab === 'basic' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Basic
              </button>
              <button
                onClick={() => setVideoSubTab('removeBg')}
                className={`text-[11px] pb-1 font-semibold transition whitespace-nowrap ${
                  videoSubTab === 'removeBg' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Remove BG
              </button>
              <button
                onClick={() => setVideoSubTab('mask')}
                className={`text-[11px] pb-1 font-semibold transition whitespace-nowrap ${
                  videoSubTab === 'mask' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Mask
              </button>
              <button
                onClick={() => setVideoSubTab('retouch')}
                className={`text-[11px] pb-1 font-semibold transition whitespace-nowrap ${
                  videoSubTab === 'retouch' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Retouch
              </button>
              <button
                onClick={() => setVideoSubTab('cinematic')}
                className={`text-[11px] pb-1 font-semibold transition whitespace-nowrap flex items-center gap-1 ${
                  videoSubTab === 'cinematic' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Cinematic & 3D</span>
              </button>
            </div>

            {/* Subtab: BASIC */}
            {videoSubTab === 'basic' && (
              <div className="space-y-4">
                {/* Transform: Scale, Position, Rotate */}
                <div className="bg-[#1a1a22] p-3.5 rounded-lg border border-[#262633] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-200 flex items-center gap-1.5">
                      <Move className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Transform</span>
                    </div>
                    <button
                      onClick={toggleKeyframeAtCurrent}
                      title={hasKeyframeAtCurrent ? "Delete keyframe at current playhead" : "Add keyframe at current playhead"}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                        hasKeyframeAtCurrent
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/30'
                          : 'bg-[#121217] border-gray-700 text-gray-400 hover:text-cyan-400 hover:border-cyan-500'
                      }`}
                    >
                      <CircleDot className={`w-3 h-3 ${hasKeyframeAtCurrent ? 'text-cyan-400 animate-pulse' : 'text-gray-500'}`} />
                      <span>{hasKeyframeAtCurrent ? 'Keyframe Set' : '+ Keyframe'}</span>
                    </button>
                  </div>
                  
                  {/* Scale */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Scale</span>
                      <span className="font-mono text-cyan-400 font-bold">{transform.scale || 100}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="300"
                      value={transform.scale || 100}
                      onChange={(e) =>
                        onUpdateClip(clip.id, {
                          transform: { ...transform, scale: parseInt(e.target.value) },
                        })
                      }
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* Position X & Y */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="space-y-1">
                      <span className="text-gray-400 text-[10px]">Position X</span>
                      <input
                        type="number"
                        value={transform.posX || 0}
                        onChange={(e) =>
                          onUpdateClip(clip.id, {
                            transform: { ...transform, posX: parseInt(e.target.value) || 0 },
                          })
                        }
                        className="w-full bg-[#121217] border border-gray-800 rounded px-2 py-1 text-center font-mono text-gray-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-gray-400 text-[10px]">Position Y</span>
                      <input
                        type="number"
                        value={transform.posY || 0}
                        onChange={(e) =>
                          onUpdateClip(clip.id, {
                            transform: { ...transform, posY: parseInt(e.target.value) || 0 },
                          })
                        }
                        className="w-full bg-[#121217] border border-gray-800 rounded px-2 py-1 text-center font-mono text-gray-200"
                      />
                    </div>
                  </div>

                  {/* Rotate */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Rotate</span>
                      <span className="font-mono text-cyan-400">{transform.rotation || 0}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={transform.rotation || 0}
                      onChange={(e) =>
                        onUpdateClip(clip.id, {
                          transform: { ...transform, rotation: parseInt(e.target.value) },
                        })
                      }
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* Flip & Mirror Controls */}
                  <div className="pt-2 border-t border-[#262633] space-y-1.5">
                    <span className="text-gray-400 text-[10px]">Orientation & Flip</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() =>
                          onUpdateClip(clip.id, {
                            videoEffects: {
                              ...clip.videoEffects,
                              flipHorizontal: !clip.videoEffects?.flipHorizontal,
                            },
                          })
                        }
                        className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-medium border transition ${
                          clip.videoEffects?.flipHorizontal
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                            : 'bg-[#121217] border-gray-800 text-gray-300 hover:border-gray-700'
                        }`}
                      >
                        <FlipHorizontal className="w-3.5 h-3.5" />
                        <span>Flip H</span>
                      </button>

                      <button
                        onClick={() =>
                          onUpdateClip(clip.id, {
                            videoEffects: {
                              ...clip.videoEffects,
                              flipVertical: !clip.videoEffects?.flipVertical,
                            },
                          })
                        }
                        className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-medium border transition ${
                          clip.videoEffects?.flipVertical
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                            : 'bg-[#121217] border-gray-800 text-gray-300 hover:border-gray-700'
                        }`}
                      >
                        <FlipVertical className="w-3.5 h-3.5" />
                        <span>Flip V</span>
                      </button>

                      <button
                        onClick={() =>
                          onUpdateClip(clip.id, {
                            transform: { scale: 100, posX: 0, posY: 0, rotation: 0 },
                            videoEffects: {
                              ...clip.videoEffects,
                              flipHorizontal: false,
                              flipVertical: false,
                            },
                          })
                        }
                        className="flex items-center justify-center gap-1 py-1.5 px-2 rounded text-xs font-medium border border-gray-800 bg-[#121217] text-gray-400 hover:text-gray-200"
                        title="Reset Transform"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Dark Dimmer Overlay (Quran Text Readability) */}
                <div className="bg-[#1a1a22] p-3.5 rounded-lg border border-[#262633] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-semibold text-gray-200">
                      <Moon className="w-4 h-4 text-indigo-400" />
                      <span>Background Dimmer</span>
                    </div>
                    <span className="font-mono text-cyan-400 font-bold text-xs">
                      {clip.videoEffects?.darkDimmerOverlay ?? 0}%
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-tight">
                    Darken background video/photo so Arabic ayah text and subtitles pop with maximum contrast.
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="5"
                    value={clip.videoEffects?.darkDimmerOverlay ?? 0}
                    onChange={(e) =>
                      onUpdateClip(clip.id, {
                        videoEffects: {
                          ...clip.videoEffects,
                          darkDimmerOverlay: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                  />
                  <div className="flex gap-1">
                    {[
                      { label: 'Off', val: 0 },
                      { label: '20% Soft', val: 20 },
                      { label: '40% Cinema', val: 40 },
                      { label: '65% Focus', val: 65 },
                    ].map((p) => (
                      <button
                        key={p.val}
                        onClick={() =>
                          onUpdateClip(clip.id, {
                            videoEffects: {
                              ...clip.videoEffects,
                              darkDimmerOverlay: p.val,
                            },
                          })
                        }
                        className={`flex-1 py-1 rounded text-[10px] font-medium border transition ${
                          (clip.videoEffects?.darkDimmerOverlay ?? 0) === p.val
                            ? 'bg-indigo-950/60 border-indigo-400 text-indigo-200'
                            : 'bg-[#121217] border-gray-800 text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ken Burns Motion Effect (For Images & Backgrounds) */}
                <div className="bg-[#1a1a22] p-3.5 rounded-lg border border-[#262633] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-semibold text-gray-200">
                      <ZoomIn className="w-4 h-4 text-emerald-400" />
                      <span>Ken Burns Camera Motion</span>
                    </div>
                    {clip.videoEffects?.kenBurns?.enabled && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 leading-tight">
                    Smooth cinematic camera pan and zoom movement across images and static footage.
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'none', label: 'None' },
                      { id: 'zoom-in', label: 'Zoom In 🔍' },
                      { id: 'zoom-out', label: 'Zoom Out 🔎' },
                      { id: 'pan-left', label: 'Pan Left ⬅️' },
                      { id: 'pan-right', label: 'Pan Right ➡️' },
                    ].map((kb) => {
                      const isCurrent = kb.id === 'none'
                        ? !clip.videoEffects?.kenBurns?.enabled
                        : (clip.videoEffects?.kenBurns?.enabled && clip.videoEffects?.kenBurns?.style === kb.id);

                      return (
                        <button
                          key={kb.id}
                          onClick={() => {
                            if (kb.id === 'none') {
                              onUpdateClip(clip.id, {
                                videoEffects: {
                                  ...clip.videoEffects,
                                  kenBurns: { enabled: false, style: 'zoom-in' },
                                },
                              });
                            } else {
                              onUpdateClip(clip.id, {
                                videoEffects: {
                                  ...clip.videoEffects,
                                  kenBurns: { enabled: true, style: kb.id as any },
                                },
                              });
                            }
                          }}
                          className={`py-1.5 px-2 rounded text-xs font-medium border text-center transition ${
                            isCurrent
                              ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200'
                              : 'bg-[#121217] border-gray-800 text-gray-400 hover:text-white'
                          }`}
                        >
                          {kb.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Blend Mode & Opacity */}
                <div className="bg-[#1a1a22] p-3.5 rounded-lg border border-[#262633] space-y-3">
                  <div className="font-semibold text-gray-200">Blend</div>
                  
                  {/* Blend Mode Dropdown */}
                  <div className="space-y-1">
                    <span className="text-gray-400 text-[10px]">Blend Mode</span>
                    <select
                      value={blendMode}
                      onChange={(e) => onUpdateClip(clip.id, { blendMode: e.target.value })}
                      className="w-full bg-[#121217] border border-gray-800 rounded p-1.5 text-xs text-gray-200 focus:outline-none focus:border-cyan-500"
                    >
                      {BLEND_MODES.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Opacity Slider */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Opacity</span>
                      <span className="font-mono text-cyan-400 font-bold">{opacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={opacity}
                      onChange={(e) => onUpdateClip(clip.id, { opacity: parseInt(e.target.value) / 100 })}
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                </div>

                {/* Stabilize & Noise Reduction Switches */}
                <div className="bg-[#1a1a22] p-3.5 rounded-lg border border-[#262633] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-200">Enhance quality</div>
                      <div className="text-[10px] text-gray-400">Reduce video noise and sharpen edges</div>
                    </div>
                    <button
                      onClick={() =>
                        onUpdateClip(clip.id, {
                          videoEffects: {
                            ...clip.videoEffects,
                            upscaler4k: !clip.videoEffects?.upscaler4k,
                          },
                        })
                      }
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                        clip.videoEffects?.upscaler4k ? 'bg-cyan-500 justify-end' : 'bg-gray-700 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Subtab: REMOVE BG */}
            {videoSubTab === 'removeBg' && (
              <div className="space-y-4">
                {/* Auto Removal */}
                <div className="bg-[#1a1a22] p-3.5 rounded-lg border border-[#262633] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-200">Auto removal</div>
                      <div className="text-[10px] text-gray-400">One-click AI portrait background cutout</div>
                    </div>
                    <button
                      onClick={() => {
                        const isAuto = filters.chromaKey?.enabled && filters.chromaKey?.color === 'auto';
                        onUpdateClip(clip.id, {
                          filters: {
                            ...filters,
                            chromaKey: {
                              enabled: !isAuto,
                              color: 'auto',
                              threshold: 50,
                              smoothness: 20,
                            },
                          },
                        });
                      }}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                        filters.chromaKey?.enabled && filters.chromaKey?.color === 'auto'
                          ? 'bg-cyan-500 justify-end'
                          : 'bg-gray-700 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                    </button>
                  </div>
                </div>

                {/* Chroma Key */}
                <div className="bg-[#1a1a22] p-3.5 rounded-lg border border-[#262633] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-200">Chroma key</div>
                    <button
                      onClick={() =>
                        onUpdateClip(clip.id, {
                          filters: {
                            ...filters,
                            chromaKey: {
                              enabled: !filters.chromaKey?.enabled,
                              color: filters.chromaKey?.color || '#00ff00',
                              threshold: filters.chromaKey?.threshold || 40,
                              smoothness: filters.chromaKey?.smoothness || 10,
                            },
                          },
                        })
                      }
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                        filters.chromaKey?.enabled && filters.chromaKey?.color !== 'auto'
                          ? 'bg-cyan-500 justify-end'
                          : 'bg-gray-700 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                    </button>
                  </div>

                  {filters.chromaKey?.enabled && filters.chromaKey?.color !== 'auto' && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Key Color</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={filters.chromaKey.color || '#00ff00'}
                            onChange={(e) =>
                              onUpdateClip(clip.id, {
                                filters: {
                                  ...filters,
                                  chromaKey: { ...filters.chromaKey, color: e.target.value },
                                },
                              })
                            }
                            className="w-7 h-7 rounded border border-gray-700 bg-transparent cursor-pointer"
                          />
                          <span className="font-mono text-[11px] text-gray-300">
                            {filters.chromaKey.color}
                          </span>
                        </div>
                      </div>

                      {/* Threshold / Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-gray-400 text-[10px]">
                          <span>Strength</span>
                          <span className="font-mono text-cyan-400">{filters.chromaKey.threshold}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={filters.chromaKey.threshold}
                          onChange={(e) =>
                            onUpdateClip(clip.id, {
                              filters: {
                                ...filters,
                                chromaKey: {
                                  ...filters.chromaKey,
                                  threshold: parseInt(e.target.value),
                                },
                              },
                            })
                          }
                          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>

                      {/* Smoothness */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-gray-400 text-[10px]">
                          <span>Shadow / Smoothness</span>
                          <span className="font-mono text-cyan-400">{filters.chromaKey.smoothness}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={filters.chromaKey.smoothness}
                          onChange={(e) =>
                            onUpdateClip(clip.id, {
                              filters: {
                                ...filters,
                                chromaKey: {
                                  ...filters.chromaKey,
                                  smoothness: parseInt(e.target.value),
                                },
                              },
                            })
                          }
                          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Subtab: MASK */}
            {videoSubTab === 'mask' && (
              <div className="space-y-4">
                <div className="bg-[#1a1a22] p-3.5 rounded-lg border border-[#262633] space-y-3">
                  <div className="font-semibold text-gray-200">Add Mask</div>
                  <div className="grid grid-cols-4 gap-2">
                    {MASK_PRESETS.map((m) => {
                      const isSelected = (mask.type || 'none') === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() =>
                            onUpdateClip(clip.id, {
                              mask: { ...mask, type: m.id as any },
                            })
                          }
                          className={`p-2 rounded-lg border text-center flex flex-col items-center justify-center gap-1 transition ${
                            isSelected
                              ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                              : 'border-[#262633] bg-[#121217] text-gray-400 hover:border-gray-600 hover:text-white'
                          }`}
                        >
                          <span className="text-lg">{m.icon}</span>
                          <span className="text-[10px] font-medium">{m.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {mask.type && mask.type !== 'none' && (
                  <div className="bg-[#1a1a22] p-3.5 rounded-lg border border-[#262633] space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Feather (Blur)</span>
                      <span className="font-mono text-cyan-400">{mask.feather || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={mask.feather || 0}
                      onChange={(e) =>
                        onUpdateClip(clip.id, {
                          mask: { ...mask, feather: parseInt(e.target.value) },
                        })
                      }
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />

                    <div className="flex items-center justify-between pt-2 border-t border-[#262633]">
                      <span className="text-gray-300">Invert Mask</span>
                      <button
                        onClick={() =>
                          onUpdateClip(clip.id, {
                            mask: { ...mask, inverted: !mask.inverted },
                          })
                        }
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                          mask.inverted ? 'bg-cyan-500 justify-end' : 'bg-gray-700 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                      </button>
                    </div>

                    {/* Mask Size Slider */}
                    <div className="space-y-1 pt-2 border-t border-[#262633]">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-300">Mask Scale</span>
                        <span className="font-mono text-cyan-400">{mask.size || 100}%</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="250"
                        value={mask.size || 100}
                        onChange={(e) =>
                          onUpdateClip(clip.id, {
                            mask: { ...mask, size: parseInt(e.target.value) },
                          })
                        }
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Subtab: RETOUCH */}
            {videoSubTab === 'retouch' && (
              <div className="space-y-4">
                <div className="bg-[#1a1a22] p-3.5 rounded-lg border border-[#262633] space-y-3">
                  <div className="font-semibold text-gray-200">Face Retouch</div>

                  {/* Smooth Skin */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-gray-300">
                      <span>Smooth</span>
                      <span className="font-mono text-cyan-400">{retouch.smooth || 0}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={retouch.smooth || 0}
                      onChange={(e) =>
                        onUpdateClip(clip.id, {
                          retouch: { ...retouch, smooth: parseInt(e.target.value) },
                        })
                      }
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* Bright Eye */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-gray-300">
                      <span>Bright Eye</span>
                      <span className="font-mono text-cyan-400">{retouch.brightEye || 0}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={retouch.brightEye || 0}
                      onChange={(e) =>
                        onUpdateClip(clip.id, {
                          retouch: { ...retouch, brightEye: parseInt(e.target.value) },
                        })
                      }
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* Teeth Whitening */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-gray-300">
                      <span>Teeth Whitening</span>
                      <span className="font-mono text-cyan-400">{retouch.teethWhite || 0}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={retouch.teethWhite || 0}
                      onChange={(e) =>
                        onUpdateClip(clip.id, {
                          retouch: { ...retouch, teethWhite: parseInt(e.target.value) },
                        })
                      }
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Subtab: CINEMATIC & 3D STUDIO */}
            {videoSubTab === 'cinematic' && (
              <div className="space-y-4">
                {/* Ken Burns Dynamic Pan & Zoom */}
                <div className="bg-[#1a1a22] p-3.5 rounded-lg border border-[#262633] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                      <Camera className="w-4 h-4 text-amber-400" />
                      <span>Ken Burns Pan & Zoom</span>
                    </div>
                    <button
                      onClick={() =>
                        onUpdateClip(clip.id, {
                          videoEffects: {
                            ...clip.videoEffects,
                            kenBurns: {
                              enabled: !clip.videoEffects?.kenBurns?.enabled,
                              style: clip.videoEffects?.kenBurns?.style || 'zoom-in',
                            },
                          },
                        })
                      }
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                        clip.videoEffects?.kenBurns?.enabled ? 'bg-amber-500 justify-end' : 'bg-gray-700 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400">
                    Brings static photos and recitations to life with cinematic slow-motion focal movement.
                  </p>
                  {clip.videoEffects?.kenBurns?.enabled && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {[
                        { id: 'zoom-in', label: 'Slow Zoom In', icon: '🔍' },
                        { id: 'zoom-out', label: 'Slow Zoom Out', icon: '🔎' },
                        { id: 'pan-left', label: 'Pan Left to Right', icon: '➡️' },
                        { id: 'pan-right', label: 'Pan Right to Left', icon: '⬅️' },
                      ].map((style) => (
                        <button
                          key={style.id}
                          onClick={() =>
                            onUpdateClip(clip.id, {
                              videoEffects: {
                                ...clip.videoEffects,
                                kenBurns: {
                                  enabled: true,
                                  style: style.id as any,
                                },
                              },
                            })
                          }
                          className={`p-2 rounded text-[11px] font-medium border flex items-center gap-1.5 transition ${
                            clip.videoEffects?.kenBurns?.style === style.id
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                              : 'bg-[#121217] border-gray-800 text-gray-300 hover:border-gray-700'
                          }`}
                        >
                          <span>{style.icon}</span>
                          <span>{style.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3D Perspective & Spatial Tilt */}
                <div className="bg-[#1a1a22] p-3.5 rounded-lg border border-[#262633] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-semibold text-cyan-300">
                      <Compass className="w-4 h-4 text-cyan-400" />
                      <span>3D Spatial Rotation</span>
                    </div>
                    <span className="font-mono text-[10px] text-cyan-400">XYZ Axes</span>
                  </div>
                  
                  {/* Rotation Angle */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-gray-300">
                      <span>Z-Rotation</span>
                      <span className="font-mono text-cyan-400">{transform.rotation || 0}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={transform.rotation || 0}
                      onChange={(e) =>
                        onUpdateClip(clip.id, {
                          transform: { ...transform, rotation: parseInt(e.target.value) },
                        })
                      }
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* Flip Orientation */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() =>
                        onUpdateClip(clip.id, {
                          videoEffects: {
                            ...clip.videoEffects,
                            flipHorizontal: !clip.videoEffects?.flipHorizontal,
                          },
                        })
                      }
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded border text-[11px] font-medium transition ${
                        clip.videoEffects?.flipHorizontal
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-[#121217] border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      <FlipHorizontal className="w-3.5 h-3.5" />
                      <span>Flip Horizontal</span>
                    </button>
                    <button
                      onClick={() =>
                        onUpdateClip(clip.id, {
                          videoEffects: {
                            ...clip.videoEffects,
                            flipVertical: !clip.videoEffects?.flipVertical,
                          },
                        })
                      }
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded border text-[11px] font-medium transition ${
                        clip.videoEffects?.flipVertical
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-[#121217] border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      <FlipVertical className="w-3.5 h-3.5" />
                      <span>Flip Vertical</span>
                    </button>
                  </div>
                </div>

                {/* Islamic Noor, Rays & Sacred Atmosphere FX */}
                <div className="bg-[#1a1a22] p-3.5 rounded-lg border border-[#262633] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                      <SunMedium className="w-4 h-4 text-amber-400" />
                      <span>Divine Noor & Light FX</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'noorRays', label: 'Noor Sunbeams', icon: '✨' },
                      { key: 'goldenDust', label: 'Golden Dust', icon: '🌟' },
                      { key: 'dreamyGlow', label: 'Dreamy Soft Glow', icon: '🌙' },
                      { key: 'upscaler4k', label: '4K AI Sharpness', icon: '⚡' },
                    ].map((fx) => {
                      const isActive = Boolean((clip.videoEffects as any)?.[fx.key]);
                      return (
                        <button
                          key={fx.key}
                          onClick={() =>
                            onUpdateClip(clip.id, {
                              videoEffects: {
                                ...clip.videoEffects,
                                [fx.key]: !isActive,
                              },
                            })
                          }
                          className={`p-2 rounded text-[11px] font-medium border flex items-center justify-between transition ${
                            isActive
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                              : 'bg-[#121217] border-gray-800 text-gray-400 hover:text-gray-200'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span>{fx.icon}</span>
                            <span>{fx.label}</span>
                          </span>
                          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-amber-400' : 'bg-gray-700'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= SPEED TAB (NORMAL & CURVE SPEED RAMPING) ================= */}
        {mainTab === 'speed' && (
          <div className="space-y-4">
            {/* Sub-mode switcher: Normal vs Curve */}
            <div className="flex bg-[#121217] p-1 rounded-lg border border-[#262633]">
              <button
                onClick={() => setSpeedMode('normal')}
                className={`flex-1 py-1.5 rounded text-xs font-semibold transition ${
                  speedMode === 'normal' ? 'bg-cyan-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                Normal Speed
              </button>
              <button
                onClick={() => setSpeedMode('curve')}
                className={`flex-1 py-1.5 rounded text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                  speedMode === 'curve' ? 'bg-cyan-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Curve (Speed Ramping)</span>
              </button>
            </div>

            {/* NORMAL SPEED */}
            {speedMode === 'normal' && (
              <div className="space-y-4">
                <div className="bg-[#1a1a22] p-4 rounded-lg border border-[#262633] space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-200 font-semibold">Speed Multiplier</span>
                    <span className="font-mono text-cyan-400 font-bold text-base">
                      {(clip.playbackRate || 1.0).toFixed(2)}x
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0.1"
                    max="10.0"
                    step="0.05"
                    value={clip.playbackRate || 1.0}
                    onChange={(e) => onUpdateClip(clip.id, { playbackRate: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center justify-between gap-1 pt-1">
                    {[0.25, 0.5, 1.0, 1.5, 2.0, 4.0, 8.0].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => onUpdateClip(clip.id, { playbackRate: rate })}
                        className={`px-2 py-1 rounded text-[10px] font-mono font-bold border transition ${
                          Math.abs((clip.playbackRate || 1.0) - rate) < 0.05
                            ? 'bg-cyan-400 text-black border-cyan-300'
                            : 'bg-[#121217] text-gray-400 border-gray-800 hover:text-white hover:border-gray-700'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>

                  {/* Effective Duration Info */}
                  <div className="flex justify-between items-center text-[11px] pt-2 border-t border-[#262633] text-gray-400">
                    <span>Source Duration: {clip.sourceDuration ? `${clip.sourceDuration.toFixed(1)}s` : `${clip.duration.toFixed(1)}s`}</span>
                    <span className="text-cyan-400 font-mono font-semibold">
                      Effective: {((clip.duration || 1) / (clip.playbackRate || 1.0)).toFixed(1)}s
                    </span>
                  </div>
                </div>

                {/* Professional Engine Toggles */}
                <div className="bg-[#1a1a22] p-3.5 rounded-lg border border-[#262633] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-200 font-medium text-xs">Smooth Slow-Mo (AI Optical Flow)</div>
                      <div className="text-[10px] text-gray-400">AI frame blending for silky stutter-free 0.2x slow-mo</div>
                    </div>
                    <button
                      onClick={() => setSmoothSlowMo(!smoothSlowMo)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                        smoothSlowMo ? 'bg-cyan-500 justify-end' : 'bg-gray-700 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#262633]">
                    <div>
                      <div className="text-gray-200 font-medium text-xs">Maintain Audio Pitch</div>
                      <div className="text-[10px] text-gray-400">Prevents chipmunk or monster voice when speed changes</div>
                    </div>
                    <button
                      onClick={() => setPreservePitch(!preservePitch)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                        preservePitch ? 'bg-cyan-500 justify-end' : 'bg-gray-700 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CURVE SPEED RAMPING (CapCut Style Interactive Bezier Editor) */}
            {speedMode === 'curve' && (
              <SpeedCurveEditor
                clip={clip}
                onUpdateClip={onUpdateClip}
                currentTime={currentTime}
                onSeek={onSeek}
              />
            )}
          </div>
        )}

        {/* ================= ANIMATION TAB ================= */}
        {mainTab === 'animation' && (
          <div className="space-y-4">
            {/* Subtabs: In | Out | Combo */}
            <div className="flex border-b border-[#262633] pb-1 gap-2">
              <button
                onClick={() => setAnimSubTab('in')}
                className={`text-[11px] pb-1 font-semibold transition ${
                  animSubTab === 'in' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                In
              </button>
              <button
                onClick={() => setAnimSubTab('out')}
                className={`text-[11px] pb-1 font-semibold transition ${
                  animSubTab === 'out' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Out
              </button>
              <button
                onClick={() => setAnimSubTab('combo')}
                className={`text-[11px] pb-1 font-semibold transition ${
                  animSubTab === 'combo' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Combo
              </button>
            </div>

            {/* Animation Duration */}
            <div className="bg-[#1a1a22] p-3 rounded-lg border border-[#262633] space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Animation Duration</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {(clip.videoEffects?.transitionDuration || 0.5).toFixed(1)}s
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max={Math.max(0.5, Math.min(5.0, clip.duration))}
                step="0.1"
                value={clip.videoEffects?.transitionDuration || 0.5}
                onChange={(e) =>
                  onUpdateClip(clip.id, {
                    videoEffects: {
                      ...clip.videoEffects,
                      transitionDuration: parseFloat(e.target.value),
                    },
                  })
                }
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-3 gap-2">
              {(animSubTab === 'in' ? IN_ANIMATIONS : animSubTab === 'out' ? OUT_ANIMATIONS : COMBO_ANIMATIONS).map(
                (anim) => {
                  const isSelected =
                    (animSubTab === 'in' && clip.videoEffects?.transitionIn === (anim.id as any)) ||
                    (animSubTab === 'out' && clip.videoEffects?.transitionOut === (anim.id as any));

                  return (
                    <button
                      key={anim.id}
                      onClick={() => {
                        if (animSubTab === 'in') {
                          onUpdateClip(clip.id, {
                            videoEffects: {
                              ...clip.videoEffects,
                              transitionIn: isSelected ? undefined : (anim.id as any),
                            },
                          });
                        } else {
                          onUpdateClip(clip.id, {
                            videoEffects: {
                              ...clip.videoEffects,
                              transitionOut: isSelected ? undefined : (anim.id as any),
                            },
                          });
                        }
                      }}
                      className={`p-2.5 rounded-lg border text-center flex flex-col items-center justify-center gap-1.5 transition ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                          : 'border-[#262633] bg-[#1a1a22] text-gray-400 hover:border-gray-600 hover:text-white'
                      }`}
                    >
                      <span className="text-xl">{anim.icon}</span>
                      <span className="text-[10px] font-medium truncate max-w-full">{anim.name}</span>
                    </button>
                  );
                }
              )}
            </div>
          </div>
        )}

        {/* ================= ADJUST TAB ================= */}
        {mainTab === 'adjust' && (
          <div className="space-y-4">
            {/* Subtabs: Basic | HSL | Color Wheel */}
            <div className="flex border-b border-[#262633] pb-1 gap-2">
              <button
                onClick={() => setAdjustSubTab('basic')}
                className={`text-[11px] pb-1 font-semibold transition ${
                  adjustSubTab === 'basic' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Basic
              </button>
              <button
                onClick={() => setAdjustSubTab('colorWheel')}
                className={`text-[11px] pb-1 font-semibold transition ${
                  adjustSubTab === 'colorWheel' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Color Wheel
              </button>
            </div>

            {adjustSubTab === 'basic' && (
              <div className="space-y-3">
                {/* Sliders for Brightness, Contrast, Saturation */}
                <div className="bg-[#1a1a22] p-3.5 rounded-lg border border-[#262633] space-y-3">
                  {/* Brightness */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-gray-300">
                      <span>Brightness</span>
                      <span className="font-mono text-cyan-400">{filters.brightness || 100}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={filters.brightness || 100}
                      onChange={(e) =>
                        onUpdateClip(clip.id, {
                          filters: { ...filters, brightness: parseInt(e.target.value) },
                        })
                      }
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* Contrast */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-gray-300">
                      <span>Contrast</span>
                      <span className="font-mono text-cyan-400">{filters.contrast || 100}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={filters.contrast || 100}
                      onChange={(e) =>
                        onUpdateClip(clip.id, {
                          filters: { ...filters, contrast: parseInt(e.target.value) },
                        })
                      }
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* Saturation */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-gray-300">
                      <span>Saturation</span>
                      <span className="font-mono text-cyan-400">{filters.saturation || 100}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={filters.saturation || 100}
                      onChange={(e) =>
                        onUpdateClip(clip.id, {
                          filters: { ...filters, saturation: parseInt(e.target.value) },
                        })
                      }
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* Temperature / Warmth */}
                  <div className="space-y-1 pt-1 border-t border-[#262633]">
                    <div className="flex justify-between items-center text-gray-300">
                      <div className="flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        <span>Color Temperature</span>
                      </div>
                      <span className="font-mono text-amber-400">
                        {(clip.videoEffects?.temperature ?? 0) > 0 ? `+${clip.videoEffects?.temperature}` : clip.videoEffects?.temperature ?? 0}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={clip.videoEffects?.temperature ?? 0}
                      onChange={(e) =>
                        onUpdateClip(clip.id, {
                          videoEffects: {
                            ...clip.videoEffects,
                            temperature: parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                    <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                      <span>Cool (Blue)</span>
                      <span>Neutral</span>
                      <span>Warm (Golden)</span>
                    </div>
                  </div>

                  {/* Vignette Shadow Intensity */}
                  <div className="space-y-1 pt-1 border-t border-[#262633]">
                    <div className="flex justify-between items-center text-gray-300">
                      <span>Vignette Edge Shadow</span>
                      <span className="font-mono text-cyan-400">
                        {clip.videoEffects?.vignette ? `${clip.videoEffects?.vignetteIntensity ?? 70}%` : 'Off'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={Boolean(clip.videoEffects?.vignette)}
                        onChange={(e) =>
                          onUpdateClip(clip.id, {
                            videoEffects: {
                              ...clip.videoEffects,
                              vignette: e.target.checked,
                              vignetteIntensity: clip.videoEffects?.vignetteIntensity ?? 70,
                            },
                          })
                        }
                        className="rounded bg-gray-800 border-gray-700 text-cyan-500 focus:ring-0 cursor-pointer"
                      />
                      <input
                        type="range"
                        min="10"
                        max="100"
                        disabled={!clip.videoEffects?.vignette}
                        value={clip.videoEffects?.vignetteIntensity ?? 70}
                        onChange={(e) =>
                          onUpdateClip(clip.id, {
                            videoEffects: {
                              ...clip.videoEffects,
                              vignette: true,
                              vignetteIntensity: parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-30"
                      />
                    </div>
                  </div>
                </div>

                {/* CapCut Trending LUTs */}
                <div className="bg-[#1a1a22] p-3.5 rounded-lg border border-[#262633] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-200 font-semibold text-xs flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-cyan-400" />
                      <span>CapCut Trending LUTs</span>
                    </span>
                    <span className="font-mono text-cyan-400 text-xs font-bold">
                      {filters.lutIntensity ?? 100}%
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'none', name: 'Original', desc: 'No LUT' },
                      { id: 'teal-orange', name: 'Teal & Orange', desc: 'Blockbuster Cinematic' },
                      { id: 'moody-dark', name: 'Moody Dark', desc: 'Dark thriller aesthetic' },
                      { id: 'golden-hour', name: 'Golden Hour', desc: 'Warm sunset glow' },
                      { id: 'retro-90s', name: 'Retro 90s Film', desc: 'Analog nostalgic warmth' },
                      { id: 'bw-noir', name: 'B&W Noir', desc: 'Dramatic monochrome' },
                      { id: 'cyberpunk', name: 'Cyberpunk Neon', desc: 'High saturation night' },
                      { id: 'vintage-warm', name: 'Vintage Warm', desc: 'Soft sepia fade' },
                      { id: 'clean-bright', name: 'Clean Bright', desc: 'Vlog & Commercial' },
                    ].map((lut) => {
                      const isSelected = (filters.lutPreset || 'none') === lut.id;
                      return (
                        <button
                          key={lut.id}
                          onClick={() =>
                            onUpdateClip(clip.id, {
                              filters: {
                                ...filters,
                                lutPreset: lut.id as any,
                              },
                            })
                          }
                          className={`p-2 rounded-lg border text-left transition flex flex-col justify-between ${
                            isSelected
                              ? 'border-cyan-400 bg-cyan-950/50 text-cyan-200 shadow-xs'
                              : 'border-gray-800 bg-[#121217] text-gray-400 hover:border-gray-700 hover:text-gray-200'
                          }`}
                        >
                          <span className="text-[11px] font-bold truncate">{lut.name}</span>
                          <span className="text-[9px] text-gray-500 truncate mt-0.5">{lut.desc}</span>
                        </button>
                      );
                    })}
                  </div>

                  {filters.lutPreset && filters.lutPreset !== 'none' && (
                    <div className="space-y-1.5 pt-1 border-t border-[#262633]">
                      <div className="flex justify-between text-xs text-gray-300">
                        <span>LUT Filter Intensity</span>
                        <span className="font-mono text-cyan-400">{filters.lutIntensity ?? 100}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={filters.lutIntensity ?? 100}
                        onChange={(e) =>
                          onUpdateClip(clip.id, {
                            filters: {
                              ...filters,
                              lutIntensity: parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                    </div>
                  )}
                </div>

                {/* Creative Film Overlays (Vintage Dust, VHS Camcorder, Anamorphic Flares) */}
                <div className="bg-[#1a1a22] p-3.5 rounded-lg border border-[#262633] space-y-3">
                  <div className="flex items-center gap-1.5 font-semibold text-gray-200 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Creative Film Overlays</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Vintage Dust & Scratches */}
                    <button
                      onClick={() =>
                        onUpdateClip(clip.id, {
                          videoEffects: {
                            ...clip.videoEffects,
                            vintageDust: !clip.videoEffects?.vintageDust,
                            dustIntensity: clip.videoEffects?.dustIntensity ?? 60,
                          },
                        })
                      }
                      className={`p-2 rounded-lg border text-left transition flex items-center justify-between ${
                        clip.videoEffects?.vintageDust
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200'
                          : 'border-gray-800 bg-[#121217] text-gray-400 hover:border-gray-700 hover:text-gray-200'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">Film Dust & Scratches</div>
                        <div className="text-[9px] text-gray-500">Authentic 35mm grain</div>
                      </div>
                      <span className={`w-2 h-2 rounded-full shrink-0 ml-1.5 ${clip.videoEffects?.vintageDust ? 'bg-cyan-400' : 'bg-gray-700'}`} />
                    </button>

                    {/* VHS Date Stamp & Camcorder OSD */}
                    <button
                      onClick={() =>
                        onUpdateClip(clip.id, {
                          videoEffects: {
                            ...clip.videoEffects,
                            vhsOverlay: !clip.videoEffects?.vhsOverlay,
                          },
                        })
                      }
                      className={`p-2 rounded-lg border text-left transition flex items-center justify-between ${
                        clip.videoEffects?.vhsOverlay
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200'
                          : 'border-gray-800 bg-[#121217] text-gray-400 hover:border-gray-700 hover:text-gray-200'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">VHS Camcorder OSD</div>
                        <div className="text-[9px] text-gray-500">REC 90s timestamp</div>
                      </div>
                      <span className={`w-2 h-2 rounded-full shrink-0 ml-1.5 ${clip.videoEffects?.vhsOverlay ? 'bg-cyan-400' : 'bg-gray-700'}`} />
                    </button>

                    {/* Anamorphic Lens Flare */}
                    <button
                      onClick={() =>
                        onUpdateClip(clip.id, {
                          videoEffects: {
                            ...clip.videoEffects,
                            anamorphicFlare: !clip.videoEffects?.anamorphicFlare,
                          },
                        })
                      }
                      className={`p-2 rounded-lg border text-left transition flex items-center justify-between ${
                        clip.videoEffects?.anamorphicFlare
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200'
                          : 'border-gray-800 bg-[#121217] text-gray-400 hover:border-gray-700 hover:text-gray-200'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">Anamorphic Flares</div>
                        <div className="text-[9px] text-gray-500">Horizontal blue streaks</div>
                      </div>
                      <span className={`w-2 h-2 rounded-full shrink-0 ml-1.5 ${clip.videoEffects?.anamorphicFlare ? 'bg-cyan-400' : 'bg-gray-700'}`} />
                    </button>

                    {/* Film Grain */}
                    <button
                      onClick={() =>
                        onUpdateClip(clip.id, {
                          videoEffects: {
                            ...clip.videoEffects,
                            grain: !clip.videoEffects?.grain,
                            grainIntensity: clip.videoEffects?.grainIntensity ?? 50,
                          },
                        })
                      }
                      className={`p-2 rounded-lg border text-left transition flex items-center justify-between ${
                        clip.videoEffects?.grain
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200'
                          : 'border-gray-800 bg-[#121217] text-gray-400 hover:border-gray-700 hover:text-gray-200'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">Film Grain</div>
                        <div className="text-[9px] text-gray-500">Cinema 16mm texture</div>
                      </div>
                      <span className={`w-2 h-2 rounded-full shrink-0 ml-1.5 ${clip.videoEffects?.grain ? 'bg-cyan-400' : 'bg-gray-700'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {adjustSubTab === 'colorWheel' && (
              <ColorGradingSection
                grading={filters.colorGrading || {
                  enabled: true,
                  lift: { master: 0, r: 0, g: 0, b: 0, hue: 0, saturation: 0 },
                  gamma: { master: 0, r: 0, g: 0, b: 0, hue: 0, saturation: 0 },
                  gain: { master: 0, r: 0, g: 0, b: 0, hue: 0, saturation: 0 },
                  temperature: 0,
                  tint: 0,
                }}
                onChange={(newGrading) =>
                  onUpdateClip(clip.id, {
                    filters: {
                      ...filters,
                      colorGrading: newGrading,
                    },
                  })
                }
              />
            )}
          </div>
        )}

      </div>
    </div>
  );
};
