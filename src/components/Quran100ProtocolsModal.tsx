import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sliders,
  Copy,
  Check,
  Sparkles,
  FileText,
  Volume2,
  Mic,
  ShieldCheck,
  Layers,
  Clock,
  Music,
  Download
} from 'lucide-react';
import { QuranAlignment100Protocols, QuranProtocolItem } from '../types/quranAlignment';

interface Quran100ProtocolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  protocols?: QuranAlignment100Protocols;
  surahName?: string;
  totalAyahs?: number;
}

export const Quran100ProtocolsModal: React.FC<Quran100ProtocolsModalProps> = ({
  isOpen,
  onClose,
  protocols,
  surahName = 'Surah Al-Fatihah',
  totalAyahs = 7
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  const categories = [
    { id: 'all', name: 'All 100 Protocols', icon: Sparkles },
    { id: 'opening-verses', name: "A'udhu & Bismillah", icon: Volume2 },
    { id: 'timestamps-boundaries', name: 'Timestamps & Boundaries', icon: Clock },
    { id: 'silence-pauses', name: 'Silence & Pauses', icon: Sliders },
    { id: 'audio-quality-noise', name: 'Acoustic & Noise Quality', icon: Mic },
    { id: 'tajweed-prosody', name: 'Tajweed & Prosody', icon: Music },
    { id: 'tempo-duration', name: 'Tempo & Subtitles', icon: Layers },
    { id: 'channels-stereo', name: 'Channels & Stereo', icon: Sliders },
    { id: 'confidence-verification', name: 'Confidence & Gate', icon: ShieldCheck },
    { id: 'qa-governance', name: 'QA & Governance', icon: FileText }
  ];

  const protocolList = protocols?.protocolList || [];

  const filteredProtocols = useMemo(() => {
    return protocolList.filter(item => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchStat = selectedStatus === 'all' || item.status === selectedStatus;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        item.promptNumber.toString().includes(query) ||
        item.urduPrompt.toLowerCase().includes(query) ||
        item.englishTitle.toLowerCase().includes(query) ||
        item.formattedOutput.toLowerCase().includes(query);
      return matchCat && matchStat && matchSearch;
    });
  }, [protocolList, selectedCategory, selectedStatus, searchQuery]);

  const stats = useMemo(() => {
    const total = protocolList.length || 100;
    const pass = protocolList.filter(p => p.status === 'pass').length;
    const flagged = protocolList.filter(p => p.status === 'flagged').length;
    const suggested = protocolList.filter(p => p.status === 'suggested-fix').length;
    const info = protocolList.filter(p => p.status === 'info' || p.status === 'absent').length;
    return { total, pass, flagged, suggested, info };
  }, [protocolList]);

  if (!isOpen) return null;

  const handleCopyReport = () => {
    if (!protocols) return;
    const textLines = [
      `=============================================================`,
      `100 MASTER QURANIC ALIGNMENT PROTOCOLS REPORT`,
      `Surah: ${surahName} | Ayahs Mapped: ${totalAyahs}`,
      `Overall Confidence: ${protocols.overallClipConfidence || 95}%`,
      `Verification Status: ${protocols.verificationStatus?.toUpperCase() || 'AUTOMATIC'}`,
      `=============================================================`,
      ``,
      ...protocolList.map(p => `[Prompt ${p.promptNumber}] ${p.englishTitle}\nUrdu: ${p.urduPrompt}\nResult: ${p.formattedOutput}\nStatus: ${p.status.toUpperCase()}\n`)
    ];
    navigator.clipboard.writeText(textLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl bg-zinc-900 border border-zinc-700/80 shadow-2xl text-zinc-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                100 Master Quranic Alignment Protocols
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  Local Engine Live Pass
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Surah: <span className="text-zinc-200 font-medium">{surahName}</span> &bull; 100 Automated Tajweed, Pacing & Boundary Rule Diagnostics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied Full Report' : 'Copy Report'}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-zinc-950/60 border-b border-zinc-800/80">
          <div className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-400 block">Total Rules</span>
            <span className="text-lg font-bold text-white">{stats.total}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
            <span className="text-[11px] font-medium text-emerald-400 block">Passed / Verified</span>
            <span className="text-lg font-bold text-emerald-400">{stats.pass}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-amber-950/30 border border-amber-800/40">
            <span className="text-[11px] font-medium text-amber-400 block">Flagged / Review</span>
            <span className="text-lg font-bold text-amber-400">{stats.flagged}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-blue-950/30 border border-blue-800/40">
            <span className="text-[11px] font-medium text-blue-400 block">Suggested Fixes</span>
            <span className="text-lg font-bold text-blue-400">{stats.suggested}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-purple-950/30 border border-purple-800/40 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-medium text-purple-400 block">Overall Precision</span>
            <span className="text-lg font-bold text-purple-300">{protocols?.overallClipConfidence || 95}%</span>
          </div>
        </div>

        {/* Controls: Filter & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2 flex-1 min-w-[260px]">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search rule (e.g., A'udhu, Bismillah, tempo, noise, silence)..."
                className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-700/80 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  selectedStatus === 'all' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedStatus('pass')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  selectedStatus === 'pass' ? 'bg-emerald-900/60 text-emerald-300' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Passing ({stats.pass})
              </button>
              <button
                onClick={() => setSelectedStatus('flagged')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  selectedStatus === 'flagged' ? 'bg-amber-900/60 text-amber-300' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Flagged ({stats.flagged})
              </button>
            </div>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-zinc-800/80 bg-zinc-950/40 overflow-x-auto scrollbar-none">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/10'
                    : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Main List of Protocols */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-950/80 scrollbar-thin scrollbar-thumb-zinc-700">
          {filteredProtocols.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertTriangle className="w-10 h-10 text-zinc-600 mb-2" />
              <p className="text-sm font-semibold text-zinc-300">No matching protocols found</p>
              <p className="text-xs text-zinc-500 mt-1">Try clearing your search query or selecting a different category filter.</p>
            </div>
          ) : (
            filteredProtocols.map(item => {
              const isPass = item.status === 'pass';
              const isFlagged = item.status === 'flagged';
              const isSuggested = item.status === 'suggested-fix';
              const isInfo = item.status === 'info' || item.status === 'absent';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isPass
                      ? 'bg-zinc-900/60 border-zinc-800 hover:border-emerald-500/30'
                      : isFlagged
                      ? 'bg-amber-950/20 border-amber-800/50 hover:border-amber-500/50'
                      : isSuggested
                      ? 'bg-blue-950/20 border-blue-800/50 hover:border-blue-500/50'
                      : 'bg-zinc-900/40 border-zinc-800/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-xs shrink-0 ${
                          isPass
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : isFlagged
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : isSuggested
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}
                      >
                        #{item.promptNumber}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-white tracking-wide">
                            {item.englishTitle}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              isPass
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                                : isFlagged
                                ? 'bg-amber-950/60 text-amber-400 border border-amber-800/50'
                                : isSuggested
                                ? 'bg-blue-950/60 text-blue-400 border border-blue-800/50'
                                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>

                        {/* Urdu Prompt */}
                        <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800/80 mb-2.5">
                          <span className="text-[10px] font-semibold uppercase text-zinc-500 block mb-0.5 tracking-wider">
                            Quran Alignment Rule Definition (Urdu Instruction):
                          </span>
                          <p className="text-xs text-amber-200/90 font-medium font-sans leading-relaxed" dir="rtl">
                            {item.urduPrompt}
                          </p>
                        </div>

                        {/* Result Output */}
                        <div className="flex items-start gap-2 text-xs bg-zinc-900/90 p-2.5 rounded-lg border border-zinc-800">
                          <span className="text-zinc-400 font-semibold shrink-0">Evaluated Output:</span>
                          <span className="text-zinc-100 font-mono break-all">{item.formattedOutput}</span>
                        </div>

                        {/* Suggested Fix if any */}
                        {item.fixSuggestion && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-amber-300 bg-amber-950/30 px-3 py-1.5 rounded-lg border border-amber-800/40">
                            <Info className="w-3.5 h-3.5 shrink-0" />
                            <span>Recommendation: {item.fixSuggestion}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-zinc-800 bg-zinc-900/90">
          <div className="text-xs text-zinc-400">
            Showing <span className="text-white font-medium">{filteredProtocols.length}</span> of <span className="text-white font-medium">{protocolList.length}</span> Master Protocols
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-400 text-black transition-all shadow-md shadow-amber-500/10"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
