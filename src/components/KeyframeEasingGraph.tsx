import React, { useState, useEffect } from 'react';
import { KeyframeEasing } from '../types';
import { applyKeyframeEasing } from '../utils/editorUtils';
import { Activity, Play } from 'lucide-react';

interface KeyframeEasingGraphProps {
  currentEasing: KeyframeEasing;
  onChangeEasing: (easing: KeyframeEasing) => void;
}

export const KeyframeEasingGraph: React.FC<KeyframeEasingGraphProps> = ({
  currentEasing,
  onChangeEasing,
}) => {
  const [animProgress, setAnimProgress] = useState(0);

  // Animate a preview dot along the curve
  useEffect(() => {
    let frameId: number;
    let startTime = performance.now();

    const loop = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const cycle = (elapsed % 1.8) / 1.5; // 1.5s motion + 0.3s pause
      setAnimProgress(Math.min(1, Math.max(0, cycle)));
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const EASING_OPTIONS: Array<{
    id: KeyframeEasing;
    name: string;
    description: string;
    icon: string;
  }> = [
    { id: 'linear', name: 'Linear', description: 'Constant velocity', icon: '⎯' },
    { id: 'ease-in', name: 'Ease In', description: 'Slow start, swift exit', icon: '⤴' },
    { id: 'ease-out', name: 'Ease Out', description: 'Fast start, soft landing', icon: '⤵' },
    { id: 'ease-in-out', name: 'Ease In-Out', description: 'Cinematic smooth S-curve', icon: '∿' },
    { id: 'bounce', name: 'Bounce', description: 'Dynamic bounce settle', icon: '⚡' },
    { id: 'elastic', name: 'Elastic', description: 'Spring overshoot oscillation', icon: '〰' },
  ];

  // Generate SVG path for the curve
  const graphWidth = 240;
  const graphHeight = 80;
  const padding = 10;
  const innerW = graphWidth - padding * 2;
  const innerH = graphHeight - padding * 2;

  const points: string[] = [];
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const rawT = i / steps;
    const easedVal = applyKeyframeEasing(rawT, currentEasing);
    // SVG Y is inverted (0 at top, height at bottom)
    const x = padding + rawT * innerW;
    const y = padding + innerH - easedVal * innerH;
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const pathData = `M ${points.join(' L ')}`;

  // Animated Dot Position
  const currentEasedT = applyKeyframeEasing(animProgress, currentEasing);
  const dotX = padding + animProgress * innerW;
  const dotY = padding + innerH - currentEasedT * innerH;

  return (
    <div className="bg-[#14141a] p-3 rounded-xl border border-purple-900/40 space-y-3">
      <div className="flex items-center justify-between border-b border-gray-800 pb-1.5">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[11px] font-bold text-gray-200 uppercase tracking-wider">
            Keyframe Easing Graph
          </span>
        </div>
        <span className="text-[10px] font-mono text-purple-300 font-bold bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
          {currentEasing.toUpperCase()}
        </span>
      </div>

      {/* SVG Interactive Curve Graph Visualizer */}
      <div className="relative bg-[#0a0a0f] rounded-lg border border-purple-950 p-2 overflow-hidden flex flex-col items-center">
        <svg
          viewBox={`0 0 ${graphWidth} ${graphHeight}`}
          className="w-full h-20 select-none overflow-visible"
        >
          <defs>
            <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={padding}
            y1={padding + innerH}
            x2={padding + innerW}
            y2={padding + innerH}
            stroke="#262633"
            strokeWidth="1"
          />
          <line
            x1={padding}
            y1={padding}
            x2={padding + innerW}
            y2={padding}
            stroke="#262633"
            strokeDasharray="2,2"
            strokeWidth="1"
          />
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={padding + innerH}
            stroke="#262633"
            strokeWidth="1"
          />
          <line
            x1={padding + innerW}
            y1={padding}
            x2={padding + innerW}
            y2={padding + innerH}
            stroke="#262633"
            strokeWidth="1"
          />

          {/* Shaded Area */}
          <path
            d={`${pathData} L ${padding + innerW},${padding + innerH} L ${padding},${padding + innerH} Z`}
            fill="url(#areaGradient)"
          />

          {/* Plotted Bezier / Easing Curve */}
          <path
            d={pathData}
            fill="none"
            stroke="url(#curveGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Animated Motion Puck */}
          <circle
            cx={dotX}
            cy={dotY}
            r="4.5"
            fill="#22d3ee"
            stroke="#ffffff"
            strokeWidth="1.5"
            className="filter drop-shadow-[0_0_6px_#06b6d4]"
          />
        </svg>

        {/* Dynamic Motion Preview Pill */}
        <div className="w-full flex justify-between items-center text-[9px] text-gray-500 font-mono mt-1 pt-1 border-t border-gray-900">
          <span className="flex items-center gap-1 text-gray-400">
            <Play className="w-2.5 h-2.5 text-cyan-400 fill-cyan-400" />
            <span>Progress: {(animProgress * 100).toFixed(0)}%</span>
          </span>
          <span className="text-cyan-300 font-bold">
            Output: {(currentEasedT * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Preset Curve Selection Pills */}
      <div className="grid grid-cols-3 gap-1.5">
        {EASING_OPTIONS.map((opt) => {
          const isSelected = currentEasing === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onChangeEasing(opt.id)}
              className={`p-1.5 rounded-lg border text-left transition flex flex-col justify-between ${
                isSelected
                  ? 'border-purple-400 bg-purple-950/60 text-purple-200 shadow-xs'
                  : 'border-gray-800 bg-[#101016] text-gray-400 hover:border-gray-700 hover:text-gray-200'
              }`}
              title={opt.description}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold truncate">{opt.name}</span>
                <span className="text-xs font-mono">{opt.icon}</span>
              </div>
              <span className="text-[8px] text-gray-500 truncate mt-0.5">{opt.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
