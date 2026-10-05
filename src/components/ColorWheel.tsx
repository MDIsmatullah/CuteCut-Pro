import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RotateCcw, ChevronDown, ChevronUp, Sun, Moon, SunMedium } from 'lucide-react';
import { ColorWheelSetting } from '../types';
import { hueSatToRgbOffset, rgbOffsetToHueSat } from '../utils/editorUtils';

interface ColorWheelProps {
  label: string;
  type: 'lift' | 'gamma' | 'gain';
  setting: ColorWheelSetting;
  onChange: (setting: ColorWheelSetting) => void;
  size?: number; // wheel disc diameter in px (e.g. 104 for compact, 150 for detailed)
  compact?: boolean;
}

// Convert HSL to RGB helper for drawing the color wheel canvas
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

export const ColorWheel: React.FC<ColorWheelProps> = ({
  label,
  type,
  setting,
  onChange,
  size = 104,
  compact = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const discRef = useRef<HTMLDivElement | null>(null);
  const [showRgbChannels, setShowRgbChannels] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Type styling details
  const typeConfig = {
    lift: {
      subtitle: 'Shadows (Blacks)',
      icon: Moon,
      themeColor: '#818cf8', // indigo-400
      accentClass: 'accent-indigo-400',
      badgeBg: 'bg-indigo-950/70 border-indigo-800/60 text-indigo-300',
      dotColor: 'bg-indigo-400',
      sliderLabel: 'Lift Offset'
    },
    gamma: {
      subtitle: 'Midtones (Curve)',
      icon: SunMedium,
      themeColor: '#fbbf24', // amber-400
      accentClass: 'accent-amber-400',
      badgeBg: 'bg-amber-950/70 border-amber-800/60 text-amber-300',
      dotColor: 'bg-amber-400',
      sliderLabel: 'Gamma Power'
    },
    gain: {
      subtitle: 'Highlights (Whites)',
      icon: Sun,
      themeColor: '#06b6d4', // cyan-400
      accentClass: 'accent-cyan-400',
      badgeBg: 'bg-cyan-950/70 border-cyan-800/60 text-cyan-300',
      dotColor: 'bg-cyan-400',
      sliderLabel: 'Gain Level'
    }
  }[type];

  const IconComponent = typeConfig.icon;

  // Draw background color spectrum wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;
    const cx = size / 2;
    const cy = size / 2;
    const rMax = size / 2 - 1.5;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const idx = (y * size + x) * 4;

        if (dist <= rMax) {
          let rad = Math.atan2(dy, dx);
          if (rad < 0) rad += 2 * Math.PI;
          const deg = (rad * 180) / Math.PI;
          const satFraction = dist / rMax;
          // Saturation curve with slightly higher vibrancy towards rim, neutral gray in core
          const [r, g, b] = hslToRgb(deg, satFraction * 0.85, 0.42 + (1 - satFraction) * 0.08);

          // Anti-aliased outer edge
          const edgeAlpha = dist > rMax - 1 ? Math.max(0, (rMax - dist) * 255) : 255;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = edgeAlpha;
        } else {
          data[idx + 3] = 0;
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }, [size]);

  // Compute puck position
  const rMax = size / 2 - 2;
  const currentSat = Math.min(100, Math.max(0, setting.saturation || 0));
  const currentHue = (setting.hue || 0) % 360;
  const rad = (currentHue * Math.PI) / 180;
  const distFromCenter = (currentSat / 100) * rMax;
  const puckX = size / 2 + distFromCenter * Math.cos(rad);
  const puckY = size / 2 + distFromCenter * Math.sin(rad);

  // Compute tint color for puck styling
  const [tintR, tintG, tintB] = hslToRgb(currentHue, currentSat / 100, 0.55);
  const puckRingColor = currentSat > 0 ? `rgb(${tintR}, ${tintG}, ${tintB})` : '#94a3b8';

  // Handle puck drag
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const updateFromPointer = (clientX: number, clientY: number) => {
      const disc = discRef.current;
      if (!disc) return;
      const rect = disc.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const maxRadius = rect.width / 2 - 2;
      const newSat = Math.min(100, Math.max(0, Math.round((dist / maxRadius) * 100)));

      let newRad = Math.atan2(dy, dx);
      if (newRad < 0) newRad += 2 * Math.PI;
      const newHue = Math.round((newRad * 180) / Math.PI);

      const rgbOffsets = hueSatToRgbOffset(newHue, newSat);
      onChange({
        ...setting,
        hue: newHue,
        saturation: newSat,
        r: rgbOffsets.r,
        g: rgbOffsets.g,
        b: rgbOffsets.b,
      });
    };

    updateFromPointer(e.clientX, e.clientY);

    const onPointerMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();
      updateFromPointer(moveEv.clientX, moveEv.clientY);
    };

    const onPointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }, [onChange, setting]);

  // Reset entire wheel (puck + master level)
  const handleResetWheel = () => {
    onChange({
      master: 0,
      r: 0,
      g: 0,
      b: 0,
      hue: 0,
      saturation: 0,
    });
  };

  // Reset only the color puck tint (keep master level)
  const handleResetTint = () => {
    onChange({
      ...setting,
      r: 0,
      g: 0,
      b: 0,
      hue: 0,
      saturation: 0,
    });
  };

  // Handle master level slider
  const handleMasterChange = (val: number) => {
    onChange({
      ...setting,
      master: val,
    });
  };

  // Handle individual RGB channel changes
  const handleRgbChange = (channel: 'r' | 'g' | 'b', val: number) => {
    const updated = {
      ...setting,
      [channel]: val,
    };
    const hueSat = rgbOffsetToHueSat(updated.r || 0, updated.g || 0, updated.b || 0);
    onChange({
      ...updated,
      hue: hueSat.hue,
      saturation: hueSat.saturation,
    });
  };

  const isWheelModified =
    Math.abs(setting.master || 0) > 0 ||
    Math.abs(setting.r || 0) > 0 ||
    Math.abs(setting.g || 0) > 0 ||
    Math.abs(setting.b || 0) > 0 ||
    (setting.saturation || 0) > 0;

  return (
    <div className={`flex flex-col items-center bg-[#181820] p-2.5 rounded-xl border border-gray-800/80 shadow-md ${compact ? 'w-full' : 'w-full'}`}>
      {/* Header: Label, Icon, and Subtitle */}
      <div className="w-full flex items-center justify-between pb-2 border-b border-gray-800/60">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${typeConfig.dotColor} shadow-[0_0_8px_currentColor]`} />
          <span className="text-[11px] font-bold text-gray-100 uppercase tracking-wider">{label}</span>
          <IconComponent className="w-3 h-3 text-gray-400" />
        </div>
        <div className="flex items-center gap-1">
          {isWheelModified && (
            <button
              onClick={handleResetWheel}
              className="text-gray-400 hover:text-cyan-400 transition p-0.5 rounded cursor-pointer"
              title={`Reset ${label} (Shadows/Mids/Highs)`}
            >
              <RotateCcw className="w-2.5 h-2.5" />
            </button>
          )}
          <span className={`text-[8px] font-mono font-extrabold px-1.5 py-0.5 rounded border ${typeConfig.badgeBg}`}>
            {setting.master > 0 ? `+${setting.master}%` : `${setting.master || 0}%`}
          </span>
        </div>
      </div>

      <div className="text-[9px] text-gray-500 font-mono w-full text-left pt-1 pb-1">
        {typeConfig.subtitle}
      </div>

      {/* Interactive Circular Color Wheel Disc */}
      <div className="relative my-2 flex items-center justify-center select-none" style={{ width: size, height: size }}>
        <div
          ref={discRef}
          onPointerDown={handlePointerDown}
          onDoubleClick={handleResetTint}
          className="relative rounded-full cursor-crosshair overflow-hidden shadow-inner ring-1 ring-gray-700/80 hover:ring-cyan-500/50 transition-shadow"
          style={{ width: size, height: size }}
          title={`Click or drag to tint ${label}. Double-click to reset tint.`}
        >
          {/* Rendered Spectrum Canvas */}
          <canvas
            ref={canvasRef}
            style={{ width: size, height: size }}
            className="block pointer-events-none"
          />

          {/* Neutral Crosshairs Guides */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-full h-px bg-white/10" />
          </div>
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="h-full w-px bg-white/10" />
          </div>
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-4 h-4 rounded-full border border-white/15" />
          </div>

          {/* Draggable Puck / Reticle Handle */}
          <div
            className="absolute rounded-full pointer-events-none transition-transform duration-75 ease-out shadow-lg"
            style={{
              width: 14,
              height: 14,
              left: puckX - 7,
              top: puckY - 7,
              backgroundColor: currentSat > 0 ? puckRingColor : '#ffffff',
              border: '2px solid #000000',
              boxShadow: isDragging ? `0 0 10px ${puckRingColor}` : '0 2px 5px rgba(0,0,0,0.8)',
              transform: isDragging ? 'scale(1.2)' : 'scale(1)',
            }}
          >
            <div className="w-1.5 h-1.5 bg-black rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Polar Readout: Hue Angle & Saturation */}
      <div className="w-full flex justify-between items-center text-[9px] font-mono text-gray-400 px-1 pb-2">
        <span className="flex items-center gap-1">
          <span className="text-gray-500">Tint:</span>
          <span className={currentSat > 0 ? 'text-gray-200 font-bold' : 'text-gray-500'}>
            {currentSat > 0 ? `${currentHue}°` : 'Neutral'}
          </span>
        </span>
        <span className="flex items-center gap-1">
          <span className="text-gray-500">Sat:</span>
          <span className={currentSat > 0 ? 'text-cyan-400 font-bold' : 'text-gray-500'}>
            {currentSat}%
          </span>
          {currentSat > 0 && (
            <button
              onClick={handleResetTint}
              className="text-gray-500 hover:text-cyan-400 ml-1 transition"
              title="Reset tint puck to center"
            >
              <RotateCcw className="w-2 h-2" />
            </button>
          )}
        </span>
      </div>

      {/* Master Luminance Slider */}
      <div className="w-full space-y-1 bg-[#131318] p-2 rounded-lg border border-gray-800/80">
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-gray-300 font-medium flex items-center gap-1">
            <span>{typeConfig.sliderLabel}</span>
          </span>
          <div className="flex items-center gap-1 font-mono">
            <span className="text-cyan-400 font-bold">
              {setting.master > 0 ? `+${setting.master}` : setting.master || 0}%
            </span>
            {(setting.master || 0) !== 0 && (
              <button
                onClick={() => handleMasterChange(0)}
                className="text-gray-500 hover:text-cyan-400 transition"
                title={`Reset ${typeConfig.sliderLabel}`}
              >
                <RotateCcw className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        </div>
        <input
          type="range"
          min="-100"
          max="100"
          step="1"
          value={setting.master || 0}
          onChange={(e) => handleMasterChange(parseInt(e.target.value))}
          className={`w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer ${typeConfig.accentClass}`}
        />
        <div className="flex justify-between text-[8px] font-mono text-gray-500 px-0.5">
          <span>-100%</span>
          <span>0%</span>
          <span>+100%</span>
        </div>
      </div>

      {/* Expandable RGB Channel Sliders for surgical precision */}
      <div className="w-full mt-2">
        <button
          onClick={() => setShowRgbChannels(!showRgbChannels)}
          className="w-full flex items-center justify-between py-1 px-1.5 text-[9px] font-mono font-bold text-gray-400 hover:text-gray-200 transition rounded bg-[#131318] hover:bg-[#1b1b22] border border-gray-800 cursor-pointer"
        >
          <span className="flex items-center gap-1">
            <span className="text-red-400">R</span>
            <span className="text-green-400">G</span>
            <span className="text-blue-400">B</span>
            <span>Channels</span>
          </span>
          {showRgbChannels ? (
            <ChevronUp className="w-3 h-3 text-gray-500" />
          ) : (
            <ChevronDown className="w-3 h-3 text-gray-500" />
          )}
        </button>

        {showRgbChannels && (
          <div className="space-y-2 mt-2 bg-[#121216] p-2 rounded-lg border border-gray-800/80 animate-in fade-in duration-150">
            {/* Red Channel */}
            <div className="space-y-0.5">
              <div className="flex justify-between items-center text-[9px]">
                <span className="text-red-400 font-bold font-mono">Red</span>
                <span className="font-mono text-red-300">
                  {setting.r > 0 ? `+${setting.r}` : setting.r || 0}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={setting.r || 0}
                onChange={(e) => handleRgbChange('r', parseInt(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-red-500"
              />
            </div>

            {/* Green Channel */}
            <div className="space-y-0.5">
              <div className="flex justify-between items-center text-[9px]">
                <span className="text-emerald-400 font-bold font-mono">Green</span>
                <span className="font-mono text-emerald-300">
                  {setting.g > 0 ? `+${setting.g}` : setting.g || 0}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={setting.g || 0}
                onChange={(e) => handleRgbChange('g', parseInt(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Blue Channel */}
            <div className="space-y-0.5">
              <div className="flex justify-between items-center text-[9px]">
                <span className="text-blue-400 font-bold font-mono">Blue</span>
                <span className="font-mono text-blue-300">
                  {setting.b > 0 ? `+${setting.b}` : setting.b || 0}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={setting.b || 0}
                onChange={(e) => handleRgbChange('b', parseInt(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
