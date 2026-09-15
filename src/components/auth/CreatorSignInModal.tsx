import React, { useState, useEffect } from 'react';
import { User, Shield, Lock, Mail, Sparkles, CheckCircle2, LogOut, X, Crown, Loader2, Database, HardDrive } from 'lucide-react';
import { GoogleDriveService, GoogleDriveUser } from '../../services/googleDriveService';
import { UserProfile } from '../AuthModal';

interface CreatorSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  initialErrorMessage?: string;
}

export const CreatorSignInModal: React.FC<CreatorSignInModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogin,
  onLogout,
  initialErrorMessage = '',
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [statusMsg, setStatusMsg] = useState(initialErrorMessage);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const driveService = GoogleDriveService.getInstance();
  const [driveConnected, setDriveConnected] = useState(driveService.isConnected());
  const [driveUser, setDriveUser] = useState<GoogleDriveUser | null>(driveService.getConnectedUser());

  useEffect(() => {
    if (initialErrorMessage) {
      setStatusMsg(initialErrorMessage);
    }
  }, [initialErrorMessage]);

  useEffect(() => {
    const handleStateChange = (connected: boolean) => {
      setDriveConnected(prev => prev === connected ? prev : connected);
      const connectedUser = driveService.getConnectedUser();
      setDriveUser(prev => {
        if (!prev && !connectedUser) return null;
        if (prev && connectedUser && prev.email === connectedUser.email && prev.name === connectedUser.name && prev.picture === connectedUser.picture) {
          return prev;
        }
        return connectedUser;
      });

      // Automatically sign into the application workspace if Google Drive connects successfully
      if (connected && connectedUser && !user) {
        onLogin({
          name: connectedUser.name,
          email: connectedUser.email,
          tier: 'PRO',
          avatar: connectedUser.picture,
          uid: `gdrive_${connectedUser.email.toLowerCase().replace(/[^a-z0-9]/gi, '_')}`
        });
      }
    };

    driveService.registerStateChange(handleStateChange);
    return () => {
      driveService.unregisterStateChange(handleStateChange);
    };
  }, [user, onLogin]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatusMsg('Please enter a valid email address.');
      return;
    }

    const emailKey = email.toLowerCase().trim().replace(/[^a-z0-9]/gi, '_');
    const deterministicUid = `usr_${emailKey}`;

    const newUser: UserProfile = {
      name: name || email.split('@')[0] || 'CuteCut Creator',
      email: email.trim(),
      tier: 'PRO',
      uid: deterministicUid
    };

    onLogin(newUser);
    setStatusMsg('');
    onClose();
  };

  const handleConnectGoogleDrive = async () => {
    try {
      setIsGoogleLoading(true);
      setStatusMsg('');
      const success = await driveService.connect();
      if (!success) {
        setStatusMsg('Google Connection was cancelled or failed. Please check browser popups.');
      }
    } catch (err: any) {
      console.error('[Google Drive Auth Error]', err);
      setStatusMsg('Failed to initialize Google Auth: ' + err.message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleDisconnectDrive = async () => {
    await driveService.disconnect();
    onLogout();
  };

  const handleDemoProLogin = () => {
    const demoUser: UserProfile = {
      name: 'Guldasta Islam (Pro Creator)',
      email: 'guldasta.pro@cutecut.io',
      tier: 'ENTERPRISE',
      uid: 'demo-pro-user'
    };
    onLogin(demoUser);
    onClose();
  };

  const formatBytes = (bytes?: number) => {
    if (bytes === undefined || bytes === 0) return '0 GB';
    const gb = bytes / (1024 * 1024 * 1024);
    return gb.toFixed(2) + ' GB';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn" id="auth-modal-overlay">
      <div className="relative w-full max-w-md bg-[#121218] border border-[#2e2e3a] rounded-2xl shadow-2xl overflow-hidden" id="auth-modal-card">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a36] bg-[#161622]" id="auth-modal-header">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 text-cyan-400">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                {user ? 'Account Settings & Storage' : isSignUp ? 'Create CuteCut Account' : 'Creator Workspace'}
              </h2>
              <p className="text-[10px] text-gray-400">
                {user ? 'Pro Creator Licensing Active' : 'Connect Personal Storage & Syncing'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#252532] transition cursor-pointer"
            id="auth-modal-close-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {/* Status Alert Messages */}
          {statusMsg && (
            <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium" id="auth-status-alert">
              {statusMsg}
            </div>
          )}

          {/* Connected View */}
          {driveConnected && driveUser ? (
            <div className="space-y-5" id="auth-drive-connected-section">
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/30 to-[#181824] border border-cyan-500/20 flex items-center gap-3.5">
                {driveUser.picture ? (
                  <img src={driveUser.picture} alt={driveUser.name} className="w-11 h-11 rounded-full border border-cyan-400/30" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-cyan-400 to-teal-400 flex items-center justify-center font-black text-black text-base shadow-md">
                    {driveUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-white text-xs truncate">{driveUser.name}</h3>
                    <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-cyan-400 text-black font-mono">
                      PRO
                    </span>
                  </div>
                  <p className="text-[10px] text-cyan-400 truncate mt-0.5">Connected Storage: {driveUser.email} (Drive Active)</p>
                </div>
              </div>

              {/* Storage Quota Graph */}
              {driveUser.quotaLimit !== undefined && driveUser.quotaUsed !== undefined && driveUser.quotaLimit > 0 && (
                <div className="p-3.5 rounded-xl bg-[#171722] border border-[#2a2a38] space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <div className="flex items-center gap-1 text-gray-400">
                      <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Google Drive Quota</span>
                    </div>
                    <span className="text-gray-300 font-mono">
                      {formatBytes(driveUser.quotaUsed)} / {formatBytes(driveUser.quotaLimit)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full"
                      style={{ width: `${Math.min(100, (driveUser.quotaUsed / driveUser.quotaLimit) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-gray-400 text-right">
                    {((driveUser.quotaUsed / driveUser.quotaLimit) * 100).toFixed(1)}% Personal Storage Used
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-gray-300 tracking-wider uppercase">Cloud Sync Active:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 text-cyan-300 p-2 rounded-lg bg-[#14141d] border border-cyan-500/10">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Auto Config Sync</span>
                  </div>
                  <div className="flex items-center gap-2 text-cyan-300 p-2 rounded-lg bg-[#14141d] border border-cyan-500/10">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>4K Video Drive Backups</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDisconnectDrive}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition cursor-pointer"
                id="auth-disconnect-btn"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect Google Drive Storage</span>
              </button>
            </div>
          ) : user ? (
            /* Logged in through email/other but no Google Drive connected yet */
            <div className="space-y-4" id="auth-email-logged-in-section">
              <div className="p-4 rounded-xl bg-[#181824] border border-[#2d2d3c] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center font-black text-cyan-400 text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs">{user.name}</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">{user.email}</p>
                </div>
              </div>

              <div className="border border-[#2a2a36] bg-gradient-to-b from-[#181824] to-[#121218] p-4 rounded-xl space-y-3">
                <h4 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Connect Cloud Storage</span>
                </h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Backup your multi-track timelines and directly upload 4K exported videos to your personal Google Drive by linking your Google account.
                </p>
                
                <button
                  type="button"
                  onClick={handleConnectGoogleDrive}
                  disabled={isGoogleLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-75 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                  id="auth-connect-gdrive-primary"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <HardDrive className="w-4 h-4" />
                  )}
                  <span>Connect Personal Google Drive</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="w-full py-2 flex items-center justify-center gap-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-[11px] transition cursor-pointer"
                id="auth-email-signout-btn"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of {user.email}</span>
              </button>
            </div>
          ) : (
            /* Not Logged In - Primary Google OAuth & Secondary Email View */
            <div className="space-y-5" id="auth-not-logged-in-section">
              <div className="space-y-2.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Highly Recommended</p>
                <button
                  type="button"
                  onClick={handleConnectGoogleDrive}
                  disabled={isGoogleLoading}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-gray-100 disabled:opacity-75 text-slate-950 font-bold text-xs flex items-center justify-center gap-2.5 shadow-md hover:scale-[1.01] transition duration-200 cursor-pointer"
                  id="auth-connect-gdrive-btn"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-4.5 h-4.5 animate-spin text-cyan-600" />
                  ) : (
                    <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  )}
                  <span>Connect Personal Google Drive</span>
                </button>
                <p className="text-[9.5px] text-gray-500 text-center leading-normal px-2">
                  Secures secure appdata presets backups & uploads exported videos instantly. 
                  No storage is stored on our servers.
                </p>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-[#232332] w-full" />
                <span className="bg-[#121218] px-3.5 text-[9px] text-gray-500 font-mono uppercase tracking-widest">OR</span>
              </div>

              {/* Standard Email Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {isSignUp && (
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-500" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Guldasta Creator"
                        className="w-full bg-[#171722] border border-[#2c2c3c] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="creator@cutecut.io"
                      className="w-full bg-[#171722] border border-[#2c2c3c] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#171722] border border-[#2c2c3c] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 font-bold text-xs text-black shadow-lg shadow-cyan-500/15 transition duration-200 cursor-pointer"
                  id="auth-submit-btn"
                >
                  {isSignUp ? 'Create Workspace' : 'Sign In'}
                </button>

                <button
                  type="button"
                  onClick={handleDemoProLogin}
                  className="w-full py-2 rounded-xl bg-[#171722] hover:bg-[#20202e] text-cyan-400 border border-[#2c2c3c] text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  id="auth-demo-btn"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Quick Demo Creator Pro Sign In</span>
                </button>

                <p className="text-center text-[10px] text-gray-400 pt-1">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-cyan-400 font-bold underline hover:text-cyan-300 cursor-pointer"
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up Free'}
                  </button>
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorSignInModal;
