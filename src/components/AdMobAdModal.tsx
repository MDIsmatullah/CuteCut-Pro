import React, { useEffect, useState } from 'react';
import { 
  X, ExternalLink, ShieldCheck, Sparkles, Volume2, 
  VolumeX, CheckCircle, Zap, Film, Award 
} from 'lucide-react';
import { AdMobService, InAppAdPayload } from '../utils/admobService';

export const AdMobAdModal: React.FC = () => {
  const [activeAd, setActiveAd] = useState<InAppAdPayload | null>(null);
  const [timeLeft, setTimeLeft] = useState(3);
  const [canSkip, setCanSkip] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const unsubscribe = AdMobService.subscribeInAppAd((ad) => {
      setActiveAd(ad);
      if (ad) {
        setTimeLeft(ad.countdownSeconds || 3);
        setCanSkip(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!activeAd) return;

    if (timeLeft <= 0) {
      setCanSkip(true);
      // Auto-dismiss for App Open and Post-Export ads after countdown finishes + 1s grace
      if (activeAd.type === 'app_open' || activeAd.type === 'export_post') {
        const autoTimer = setTimeout(() => {
          handleDismiss();
        }, 1200);
        return () => clearTimeout(autoTimer);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeAd, timeLeft]);

  if (!activeAd) return null;

  const handleDismiss = () => {
    if (activeAd.type === 'rewarded' && activeAd.onReward) {
      activeAd.onReward();
    }
    AdMobService.dismissCurrentInAppAd();
  };

  const getAdBadge = () => {
    switch (activeAd.type) {
      case 'app_open':
        return { label: 'APP OPEN AD', color: 'from-amber-400 to-orange-500' };
      case 'export_pre':
        return { label: 'EXPORT SPONSOR', color: 'from-cyan-400 to-blue-500' };
      case 'export_post':
        return { label: 'RENDER COMPLETE', color: 'from-emerald-400 to-teal-500' };
      case 'rewarded':
        return { label: 'REWARDED PRO AD', color: 'from-purple-400 to-pink-500' };
      default:
        return { label: 'SPONSORED AD', color: 'from-cyan-400 to-blue-500' };
    }
  };

  const badge = getAdBadge();

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg bg-[#111118] border border-[#2a2a3c] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#222232] bg-[#0c0c12]">
          <div className="flex items-center gap-2.5">
            {/* Google AdMob Emblem */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#1c1c28] border border-[#303046]">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] font-bold text-gray-200 tracking-wider">AdMob</span>
            </div>
            
            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded bg-gradient-to-r ${badge.color} text-black uppercase tracking-wider`}>
              {badge.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg bg-[#1c1c28] hover:bg-[#28283a] text-gray-400 hover:text-white transition cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {canSkip ? (
              <button
                type="button"
                onClick={handleDismiss}
                className="px-3 py-1 bg-[#00e5ff] hover:bg-[#33ebff] active:scale-95 text-black text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1 shadow-md shadow-cyan-500/20"
              >
                <span>Continue</span>
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            ) : (
              <div className="px-2.5 py-1 bg-[#1a1a26] border border-[#2c2c40] rounded-lg text-gray-400 text-[11px] font-mono flex items-center gap-1.5">
                <span>Skip in</span>
                <span className="text-cyan-400 font-bold text-xs">{timeLeft}s</span>
              </div>
            )}
          </div>
        </div>

        {/* Ad Media Creative Body */}
        <div className="relative p-6 bg-gradient-to-b from-[#14141e] to-[#0d0d14] flex flex-col items-center text-center">
          
          {/* Visual Creative Banner / Graphic */}
          <div className="relative w-full h-44 rounded-xl bg-gradient-to-br from-[#1a1b2d] via-[#151624] to-[#0f101a] border border-[#26283d] flex flex-col items-center justify-center p-4 overflow-hidden shadow-inner mb-5">
            {/* Ambient Background Glow */}
            <div className="absolute w-48 h-48 bg-gradient-to-tr from-cyan-500/15 via-teal-500/10 to-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

            {activeAd.type === 'rewarded' ? (
              <Award className="w-14 h-14 text-amber-400 mb-2 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] animate-bounce" />
            ) : activeAd.type === 'export_pre' ? (
              <Film className="w-14 h-14 text-cyan-400 mb-2 drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]" />
            ) : (
              <Zap className="w-14 h-14 text-teal-400 mb-2 drop-shadow-[0_0_15px_rgba(45,212,191,0.4)]" />
            )}

            <h4 className="text-base font-bold text-white tracking-wide">
              CuteCut Pro Studio Ultra HD
            </h4>
            <p className="text-xs text-gray-400 max-w-xs mt-1">
              Multi-Track Timeline • 4K 60FPS Video Export • AI Quran Subtitles • GPU Acceleration
            </p>

            {/* AdMob Publisher Verification Badge */}
            <div className="mt-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 border border-gray-700/60 text-[10px] font-mono text-gray-300">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Google Verified Publisher: {activeAd.publisherId}</span>
            </div>
          </div>

          {/* Ad Title & Description */}
          <h3 className="text-lg font-bold text-white mb-1">
            {activeAd.title}
          </h3>
          <p className="text-xs text-gray-300 max-w-sm mb-4">
            {activeAd.subtitle}
          </p>

          {/* Action Button */}
          <div className="w-full flex items-center gap-3">
            <button
              type="button"
              onClick={handleDismiss}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                canSkip
                  ? 'bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-black shadow-cyan-500/25'
                  : 'bg-[#222230] text-gray-400 hover:bg-[#2c2c3e] border border-[#34344c]'
              }`}
            >
              {canSkip ? (
                <>
                  <span>{activeAd.type === 'export_pre' ? 'Start Video Export Now' : 'Continue to CuteCut Pro'}</span>
                  <Sparkles className="w-4 h-4 fill-black" />
                </>
              ) : (
                <>
                  <span>Please wait {timeLeft}s to continue...</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Meta & TAG Verification details */}
        <div className="px-5 py-2.5 bg-[#0a0a0f] border-t border-[#1e1e2c] flex items-center justify-between text-[10px] text-gray-500 font-mono">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-gray-400">TAG ID: f08c47fec0942fa0</span>
            <span>•</span>
            <span className="truncate">Unit: {activeAd.adUnitId}</span>
          </div>
          <a
            href="/app-ads.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline flex items-center gap-1 shrink-0 ml-2"
          >
            <span>app-ads.txt</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>

      </div>
    </div>
  );
};

export default AdMobAdModal;
