import React, { useState } from 'react';
import { Volume2, Mic, Gauge, RotateCcw, Sparkles, Sliders, Music, Check, Radio, Wand2 } from 'lucide-react';
import { Clip } from '../types';

interface CapCutAudioInspectorProps {
  clip: Clip;
  onUpdateClip: (clipId: string, updates: Partial<Clip>) => void;
}

export const CapCutAudioInspector: React.FC<CapCutAudioInspectorProps> = ({
  clip,
  onUpdateClip,
}) => {
  const [audioTab, setAudioTab] = useState<'basic' | 'voiceChanger' | 'speed'>('basic');
  const [voiceChangerCategory, setVoiceChangerCategory] = useState<'filters' | 'characters' | 'speechToSong'>('filters');

  const audioSettings = clip.audioSettings || {};
  
  // Calculate decibels from linear gain: 20 * log10(gain)
  const volumeGain = clip.volume !== undefined ? clip.volume : 1.0;
  const currentDb = audioSettings.volumeDb !== undefined
    ? audioSettings.volumeDb
    : (volumeGain <= 0.001 ? -50 : Number((20 * Math.log10(volumeGain)).toFixed(1)));

  const handleVolumeDbChange = (db: number) => {
    // Linear gain = 10^(db / 20)
    const linearGain = db <= -49.5 ? 0 : Math.min(10, Math.max(0, Math.pow(10, db / 20)));
    onUpdateClip(clip.id, {
      volume: linearGain,
      audioSettings: {
        ...audioSettings,
        volumeDb: db,
      }
    });
  };

  const handleResetVolume = () => {
    handleVolumeDbChange(0);
  };

  const VOICE_FILTERS = [
    { id: 'original', name: 'Original', icon: '🎙️', desc: 'Natural voice' },
    { id: 'mic-echo', name: 'Mic Echo', icon: '🔊', desc: 'Stage reverb' },
    { id: 'low', name: 'Low', icon: '📉', desc: 'Bass booster' },
    { id: 'high', name: 'High', icon: '📈', desc: 'Crisp treble' },
    { id: 'chipmunk', name: 'Chipmunk', icon: '🐿️', desc: 'High pitch cartoon' },
    { id: 'robot', name: 'Robot', icon: '🤖', desc: 'Vocoder electronic' },
    { id: 'telephone', name: 'Telephone', icon: '☎️', desc: 'Vintage landline' },
    { id: 'megaphone', name: 'Megaphone', icon: '📢', desc: 'Loudspeaker bullhorn' },
    { id: 'vinyl', name: 'Vinyl', icon: '📻', desc: 'Warm 70s record' },
    { id: 'deep', name: 'Deep', icon: '🎙️', desc: 'Studio movie trailer' },
    { id: 'tremolo', name: 'Tremolo', icon: '〰️', desc: 'Rhythmic pulsation' },
    { id: 'distort', name: 'Distortion', icon: '⚡', desc: 'Rock guitar fuzz' },
  ];

  const VOICE_CHARACTERS = [
    { id: 'jessie', name: 'Jessie', icon: '👩', desc: 'Trendy female narrator' },
    { id: 'deep-voice', name: 'Deep Voice', icon: '🧔', desc: 'Authoritative male' },
    { id: 'elf', name: 'Elf', icon: '🧝', desc: 'Playful fantasy voice' },
    { id: 'giant', name: 'Giant', icon: '👹', desc: 'Sub-bass monster' },
    { id: 'anime-boy', name: 'Anime Boy', icon: '👦', desc: 'Energetic hero' },
    { id: 'storyteller', name: 'Storyteller', icon: '👴', desc: 'Wise warm elder' },
    { id: 'radio-host', name: 'Radio Host', icon: '📻', desc: 'Broadcast announcer' },
    { id: 'cute-girl', name: 'Cute Girl', icon: '👧', desc: 'High upbeat vlogger' },
  ];

  const SPEECH_TO_SONG = [
    { id: 'hiphop', name: 'Hip Hop', icon: '🧢', tempo: '95 BPM' },
    { id: 'rnb', name: 'R&B Vibe', icon: '🎷', tempo: '82 BPM' },
    { id: 'folk', name: 'Acoustic Folk', icon: '🪕', tempo: '104 BPM' },
    { id: 'pop', name: 'Electronic Pop', icon: '🎛️', tempo: '128 BPM' },
  ];

  return (
    <div className="flex flex-col h-full select-none text-gray-300">
      {/* CapCut Sub Tabs: Basic | Voice changer | Speed */}
      <div className="flex border-b border-[#23232b] bg-[#141418] px-3">
        <button
          id="audio-tab-basic"
          onClick={() => setAudioTab('basic')}
          className={`px-4 py-2.5 text-xs font-semibold tracking-wide transition border-b-2 ${
            audioTab === 'basic'
              ? 'text-cyan-400 border-cyan-400 bg-[#1a1a22]'
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          Basic
        </button>
        <button
          id="audio-tab-voice-changer"
          onClick={() => setAudioTab('voiceChanger')}
          className={`px-4 py-2.5 text-xs font-semibold tracking-wide transition border-b-2 ${
            audioTab === 'voiceChanger'
              ? 'text-cyan-400 border-cyan-400 bg-[#1a1a22]'
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          Voice changer
        </button>
        <button
          id="audio-tab-speed"
          onClick={() => setAudioTab('speed')}
          className={`px-4 py-2.5 text-xs font-semibold tracking-wide transition border-b-2 ${
            audioTab === 'speed'
              ? 'text-cyan-400 border-cyan-400 bg-[#1a1a22]'
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          Speed
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
        
        {/* ================= BASIC TAB ================= */}
        {audioTab === 'basic' && (
          <div className="space-y-4">
            {/* Volume Control */}
            <div className="bg-[#1a1a22] p-3.5 rounded-lg border border-[#262633] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-medium text-gray-300">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  <span>Volume</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-400 font-bold bg-[#121217] px-2 py-0.5 rounded border border-[#2e2e3e]">
                    {currentDb > 0 ? `+${currentDb.toFixed(1)}dB` : `${currentDb.toFixed(1)}dB`}
                  </span>
                  <button
                    onClick={handleResetVolume}
                    title="Reset volume to 0.0dB"
                    className="p-1 hover:text-cyan-300 text-gray-400 hover:bg-[#282836] rounded transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <input
                id="audio-volume-db-slider"
                type="range"
                min="-50"
                max="20"
                step="0.5"
                value={currentDb}
                onChange={(e) => handleVolumeDbChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>-50dB</span>
                <span>0.0dB</span>
                <span>+20dB</span>
              </div>
            </div>

            {/* Fade In & Fade Out */}
            <div className="bg-[#1a1a22] p-3.5 rounded-lg border border-[#262633] space-y-3">
              {/* Fade In */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Fade in</span>
                  <span className="font-mono text-cyan-400">
                    {(audioSettings.fadeIn || 0).toFixed(1)}s
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={audioSettings.fadeIn || 0}
                  onChange={(e) =>
                    onUpdateClip(clip.id, {
                      audioSettings: {
                        ...audioSettings,
                        fadeIn: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Fade Out */}
              <div className="space-y-1.5 pt-2 border-t border-[#262633]">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Fade out</span>
                  <span className="font-mono text-cyan-400">
                    {(audioSettings.fadeOut || 0).toFixed(1)}s
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={audioSettings.fadeOut || 0}
                  onChange={(e) =>
                    onUpdateClip(clip.id, {
                      audioSettings: {
                        ...audioSettings,
                        fadeOut: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>

            {/* Haramain & Mosque Acoustic Reverb Suite */}
            <div className="bg-[#1a1a22] p-3.5 rounded-lg border border-[#262633] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-medium text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Mosque & Sanctuary Reverb</span>
                </div>
                {clip.audioEffects?.mosqueReverb?.enabled && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/60">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-400 leading-tight">
                Simulate the sacred acoustic reflection and expansive hall echo of the Two Holy Mosques.
              </p>

              {/* Presets */}
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'none', label: 'Off', icon: '⊘', desc: 'Dry vocal' },
                  { id: 'haramain-kaaba', label: 'Haramain Kaaba', icon: '🕋', desc: 'Makkah reflection' },
                  { id: 'grand-mosque', label: 'Grand Mosque', icon: '🕌', desc: 'Expansive sacred hall' },
                  { id: 'studio-warm', label: 'Studio Warmth', icon: '🎙️', desc: 'Crisp acoustic body' },
                ].map((preset) => {
                  const isCurrent = preset.id === 'none'
                    ? !clip.audioEffects?.mosqueReverb?.enabled
                    : (clip.audioEffects?.mosqueReverb?.enabled && clip.audioEffects?.mosqueReverb?.preset === preset.id);

                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        if (preset.id === 'none') {
                          onUpdateClip(clip.id, {
                            audioEffects: {
                              ...clip.audioEffects,
                              mosqueReverb: {
                                enabled: false,
                                preset: 'haramain-kaaba',
                                wet: clip.audioEffects?.mosqueReverb?.wet ?? 55,
                              },
                              reverb: false,
                              echo: false,
                            },
                          });
                        } else {
                          onUpdateClip(clip.id, {
                            audioEffects: {
                              ...clip.audioEffects,
                              mosqueReverb: {
                                enabled: true,
                                preset: preset.id as any,
                                wet: clip.audioEffects?.mosqueReverb?.wet ?? 55,
                              },
                              reverb: true,
                            },
                          });
                        }
                      }}
                      className={`p-2 rounded-lg border text-left transition ${
                        isCurrent
                          ? 'border-amber-400 bg-amber-950/30 text-amber-200'
                          : 'border-[#262633] bg-[#121217] text-gray-400 hover:border-gray-600 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-semibold text-xs">
                        <span>{preset.icon}</span>
                        <span className="truncate">{preset.label}</span>
                      </div>
                      <div className="text-[9px] text-gray-500 mt-0.5">{preset.desc}</div>
                    </button>
                  );
                })}
              </div>

              {/* Wet Reverb Mix Slider */}
              {clip.audioEffects?.mosqueReverb?.enabled && (
                <div className="space-y-1.5 pt-2 border-t border-[#262633]">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-300">Echo & Reverb Mix</span>
                    <span className="font-mono text-amber-400 font-bold">
                      {clip.audioEffects?.mosqueReverb?.wet ?? 55}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={clip.audioEffects?.mosqueReverb?.wet ?? 55}
                    onChange={(e) =>
                      onUpdateClip(clip.id, {
                        audioEffects: {
                          ...clip.audioEffects,
                          mosqueReverb: {
                            ...(clip.audioEffects?.mosqueReverb || { enabled: true, preset: 'haramain-kaaba' }),
                            wet: parseInt(e.target.value),
                          },
                        },
                      })
                    }
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>
              )}
            </div>

            {/* Audio Enhancement Switches */}
            <div className="bg-[#1a1a22] p-3.5 rounded-lg border border-[#262633] space-y-3">
              {/* Loudness Normalization */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="font-medium text-gray-200">Loudness normalization</div>
                  <div className="text-[10px] text-gray-400 leading-tight">
                    Normalize the loudness of the selected clip to a target level (-14 LUFS).
                  </div>
                </div>
                <button
                  onClick={() =>
                    onUpdateClip(clip.id, {
                      audioSettings: {
                        ...audioSettings,
                        loudnessNorm: !audioSettings.loudnessNorm,
                      },
                    })
                  }
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                    audioSettings.loudnessNorm ? 'bg-cyan-500 justify-end' : 'bg-gray-700 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>

              {/* Enhance Voice */}
              <div className="flex items-start justify-between gap-3 pt-2.5 border-t border-[#262633]">
                <div className="space-y-0.5">
                  <div className="font-medium text-gray-200">Enhance voice</div>
                  <div className="text-[10px] text-gray-400 leading-tight">
                    Clean vocal harmonics, boost speech clarity and depth.
                  </div>
                </div>
                <button
                  onClick={() =>
                    onUpdateClip(clip.id, {
                      audioSettings: {
                        ...audioSettings,
                        enhanceVoice: !audioSettings.enhanceVoice,
                      },
                    })
                  }
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                    audioSettings.enhanceVoice ? 'bg-cyan-500 justify-end' : 'bg-gray-700 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>

              {/* Reduce Noise / Denoiser */}
              <div className="flex items-start justify-between gap-3 pt-2.5 border-t border-[#262633]">
                <div className="space-y-0.5">
                  <div className="font-medium text-gray-200">Voice Denoiser & Hum Remover</div>
                  <div className="text-[10px] text-gray-400 leading-tight">
                    Cut low-frequency AC rumble, fan hum, and high-pitch hiss.
                  </div>
                </div>
                <button
                  onClick={() =>
                    onUpdateClip(clip.id, {
                      audioSettings: {
                        ...audioSettings,
                        reduceNoise: !audioSettings.reduceNoise,
                      },
                      audioEffects: {
                        ...clip.audioEffects,
                        denoiser: !clip.audioEffects?.denoiser,
                      },
                    })
                  }
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                    (audioSettings.reduceNoise || clip.audioEffects?.denoiser) ? 'bg-cyan-500 justify-end' : 'bg-gray-700 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>

              {/* Pitch Shift / Depth Adjustment */}
              <div className="space-y-1.5 pt-2.5 border-t border-[#262633]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-300">Voice Depth / Pitch Tone</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {(clip.audioEffects?.pitchShiftSemitones ?? 0) > 0 ? `+${clip.audioEffects?.pitchShiftSemitones} st` : `${clip.audioEffects?.pitchShiftSemitones ?? 0} st`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={clip.audioEffects?.pitchShiftSemitones ?? 0}
                  onChange={(e) => {
                    const st = parseInt(e.target.value);
                    const rateMult = Math.pow(2, st / 12);
                    onUpdateClip(clip.id, {
                      audioEffects: {
                        ...clip.audioEffects,
                        pitchShiftSemitones: st,
                      },
                    });
                  }}
                  className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                  <span>-12 (Deep Bass)</span>
                  <span>0 (Natural)</span>
                  <span>+12 (Crisp High)</span>
                </div>
              </div>
            </div>

            {/* Fill Channel */}
            <div className="bg-[#1a1a22] p-3.5 rounded-lg border border-[#262633] space-y-2">
              <div className="font-medium text-gray-300">Fill channel</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'dual', label: 'Dual channels' },
                  { id: 'left', label: 'Left channel' },
                  { id: 'right', label: 'Right channel' },
                ].map((ch) => {
                  const isSelected = (audioSettings.fillChannel || 'dual') === ch.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() =>
                        onUpdateClip(clip.id, {
                          audioSettings: {
                            ...audioSettings,
                            fillChannel: ch.id as 'dual' | 'left' | 'right',
                          },
                        })
                      }
                      className={`py-1.5 px-2 rounded text-[11px] font-medium border text-center transition ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                          : 'border-gray-800 bg-[#141418] text-gray-400 hover:text-white'
                      }`}
                    >
                      {ch.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= VOICE CHANGER TAB ================= */}
        {audioTab === 'voiceChanger' && (
          <div className="space-y-4">
            {/* Category Switcher: Voice filters | Voice characters | Speech to song */}
            <div className="flex border-b border-[#262633] pb-1 gap-2">
              <button
                onClick={() => setVoiceChangerCategory('filters')}
                className={`text-[11px] pb-1 font-semibold transition ${
                  voiceChangerCategory === 'filters'
                    ? 'text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Voice filters
              </button>
              <button
                onClick={() => setVoiceChangerCategory('characters')}
                className={`text-[11px] pb-1 font-semibold transition ${
                  voiceChangerCategory === 'characters'
                    ? 'text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Voice characters
              </button>
              <button
                onClick={() => setVoiceChangerCategory('speechToSong')}
                className={`text-[11px] pb-1 font-semibold transition ${
                  voiceChangerCategory === 'speechToSong'
                    ? 'text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Speech to song
              </button>
            </div>

            {/* Voice Filters Grid */}
            {voiceChangerCategory === 'filters' && (
              <div className="grid grid-cols-3 gap-2">
                {VOICE_FILTERS.map((filter) => {
                  const isSelected = (audioSettings.voiceFilter || 'original') === filter.id;
                  return (
                    <button
                      key={filter.id}
                      onClick={() =>
                        onUpdateClip(clip.id, {
                          audioSettings: {
                            ...audioSettings,
                            voiceFilter: filter.id,
                          },
                        })
                      }
                      className={`p-2 rounded-lg border text-center flex flex-col items-center justify-center gap-1 transition ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                          : 'border-[#262633] bg-[#1a1a22] text-gray-400 hover:border-gray-600 hover:text-white'
                      }`}
                    >
                      <span className="text-xl">{filter.icon}</span>
                      <span className="text-[10px] font-bold truncate max-w-full">{filter.name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Voice Characters Grid */}
            {voiceChangerCategory === 'characters' && (
              <div className="grid grid-cols-2 gap-2">
                {VOICE_CHARACTERS.map((char) => {
                  const isSelected = audioSettings.voiceCharacter === char.id;
                  return (
                    <button
                      key={char.id}
                      onClick={() =>
                        onUpdateClip(clip.id, {
                          audioSettings: {
                            ...audioSettings,
                            voiceCharacter: isSelected ? undefined : char.id,
                          },
                        })
                      }
                      className={`p-2.5 rounded-lg border text-left flex items-center gap-2.5 transition ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                          : 'border-[#262633] bg-[#1a1a22] text-gray-400 hover:border-gray-600 hover:text-white'
                      }`}
                    >
                      <span className="text-2xl">{char.icon}</span>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold truncate">{char.name}</div>
                        <div className="text-[9px] text-gray-400 truncate">{char.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Speech to Song Grid */}
            {voiceChangerCategory === 'speechToSong' && (
              <div className="grid grid-cols-2 gap-2">
                {SPEECH_TO_SONG.map((song) => {
                  const isSelected = audioSettings.speechToSong === song.id;
                  return (
                    <button
                      key={song.id}
                      onClick={() =>
                        onUpdateClip(clip.id, {
                          audioSettings: {
                            ...audioSettings,
                            speechToSong: isSelected ? undefined : song.id,
                          },
                        })
                      }
                      className={`p-3 rounded-lg border text-center flex flex-col items-center justify-center gap-1 transition ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                          : 'border-[#262633] bg-[#1a1a22] text-gray-400 hover:border-gray-600 hover:text-white'
                      }`}
                    >
                      <span className="text-2xl">{song.icon}</span>
                      <div className="text-xs font-bold text-gray-200">{song.name}</div>
                      <div className="text-[10px] text-cyan-400 font-mono">{song.tempo}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= SPEED TAB ================= */}
        {audioTab === 'speed' && (
          <div className="space-y-4">
            {/* Playback Speed Slider */}
            <div className="bg-[#1a1a22] p-3.5 rounded-lg border border-[#262633] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-300">Speed</span>
                <span className="font-mono text-cyan-400 font-bold text-sm bg-[#121217] px-2 py-0.5 rounded border border-[#2e2e3e]">
                  {clip.playbackRate.toFixed(3)}x
                </span>
              </div>
              <input
                id="audio-playback-speed-slider"
                type="range"
                min="0.1"
                max="5.0"
                step="0.05"
                value={clip.playbackRate}
                onChange={(e) => onUpdateClip(clip.id, { playbackRate: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex gap-1.5 pt-1">
                {[0.5, 1.0, 1.5, 2.0, 4.0].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => onUpdateClip(clip.id, { playbackRate: rate })}
                    className={`flex-1 py-1 rounded text-[10px] font-mono border transition ${
                      Math.abs(clip.playbackRate - rate) < 0.01
                        ? 'border-cyan-400 bg-cyan-950/50 text-cyan-300 font-bold'
                        : 'border-gray-800 bg-[#121217] text-gray-400 hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* Clip Duration Display */}
            <div className="bg-[#1a1a22] p-3.5 rounded-lg border border-[#262633] flex items-center justify-between">
              <span className="text-gray-300">Duration</span>
              <span className="font-mono text-gray-200">
                {Math.floor(clip.duration / 60).toString().padStart(2, '0')}:
                {(Math.floor(clip.duration) % 60).toString().padStart(2, '0')}s
              </span>
            </div>

            {/* Change Audio Pitch Toggle */}
            <div className="bg-[#1a1a22] p-3.5 rounded-lg border border-[#262633] flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium text-gray-200">Change audio pitch</div>
                <div className="text-[10px] text-gray-400">Keep pitch natural when changing speed</div>
              </div>
              <button
                onClick={() =>
                  onUpdateClip(clip.id, {
                    audioSettings: {
                      ...audioSettings,
                      pitchShift: !audioSettings.pitchShift,
                    },
                  })
                }
                className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                  audioSettings.pitchShift !== false ? 'bg-cyan-500 justify-end' : 'bg-gray-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
