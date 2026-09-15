import React, { useState } from 'react';
import {
  Sliders, Palette, RotateCcw, Copy, Check, Eye, EyeOff, Sparkles,
  Sun, Moon, SunMedium, Thermometer, Droplets
} from 'lucide-react';
import { ColorGrading, ColorWheelSetting } from '../types';
import { ColorWheel } from './ColorWheel';
import {
  DEFAULT_COLOR_GRADING,
  isColorGradingActive,
  hueSatToRgbOffset
} from '../utils/editorUtils';

interface ColorGradingSectionProps {
  colorGrading?: ColorGrading;
  onChange: (grading: ColorGrading) => void;
  onReset?: () => void;
}

// Preset Cinematic 3-Way Grades
interface GradePreset {
  name: string;
  tag: string;
  badgeColor: string;
  grading: ColorGrading;
}

const CINEMATIC_GRADE_PRESETS: GradePreset[] = [
  {
    name: 'Teal & Orange',
    tag: 'Hollywood Blockbuster',
    badgeColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80',
    grading: {
      enabled: true,
      lift: { master: -6, hue: 195, saturation: 32, ...hueSatToRgbOffset(195, 32) },
      gamma: { master: 4, hue: 35, saturation: 16, ...hueSatToRgbOffset(35, 16) },
      gain: { master: 10, hue: 42, saturation: 38, ...hueSatToRgbOffset(42, 38) },
      temperature: 12,
      tint: -4,
    },
  },
  {
    name: 'Golden Hour',
    tag: 'Sunset Warmth',
    badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-800/80',
    grading: {
      enabled: true,
      lift: { master: 4, hue: 25, saturation: 18, ...hueSatToRgbOffset(25, 18) },
      gamma: { master: 8, hue: 45, saturation: 28, ...hueSatToRgbOffset(45, 28) },
      gain: { master: 14, hue: 52, saturation: 45, ...hueSatToRgbOffset(52, 45) },
      temperature: 32,
      tint: 6,
    },
  },
  {
    name: 'Nordic Cold',
    tag: 'Chilled Thriller',
    badgeColor: 'bg-blue-950/80 text-blue-300 border-blue-800/80',
    grading: {
      enabled: true,
      lift: { master: -5, hue: 220, saturation: 35, ...hueSatToRgbOffset(220, 35) },
      gamma: { master: -4, hue: 205, saturation: 14, ...hueSatToRgbOffset(205, 14) },
      gain: { master: 6, hue: 190, saturation: 18, ...hueSatToRgbOffset(190, 18) },
      temperature: -28,
      tint: 4,
    },
  },
  {
    name: 'Bleach Bypass',
    tag: 'High Contrast Grit',
    badgeColor: 'bg-gray-800 text-gray-300 border-gray-700',
    grading: {
      enabled: true,
      lift: { master: -18, hue: 0, saturation: 0, r: 0, g: 0, b: 0 },
      gamma: { master: -12, hue: 0, saturation: 0, r: 0, g: 0, b: 0 },
      gain: { master: 24, hue: 0, saturation: 0, r: 0, g: 0, b: 0 },
      temperature: -6,
      tint: -2,
    },
  },
  {
    name: 'Matrix Emerald',
    tag: 'Cyberpunk Sci-Fi',
    badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80',
    grading: {
      enabled: true,
      lift: { master: -8, hue: 142, saturation: 42, ...hueSatToRgbOffset(142, 42) },
      gamma: { master: 5, hue: 130, saturation: 28, ...hueSatToRgbOffset(130, 28) },
      gain: { master: 12, hue: 118, saturation: 36, ...hueSatToRgbOffset(118, 36) },
      temperature: -8,
      tint: -22,
    },
  },
  {
    name: 'Vintage Film',
    tag: 'Faded Kodak Print',
    badgeColor: 'bg-orange-950/80 text-orange-300 border-orange-800/80',
    grading: {
      enabled: true,
      lift: { master: 14, hue: 335, saturation: 22, ...hueSatToRgbOffset(335, 22) },
      gamma: { master: 4, hue: 55, saturation: 26, ...hueSatToRgbOffset(55, 26) },
      gain: { master: -4, hue: 62, saturation: 20, ...hueSatToRgbOffset(62, 20) },
      temperature: 16,
      tint: -8,
    },
  },
];

