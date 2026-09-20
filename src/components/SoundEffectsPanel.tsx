import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Pause, Plus, Check, Search, Volume2, Sparkles, Clock, X, Zap, Bell, CheckCircle2, ChevronRight } from 'lucide-react';
import { SFX_CATEGORIES, SFX_LIBRARY, SoundEffectItem } from '../data/sfxLibraryData';
import { getSfxBlobUrl, playSfxPreview, stopSfxPreview } from '../utils/sfxAudioEngine';
import { Clip, ClipType } from '../types';

interface SoundEffectsPanelProps {
  onAddClip: (clipData: Partial<Clip>) => void;
  showAddedToast?: (name: string) => void;
}

export const SoundEffectsPanel: React.FC<SoundEffectsPanelProps> = ({
  onAddClip,
  showAddedToast,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [playingSfxId, setPlayingSfxId] = useState<string | null>(null);
  const [addedSfxId, setAddedSfxId] = useState<string | null>(null);
  const [loadingSfxId, setLoadingSfxId] = useState<string | null>(null);
  const [previewProgress, setPreviewProgress] = useState<number>(0);

  const stopPreviewRef = useRef<(() => void) | null>(null);
  const progressTimerRef = useRef<any>(null);

  // Quick filter chips
  const popularChips = [
    { label: 'All', cat: 'all' },
    { label: '💨 Whooshes', cat: 'whoosh' },
    { label: '💥 Impacts & Booms', cat: 'impact' },
    { label: '📈 Risers', cat: 'riser' },
    { label: '🔔 Vlog Pops & Bells', cat: 'vlog' },
    { label: '⚡ Glitch & Sci-Fi', cat: 'glitch' },
    { label: '🕊️ Islamic Nasheed', cat: 'islamic' },
    { label: '🍃 Nature Foley', cat: 'nature' },
  ];

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stopPreviewRef.current) {
        stopPreviewRef.current();
      }
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      stopSfxPreview();
    };
  }, []);

  // Filter items
  const filteredSfx = useMemo(() => {
    return SFX_LIBRARY.filter((item) => {
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchCategory;

      const matchName = item.name.toLowerCase().includes(query);
      const matchDesc = item.description.toLowerCase().includes(query);
      const matchTags = item.tags.some(t => t.toLowerCase().includes(query));
      const matchCatLabel = item.categoryLabel.toLowerCase().includes(query);

      return matchCategory && (matchName || matchDesc || matchTags || matchCatLabel);
    });
  }, [selectedCategory, searchQuery]);

  const activePlayingItem = useMemo(() => {
    if (!playingSfxId) return null;
    return SFX_LIBRARY.find(s => s.id === playingSfxId) || null;
  }, [playingSfxId]);

  // Handle Play / Pause Preview
  const handleTogglePlay = async (sfx: SoundEffectItem) => {
    if (playingSfxId === sfx.id) {
      if (stopPreviewRef.current) {
        stopPreviewRef.current();
      }
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      setPlayingSfxId(null);
      setPreviewProgress(0);
      return;
    }

    if (stopPreviewRef.current) {
      stopPreviewRef.current();
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }

    setLoadingSfxId(sfx.id);
    setPreviewProgress(0);

    try {
      const startTime = Date.now();
      const durationMs = sfx.duration * 1000;

      const stopFn = await playSfxPreview(sfx, () => {
        setPlayingSfxId(null);
        setPreviewProgress(0);
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      });

      stopPreviewRef.current = stopFn;
      setPlayingSfxId(sfx.id);
      setLoadingSfxId(null);

      // Animate progress
      progressTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, (elapsed / durationMs) * 100);
        setPreviewProgress(progress);
        if (progress >= 100) {
          clearInterval(progressTimerRef.current);
        }
      }, 50);
    } catch (err) {
      console.error('Failed to play SFX preview:', err);
      setLoadingSfxId(null);
      setPlayingSfxId(null);
    }
  };

  // Handle 1-Click Add to Timeline Audio Track
  const handleAddToTimeline = async (sfx: SoundEffectItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLoadingSfxId(sfx.id);

    try {
      const blobUrl = await getSfxBlobUrl(sfx);

      onAddClip({
        name: sfx.name,
        type: ClipType.AUDIO,
        url: blobUrl,
        duration: sfx.duration,
        sourceStart: 0,
        sourceDuration: sfx.duration,
        volume: 1.0,
        playbackRate: 1.0,
      });

      setLoadingSfxId(null);
      setAddedSfxId(sfx.id);
      setTimeout(() => setAddedSfxId(null), 1800);

      if (showAddedToast) {
        showAddedToast(`Added '${sfx.name}' to Audio Track!`);
      }
    } catch (err) {
      console.error('Error adding SFX to timeline:', err);
      setLoadingSfxId(null);
    }
  };

  return (
    <div className="flex flex-row h-full overflow-hidden bg-[#0e0e13]">
      {/* Left Sidebar: CapCut SFX Categories */}
      <div className="w-40 border-r border-[#23232e] bg-[#111116] p-2 flex flex-col gap-1 overflow-y-auto custom-scrollbar shrink-0">
        <div className="px-2 py-1 flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">
            SFX Library
          </span>
          <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/80 px-1 rounded">
            {SFX_LIBRARY.length}
          </span>
        </div>

        {SFX_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              id={`sfx-cat-${cat.id}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition text-left ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-xs'
                  : 'text-gray-400 hover:text-white hover:bg-[#1a1a24]'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm shrink-0">{cat.icon}</span>
                <span className="truncate text-[11px]">{cat.label}</span>
              </div>
              <span className="text-[9px] text-gray-500 font-mono ml-1">
                {cat.id === 'all' ? SFX_LIBRARY.length : SFX_LIBRARY.filter(s => s.category === cat.id).length}
              </span>
            </button>
          );
        })}

        <div className="mt-auto p-2 bg-[#161620] border border-gray-800 rounded-lg text-[10px] text-gray-400">
          <p className="font-semibold text-gray-300 flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>1-Click Timeline</span>
          </p>
          <p className="text-[9px] text-gray-500 mt-0.5 leading-relaxed">
            Click <b>+</b> on any effect to drop it directly onto the timeline audio track at playhead.
          </p>
        </div>
      </div>

      {/* Right Content Area: Search, Chips & SFX Grid */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-3 space-y-2.5">
        {/* Search Bar & Stats */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 115+ SFX (Whoosh, Sub Boom, Riser, Bubble Pop, Bell, Nasheed...)"
              className="w-full bg-[#181822] border border-gray-800 rounded-lg pl-8 pr-8 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
          <div className="text-[10px] text-gray-400 font-mono px-2 py-1.5 bg-[#181822] border border-gray-800 rounded-lg whitespace-nowrap">
            <span className="text-cyan-400 font-bold">{filteredSfx.length}</span> Effects
          </div>
        </div>

        {/* Quick Filter Tag Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-0.5 shrink-0">
          {popularChips.map((chip) => {
            const isCurrent = selectedCategory === chip.cat;
            return (
              <button
                key={chip.cat}
                onClick={() => {
                  setSelectedCategory(chip.cat);
                  setSearchQuery('');
                }}
                className={`px-2 py-1 rounded-full text-[10px] whitespace-nowrap font-medium transition ${
                  isCurrent
                    ? 'bg-cyan-500 text-black font-bold shadow-xs'
                    : 'bg-[#1e1e28] text-gray-400 hover:text-white hover:bg-[#252532] border border-gray-800'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* SFX Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-1.5">
          {filteredSfx.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-4 border border-dashed border-gray-800 rounded-xl bg-[#14141c]">
              <Volume2 className="w-8 h-8 text-gray-600 mb-2" />
              <p className="text-xs font-semibold text-gray-300">No sound effects matched "{searchQuery}"</p>
              <p className="text-[10px] text-gray-500 mt-1">Try searching for "whoosh", "pop", "riser", "bell", or select a category.</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="mt-3 px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs rounded-lg border border-cyan-500/40"
              >
                Reset Search
              </button>
            </div>
          ) : (
            filteredSfx.map((sfx) => {
              const isPlaying = playingSfxId === sfx.id;
              const isAdded = addedSfxId === sfx.id;
              const isLoading = loadingSfxId === sfx.id;

              return (
                <div
                  key={sfx.id}
                  id={`sfx-item-${sfx.id}`}
                  onClick={() => handleTogglePlay(sfx)}
                  className={`group rounded-xl p-2.5 flex items-center gap-3 transition cursor-pointer border relative overflow-hidden ${
                    isPlaying
                      ? 'bg-[#222230] border-cyan-500/50 shadow-md shadow-cyan-950/30'
                      : 'bg-[#181822] hover:bg-[#1f1f2b] border-gray-800/80 hover:border-gray-700'
                  }`}
                >
                  {/* Playing Progress Glow Bar */}
                  {isPlaying && (
                    <div
                      className="absolute bottom-0 left-0 h-0.5 bg-cyan-400 transition-all duration-75 pointer-events-none"
                      style={{ width: `${previewProgress}%` }}
                    />
                  )}

                  {/* Play / Stop Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePlay(sfx);
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition shrink-0 ${
                      isPlaying
                        ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/40 animate-pulse'
                        : 'bg-[#282836] group-hover:bg-[#343446] text-white'
                    }`}
                    title={isPlaying ? 'Pause' : 'Audition Sound Effect'}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5 text-gray-200 group-hover:text-cyan-300" />
                    )}
                  </button>

                  {/* SFX Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm shrink-0">{sfx.icon}</span>
                      <p className={`text-xs font-semibold truncate ${isPlaying ? 'text-cyan-300' : 'text-gray-100 group-hover:text-white'}`}>
                        {sfx.name}
                      </p>
                      <span className="text-[9px] font-mono text-gray-400 bg-[#121218] px-1.5 py-0.5 rounded border border-gray-800 shrink-0">
                        {sfx.durationFormatted}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider bg-black/40 border border-white/5 ${
                        sfx.category === 'whoosh' ? 'text-cyan-400' :
                        sfx.category === 'impact' ? 'text-rose-400' :
                        sfx.category === 'riser' ? 'text-purple-400' :
                        sfx.category === 'vlog' ? 'text-amber-400' :
                        sfx.category === 'glitch' ? 'text-indigo-400' :
                        sfx.category === 'islamic' ? 'text-emerald-400' : 'text-teal-400'
                      }`}>
                        {sfx.categoryLabel}
                      </span>
                      <p className="text-[10px] text-gray-400 truncate max-w-[280px]">
                        {sfx.description}
                      </p>
                    </div>
                  </div>

                  {/* 1-Click Drop to Timeline Button */}
                  <button
                    id={`add-sfx-timeline-${sfx.id}`}
                    onClick={(e) => handleAddToTimeline(sfx, e)}
                    disabled={isLoading}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
                      isAdded
                        ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                        : 'bg-[#252534] hover:bg-cyan-500 hover:text-black text-gray-200 border border-gray-700/60 hover:border-transparent'
                    }`}
                    title="Add directly to Audio Track at Playhead"
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Added</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Add</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Sticky Audition Bottom Bar */}
        {activePlayingItem && (
          <div className="shrink-0 p-2.5 bg-[#161622] border border-cyan-500/40 rounded-xl shadow-xl flex items-center gap-3">
            <button
              onClick={() => handleTogglePlay(activePlayingItem)}
              className="w-8 h-8 rounded-full bg-cyan-500 text-black flex items-center justify-center shrink-0 shadow-md"
            >
              <Pause className="w-4 h-4 fill-current" />
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-white truncate flex items-center gap-1.5">
                  <span>{activePlayingItem.icon}</span>
                  <span>{activePlayingItem.name}</span>
                </span>
                <span className="text-[9px] font-mono text-cyan-400 font-bold">
                  {activePlayingItem.durationFormatted}
                </span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-75"
                  style={{ width: `${previewProgress}%` }}
                />
              </div>
            </div>

            <button
              onClick={(e) => handleAddToTimeline(activePlayingItem, e)}
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-lg flex items-center gap-1 shadow-md shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Drop to Timeline</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
