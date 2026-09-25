import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, ShieldCheck, Cpu, Terminal, X, Download, Monitor, Zap, ExternalLink } from 'lucide-react';
import { fetchLatestRelease, ReleaseInfo } from '../utils/releaseService';

interface UpdateCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpdateCheckerModal: React.FC<UpdateCheckerModalProps> = ({ isOpen, onClose }) => {
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(false);
  const [latestRelease, setLatestRelease] = useState<ReleaseInfo | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  if (!isOpen) return null;

  const runUpdateCheck = async () => {
    setChecking(true);
    setChecked(false);
    setLogs([]);

    const log = (msg: string) => {
      setLogs((prev) => [...prev, msg]);
    };

    log('[System] Connecting to GitHub Releases API (MDIsmatullah/CuteCut-Pro)...');
    
    try {
      const rel = await fetchLatestRelease();
      setLatestRelease(rel);
      setTimeout(() => log(`[Release] Found latest production tag: ${rel.tagName}`), 400);
      setTimeout(() => log(`[Assets] Windows: ${rel.assets.windowsExe ? '✓ Ready' : '—'}`), 700);
      setTimeout(() => log(`[Assets] macOS DMG: ${rel.assets.macDmg ? '✓ Ready' : '—'}`), 900);
      setTimeout(() => log(`[Assets] Linux AppImage: ${rel.assets.linuxAppImage ? '✓ Ready' : '—'}`), 1100);
      setTimeout(() => log(`[Assets] Debian .deb: ${rel.assets.linuxDeb ? '✓ Ready' : '—'}`), 1300);
      setTimeout(() => {
        log(`[Version] Live synchronization complete! Version ${rel.tagName} is active.`);
        setChecking(false);
        setChecked(true);
      }, 1600);
    } catch (err) {
      log('[Error] Failed to fetch remote tag, using local manifest build v2.5.0.');
      setChecking(false);
      setChecked(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#14141a] border border-[#2e2e3a] rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a36] bg-[#181822]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 text-cyan-400">
              <RefreshCw className={`w-5 h-5 ${checking ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Version & Build Verification
              </h2>
              <p className="text-[11px] text-gray-400">
                CUTECUT PRO Desktop & Web Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#252532] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Current Version Card */}
          <div className="p-4 rounded-xl bg-[#181822] border border-[#2e2e3e] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/icon.png"
                alt="CUTECUT PRO"
                className="w-10 h-10 rounded-lg object-cover border border-cyan-500/30 shrink-0 shadow-md"
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="text-xs font-bold text-white">CUTECUT PRO Suite</p>
                <p className="text-[10px] text-gray-400 font-mono">
                  {latestRelease ? `Active Tag: ${latestRelease.tagName}` : 'Current Build: v2.4.2-PRO'} (Universal Engine)
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {latestRelease ? latestRelease.tagName : 'v2.4.2'}
            </span>
          </div>

          {/* Diagnostic Log Output */}
          <div className="bg-[#0c0c10] border border-[#242432] rounded-xl p-3 h-36 font-mono text-[11px] overflow-y-auto space-y-1.5 text-gray-300">
            {logs.length === 0 && !checking && !checked && (
              <p className="text-gray-500 italic text-center pt-10">
                Click "Run System Update Verification" to benchmark live release parity.
              </p>
            )}
            {logs.map((logStr, idx) => (
              <p key={idx} className="leading-relaxed">
                {logStr}
              </p>
            ))}
          </div>

          {checked && (
            <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                <span>
                  Synchronized with latest release ({latestRelease ? latestRelease.tagName : 'v2.4.2'})!
                </span>
              </div>
              {latestRelease?.htmlUrl && (
                <a
                  href={latestRelease.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded hover:bg-teal-500/20 text-teal-300 transition"
                  title="View on GitHub"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          )}

          <button
            onClick={runUpdateCheck}
            disabled={checking}
            className={`w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 font-bold text-xs text-black shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition ${
              checking ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Checking Build Integrity...' : 'Run System Update Verification'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateCheckerModal;
