import React, { useState } from 'react';

interface LiveAnimationPreviewProps {
  type: 'video' | 'text' | 'transition';
  id: string;
  name?: string;
  icon?: string;
  isSelected?: boolean;
}

export const LiveAnimationPreview: React.FC<LiveAnimationPreviewProps> = ({
  type,
  id,
  name,
  icon,
  isSelected = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Embedded scoped styles for genuine CapCut motion keyframes
  return (
    <div
      className="relative flex flex-col items-center justify-center w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style>{`
        @keyframes cc-fade-in {
          0%, 15% { opacity: 0; transform: scale(0.95); }
          65%, 85% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.95); }
        }
        @keyframes cc-fade-out {
          0%, 15% { opacity: 1; transform: scale(1); }
          65%, 85% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes cc-zoom-in-1 {
          0%, 15% { transform: scale(0.35); opacity: 0.2; }
          65%, 85% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.35); opacity: 0.2; }
        }
        @keyframes cc-zoom-in-2 {
          0%, 10% { transform: scale(0.15); opacity: 0; }
          50% { transform: scale(1.12); opacity: 1; }
          65%, 85% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.15); opacity: 0; }
        }
        @keyframes cc-zoom-out {
          0%, 15% { transform: scale(1); opacity: 1; }
          65%, 85% { transform: scale(0.35); opacity: 0.2; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes cc-slide-right {
          0%, 15% { transform: translateX(-110%); opacity: 0.3; }
          60%, 85% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(-110%); opacity: 0.3; }
        }
        @keyframes cc-slide-left {
          0%, 15% { transform: translateX(110%); opacity: 0.3; }
          60%, 85% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(110%); opacity: 0.3; }
        }
        @keyframes cc-slide-up {
          0%, 15% { transform: translateY(110%); opacity: 0.3; }
          60%, 85% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(110%); opacity: 0.3; }
        }
        @keyframes cc-slide-down {
          0%, 15% { transform: translateY(-110%); opacity: 0.3; }
          60%, 85% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-110%); opacity: 0.3; }
        }
        @keyframes cc-spin-in {
          0%, 15% { transform: rotate(-240deg) scale(0.25); opacity: 0.2; }
          65%, 85% { transform: rotate(0deg) scale(1); opacity: 1; }
          100% { transform: rotate(-240deg) scale(0.25); opacity: 0.2; }
        }
        @keyframes cc-spin-out {
          0%, 15% { transform: rotate(0deg) scale(1); opacity: 1; }
          65%, 85% { transform: rotate(240deg) scale(0.25); opacity: 0.2; }
          100% { transform: rotate(0deg) scale(1); opacity: 1; }
        }
        @keyframes cc-bounce-in {
          0%, 10% { transform: scale(0.3); opacity: 0; }
          45% { transform: scale(1.22); opacity: 1; }
          65% { transform: scale(0.92); }
          75%, 88% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.3); opacity: 0; }
        }
        @keyframes cc-mini-zoom {
          0%, 100% { transform: scale(0.85); }
          50% { transform: scale(1.1); }
        }
        @keyframes cc-rock-vert {
          0%, 100% { transform: translateY(-5px); }
          50% { transform: translateY(5px); }
        }
        @keyframes cc-pendulum {
          0%, 100% { transform: rotate(-16deg); }
          50% { transform: rotate(16deg); }
        }
        @keyframes cc-flash-white {
          0%, 100% { opacity: 0.3; filter: brightness(1); }
          40%, 60% { opacity: 1; filter: brightness(2.4); }
        }
        @keyframes cc-wobble {
          0%, 100% { transform: rotate(0deg) translateX(0); }
          25% { transform: rotate(-8deg) translateX(-3px); }
          75% { transform: rotate(8deg) translateX(3px); }
        }
        @keyframes cc-typewriter-text {
          0%, 15% { width: 0ch; opacity: 0.5; }
          60%, 85% { width: 4ch; opacity: 1; }
          100% { width: 0ch; opacity: 0.5; }
        }
        @keyframes cc-wave-text {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-4px); }
          75% { transform: translateY(4px); }
        }
        @keyframes cc-glitch-jitter {
          0%, 100% { transform: translate(0); filter: none; }
          20% { transform: translate(-2px, 1px); filter: drop-shadow(-2px 0 red); }
          40% { transform: translate(2px, -1px); filter: drop-shadow(2px 0 cyan); }
          60% { transform: translate(-1px, -1px); filter: drop-shadow(-1px 0 yellow); }
        }
        @keyframes cc-trans-wipe {
          0%, 15% { clip-path: inset(0 100% 0 0); }
          65%, 85% { clip-path: inset(0 0 0 0); }
          100% { clip-path: inset(0 100% 0 0); }
        }
        @keyframes cc-trans-3d-flip {
          0%, 15% { transform: perspective(300px) rotateY(0deg); }
          60%, 85% { transform: perspective(300px) rotateY(180deg); }
          100% { transform: perspective(300px) rotateY(360deg); }
        }
      `}</style>

      {/* Mini Screen Container */}
      <div className="relative w-12 h-8 rounded-md bg-[#111116] border border-gray-800/80 overflow-hidden flex items-center justify-center shadow-inner group-hover:border-cyan-500/50">
        {/* Subtle grid background simulating video frame */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:6px_6px]" />

        {/* Video / Graphic Animation Preview */}
        {type === 'video' && (
          <div
            className="w-7 h-5 rounded bg-gradient-to-tr from-cyan-600 to-sky-400 border border-cyan-300/40 shadow-xs flex items-center justify-center text-[9px] font-bold text-white shadow-[0_0_8px_rgba(6,182,212,0.3)]"
            style={{
              animation: getAnimationRule(id),
            }}
          >
            {icon || '▶'}
          </div>
        )}

        {/* Text Animation Preview */}
        {type === 'text' && (
          <div className="flex items-center justify-center font-black tracking-wider text-cyan-300 text-[10px]">
            {id === 'typewriter' ? (
              <span
                className="overflow-hidden whitespace-nowrap inline-block font-mono border-r border-cyan-400"
                style={{ animation: 'cc-typewriter-text 2s steps(4) infinite' }}
              >
                TEXT
              </span>
            ) : id === 'wave' ? (
              <div className="flex gap-0.5">
                <span style={{ animation: 'cc-wave-text 1.2s ease-in-out infinite' }}>T</span>
                <span style={{ animation: 'cc-wave-text 1.2s ease-in-out infinite 0.15s' }}>E</span>
                <span style={{ animation: 'cc-wave-text 1.2s ease-in-out infinite 0.3s' }}>X</span>
                <span style={{ animation: 'cc-wave-text 1.2s ease-in-out infinite 0.45s' }}>T</span>
              </div>
            ) : id === 'glitch' ? (
              <span style={{ animation: 'cc-glitch-jitter 0.8s ease infinite' }}>
                TEXT
              </span>
            ) : (
              <span
                style={{
                  animation: getAnimationRule(id),
                }}
              >
                TEXT
              </span>
            )}
          </div>
        )}

        {/* Transition Preview */}
        {type === 'transition' && (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Background Clip A */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-800 flex items-center justify-center text-[8px] font-bold text-indigo-300">
              A
            </div>
            {/* Foreground Clip B with Transition */}
            <div
              className="absolute inset-0 bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-[8px] font-bold text-white shadow-md"
              style={{
                animation: getTransitionRule(id),
              }}
            >
              B
            </div>
          </div>
        )}

        {/* Live Active Dot */}
        {isSelected && (
          <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] animate-pulse" />
        )}
      </div>

      {/* Label */}
      {name && (
        <span
          className={`mt-1.5 text-[10px] font-medium truncate max-w-full text-center transition-colors ${
            isSelected ? 'text-cyan-300 font-semibold' : 'text-gray-400 group-hover:text-gray-200'
          }`}
        >
          {name}
        </span>
      )}
    </div>
  );
};

function getAnimationRule(id: string): string {
  switch (id) {
    case 'fade-in':
      return 'cc-fade-in 2s ease-in-out infinite';
    case 'fade-out':
      return 'cc-fade-out 2s ease-in-out infinite';
    case 'zoom-in-1':
      return 'cc-zoom-in-1 2s ease-out infinite';
    case 'zoom-in-2':
      return 'cc-zoom-in-2 2.2s cubic-bezier(0.34, 1.56, 0.64, 1) infinite';
    case 'zoom-out':
      return 'cc-zoom-out 2s ease-out infinite';
    case 'slide-right':
    case 'slide-out-right':
      return 'cc-slide-right 1.8s ease-in-out infinite';
    case 'slide-left':
    case 'slide-out-left':
      return 'cc-slide-left 1.8s ease-in-out infinite';
    case 'slide-up':
      return 'cc-slide-up 1.8s ease-in-out infinite';
    case 'slide-down':
      return 'cc-slide-down 1.8s ease-in-out infinite';
    case 'spin-in':
      return 'cc-spin-in 2.2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite';
    case 'spin-out':
      return 'cc-spin-out 2.2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite';
    case 'bounce-in':
      return 'cc-bounce-in 2.2s ease-in-out infinite';
    case 'mini-zoom':
      return 'cc-mini-zoom 1.5s ease-in-out infinite';
    case 'rock-vert':
      return 'cc-rock-vert 1.2s ease-in-out infinite';
    case 'pendulum':
      return 'cc-pendulum 1.4s ease-in-out infinite';
    case 'flash-white':
      return 'cc-flash-white 1.2s ease-in-out infinite';
    case 'wobble':
      return 'cc-wobble 1.0s ease-in-out infinite';
    default:
      return 'cc-mini-zoom 2s ease-in-out infinite';
  }
}

function getTransitionRule(id: string): string {
  if (id.includes('slide-left') || id.includes('push-up')) {
    return 'cc-slide-left 2s ease-in-out infinite';
  }
  if (id.includes('slide-right')) {
    return 'cc-slide-right 2s ease-in-out infinite';
  }
  if (id.includes('flip') || id.includes('3d')) {
    return 'cc-trans-3d-flip 2.5s ease-in-out infinite';
  }
  if (id.includes('flash') || id.includes('leak')) {
    return 'cc-flash-white 1.6s ease-in-out infinite';
  }
  return 'cc-trans-wipe 2.2s ease-in-out infinite';
}