export const ColorGradingSection: React.FC<ColorGradingSectionProps> = ({
  colorGrading,
  onChange,
  onReset,
}) => {
  const current: ColorGrading = colorGrading || DEFAULT_COLOR_GRADING;
  const [viewMode, setViewMode] = useState<'all' | 'lift' | 'gamma' | 'gain'>('all');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Toggle active state (Bypass / Enable)
  const handleToggleEnable = () => {
    onChange({
      ...current,
      enabled: !current.enabled,
    });
  };

  // Reset entire grading
  const handleResetAll = () => {
    if (onReset) {
      onReset();
    } else {
      onChange(DEFAULT_COLOR_GRADING);
    }
  };

  // Wheel change handlers
  const handleWheelChange = (type: 'lift' | 'gamma' | 'gain', val: ColorWheelSetting) => {
    onChange({
      ...current,
      enabled: true, // auto-enable on adjustment
      [type]: val,
    });
  };

  // White balance handlers
  const handleTemperatureChange = (val: number) => {
    onChange({
      ...current,
      enabled: true,
      temperature: val,
    });
  };

  const handleTintChange = (val: number) => {
    onChange({
      ...current,
      enabled: true,
      tint: val,
    });
  };

  // Preset applicator
  const handleApplyPreset = (preset: GradePreset) => {
    onChange({
      ...preset.grading,
      enabled: true,
    });
  };

  // Copy grading to clipboard
  const handleCopyGrade = () => {
    navigator.clipboard.writeText(JSON.stringify(current));
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 1500);
  };

  // Paste grading from clipboard
  const handlePasteGrade = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object' && parsed.lift && parsed.gamma && parsed.gain) {
        onChange({
          ...parsed,
          enabled: true,
        });
      }
    } catch {
      console.warn('Could not paste color grade from clipboard');
    }
  };

  const isActive = isColorGradingActive(current);

  return (
    <div className="space-y-3 bg-[#1c1c24] p-3 rounded-xl border border-gray-800/90 shadow-lg">
      {/* SECTION HEADER: Title, Active Status, Bypass, Copy, and Reset */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500/20 via-amber-500/20 to-cyan-500/20 border border-gray-700/60">
            <Palette className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-[11px] font-bold text-gray-200 tracking-wider uppercase">
                Color Grading
              </h4>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-800/60 font-semibold">
                3-Way Wheels
              </span>
            </div>
            <p className="text-[9px] text-gray-500 font-mono">
              Lift (Shadows) • Gamma (Midtones) • Gain (Highlights)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {/* Bypass / Enable Toggle Button */}
          <button
            onClick={handleToggleEnable}
            className={`flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded border transition cursor-pointer ${
              current.enabled
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/60'
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-gray-200'
            }`}
            title={current.enabled ? 'Grade active (click to bypass)' : 'Grade bypassed (click to enable)'}
          >
            {current.enabled ? (
              <>
                <Eye className="w-2.5 h-2.5 text-emerald-400" />
                <span>On</span>
              </>
            ) : (
              <>
                <EyeOff className="w-2.5 h-2.5 text-gray-400" />
                <span>Bypass</span>
              </>
            )}
          </button>

          {/* Copy Grade */}
          <button
            onClick={handleCopyGrade}
            className="p-1 rounded bg-[#15151c] hover:bg-[#20202a] text-gray-400 hover:text-cyan-400 border border-gray-800 transition cursor-pointer"
            title="Copy color grade to clipboard"
          >
            {copiedNotification ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
          </button>

          {/* Reset All */}
          {isActive && (
            <button
              onClick={handleResetAll}
              className="flex items-center gap-1 text-[9px] text-gray-400 hover:text-cyan-400 transition font-mono px-1.5 py-0.5 rounded bg-[#15151c] hover:bg-[#20202a] border border-gray-800 cursor-pointer"
              title="Reset all color wheels and white balance"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* QUICK CINEMATIC PRESET LOOKS */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold text-gray-400 uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Curated Looks</span>
          </span>
          <button
            onClick={handlePasteGrade}
            className="text-[9px] font-mono text-gray-500 hover:text-cyan-400 transition cursor-pointer"
          >
            Paste Grade
          </button>
        </div>
        <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1">
          {CINEMATIC_GRADE_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleApplyPreset(preset)}
              className="flex-shrink-0 flex flex-col items-start px-2 py-1 rounded-lg bg-[#14141c] hover:bg-[#222230] border border-gray-800/80 hover:border-cyan-500/50 transition cursor-pointer text-left group"
            >
              <span className="text-[10px] font-bold text-gray-200 group-hover:text-cyan-400 transition">
                {preset.name}
              </span>
              <span className="text-[8px] font-mono text-gray-500">
                {preset.tag}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* WHITE BALANCE & CREATIVE TINT SLIDERS */}
      <div className="grid grid-cols-2 gap-2 bg-[#14141c] p-2.5 rounded-lg border border-gray-800/80">
        {/* Temperature */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-gray-300 font-medium flex items-center gap-1 font-mono">
              <Thermometer className="w-3 h-3 text-amber-400" />
              <span>Temp</span>
            </span>
            <div className="flex items-center gap-1 font-mono">
              <span className={`font-bold ${
                (current.temperature || 0) > 0 ? 'text-amber-400' :
                (current.temperature || 0) < 0 ? 'text-blue-400' : 'text-gray-400'
              }`}>
                {(current.temperature || 0) > 0 ? `+${current.temperature}` : current.temperature || 0}
              </span>
              {(current.temperature || 0) !== 0 && (
                <button
                  onClick={() => handleTemperatureChange(0)}
                  className="text-gray-500 hover:text-cyan-400 transition"
                  title="Reset Temperature"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>
          <div className="relative flex items-center">
            <input
              type="range"
              min="-100"
              max="100"
              step="1"
              value={current.temperature || 0}
              onChange={(e) => handleTemperatureChange(parseInt(e.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-blue-600 via-gray-700 to-amber-500"
            />
          </div>
          <div className="flex justify-between text-[8px] font-mono text-gray-500 px-0.5">
            <span className="text-blue-400">Cool</span>
            <span className="text-amber-400">Warm</span>
          </div>
        </div>

        {/* Tint */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-gray-300 font-medium flex items-center gap-1 font-mono">
              <Droplets className="w-3 h-3 text-fuchsia-400" />
              <span>Tint</span>
            </span>
            <div className="flex items-center gap-1 font-mono">
              <span className={`font-bold ${
                (current.tint || 0) > 0 ? 'text-fuchsia-400' :
                (current.tint || 0) < 0 ? 'text-emerald-400' : 'text-gray-400'
              }`}>
                {(current.tint || 0) > 0 ? `+${current.tint}` : current.tint || 0}
              </span>
              {(current.tint || 0) !== 0 && (
                <button
                  onClick={() => handleTintChange(0)}
                  className="text-gray-500 hover:text-cyan-400 transition"
                  title="Reset Tint"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>
          <div className="relative flex items-center">
            <input
              type="range"
              min="-100"
              max="100"
              step="1"
              value={current.tint || 0}
              onChange={(e) => handleTintChange(parseInt(e.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-emerald-600 via-gray-700 to-fuchsia-600"
            />
          </div>
          <div className="flex justify-between text-[8px] font-mono text-gray-500 px-0.5">
            <span className="text-emerald-400">Green</span>
            <span className="text-fuchsia-400">Magenta</span>
          </div>
        </div>
      </div>

      {/* WHEEL VIEW MODE SELECTOR */}
      <div className="flex items-center justify-between gap-1 p-0.5 bg-[#14141c] rounded-lg border border-gray-800">
        <button
          onClick={() => setViewMode('all')}
          className={`flex-1 py-1 text-[9px] font-mono font-bold rounded transition text-center cursor-pointer ${
            viewMode === 'all'
              ? 'bg-[#252532] text-cyan-400 shadow-sm border border-gray-700/60'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          3 Wheels
        </button>
        <button
          onClick={() => setViewMode('lift')}
          className={`flex-1 py-1 text-[9px] font-mono font-bold rounded transition text-center cursor-pointer flex items-center justify-center gap-1 ${
            viewMode === 'lift'
              ? 'bg-indigo-950/80 text-indigo-300 shadow-sm border border-indigo-800/80'
              : 'text-gray-400 hover:text-indigo-400'
          }`}
        >
          <Moon className="w-2.5 h-2.5" />
          <span>Lift</span>
        </button>
        <button
          onClick={() => setViewMode('gamma')}
          className={`flex-1 py-1 text-[9px] font-mono font-bold rounded transition text-center cursor-pointer flex items-center justify-center gap-1 ${
            viewMode === 'gamma'
              ? 'bg-amber-950/80 text-amber-300 shadow-sm border border-amber-800/80'
              : 'text-gray-400 hover:text-amber-400'
          }`}
        >
          <SunMedium className="w-2.5 h-2.5" />
          <span>Gamma</span>
        </button>
        <button
          onClick={() => setViewMode('gain')}
          className={`flex-1 py-1 text-[9px] font-mono font-bold rounded transition text-center cursor-pointer flex items-center justify-center gap-1 ${
            viewMode === 'gain'
              ? 'bg-cyan-950/80 text-cyan-300 shadow-sm border border-cyan-800/80'
              : 'text-gray-400 hover:text-cyan-400'
          }`}
        >
          <Sun className="w-2.5 h-2.5" />
          <span>Gain</span>
        </button>
      </div>

      {/* COLOR WHEELS DISPLAY */}
      {viewMode === 'all' ? (
        /* 3 Wheels Layout */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <ColorWheel
            label="Lift"
            type="lift"
            setting={current.lift}
            onChange={(val) => handleWheelChange('lift', val)}
            size={96}
            compact
          />
          <ColorWheel
            label="Gamma"
            type="gamma"
            setting={current.gamma}
            onChange={(val) => handleWheelChange('gamma', val)}
            size={96}
            compact
          />
          <ColorWheel
            label="Gain"
            type="gain"
            setting={current.gain}
            onChange={(val) => handleWheelChange('gain', val)}
            size={96}
            compact
          />
        </div>
      ) : (
        /* Single Focused Expanded Wheel */
        <div className="max-w-md mx-auto">
          {viewMode === 'lift' && (
            <ColorWheel
              label="Lift (Shadows)"
              type="lift"
              setting={current.lift}
              onChange={(val) => handleWheelChange('lift', val)}
              size={136}
            />
          )}
          {viewMode === 'gamma' && (
            <ColorWheel
              label="Gamma (Midtones)"
              type="gamma"
              setting={current.gamma}
              onChange={(val) => handleWheelChange('gamma', val)}
              size={136}
            />
          )}
          {viewMode === 'gain' && (
            <ColorWheel
              label="Gain (Highlights)"
              type="gain"
              setting={current.gain}
              onChange={(val) => handleWheelChange('gain', val)}
              size={136}
            />
          )}
        </div>
      )}
    </div>
  );
};
