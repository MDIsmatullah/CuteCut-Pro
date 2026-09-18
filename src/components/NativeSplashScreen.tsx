import React, { useEffect, useState } from 'react';
import { Sparkles, Scissors, Zap, ShieldCheck } from 'lucide-react';

interface NativeSplashScreenProps {
  onComplete: () => void;
  platformName?: string;
}

export const NativeSplashScreen: React.FC<NativeSplashScreenProps> = ({
  onComplete,
  platformName = 'Desktop Studio Engine'
}) => {
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState('Initializing timeline core...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(48);
      setStatusText('Mounting GPU acceleration shaders...');
    }, 350);

    const t2 = setTimeout(() => {
      setProgress(85);
      setStatusText('Loading Quranic audio alignment database...');
    }, 750);

    const t3 = setTimeout(() => {
      setProgress(100);
      setStatusText('Studio Workspace Ready');
      setIsFadingOut(true);
    }, 1150);

    const t4 = setTimeout(() => {
      onComplete();
    }, 1450);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div
      onClick={onComplete}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a10] text-white select-none transition-opacity duration-300 cursor-pointer ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Radial Ambient Glow */}
      <div className="absolute w-[500px] h-[300px] bg-gradient-to-tr from-cyan-500/20 via-teal-500/10 to-indigo-500/15 blur-[100px] pointer-events-none rounded-full" />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6 text-center">
        {/* App Logo Emblem */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#161726] to-[#202238] border border-cyan-500/40 flex items-center justify-center shadow-2xl shadow-cyan-500/20">
            <Scissors className="w-10 h-10 text-cyan-400 stroke-[2.2]" />
          </div>
          <div className="absolute -bottom-2 -right-2 p-1.5 rounded-lg bg-amber-400 text-black shadow-md">
            <Zap className="w-3.5 h-3.5 fill-black" />
          </div>
        </div>

        {/* Brand Title */}
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-black tracking-wider text-white">CUTECUT</h1>
          <span className="text-xs bg-gradient-to-r from-amber-300 to-yellow-400 text-black font-extrabold px-2 py-0.5 rounded font-mono shadow-sm">
            PRO
          </span>
        </div>

        <p className="text-xs text-gray-400 mb-6 font-medium">
          Professional Multi-Track Video Editor
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-[#161624] border border-[#26263a] rounded-full h-1.5 mb-3 overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status & Platform Info */}
        <div className="flex items-center justify-between w-full text-[11px] font-mono text-gray-400 px-0.5 mb-4">
          <span className="truncate text-cyan-300/90">{statusText}</span>
          <span className="shrink-0 text-gray-500">{progress}%</span>
        </div>

        {/* Platform Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#131422] border border-[#25273d] text-[10px] font-mono text-gray-400">
          <ShieldCheck className="w-3 h-3 text-cyan-400" />
          <span>{platformName}</span>
          <span className="text-gray-600">•</span>
          <span className="text-teal-400 font-bold">v2.4.2</span>
        </div>
      </div>
    </div>
  );
};

export default NativeSplashScreen;
