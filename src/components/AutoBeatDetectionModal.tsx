import React, { useState } from 'react';
import { Track, BeatMarker } from '../types';
import { detectAudioBeats, generateRhythmicBeats } from '../utils/beatDetection';
import { Zap, Music, Wand2, X, Trash2, Check } from 'lucide-react';

interface AutoBeatDetectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tracks?: Track[];
  duration?: number;
  timelineDuration?: number;
  audioClips?: Array<{ id: string; name?: string; url: string; start: number; duration: number }>;
  existingMarkers?: BeatMarker[];
  onApplyBeatMarkers?: (markers: BeatMarker[]) => void;
  onApplyBeats?: (markers: BeatMarker[]) => void;
  onClearBeatMarkers?: () => void;
}

export const AutoBeatDetectionModal: React.FC<AutoBeatDetectionModalProps> = ({
  isOpen,
  onClose,
  tracks,
  duration,
  timelineDuration,
  audioClips: directAudioClips,
  existingMarkers = [],
  onApplyBeatMarkers,
  onApplyBeats,
  onClearBeatMarkers,
}) => {
  const [selectedMode, setSelectedMode] = useState<'audio' | 'tempo'>('tempo');
  const [selectedAudioClipId, setSelectedAudioClipId] = useState<string>('');
  const [bpm, setBpm] = useState<number>(120);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [appliedCount, setAppliedCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const effectiveDuration = duration || timelineDuration || 60;
  const applyFn = onApplyBeatMarkers || onApplyBeats || (() => {});
  const clearFn = onClearBeatMarkers || (() => {});

  // Find audio clips across all tracks or from direct props
  const audioClips = directAudioClips && directAudioClips.length > 0
    ? directAudioClips
    : (tracks || [])
        .flatMap((t) => t?.clips || [])
        .filter((c) => c && (c.type === 'audio' || (c.url && (typeof c.url === 'string' && (c.url.endsWith('.mp3') || c.url.endsWith('.wav') || c.url.endsWith('.m4a'))))))
        .map((c) => ({
          id: c.id,
          name: c.name || 'Audio Clip',
          url: c.url || '',
          start: c.start || 0,
          duration: c.duration || effectiveDuration,
        }));

  const handleGenerate = async () => {
    setIsProcessing(true);
    setAppliedCount(null);
    try {
      let markers: BeatMarker[] = [];
      if (selectedMode === 'audio' && (selectedAudioClipId || audioClips.length > 0)) {
        const targetId = selectedAudioClipId || audioClips[0]?.id;
        const clip = audioClips.find((c) => c.id === targetId);
        if (clip && clip.url) {
          markers = await detectAudioBeats(clip.url, clip.duration || effectiveDuration, bpm);
          if (clip.start > 0) {
            markers = markers.map((m) => ({
              ...m,
              time: Number((m.time + clip.start).toFixed(3)),
            }));
          }
        } else {
          markers = generateRhythmicBeats(effectiveDuration, bpm);
        }
      } else {
        markers = generateRhythmicBeats(effectiveDuration, bpm);
      }

      applyFn(markers);
      setAppliedCount(markers.length);
      setTimeout(() => {
        setIsProcessing(false);
      }, 400);
    } catch (err) {
      console.error('Beat generation error:', err);
      setIsProcessing(false);
    }
  };

  const TEMPO_PRESETS = [
    { label: 'EDM / Dance', bpm: 128, desc: 'High energy festival drops' },
    { label: 'Pop / Modern', bpm: 120, desc: 'Universal pop tempo' },
    { label: 'Hip Hop / Trap', bpm: 140, desc: 'Heavy 808s and rapid snares' },
    { label: 'Lo-Fi / Chill', bpm: 90, desc: 'Mellow relaxed beat' },
    { label: 'Cinematic', bpm: 75, desc: 'Slow dramatic pauses' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-[#181820] border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#262633] bg-[#121217]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Zap className="w-5 h-5 fill-amber-400/20" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-100 flex items-center gap-1.5">
                <span>CapCut Auto Beat Detection</span>
              </h3>
              <p className="text-[11px] text-gray-400">
                Snap video cuts, keyframes, and transitions to musical beats
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-[#121217] p-1 border border-gray-800">
            <button
              onClick={() => setSelectedMode('tempo')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                selectedMode === 'tempo'
                  ? 'bg-amber-500 text-black font-bold shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Musical Tempo (BPM)
            </button>
            <button
              onClick={() => setSelectedMode('audio')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                selectedMode === 'audio'
                  ? 'bg-amber-500 text-black font-bold shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Detect from Audio Track
            </button>
          </div>

          {/* Mode 1: Musical Tempo */}
          {selectedMode === 'tempo' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {TEMPO_PRESETS.map((p) => (
                  <button
                    key={p.bpm}
                    onClick={() => setBpm(p.bpm)}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      bpm === p.bpm
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300 shadow-xs'
                        : 'border-gray-800 bg-[#14141a] text-gray-400 hover:border-gray-700 hover:text-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold">{p.label}</span>
                      <span className="text-[10px] font-mono text-amber-400 font-bold">{p.bpm} BPM</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">{p.desc}</p>
                  </button>
                ))}
              </div>

              {/* Custom BPM Slider */}
              <div className="bg-[#121217] p-3 rounded-xl border border-gray-800 space-y-1.5">
                <div className="flex justify-between text-xs text-gray-300">
                  <span>Custom Tempo (BPM)</span>
                  <span className="font-mono text-amber-400 font-bold">{bpm} BPM</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="180"
                  value={bpm}
                  onChange={(e) => setBpm(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>
            </div>
          )}

          {/* Mode 2: Detect from Audio Track */}
          {selectedMode === 'audio' && (
            <div className="space-y-3">
              {audioClips.length === 0 ? (
                <div className="bg-[#14141a] p-4 rounded-xl border border-dashed border-gray-700 text-center space-y-1.5">
                  <Music className="w-8 h-8 text-gray-600 mx-auto" />
                  <p className="text-xs font-medium text-gray-300">No Audio Clips on Timeline</p>
                  <p className="text-[11px] text-gray-500">
                    Add an audio or music track to your project to automatically extract wave peaks.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-xs text-gray-300 font-medium">Select Source Audio:</span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                    {audioClips.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedAudioClipId(c.id)}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                          selectedAudioClipId === c.id || (!selectedAudioClipId && audioClips[0].id === c.id)
                            ? 'border-amber-400 bg-amber-500/10 text-amber-300 shadow-xs'
                            : 'border-gray-800 bg-[#14141a] text-gray-400 hover:border-gray-700 hover:text-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Music className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="text-xs font-medium truncate">{c.name || 'Audio Track'}</span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-500 shrink-0">
                          {c.duration.toFixed(1)}s
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status feedback */}
          {appliedCount !== null && (
            <div className="bg-emerald-950/40 border border-emerald-500/40 p-2.5 rounded-xl flex items-center gap-2 text-emerald-300 text-xs animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Generated <strong>{appliedCount} beat markers</strong> with drop markers! Clips will magnetically snap to them.
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-[#262633] bg-[#121217] flex items-center justify-between">
          <div>
            {existingMarkers.length > 0 && (
              <button
                onClick={() => {
                  clearFn();
                  setAppliedCount(null);
                }}
                className="px-3 py-1.5 rounded-lg border border-red-900/50 hover:bg-red-950/40 text-red-400 text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear ({existingMarkers.length})</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-[#202028] hover:bg-[#282834] text-gray-300 text-xs font-semibold transition"
            >
              Done
            </button>
            <button
              onClick={handleGenerate}
              disabled={isProcessing}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black text-xs font-bold flex items-center gap-1.5 shadow-md transition disabled:opacity-50"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Analyzing...' : 'Generate Beats'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
