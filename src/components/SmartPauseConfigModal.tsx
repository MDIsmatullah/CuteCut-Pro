import React, { useState } from 'react';
import {
  Sliders,
  X,
  Volume2,
  Clock,
  CheckCircle2,
  Brain,
  Sparkles,
  Info,
  HelpCircle,
  Scissors
} from 'lucide-react';

interface SmartPauseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: {
    rmsThresholdDb: number;
    minSilenceMs: number;
    gapHandling: 'preserve-gaps' | 'bridge-seamless' | 'label-pauses';
    paddingMs: number;
  }) => void;
  initialRmsThresholdDb?: number;
  initialMinSilenceMs?: number;
  initialGapHandling?: 'preserve-gaps' | 'bridge-seamless' | 'label-pauses';
  initialPaddingMs?: number;
}

export const SmartPauseConfigModal: React.FC<SmartPauseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialRmsThresholdDb = -29,
  initialMinSilenceMs = 240,
  initialGapHandling = 'label-pauses',
  initialPaddingMs = 120,
}) => {
  const [rmsThresholdDb, setRmsThresholdDb] = useState<number>(initialRmsThresholdDb);
  const [minSilenceMs, setMinSilenceMs] = useState<number>(initialMinSilenceMs);
  const [gapHandling, setGapHandling] = useState<'preserve-gaps' | 'bridge-seamless' | 'label-pauses'>(initialGapHandling);
  const [paddingMs, setPaddingMs] = useState<number>(initialPaddingMs);
  const [showUrduHelp, setShowUrduHelp] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleRun = () => {
    onConfirm({
      rmsThresholdDb,
      minSilenceMs,
      gapHandling,
      paddingMs,
    });
    onClose();
  };

  // Human-readable summary of RMS threshold sensitivity
  const getSensitivityLabel = (db: number) => {
    if (db <= -38) return { label: '🔊 Highly Sensitive (Awaaz ke halkay sur/sansaahat ko bhi pakre ga)', color: 'text-rose-400' };
    if (db >= -26) return { label: '🔇 Low Sensitivity (Sirf loud awaaz ko pakre ga, background noise ignore kare ga)', color: 'text-amber-400' };
    return { label: '🧠 Balanced (Aam recitation aur natural saans lene ke liye behtareen hai)', color: 'text-emerald-400' };
  };

  const sensitivityInfo = getSensitivityLabel(rmsThresholdDb);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[110] flex items-center justify-center p-4">
      <div 
        className="w-full max-w-xl bg-[#0b0b10] border border-[#202030] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        id="smart-pause-config-modal"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1c1c28] bg-[#0d0d14] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-100 flex items-center gap-2">
                Smart Pause (Waqf) Settings
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">PRO</span>
              </h2>
              <p className="text-[10px] text-gray-400">Calibrate acoustic intelligence & breath segmentation</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-200 hover:bg-gray-900/40 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Bilingual Quick Help */}
          <div className="p-3.5 bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl space-y-2 relative">
            <button
              onClick={() => setShowUrduHelp(!showUrduHelp)}
              className="absolute top-2 right-2 text-[10px] text-amber-300 hover:underline flex items-center gap-1 font-semibold"
            >
              <HelpCircle className="w-3 h-3" />
              {showUrduHelp ? 'English Info' : 'Urdu Guideline'}
            </button>
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1">
                <p className="font-bold text-gray-200">How to perfectly calibrate Waqf Detection:</p>
                {showUrduHelp ? (
                  <p className="text-gray-300 leading-relaxed text-[11px]">
                    یہ ماڈل تلاوت کے دوران سانس لینے کے وقفوں (Waqf) کو خودکار طور پر الگ اور رنگین پوز کلپس میں بدل دیتا ہے۔ اگر آپ کا مائیک بہت شور والا ہے تو RMS کی حساسیت کو دائیں طرف (-26dB) کریں، اور اگر تلاوت کے دھیمے سر پکڑنے ہیں تو اسے بائیں طرف (-36dB) کی طرف لے جائیں۔
                  </p>
                ) : (
                  <p className="text-gray-300 leading-relaxed text-[10.5px]">
                    This module segments your recitation into individual verses, and turns silent breathing pauses into labeled <strong>"Waqf Pause"</strong> blocks. Tweak the noise sensitivity to match your microphone background noise levels.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* RMS sensitivity slider */}
          <div className="space-y-2 bg-[#101018] border border-[#1d1d2b] p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-200 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                RMS Noise Sensitivity (Dezibel)
              </span>
              <span className="text-amber-400 font-mono font-bold text-xs">{rmsThresholdDb} dB</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Lower decibel detects quieter breaths as voice activity. Higher decibel ignores low-amplitude noise.
            </p>
            <div className="pt-2">
              <input 
                type="range"
                min="-45"
                max="-20"
                step="1"
                value={rmsThresholdDb}
                onChange={(e) => setRmsThresholdDb(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1 bg-gray-800 rounded-lg"
              />
              <div className="flex justify-between text-[8px] text-gray-500 font-mono mt-1">
                <span>-45 dB (Extremely Sensitive)</span>
                <span>-32 dB (Default)</span>
                <span>-20 dB (Ignore Noise)</span>
              </div>
            </div>
            {/* Dynamic label */}
            <div className={`p-2 bg-[#0a0a0f] border border-[#1b1b28] rounded-lg mt-1 text-[10px] font-medium ${sensitivityInfo.color}`}>
              {sensitivityInfo.label}
            </div>
          </div>

          {/* Silence Duration */}
          <div className="space-y-2 bg-[#101018] border border-[#1d1d2b] p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Minimum Waqf Duration
              </span>
              <span className="text-cyan-400 font-mono font-bold text-xs">{minSilenceMs} ms</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Min silence required to trigger a split. 400ms is standard breathing duration. 
              (1000ms = 1 second)
            </p>
            <div className="pt-2">
              <input 
                type="range"
                min="200"
                max="1800"
                step="50"
                value={minSilenceMs}
                onChange={(e) => setMinSilenceMs(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer h-1 bg-gray-800 rounded-lg"
              />
              <div className="flex justify-between text-[8px] text-gray-500 font-mono mt-1">
                <span>200 ms (Short breaths)</span>
                <span>400 ms (Waqf)</span>
                <span>1800 ms (Long silence)</span>
              </div>
            </div>
          </div>

          {/* Gap Handling Strategy */}
          <div className="space-y-2">
            <span className="font-bold text-gray-300 block mb-1">Timeline Placement & Gap Strategy:</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { 
                  id: 'label-pauses', 
                  title: '🧠 Waqf Clips', 
                  desc: 'Split & color silence intervals' 
                },
                { 
                  id: 'preserve-gaps', 
                  title: '⏸️ Empty Gaps', 
                  desc: 'Keep raw silent spacing empty' 
                },
                { 
                  id: 'bridge-seamless', 
                  title: '🔗 Seamless', 
                  desc: 'Bridge and fill up silences' 
                },
              ].map((strategy) => (
                <button
                  key={strategy.id}
                  type="button"
                  onClick={() => setGapHandling(strategy.id as any)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${
                    gapHandling === strategy.id
                      ? 'bg-amber-500/10 border-amber-400 text-amber-200 font-bold'
                      : 'bg-[#101018] border-[#1d1d2b] text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <span className="text-[11px] font-bold">{strategy.title}</span>
                  <span className="text-[8px] text-gray-400 mt-1 leading-tight">{strategy.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Padding offset */}
          <div className="space-y-2 bg-[#101018] border border-[#1d1d2b] p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                Verse Safety Padding
              </span>
              <span className="text-purple-400 font-mono font-bold text-xs">{paddingMs} ms</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Adds safe tail room to the start & end of split clips to prevent cutting of final letters or Tajweed echoes.
            </p>
            <div className="pt-2">
              <input 
                type="range"
                min="0"
                max="350"
                step="10"
                value={paddingMs}
                onChange={(e) => setPaddingMs(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer h-1 bg-gray-800 rounded-lg"
              />
              <div className="flex justify-between text-[8px] text-gray-500 font-mono mt-1">
                <span>0 ms (Sharp cut)</span>
                <span>120 ms (Ideal)</span>
                <span>350 ms (Wide boundary)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-[#1c1c28] bg-[#0d0d14] flex items-center justify-between">
          <span className="text-[10px] text-gray-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Acoustic settings persist in this session
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-transparent hover:bg-gray-900 text-gray-300 font-semibold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleRun}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
            >
              <Scissors className="w-3.5 h-3.5" />
              Run Segmentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
