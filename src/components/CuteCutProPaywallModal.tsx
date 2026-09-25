import React, { useState } from 'react';
import { Crown, Sparkles, Check, Key, Zap, ShieldCheck, Film, Mic, Video, Layers, ArrowRight, X, ExternalLink, RefreshCw, Wand2 } from 'lucide-react';
import { ProLicenseService, GUMROAD_PURCHASE_URL } from '../services/proLicenseService';

interface CuteCutProPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivated?: () => void;
  featureName?: string;
}

export const CuteCutProPaywallModal: React.FC<CuteCutProPaywallModalProps> = ({
  isOpen,
  onClose,
  onActivated,
  featureName,
}) => {
  const licenseService = ProLicenseService.getInstance();
  const state = licenseService.getState();

  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState(state.customApiKey || '');
  const [activeTab, setActiveTab] = useState<'plans' | 'license_key' | 'byok'>('plans');
  const [activationMsg, setActivationMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleActivateKey = () => {
    if (!licenseKeyInput.trim()) {
      setActivationMsg({ text: 'Please enter your license key.', isError: true });
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const res = licenseService.activateLicense(licenseKeyInput);
      setIsLoading(false);
      if (res.success) {
        setActivationMsg({ text: res.message, isError: false });
        if (onActivated) onActivated();
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setActivationMsg({ text: res.message, isError: true });
      }
    }, 600);
  };

  const handleSaveApiKey = () => {
    licenseService.setCustomApiKey(apiKeyInput);
    setActivationMsg({ text: 'Custom Gemini API Key saved successfully!', isError: false });
    if (onActivated) onActivated();
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0f0f17] border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white">
        {/* Glow Header */}
        <div className="relative p-6 bg-gradient-to-r from-amber-950/70 via-purple-950/80 to-[#120f24] border-b border-amber-500/30">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 hover:bg-black text-gray-400 hover:text-white flex items-center justify-center transition border border-gray-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Crown className="w-7 h-7 text-black fill-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-white">CuteCut Pro All-Access</h2>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-black rounded-full shadow-sm">
                  PRO TIER
                </span>
              </div>
              <p className="text-xs text-amber-200/80 mt-0.5">
                {featureName
                  ? `${featureName} is an exclusive CuteCut Pro feature. Upgrade to unlock!`
                  : 'Unlock Unlimited AI Prompt-to-Video, Quran 4K Visuals Suite, Veo 3.1 & Studio Voiceover'}
              </p>
            </div>
          </div>

          {/* Credits & Notice pill */}
          <div className="mt-3 flex flex-col sm:flex-row gap-2 bg-black/40 p-2.5 rounded-xl border border-amber-500/20 text-xs">
            <div className="flex-1 flex items-center justify-between px-2">
              <span className="text-gray-300 flex items-center gap-1.5 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                AI Video & Visuals:
              </span>
              <span className="font-bold font-mono text-[11px] text-amber-400">
                {state.isPro ? '👑 PRO UNLOCKED' : state.customApiKey ? '🔑 CUSTOM API KEY ACTIVE' : '🔒 PRO LICENSE REQUIRED'}
              </span>
            </div>
            <div className="flex-1 flex items-center justify-between px-2 sm:border-l border-gray-800">
              <span className="text-gray-300 flex items-center gap-1.5 text-[11px]">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Auto-Segment:
              </span>
              <span className="font-bold text-emerald-400 font-mono text-[11px]">
                ✨ 100% FREE ALWAYS
              </span>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-800 bg-[#0a0a0f] p-1.5">
          <button
            onClick={() => { setActiveTab('plans'); setActivationMsg(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'plans' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Upgrade Plans
          </button>
          <button
            onClick={() => { setActiveTab('license_key'); setActivationMsg(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'license_key' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            Enter License Key
          </button>
          <button
            onClick={() => { setActiveTab('byok'); setActivationMsg(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'byok' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Free API Key (BYOK)
          </button>
        </div>

        {/* Tab 1: Upgrade Plans */}
        {activeTab === 'plans' && (
          <div className="p-6 space-y-5 overflow-y-auto max-h-[420px] custom-scrollbar">
            {/* Features Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#14141f] p-4 rounded-2xl border border-gray-800">
              {[
                { icon: Wand2, text: 'Unlimited AI Prompt-to-Video Generation' },
                { icon: Film, text: 'Veo 3.1 Fast 4K Photo-to-Video Motion' },
                { icon: Mic, text: 'Studio AI Narration (100+ Natural Voices)' },
                { icon: Layers, text: 'Automatic 4-Track Timeline Assembly' },
                { icon: Video, text: '4K 60FPS Hardware Accelerated Render' },
                { icon: ShieldCheck, text: '100% Commercial Usage & Zero Watermark' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-gray-200">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Lifetime Pass */}
              <div className="relative p-5 rounded-2xl bg-gradient-to-b from-[#241a10] to-[#16121f] border-2 border-amber-400/80 shadow-xl space-y-3">
                <span className="absolute -top-3 right-4 px-2.5 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-extrabold text-[10px] rounded-full uppercase tracking-wider shadow">
                  MOST POPULAR • LIFETIME
                </span>
                <div>
                  <h3 className="text-sm font-black text-amber-300">Lifetime Studio Pro</h3>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl font-black text-white">$29</span>
                    <span className="text-xs text-gray-400 line-through">$89</span>
                    <span className="text-[11px] text-amber-400 font-bold ml-1">One-time payment</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-300">Pay once, own forever with lifetime updates & unlimited AI studio.</p>
                <a
                  href={GUMROAD_PURCHASE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-black text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <span>Get Lifetime License on Gumroad</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Monthly Subscription */}
              <div className="p-5 rounded-2xl bg-[#14141f] border border-gray-800 hover:border-gray-700 transition space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-200">Monthly Pro</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-white">$9</span>
                    <span className="text-xs text-gray-400">/ month</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400">Cancel anytime. Includes full access to AI tools and updates.</p>
                <a
                  href={GUMROAD_PURCHASE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-[#222230] hover:bg-[#2c2c3e] text-white font-bold text-xs rounded-xl border border-gray-700 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Subscribe on Gumroad</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Activate Key */}
        {activeTab === 'license_key' && (
          <div className="p-6 space-y-4">
            {/* Purchase CTA directly in key entry */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-purple-950/40 border border-amber-500/30 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-amber-300">Don&apos;t have a License Key yet?</p>
                <p className="text-[11px] text-gray-300 mt-0.5">Purchase directly on Gumroad and receive your key instantly via email.</p>
              </div>
              <a
                href={GUMROAD_PURCHASE_URL}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition shrink-0 shadow cursor-pointer"
              >
                <span>Buy Key</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wide">Enter CuteCut Pro License Key</label>
              <input
                type="text"
                value={licenseKeyInput}
                onChange={(e) => setLicenseKeyInput(e.target.value)}
                placeholder="e.g. CUTECUT-PRO-2026-XXXXX or Gumroad Key"
                className="w-full bg-[#181824] border border-gray-700 focus:border-amber-400 rounded-xl p-3 text-sm text-white font-mono placeholder-gray-500 outline-none transition uppercase"
              />
              <p className="text-[11px] text-gray-400">
                You can find your license key in your Gumroad purchase receipt email.
              </p>
            </div>

            {activationMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-medium ${
                  activationMsg.isError
                    ? 'bg-red-950/50 border border-red-500/50 text-red-200'
                    : 'bg-emerald-950/50 border border-emerald-500/50 text-emerald-200'
                }`}
              >
                {activationMsg.text}
              </div>
            )}

            <button
              onClick={handleActivateKey}
              disabled={isLoading}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              <span>Activate Pro License</span>
            </button>

            {/* Developer / Creator Quick Test Unlock */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setLicenseKeyInput('CUTECUT-CREATOR-VIP-PASS');
                  const res = licenseService.activateLicense('CUTECUT-CREATOR-VIP-PASS');
                  if (res.success) {
                    setActivationMsg({ text: '🎉 Creator/Owner VIP Pass Activated! Testing is now UNLIMITED.', isError: false });
                    if (onActivated) onActivated();
                    setTimeout(() => {
                      onClose();
                    }, 900);
                  }
                }}
                className="text-[10px] text-gray-400 hover:text-amber-400 transition underline cursor-pointer inline-flex items-center gap-1"
                title="Creator/Developer Testing Pass"
              >
                <span>🛠️ Creator / Developer Test Mode (One-Click Unlock)</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: BYOK (Free Developer Option) */}
        {activeTab === 'byok' && (
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wide">Personal Google Gemini API Key</label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>Get Free Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[#181824] border border-gray-700 focus:border-amber-400 rounded-xl p-3 text-sm text-white font-mono placeholder-gray-500 outline-none transition"
              />
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Developers can bring their own free Google Gemini API Key from Google AI Studio. Your key is securely stored in your local browser and gives you direct AI generation.
              </p>
            </div>

            {activationMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-medium ${
                  activationMsg.isError
                    ? 'bg-red-950/50 border border-red-500/50 text-red-200'
                    : 'bg-emerald-950/50 border border-emerald-500/50 text-emerald-200'
                }`}
              >
                {activationMsg.text}
              </div>
            )}

            <button
              onClick={handleSaveApiKey}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Save Personal API Key</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CuteCutProPaywallModal;
