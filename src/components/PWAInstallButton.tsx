import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Monitor, Smartphone, X, CheckCircle2 } from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'compact'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    }
  };

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'full') {
      return (
        <button
          onClick={handleInstallClick}
          className={`flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 px-4 py-2.5 text-xs font-black text-black shadow-lg shadow-teal-500/20 transition cursor-pointer active:scale-95 ${className}`}
        >
          <Monitor className="w-4 h-4 text-black" />
          <span>Install Desktop App (PWA)</span>
        </button>
      );
    }

    return (
      <button
        onClick={handleInstallClick}
        title="Install CuteCut Pro as Desktop / Mobile App"
        className={`flex items-center gap-1.5 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 px-2.5 py-1 text-[11px] font-bold text-teal-300 transition cursor-pointer active:scale-95 ${className}`}
      >
        <Download className="w-3.5 h-3.5 text-teal-400" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-lg bg-[#1a1a24] hover:bg-[#252536] border border-gray-700 px-2.5 py-1 text-[11px] font-bold text-gray-300 transition cursor-pointer ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-[#161622] border border-gray-700 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center font-bold text-black text-sm">
                    CC
                  </div>
                  <h3 className="text-base font-bold text-white">Install on iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-gray-300 leading-relaxed bg-[#0d0d14] p-3.5 rounded-xl border border-gray-800">
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                  Tap the <strong>Share</strong> button in Safari's bottom toolbar.
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                  Scroll down and tap <strong>Add to Home Screen</strong>.
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                  Enjoy CuteCut Pro as a full-screen standalone application!
                </p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-black font-extrabold text-xs rounded-xl transition cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback banner for browsers where prompt isn't yet ready or installed
  return null;
};
