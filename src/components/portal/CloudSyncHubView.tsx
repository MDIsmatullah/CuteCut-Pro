import React from 'react';
import {
  Cloud,
  Globe,
  Lock,
  Server,
  CheckCircle2,
  RotateCw,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Monitor,
  Laptop
} from 'lucide-react';
import { UserProfile } from '../AuthModal';
import { SavedProjectSession } from '../ProjectSaveModal';

export interface CloudSyncHubViewProps {
  theme: 'dark' | 'light';
  user: UserProfile | null;
  savedProjects: SavedProjectSession[];
  isSyncing: boolean;
  onSync: () => void;
  onOpenAuth: () => void;
  onDirectGoogleSignIn?: () => void;
  onOpenProject: (project: SavedProjectSession) => void;
  onOpenEditor: () => void;
}

export const CloudSyncHubView: React.FC<CloudSyncHubViewProps> = ({
  theme,
  user,
  savedProjects,
  isSyncing,
  onSync,
  onOpenAuth,
  onDirectGoogleSignIn,
  onOpenProject,
  onOpenEditor,
}) => {
  const isDark = theme === 'dark';

  return (
    <div className={`w-full space-y-8 pb-16 ${isDark ? 'text-gray-100' : 'text-slate-800'}`}>
      
      {/* Header Banner */}
      <div className={`p-6 sm:p-10 rounded-3xl border ${
        isDark 
          ? 'bg-gradient-to-br from-[#101026] via-[#141432] to-[#0d1c2c] border-[#222238] shadow-2xl' 
          : 'bg-gradient-to-br from-indigo-50 via-sky-50 to-emerald-50 border-slate-200 shadow-md'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-400 text-xs font-bold border border-cyan-500/30">
              <Cloud className="w-3.5 h-3.5" />
              <span>Firebase Firestore Cloud Infrastructure</span>
            </div>
            <h1 className={`text-2xl sm:text-4xl font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>
              Multi-Device Project Cloud Sync
            </h1>
            <p className={`text-xs sm:text-sm max-w-2xl ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
              Seamlessly synchronize your video timelines between your Windows PC, Mac, Linux desktop, Android phone, and Web browser in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg transition cursor-pointer"
            >
              <RotateCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Cloud Projects'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Account Status Card */}
      <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#12121e] border-[#222238]' : 'bg-white border-slate-200 shadow-md'}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-500/20">
          <div className="flex items-center gap-3.5">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-12 h-12 rounded-2xl border border-cyan-400 object-cover shadow-sm" />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-600 text-black font-extrabold text-lg flex items-center justify-center">
                {user?.displayName ? user.displayName.charAt(0) : 'G'}
              </div>
            )}
            <div>
              <div className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>{user?.displayName || 'Guest Creator (Local Storage Only)'}</span>
                {user && <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">CONNECTED</span>}
              </div>
              <div className="text-xs text-gray-400 font-mono mt-0.5">
                {user?.email || 'Sign in to enable automatic cloud backup'}
              </div>
            </div>
          </div>

          {!user && (
            <button
              onClick={() => {
                if (onDirectGoogleSignIn) onDirectGoogleSignIn();
                else onOpenAuth();
              }}
              className="px-6 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-black font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Globe className="w-4 h-4 text-blue-600" />
              <span>Sign in with Google</span>
            </button>
          )}
        </div>

        {/* Sync Ecosystem Flow Diagram */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className={`p-4 rounded-2xl border text-center ${isDark ? 'bg-[#161628] border-[#25253c]' : 'bg-slate-50 border-slate-200'}`}>
            <Monitor className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <div className="text-xs font-bold">1. Windows / Mac / Linux</div>
            <div className="text-[11px] text-gray-400 mt-1">Edit offline on your PC with full GPU power</div>
          </div>
          <div className={`p-4 rounded-2xl border text-center ${isDark ? 'bg-[#161628] border-[#25253c]' : 'bg-slate-50 border-slate-200'}`}>
            <Cloud className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <div className="text-xs font-bold">2. Firebase Firestore Hub</div>
            <div className="text-[11px] text-gray-400 mt-1">Encrypted draft sync in sub-seconds</div>
          </div>
          <div className={`p-4 rounded-2xl border text-center ${isDark ? 'bg-[#161628] border-[#25253c]' : 'bg-slate-50 border-slate-200'}`}>
            <Smartphone className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <div className="text-xs font-bold">3. Android & Web Studio</div>
            <div className="text-[11px] text-gray-400 mt-1">Resume anywhere without losing keyframes</div>
          </div>
        </div>
      </div>

      {/* Cloud & Local Drafts List */}
      <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#12121e] border-[#222238]' : 'bg-white border-slate-200 shadow-md'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 font-bold text-sm">
            <FolderOpen className="w-4 h-4 text-cyan-400" />
            <span>Active Saved Drafts ({savedProjects.length})</span>
          </div>
          <button
            onClick={onOpenEditor}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition cursor-pointer"
          >
            + Create New Draft
          </button>
        </div>

        {savedProjects.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            No saved projects yet. Start a new project to auto-sync!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => onOpenProject(p)}
                className={`p-4 rounded-2xl border transition hover:border-cyan-400 cursor-pointer flex flex-col justify-between ${
                  isDark ? 'bg-[#161628] border-[#242438]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-1">
                    <span>{p.data?.aspectRatio || '16:9'}</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Synced
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white truncate">{p.name}</div>
                  <div className="text-[10px] text-gray-400 mt-1">
                    {p.clipCount || 0} clips • {p.duration || 0}s duration
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-500/15 flex items-center justify-between text-[10px] text-cyan-400 font-bold">
                  <span>Open in Timeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
