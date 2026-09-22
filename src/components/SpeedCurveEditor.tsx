import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import {
  Activity,
  RotateCcw,
  Sparkles,
  Zap,
  Plus,
  Trash2,
  Sliders,
  Volume2,
  Check,
  ArrowLeftRight,
  TrendingUp,
  Maximize2,
  CornerDownRight,
  Split,
  Circle,
  HelpCircle,
} from 'lucide-react';
import { Clip } from '../types';
import {
  SpeedRampPoint,
  SPEED_RAMP_PRESETS,
  SpeedRampPresetDef,
  getClipRampPoints,
  sampleSpeedAtNormalizedPosition,
  getClipEffectiveSpeedAtTime,
  getClipTotalSourceDuration,
  ensureBezierHandles,
  flipSpeedCurvePoints,
  scaleSpeedCurvePoints,
} from '../utils/speedRampUtils';

interface SpeedCurveEditorProps {
  clip: Clip;
  onUpdateClip: (clipId: string, updates: Partial<Clip>) => void;
  currentTime?: number;
  onSeek?: (time: number) => void;
}

const MIN_SPEED = 0.1;
const MAX_SPEED = 10.0;

type DragTarget =
  | { type: 'point'; index: number }
  | { type: 'handle-in'; index: number }
  | { type: 'handle-out'; index: number }
  | null;

