import React, { useState } from 'react';
import {
  X,
  Heart,
  Copy,
  Check,
  ExternalLink,
  Coffee,
  Coins,
  Building,
  Smartphone,
  Share2
} from 'lucide-react';

export interface DonationSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonationSupportModal: React.FC<DonationSupportModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'local' | 'bank' | 'crypto' | 'coffee'>('local');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, field: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0f101c] border border-rose-500/30 rounded-2xl sm:rounded-3xl shadow-2xl shadow-rose-500/10 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-rose-950/70 via-[#181128] to-[#111728] border-b border-white/10 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-600 via-pink-600 to-amber-600 flex items-center justify-center shadow-lg shadow-rose-600/30">
              <Heart className="w-6 h-6 text-white fill-white/20 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">Support & Donate to CuteCut Pro</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Sadqah-e-Jariyah
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Help us keep this video editor 100% free, open, and watermark-free for Islamic creators
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

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {/* Motivation Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-transparent border border-rose-500/20 text-xs text-gray-300 leading-relaxed">
            <p className="font-semibold text-rose-200 mb-1">
              JazakAllah Khair for supporting CuteCut Pro!
            </p>
            CuteCut Pro provides free 4K 60FPS video editing, automated Quran recitation alignment, and Arabic typography with zero paywalls. Your generous donation helps cover high-performance cloud AI server costs and development.
          </div>

          {/* Channels Selection Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => setActiveTab('local')}
              className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'local'
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                  : 'bg-[#141628] border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>EasyPaisa / Jazz</span>
            </button>

            <button
              onClick={() => setActiveTab('bank')}
              className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'bank'
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                  : 'bg-[#141628] border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <Building className="w-4 h-4 text-blue-400" />
              <span>Bank Account</span>
            </button>

            <button
              onClick={() => setActiveTab('crypto')}
              className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'crypto'
                  ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                  : 'bg-[#141628] border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <Coins className="w-4 h-4 text-purple-400" />
              <span>Crypto USDT</span>
            </button>

            <button
              onClick={() => setActiveTab('coffee')}
              className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'coffee'
                  ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                  : 'bg-[#141628] border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <Coffee className="w-4 h-4 text-amber-400" />
              <span>Buy Me a Coffee</span>
            </button>
          </div>

          {/* TAB 1: EasyPaisa & JazzCash */}
          {activeTab === 'local' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#141628] border border-white/10 space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-emerald-400 uppercase">EasyPaisa Account</div>
                  <div className="text-base font-bold text-white mt-0.5">0300-1234567</div>
                  <div className="text-xs text-gray-400">Title: CuteCut Pro Official / Guldasta Islam</div>
                </div>
                <button
                  onClick={() => handleCopy('03001234567', 'ep')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedField === 'ep' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'ep' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-amber-400 uppercase">JazzCash Account</div>
                  <div className="text-base font-bold text-white mt-0.5">0321-9876543</div>
                  <div className="text-xs text-gray-400">Title: CuteCut Pro Tech</div>
                </div>
                <button
                  onClick={() => handleCopy('03219876543', 'jc')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedField === 'jc' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'jc' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Bank Account */}
          {activeTab === 'bank' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#141628] border border-white/10 space-y-3">
              <div>
                <div className="text-[10px] font-bold text-blue-400 uppercase">Meezan Bank Limited (Islamic Banking)</div>
                <div className="text-sm font-bold text-white mt-0.5">Account Number: 01020304050607</div>
                <div className="text-xs font-mono text-gray-300 mt-1">IBAN: PK00MEZN0001234567890123</div>
                <div className="text-xs text-gray-400 mt-0.5">Branch: Main Islamic Media City Branch</div>
              </div>
              <button
                onClick={() => handleCopy('PK00MEZN0001234567890123', 'iban')}
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                {copiedField === 'iban' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'iban' ? 'IBAN Copied!' : 'Copy Bank IBAN'}</span>
              </button>
            </div>
          )}

          {/* TAB 3: Crypto USDT */}
          {activeTab === 'crypto' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#141628] border border-white/10 space-y-3">
              <div>
                <div className="text-[10px] font-bold text-purple-400 uppercase">USDT Tether (TRC-20 Network)</div>
                <div className="text-xs font-mono text-white mt-1 break-all bg-black/40 p-2.5 rounded-xl border border-white/10">
                  TX7a9BcDefGhIjKlMnOpQrStUvWxYz12345
                </div>
              </div>
              <button
                onClick={() => handleCopy('TX7a9BcDefGhIjKlMnOpQrStUvWxYz12345', 'usdt')}
                className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                {copiedField === 'usdt' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'usdt' ? 'Wallet Address Copied!' : 'Copy TRC-20 USDT Address'}</span>
              </button>
            </div>
          )}

          {/* TAB 4: Buy Me a Coffee / Global */}
          {activeTab === 'coffee' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#141628] border border-white/10 space-y-3">
              <p className="text-xs text-gray-300">
                Support via Buy Me a Coffee or PayPal with international credit/debit card.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href="https://buymeacoffee.com/cutecutpro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Coffee className="w-4 h-4" />
                  <span>Buy Me a Coffee ($5)</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </a>

                <a
                  href="https://paypal.me/cutecutpro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <span>PayPal Donation</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0a0c14] border-t border-white/10 flex items-center justify-between shrink-0">
          <div className="text-xs text-gray-400">
            May Allah reward everyone supporting knowledge and creative tools.
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

export default DonationSupportModal;
