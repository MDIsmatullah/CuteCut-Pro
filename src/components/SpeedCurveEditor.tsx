import React, { useRef, useState, useCallback, useMemo } from 'react';
import {
  Activity,
  RotateCcw,
  Sparkles,
  Zap,
  Plus,
  Trash2,
  Sliders,
  Volume2,
  Eye,
  Check,
} from 'lucide-react';
import { Clip } from '../types';
import {
  SpeedRampPoint,
  SPEED_RAMP_PRESETS,
  getClipRampPoints,
  sampleSpeedAtNormalizedPosition,
  getClipEffectiveSpeedAtTime,
  getClipTotalSourceDuration,
} from '../utils/speedRampUtils';

interface SpeedCurveEditorProps {
  clip: Clip;
  onUpdateClip: (clipId: string, updates: Partial<Clip>) => void;
  currentTime?: number;
  onSeek?: (time: number) => void;
}

const MIN_SPEED = 0.1;
const MAX_SPEED = 8.0;

export const SpeedCurveEditor: React.FC<SpeedCurveEditorProps> = ({
  clip,
  onUpdateClip,
  currentTime,
  onSeek,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [activePointIdx, setActivePointIdx] = useState<number | null>(null);
  const isDraggingRef = useRef(false);

  // Current clip offset
  const clipStart = clip.start || 0;
  const clipDuration = Math.max(0.01, clip.duration || 1.0);
  const isWithinClip =
    currentTime !== undefined &&
    currentTime >= clipStart &&
    currentTime <= clipStart + clipDuration;
  const elapsedInClip = isWithinClip && currentTime !== undefined ? currentTime - clipStart : 0;
  const normalizedPlayheadU = Math.max(0, Math.min(1, elapsedInClip / clipDuration));

  // Current ramp points
  const points = useMemo(() => {
    const raw = getClipRampPoints(clip);
    if (raw.length >= 2) return raw;
    return SPEED_RAMP_PRESETS.find((p) => p.id === 'none')?.points || [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ];
  }, [clip.speedRamp]);

  // Current effective speed at playhead
  const currentSpeed = useMemo(() => {
    return sampleSpeedAtNormalizedPosition(points, normalizedPlayheadU);
  }, [points, normalizedPlayheadU]);

  // Current preset id
  const currentPresetId = clip.speedRamp?.preset || (clip.speedRamp?.enabled ? 'custom' : 'none');

  // Convert speed value (y) to SVG coordinate Y (0 top to 100 bottom)
  const speedToSvgY = useCallback((speed: number) => {
    // Non-linear / logarithmic scale for better precision in 0.1x to 2.0x range
    const clamped = Math.max(MIN_SPEED, Math.min(MAX_SPEED, speed));
    const normalized = (clamped - MIN_SPEED) / (MAX_SPEED - MIN_SPEED);
    return 95 - normalized * 85;
  }, []);

  // Convert SVG coordinate Y to speed value (0.1 to 8.0)
  const svgYToSpeed = useCallback((svgY: number) => {
    const normalized = (95 - svgY) / 85;
    const clampedNorm = Math.max(0, Math.min(1, normalized));
    const speed = MIN_SPEED + clampedNorm * (MAX_SPEED - MIN_SPEED);
    return Math.round(speed * 10) / 10;
  }, []);

  // SVG coordinate X to normalized timeline position (0 to 1)
  const svgXToNorm = useCallback((svgX: number) => {
    return Math.max(0, Math.min(1, (svgX - 5) / 90));
  }, []);

  const normToSvgX = useCallback((norm: number) => {
    return 5 + norm * 90;
  }, []);

  // Update points helper
  const updatePoints = (newPoints: SpeedRampPoint[], preset: any = 'custom') => {
    const sorted = [...newPoints].sort((a, b) => a.x - b.x);
    // Pin first point to x=0 and last point to x=1
    if (sorted.length >= 2) {
      sorted[0] = { ...sorted[0], x: 0 };
      sorted[sorted.length - 1] = { ...sorted[sorted.length - 1], x: 1 };
    }
    const curve = sorted.map((p) => p.y);
    onUpdateClip(clip.id, {
      speedRamp: {
        enabled: true,
        preset,
        points: sorted,
        curve,
        smoothSlowMo: clip.speedRamp?.smoothSlowMo ?? true,
        maintainPitch: clip.speedRamp?.maintainPitch ?? true,
      },
      playbackRate: sorted[Math.floor(sorted.length / 2)]?.y || 1.0,
    });
  };

  // Mouse / Touch handlers for dragging curve points
  const handlePointerDown = (idx: number, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActivePointIdx(idx);
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || activePointIdx === null || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * 100;
    const relY = ((e.clientY - rect.top) / rect.height) * 100;

    const newSpeed = svgYToSpeed(relY);
    const newPoints = [...points];

    // First and last points cannot move horizontally
    if (activePointIdx === 0) {
      newPoints[0] = { x: 0, y: newSpeed };
    } else if (activePointIdx === points.length - 1) {
      newPoints[points.length - 1] = { x: 1, y: newSpeed };
    } else {
      const newX = svgXToNorm(relX);
      // Keep clamped between neighbors
      const prevX = points[activePointIdx - 1].x + 0.03;
      const nextX = points[activePointIdx + 1].x - 0.03;
      newPoints[activePointIdx] = {
        x: Math.max(prevX, Math.min(nextX, newX)),
        y: newSpeed,
      };
    }

    updatePoints(newPoints, 'custom');
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Click on SVG canvas to add a new point
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || isDraggingRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * 100;
    const relY = ((e.clientY - rect.top) / rect.height) * 100;

    const normX = svgXToNorm(relX);
    const speed = svgYToSpeed(relY);

    // If too close to existing point, don't add
    const existsClose = points.some((p) => Math.abs(p.x - normX) < 0.05);
    if (existsClose) return;

    const newPoints = [...points, { x: normX, y: speed }].sort((a, b) => a.x - b.x);
    updatePoints(newPoints, 'custom');
  };

  // Add point at current playhead
  const handleAddPointAtPlayhead = () => {
    const existsClose = points.some((p) => Math.abs(p.x - normalizedPlayheadU) < 0.04);
    if (existsClose) return;
    const speedAtU = sampleSpeedAtNormalizedPosition(points, normalizedPlayheadU);
    const newPoints = [...points, { x: normalizedPlayheadU, y: speedAtU }].sort(
      (a, b) => a.x - b.x
    );
    updatePoints(newPoints, 'custom');
  };

  // Delete active point
  const handleDeleteActivePoint = (idx: number) => {
    if (idx === 0 || idx === points.length - 1 || points.length <= 2) return;
    const newPoints = points.filter((_, i) => i !== idx);
    setActivePointIdx(null);
    updatePoints(newPoints, 'custom');
  };

  // Select Preset
  const handleSelectPreset = (presetDef: typeof SPEED_RAMP_PRESETS[0]) => {
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
      return;
    }

    onUpdateClip(clip.id, {
      speedRamp: {
        enabled: true,
        preset: presetDef.id,
        points: presetDef.points,
        curve: presetDef.curve,
        smoothSlowMo: clip.speedRamp?.smoothSlowMo ?? true,
        maintainPitch: clip.speedRamp?.maintainPitch ?? true,
      },
      playbackRate: presetDef.curve[Math.floor(presetDef.curve.length / 2)] || 1.0,
    });
  };

  // Build SVG path string with smooth bezier curves
  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    const coords = points.map((p) => ({
      x: normToSvgX(p.x),
      y: speedToSvgY(p.y),
    }));

    if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;

    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? 0 : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2 >= coords.length ? coords.length - 1 : i + 2];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }, [points, normToSvgX, speedToSvgY]);

  // Area fill path
  const areaPathD = useMemo(() => {
    if (!pathD) return '';
    return `${pathD} L ${normToSvgX(1)} 95 L ${normToSvgX(0)} 95 Z`;
  }, [pathD, normToSvgX]);

  const sourceUsedSec = useMemo(() => getClipTotalSourceDuration(clip), [clip]);

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-1 border-b border-[#262633]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Bézier Speed Ramping</span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">
                PRO
              </span>
            </div>
            <div className="text-[10px] text-gray-400">
              Smooth dynamic fast-slow-fast velocity curves
            </div>
          </div>
        </div>

        {/* Live Speed Badge */}
        <div className="flex items-center gap-1 bg-[#121217] px-2.5 py-1 rounded-md border border-cyan-500/40">
          <span className="text-[10px] text-gray-400">Velocity:</span>
          <span className="text-xs font-mono font-extrabold text-cyan-400">
            {currentSpeed.toFixed(2)}x
          </span>
        </div>
      </div>

      {/* Preset Cards */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-gray-300 font-medium">
          <span>CapCut Style Velocity Presets</span>
          <button
            onClick={() => handleSelectPreset(SPEED_RAMP_PRESETS[0])}
            className="text-[10px] text-gray-400 hover:text-cyan-400 transition flex items-center gap-1"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset to 1.0x</span>
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {SPEED_RAMP_PRESETS.map((preset) => {
            const isSelected = currentPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-2 rounded border text-left transition flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                    : 'bg-[#15151d] border-gray-800 text-gray-300 hover:border-gray-700 hover:bg-[#1a1a24]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] truncate">{preset.name}</span>
                  {isSelected && <Check className="w-3 h-3 text-cyan-400" />}
                </div>
                <span className="text-[9px] text-gray-400 line-clamp-1 mt-0.5">
                  {preset.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Speed Curve Canvas */}
      <div className="bg-[#121218] p-3 rounded-lg border border-[#272738] space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-gray-300 font-semibold flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive Curve Graph</span>
          </span>
          <span className="text-[10px] text-gray-400">
            Click to add point • Drag to shape curve
          </span>
        </div>

        {/* SVG Curve Container */}
        <div className="relative w-full h-44 bg-[#0a0a0f] rounded-lg border border-gray-800 overflow-hidden select-none">
          {/* Background Speed Grid Lines & Labels */}
          <div className="absolute inset-0 pointer-events-none">
            {[8.0, 5.0, 2.0, 1.0, 0.5, 0.2].map((speedVal) => {
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
                        ? 'border-cyan-500/40 border-dashed'
                        : 'border-gray-800/60'
                    }`}
                  />
                  <span
                    className={`absolute right-2 -top-2.5 font-mono text-[9px] px-1 rounded ${
                      isBaseline ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-gray-400'
                    }`}
                  >
                    {speedVal.toFixed(1)}x
                  </span>
                </div>
              );
            })}
          </div>

          {/* SVG Elements */}
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
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Gradient Area under Curve */}
            {areaPathD && (
              <path d={areaPathD} fill="url(#areaGradient)" />
            )}

            {/* Main Smooth Spline */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="url(#curveGradient)"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="filter drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]"
              />
            )}

            {/* Live Playhead Line */}
            {isWithinClip && (
              <g>
                <line
                  x1={normToSvgX(normalizedPlayheadU)}
                  y1="0"
                  x2={normToSvgX(normalizedPlayheadU)}
                  y2="100"
                  stroke="#22d3ee"
                  strokeWidth="1.5"
                  strokeDasharray="2,2"
                />
                <circle
                  cx={normToSvgX(normalizedPlayheadU)}
                  cy={speedToSvgY(currentSpeed)}
                  r="3.5"
                  fill="#ffffff"
                  stroke="#0891b2"
                  strokeWidth="1.5"
                  className="animate-pulse"
                />
              </g>
            )}

            {/* Interactive Draggable Points */}
            {points.map((pt, idx) => {
              const cx = normToSvgX(pt.x);
              const cy = speedToSvgY(pt.y);
              const isActive = activePointIdx === idx;
              return (
                <g key={idx}>
                  {/* Invisible larger hit area for easy touch/mouse dragging */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r="8"
                    fill="transparent"
                    className="cursor-pointer"
                    onPointerDown={(e) => handlePointerDown(idx, e)}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      handleDeleteActivePoint(idx);
                    }}
                  />
                  {/* Visual Point */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isActive ? '4.5' : '3.8'}
                    fill={isActive ? '#ffffff' : '#22d3ee'}
                    stroke="#0b1120"
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-75 hover:r-5 filter drop-shadow-[0_0_4px_rgba(34,211,238,0.8)]"
                    onPointerDown={(e) => handlePointerDown(idx, e)}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Action Controls underneath graph */}
        <div className="flex items-center justify-between pt-1 text-[11px]">
          <button
            onClick={handleAddPointAtPlayhead}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1a1a24] hover:bg-cyan-500/20 text-gray-300 hover:text-cyan-300 rounded border border-gray-700 transition"
          >
            <Plus className="w-3 h-3 text-cyan-400" />
            <span>Add Point at Playhead</span>
          </button>

          {activePointIdx !== null && activePointIdx > 0 && activePointIdx < points.length - 1 && (
            <button
              onClick={() => handleDeleteActivePoint(activePointIdx)}
              className="flex items-center gap-1 px-2.5 py-1 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded border border-red-800/50 transition"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete Point</span>
            </button>
          )}

          <div className="flex items-center gap-3 text-gray-400 text-[10px]">
            <span>
              Timeline Duration:{' '}
              <strong className="text-gray-200 font-mono">{clipDuration.toFixed(1)}s</strong>
            </span>
            <span>
              Source Media Used:{' '}
              <strong className="text-cyan-300 font-mono">{sourceUsedSec.toFixed(1)}s</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Pro Audio & Frame Toggles */}
      <div className="bg-[#14141c] p-3 rounded-lg border border-[#232330] space-y-2.5">
        {/* Optical Flow Slow-Mo */}
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
