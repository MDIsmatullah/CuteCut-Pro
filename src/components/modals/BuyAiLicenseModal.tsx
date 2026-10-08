import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  ShieldCheck,
  Zap,
  Cpu,
  CreditCard,
  Copy,
  ExternalLink,
  MessageCircle,
  Key,
  Flame,
  Award
} from 'lucide-react';
import { ProLicenseService } from '../../services/proLicenseService';

export interface BuyAiLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivated?: () => void;
}

export const BuyAiLicenseModal: React.FC<BuyAiLicenseModalProps> = ({
  isOpen,
  onClose,
  onActivated
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'studio'>('pro');
  const [selectedPaymentTab, setSelectedPaymentTab] = useState<'local' | 'card' | 'crypto'>('local');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [activationStatus, setActivationStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, keyName: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(keyName);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {}
  };

  const handleActivateKey = (e: React.FormEvent) => {
    e.preventDefault();
    const key = licenseKeyInput.trim();
    if (!key) return;

    const result = ProLicenseService.getInstance().activateLicense(key);
    if (result.success) {
      setActivationStatus('success');
      setTimeout(() => {
        if (onActivated) onActivated();
        onClose();
      }, 1500);
    } else {
      setActivationStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0d0f1a] border border-blue-500/30 rounded-2xl sm:rounded-3xl shadow-2xl shadow-blue-500/10 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-950/70 via-[#131128] to-[#1a1028] border-b border-white/10 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">Buy AI Model & Pro License</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30">
                  Lifetime Deal
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Unlock high-speed Gemini AI scriptwriting, unlimited auto Quran sync & cloud models
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
          {/* Plan Tiers Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tier 1: Pro Creator */}
            <div
              onClick={() => setSelectedPlan('pro')}
              className={`p-4 sm:p-5 rounded-2xl cursor-pointer transition border relative ${
                selectedPlan === 'pro'
                  ? 'bg-gradient-to-b from-blue-950/40 to-[#101224] border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500'
                  : 'bg-[#121422] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Most Popular
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-white text-base">Pro AI Creator License</h3>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-black text-white">$19</span>
                <span className="text-sm font-semibold text-gray-400">/ PKR 3,500</span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  Lifetime Access
                </span>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Gemini AI Smart Script-to-Video generation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Word-by-word Quran karaoke subtitle sync</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>4K 60FPS Ultra Export without any watermark</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>All Desktop (.exe, .dmg, Linux) & Android offline</span>
                </li>
              </ul>
            </div>

            {/* Tier 2: Studio Agency */}
            <div
              onClick={() => setSelectedPlan('studio')}
              className={`p-4 sm:p-5 rounded-2xl cursor-pointer transition border relative ${
                selectedPlan === 'studio'
                  ? 'bg-gradient-to-b from-purple-950/40 to-[#101224] border-purple-500 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500'
                  : 'bg-[#121422] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Full Studio
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-white text-base">Studio AI Agency License</h3>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-black text-white">$49</span>
                <span className="text-sm font-semibold text-gray-400">/ PKR 9,000</span>
                <span className="text-[10px] font-mono text-purple-400 font-bold bg-purple-500/10 px-1.5 py-0.5 rounded">
                  Lifetime Multi-Device
                </span>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Everything in Pro Creator License</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Veo AI Video & Sora Photo priority models</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Full Commercial YouTube / TikTok monetized rights</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Direct VIP Developer WhatsApp priority support</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Payment Details Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#141728] border border-white/10 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                <span>Select Payment Method (Pakistan & Global)</span>
              </h4>

              {/* Tabs */}
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
                <button
                  onClick={() => setSelectedPaymentTab('local')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                    selectedPaymentTab === 'local'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  EasyPaisa / JazzCash
                </button>
                <button
                  onClick={() => setSelectedPaymentTab('card')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                    selectedPaymentTab === 'card'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Bank / PayPal
                </button>
                <button
                  onClick={() => setSelectedPaymentTab('crypto')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                    selectedPaymentTab === 'crypto'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  USDT Crypto
                </button>
              </div>
            </div>

            {/* TAB 1: EasyPaisa & JazzCash */}
            {selectedPaymentTab === 'local' && (
              <div className="space-y-3 pt-1">
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-emerald-400 uppercase">EasyPaisa & JazzCash Account</div>
                    <div className="text-sm font-bold text-white mt-0.5">0300-1234567 / 0321-9876543</div>
                    <div className="text-xs text-gray-300">Account Title: CuteCut Pro Official / Guldasta Islam</div>
                  </div>
                  <button
                    onClick={() => handleCopy('03001234567', 'ep')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedKey === 'ep' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'ep' ? 'Copied' : 'Copy Number'}</span>
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  After payment, send your transaction screenshot on WhatsApp to get your instant lifetime activation key.
                </p>
              </div>
            )}

            {/* TAB 2: Bank / PayPal */}
            {selectedPaymentTab === 'card' && (
              <div className="space-y-3 pt-1">
                <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-blue-400 uppercase">Bank Transfer (Meezan / HBL / IBAN)</div>
                    <div className="text-sm font-bold text-white mt-0.5">PK00MEZN0001234567890123</div>
                    <div className="text-xs text-gray-300">Title: CuteCut Pro Tech / PayPal: donate@cutecutpro.com</div>
                  </div>
                  <button
                    onClick={() => handleCopy('PK00MEZN0001234567890123', 'bank')}
                    className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedKey === 'bank' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'bank' ? 'Copied' : 'Copy IBAN'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: Crypto USDT */}
            {selectedPaymentTab === 'crypto' && (
              <div className="space-y-3 pt-1">
                <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="text-[10px] font-bold text-purple-400 uppercase">USDT (TRC-20 Network)</div>
                    <div className="text-xs font-mono text-white mt-0.5 truncate">TX7a9BcDefGhIjKlMnOpQrStUvWxYz12345</div>
                  </div>
                  <button
                    onClick={() => handleCopy('TX7a9BcDefGhIjKlMnOpQrStUvWxYz12345', 'crypto')}
                    className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0"
                  >
                    {copiedKey === 'crypto' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'crypto' ? 'Copied' : 'Copy Address'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* WhatsApp Direct Buy Link */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <a
                href={`https://wa.me/?text=Hello!%20I%20want%20to%20buy%20CuteCut%20Pro%20${selectedPlan === 'pro' ? 'Pro%20Creator%20License%20(PKR%203,500)' : 'Studio%20Agency%20License%20(PKR%209,000)'}.%20Please%20provide%20instant%20activation%20key.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer active:scale-98"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contact on WhatsApp for Instant Key</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>
          </div>

          {/* Activate Existing Key Form */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Already have an AI License Key? Activate Now:</span>
            </div>
            <form onSubmit={handleActivateKey} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter License Key (e.g. CUTECUT-PRO-2026-KEY)"
                value={licenseKeyInput}
                onChange={(e) => {
                  setLicenseKeyInput(e.target.value);
                  setActivationStatus(null);
                }}
                className="flex-1 bg-[#101220] border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 font-mono uppercase"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition cursor-pointer"
              >
                Activate Key
              </button>
            </form>

            {activationStatus === 'success' && (
              <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>License Key Successfully Activated! Pro Features Unlocked.</span>
              </p>
            )}

            {activationStatus === 'error' && (
              <p className="text-xs text-rose-400 font-semibold animate-in fade-in">
                Invalid key format. Please enter a valid CuteCut Pro license key or contact support.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0a0c14] border-t border-white/10 flex items-center justify-between shrink-0">
          <div className="text-xs text-gray-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>30-Day Money Back Guarantee & 100% Secure Checkout</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyAiLicenseModal;
