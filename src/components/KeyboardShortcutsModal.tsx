import React, { useState, useEffect, useMemo } from 'react';
import {
  Keyboard,
  X,
  Search,
  Play,
  Scissors,
  Copy,
  Trash2,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Command,
  Save,
  HelpCircle,
  Merge,
  FolderPlus,
  FolderMinus,
  Clipboard,
  MousePointer,
} from 'lucide-react';

interface ShortcutItem {
  id: string;
  keys: string[];
  description: string;
  category: 'playback' | 'editing' | 'timeline' | 'general';
  icon?: React.ReactNode;
}

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUT_LIST: ShortcutItem[] = [
  // Playback & Navigation
  {
    id: 'play-pause',
    keys: ['Space'],
    description: 'Play or pause video playback',
    category: 'playback',
    icon: <Play className="w-3.5 h-3.5 text-emerald-400" />,
  },
  {
    id: 'step-back',
    keys: ['←'],
    description: 'Step backward 1 frame (1/30s precision)',
    category: 'playback',
    icon: <ChevronLeft className="w-3.5 h-3.5 text-cyan-400" />,
  },
  {
    id: 'step-forward',
    keys: ['→'],
    description: 'Step forward 1 frame (1/30s precision)',
    category: 'playback',
    icon: <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />,
  },

  // Editing & Trimming
  {
    id: 'split-clip',
    keys: ['Ctrl', 'B'],
    description: 'Split selected clip at current playhead',
    category: 'editing',
    icon: <Scissors className="w-3.5 h-3.5 text-amber-400" />,
  },
  {
    id: 'merge-clips',
    keys: ['Ctrl', 'M'],
    description: 'Merge selected adjacent text clips into one',
    category: 'editing',
    icon: <Merge className="w-3.5 h-3.5 text-purple-400" />,
  },
  {
    id: 'duplicate-clip',
    keys: ['Ctrl', 'D'],
    description: 'Duplicate selected clip directly on track',
    category: 'editing',
    icon: <Copy className="w-3.5 h-3.5 text-blue-400" />,
  },
  {
    id: 'delete-clip',
    keys: ['Del', 'Backspace'],
    description: 'Delete selected clip from timeline',
    category: 'editing',
    icon: <Trash2 className="w-3.5 h-3.5 text-red-400" />,
  },
  {
    id: 'ripple-left',
    keys: ['Q'],
    description: 'Ripple trim head of clip up to playhead',
    category: 'editing',
    icon: <Scissors className="w-3.5 h-3.5 text-teal-400" />,
  },
  {
    id: 'ripple-right',
    keys: ['W'],
    description: 'Ripple trim tail of clip down to playhead',
    category: 'editing',
    icon: <Scissors className="w-3.5 h-3.5 text-teal-400" />,
  },

  // Timeline & Navigation
  {
    id: 'zoom-in',
    keys: ['Ctrl', '+'],
    description: 'Zoom in timeline scale',
    category: 'timeline',
    icon: <ZoomIn className="w-3.5 h-3.5 text-purple-400" />,
  },
  {
    id: 'zoom-out',
    keys: ['Ctrl', '-'],
    description: 'Zoom out timeline scale',
    category: 'timeline',
    icon: <ZoomOut className="w-3.5 h-3.5 text-purple-400" />,
  },
  {
    id: 'undo',
    keys: ['Ctrl', 'Z'],
    description: 'Undo last timeline edit or operation',
    category: 'timeline',
    icon: <Undo2 className="w-3.5 h-3.5 text-amber-400" />,
  },
  {
    id: 'redo',
    keys: ['Ctrl', 'Y'],
    description: 'Redo previously undone action',
    category: 'timeline',
    icon: <Redo2 className="w-3.5 h-3.5 text-amber-400" />,
  },

  // General & System
  {
    id: 'save-project',
    keys: ['Ctrl', 'S'],
    description: 'Save project to Cloud Firestore or Local File',
    category: 'general',
    icon: <Save className="w-3.5 h-3.5 text-cyan-400" />,
  },
  {
    id: 'help-modal',
    keys: ['?'],
    description: 'Open this Keyboard Shortcuts cheat-sheet',
    category: 'general',
    icon: <Keyboard className="w-3.5 h-3.5 text-emerald-400" />,
  },
  {
    id: 'close-modal',
    keys: ['Esc'],
    description: 'Close active dialog or cancel selection',
    category: 'general',
    icon: <X className="w-3.5 h-3.5 text-gray-400" />,
  },
];