export const SpeedCurveEditor: React.FC<SpeedCurveEditorProps> = ({
  clip,
  onUpdateClip,
  currentTime,
  onSeek,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dragTarget, setDragTarget] = useState<DragTarget>(null);
  const [presetCategory, setPresetCategory] = useState<string>('All');
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Clip timing calculations
  const clipStart = clip.start || 0;
  const clipDuration = Math.max(0.01, clip.duration || 1.0);
  const isWithinClip =
    currentTime !== undefined &&
    currentTime >= clipStart &&
    currentTime <= clipStart + clipDuration;
  const elapsedInClip = isWithinClip && currentTime !== undefined ? currentTime - clipStart : 0;
  const normalizedPlayheadU = Math.max(0, Math.min(1, elapsedInClip / clipDuration));

  // Current ramp points with verified Bezier handles
  const points: SpeedRampPoint[] = useMemo(() => {
    const raw = getClipRampPoints(clip);
    if (raw.length >= 2) return raw;
    const defaultPreset = SPEED_RAMP_PRESETS.find((p) => p.id === 'none');
    return defaultPreset ? ensureBezierHandles(defaultPreset.points) : [
      { x: 0, y: 1, handleType: 'smooth' },
      { x: 1, y: 1, handleType: 'smooth' },
    ];
  }, [clip.speedRamp]);

  // Current effective speed at playhead
  const currentSpeed = useMemo(() => {
    return sampleSpeedAtNormalizedPosition(points, normalizedPlayheadU);
  }, [points, normalizedPlayheadU]);

  // Active preset ID
  const currentPresetId = clip.speedRamp?.preset || (clip.speedRamp?.enabled ? 'custom' : 'none');

  // Convert speed value (y) to SVG coordinate Y (0 top to 100 bottom) with log-scale response
  const speedToSvgY = useCallback((speed: number) => {
    const clamped = Math.max(MIN_SPEED, Math.min(MAX_SPEED, speed));
    // Logarithmic curve mapping gives ample precision around 0.2x - 2.0x
    const minLog = Math.log(MIN_SPEED);
    const maxLog = Math.log(MAX_SPEED);
    const curLog = Math.log(clamped);
    const normalized = (curLog - minLog) / (maxLog - minLog);
    return 94 - normalized * 84;
  }, []);

  // Convert SVG coordinate Y back to speed multiplier
  const svgYToSpeed = useCallback((svgY: number) => {
    const normalized = (94 - svgY) / 84;
    const clampedNorm = Math.max(0, Math.min(1, normalized));
    const minLog = Math.log(MIN_SPEED);
    const maxLog = Math.log(MAX_SPEED);
    const speed = Math.exp(minLog + clampedNorm * (maxLog - minLog));
    return Math.round(speed * 100) / 100;
  }, []);

  // SVG coordinate X to normalized timeline position (0 to 1)
  const svgXToNorm = useCallback((svgX: number) => {
    return Math.max(0, Math.min(1, (svgX - 5) / 90));
  }, []);

  const normToSvgX = useCallback((norm: number) => {
    return 5 + norm * 90;
  }, []);

  // Helper to commit point updates
  const updatePoints = (newPoints: SpeedRampPoint[], preset: string = 'custom') => {
    const sorted = [...newPoints].sort((a, b) => a.x - b.x);
    if (sorted.length >= 2) {
      sorted[0] = { ...sorted[0], x: 0 };
      sorted[sorted.length - 1] = { ...sorted[sorted.length - 1], x: 1 };
    }
    const handled = ensureBezierHandles(sorted);
    const curve = handled.map((p) => p.y);

    onUpdateClip(clip.id, {
      speedRamp: {
        enabled: true,
        preset,
        points: handled,
        curve,
        smoothSlowMo: clip.speedRamp?.smoothSlowMo ?? true,
        maintainPitch: clip.speedRamp?.maintainPitch ?? true,
      },
      playbackRate: handled[Math.floor(handled.length / 2)]?.y || 1.0,
    });
  };

  // Keyboard shortcut to delete active point
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIndex !== null) {
        if (selectedIndex > 0 && selectedIndex < points.length - 1) {
          e.preventDefault();
          const next = points.filter((_, i) => i !== selectedIndex);
          setSelectedIndex(null);
          updatePoints(next, 'custom');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, points]);

  // Pointer move handler on SVG
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragTarget || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * 100;
    const relY = ((e.clientY - rect.top) / rect.height) * 100;

    const normX = svgXToNorm(relX);
    const newSpeed = svgYToSpeed(relY);
    const newPoints = points.map((p) => ({ ...p }));

    if (dragTarget.type === 'point') {
      const idx = dragTarget.index;
      if (idx === 0) {
        newPoints[0] = { ...newPoints[0], x: 0, y: newSpeed };
      } else if (idx === points.length - 1) {
        newPoints[idx] = { ...newPoints[idx], x: 1, y: newSpeed };
      } else {
        const prevX = points[idx - 1].x + 0.02;
        const nextX = points[idx + 1].x - 0.02;
        const clampedX = Math.max(prevX, Math.min(nextX, normX));
        newPoints[idx] = { ...newPoints[idx], x: clampedX, y: newSpeed };
      }
    } else if (dragTarget.type === 'handle-out') {
      const idx = dragTarget.index;
      const pt = newPoints[idx];
      const nextPt = newPoints[idx + 1] || { x: 1, y: pt.y };
      const clampedX = Math.max(pt.x + 0.01, Math.min(nextPt.x - 0.01, normX));
      
      const newCpOut = { x: clampedX, y: newSpeed };
      newPoints[idx].cpOut = newCpOut;

      // In smooth mode, keep incoming handle collinearly opposite
      if (pt.handleType === 'smooth' && pt.cpIn && idx > 0) {
        const dx = newCpOut.x - pt.x;
        const dy = newCpOut.y - pt.y;
        const prevPt = newPoints[idx - 1];
        newPoints[idx].cpIn = {
          x: Math.max(prevPt.x + 0.01, Math.min(pt.x - 0.01, pt.x - dx)),
          y: Math.max(MIN_SPEED, Math.min(MAX_SPEED, pt.y - dy)),
        };
      }
    } else if (dragTarget.type === 'handle-in') {
      const idx = dragTarget.index;
      const pt = newPoints[idx];
      const prevPt = newPoints[idx - 1] || { x: 0, y: pt.y };
      const clampedX = Math.max(prevPt.x + 0.01, Math.min(pt.x - 0.01, normX));
      
      const newCpIn = { x: clampedX, y: newSpeed };
      newPoints[idx].cpIn = newCpIn;

      // In smooth mode, keep outgoing handle collinearly opposite
      if (pt.handleType === 'smooth' && pt.cpOut && idx < points.length - 1) {
        const dx = pt.x - newCpIn.x;
        const dy = pt.y - newCpIn.y;
        const nextPt = newPoints[idx + 1];
        newPoints[idx].cpOut = {
          x: Math.max(pt.x + 0.01, Math.min(nextPt.x - 0.01, pt.x + dx)),
          y: Math.max(MIN_SPEED, Math.min(MAX_SPEED, pt.y + dy)),
        };
      }
    }

    updatePoints(newPoints, 'custom');
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragTarget) {
      setDragTarget(null);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Add a new point on SVG click
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || dragTarget) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * 100;
    const relY = ((e.clientY - rect.top) / rect.height) * 100;

    const normX = svgXToNorm(relX);
    const speed = svgYToSpeed(relY);

    // Prevent adding if too close to an existing point
    const closeIdx = points.findIndex((p) => Math.abs(p.x - normX) < 0.04);
    if (closeIdx !== -1) {
      setSelectedIndex(closeIdx);
      return;
    }

    const newPoints = [...points, { x: normX, y: speed, handleType: 'smooth' as const }].sort(
      (a, b) => a.x - b.x
    );
    const newIdx = newPoints.findIndex((p) => p.x === normX);
    setSelectedIndex(newIdx !== -1 ? newIdx : null);
    updatePoints(newPoints, 'custom');
  };

  // Preset Selection
  const handleSelectPreset = (presetDef: SpeedRampPresetDef) => {
    if (presetDef.id === 'none') {
      onUpdateClip(clip.id, {
        speedRamp: {
          enabled: false,
          preset: 'none',
          points: presetDef.points,
          curve: presetDef.curve,
          smoothSlowMo: clip.speedRamp?.smoothSlowMo ?? true,
          maintainPitch: clip.speedRamp?.maintainPitch ?? true,
        },
        playbackRate: 1.0,
      });
      setSelectedIndex(null);
      return;
    }

    const handled = ensureBezierHandles(presetDef.points);
    onUpdateClip(clip.id, {
      speedRamp: {
        enabled: true,
        preset: presetDef.id,
        points: handled,
        curve: presetDef.curve,
        smoothSlowMo: clip.speedRamp?.smoothSlowMo ?? true,
        maintainPitch: clip.speedRamp?.maintainPitch ?? true,
      },
      playbackRate: presetDef.curve[Math.floor(presetDef.curve.length / 2)] || 1.0,
    });
    setSelectedIndex(null);
  };

  // Add Keyframe at Current Playhead
  const handleAddPointAtPlayhead = () => {
    const existsClose = points.some((p) => Math.abs(p.x - normalizedPlayheadU) < 0.03);
    if (existsClose) return;
    const speedAtU = sampleSpeedAtNormalizedPosition(points, normalizedPlayheadU);
    const newPoints = [
      ...points,
      { x: normalizedPlayheadU, y: speedAtU, handleType: 'smooth' as const },
    ].sort((a, b) => a.x - b.x);
    const newIdx = newPoints.findIndex((p) => p.x === normalizedPlayheadU);
    setSelectedIndex(newIdx !== -1 ? newIdx : null);
    updatePoints(newPoints, 'custom');
  };

  // Reset to flat 1.0x
  const handleResetCurve = () => {
    const normal = SPEED_RAMP_PRESETS.find((p) => p.id === 'none')!;
    handleSelectPreset(normal);
  };

  // Reverse / Flip Curve
  const handleFlipCurve = () => {
    const flipped = flipSpeedCurvePoints(points);
    updatePoints(flipped, 'custom');
  };

  // Scale Velocity (0.5x, 1.5x, 2.0x)
  const handleScaleCurve = (factor: number) => {
    const scaled = scaleSpeedCurvePoints(points, factor);
    updatePoints(scaled, 'custom');
  };

  // Smooth All Handles
  const handleSmoothAll = () => {
    const smoothed = points.map((p) => ({ ...p, handleType: 'smooth' as const }));
    const result = ensureBezierHandles(smoothed);
    updatePoints(result, 'custom');
  };

  // Build SVG cubic Bezier path
  const pathD = useMemo(() => {
    if (points.length < 2) return '';
    let d = `M ${normToSvgX(points[0].x)} ${speedToSvgY(points[0].y)}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      if (p1.handleType === 'linear') {
        d += ` L ${normToSvgX(p2.x)} ${speedToSvgY(p2.y)}`;
      } else {
        const cp1x = normToSvgX(p1.cpOut ? p1.cpOut.x : p1.x + (p2.x - p1.x) / 3);
        const cp1y = speedToSvgY(p1.cpOut ? p1.cpOut.y : p1.y);
        const cp2x = normToSvgX(p2.cpIn ? p2.cpIn.x : p2.x - (p2.x - p1.x) / 3);
        const cp2y = speedToSvgY(p2.cpIn ? p2.cpIn.y : p2.y);
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${normToSvgX(p2.x)} ${speedToSvgY(p2.y)}`;
      }
    }
    return d;
  }, [points, normToSvgX, speedToSvgY]);

  // Area under curve fill
  const areaPathD = useMemo(() => {
    if (!pathD) return '';
    return `${pathD} L ${normToSvgX(1)} 95 L ${normToSvgX(0)} 95 Z`;
  }, [pathD, normToSvgX]);

  // Source media duration calculation
  const sourceUsedSec = useMemo(() => getClipTotalSourceDuration(clip), [clip]);

  // Selected point details
  const selectedPoint = selectedIndex !== null ? points[selectedIndex] : null;

  // Filtered presets
  const filteredPresets = useMemo(() => {
    if (presetCategory === 'All') return SPEED_RAMP_PRESETS;
    return SPEED_RAMP_PRESETS.filter((p) => p.category === presetCategory);
  }, [presetCategory]);

  return (
    <div className="space-y-4 text-gray-200">
      {/* 1. Header & Live Velocity Monitor */}
      <div className="flex items-center justify-between pb-2 border-b border-[#232330]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-950">
            <Activity className="w-4 h-4 animate-pulse text-cyan-300" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Bézier Speed Curve</span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[9px] font-bold border border-cyan-500/30">
                PRO RAMP
              </span>
            </div>
            <div className="text-[10px] text-gray-400">
              Cubic Bézier velocity remapping with interactive tangent handles
            </div>
          </div>
        </div>

        {/* Live Velocity Badge & Help Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#101016] px-2.5 py-1 rounded-md border border-cyan-500/40 shadow-inner">
            <span className="text-[10px] text-gray-400 font-medium">Velocity:</span>
            <span className="text-xs font-mono font-extrabold text-cyan-400">
              {currentSpeed.toFixed(2)}x
            </span>
          </div>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-1 text-gray-400 hover:text-cyan-300 transition"
            title="How to use Bezier curves"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Guide Banner */}
      {showHelp && (
        <div className="bg-cyan-950/30 border border-cyan-800/40 rounded-lg p-2.5 text-[11px] text-cyan-200/90 space-y-1">
          <div className="font-bold text-white flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>How to shape motion curves:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[10px] text-gray-300">
            <li><strong className="text-cyan-300">Click anywhere on curve</strong> to add a keyframe point.</li>
            <li><strong className="text-cyan-300">Drag control point</strong> up/down to adjust speed, left/right for timing.</li>
            <li><strong className="text-cyan-300">Drag circular tangent handles</strong> to curve acceleration & deceleration.</li>
            <li><strong className="text-cyan-300">Double click or press Delete</strong> to remove a selected point.</li>
          </ul>
        </div>
      )}

      {/* 2. Speed Curve Presets Gallery with Visual Miniatures */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-[#121218] p-0.5 rounded-lg border border-gray-800 text-[10px]">
            {['All', 'Classic', 'Cinematic', 'Music & Beat', 'Action'].map((cat) => (
              <button
                key={cat}
                onClick={() => setPresetCategory(cat)}
                className={`px-2 py-0.5 rounded transition ${
                  presetCategory === cat
                    ? 'bg-cyan-500 text-black font-bold shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={handleResetCurve}
            className="text-[10px] text-gray-400 hover:text-cyan-400 transition flex items-center gap-1 font-medium"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset (1.0x)</span>
          </button>
        </div>

        {/* Preset Cards Grid with SVG Miniatures */}
        <div className="grid grid-cols-4 gap-2">
          {filteredPresets.map((preset) => {
            const isSelected = currentPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-2 rounded-lg border text-left transition flex flex-col justify-between group relative overflow-hidden ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-950'
                    : 'bg-[#14141c] border-gray-800 text-gray-300 hover:border-gray-700 hover:bg-[#181824]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-bold text-[11px] truncate">{preset.name}</span>
                  {isSelected && <Check className="w-3 h-3 text-cyan-400 shrink-0" />}
                </div>

                {/* Mini SVG Curve Preview */}
                <div className="w-full h-7 bg-[#0b0b10] rounded border border-gray-800/80 mb-1 overflow-hidden pointer-events-none flex items-center justify-center">
                  <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full p-0.5">
                    {/* Baseline */}
                    <line x1="0" y1="20" x2="100" y2="20" stroke="#374151" strokeWidth="0.8" strokeDasharray="2,2" />
                    {/* Curve Polyline */}
                    {preset.points && preset.points.length >= 2 && (
                      <polyline
                        fill="none"
                        stroke={isSelected ? '#22d3ee' : '#9ca3af'}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={preset.points
                          .map((p) => {
                            const x = p.x * 90 + 5;
                            const y = 36 - ((Math.log(p.y) - Math.log(MIN_SPEED)) / (Math.log(MAX_SPEED) - Math.log(MIN_SPEED))) * 32;
                            return `${x},${Math.max(2, Math.min(38, y))}`;
                          })
                          .join(' ')}
                      />
                    )}
                  </svg>
                </div>

                <span className="text-[9px] text-gray-400 line-clamp-1">
                  {preset.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Primary Interactive Bezier Speed Curve Canvas */}
      <div className="bg-[#121218] p-3 rounded-lg border border-[#272738] space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-gray-200 font-semibold flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive Bézier Graph</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleFlipCurve}
              className="text-[10px] text-gray-400 hover:text-cyan-300 transition flex items-center gap-1 px-1.5 py-0.5 bg-[#1b1b26] rounded border border-gray-700"
              title="Reverse / Invert curve direction"
            >
              <ArrowLeftRight className="w-2.5 h-2.5" />
              <span>Flip</span>
            </button>
            <button
              onClick={handleSmoothAll}
              className="text-[10px] text-gray-400 hover:text-cyan-300 transition flex items-center gap-1 px-1.5 py-0.5 bg-[#1b1b26] rounded border border-gray-700"
              title="Smooth all tangent handles"
            >
              <TrendingUp className="w-2.5 h-2.5" />
              <span>Auto-Smooth</span>
            </button>
          </div>
        </div>

        {/* SVG Curve Canvas Container */}
        <div className="relative w-full h-48 bg-[#09090e] rounded-lg border border-gray-800 overflow-hidden select-none">
          {/* Horizontal Velocity Grid Lines & Labels */}
          <div className="absolute inset-0 pointer-events-none">
            {[8.0, 4.0, 2.0, 1.0, 0.5, 0.2].map((speedVal) => {
              const yPos = speedToSvgY(speedVal);
              const isBaseline = speedVal === 1.0;
              return (
                <div
                  key={speedVal}
                  className="absolute w-full flex items-center"
                  style={{ top: `${yPos}%` }}
                >
                  <div
                    className={`w-full border-b ${
                      isBaseline
                        ? 'border-cyan-500/50 border-dashed'
                        : 'border-gray-800/60'
                    }`}
                  />
                  <span
                    className={`absolute right-2 -top-2.5 font-mono text-[8.5px] px-1 rounded ${
                      isBaseline
                        ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-600/40'
                        : 'text-gray-400'
                    }`}
                  >
                    {speedVal.toFixed(1)}x {isBaseline ? '(Normal)' : ''}
                  </span>
                </div>
              );
            })}

            {/* Vertical Time Guides (0%, 25%, 50%, 75%, 100%) */}
            {[0.25, 0.5, 0.75].map((pct) => (
              <div
                key={pct}
                className="absolute h-full border-r border-gray-800/40"
                style={{ left: `${normToSvgX(pct)}%` }}
              >
                <span className="absolute bottom-1 -left-3 font-mono text-[8px] text-gray-400">
                  {Math.round(pct * 100)}%
                </span>
              </div>
            ))}
          </div>

          {/* SVG Canvas for Curve & Control Points */}
          <svg
            ref={svgRef}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full h-full cursor-crosshair"
            onClick={handleSvgClick}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <defs>
              <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Gradient Area under Curve */}
            {areaPathD && <path d={areaPathD} fill="url(#areaGradient)" />}

            {/* Main Cubic Bézier Smooth Spline */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="url(#curveGradient)"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="filter drop-shadow-[0_0_8px_rgba(6,182,212,0.7)]"
              />
            )}

            {/* Live Timeline Playhead Line & Instantaneous Speed Indicator */}
            {isWithinClip && (
              <g>
                <line
                  x1={normToSvgX(normalizedPlayheadU)}
                  y1="0"
                  x2={normToSvgX(normalizedPlayheadU)}
                  y2="100"
                  stroke="#22d3ee"
                  strokeWidth="1.6"
                  strokeDasharray="2,2"
                />
                <circle
                  cx={normToSvgX(normalizedPlayheadU)}
                  cy={speedToSvgY(currentSpeed)}
                  r="4"
                  fill="#ffffff"
                  stroke="#0891b2"
                  strokeWidth="2"
                  className="animate-pulse shadow-lg"
                />
              </g>
            )}

            {/* Bézier Tangent Handles for Selected Point */}
            {selectedIndex !== null && points[selectedIndex] && (
              <g>
                {/* Tangent Line & Handle for cpIn */}
                {selectedIndex > 0 && points[selectedIndex].cpIn && (
                  <g>
                    <line
                      x1={normToSvgX(points[selectedIndex].x)}
                      y1={speedToSvgY(points[selectedIndex].y)}
                      x2={normToSvgX(points[selectedIndex].cpIn!.x)}
                      y2={speedToSvgY(points[selectedIndex].cpIn!.y)}
                      stroke="#ec4899"
                      strokeWidth="1.2"
                      strokeDasharray="1.5,1.5"
                    />
                    <circle
                      cx={normToSvgX(points[selectedIndex].cpIn!.x)}
                      cy={speedToSvgY(points[selectedIndex].cpIn!.y)}
                      r="6"
                      fill="transparent"
                      className="cursor-pointer"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setDragTarget({ type: 'handle-in', index: selectedIndex });
                        (e.target as HTMLElement).setPointerCapture(e.pointerId);
                      }}
                    />
                    <circle
                      cx={normToSvgX(points[selectedIndex].cpIn!.x)}
                      cy={speedToSvgY(points[selectedIndex].cpIn!.y)}
                      r="3.2"
                      fill="#ec4899"
                      stroke="#ffffff"
                      strokeWidth="1"
                      className="cursor-pointer filter drop-shadow-[0_0_4px_rgba(236,72,153,0.8)]"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setDragTarget({ type: 'handle-in', index: selectedIndex });
                        (e.target as HTMLElement).setPointerCapture(e.pointerId);
                      }}
                    />
                  </g>
                )}

                {/* Tangent Line & Handle for cpOut */}
                {selectedIndex < points.length - 1 && points[selectedIndex].cpOut && (
                  <g>
                    <line
                      x1={normToSvgX(points[selectedIndex].x)}
                      y1={speedToSvgY(points[selectedIndex].y)}
                      x2={normToSvgX(points[selectedIndex].cpOut!.x)}
                      y2={speedToSvgY(points[selectedIndex].cpOut!.y)}
                      stroke="#a855f7"
                      strokeWidth="1.2"
                      strokeDasharray="1.5,1.5"
                    />
                    <circle
                      cx={normToSvgX(points[selectedIndex].cpOut!.x)}
                      cy={speedToSvgY(points[selectedIndex].cpOut!.y)}
                      r="6"
                      fill="transparent"
                      className="cursor-pointer"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setDragTarget({ type: 'handle-out', index: selectedIndex });
                        (e.target as HTMLElement).setPointerCapture(e.pointerId);
                      }}
                    />
                    <circle
                      cx={normToSvgX(points[selectedIndex].cpOut!.x)}
                      cy={speedToSvgY(points[selectedIndex].cpOut!.y)}
                      r="3.2"
                      fill="#a855f7"
                      stroke="#ffffff"
                      strokeWidth="1"
                      className="cursor-pointer filter drop-shadow-[0_0_4px_rgba(168,85,247,0.8)]"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setDragTarget({ type: 'handle-out', index: selectedIndex });
                        (e.target as HTMLElement).setPointerCapture(e.pointerId);
                      }}
                    />
                  </g>
                )}
              </g>
            )}

            {/* Interactive Main Control Points */}
            {points.map((pt, idx) => {
              const cx = normToSvgX(pt.x);
              const cy = speedToSvgY(pt.y);
              const isSelected = selectedIndex === idx;

              return (
                <g key={idx}>
                  {/* Invisible larger hit area for easy touch/mouse dragging */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r="8"
                    fill="transparent"
                    className="cursor-pointer"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setSelectedIndex(idx);
                      setDragTarget({ type: 'point', index: idx });
                      (e.target as HTMLElement).setPointerCapture(e.pointerId);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      if (idx > 0 && idx < points.length - 1) {
                        const next = points.filter((_, i) => i !== idx);
                        setSelectedIndex(null);
                        updatePoints(next, 'custom');
                      }
                    }}
                  />
                  {/* Selection Ring */}
                  {isSelected && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r="6.5"
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="1.2"
                      strokeDasharray="2,2"
                      className="animate-spin origin-center"
                    />
                  )}
                  {/* Main Visual Handle Dot */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? '4.8' : '3.8'}
                    fill={isSelected ? '#ffffff' : '#22d3ee'}
                    stroke="#0b1120"
                    strokeWidth="1.6"
                    className="cursor-pointer transition-all duration-75 hover:r-5 filter drop-shadow-[0_0_6px_rgba(34,211,238,0.9)]"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setSelectedIndex(idx);
                      setDragTarget({ type: 'point', index: idx });
                      (e.target as HTMLElement).setPointerCapture(e.pointerId);
                    }}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Action Controls & Keyframe Tools */}
        <div className="flex items-center justify-between pt-1 text-[11px]">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleAddPointAtPlayhead}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1a1a24] hover:bg-cyan-500/20 text-gray-300 hover:text-cyan-300 rounded border border-gray-700 transition"
              title="Add a speed keyframe at the current playhead"
            >
              <Plus className="w-3 h-3 text-cyan-400" />
              <span>Add Keyframe at Playhead</span>
            </button>

            {selectedIndex !== null && selectedIndex > 0 && selectedIndex < points.length - 1 && (
              <button
                onClick={() => {
                  const next = points.filter((_, i) => i !== selectedIndex);
                  setSelectedIndex(null);
                  updatePoints(next, 'custom');
                }}
                className="flex items-center gap-1 px-2 py-1 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded border border-red-800/50 transition"
                title="Delete selected keyframe"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            )}
          </div>

          {/* Quick Velocity Scalers */}
          <div className="flex items-center gap-1 bg-[#15151e] p-0.5 rounded border border-gray-800">
            <span className="text-[9.5px] text-gray-400 px-1 font-medium">Scale:</span>
            {[
              { label: '0.5x', factor: 0.5 },
              { label: '1.5x', factor: 1.5 },
              { label: '2.0x', factor: 2.0 },
            ].map((s) => (
              <button
                key={s.label}
                onClick={() => handleScaleCurve(s.factor)}
                className="px-1.5 py-0.5 text-[9.5px] font-mono text-gray-300 hover:text-cyan-300 hover:bg-cyan-950/40 rounded transition"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Selected Point Precision Inspector */}
      {selectedPoint && selectedIndex !== null && (
        <div className="bg-[#15151e] p-3 rounded-lg border border-cyan-800/30 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-cyan-300">
              <Circle className="w-3 h-3 text-cyan-400 fill-cyan-400" />
              <span>Keyframe Point #{selectedIndex + 1} of {points.length}</span>
            </div>

            {/* Handle Type Switcher */}
            <div className="flex items-center gap-1 bg-[#0e0e14] p-0.5 rounded border border-gray-800 text-[10px]">
              <button
                onClick={() => {
                  const updated = [...points];
                  updated[selectedIndex] = { ...updated[selectedIndex], handleType: 'smooth' };
                  updatePoints(updated, 'custom');
                }}
                className={`px-2 py-0.5 rounded font-medium transition ${
                  selectedPoint.handleType === 'smooth' || !selectedPoint.handleType
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Smooth Bézier
              </button>
              <button
                onClick={() => {
                  const updated = [...points];
                  updated[selectedIndex] = { ...updated[selectedIndex], handleType: 'linear' };
                  updatePoints(updated, 'custom');
                }}
                className={`px-2 py-0.5 rounded font-medium transition ${
                  selectedPoint.handleType === 'linear'
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Linear Step
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-gray-800/80">
            {/* Timeline Position (%) */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>Position</span>
                <span className="font-mono text-cyan-300 font-bold">
                  {(selectedPoint.x * 100).toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                disabled={selectedIndex === 0 || selectedIndex === points.length - 1}
                value={selectedPoint.x * 100}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) / 100;
                  const prevX = points[selectedIndex - 1]?.x ?? 0;
                  const nextX = points[selectedIndex + 1]?.x ?? 1;
                  const clamped = Math.max(prevX + 0.01, Math.min(nextX - 0.01, val));
                  const updated = [...points];
                  updated[selectedIndex] = { ...updated[selectedIndex], x: clamped };
                  updatePoints(updated, 'custom');
                }}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-40"
              />
            </div>

            {/* Velocity Multiplier (0.1x to 10.0x) */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>Speed Multiplier</span>
                <span className="font-mono text-cyan-300 font-bold">
                  {selectedPoint.y.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="10.0"
                step="0.05"
                value={selectedPoint.y}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  const updated = [...points];
                  updated[selectedIndex] = { ...updated[selectedIndex], y: val };
                  updatePoints(updated, 'custom');
                }}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>

          {/* Quick Speed Selector Buttons */}
          <div className="grid grid-cols-6 gap-1 pt-1">
            {[0.2, 0.5, 1.0, 2.0, 4.0, 8.0].map((spd) => (
              <button
                key={spd}
                onClick={() => {
                  const updated = [...points];
                  updated[selectedIndex] = { ...updated[selectedIndex], y: spd };
                  updatePoints(updated, 'custom');
                }}
                className={`py-1 rounded text-[10px] font-mono font-bold border transition ${
                  Math.abs(selectedPoint.y - spd) < 0.05
                    ? 'bg-cyan-500 text-black border-cyan-400'
                    : 'bg-[#1a1a24] text-gray-300 border-gray-700 hover:border-gray-600'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Metrics & Ramping Duration Stats */}
      <div className="bg-[#101017] p-2.5 rounded-lg border border-gray-800 flex items-center justify-between text-[10px] text-gray-400">
        <div>
          <span>Timeline Clip Length: </span>
          <strong className="text-white font-mono">{clipDuration.toFixed(1)}s</strong>
        </div>
        <div>
          <span>Source Consumed: </span>
          <strong className="text-cyan-300 font-mono">{sourceUsedSec.toFixed(1)}s</strong>
        </div>
        <div>
          <span>Avg Velocity: </span>
          <strong className="text-cyan-400 font-mono">
            {(sourceUsedSec / clipDuration).toFixed(2)}x
          </strong>
        </div>
      </div>

      {/* 6. Professional Audio & AI Slow-Mo Frame Interpolation Toggles */}
      <div className="bg-[#14141c] p-3 rounded-lg border border-[#232330] space-y-2.5">
        {/* Optical Flow Smooth Slow-Mo */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-200 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Optical Flow (Smooth Slow-Mo)</span>
            </div>
            <div className="text-[10px] text-gray-400">
              Hardware frame interpolation eliminates stutter in ultra slow sections (&lt; 0.5x)
            </div>
          </div>
          <button
            onClick={() =>
              onUpdateClip(clip.id, {
                speedRamp: {
                  ...(clip.speedRamp || { preset: 'custom', curve: [1, 1] }),
                  smoothSlowMo: !(clip.speedRamp?.smoothSlowMo ?? true),
                },
              })
            }
            className={`w-9 h-5 rounded-full p-0.5 transition-colors flex items-center ${
              clip.speedRamp?.smoothSlowMo ?? true
                ? 'bg-cyan-500 justify-end'
                : 'bg-gray-700 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* Pitch Correction */}
        <div className="flex items-center justify-between pt-2 border-t border-[#232330]">
          <div>
            <div className="text-xs text-gray-200 font-semibold flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Maintain Audio Pitch</span>
            </div>
            <div className="text-[10px] text-gray-400">
              Preserve natural voice frequency during fast acceleration and slow-downs
            </div>
          </div>
          <button
            onClick={() =>
              onUpdateClip(clip.id, {
                speedRamp: {
                  ...(clip.speedRamp || { preset: 'custom', curve: [1, 1] }),
                  maintainPitch: !(clip.speedRamp?.maintainPitch ?? true),
                },
              })
            }
            className={`w-9 h-5 rounded-full p-0.5 transition-colors flex items-center ${
              clip.speedRamp?.maintainPitch ?? true
                ? 'bg-cyan-500 justify-end'
                : 'bg-gray-700 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>
      </div>
    </div>
  );
};
