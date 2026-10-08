import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Scissors, Music, Type, Layers, Wand2, Sliders, Palette, 
  Play, Pause, Undo2, Redo2, Download, ChevronDown, X,
  FolderOpen, Sparkles, SlidersHorizontal, Image as ImageIcon,
  Check, Volume2, Split, Trash2, Copy, Zap, ArrowLeft,
  Ratio, Smile, Move, Eye, RotateCw, ZoomIn, ZoomOut, Mic, Film,
  AlignLeft, Sun, MessageSquare, Gauge, Bell, BookOpen,
  Maximize2, Plus, VolumeX, Repeat, Volume1, FileAudio, ShieldCheck
} from 'lucide-react';
import { Track, Clip, ClipType } from '../types';
import VideoFilmstripVisual from './VideoFilmstripVisual';
import AudioWaveformGraph from './AudioWaveformGraph';
import { formatTimeCode } from '../utils/editorUtils';

export type GlobalMobileTab = 
  | 'media' 
  | 'audio' 
  | 'sfx'
  | 'quran'
  | 'visuals'
  | 'veo'
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
  tracks?: Track[];
  zoom?: number;
  onZoomChange?: (newZoom: number) => void;
  onSeek?: (time: number) => void;
  onUpdateClipTimes?: (clipId: string, start: number, duration: number) => void;
  onSelectClip?: (clip: Clip | null) => void;
  onAddTrack?: (type: ClipType) => void;
  onAutoSegmentAudio?: () => void;
  onAutoSyncVideoToAyahs?: () => void;
  onAutoRemoveSilence?: () => void;
  onAutoSegmentRhythm?: () => void;
  onOpenVeoAnimateModal?: (mode?: 'prompt_to_video' | 'image_to_video') => void;
  onOpenAiPromptStudio?: () => void;
  onOpenQuranStudio?: () => void;
  onToggleLoop?: () => void;
  isLooping?: boolean;
  onToggleTrackMute?: (trackId: string) => void;
  onToggleTrackLock?: (trackId: string) => void;
  onToggleTrackHidden?: (trackId: string) => void;
  renderPreviewPlayer: () => React.ReactNode;
  renderTimeline?: () => React.ReactNode;
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
  tracks = [],
  zoom = 50,
  onZoomChange,
  onSeek,
  onUpdateClipTimes,
  onSelectClip,
  onAddTrack,
  onAutoSegmentAudio,
  onAutoSyncVideoToAyahs,
  onAutoRemoveSilence,
  onAutoSegmentRhythm,
  onOpenVeoAnimateModal,
  onOpenAiPromptStudio,
  onOpenQuranStudio,
  onToggleLoop,
  isLooping = false,
  onToggleTrackMute,
  onToggleTrackLock,
  onToggleTrackHidden,
  renderPreviewPlayer,
  renderTimeline,
  renderMediaPanel,
  renderInspector
}) => {
  const [activeGlobalDrawer, setActiveGlobalDrawer] = useState<GlobalMobileTab>(null);
  const [activeClipDrawer, setActiveClipDrawer] = useState<ClipControlTab>(null);
  const [quickEditText, setQuickEditText] = useState('');
  const [isMuteMainTrack, setIsMuteMainTrack] = useState(false);

  // Timeline scrolling and center playhead synchronization
  const timelineScrollRef = useRef<HTMLDivElement>(null);
  const isUserInteractingRef = useRef<boolean>(false);
  const isTrimmingRef = useRef<{ clipId: string; edge: 'left' | 'right'; startX: number; origStart: number; origDur: number } | null>(null);
  const isMovingClipRef = useRef<{ clipId: string; startX: number; origStart: number; origDur: number } | null>(null);

  // Pinch-to-zoom pinch touch state
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef<number>(zoom);

  // Main Global Bottom Navigation Items (When NO clip is selected) - CapCut Style
  const globalNavItems: { id: GlobalMobileTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'media', label: 'Media', icon: Layers },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'quran', label: 'Quran AI', icon: BookOpen },
    { id: 'visuals', label: 'B-Rolls', icon: Sparkles },
    { id: 'overlay', label: 'Overlay', icon: ImageIcon },
    { id: 'effects', label: 'Effects', icon: Wand2 },
    { id: 'autosegment', label: 'Auto-Sync', icon: Zap },
    { id: 'filters', label: 'Filters', icon: Palette },
    { id: 'adjustment', label: 'Adjust', icon: SlidersHorizontal },
    { id: 'veo', label: 'Veo AI', icon: Sparkles },
    { id: 'sfx', label: 'Sound FX', icon: Bell },
    { id: 'stickers', label: 'Stickers', icon: Smile },
    { id: 'canvas', label: 'Canvas', icon: Sun },
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  const formatShortTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Sync timeline scroll position with currentTime during playback (Center Playhead Locking)
  useEffect(() => {
    if (!timelineScrollRef.current || isUserInteractingRef.current || isTrimmingRef.current || isMovingClipRef.current) return;
    const container = timelineScrollRef.current;
    const targetScroll = currentTime * zoom;
    if (Math.abs(container.scrollLeft - targetScroll) > 1.5) {
      container.scrollLeft = targetScroll;
    }
  }, [currentTime, zoom, isPlaying]);

  // Handle touch/pointer horizontal scrubbing on timeline
  const handleTimelineScroll = useCallback(() => {
    if (!timelineScrollRef.current || !onSeek || isTrimmingRef.current || isMovingClipRef.current) return;
    if (isUserInteractingRef.current) {
      const container = timelineScrollRef.current;
      const newTime = Math.max(0, Math.min(duration, container.scrollLeft / zoom));
      onSeek(Number(newTime.toFixed(2)));
    }
  }, [duration, zoom, onSeek]);

  // Touch event handlers for timeline (including multi-touch pinch to zoom)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch gesture start
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStartDistRef.current = Math.hypot(dx, dy);
      pinchStartZoomRef.current = zoom;
      isUserInteractingRef.current = false;
      return;
    }
    isUserInteractingRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDistRef.current && onZoomChange) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.hypot(dx, dy);
      const factor = currentDist / pinchStartDistRef.current;
      const newZoom = Math.max(15, Math.min(180, Math.round(pinchStartZoomRef.current * factor)));
      onZoomChange(newZoom);
    }
  };

  const handleTouchEnd = () => {
    pinchStartDistRef.current = null;
    isUserInteractingRef.current = false;
    if (timelineScrollRef.current && onSeek && !isTrimmingRef.current && !isMovingClipRef.current) {
      const container = timelineScrollRef.current;
      const newTime = Math.max(0, Math.min(duration, container.scrollLeft / zoom));
      onSeek(Number(newTime.toFixed(2)));
    }
  };

  // Trim handle dragging logic (CapCut Style Trim Handles)
  const handleTrimStart = (e: React.TouchEvent | React.MouseEvent, clip: Clip, edge: 'left' | 'right') => {
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    isTrimmingRef.current = {
      clipId: clip.id,
      edge,
      startX: clientX,
      origStart: clip.start,
      origDur: clip.duration
    };

    const handleMove = (moveEv: TouchEvent | MouseEvent) => {
      if (!isTrimmingRef.current || !onUpdateClipTimes) return;
      const curX = 'touches' in moveEv ? moveEv.touches[0].clientX : (moveEv as MouseEvent).clientX;
      const deltaPx = curX - isTrimmingRef.current.startX;
      const deltaSec = deltaPx / zoom;

      if (isTrimmingRef.current.edge === 'left') {
        const newStart = Math.max(0, isTrimmingRef.current.origStart + deltaSec);
        const newDur = Math.max(0.4, isTrimmingRef.current.origDur - (newStart - isTrimmingRef.current.origStart));
        onUpdateClipTimes(isTrimmingRef.current.clipId, Number(newStart.toFixed(2)), Number(newDur.toFixed(2)));
        if (onSeek) onSeek(newStart);
      } else {
        const newDur = Math.max(0.4, isTrimmingRef.current.origDur + deltaSec);
        onUpdateClipTimes(isTrimmingRef.current.clipId, isTrimmingRef.current.origStart, Number(newDur.toFixed(2)));
        if (onSeek) onSeek(isTrimmingRef.current.origStart + newDur);
      }
    };

    const handleUp = () => {
      isTrimmingRef.current = null;
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  // When a clip gets selected, auto-dismiss any open global drawer so the clip action toolbar is immediately prominent
  useEffect(() => {
    if (selectedClip) {
      setActiveGlobalDrawer(null);
    }
  }, [selectedClip?.id]);

  // Clip body dragging logic (Move clip horizontally along timeline)
  const handleClipMoveStart = (e: React.TouchEvent | React.MouseEvent, clip: Clip) => {
    e.stopPropagation();
    if (onSelectClip) onSelectClip(clip);

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    isMovingClipRef.current = {
      clipId: clip.id,
      startX: clientX,
      origStart: clip.start,
      origDur: clip.duration
    };

    let dragThresholdPassed = false;

    const handleMove = (moveEv: TouchEvent | MouseEvent) => {
      if (!isMovingClipRef.current || !onUpdateClipTimes) return;
      const curX = 'touches' in moveEv ? moveEv.touches[0].clientX : (moveEv as MouseEvent).clientX;
      const curY = 'touches' in moveEv ? moveEv.touches[0].clientY : (moveEv as MouseEvent).clientY;
      const deltaPx = curX - isMovingClipRef.current.startX;
      const deltaPy = curY - clientY;

      // Require intentional horizontal drag (> 12px) before moving clip
      if (!dragThresholdPassed) {
        if (Math.abs(deltaPx) < 12 || Math.abs(deltaPy) > Math.abs(deltaPx) * 1.5) {
          return;
        }
        dragThresholdPassed = true;
      }

      const deltaSec = deltaPx / zoom;

      const newStart = Math.max(0, Number((isMovingClipRef.current.origStart + deltaSec).toFixed(2)));
      onUpdateClipTimes(isMovingClipRef.current.clipId, newStart, isMovingClipRef.current.origDur);
      if (onSeek) onSeek(newStart);
    };

    const handleUp = () => {
      isMovingClipRef.current = null;
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
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
    if (control === 'editText' && selectedClip && (selectedClip.text || selectedClip.name)) {
      setQuickEditText(selectedClip.text || selectedClip.name || '');
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

  // Group tracks by main visual vs audio / text
  const mainVideoTrack = useMemo(() => tracks.find(t => t.type === ClipType.VIDEO) || tracks[0], [tracks]);
  const secondaryTracks = useMemo(() => tracks.filter(t => t !== mainVideoTrack), [tracks, mainVideoTrack]);

  const textTracks = useMemo(() => {
    return secondaryTracks.filter(t => t.type === ClipType.TEXT || t.id.includes('arabic') || t.id.includes('english') || t.id.includes('translation') || t.id.includes('subtitle') || t.name.toLowerCase().includes('arabic') || t.name.toLowerCase().includes('english') || t.name.toLowerCase().includes('urdu') || t.name.toLowerCase().includes('subtitle'));
  }, [secondaryTracks]);

  const audioTracks = useMemo(() => {
    return secondaryTracks.filter(t => t.type === ClipType.AUDIO && !t.id.includes('arabic') && !t.id.includes('english') && !t.id.includes('translation') && !t.id.includes('subtitle') && !t.name.toLowerCase().includes('arabic') && !t.name.toLowerCase().includes('english') && !t.name.toLowerCase().includes('urdu') && !t.name.toLowerCase().includes('subtitle'));
  }, [secondaryTracks]);

  // Generate CapCut style time ruler tick marks (every 1s / 0.5s)
  const totalRulerSeconds = Math.max(30, Math.ceil(duration + 15));
  const rulerTicks = useMemo(() => {
    const ticks: { sec: number; label: string; isMajor: boolean }[] = [];
    for (let s = 0; s <= totalRulerSeconds; s += 1) {
      ticks.push({
        sec: s,
        label: formatShortTime(s),
        isMajor: s % 2 === 0
      });
    }
    return ticks;
  }, [totalRulerSeconds]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#07070b] text-white overflow-hidden select-none touch-manipulation">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER (46px) - CapCut Style Top Bar                               */}
      {/* ========================================================================= */}
      <header className="h-11 px-3 bg-[#0d0d14] border-b border-[#181824] flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToPortal}
            className="p-1.5 rounded-lg bg-[#161622] text-gray-300 hover:text-white border border-[#242436] active:scale-95 transition cursor-pointer"
            title="Home"
          >
            <FolderOpen className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Aspect Ratio Switcher with Icon Badge */}
          <button
            onClick={() => onSetAspectRatio(aspectRatio === '9:16' ? '16:9' : aspectRatio === '16:9' ? '1:1' : '9:16')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#161622] text-[11px] font-bold text-cyan-300 border border-[#242436] active:scale-95 transition cursor-pointer"
            title={`Current: ${aspectRatio} (Click to switch 9:16 Shorts / 16:9 Landscape / 1:1 Square)`}
          >
            <Ratio className="w-3 h-3 text-cyan-400" />
            <span>{aspectRatio === '9:16' ? '9:16 Reel' : aspectRatio === '16:9' ? '16:9 4K' : '1:1 Post'}</span>
            <ChevronDown className="w-3 h-3 text-cyan-400" />
          </button>

          {/* CuteCut Pro Quran AI Fast Launcher Button */}
          {onOpenQuranStudio && (
            <button
              onClick={onOpenQuranStudio}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-[10px] font-bold border border-emerald-400/40 shadow-sm active:scale-95 transition cursor-pointer"
              title="Open CuteCut Pro Quran AI Model (114 Surahs)"
            >
              <BookOpen className="w-3 h-3 text-amber-300" />
              <span>Quran AI</span>
            </button>
          )}
        </div>

        {/* Undo, Redo, and Export Actions */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={onUndo} 
            disabled={!canUndo}
            className={`p-1.5 rounded-lg transition active:scale-95 ${canUndo ? 'text-gray-200 bg-[#161622] border border-[#242436]' : 'text-gray-600 opacity-40'}`}
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button 
            onClick={onRedo} 
            disabled={!canRedo}
            className={`p-1.5 rounded-lg transition active:scale-95 ${canRedo ? 'text-gray-200 bg-[#161622] border border-[#242436]' : 'text-gray-600 opacity-40'}`}
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-capcut-permissions'))}
            className="p-1.5 rounded-lg bg-[#161622] border border-[#242436] text-cyan-400 hover:text-white transition active:scale-95"
            title="CapCut Permissions & Hardware Access"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenExport}
            className="flex items-center gap-1 px-3.5 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 text-black font-black text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. PREVIEW PLAYER STAGE (~36vh on mobile) - Fixed High-Quality Viewport    */}
      {/* ========================================================================= */}
      <div className="relative h-[36vh] w-full bg-[#000000] flex items-center justify-center p-1 shrink-0 overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center">
          {renderPreviewPlayer()}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TIMEPLAY & PLAYHEAD CONTROLS (34px) - Clean CapCut Time Bar            */}
      {/* ========================================================================= */}
      <div className="h-8 px-3 bg-[#0d0d14] border-y border-[#181824] flex items-center justify-between text-xs font-mono text-gray-400 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-bold tracking-tight">{formatTime(currentTime)}</span>
          <span className="text-gray-500 font-normal">/ {formatTime(duration)}</span>

          {/* Quick Timeline Zoom Buttons for mobile */}
          {onZoomChange && (
            <div className="flex items-center gap-0.5 ml-2 bg-[#161624] px-1.5 py-0.5 rounded-md border border-[#252538]">
              <button
                onClick={() => onZoomChange(Math.max(15, zoom - 15))}
                className="text-gray-400 hover:text-white p-0.5 active:scale-90"
                title="Zoom Out Timeline"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <span className="text-[9px] text-gray-400 font-mono w-6 text-center">{zoom}px</span>
              <button
                onClick={() => onZoomChange(Math.min(180, zoom + 15))}
                className="text-gray-400 hover:text-white p-0.5 active:scale-90"
                title="Zoom In Timeline"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedClip && (
            <div className="flex items-center gap-1.5 bg-[#161624] px-2 py-0.5 rounded-full text-[10px] text-cyan-300 border border-cyan-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="truncate max-w-[100px] font-semibold">{selectedClip.name || selectedClip.type}</span>
            </div>
          )}

          {/* Loop playback toggle */}
          {onToggleLoop && (
            <button
              onClick={onToggleLoop}
              className={`p-1 rounded-md transition ${isLooping ? 'text-cyan-400 bg-cyan-500/20' : 'text-gray-500'}`}
              title={isLooping ? 'Loop is ON' : 'Loop is OFF'}
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Main Play/Pause Button */}
          <button 
            onClick={onTogglePlay}
            className="w-7 h-7 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 text-black flex items-center justify-center shadow-md shadow-cyan-400/30 active:scale-90 transition cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CAPCUT-STYLE MOBILE TIMELINE ENGINE (Center-Fixed Playhead & Scroller) */}
      {/* ========================================================================= */}
      <div className="flex-1 w-full bg-[#07070b] overflow-hidden relative flex flex-col">
        
        {/* CENTER FIXED WHITE PLAYHEAD NEEDLE (Fixed at exact 50% width) */}
        <div 
          className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-white z-40 pointer-events-none shadow-[0_0_8px_rgba(255,255,255,0.9)]"
          style={{ transform: 'translateX(-50%)' }}
        >
          {/* Top Diamond Marker */}
          <div className="w-3 h-3 bg-white rotate-45 -translate-x-[5px] -top-1 absolute shadow-sm" />
        </div>

        {/* HORIZONTAL SCROLLING TIMELINE TRACK CONTAINER */}
        <div 
          ref={timelineScrollRef}
          onScroll={handleTimelineScroll}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={() => { isUserInteractingRef.current = true; }}
          onMouseUp={handleTouchEnd}
          className="flex-1 w-full overflow-x-auto overflow-y-auto no-scrollbar relative cursor-grab active:cursor-grabbing"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* Inner Content with 50vw Pre-padding and 50vw Post-padding */}
          <div 
            className="min-h-full flex flex-col relative"
            style={{ 
              width: `${(duration + 15) * zoom + 600}px`,
              paddingLeft: '50vw',
              paddingRight: '50vw'
            }}
          >
            
            {/* 4.A TIME RULER (Top Tick Marks) */}
            <div className="h-6 w-full relative border-b border-[#181824] select-none pointer-events-none shrink-0">
              {rulerTicks.map(tick => (
                <div 
                  key={tick.sec}
                  className="absolute top-0 bottom-0 flex flex-col justify-end items-center"
                  style={{ left: `${tick.sec * zoom}px` }}
                >
                  {tick.isMajor && (
                    <span className="text-[9px] font-mono text-gray-500 -translate-x-1/2 mb-0.5">
                      {tick.label}
                    </span>
                  )}
                  <div className={`w-[1px] bg-gray-600 ${tick.isMajor ? 'h-2' : 'h-1'}`} />
                </div>
              ))}
            </div>

            {/* 4.C TEXT/SUBTITLE TRACKS (Quran Arabic, English Translation Subtitles) shown ABOVE the Video Track */}
            <div className="space-y-2 py-1 w-full relative">
              {textTracks.map((track) => {
                const isQuranArabic = track.id.includes('arabic') || track.name.toLowerCase().includes('arabic');
                const isTranslation = track.id.includes('english') || track.id.includes('translation') || track.name.toLowerCase().includes('english') || track.name.toLowerCase().includes('urdu');

                return (
                  <div 
                    key={track.id}
                    className={`relative w-full rounded-lg flex items-center ${
                      isQuranArabic
                        ? 'h-9 bg-[#1a1408]/80 border border-amber-900/50'
                        : 'h-8 bg-[#160c1d]/80 border border-purple-900/50'
                    }`}
                  >
                    {/* Left Track Badge Indicator */}
                    <div className="absolute right-full mr-2 flex items-center gap-1 shrink-0 z-10">
                      {isQuranArabic && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold font-mono border border-amber-500/30 flex items-center gap-1">
                          <BookOpen className="w-2.5 h-2.5" /> Ayah
                        </span>
                      )}
                      {isTranslation && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-bold font-mono border border-purple-500/30 flex items-center gap-1">
                          <Type className="w-2.5 h-2.5" /> Sub
                        </span>
                      )}
                      {onToggleTrackMute && (
                        <button
                          onClick={() => onToggleTrackMute(track.id)}
                          className={`p-1 rounded border text-[9px] ${track.muted ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-[#141420] text-gray-500 border-[#242436]'}`}
                          title={track.muted ? 'Unmute Track' : 'Mute Track'}
                        >
                          {track.muted ? <VolumeX className="w-2.5 h-2.5" /> : <Volume2 className="w-2.5 h-2.5" />}
                        </button>
                      )}
                    </div>

                    {track.clips.map(clip => {
                      const isSelected = selectedClip?.id === clip.id;
                      const clipLeft = clip.start * zoom;
                      const clipWidth = Math.max(24, clip.duration * zoom);

                      return (
                        <div
                          key={clip.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectClip) onSelectClip(clip);
                          }}
                          onTouchStart={(e) => {
                            handleClipMoveStart(e, clip);
                          }}
                          onMouseDown={(e) => {
                            handleClipMoveStart(e, clip);
                          }}
                          className={`absolute top-0.5 bottom-0.5 rounded-md overflow-hidden flex items-center px-1.5 transition-all cursor-pointer ${
                            isSelected 
                              ? 'border-2 border-white bg-cyan-900/60 shadow-lg z-20' 
                              : isQuranArabic
                              ? 'border border-amber-500/40 bg-[#2d1e07] text-amber-200 hover:border-amber-400'
                              : 'border border-purple-500/40 bg-[#25102f] text-purple-200 hover:border-purple-400'
                          }`}
                          style={{
                            left: `${clipLeft}px`,
                            width: `${clipWidth}px`
                          }}
                        >
                          {/* Label Text */}
                          <div className="relative z-10 flex items-center gap-1 text-[10px] font-semibold truncate w-full">
                            {isQuranArabic ? (
                              <BookOpen className="w-3 h-3 text-amber-400 shrink-0" />
                            ) : (
                              <Type className="w-3 h-3 text-purple-400 shrink-0" />
                            )}
                            <span className="truncate">{clip.text || clip.name || 'Subtitle'}</span>
                          </div>

                          {/* Trim Handles when selected */}
                          {isSelected && (
                            <>
                              <div 
                                onMouseDown={(e) => handleTrimStart(e, clip, 'left')}
                                onTouchStart={(e) => handleTrimStart(e, clip, 'left')}
                                className="absolute left-0 top-0 bottom-0 w-3 bg-white text-black flex items-center justify-center cursor-ew-resize z-30" 
                              />
                              <div 
                                onMouseDown={(e) => handleTrimStart(e, clip, 'right')}
                                onTouchStart={(e) => handleTrimStart(e, clip, 'right')}
                                className="absolute right-0 top-0 bottom-0 w-3 bg-white text-black flex items-center justify-center cursor-ew-resize z-30" 
                              />
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* 4.B MAIN VIDEO TRACK (With Cover & Mute toggle on Left, Filmstrip Clips in Center) */}
            <div className="py-2 flex items-center relative gap-2 shrink-0">
              
              {/* Left Cover / Mute Buttons */}
              <div className="absolute right-full mr-2 flex items-center gap-1 shrink-0 z-10">
                <button
                  onClick={() => setIsMuteMainTrack(!isMuteMainTrack)}
                  className={`p-1.5 rounded-lg border text-[10px] flex items-center gap-1 font-bold transition ${
                    isMuteMainTrack 
                      ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                      : 'bg-[#141420] text-gray-400 border-[#242436]'
                  }`}
                  title="Mute clip audio"
                >
                  {isMuteMainTrack ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">Mute</span>
                </button>

                <div className="p-1.5 rounded-lg bg-[#141420] border border-[#242436] text-gray-400 text-[10px] font-bold flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Cover</span>
                </div>
              </div>

              {/* Main Video Clips Filmstrip Row */}
              <div className="relative h-[62px] w-full flex items-center">
                {mainVideoTrack?.clips.map(clip => {
                  const isSelected = selectedClip?.id === clip.id;
                  const clipWidth = Math.max(30, clip.duration * zoom);
                  const clipLeft = clip.start * zoom;

                  return (
                    <div
                      key={clip.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectClip) onSelectClip(clip);
                      }}
                      onTouchStart={(e) => {
                        handleClipMoveStart(e, clip);
                      }}
                      onMouseDown={(e) => {
                        handleClipMoveStart(e, clip);
                      }}
                      className={`absolute top-0 bottom-0 rounded-lg overflow-hidden transition-all duration-100 flex flex-col justify-between cursor-pointer ${
                        isSelected 
                          ? 'border-[2.5px] border-white shadow-2xl shadow-white/30 z-20' 
                          : 'border border-[#2a2a3e] bg-[#12121c] hover:border-cyan-500/50 z-10'
                      }`}
                      style={{
                        left: `${clipLeft}px`,
                        width: `${clipWidth}px`
                      }}
                    >
                      {/* Filmstrip Background Visual */}
                      <div className="absolute inset-0 pointer-events-none opacity-80">
                        <VideoFilmstripVisual
                          clip={clip}
                          width={clipWidth}
                          isSelected={isSelected}
                          zoom={zoom}
                        />
                      </div>

                      {/* Header overlay badge with name & duration */}
                      <div className="relative z-10 px-2 py-0.5 bg-black/60 backdrop-blur-xs flex items-center justify-between text-[10px] text-white font-semibold">
                        <span className="truncate max-w-[140px] drop-shadow-sm">{clip.name || 'Video Clip'}</span>
                        <span className="font-mono text-cyan-300 drop-shadow-sm">{clip.duration.toFixed(1)}s</span>
                      </div>

                      {/* CAPCUT STYLE TRIM HANDLES (When selected) */}
                      {isSelected && (
                        <>
                          {/* Left Trim Handle */}
                          <div
                            onMouseDown={(e) => handleTrimStart(e, clip, 'left')}
                            onTouchStart={(e) => handleTrimStart(e, clip, 'left')}
                            className="absolute left-0 top-0 bottom-0 w-5 bg-white text-black flex items-center justify-center cursor-ew-resize z-30 shadow-md active:bg-cyan-300"
                          >
                            <div className="flex flex-col gap-0.5">
                              <div className="w-0.5 h-3 bg-black/80 rounded" />
                              <div className="w-0.5 h-3 bg-black/80 rounded" />
                            </div>
                          </div>

                          {/* Right Trim Handle */}
                          <div
                            onMouseDown={(e) => handleTrimStart(e, clip, 'right')}
                            onTouchStart={(e) => handleTrimStart(e, clip, 'right')}
                            className="absolute right-0 top-0 bottom-0 w-5 bg-white text-black flex items-center justify-center cursor-ew-resize z-30 shadow-md active:bg-cyan-300"
                          >
                            <div className="flex flex-col gap-0.5">
                              <div className="w-0.5 h-3 bg-black/80 rounded" />
                              <div className="w-0.5 h-3 bg-black/80 rounded" />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}

                {/* + Add Media Button at end of Main Track */}
                {mainVideoTrack && mainVideoTrack.clips.length > 0 && (
                  <button
                    onClick={() => handleOpenGlobalTab('media')}
                    className="absolute top-0 bottom-0 w-12 rounded-lg bg-[#141420] border border-dashed border-gray-600 hover:border-cyan-400 flex items-center justify-center text-gray-400 hover:text-white transition active:scale-95 cursor-pointer z-10"
                    style={{
                      left: `${Math.max(...mainVideoTrack.clips.map(c => (c.start + c.duration) * zoom)) + 12}px`
                    }}
                    title="Add Media"
                  >
                    <Plus className="w-5 h-5 text-cyan-400" />
                  </button>
                )}
              </div>
            </div>

            {/* 4.D AUDIO TRACKS shown BELOW the Video Track */}
            <div className="space-y-2 py-1 w-full relative">
              {audioTracks.map((track) => {
                return (
                  <div 
                    key={track.id}
                    className="relative w-full rounded-lg flex items-center h-10 bg-[#0c141d]/70 border border-cyan-950/40"
                  >
                    {/* Left Track Badge Indicator */}
                    <div className="absolute right-full mr-2 flex items-center gap-1 shrink-0 z-10">
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold font-mono border border-cyan-500/30 flex items-center gap-1">
                        <Mic className="w-2.5 h-2.5" /> Audio
                      </span>
                      {onToggleTrackMute && (
                        <button
                          onClick={() => onToggleTrackMute(track.id)}
                          className={`p-1 rounded border text-[9px] ${track.muted ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-[#141420] text-gray-500 border-[#242436]'}`}
                          title={track.muted ? 'Unmute Track' : 'Mute Track'}
                        >
                          {track.muted ? <VolumeX className="w-2.5 h-2.5" /> : <Volume2 className="w-2.5 h-2.5" />}
                        </button>
                      )}
                    </div>

                    {track.clips.map(clip => {
                      const isSelected = selectedClip?.id === clip.id;
                      const clipLeft = clip.start * zoom;
                      const clipWidth = Math.max(24, clip.duration * zoom);

                      return (
                        <div
                          key={clip.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectClip) onSelectClip(clip);
                          }}
                          onTouchStart={(e) => {
                            handleClipMoveStart(e, clip);
                          }}
                          onMouseDown={(e) => {
                            handleClipMoveStart(e, clip);
                          }}
                          className={`absolute top-0.5 bottom-0.5 rounded-md overflow-hidden flex items-center px-1.5 transition-all cursor-pointer ${
                            isSelected 
                              ? 'border-2 border-white bg-cyan-900/60 shadow-lg z-20' 
                              : 'border border-cyan-500/30 bg-[#0e212f] text-cyan-200 hover:border-cyan-400' 
                          }`}
                          style={{
                            left: `${clipLeft}px`,
                            width: `${clipWidth}px`
                          }}
                        >
                          {/* Audio Waveform Graphic */}
                          {clip.url && (
                            <div className="absolute inset-0 pointer-events-none opacity-80">
                              <AudioWaveformGraph
                                clipId={clip.id}
                                url={clip.url}
                                width={clipWidth}
                                height={36}
                                isSelected={isSelected}
                                volume={clip.volume ?? 1.0}
                                clipStart={clip.start}
                                clipDuration={clip.duration}
                                isPlaying={isPlaying}
                                showSilenceHighlights={false}
                                showBeatMarkers={true}
                              />
                            </div>
                          )}

                          {/* Label Text */}
                          <div className="relative z-10 flex items-center gap-1 text-[10px] font-semibold truncate w-full">
                            <Music className="w-3 h-3 text-cyan-400 shrink-0" />
                            <span className="truncate">{clip.text || clip.name || 'Audio Clip'}</span>
                          </div>

                          {/* Trim Handles when selected */}
                          {isSelected && (
                            <>
                              <div 
                                onMouseDown={(e) => handleTrimStart(e, clip, 'left')}
                                onTouchStart={(e) => handleTrimStart(e, clip, 'left')}
                                className="absolute left-0 top-0 bottom-0 w-3 bg-white text-black flex items-center justify-center cursor-ew-resize z-30" 
                              />
                              <div 
                                onMouseDown={(e) => handleTrimStart(e, clip, 'right')}
                                onTouchStart={(e) => handleTrimStart(e, clip, 'right')}
                                className="absolute right-0 top-0 bottom-0 w-3 bg-white text-black flex items-center justify-center cursor-ew-resize z-30" 
                              />
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. SLIDE-UP DRAWER (Media Library, Quran Studio, Veo AI, Controls)        */}
      {/* ========================================================================= */}
      {(activeGlobalDrawer || activeClipDrawer) && (
        <div className="absolute inset-x-0 bottom-16 max-h-[72vh] md:max-h-[60vh] md:max-w-2xl md:mx-auto bg-[#10101a] border-t-2 border-cyan-500/60 md:border md:border-cyan-500/40 md:rounded-2xl rounded-t-2xl shadow-2xl z-50 flex flex-col animate-in slide-in-from-bottom duration-200">
          
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#151522] border-b border-[#222234] rounded-t-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                {activeGlobalDrawer === 'media' && <Layers className="w-3.5 h-3.5" />}
                {activeGlobalDrawer === 'audio' && <Music className="w-3.5 h-3.5" />}
                {activeGlobalDrawer === 'sfx' && <Bell className="w-3.5 h-3.5" />}
                {activeGlobalDrawer === 'quran' && <BookOpen className="w-3.5 h-3.5 text-amber-400" />}
                {activeGlobalDrawer === 'visuals' && <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
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
                  : activeGlobalDrawer === 'quran'
                  ? 'CuteCut Quran AI Studio'
                  : activeGlobalDrawer === 'visuals'
                  ? 'Islamic Visuals & Footages'
                  : activeGlobalDrawer === 'sfx'
                  ? 'Sound FX Library'
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
                <label className="text-xs text-gray-300 font-semibold">Edit Subtitle or Text Content:</label>
                <textarea
                  value={quickEditText}
                  onChange={(e) => setQuickEditText(e.target.value)}
                  className="w-full h-28 bg-[#161622] border border-[#2a2a3e] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-400 font-sans"
                  placeholder="Type text or subtitle here..."
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setActiveClipDrawer(null)}
                    className="px-4 py-2 rounded-xl bg-[#202030] text-gray-300 text-xs font-semibold"
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

            {/* Dedicated CuteCut Quran AI Studio Drawer Tab */}
            {activeGlobalDrawer === 'quran' && (
              <div className="space-y-3.5">
                <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/70 to-teal-950/70 border border-emerald-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-200">CuteCut Pro Quran AI Engine</h4>
                      <p className="text-[10px] text-gray-300">Universal 114 Surah Auto-Detect & Breath Sync</p>
                    </div>
                  </div>

                  {onOpenQuranStudio && (
                    <button
                      onClick={() => {
                        onOpenQuranStudio();
                        setActiveGlobalDrawer(null);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shadow-md shadow-emerald-900/40 active:scale-95 transition cursor-pointer"
                    >
                      Open AI Studio
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => {
                      if (onAutoSegmentAudio) onAutoSegmentAudio();
                      setActiveGlobalDrawer(null);
                    }}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#161624] border border-[#27273c] hover:border-emerald-500/50 active:scale-95 transition cursor-pointer text-left"
                  >
                    <Zap className="w-5 h-5 text-amber-400 mb-1" />
                    <span className="text-xs font-bold text-gray-100">Ayah Voice Sync</span>
                    <span className="text-[10px] text-gray-400 text-center mt-0.5">Split speech by breath</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onAutoSyncVideoToAyahs) onAutoSyncVideoToAyahs();
                      setActiveGlobalDrawer(null);
                    }}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#161624] border border-[#27273c] hover:border-emerald-500/50 active:scale-95 transition cursor-pointer text-left"
                  >
                    <Film className="w-5 h-5 text-cyan-400 mb-1" />
                    <span className="text-xs font-bold text-gray-100">B-Roll Ayah Sync</span>
                    <span className="text-[10px] text-gray-400 text-center mt-0.5">Auto match video scenes</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveGlobalDrawer('visuals');
                    }}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#161624] border border-[#27273c] hover:border-emerald-500/50 active:scale-95 transition cursor-pointer text-left"
                  >
                    <Sparkles className="w-5 h-5 text-emerald-400 mb-1" />
                    <span className="text-xs font-bold text-gray-100">Quran Visuals</span>
                    <span className="text-[10px] text-gray-400 text-center mt-0.5">Makkah, nature & noor</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveGlobalDrawer('audio');
                    }}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#161624] border border-[#27273c] hover:border-emerald-500/50 active:scale-95 transition cursor-pointer text-left"
                  >
                    <Mic className="w-5 h-5 text-purple-400 mb-1" />
                    <span className="text-xs font-bold text-gray-100">Reciter Audios</span>
                    <span className="text-[10px] text-gray-400 text-center mt-0.5">Famous Qaris bank</span>
                  </button>
                </div>
              </div>
            )}

            {/* Veo AI Video Generation Drawer */}
            {activeGlobalDrawer === 'veo' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-gray-800">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span>CuteCut AI Video Engine (Google Veo 3.1)</span>
                  </span>
                  <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono font-bold">ONLINE AI</span>
                </div>
                <p className="text-xs text-gray-400">
                  Generate cinematic 1080p AI video clips and animated scenes directly into your timeline:
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => {
                      if (onOpenVeoAnimateModal) onOpenVeoAnimateModal('prompt_to_video');
                      setActiveGlobalDrawer(null);
                    }}
                    className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-gradient-to-br from-[#0c1824] to-[#122232] border border-cyan-500/50 hover:border-cyan-400 text-left active:scale-95 transition cursor-pointer shadow-md shadow-cyan-950/40"
                  >
                    <Film className="w-6 h-6 text-cyan-400 mb-1.5" />
                    <span className="text-xs font-bold text-gray-100">Veo Text to Video</span>
                    <span className="text-[10px] text-cyan-300/80 text-center mt-0.5">Type prompt & generate</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onOpenVeoAnimateModal) onOpenVeoAnimateModal('image_to_video');
                      setActiveGlobalDrawer(null);
                    }}
                    className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-gradient-to-br from-[#1a1226] to-[#251636] border border-purple-500/50 hover:border-purple-400 text-left active:scale-95 transition cursor-pointer shadow-md shadow-purple-950/40"
                  >
                    <Sparkles className="w-6 h-6 text-purple-400 mb-1.5" />
                    <span className="text-xs font-bold text-gray-100">Sora Photo Animator</span>
                    <span className="text-[10px] text-purple-300/80 text-center mt-0.5">Bring images to life</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onOpenAiPromptStudio) onOpenAiPromptStudio();
                      setActiveGlobalDrawer(null);
                    }}
                    className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white font-bold text-xs shadow-lg active:scale-95 transition cursor-pointer"
                  >
                    <Wand2 className="w-4 h-4 text-white" />
                    <span>Open AI Prompt Video Studio (Full Script & Reel)</span>
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
                    className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-[#161624] border border-[#27273c] hover:border-cyan-500/50 text-left active:scale-95 transition cursor-pointer"
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
                    className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-[#161624] border border-[#27273c] hover:border-cyan-500/50 text-left active:scale-95 transition cursor-pointer"
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
                    className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-[#161624] border border-[#27273c] hover:border-cyan-500/50 text-left active:scale-95 transition cursor-pointer"
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
                    className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-[#161624] border border-[#27273c] hover:border-cyan-500/50 text-left active:scale-95 transition cursor-pointer"
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
            {activeGlobalDrawer && activeGlobalDrawer !== 'adjustment' && activeGlobalDrawer !== 'autosegment' && activeGlobalDrawer !== 'quran' && activeGlobalDrawer !== 'veo' && (
              <div>
                {renderMediaPanel(
                  activeGlobalDrawer === 'media' ? 'upload' :
                  activeGlobalDrawer === 'overlay' ? 'video' :
                  activeGlobalDrawer === 'canvas' ? 'background' :
                  activeGlobalDrawer === 'visuals' ? 'quran-visuals' :
                  activeGlobalDrawer
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. BOTTOM NAVIGATION TOOLBAR (Dynamic: Global Menu vs Clip Context Menu) */}
      {/* ========================================================================= */}
      <nav className="h-16 bg-[#090910] border-t border-[#181824] flex items-center z-40 shrink-0 shadow-2xl relative">
        
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
                  onClick={() => handleOpenClipControl('textStyle')}
                  className="flex flex-col items-center justify-center shrink-0 min-w-[56px] px-2 py-1 rounded-xl bg-amber-950/40 border border-amber-500/50 hover:border-amber-400 text-amber-300 active:scale-95 transition shadow-sm"
                  title="Surah & Ayah Properties"
                >
                  <BookOpen className="w-4 h-4 mb-0.5 text-amber-400" />
                  <span className="text-[10px] font-bold">Surah</span>
                </button>

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
          <div className="flex items-center gap-2 md:justify-center overflow-x-auto touch-pan-x no-scrollbar px-3 py-1 w-full">
            {globalNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeGlobalDrawer === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleOpenGlobalTab(item.id)}
                  className={`flex flex-col items-center justify-center shrink-0 min-w-[58px] px-2 py-1.5 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
                    isActive 
                      ? 'text-cyan-300 bg-cyan-500/20 border border-cyan-400/40 shadow-md shadow-cyan-500/10 font-bold' 
                      : 'text-gray-400 hover:text-gray-200 bg-[#12121e] border border-[#1e1e2e] hover:border-gray-600'
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

export default MobileCuteCutLayout;
