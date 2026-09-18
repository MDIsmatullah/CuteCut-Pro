import React, { useState } from 'react';
import { Type, Sparkles, Wand2, AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline, Volume2, MessageSquare, Play, Check, Crown, Move, Layers, Sliders, Palette } from 'lucide-react';
import { Clip } from '../types';

interface CuteCutTextInspectorProps {
  clip: Clip;
  onUpdateClip: (clipId: string, updates: Partial<Clip>) => void;
  onGenerateTTS: (text: string, voice: string) => Promise<void>;
}

export const CuteCutTextInspector: React.FC<CuteCutTextInspectorProps> = ({
  clip,
  onUpdateClip,
  onGenerateTTS,
}) => {
  const [mainTab, setMainTab] = useState<'text' | 'quran' | 'animation' | 'tracking' | 'tts'>('text');
  const [textSubTab, setTextSubTab] = useState<'basic' | 'bubble' | 'effects'>('basic');
  const [effectCategory, setEffectCategory] = useState<'trending' | 'basic' | 'luminescence' | 'multicolor'>('trending');
  const [ttsVoice, setTtsVoice] = useState('Jessie');
  const [isGeneratingTts, setIsGeneratingTts] = useState(false);
  const [ayahNumber, setAyahNumber] = useState('1');

  // Available Fonts
  const FONTS = [
    { id: 'Amiri', name: 'Amiri (Classic Quranic Naskh)' },
    { id: 'Noto Naskh Arabic', name: 'Noto Naskh Arabic' },
    { id: 'Scheherazade New', name: 'Scheherazade New (Uthmani)' },
    { id: 'Lateef', name: 'Lateef (Sindhi/Urdu Nastaliq)' },
    { id: 'Reem Kufi', name: 'Reem Kufi (Geometric Calligraphy)' },
    { id: 'Aref Ruqaa', name: 'Aref Ruqaa (Artisan Script)' },
    { id: 'Cairo', name: 'Cairo (Modern Arabic UI)' },
    { id: 'Cinzel Decorative', name: 'Cinzel Decorative (Imperial Title)' },
    { id: 'Playfair Display', name: 'Playfair Display (Serif Elegance)' },
    { id: 'Inter', name: 'Inter (Clean Sans)' },
    { id: 'Montserrat', name: 'Montserrat' },
    { id: 'Poppins', name: 'Poppins' },
    { id: 'Bebas Neue', name: 'Bebas Neue' },
    { id: 'Oswald', name: 'Oswald' },
  ];

  // ART Text Effects from CapCut video (at 1:01 - 1:16 & 3:25) + Sacred Calligraphy
  const ART_EFFECTS = [
    { id: 'art-gold-divine', label: 'NOOR', color: '#facc15', glow: '#eab308', stroke: '#713f12', style: 'gold-glow' },
    { id: 'art-cyan-neon', label: 'ART', color: '#06b6d4', glow: '#22d3ee', stroke: '#083344', style: 'neon' },
    { id: 'art-gold-3d', label: 'ART', color: '#facc15', glow: '#eab308', stroke: '#713f12', style: 'gold-glow' },
    { id: 'art-emerald-glow', label: 'KAABA', color: '#34d399', glow: '#10b981', stroke: '#064e3b', style: 'neon' },
    { id: 'art-white-shadow', label: 'PURE', color: '#ffffff', glow: '#94a3b8', stroke: '#0f172a', style: 'shadow' },
    { id: 'art-magenta-fire', label: 'ART', color: '#f43f5e', glow: '#fb7185', stroke: '#881337', style: 'neon' },
    { id: 'art-cyber-pink', label: 'ART', color: '#ec4899', glow: '#f472b6', stroke: '#831843', style: 'neon' },
    { id: 'art-orange-sunset', label: 'ART', color: '#f97316', glow: '#fb923c', stroke: '#7c2d12', style: 'outline' },
    { id: 'art-purple-dream', label: 'ART', color: '#a855f7', glow: '#c084fc', stroke: '#581c87', style: 'neon' },
  ];

  // Speech Bubbles from CapCut video (at 3:17 & 3:36)
  const BUBBLES = [
    { id: 'none', name: 'None', icon: '⊘' },
    { id: 'bubble-chat', name: 'Chat Balloon', icon: '💬' },
    { id: 'bubble-cloud', name: 'Comic Cloud', icon: '💭' },
    { id: 'bubble-neon', name: 'Neon Box', icon: '🔲' },
    { id: 'bubble-ribbon', name: 'Banner Ribbon', icon: '🎗️' },
    { id: 'bubble-retro', name: 'Retro Tag', icon: '🏷️' },
  ];

  const handleTtsGenerate = async () => {
    if (!clip.text) return;
    setIsGeneratingTts(true);
    try {
      await onGenerateTTS(clip.text, ttsVoice);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingTts(false);
    }
  };

  return (
    <div className="flex flex-col h-full select-none text-gray-300">
      {/* Top Main Tabs: Text | Animation | Tracking | Text to speech */}
      <div className="flex border-b border-[#23232b] bg-[#141418] px-3 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setMainTab('text')}
          className={`px-3 py-2.5 text-xs font-semibold tracking-wide transition border-b-2 whitespace-nowrap ${
            mainTab === 'text'
              ? 'text-cyan-400 border-cyan-400 bg-[#1a1a22]'
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          Text
        </button>
        <button
          onClick={() => setMainTab('quran')}
          className={`flex items-center gap-1 px-3 py-2.5 text-xs font-semibold tracking-wide transition border-b-2 whitespace-nowrap ${
            mainTab === 'quran'
              ? 'text-amber-400 border-amber-400 bg-[#1a1a22]'
              : 'text-amber-400/80 border-transparent hover:text-amber-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Quran & Captions</span>
        </button>
        <button
          onClick={() => setMainTab('animation')}
          className={`px-3 py-2.5 text-xs font-semibold tracking-wide transition border-b-2 whitespace-nowrap ${
            mainTab === 'animation'
              ? 'text-cyan-400 border-cyan-400 bg-[#1a1a22]'
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          Animation
        </button>
        <button
          onClick={() => setMainTab('tracking')}
          className={`px-3 py-2.5 text-xs font-semibold tracking-wide transition border-b-2 whitespace-nowrap ${
            mainTab === 'tracking'
              ? 'text-cyan-400 border-cyan-400 bg-[#1a1a22]'
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          Tracking
        </button>
        <button
          onClick={() => setMainTab('tts')}
          className={`px-3 py-2.5 text-xs font-semibold tracking-wide transition border-b-2 whitespace-nowrap ${
            mainTab === 'tts'
              ? 'text-cyan-400 border-cyan-400 bg-[#1a1a22]'
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          Text to speech
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
        
        {/* ================= TEXT TAB ================= */}
        {mainTab === 'text' && (
          <div className="space-y-4">
            {/* Subtabs: Basic | Bubble | Effects */}
            <div className="flex border-b border-[#262633] pb-1 gap-2">
              <button
                onClick={() => setTextSubTab('basic')}
                className={`text-[11px] pb-1 font-semibold transition ${
                  textSubTab === 'basic' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Basic
              </button>
              <button
                onClick={() => setTextSubTab('bubble')}
                className={`text-[11px] pb-1 font-semibold transition ${
                  textSubTab === 'bubble' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Bubble
              </button>
              <button
                onClick={() => setTextSubTab('effects')}
                className={`text-[11px] pb-1 font-semibold transition ${
                  textSubTab === 'effects' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Effects
              </button>
            </div>

            {/* Subtab: BASIC */}
            {textSubTab === 'basic' && (
              <div className="space-y-4">
                {/* Text Content Input */}
                <div className="bg-[#1a1a22] p-3 rounded-lg border border-[#262633] space-y-2">
                  <div className="flex justify-between items-center text-gray-400 text-[11px]">
                    <span>Content</span>
                    <span className="font-mono text-[10px]">{(clip.text || '').length} chars</span>
                  </div>
                  <textarea
                    rows={3}
                    value={clip.text || ''}
                    onChange={(e) => onUpdateClip(clip.id, { text: e.target.value })}
                    placeholder="Default text"
                    className="w-full text-xs bg-[#121217] border border-gray-800 rounded p-2 focus:outline-none focus:border-cyan-500 font-sans text-gray-200"
                  />
                </div>

                {/* Font & Size */}
                <div className="bg-[#1a1a22] p-3 rounded-lg border border-[#262633] space-y-3">
                  {/* Font Family */}
                  <div className="space-y-1">
                    <span className="text-gray-400 text-[10px]">Font</span>
                    <select
                      value={clip.fontFamily || 'system-ui'}
                      onChange={(e) => onUpdateClip(clip.id, { fontFamily: e.target.value })}
                      className="w-full bg-[#121217] border border-gray-800 rounded p-1.5 text-xs text-gray-200 focus:outline-none focus:border-cyan-500"
                    >
                      {FONTS.map((f) => (
                        <option key={f.id} value={f.id} style={{ fontFamily: f.id }}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Font Size */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Font size</span>
                      <span className="font-mono text-cyan-400 font-bold">{clip.fontSize || 32}px</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="120"
                      value={clip.fontSize || 32}
                      onChange={(e) => onUpdateClip(clip.id, { fontSize: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* Style Toggles: Case (TT/Tt/tt), Bold, Italic, Underline */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {/* Case Buttons */}
                    <button
                      onClick={() =>
                        onUpdateClip(clip.id, {
                          textTransform: clip.textTransform === 'uppercase' ? 'none' : 'uppercase',
                        })
                      }
                      className={`px-2 py-1 rounded text-xs font-bold border transition ${
                        clip.textTransform === 'uppercase'
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                          : 'border-gray-800 bg-[#121217] text-gray-400 hover:text-white'
                      }`}
                      title="Uppercase TT"
                    >
                      TT
                    </button>

                    <div className="h-4 w-px bg-gray-700 mx-1" />

                    {/* Alignment */}
                    <button
                      onClick={() => onUpdateClip(clip.id, { textAlignment: 'left' })}
                      className={`p-1.5 rounded border transition ${
                        clip.textAlignment === 'left'
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                          : 'border-gray-800 bg-[#121217] text-gray-400 hover:text-white'
                      }`}
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onUpdateClip(clip.id, { textAlignment: 'center' })}
                      className={`p-1.5 rounded border transition ${
                        (clip.textAlignment || 'center') === 'center'
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                          : 'border-gray-800 bg-[#121217] text-gray-400 hover:text-white'
                      }`}
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onUpdateClip(clip.id, { textAlignment: 'right' })}
                      className={`p-1.5 rounded border transition ${
                        clip.textAlignment === 'right'
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                          : 'border-gray-800 bg-[#121217] text-gray-400 hover:text-white'
                      }`}
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Letter Spacing (Tracking) & Line Spacing */}
                  <div className="space-y-2 pt-2 border-t border-[#262633]">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-gray-400 text-[10px]">
                        <span>Letter Spacing (Tracking)</span>
                        <span className="font-mono text-cyan-400">{clip.textLetterSpacing ?? 0}px</span>
                      </div>
                      <input
                        type="range"
                        min="-2"
                        max="25"
                        value={clip.textLetterSpacing ?? 0}
                        onChange={(e) => onUpdateClip(clip.id, { textLetterSpacing: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-gray-400 text-[10px]">
                        <span>Line Height</span>
                        <span className="font-mono text-cyan-400">{clip.textLineHeight ?? 1.3}x</span>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="2.4"
                        step="0.1"
                        value={clip.textLineHeight ?? 1.3}
                        onChange={(e) => onUpdateClip(clip.id, { textLineHeight: parseFloat(e.target.value) })}
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                    </div>
                  </div>

                  {/* 1-Click Screen Position Shortcuts */}
                  <div className="pt-2 border-t border-[#262633] space-y-1.5">
                    <div className="flex items-center justify-between text-gray-400 text-[10px]">
                      <span>Quick Screen Position</span>
                      <span className="font-mono text-gray-400">X: {clip.textX ?? 50}%, Y: {clip.textY ?? 50}%</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { label: 'Top 1/3', x: 50, y: 25 },
                        { label: 'Center', x: 50, y: 50 },
                        { label: 'Lower 1/3', x: 50, y: 75 },
                        { label: 'Ayah Sub', x: 50, y: 84 },
                      ].map((pos) => (
                        <button
                          key={pos.label}
                          onClick={() => onUpdateClip(clip.id, { textX: pos.x, textY: pos.y })}
                          className={`py-1 rounded text-[10px] font-medium border text-center transition ${
                            (clip.textX ?? 50) === pos.x && (clip.textY ?? 50) === pos.y
                              ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200'
                              : 'bg-[#121217] border-gray-800 text-gray-400 hover:text-white'
                          }`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Royal Text Gradients */}
                <div className="bg-[#1a1a22] p-3 rounded-lg border border-[#262633] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-medium text-amber-300">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      <span>Royal Text Gradients</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(clip.textGradient?.enabled)}
                      onChange={(e) =>
                        onUpdateClip(clip.id, {
                          textGradient: {
                            enabled: e.target.checked,
                            style: clip.textGradient?.style || 'royal-gold',
                          },
                        })
                      }
                      className="rounded bg-gray-800 border-gray-700 text-amber-500 focus:ring-0 cursor-pointer"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'royal-gold', label: 'Imperial Gold', bg: 'from-amber-200 via-amber-400 to-amber-600' },
                      { id: 'emerald-glow', label: 'Emerald Glow', bg: 'from-emerald-200 via-emerald-400 to-emerald-700' },
                      { id: 'rose-sunset', label: 'Desert Sunset', bg: 'from-orange-200 via-rose-500 to-amber-600' },
                      { id: 'silver-moon', label: 'Moonlit Silver', bg: 'from-white via-slate-300 to-slate-500' },
                      { id: 'sunset-amber', label: 'Sunset Amber', bg: 'from-yellow-300 via-orange-500 to-red-600' },
                    ].map((g) => {
                      const isSel = clip.textGradient?.enabled && clip.textGradient?.style === g.id;
                      return (
                        <button
                          key={g.id}
                          onClick={() =>
                            onUpdateClip(clip.id, {
                              textGradient: {
                                enabled: true,
                                style: g.id as any,
                              },
                            })
                          }
                          className={`p-1.5 rounded border text-left flex items-center gap-2 transition ${
                            isSel
                              ? 'border-amber-400 bg-amber-950/40 text-amber-200'
                              : 'border-[#262633] bg-[#121217] text-gray-400 hover:border-gray-600 hover:text-white'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${g.bg}`} />
                          <span className="text-[10px] font-semibold truncate">{g.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3D Drop Shadow & Bevel */}
                <div className="bg-[#1a1a22] p-3 rounded-lg border border-[#262633] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-medium text-gray-200">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Deep 3D Shadow</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(clip.text3DShadow?.enabled)}
                      onChange={(e) =>
                        onUpdateClip(clip.id, {
                          text3DShadow: {
                            enabled: e.target.checked,
                            blur: clip.text3DShadow?.blur ?? 12,
                            offsetX: clip.text3DShadow?.offsetX ?? 4,
                            offsetY: clip.text3DShadow?.offsetY ?? 4,
                            color: clip.text3DShadow?.color || 'rgba(0,0,0,0.95)',
                          },
                        })
                      }
                      className="rounded bg-gray-800 border-gray-700 text-cyan-500 focus:ring-0 cursor-pointer"
                    />
                  </div>
                  {clip.text3DShadow?.enabled && (
                    <div className="space-y-2 pt-1 border-t border-[#262633]">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-gray-400 text-[10px]">
                          <span>Shadow Blur</span>
                          <span className="font-mono text-cyan-400">{clip.text3DShadow.blur ?? 12}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="30"
                          value={clip.text3DShadow.blur ?? 12}
                          onChange={(e) =>
                            onUpdateClip(clip.id, {
                              text3DShadow: {
                                ...clip.text3DShadow!,
                                blur: parseInt(e.target.value),
                              },
                            })
                          }
                          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-gray-400 text-[10px]">
                          <span>Shadow Offset</span>
                          <span className="font-mono text-cyan-400">{clip.text3DShadow.offsetY ?? 4}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          value={clip.text3DShadow.offsetY ?? 4}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            onUpdateClip(clip.id, {
                              text3DShadow: {
                                ...clip.text3DShadow!,
                                offsetX: val,
                                offsetY: val,
                              },
                            });
                          }}
                          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Color & Glow */}
                <div className="bg-[#1a1a22] p-3 rounded-lg border border-[#262633] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Text Color</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={clip.color || '#ffffff'}
                        onChange={(e) => onUpdateClip(clip.id, { color: e.target.value })}
                        className="w-7 h-7 rounded border border-gray-700 bg-transparent cursor-pointer"
                      />
                      <span className="font-mono text-[11px] text-gray-300">{clip.color || '#ffffff'}</span>
                    </div>
                  </div>

                  {/* Preset Colors */}
                  <div className="flex gap-2 pt-1">
                    {['#ffffff', '#facc15', '#06b6d4', '#ec4899', '#10b981', '#f97316', '#a855f7'].map((c) => (
                      <button
                        key={c}
                        onClick={() => onUpdateClip(clip.id, { color: c })}
                        style={{ backgroundColor: c }}
                        className="w-5 h-5 rounded-full border border-gray-600 hover:scale-110 transition shadow"
                      />
                    ))}
                  </div>

                  {/* Stroke Width */}
                  <div className="space-y-1 pt-2 border-t border-[#262633]">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-[10px]">Stroke (Outline)</span>
                      <span className="font-mono text-cyan-400">{clip.textStrokeWidth || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      value={clip.textStrokeWidth || 0}
                      onChange={(e) => onUpdateClip(clip.id, { textStrokeWidth: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Subtab: BUBBLE */}
            {textSubTab === 'bubble' && (
              <div className="space-y-3">
                <div className="font-semibold text-gray-200">Speech & Label Bubbles</div>
                <div className="grid grid-cols-3 gap-2">
                  {BUBBLES.map((b) => {
                    const isSelected = (clip.textBubble || 'none') === b.id;
                    return (
                      <button
                        key={b.id}
                        onClick={() => onUpdateClip(clip.id, { textBubble: b.id })}
                        className={`p-3 rounded-lg border text-center flex flex-col items-center justify-center gap-1.5 transition ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                            : 'border-[#262633] bg-[#1a1a22] text-gray-400 hover:border-gray-600 hover:text-white'
                        }`}
                      >
                        <span className="text-2xl">{b.icon}</span>
                        <span className="text-[10px] font-medium">{b.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Subtab: EFFECTS */}
            {textSubTab === 'effects' && (
              <div className="space-y-3">
                <div className="font-semibold text-gray-200">CuteCut ART Text Presets</div>
                <div className="grid grid-cols-4 gap-2">
                  {ART_EFFECTS.map((eff) => {
                    const isSelected = clip.textEffectPreset === eff.id;
                    return (
                      <button
                        key={eff.id}
                        onClick={() =>
                          onUpdateClip(clip.id, {
                            textEffectPreset: eff.id,
                            color: eff.color,
                            textGlowColor: eff.glow,
                            textGlowIntensity: 25,
                            textStrokeColor: eff.stroke,
                            textStrokeWidth: 4,
                            textStyle: eff.style as any,
                          })
                        }
                        className={`h-20 rounded-lg border flex flex-col items-center justify-center p-2 transition group ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-400'
                            : 'border-[#262633] bg-[#121217] hover:border-gray-600'
                        }`}
                      >
                        <span
                          className="font-black text-xl tracking-wider"
                          style={{
                            color: eff.color,
                            textShadow: `0 0 10px ${eff.glow}, 0 0 20px ${eff.glow}`,
                          }}
                        >
                          {eff.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= QURAN & CAPTIONS TAB ================= */}
        {mainTab === 'quran' && (
          <div className="space-y-4">
            {/* Calligraphic Ayah Ornaments */}
            <div className="bg-[#1a1a22] p-3.5 rounded-lg border border-[#262633] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <span>۝</span>
                  <span>Sacred Ayah Rosettes & Symbols</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-400">Ayah #:</span>
                  <input
                    type="text"
                    value={ayahNumber}
                    onChange={(e) => setAyahNumber(e.target.value)}
                    className="w-10 bg-[#121217] border border-gray-700 rounded px-1.5 py-0.5 text-center font-mono text-xs text-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    name: `Ayah Rosette ۝ ${ayahNumber}`,
                    symbol: ` ۝${ayahNumber} `,
                    desc: 'End of Ayah circle with number',
                  },
                  {
                    name: 'Rub el Hizb ۞',
                    symbol: ' ۞ ',
                    desc: 'Eight-pointed Quranic quarter star',
                  },
                  {
                    name: 'Sajdah Indicator ۩',
                    symbol: ' ۩ ',
                    desc: 'Prostration mark',
                  },
                  {
                    name: 'Full Basmalah ﷽',
                    symbol: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
                    desc: 'Opening ligature calligraphy',
                  },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const newText = (clip.text || '') + item.symbol;
                      onUpdateClip(clip.id, {
                        text: newText,
                        fontFamily: clip.fontFamily || 'Amiri',
                      });
                    }}
                    className="p-2 rounded bg-[#121217] border border-gray-800 hover:border-amber-500/50 text-left transition group"
                  >
                    <div className="font-bold text-amber-300 text-sm group-hover:text-amber-200">
                      {item.name}
                    </div>
                    <div className="text-[9px] text-gray-400 mt-0.5 line-clamp-1">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Dual-Layer Translation Subtitles */}
            <div className="bg-[#1a1a22] p-3.5 rounded-lg border border-[#262633] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-200">Dual-Layer Translation Subtitle</div>
                  <div className="text-[10px] text-gray-400">Display secondary translation (Urdu, English, etc.) below Arabic</div>
                </div>
                <button
                  onClick={() =>
                    onUpdateClip(clip.id, {
                      subtitleTranslation: {
                        enabled: !clip.subtitleTranslation?.enabled,
                        text: clip.subtitleTranslation?.text || 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
                        fontSize: clip.subtitleTranslation?.fontSize || 18,
                        color: clip.subtitleTranslation?.color || '#e2e8f0',
                      },
                    })
                  }
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                    clip.subtitleTranslation?.enabled ? 'bg-amber-500 justify-end' : 'bg-gray-700 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>

              {clip.subtitleTranslation?.enabled && (
                <div className="space-y-3 pt-2 border-t border-[#262633]">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Translation Subtitle Text</label>
                    <textarea
                      value={clip.subtitleTranslation?.text || ''}
                      onChange={(e) =>
                        onUpdateClip(clip.id, {
                          subtitleTranslation: {
                            ...(clip.subtitleTranslation || { enabled: true }),
                            text: e.target.value,
                          },
                        })
                      }
                      rows={2}
                      className="w-full bg-[#121217] border border-gray-700 rounded-lg p-2 text-xs text-gray-200 focus:outline-none focus:border-amber-400 resize-none"
                      placeholder="Enter translation subtitle..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-gray-400">Subtitle Size</span>
                        <span className="font-mono text-amber-400 font-bold">
                          {clip.subtitleTranslation?.fontSize || 18}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="12"
                        max="36"
                        value={clip.subtitleTranslation?.fontSize || 18}
                        onChange={(e) =>
                          onUpdateClip(clip.id, {
                            subtitleTranslation: {
                              ...(clip.subtitleTranslation || { enabled: true }),
                              fontSize: parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-400 block">Color</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={clip.subtitleTranslation?.color || '#e2e8f0'}
                          onChange={(e) =>
                            onUpdateClip(clip.id, {
                              subtitleTranslation: {
                                ...(clip.subtitleTranslation || { enabled: true }),
                                color: e.target.value,
                              },
                            })
                          }
                          className="w-7 h-7 rounded border border-gray-700 bg-transparent cursor-pointer"
                        />
                        <span className="font-mono text-[11px] text-gray-300 uppercase">
                          {clip.subtitleTranslation?.color || '#e2e8f0'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Glowing Karaoke Word Highlighting */}
            <div className="bg-[#1a1a22] p-3.5 rounded-lg border border-[#262633] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Dynamic Karaoke Word Glow</span>
                  </div>
                  <div className="text-[10px] text-gray-400">
                    Illuminates each Quranic word in radiant glow as recited
                  </div>
                </div>
                <button
                  onClick={() =>
                    onUpdateClip(clip.id, {
                      karaokeHighlight: {
                        enabled: !clip.karaokeHighlight?.enabled,
                        color: clip.karaokeHighlight?.color || '#facc15',
                        intensity: clip.karaokeHighlight?.intensity || 25,
                      },
                    })
                  }
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                    clip.karaokeHighlight?.enabled ? 'bg-amber-500 justify-end' : 'bg-gray-700 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>

              {clip.karaokeHighlight?.enabled && (
                <div className="space-y-3 pt-2 border-t border-[#262633]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">Radiant Glow Theme</span>
                    <div className="flex items-center gap-2">
                      {[
                        { color: '#facc15', label: 'Noor Gold' },
                        { color: '#34d399', label: 'Emerald' },
                        { color: '#22d3ee', label: 'Sky Cyan' },
                        { color: '#fb7185', label: 'Rose' },
                      ].map((th) => (
                        <button
                          key={th.color}
                          onClick={() =>
                            onUpdateClip(clip.id, {
                              karaokeHighlight: {
                                ...(clip.karaokeHighlight || { enabled: true }),
                                color: th.color,
                              },
                            })
                          }
                          title={th.label}
                          className={`w-5 h-5 rounded-full border-2 transition ${
                            clip.karaokeHighlight?.color === th.color
                              ? 'border-white scale-110 shadow-lg'
                              : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: th.color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-gray-400">Glow Halo Radius</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {clip.karaokeHighlight?.intensity || 25}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={clip.karaokeHighlight?.intensity || 25}
                      onChange={(e) =>
                        onUpdateClip(clip.id, {
                          karaokeHighlight: {
                            ...(clip.karaokeHighlight || { enabled: true }),
                            intensity: parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sacred Typography Presets */}
            <div className="bg-[#1a1a22] p-3.5 rounded-lg border border-[#262633] space-y-2.5">
              <span className="font-semibold text-gray-200">Sacred Visual Typography Styles</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    name: '🌟 Pure Gold Leaf',
                    color: '#facc15',
                    glow: '#ca8a04',
                    stroke: '#713f12',
                    font: 'Amiri',
                  },
                  {
                    name: '🕋 Haramain Noor',
                    color: '#ffffff',
                    glow: '#10b981',
                    stroke: '#064e3b',
                    font: 'Scheherazade New',
                  },
                  {
                    name: '🌙 Emerald Sanctuary',
                    color: '#6ee7b7',
                    glow: '#059669',
                    stroke: '#064e3b',
                    font: 'Amiri',
                  },
                  {
                    name: '📜 Classical Naskh',
                    color: '#fef08a',
                    glow: '#a16207',
                    stroke: '#451a03',
                    font: 'Noto Naskh Arabic',
                  },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      onUpdateClip(clip.id, {
                        color: preset.color,
                        textGlowColor: preset.glow,
                        textGlowIntensity: 25,
                        textStrokeColor: preset.stroke,
                        textStrokeWidth: 3,
                        fontFamily: preset.font,
                      })
                    }
                    className="p-2.5 rounded bg-[#121217] border border-gray-800 hover:border-amber-400 text-left transition"
                  >
                    <div className="font-bold text-xs text-gray-200">{preset.name}</div>
                    <div className="text-[10px] text-gray-400 font-serif mt-1" style={{ color: preset.color }}>
                      بِسْمِ اللَّهِ
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= ANIMATION TAB ================= */}
        {mainTab === 'animation' && (
          <div className="space-y-3">
            <div className="font-semibold text-gray-200">Text Animation</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'typewriter', name: 'Typewriter', icon: '⌨️' },
                { id: 'fade-in', name: 'Fade In', icon: '🌅' },
                { id: 'slide-up', name: 'Slide Up', icon: '⬆️' },
                { id: 'zoom-in', name: 'Zoom In', icon: '🔍' },
                { id: 'wave', name: 'Wave Bounce', icon: '🌊' },
                { id: 'glitch', name: 'Glitch Tech', icon: '⚡' },
              ].map((anim) => (
                <button
                  key={anim.id}
                  onClick={() =>
                    onUpdateClip(clip.id, {
                      textAnimation: {
                        preset: anim.id as any,
                        scope: 'all',
                        characterTiming: 0.08,
                      },
                    })
                  }
                  className={`p-3 rounded-lg border text-center flex flex-col items-center justify-center gap-1.5 transition ${
                    clip.textAnimation?.preset === anim.id
                      ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                      : 'border-[#262633] bg-[#1a1a22] text-gray-400 hover:border-gray-600 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{anim.icon}</span>
                  <span className="text-[10px] font-medium">{anim.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ================= TRACKING TAB ================= */}
        {mainTab === 'tracking' && (
          <div className="bg-[#1a1a22] p-4 rounded-lg border border-[#262633] space-y-3 text-center">
            <div className="text-sm font-semibold text-gray-200">Motion Tracking</div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Pin text subtitles to tracked objects, faces, or moving focal points in your video footage.
            </p>
            <button
              onClick={() => {}}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-semibold text-xs transition"
            >
              Start Tracking
            </button>
          </div>
        )}

        {/* ================= TEXT TO SPEECH TAB ================= */}
        {mainTab === 'tts' && (
          <div className="space-y-4">
            <div className="bg-[#1a1a22] p-3.5 rounded-lg border border-[#262633] space-y-3">
              <div className="font-semibold text-gray-200">Voice Characters</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'Jessie', name: 'Jessie (Trendy)', icon: '👩' },
                  { id: 'Narrator', name: 'Documentary Male', icon: '🧔' },
                  { id: 'Cute Girl', name: 'Cute Anime Vlogger', icon: '👧' },
                  { id: 'Energetic', name: 'Energetic Sports', icon: '🏃' },
                  { id: 'Deep', name: 'Movie Trailer Deep', icon: '🎙️' },
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setTtsVoice(v.id)}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition ${
                      ttsVoice === v.id
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                        : 'border-[#262633] bg-[#121217] text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xl">{v.icon}</span>
                    <span className="text-[11px] font-bold truncate">{v.name}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleTtsGenerate}
                disabled={isGeneratingTts || !clip.text}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg shadow flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isGeneratingTts ? (
                  <>
                    <Wand2 className="w-4 h-4 animate-spin" />
                    <span>Generating CuteCut Speech...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Start Reading & Add Audio</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
