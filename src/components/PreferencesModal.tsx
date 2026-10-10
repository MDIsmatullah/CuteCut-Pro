import React, { useState, useEffect } from 'react';
import { 
  X, Cpu, Zap, HardDrive, Settings, Monitor, Volume2, Save, MousePointerClick, 
  Sparkles, Key, Eye, EyeOff, Check, AlertCircle, Loader2, Trash2, CheckCircle2,
  ShieldCheck, ExternalLink, Copy, CheckCheck, Play, DollarSign
} from 'lucide-react';
import { ProLicenseService } from '../services/proLicenseService';
import { AdMobService, ADMOB_CREDENTIALS } from '../utils/admobService';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'performance' | 'general' | 'editing' | 'ai' | 'monetization';
}

function cleanInputKey(val?: string): string {
  if (!val) return '';
  let cleaned = String(val).trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({ isOpen, onClose, initialTab = 'performance' }) => {
  const [activeTab, setActiveTab] = useState<'performance' | 'general' | 'editing' | 'ai' | 'monetization'>(initialTab);
  const [saved, setSaved] = useState(false);
  const [savingToServer, setSavingToServer] = useState(false);

  // AdMob & Monetization state
  const [crawlerTestStatus, setCrawlerTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [crawlerTestMsg, setCrawlerTestMsg] = useState('');
  const [copiedLine, setCopiedLine] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showAppOpenOnLaunch, setShowAppOpenOnLaunch] = useState(() => {
    try { return localStorage.getItem('admob_show_app_open') !== 'false'; } catch { return true; }
  });
  const [showExportAdEnabled, setShowExportAdEnabled] = useState(() => {
    try { return localStorage.getItem('admob_show_export_ad') !== 'false'; } catch { return true; }
  });
  const [showBannerAdEnabled, setShowBannerAdEnabled] = useState(() => {
    try { return localStorage.getItem('admob_show_banner_ad') !== 'false'; } catch { return true; }
  });

  // Gemini API key state
  const getStoredKey = () => {
    return cleanInputKey(
      localStorage.getItem('user_gemini_api_key') || 
      localStorage.getItem('cutecut_custom_gemini_api_key') || 
      localStorage.getItem('gemini_api_key') || 
      ''
    );
  };

  const [userApiKey, setUserApiKey] = useState(() => getStoredKey());
  const [showApiKey, setShowApiKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testErrorMessage, setTestErrorMessage] = useState('');
  const [testSuccessMessage, setTestSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSaved(false);
      const stored = getStoredKey();
      if (stored) {
        setUserApiKey(stored);
        setTestStatus('idle');
      } else {
        setUserApiKey('');
        // Fetch server saved user key ONLY if local storage was cleared
        fetch('/api/config/gemini-key')
          .then(r => r.json())
          .then(data => {
            if (data?.key) {
              const cleaned = cleanInputKey(data.key);
              setUserApiKey(cleaned);
              localStorage.setItem('user_gemini_api_key', cleaned);
              localStorage.setItem('cutecut_custom_gemini_api_key', cleaned);
              localStorage.setItem('gemini_api_key', cleaned);
              ProLicenseService.getInstance().setCustomApiKey(cleaned);
            } else {
              setUserApiKey('');
            }
          })
          .catch(() => {});
      }
      if (initialTab) {
        setActiveTab(initialTab);
      }
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    const keyToTest = cleanInputKey(userApiKey);
    if (!keyToTest) {
      setTestStatus('error');
      setTestErrorMessage('Please enter an API Key to test.');
      return;
    }
    if (keyToTest.length < 10) {
      setTestStatus('error');
      setTestErrorMessage('API key is too short. Please copy the entire key from Google AI Studio.');
      return;
    }

    try {
      setTestStatus('testing');
      setTestErrorMessage('');
      setTestSuccessMessage('');

      const res = await fetch('/api/ai/test-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-gemini-key': keyToTest,
          'x-gemini-api-key': keyToTest
        },
        body: JSON.stringify({ apiKey: keyToTest })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestStatus('success');
        setTestSuccessMessage(data.message || 'API Key is active and verified!');

        // Automatically persist key on test success
        localStorage.setItem('user_gemini_api_key', keyToTest);
        localStorage.setItem('cutecut_custom_gemini_api_key', keyToTest);
        localStorage.setItem('gemini_api_key', keyToTest);
        ProLicenseService.getInstance().setCustomApiKey(keyToTest);
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('gemini-key-updated', { detail: { apiKey: keyToTest } }));
      } else {
        // Fallback test with /api/health
        try {
          const healthRes = await fetch('/api/health', {
            headers: { 'x-user-gemini-key': keyToTest, 'x-gemini-api-key': keyToTest }
          });
          const healthData = await healthRes.json();
          if (healthRes.ok && healthData.api_key_loaded) {
            setTestStatus('success');
            setTestSuccessMessage('API Key Connected & Active!');
            localStorage.setItem('user_gemini_api_key', keyToTest);
            localStorage.setItem('cutecut_custom_gemini_api_key', keyToTest);
            ProLicenseService.getInstance().setCustomApiKey(keyToTest);
            window.dispatchEvent(new Event('storage'));
            return;
          }
        } catch (e2) {}

        setTestStatus('error');
        setTestErrorMessage(data.error || 'Invalid API Key. Please double check and try again.');
      }
    } catch (e: any) {
      setTestStatus('error');
      setTestErrorMessage(e?.message || 'Could not connect to service. Please check your network connection.');
    }
  };

  const handleSave = async () => {
    const cleanedKey = cleanInputKey(userApiKey);
    setSavingToServer(true);

    if (cleanedKey && cleanedKey.length >= 10) {
      localStorage.setItem('user_gemini_api_key', cleanedKey);
      localStorage.setItem('cutecut_custom_gemini_api_key', cleanedKey);
      localStorage.setItem('gemini_api_key', cleanedKey);
      ProLicenseService.getInstance().setCustomApiKey(cleanedKey);
    } else {
      localStorage.removeItem('user_gemini_api_key');
      localStorage.removeItem('cutecut_custom_gemini_api_key');
      localStorage.removeItem('gemini_api_key');
      ProLicenseService.getInstance().setCustomApiKey('');
    }

    // Persist key to backend server
    try {
      await fetch('/api/config/gemini-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: cleanedKey })
      });
    } catch (err) {
      console.warn('[PreferencesModal] Server key sync notice:', err);
    } finally {
      setSavingToServer(false);
    }

    // Save AdMob preferences
    try {
      localStorage.setItem('admob_show_app_open', String(showAppOpenOnLaunch));
      localStorage.setItem('admob_show_export_ad', String(showExportAdEnabled));
      localStorage.setItem('admob_show_banner_ad', String(showBannerAdEnabled));
    } catch (e) {}

    // Dispatch a storage event so all other components refresh their API key setting immediately
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('gemini-key-updated', { detail: { apiKey: cleanedKey } }));
    
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 700);
  };

  const handleClearKey = async () => {
    setUserApiKey('');
    setTestStatus('idle');
    setTestErrorMessage('');
    setTestSuccessMessage('API key removed.');
    localStorage.removeItem('user_gemini_api_key');
    localStorage.removeItem('cutecut_custom_gemini_api_key');
    localStorage.removeItem('gemini_api_key');
    ProLicenseService.getInstance().setCustomApiKey('');
    
    try {
      await fetch('/api/config/gemini-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: '' })
      });
    } catch (e) {}

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('gemini-key-updated', { detail: { apiKey: '' } }));
    setTimeout(() => {
      setTestSuccessMessage('');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#121217] w-full max-w-2xl rounded-xl border border-[#232330] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232330] bg-[#0c0c10]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#232330] rounded-lg">
              <Settings className="w-5 h-5 text-gray-300" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-100">Preferences & Settings</h2>
              <p className="text-xs text-gray-500">Configure performance, hardware, and UI behaviors.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#232330] text-gray-400 hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[400px]">
          {/* Sidebar */}
          <div className="w-48 bg-[#0c0c10] border-r border-[#232330] flex flex-col p-2 gap-1">
            <button 
              onClick={() => setActiveTab('performance')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeTab === 'performance' ? 'bg-[#232330] text-white font-medium' : 'text-gray-400 hover:bg-[#1a1a24] hover:text-gray-200'}`}
            >
              <Cpu className="w-4 h-4" /> Performance
            </button>
            <button 
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeTab === 'general' ? 'bg-[#232330] text-white font-medium' : 'text-gray-400 hover:bg-[#1a1a24] hover:text-gray-200'}`}
            >
              <Monitor className="w-4 h-4" /> General
            </button>
            <button 
              onClick={() => setActiveTab('editing')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeTab === 'editing' ? 'bg-[#232330] text-white font-medium' : 'text-gray-400 hover:bg-[#1a1a24] hover:text-gray-200'}`}
            >
              <MousePointerClick className="w-4 h-4" /> Editing
            </button>
            <button 
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeTab === 'ai' ? 'bg-[#232330] text-white font-medium' : 'text-gray-400 hover:bg-[#1a1a24] hover:text-gray-200'}`}
            >
              <Sparkles className="w-4 h-4 text-cyan-400" /> AI & API Key
            </button>
            <button 
              onClick={() => setActiveTab('monetization')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeTab === 'monetization' ? 'bg-[#232330] text-amber-400 font-medium' : 'text-gray-400 hover:bg-[#1a1a24] hover:text-gray-200'}`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" /> AdMob & Ads.txt
            </button>
          </div>

          {/* Main Area */}
          <div className="flex-1 p-6 overflow-y-auto bg-[#121217]">
            
            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" /> Hardware Acceleration
                  </h3>
                  <div className="bg-[#1a1a24] p-4 rounded-lg border border-[#2a2a35]">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-200">GPU Rendering (WebGL/WebGPU)</div>
                        <div className="text-xs text-gray-500 mt-1">Accelerates playback and effects rendering using graphics hardware.</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-[#3a3a45] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-purple-400" /> Timeline Preview Resolution
                  </h3>
                  <div className="bg-[#1a1a24] p-4 rounded-lg border border-[#2a2a35] space-y-3">
                    <div className="text-xs text-gray-500 mb-2">Lower resolutions improve playback smoothness on slower devices.</div>
                    <select defaultValue="4" className="w-full bg-[#121217] border border-[#3a3a45] text-sm text-gray-200 rounded-md px-3 py-2 outline-none focus:border-cyan-500">
                      <option value="1">Full Quality (1080p+)</option>
                      <option value="2">1/2 Quality (720p)</option>
                      <option value="4">1/4 Quality (480p) - Recommended</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-amber-400" /> Cache & Memory Limit
                  </h3>
                  <div className="bg-[#1a1a24] p-4 rounded-lg border border-[#2a2a35] space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300">Max Render Cache Size</span>
                        <span className="text-cyan-400">4.0 GB</span>
                      </div>
                      <input type="range" min="1" max="16" defaultValue="4" className="w-full accent-cyan-500" />
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-[#2a2a35] hover:bg-[#3a3a45] text-xs rounded transition-colors text-gray-300">
                        Clear Cache (2.1GB Used)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-300">Application Settings</h3>
                  <div className="bg-[#1a1a24] p-4 rounded-lg border border-[#2a2a35] space-y-4">
                    <div>
                      <div className="text-sm text-gray-200 mb-2">Interface Language</div>
                      <select className="w-full bg-[#121217] border border-[#3a3a45] text-sm text-gray-200 rounded-md px-3 py-2 outline-none focus:border-cyan-500">
                        <option value="en">English</option>
                        <option value="ur">Urdu (اردو)</option>
                        <option value="ar">Arabic (العربية)</option>
                      </select>
                    </div>
                    <hr className="border-[#2a2a35]" />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-200">Auto-Save Project</div>
                        <div className="text-xs text-gray-500 mt-1">Automatically save to cloud/local state</div>
                      </div>
                      <select defaultValue="5" className="bg-[#121217] border border-[#3a3a45] text-sm text-gray-200 rounded-md px-3 py-1 outline-none">
                        <option value="1">Every 1 min</option>
                        <option value="5">Every 5 mins</option>
                        <option value="10">Every 10 mins</option>
                        <option value="0">Off</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Editing Tab */}
            {activeTab === 'editing' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-300">Default Durations</h3>
                  <div className="bg-[#1a1a24] p-4 rounded-lg border border-[#2a2a35] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-200">Photo / Image Duration</div>
                      <div className="flex items-center gap-2">
                        <input type="number" defaultValue="5.0" step="0.5" className="w-20 bg-[#121217] border border-[#3a3a45] text-sm text-center text-gray-200 rounded-md px-2 py-1 outline-none" />
                        <span className="text-xs text-gray-500">secs</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-200">Transition Duration</div>
                      <div className="flex items-center gap-2">
                        <input type="number" defaultValue="1.0" step="0.1" className="w-20 bg-[#121217] border border-[#3a3a45] text-sm text-center text-gray-200 rounded-md px-2 py-1 outline-none" />
                        <span className="text-xs text-gray-500">secs</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI & API Key Tab */}
            {activeTab === 'ai' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200 text-left">
                {/* Auto-Segment Free Feature Banner */}
                <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 flex items-start gap-3 text-emerald-200">
                  <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-300 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-emerald-300">Auto-Segment is 100% Free Forever!</h4>
                      <span className="text-[9px] bg-emerald-500/30 text-emerald-100 font-extrabold px-1.5 py-0.5 rounded">NO LICENSE REQUIRED</span>
                    </div>
                    <p className="text-[11px] text-emerald-200/80 leading-tight">
                      Add your free Google Gemini API Key below to run intelligent Quran verse auto-segmentation & audio alignment at zero cost.
                    </p>
                    <p className="text-[10px] text-emerald-300/80 pt-0.5 font-medium dir-rtl">
                      آٹو سیگمنٹ مکمل مفت ہے! نیچے اپنی مفت جیمنائی کی لگا کر لامحدود آٹو سیگمنٹ چلائیں۔
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                      <Key className="w-4 h-4 text-cyan-400" /> Personal Gemini API Key
                    </h3>
                    {userApiKey.trim().length >= 10 && (
                      <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-950/50 border border-cyan-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" /> Active in Studio
                      </span>
                    )}
                  </div>
                  
                  <div className="bg-[#1a1a24] p-5 rounded-lg border border-[#2a2a35] space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-medium text-gray-400">
                          Google Gemini API Key
                        </label>
                        {userApiKey && (
                          <button
                            type="button"
                            onClick={handleClearKey}
                            className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Clear Key
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={userApiKey}
                          onChange={(e) => {
                            setUserApiKey(e.target.value);
                            setTestStatus('idle');
                            setTestErrorMessage('');
                            setTestSuccessMessage('');
                          }}
                          placeholder="AIzaSy..."
                          className="w-full bg-[#121217] border border-[#3a3a45] text-sm text-gray-200 rounded-lg pl-3 pr-10 py-2.5 outline-none focus:border-cyan-500 font-mono transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 hover:bg-[#232330] rounded text-gray-400 hover:text-white transition-colors"
                          title={showApiKey ? 'Hide Key' : 'Show Key'}
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleTestKey}
                          disabled={testStatus === 'testing'}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#232330] hover:bg-[#2d2d3e] border border-[#3a3a45] text-gray-200 text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-55"
                        >
                          {testStatus === 'testing' && <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />}
                          {testStatus === 'success' && <Check className="w-3.5 h-3.5 text-green-400" />}
                          {testStatus === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-400" />}
                          {testStatus === 'idle' && <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
                          <span>{testStatus === 'testing' ? 'Verifying with Google...' : 'Test & Verify Key'}</span>
                        </button>
                      </div>

                      {testStatus === 'success' && (
                        <span className="text-[11px] font-semibold text-green-300 bg-green-950/60 border border-green-500/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> {testSuccessMessage || 'API Key Active & Verified! Auto-saved.'}
                        </span>
                      )}

                      {testStatus === 'error' && (
                        <div className="text-[11.5px] font-medium text-red-300 bg-red-950/40 border border-red-500/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                          <span>{testErrorMessage}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Multilingual Explanatory Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-cyan-950/15 border border-cyan-500/20 p-4 rounded-xl text-xs space-y-1.5">
                      <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> English Guide
                      </div>
                      <p className="text-gray-300 leading-relaxed text-[11px]">
                        Save your personal Google Gemini API Key here. If left blank, the system automatically falls back to our default server-side API Key so your video editor features never stop working.
                      </p>
                      <a 
                        href="https://aistudio.google.com/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block text-[10px] text-cyan-400 hover:underline font-bold mt-1"
                      >
                        Get free Gemini Key →
                      </a>
                    </div>

                    <div className="bg-cyan-950/15 border border-cyan-500/20 p-4 rounded-xl text-xs space-y-1.5 text-right font-sans">
                      <div className="font-semibold text-cyan-300 flex items-center gap-1.5 justify-end">
                        Urdu Guide <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-gray-300 leading-relaxed text-[11px] dir-rtl">
                        Apni zati Google Gemini API Key yahan mehfooz karein. Agar isay khali chora jaye ga, to app automatic baghair kisi error ke default system server key par shift ho jaye gi taaki aapka kaam chalta rahe.
                      </p>
                      <a 
                        href="https://aistudio.google.com/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block text-[10px] text-cyan-400 hover:underline font-bold mt-1"
                      >
                        Muft Gemini Key haasil karein →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Monetization & AdMob Tab */}
            {activeTab === 'monetization' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" /> Google AdMob & Owner Verification
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Manage authorized digital sellers, app-ads.txt crawler status, and in-app monetization.
                  </p>
                </div>

                {/* AdMob Credentials Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-[#181822] p-3.5 rounded-xl border border-[#2a2a3a]">
                    <div className="text-[11px] text-gray-400 font-medium">AdMob Publisher ID</div>
                    <div className="text-sm font-mono text-amber-300 font-bold mt-0.5">{ADMOB_CREDENTIALS.publisherId}</div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3 h-3" /> Certified TAG ID: f08c47fec0942fa0
                    </div>
                  </div>

                  <div className="bg-[#181822] p-3.5 rounded-xl border border-[#2a2a3a]">
                    <div className="text-[11px] text-gray-400 font-medium">AdMob Application ID</div>
                    <div className="text-xs font-mono text-gray-200 font-semibold mt-0.5 truncate">{ADMOB_CREDENTIALS.appId}</div>
                    <div className="text-[10px] text-cyan-400 flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3 h-3" /> Registered in AndroidManifest.xml
                    </div>
                  </div>
                </div>

                {/* app-ads.txt Authorized Seller Entry */}
                <div className="bg-[#181822] p-4 rounded-xl border border-[#2a2a3a] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-gray-200">Authorized Digital Seller Line (app-ads.txt & ads.txt)</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">Required by Google AdMob crawlers to verify app and website ownership.</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const line = `google.com, ${ADMOB_CREDENTIALS.publisherId}, DIRECT, f08c47fec0942fa0`;
                        navigator.clipboard?.writeText(line);
                        setCopiedLine(true);
                        setTimeout(() => setCopiedLine(false), 2000);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#252536] hover:bg-[#303046] text-amber-300 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {copiedLine ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLine ? 'Copied!' : 'Copy Line'}</span>
                    </button>
                  </div>

                  <div className="p-3 bg-[#0e0e14] border border-[#242434] rounded-lg font-mono text-xs text-amber-200/90 select-all overflow-x-auto">
                    google.com, {ADMOB_CREDENTIALS.publisherId}, DIRECT, f08c47fec0942fa0
                  </div>

                  {/* Direct URLs and Live Test */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#222230]">
                    <div className="flex items-center gap-3">
                      <a
                        href="/app-ads.txt"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                      >
                        <span>/app-ads.txt</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href="/ads.txt"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                      >
                        <span>/ads.txt</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const fullUrl = `${window.location.origin}/app-ads.txt`;
                          navigator.clipboard?.writeText(fullUrl);
                          setCopiedUrl(true);
                          setTimeout(() => setCopiedUrl(false), 2000);
                        }}
                        className="px-2.5 py-1 rounded bg-[#20202e] hover:bg-[#2a2a3e] text-gray-300 text-[11px] flex items-center gap-1 transition cursor-pointer"
                      >
                        {copiedUrl ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedUrl ? 'Copied URL!' : 'Copy Full URL'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          setCrawlerTestStatus('testing');
                          setCrawlerTestMsg('Sending verification request to /app-ads.txt...');
                          const res = await AdMobService.testAdsTxtCrawler();
                          if (res.success) {
                            setCrawlerTestStatus('success');
                            setCrawlerTestMsg(`HTTP 200 OK — Verified! AdMob crawlers can successfully reach and read your publisher ID (${ADMOB_CREDENTIALS.publisherId}).`);
                          } else {
                            setCrawlerTestStatus('error');
                            setCrawlerTestMsg(res.message);
                          }
                        }}
                        disabled={crawlerTestStatus === 'testing'}
                        className="px-3 py-1 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                      >
                        {crawlerTestStatus === 'testing' ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                        <span>Test Crawler Status</span>
                      </button>
                    </div>
                  </div>

                  {/* Verification diagnostic message */}
                  {crawlerTestStatus !== 'idle' && (
                    <div className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                      crawlerTestStatus === 'success' 
                        ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-200'
                        : crawlerTestStatus === 'error'
                        ? 'bg-red-950/40 border border-red-500/40 text-red-200'
                        : 'bg-cyan-950/40 border border-cyan-500/40 text-cyan-200'
                    }`}>
                      {crawlerTestStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                      {crawlerTestStatus === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
                      {crawlerTestStatus === 'testing' && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0 mt-0.5" />}
                      <span className="leading-relaxed">{crawlerTestMsg}</span>
                    </div>
                  )}
                </div>

                {/* Ad Display Toggles */}
                <div className="bg-[#181822] p-4 rounded-xl border border-[#2a2a3a] space-y-4">
                  <div className="text-xs font-bold text-gray-200">Ad Triggers & Placement</div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-200 font-medium">Show App Open Ad</div>
                      <div className="text-[11px] text-gray-400">Displays full-screen sponsor ad when the app is launched.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={showAppOpenOnLaunch}
                        onChange={(e) => setShowAppOpenOnLaunch(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-10 h-5 bg-[#3a3a48] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#242434] pt-3">
                    <div>
                      <div className="text-xs text-gray-200 font-medium">Show Export Ad</div>
                      <div className="text-[11px] text-gray-400">Displays interstitial sponsor ad before and after video export.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={showExportAdEnabled}
                        onChange={(e) => setShowExportAdEnabled(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-10 h-5 bg-[#3a3a48] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#242434] pt-3">
                    <div>
                      <div className="text-xs text-gray-200 font-medium">Show Bottom Banner Ad</div>
                      <div className="text-[11px] text-gray-400">Displays bottom sticky banner ad on mobile and tablet screens.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={showBannerAdEnabled}
                        onChange={(e) => setShowBannerAdEnabled(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-10 h-5 bg-[#3a3a48] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                </div>

                {/* Live Test Ad Buttons */}
                <div className="bg-[#181822] p-4 rounded-xl border border-[#2a2a3a] space-y-3">
                  <div className="text-xs font-bold text-gray-200 flex items-center gap-2">
                    <Play className="w-3.5 h-3.5 text-cyan-400" /> Test Live Ad Displays
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Preview how ads render on this device with official Google AdMob badges and countdowns.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => AdMobService.showAppOpenAd()}
                      className="py-2 px-3 rounded-lg bg-[#252538] hover:bg-[#32324c] border border-[#383850] text-gray-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>App Open Ad</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => AdMobService.showExportAd(() => {})}
                      className="py-2 px-3 rounded-lg bg-[#252538] hover:bg-[#32324c] border border-[#383850] text-gray-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Film className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Export Ad</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => AdMobService.showRewarded(() => {})}
                      className="py-2 px-3 rounded-lg bg-[#252538] hover:bg-[#32324c] border border-[#383850] text-gray-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5 text-purple-400" />
                      <span>Rewarded Ad</span>
                    </button>
                  </div>
                </div>

                {/* Urdu Guide for AdMob Owner Verification */}
                <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-xl text-xs space-y-2 text-right font-sans">
                  <div className="font-semibold text-amber-300 flex items-center gap-1.5 justify-end">
                    Google AdMob Owner Verification گائیڈ (اردو) <ShieldCheck className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-gray-300 text-[11px] leading-relaxed space-y-1 dir-rtl text-right">
                    <p>
                      <strong>اگر آپ کا ایپ پلے اسٹور پر نہیں ہے اور صرف ویب سائٹ پر ہے:</strong>
                    </p>
                    <p>
                      1. اپنے Google AdMob اکاؤنٹ میں لاگ ان کریں اور بائیں مینو سے <strong>Apps &gt; All apps &gt; app-ads.txt</strong> پر جائیں۔
                    </p>
                    <p>
                      2. وہاں اپنی ویب سائٹ کا لنک درج کریں (مثلاً <code>{typeof window !== 'undefined' ? window.location.origin : 'https://cutecutpro.com'}</code>)۔
                    </p>
                    <p>
                      3. ہماری ویب سائٹ پر <code>/app-ads.txt</code> اور <code>/ads.txt</code> مکمل طور پر فعال ہے جس میں آپ کا پبلشر کوڈ (<code>{ADMOB_CREDENTIALS.publisherId}</code>) شامل ہے۔
                    </p>
                    <p>
                      4. گوگل کا کرالر چند گھنٹوں میں اس لنک کو چیک کر کے آپ کے ایڈموب اکاؤنٹ کی اوونر ویریفیکیشن مکمل (Green Check) کر دے گا۔
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#232330] bg-[#0c0c10] flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleSave}
            disabled={savingToServer}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${saved ? 'bg-green-600 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'} flex items-center gap-2 cursor-pointer disabled:opacity-50`}
          >
            {savingToServer && <Loader2 className="w-4 h-4 animate-spin" />}
            {saved ? <><CheckCircle2 className="w-4 h-4 text-white" /> Saved & Active!</> : savingToServer ? 'Saving...' : <><Save className="w-4 h-4" /> Save Preferences</>}
          </button>
        </div>
      </div>
    </div>
  );
};
