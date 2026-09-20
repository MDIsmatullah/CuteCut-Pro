import React, { useState } from 'react';
import { 
  Scissors, Music, Type, Layers, Wand2, Sliders, Palette, 
  Play, Pause, Undo2, Redo2, Download, ChevronDown, X,
  FolderOpen, Sparkles, SlidersHorizontal, Image as ImageIcon,
  Check, Volume2, Split, Trash2, Copy, Zap, ArrowLeft,
  Ratio, Smile, Move, Eye, RotateCw, ZoomIn, Mic, Film,
  AlignLeft, Sun, MessageSquare, Gauge, Bell
} from 'lucide-react';
import { Clip } from '../types';

export type GlobalMobileTab = 
  | 'media' 
  | 'audio' 
  | 'sfx'
  | 'text' 
  | 'overlay' 
  | 'effects' 
  | 'filters' 
  | 'adjustment' 
  | 'autosegment' 
  | 'stickers' 
  | 'canvas' 
  | null;

export type ClipControlTab = 
  | 'split' 
  | 'speed' 
  | 'volume' 
  | 'animation' 
  | 'filters' 
  | 'adjust' 
  | 'mask' 
  | 'transform' 
  | 'opacity' 
  | 'editText' 
  | 'textStyle' 
  | 'voiceFx' 
  | 'fade' 
  | null;

interface MobileCuteCutLayoutProps {
  onBackToPortal: () => void;
  onOpenExport: () => void;
  aspectRatio: '16:9' | '9:16' | '1:1';
  onSetAspectRatio: (ratio: '16:9' | '9:16' | '1:1') => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime: number;
  duration: number;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  selectedClip: Clip | null;
  onDeselectClip?: () => void;
  onSplitClip: () => void;
  onDeleteClip: (id: string) => void;
  onDuplicateClip: (id: string) => void;
  onUpdateClip?: (clipId: string, updates: Partial<Clip>) => void;
  onAutoSegmentAudio?: () => void;
  onAutoSyncVideoToAyahs?: () => void;
  onAutoRemoveSilence?: () => void;
  onAutoSegmentRhythm?: () => void;
  renderPreviewPlayer: () => React.ReactNode;
  renderTimeline: () => React.ReactNode;
  renderMediaPanel: (tab?: any) => React.ReactNode;
  renderInspector: () => React.ReactNode;
}

