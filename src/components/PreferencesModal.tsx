import React, { useState, useEffect } from 'react';
import { 
  X, Cpu, Zap, HardDrive, Settings, Monitor, Volume2, Save, MousePointerClick, 
  Sparkles, Key, Eye, EyeOff, Check, AlertCircle, Loader2 
} from 'lucide-react';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'performance' | 'general' | 'editing' | 'ai'>('performance');
  const [saved, setSaved] = useState(false);

  // Gemini API key state
  const [userApiKey, setUserApiKey] = useState(() => localStorage.getItem('user_gemini_api_key') || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testErrorMessage, setTestErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSaved(false);
      setUserApiKey(localStorage.getItem('user_gemini_api_key') || '');
      setTestStatus('idle');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    if (!userApiKey.trim()) {
      setTestStatus('error');
      setTestErrorMessage('Please enter an API Key to test.');
      return;
    }
    try {
      setTestStatus('testing');
      setTestErrorMessage('');
      const res = await fetch('/api/health', {
        headers: {
          'x-user-gemini-key': userApiKey.trim()
        }
      });
      const data = await res.json();
      if (res.ok && data.api_key_loaded) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
        setTestErrorMessage('Invalid API Key. Please double check and try again.');
      }
    } catch (e) {
      setTestStatus('error');
      setTestErrorMessage('Could not connect to service.');
    }
  };

  const handleSave = () => {
    localStorage.setItem('user_gemini_api_key', userApiKey.trim());
    // Dispatch a storage event so all other components refresh their API key setting immediately
    window.dispatchEvent(new Event('storage'));
    
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
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
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <Key className="w-4 h-4 text-cyan-400" /> Personal Gemini API Key
                  </h3>
                  
                  <div className="bg-[#1a1a24] p-5 rounded-lg border border-[#2a2a35] space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-400">
                        Google Gemini API Key
                      </label>
                      <div className="relative">
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={userApiKey}
                          onChange={(e) => {
                            setUserApiKey(e.target.value);
                            setTestStatus('idle');
                          }}
                          placeholder="AIzaSy..."
                          className="w-full bg-[#121217] border border-[#3a3a45] text-sm text-gray-200 rounded-lg pl-3 pr-10 py-2.5 outline-none focus:border-cyan-500 font-mono transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 hover:bg-[#232330] rounded text-gray-400 hover:text-white transition-colors"
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
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
                        <span>{testStatus === 'testing' ? 'Testing...' : 'Test API Key'}</span>
                      </button>

                      {testStatus === 'success' && (
                        <span className="text-[11px] font-semibold text-green-400 bg-green-950/40 border border-green-500/30 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                          <Check className="w-3 h-3" /> API Key Active & Valid!
                        </span>
                      )}

                      {testStatus === 'error' && (
                        <span className="text-[11.5px] font-semibold text-red-400 bg-red-950/20 border border-red-500/30 px-2.5 py-1 rounded-lg max-w-[200px] truncate">
                          {testErrorMessage}
                        </span>
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

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#232330] bg-[#0c0c10] flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${saved ? 'bg-green-500 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'} flex items-center gap-2`}
          >
            {saved ? <><Save className="w-4 h-4" /> Saved!</> : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};