const CATEGORY_NAMES = {
  playback: 'Playback & Scrubbing',
  editing: 'Editing & Clip Actions',
  timeline: 'Timeline Navigation & History',
  general: 'General & Shortcuts',
};

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredShortcuts = useMemo(() => {
    return SHORTCUT_LIST.filter((item) => {
      const matchesCategory =
        activeCategory === 'all' || item.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesQuery =
        item.description.toLowerCase().includes(q) ||
        item.keys.some((k) => k.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, activeCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-[#101016] border border-[#2a2a3e] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#202030] bg-[#14141e]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 rounded-xl text-cyan-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Keyboard Shortcuts
                <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Quick Reference
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Speed up your video editing workflow with hotkeys & shortcuts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800/80 rounded-lg transition"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 border-b border-[#1c1c28] bg-[#0c0c12] space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shortcuts (e.g. play, split, undo, ctrl+z)..."
              className="w-full bg-[#161622] border border-[#28283c] focus:border-cyan-500/50 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All Shortcuts' },
              { id: 'playback', label: 'Playback' },
              { id: 'editing', label: 'Editing' },
              { id: 'timeline', label: 'Timeline & History' },
              { id: 'general', label: 'General' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 text-[11px] rounded-lg font-medium transition cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-cyan-500 text-black font-bold shadow-sm shadow-cyan-500/20'
                    : 'bg-[#181824] hover:bg-[#202030] text-gray-400 hover:text-gray-200 border border-[#242436]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Shortcut List Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {filteredShortcuts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No shortcuts match your search query.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="mt-2 text-xs text-cyan-400 hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            (activeCategory === 'all'
              ? (['playback', 'editing', 'timeline', 'general'] as const)
              : [activeCategory as keyof typeof CATEGORY_NAMES]
            ).map((catKey) => {
              const groupItems = filteredShortcuts.filter(
                (item) => item.category === catKey
              );
              if (groupItems.length === 0) return null;

              return (
                <div key={catKey} className="space-y-2">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    {CATEGORY_NAMES[catKey as keyof typeof CATEGORY_NAMES]}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {groupItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2.5 bg-[#14141e] hover:bg-[#181826] border border-[#202030] hover:border-[#303046] rounded-xl transition group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div className="p-1.5 rounded-lg bg-[#0e0e16] border border-[#222232] group-hover:border-cyan-500/30 transition shrink-0">
                            {item.icon}
                          </div>
                          <span className="text-xs text-gray-300 group-hover:text-white font-medium truncate">
                            {item.description}
                          </span>
                        </div>

                        {/* Keys Badge */}
                        <div className="flex items-center gap-1 shrink-0">
                          {item.keys.map((k, idx) => (
                            <React.Fragment key={idx}>
                              {idx > 0 && (
                                <span className="text-[10px] text-gray-600 font-mono">
                                  +
                                </span>
                              )}
                              <kbd className="px-2 py-0.5 bg-[#1e1e2c] border border-[#34344a] text-cyan-300 font-mono text-[11px] font-bold rounded shadow-sm">
                                {k}
                              </kbd>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Tip */}
        <div className="px-6 py-3 border-t border-[#1c1c28] bg-[#0e0e14] flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              Tip: Press <kbd className="px-1.5 py-0.5 bg-[#1c1c26] text-gray-300 font-mono text-[10px] rounded border border-gray-700">?</kbd> anywhere to open this helper.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1c1c28] hover:bg-[#242436] text-gray-200 text-xs font-semibold rounded-lg transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
