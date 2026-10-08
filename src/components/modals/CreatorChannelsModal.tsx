import React, { useState } from 'react';
import {
  X,
  Youtube,
  ExternalLink,
  Check,
  Copy,
  Share2,
  Sparkles,
  MessageCircle,
  Send,
  Video,
  Heart,
  Globe
} from 'lucide-react';

export interface CreatorChannelsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const YOUTUBE_CHANNELS = [
  {
    id: 'ch1',
    name: 'Guldasta Islam or Quran (گلدستہ اسلام)',
    url: 'https://www.youtube.com/channel/UCVP3RNRdficqmriDszLjzcQ',
    category: 'Quran Recitations & Islamic Status',
    description: 'Authentic beautiful Quranic recitations, word-by-word visual translations, Surah status reels, and Islamic knowledge reminders.',
    badge: 'Official Quran Channel',
    badgeColor: 'emerald',
    iconColor: 'from-emerald-600 to-teal-500'
  },
  {
    id: 'ch2',
    name: 'CuteCut Pro Video & Audio Studio',
    url: 'https://www.youtube.com/channel/UCgTnf68omNLAr4kHTYXa10g',
    category: 'Video Editing Tutorials & CapCut Alternative Guides',
    description: 'Master classes on CuteCut Pro, AI waveform alignment, 4K 60FPS vertical reels, CapCut tips, and mobile editing workflows.',
    badge: 'Official Tech & Tutorials',
    badgeColor: 'red',
    iconColor: 'from-red-600 to-rose-500'
  }
];

export const OTHER_SOCIALS = [
  {
    name: 'WhatsApp Community Channel',
    url: 'https://whatsapp.com/channel/cutecutpro',
    description: 'Get daily template presets, recitation audios & software updates',
    icon: MessageCircle,
    color: 'hover:text-emerald-400 border-emerald-500/30'
  },
  {
    name: 'Telegram Channel',
    url: 'https://t.me/cutecutpro',
    description: 'Download latest APK, EXE releases and sound packs',
    icon: Send,
    color: 'hover:text-cyan-400 border-cyan-500/30'
  },
  {
    name: 'TikTok Video Hub',
    url: 'https://tiktok.com/@cutecutpro',
    description: 'Viral 9:16 templates and short status reels',
    icon: Video,
    color: 'hover:text-pink-400 border-pink-500/30'
  }
];

export const CreatorChannelsModal: React.FC<CreatorChannelsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (url: string, id: string) => {
    try {
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0f111c] border border-red-500/30 rounded-2xl sm:rounded-3xl shadow-2xl shadow-red-500/10 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Glow Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-red-950/60 via-[#181128] to-[#111c28] border-b border-white/10 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-600/30">
                <Youtube className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-white">Official YouTube Channels</h2>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                    Subscribe
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Follow our official YouTube channels for tutorials, Quran status reels & updates
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
        </div>

        {/* Channels List */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {YOUTUBE_CHANNELS.map((ch) => (
            <div
              key={ch.id}
              className="p-4 sm:p-5 rounded-2xl bg-[#141728] border border-white/10 hover:border-red-500/40 transition group relative overflow-hidden shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${ch.iconColor} flex items-center justify-center shrink-0 shadow-md`}>
                    <Youtube className="w-6 h-6 text-white group-hover:scale-110 transition duration-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-red-300 transition">
                        {ch.name}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ch.badgeColor === 'emerald'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {ch.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                      {ch.description}
                    </p>
                    <div className="mt-2 text-[11px] font-mono text-gray-400 truncate">
                      {ch.url}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleCopy(ch.url, ch.id)}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
                    title="Copy Channel Link"
                  >
                    {copiedId === ch.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-gray-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <a
                    href={ch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-md shadow-red-600/30 flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                  >
                    <Youtube className="w-4 h-4" />
                    <span>Open & Subscribe</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </a>
                </div>
              </div>
            </div>
          ))}

          {/* Social Communities */}
          <div className="pt-2 border-t border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Official Creator Communities & Social Media</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {OTHER_SOCIALS.map((soc, idx) => {
                const IconComponent = soc.icon;
                return (
                  <a
                    key={idx}
                    href={soc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-3 rounded-xl bg-[#141728] border border-white/10 ${soc.color} transition flex items-center gap-3 group`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                      <IconComponent className="w-4 h-4 text-gray-300 group-hover:scale-110 transition" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate">{soc.name}</div>
                      <div className="text-[10px] text-gray-400 truncate">Join community</div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-white shrink-0" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0a0c14] border-t border-white/10 flex items-center justify-between shrink-0">
          <div className="text-xs text-gray-400 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400/30" />
            <span>Support our work by subscribing and sharing</span>
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

export default CreatorChannelsModal;