export const MobileCuteCutLayout: React.FC<MobileCuteCutLayoutProps> = ({
  onBackToPortal,
  onOpenExport,
  aspectRatio,
  onSetAspectRatio,
  isPlaying,
  onTogglePlay,
  currentTime,
  duration,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  selectedClip,
  onDeselectClip,
  onSplitClip,
  onDeleteClip,
  onDuplicateClip,
  onUpdateClip,
  onAutoSegmentAudio,
  onAutoSyncVideoToAyahs,
  onAutoRemoveSilence,
  onAutoSegmentRhythm,
  renderPreviewPlayer,
  renderTimeline,
  renderMediaPanel,
  renderInspector
}) => {
  const [activeGlobalDrawer, setActiveGlobalDrawer] = useState<GlobalMobileTab>(null);
  const [activeClipDrawer, setActiveClipDrawer] = useState<ClipControlTab>(null);
  const [quickEditText, setQuickEditText] = useState('');

  // Main Global Bottom Navigation Items (When NO clip is selected)
  const globalNavItems: { id: GlobalMobileTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'media', label: 'Media', icon: Layers },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'sfx', label: 'Sound FX', icon: Bell },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'overlay', label: 'Overlay', icon: ImageIcon },
    { id: 'effects', label: 'Effects', icon: Wand2 },
    { id: 'filters', label: 'Filters', icon: Palette },
    { id: 'adjustment', label: 'Adjust', icon: SlidersHorizontal },
    { id: 'autosegment', label: 'Auto-Sync', icon: Zap },
    { id: 'stickers', label: 'Stickers', icon: Smile },
    { id: 'canvas', label: 'Canvas', icon: Sun },
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  const handleOpenGlobalTab = (tabId: GlobalMobileTab) => {
    if (activeGlobalDrawer === tabId) {
      setActiveGlobalDrawer(null);
    } else {
      setActiveGlobalDrawer(tabId);
      setActiveClipDrawer(null);
    }
  };

  const handleOpenClipControl = (control: ClipControlTab) => {
    if (control === 'split') {
      onSplitClip();
      return;
    }
    if (control === 'editText' && selectedClip && selectedClip.text) {
      setQuickEditText(selectedClip.text);
    }
    setActiveClipDrawer(control);
    setActiveGlobalDrawer(null);
  };

  const handleApplyQuickText = () => {
    if (selectedClip && onUpdateClip) {
      onUpdateClip(selectedClip.id, { text: quickEditText });
    }
    setActiveClipDrawer(null);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#09090e] text-white overflow-hidden select-none touch-manipulation">
      
      {/* 1. TOP HEADER (48px) - CapCut Style Top Bar */}
      <header className="h-12 px-3 bg-[#111118] border-b border-[#1f1f2d] flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToPortal}
            className="p-1.5 rounded-lg bg-[#1a1a24] text-gray-300 hover:text-white border border-[#2a2a38] active:scale-95 transition"
            title="Home"
          >
            <FolderOpen className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Aspect Ratio Switcher */}
          <button
            onClick={() => onSetAspectRatio(aspectRatio === '9:16' ? '16:9' : aspectRatio === '16:9' ? '1:1' : '9:16')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1b1b26] text-[11px] font-semibold text-cyan-300 border border-[#2d2d40] active:scale-95 transition cursor-pointer"
          >
            <Ratio className="w-3 h-3 text-cyan-400" />
            <span>{aspectRatio}</span>
            <ChevronDown className="w-3 h-3 text-cyan-400" />
          </button>

          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold font-mono border border-emerald-500/30">
            1080P
          </span>
        </div>

        {/* Undo, Redo, and Export Actions */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={onUndo} 
            disabled={!canUndo}
            className={`p-2 rounded-lg transition active:scale-95 ${canUndo ? 'text-gray-200 bg-[#1a1a24]' : 'text-gray-600 opacity-40'}`}
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button 
            onClick={onRedo} 
            disabled={!canRedo}
            className={`p-2 rounded-lg transition active:scale-95 ${canRedo ? 'text-gray-200 bg-[#1a1a24]' : 'text-gray-600 opacity-40'}`}
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 text-black font-extrabold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </header>

      {/* 2. PREVIEW PLAYER STAGE (~35vh) */}
      <div className="relative h-[35vh] w-full bg-[#050508] flex items-center justify-center p-2 shrink-0 overflow-hidden">
        {renderPreviewPlayer()}
      </div>

      {/* 3. TIMEPLAY & PLAYHEAD CONTROLS (36px) */}
      <div className="h-9 px-4 bg-[#12121a] border-y border-[#1e1e2c] flex items-center justify-between text-xs font-mono text-gray-400 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-bold tracking-tight">{formatTime(currentTime)}</span>
          <span className="text-gray-600 font-normal">/ {formatTime(duration)}</span>
        </div>

        <div className="flex items-center gap-3">
          {selectedClip && (
            <div className="flex items-center gap-1.5 bg-[#1a1a26] px-2.5 py-0.5 rounded-full text-[10px] text-cyan-300 border border-cyan-500/40 animate-in fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="truncate max-w-[100px] font-semibold capitalize">{selectedClip.name || selectedClip.type}</span>
            </div>
          )}

          <button 
            onClick={onTogglePlay}
            className="w-7 h-7 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-lg shadow-cyan-400/30 active:scale-90 transition cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>
        </div>
      </div>

      {/* 4. MULTI-TRACK TIMELINE */}
      <div className="flex-1 w-full bg-[#07070b] overflow-hidden relative">
        {renderTimeline()}
      </div>

      {/* 5. SLIDE-UP DRAWER (Dynamic for Main Tabs or Inspector Controls) */}
      {(activeGlobalDrawer || activeClipDrawer) && (
        <div className="absolute inset-x-0 bottom-16 max-h-[72vh] bg-[#12121b] border-t-2 border-cyan-500/60 rounded-t-2xl shadow-2xl z-40 flex flex-col animate-in slide-in-from-bottom duration-200">
          
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#171724] border-b border-[#252538] rounded-t-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                {activeGlobalDrawer === 'media' && <Layers className="w-3.5 h-3.5" />}
                {activeGlobalDrawer === 'audio' && <Music className="w-3.5 h-3.5" />}
                {activeGlobalDrawer === 'text' && <Type className="w-3.5 h-3.5" />}
                {activeGlobalDrawer === 'overlay' && <ImageIcon className="w-3.5 h-3.5" />}
                {activeGlobalDrawer === 'effects' && <Wand2 className="w-3.5 h-3.5" />}
                {activeGlobalDrawer === 'filters' && <Palette className="w-3.5 h-3.5" />}
                {activeGlobalDrawer === 'adjustment' && <SlidersHorizontal className="w-3.5 h-3.5" />}
                {activeGlobalDrawer === 'autosegment' && <Zap className="w-3.5 h-3.5" />}
                {activeGlobalDrawer === 'stickers' && <Smile className="w-3.5 h-3.5" />}
                {activeGlobalDrawer === 'canvas' && <Sun className="w-3.5 h-3.5" />}
                {activeClipDrawer && <Sliders className="w-3.5 h-3.5" />}
                
                {activeClipDrawer 
                  ? `Clip Control: ${activeClipDrawer}`
                  : activeGlobalDrawer === 'autosegment'
                  ? 'AI Auto-Sync & Segmentation Studio'
                  : activeGlobalDrawer === 'media'
                  ? 'Media & Assets Library'
                  : `${activeGlobalDrawer} Studio`}
              </span>
            </div>
            <button 
              onClick={() => {
                setActiveGlobalDrawer(null);
                setActiveClipDrawer(null);
              }}
              className="p-1 rounded-lg bg-[#222234] text-gray-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-3 overflow-y-auto flex-1 max-h-[62vh] custom-scrollbar">
            
            {/* Quick Text Editor Sub-Modal */}
            {activeClipDrawer === 'editText' && selectedClip && (
              <div className="space-y-3 p-1">
                <label className="text-xs text-gray-300 font-semibold">Edit Text Content:</label>
                <textarea
                  value={quickEditText}
                  onChange={(e) => setQuickEditText(e.target.value)}
                  className="w-full h-28 bg-[#181824] border border-[#2f2f45] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-400 font-sans"
                  placeholder="Type subtitle or text here..."
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setActiveClipDrawer(null)}
                    className="px-4 py-2 rounded-xl bg-[#222232] text-gray-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyQuickText}
                    className="px-5 py-2 rounded-xl bg-cyan-500 text-black text-xs font-bold shadow-md shadow-cyan-500/20"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* AI Auto-Segmentation Quick Drawer */}
            {activeGlobalDrawer === 'autosegment' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-400">
                  Select an AI auto-segmentation tool to automatically split, align, and sync your audio/video timeline:
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => {
                      if (onAutoSegmentAudio) onAutoSegmentAudio();
                      setActiveGlobalDrawer(null);
                    }}
                    className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-[#1b1b2a] border border-[#2e2e46] hover:border-cyan-500/50 text-left active:scale-95 transition cursor-pointer"
                  >
                    <Zap className="w-6 h-6 text-amber-400 mb-1.5" />
                    <span className="text-xs font-bold text-gray-100">Audio Ayah Segment</span>
                    <span className="text-[10px] text-gray-400 text-center mt-0.5">Split speech by pauses</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onAutoSyncVideoToAyahs) onAutoSyncVideoToAyahs();
                      setActiveGlobalDrawer(null);
                    }}
                    className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-[#1b1b2a] border border-[#2e2e46] hover:border-cyan-500/50 text-left active:scale-95 transition cursor-pointer"
                  >
                    <Film className="w-6 h-6 text-cyan-400 mb-1.5" />
                    <span className="text-xs font-bold text-gray-100">Video-Ayah Sync</span>
                    <span className="text-[10px] text-gray-400 text-center mt-0.5">Sync B-rolls to recitation</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onAutoRemoveSilence) onAutoRemoveSilence();
                      setActiveGlobalDrawer(null);
                    }}
                    className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-[#1b1b2a] border border-[#2e2e46] hover:border-cyan-500/50 text-left active:scale-95 transition cursor-pointer"
                  >
                    <Scissors className="w-6 h-6 text-rose-400 mb-1.5" />
                    <span className="text-xs font-bold text-gray-100">Silence Remover</span>
                    <span className="text-[10px] text-gray-400 text-center mt-0.5">Cut dead air & pauses</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onAutoSegmentRhythm) onAutoSegmentRhythm();
                      setActiveGlobalDrawer(null);
                    }}
                    className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-[#1b1b2a] border border-[#2e2e46] hover:border-cyan-500/50 text-left active:scale-95 transition cursor-pointer"
                  >
                    <Sparkles className="w-6 h-6 text-purple-400 mb-1.5" />
                    <span className="text-xs font-bold text-gray-100">Rhythm & Beat Split</span>
                    <span className="text-[10px] text-gray-400 text-center mt-0.5">Auto cut to music beats</span>
                  </button>
                </div>
              </div>
            )}

            {/* Inspector Render (For Clip Control Drawer or Adjust Tab) */}
            {(activeClipDrawer || activeGlobalDrawer === 'adjustment') && activeClipDrawer !== 'editText' && (
              <div>
                {renderInspector()}
              </div>
            )}

            {/* Dedicated MediaPanel Tabs Render */}
            {activeGlobalDrawer && activeGlobalDrawer !== 'adjustment' && activeGlobalDrawer !== 'autosegment' && (
              <div>
                {renderMediaPanel(
                  activeGlobalDrawer === 'media' ? 'upload' :
                  activeGlobalDrawer === 'overlay' ? 'video' :
                  activeGlobalDrawer === 'canvas' ? 'background' :
                  activeGlobalDrawer
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* 6. BOTTOM NAVIGATION TOOLBAR (Dynamic: Global Menu vs Clip Context Menu) */}
      <nav className="h-16 bg-[#0c0c14] border-t border-[#1e1e2d] flex items-center z-50 shrink-0 shadow-2xl relative">
        
        {/* CASE A: A CLIP IS SELECTED -> SHOW CONTEXTUAL ACTION BAR */}
        {selectedClip ? (
          <div className="flex items-center gap-2 overflow-x-auto touch-pan-x no-scrollbar px-2 py-1 w-full animate-in fade-in duration-150">
            
            {/* 1. Deselect / Close Button */}
            <button
              onClick={onDeselectClip}
              className="flex flex-col items-center justify-center shrink-0 min-w-[56px] px-2 py-1 rounded-xl bg-[#1a1a28] border border-[#2f2f45] text-gray-300 active:scale-95 transition"
              title="Deselect Clip"
            >
              <ArrowLeft className="w-4 h-4 mb-0.5 text-cyan-400" />
              <span className="text-[10px] font-bold">Done</span>
            </button>

            {/* 2. Split Button */}
            <button
              onClick={onSplitClip}
              className="flex flex-col items-center justify-center shrink-0 min-w-[56px] px-2 py-1 rounded-xl bg-[#141420] border border-[#222234] hover:border-cyan-500/40 text-gray-300 active:scale-95 transition"
            >
              <Scissors className="w-4 h-4 mb-0.5 text-cyan-400" />
              <span className="text-[10px] font-medium">Split</span>
            </button>

            {/* 3. Type-Specific Context Controls */}
            {/* VIDEO & IMAGE CONTROLS */}
            {(selectedClip.type === 'video' || selectedClip.type === 'image') && (
              <>
                <button
                  onClick={() => handleOpenClipControl('speed')}
                  className="flex flex-col items-center justify-center shrink-0 min-w-[56px] px-2 py-1 rounded-xl bg-[#141420] border border-[#222234] hover:border-cyan-500/40 text-gray-300 active:scale-95 transition"
                >
                  <Gauge className="w-4 h-4 mb-0.5 text-amber-400" />
                  <span className="text-[10px] font-medium">Speed</span>
                </button>

                <button
                  onClick={() => handleOpenClipControl('volume')}
                  className="flex flex-col items-center justify-center shrink-0 min-w-[56px] px-2 py-1 rounded-xl bg-[#141420] border border-[#222234] hover:border-cyan-500/40 text-gray-300 active:scale-95 transition"
                >
                  <Volume2 className="w-4 h-4 mb-0.5 text-emerald-400" />
                  <span className="text-[10px] font-medium">Volume</span>
                </button>

                <button
                  onClick={() => handleOpenClipControl('animation')}
                  className="flex flex-col items-center justify-center shrink-0 min-w-[56px] px-2 py-1 rounded-xl bg-[#141420] border border-[#222234] hover:border-cyan-500/40 text-gray-300 active:scale-95 transition"
                >
                  <Sparkles className="w-4 h-4 mb-0.5 text-purple-400" />
                  <span className="text-[10px] font-medium">Animation</span>
                </button>

                <button
                  onClick={() => handleOpenClipControl('transform')}
                  className="flex flex-col items-center justify-center shrink-0 min-w-[56px] px-2 py-1 rounded-xl bg-[#141420] border border-[#222234] hover:border-cyan-500/40 text-gray-300 active:scale-95 transition"
                >
                  <Move className="w-4 h-4 mb-0.5 text-cyan-400" />
                  <span className="text-[10px] font-medium">Transform</span>
                </button>

                <button
                  onClick={() => handleOpenClipControl('filters')}
                  className="flex flex-col items-center justify-center shrink-0 min-w-[56px] px-2 py-1 rounded-xl bg-[#141420] border border-[#222234] hover:border-cyan-500/40 text-gray-300 active:scale-95 transition"
                >
                  <Palette className="w-4 h-4 mb-0.5 text-teal-400" />
                  <span className="text-[10px] font-medium">Filter</span>
                </button>

                <button
                  onClick={() => handleOpenClipControl('adjust')}
                  className="flex flex-col items-center justify-center shrink-0 min-w-[56px] px-2 py-1 rounded-xl bg-[#141420] border border-[#222234] hover:border-cyan-500/40 text-gray-300 active:scale-95 transition"
                >
                  <SlidersHorizontal className="w-4 h-4 mb-0.5 text-yellow-400" />
                  <span className="text-[10px] font-medium">Adjust</span>
                </button>
              </>
            )}

            {/* AUDIO CONTROLS */}
            {selectedClip.type === 'audio' && (
              <>
                <button
                  onClick={() => handleOpenClipControl('volume')}
                  className="flex flex-col items-center justify-center shrink-0 min-w-[56px] px-2 py-1 rounded-xl bg-[#141420] border border-[#222234] hover:border-cyan-500/40 text-gray-300 active:scale-95 transition"
                >
                  <Volume2 className="w-4 h-4 mb-0.5 text-emerald-400" />
                  <span className="text-[10px] font-medium">Volume</span>
                </button>

                <button
                  onClick={() => handleOpenClipControl('fade')}
                  className="flex flex-col items-center justify-center shrink-0 min-w-[56px] px-2 py-1 rounded-xl bg-[#141420] border border-[#222234] hover:border-cyan-500/40 text-gray-300 active:scale-95 transition"
                >
                  <Sliders className="w-4 h-4 mb-0.5 text-indigo-400" />
                  <span className="text-[10px] font-medium">Fade</span>
                </button>

                <button
                  onClick={() => handleOpenClipControl('speed')}
                  className="flex flex-col items-center justify-center shrink-0 min-w-[56px] px-2 py-1 rounded-xl bg-[#141420] border border-[#222234] hover:border-cyan-500/40 text-gray-300 active:scale-95 transition"
                >
                  <Gauge className="w-4 h-4 mb-0.5 text-amber-400" />
                  <span className="text-[10px] font-medium">Speed</span>
                </button>

                <button
                  onClick={() => handleOpenClipControl('voiceFx')}
                  className="flex flex-col items-center justify-center shrink-0 min-w-[56px] px-2 py-1 rounded-xl bg-[#141420] border border-[#222234] hover:border-cyan-500/40 text-gray-300 active:scale-95 transition"
                >
                  <Mic className="w-4 h-4 mb-0.5 text-rose-400" />
                  <span className="text-[10px] font-medium">Voice FX</span>
                </button>
              </>
            )}

            {/* TEXT & SUBTITLE CONTROLS */}
            {selectedClip.type === 'text' && (
              <>
                <button
                  onClick={() => handleOpenClipControl('editText')}
                  className="flex flex-col items-center justify-center shrink-0 min-w-[56px] px-2 py-1 rounded-xl bg-[#141420] border border-[#222234] hover:border-cyan-500/40 text-gray-300 active:scale-95 transition"
                >
                  <MessageSquare className="w-4 h-4 mb-0.5 text-cyan-400" />
                  <span className="text-[10px] font-medium">Edit Text</span>
                </button>

                <button
                  onClick={() => handleOpenClipControl('textStyle')}
                  className="flex flex-col items-center justify-center shrink-0 min-w-[56px] px-2 py-1 rounded-xl bg-[#141420] border border-[#222234] hover:border-cyan-500/40 text-gray-300 active:scale-95 transition"
                >
                  <Type className="w-4 h-4 mb-0.5 text-amber-400" />
                  <span className="text-[10px] font-medium">Font & Style</span>
                </button>

                <button
                  onClick={() => handleOpenClipControl('animation')}
                  className="flex flex-col items-center justify-center shrink-0 min-w-[56px] px-2 py-1 rounded-xl bg-[#141420] border border-[#222234] hover:border-cyan-500/40 text-gray-300 active:scale-95 transition"
                >
                  <Sparkles className="w-4 h-4 mb-0.5 text-purple-400" />
                  <span className="text-[10px] font-medium">Animation</span>
                </button>
              </>
            )}

            {/* Duplicate Button */}
            <button
              onClick={() => onDuplicateClip(selectedClip.id)}
              className="flex flex-col items-center justify-center shrink-0 min-w-[56px] px-2 py-1 rounded-xl bg-[#141420] border border-[#222234] hover:border-cyan-500/40 text-gray-300 active:scale-95 transition"
            >
              <Copy className="w-4 h-4 mb-0.5 text-teal-400" />
              <span className="text-[10px] font-medium">Duplicate</span>
            </button>

            {/* Delete Button */}
            <button
              onClick={() => onDeleteClip(selectedClip.id)}
              className="flex flex-col items-center justify-center shrink-0 min-w-[56px] px-2 py-1 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 active:scale-95 transition"
            >
              <Trash2 className="w-4 h-4 mb-0.5 text-red-400" />
              <span className="text-[10px] font-medium">Delete</span>
            </button>

          </div>
        ) : (
          /* CASE B: NO CLIP IS SELECTED -> SHOW GLOBAL CAPCUT TOOLBAR */
          <div className="flex items-center gap-2 overflow-x-auto touch-pan-x no-scrollbar px-3 py-1 w-full">
            {globalNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeGlobalDrawer === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleOpenGlobalTab(item.id)}
                  className={`flex flex-col items-center justify-center shrink-0 min-w-[62px] px-2.5 py-1.5 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
                    isActive 
                      ? 'text-cyan-300 bg-cyan-500/20 border border-cyan-400/40 shadow-md shadow-cyan-500/10 font-bold' 
                      : 'text-gray-400 hover:text-gray-200 bg-[#141420] border border-[#222234] hover:border-gray-600'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1 transition-transform ${isActive ? 'scale-110 text-cyan-300' : 'text-gray-400'}`} />
                  <span className="text-[10px] leading-none whitespace-nowrap font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

      </nav>

    </div>
  );
};
