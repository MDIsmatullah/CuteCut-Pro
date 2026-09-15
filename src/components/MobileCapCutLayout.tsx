import React, { useState } from 'react';
import { 
  Scissors, Music, Type, Layers, Wand2, Sliders, Palette, 
  Play, Pause, Undo2, Redo2, Download, ChevronDown, X,
  FolderOpen, Sparkles, SlidersHorizontal, Image as ImageIcon,
  Check, Volume2, Split, Trash2, Copy
} from 'lucide-react';
import { Clip, Track, WatermarkSettings } from '../types';

export type MobileTab = 'edit' | 'audio' | 'text' | 'overlay' | 'effects' | 'filters' | 'adjust' | null;

interface MobileCapCutLayoutProps {
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
  onSplitClip: () => void;
  onDeleteClip: (id: string) => void;
  onDuplicateClip: (id: string) => void;
  renderPreviewPlayer: () => React.ReactNode;
  renderTimeline: () => React.ReactNode;
  renderMediaPanel: () => React.ReactNode;
  renderInspector: () => React.ReactNode;
}

export const MobileCapCutLayout: React.FC<MobileCapCutLayoutProps> = ({
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
  onSplitClip,
  onDeleteClip,
  onDuplicateClip,
  renderPreviewPlayer,
  renderTimeline,
  renderMediaPanel,
  renderInspector
}) => {
  const [activeDrawer, setActiveDrawer] = useState<MobileTab | 'media' | 'inspector' | null>(null);

  const bottomNavItems: { id: MobileTab | 'media' | 'inspector'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'media', label: 'Media', icon: Layers },
    { id: 'edit', label: 'Edit', icon: Scissors },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'inspector', label: 'Adjust', icon: SlidersHorizontal },
    { id: 'filters', label: 'Filters', icon: Palette },
    { id: 'effects', label: 'Effects', icon: Wand2 },
    { id: 'overlay', label: 'Overlay', icon: ImageIcon },
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#09090e] text-white overflow-hidden select-none touch-manipulation">
      
      {/* 1. TOP HEADER (48px) - CapCut Style Top Bar */}
      <header className="h-12 px-3 bg-[#111118] border-b border-[#1f1f2d] flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToPortal}
            className="p-1.5 rounded-lg bg-[#1a1a24] text-gray-300 hover:text-white border border-[#2a2a38] active:scale-95"
            title="Home"
          >
            <FolderOpen className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Aspect Ratio Switcher */}
          <button
            onClick={() => onSetAspectRatio(aspectRatio === '9:16' ? '16:9' : aspectRatio === '16:9' ? '1:1' : '9:16')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1b1b26] text-[11px] font-semibold text-cyan-300 border border-[#2d2d40] active:scale-95 transition"
          >
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
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 text-black font-extrabold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </header>

      {/* 2. PREVIEW PLAYER STAGE (~36vh) */}
      <div className="relative h-[36vh] w-full bg-[#050508] flex items-center justify-center p-2 shrink-0 overflow-hidden">
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
            <div className="flex items-center gap-1 bg-[#1a1a26] px-2 py-0.5 rounded text-[10px] text-gray-300 border border-cyan-500/30">
              <span className="truncate max-w-[90px]">{selectedClip.name || selectedClip.type}</span>
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

      {/* 5. SLIDE-UP BOTTOM DRAWER (MediaPanel / Inspector / Quick Tools) */}
      {activeDrawer && (
        <div className="absolute inset-x-0 bottom-14 max-h-[70vh] bg-[#12121b] border-t-2 border-cyan-500/50 rounded-t-2xl shadow-2xl z-40 flex flex-col animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#171724] border-b border-[#252538] rounded-t-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                {activeDrawer === 'media' ? 'Media & Quran Studio' : activeDrawer === 'inspector' ? 'Clip Adjuster & Effects' : `${activeDrawer} Panel`}
              </span>
            </div>
            <button 
              onClick={() => setActiveDrawer(null)}
              className="p-1 rounded-lg bg-[#222234] text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 overflow-y-auto flex-1 max-h-[60vh]">
            {activeDrawer === 'media' && renderMediaPanel()}
            {activeDrawer === 'inspector' && renderInspector()}
            {activeDrawer === 'edit' && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={onSplitClip}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#1b1b28] hover:bg-[#252538] border border-[#2e2e42] text-gray-200 active:scale-95"
                  >
                    <Scissors className="w-5 h-5 text-cyan-400 mb-1" />
                    <span className="text-xs font-bold">Split Clip</span>
                  </button>

                  <button
                    onClick={() => selectedClip && onDuplicateClip(selectedClip.id)}
                    disabled={!selectedClip}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-gray-200 active:scale-95 ${
                      selectedClip ? 'bg-[#1b1b28] hover:bg-[#252538] border-[#2e2e42]' : 'bg-[#14141d] border-transparent opacity-40'
                    }`}
                  >
                    <Copy className="w-5 h-5 text-teal-400 mb-1" />
                    <span className="text-xs font-bold">Duplicate</span>
                  </button>

                  <button
                    onClick={() => selectedClip && onDeleteClip(selectedClip.id)}
                    disabled={!selectedClip}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-red-300 active:scale-95 ${
                      selectedClip ? 'bg-red-500/10 hover:bg-red-500/20 border-red-500/30' : 'bg-[#14141d] border-transparent opacity-40'
                    }`}
                  >
                    <Trash2 className="w-5 h-5 text-red-400 mb-1" />
                    <span className="text-xs font-bold">Delete</span>
                  </button>
                </div>
                {renderInspector()}
              </div>
            )}
            {(activeDrawer === 'text' || activeDrawer === 'audio' || activeDrawer === 'filters') && (
              <div>{renderMediaPanel()}</div>
            )}
          </div>
        </div>
      )}

      {/* 6. BOTTOM NAVIGATION TOOLBAR (Horizontal Scroll Slider) */}
      <nav className="h-16 bg-[#0d0d15] border-t border-[#1e1e2d] flex items-center z-50 shrink-0 shadow-2xl relative">
        <div className="flex items-center gap-2.5 overflow-x-auto touch-pan-x no-scrollbar px-3 py-1 w-full">
          {bottomNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeDrawer === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveDrawer(activeDrawer === item.id ? null : item.id)}
                className={`flex flex-col items-center justify-center shrink-0 min-w-[64px] px-3 py-1.5 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
                  isActive 
                    ? 'text-cyan-300 bg-cyan-500/20 border border-cyan-400/40 shadow-md shadow-cyan-500/10 font-bold' 
                    : 'text-gray-400 hover:text-gray-200 bg-[#141420] border border-[#222234] hover:border-gray-600'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 transition-transform ${isActive ? 'scale-110 text-cyan-300' : 'text-gray-400'}`} />
                <span className="text-[11px] leading-none whitespace-nowrap font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

    </div>
  );
};
