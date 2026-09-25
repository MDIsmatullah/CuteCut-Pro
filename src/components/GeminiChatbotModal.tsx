import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  Trash2,
  Copy,
  Check,
  Bot,
  User,
  Zap,
  Film,
  Compass,
  Settings,
  RefreshCw,
  Sliders,
  ChevronDown,
  Info
} from 'lucide-react';
import { CuteCutProPaywallModal } from './CuteCutProPaywallModal';
import { ProLicenseService } from '../services/proLicenseService';

export type ChatRoleType = 'general' | 'director' | 'fast_editor';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  modelUsed?: string;
}

interface GeminiChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTextToTimeline?: (text: string) => void;
}

const ROLE_CONFIGS: Record<
  ChatRoleType,
  {
    name: string;
    model: 'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite';
    badge: string;
    icon: typeof Film;
    color: string;
    description: string;
    defaultSystemInstruction: string;
    promptSuggestions: string[];
  }
> = {
  director: {
    name: 'Cinematic Director (Complex Tasks)',
    model: 'gemini-3.1-pro-preview',
    badge: 'Pro Reasoning',
    icon: Film,
    color: 'from-amber-500 to-orange-500',
    description: 'Deep narrative analysis, cinematic lighting, color grading palettes, and multi-scene pacing.',
    defaultSystemInstruction:
      'You are the Executive Video Director & Master Cinematographer in CuteCut Pro video editor. You specialize in complex video production tasks: narrative pacing, storyboard architecture, color grading palettes, deep emotional engagement, shot composition, lighting design, and audio-visual synthesis. Give structured, professional, deeply reasoned guidance with step-by-step breakdowns.',
    promptSuggestions: [
      'Analyze storyboard pacing for a 60s documentary',
      'Suggest a warm cinematic color grading palette',
      'Plan camera angles and visual hooks for Ayah recitation',
      'How to structure dramatic sound design tension?'
    ]
  },
  general: {
    name: 'Video Producer (General Tasks)',
    model: 'gemini-3.5-flash',
    badge: 'Balanced & Creative',
    icon: Compass,
    color: 'from-cyan-500 to-blue-500',
    description: 'General video ideas, creative scripts, caption styles, transitions, and social media formats.',
    defaultSystemInstruction:
      'You are the Creative Video Producer & Content Assistant in CuteCut Pro video editor. You help creators craft viral TikToks, YouTube videos, Instagram Reels, Quran recitations, and documentaries. You provide engaging video hooks, script outlines, caption styles, stock footage ideas, and pacing advice. Maintain a friendly, supportive, and creative tone.',
    promptSuggestions: [
      'Write a 30-second viral Reels hook and script outline',
      'Recommend stock footage keywords for peaceful nature',
      'How to create aesthetic animated text titles?',
      'Tips to increase YouTube Shorts retention rate'
    ]
  },
  fast_editor: {
    name: 'Quick Editor (Fast Tasks)',
    model: 'gemini-3.1-flash-lite',
    badge: 'Ultra Fast',
    icon: Zap,
    color: 'from-emerald-400 to-teal-500',
    description: 'Lightning-fast shortcut guidance, quick trims, blade cuts, and instant timeline actions.',
    defaultSystemInstruction:
      'You are the Ultra-Fast Video Assistant & Shortcut Copilot in CuteCut Pro video editor. Your primary focus is speed, rapid tips, keyboard shortcuts (S for split at playhead, Space for play/pause, M for mute, V for select, Delete for remove, Ctrl+Z for undo, Ctrl+B for blade cut), quick format recommendations, and immediate punchy video advice. Keep your answers brief, actionable, and straight to the point.',
    promptSuggestions: [
      'What are the fastest timeline cutting shortcuts?',
      'Quick rule for optimal audio dB levels',
      'Best aspect ratio for multi-platform posting',
      'How to quickly split and ripple delete gaps?'
    ]
  }
};

export const GeminiChatbotModal: React.FC<GeminiChatbotModalProps> = ({
  isOpen,
  onClose,
  onAddTextToTimeline
}) => {
  const [selectedRole, setSelectedRole] = useState<ChatRoleType>('general');
  const [customSystemInstruction, setCustomSystemInstruction] = useState<string>('');
  const [showSystemConfig, setShowSystemConfig] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const licenseService = ProLicenseService.getInstance();

  // Initial welcome message per role
  const getInitialMessages = (role: ChatRoleType): ChatMessage[] => [
    {
      id: 'init-1',
      role: 'model',
      content: `Salam and welcome! I am your **${ROLE_CONFIGS[role].name}** powered by \`${ROLE_CONFIGS[role].model}\`.\n\n${ROLE_CONFIGS[role].description}\n\nHow can I help you elevate your video today?`,
      timestamp: Date.now(),
      modelUsed: ROLE_CONFIGS[role].model
    }
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('cutecut_gemini_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return getInitialMessages('general');
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  // Persist messages in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cutecut_gemini_chat_history', JSON.stringify(messages));
    } catch {
      // storage quota or private browsing
    }
  }, [messages]);

  if (!isOpen) return null;

  const currentConfig = ROLE_CONFIGS[selectedRole];
  const activeInstruction = customSystemInstruction.trim() || currentConfig.defaultSystemInstruction;

  const handleRoleChange = (newRole: ChatRoleType) => {
    setSelectedRole(newRole);
    setCustomSystemInstruction('');
    // Add notice of role switch to thread
    const switchNotice: ChatMessage = {
      id: `switch-${Date.now()}`,
      role: 'model',
      content: `🔄 **Switched role to ${ROLE_CONFIGS[newRole].name}** (\`${ROLE_CONFIGS[newRole].model}\`).\n\n${ROLE_CONFIGS[newRole].description}`,
      timestamp: Date.now(),
      modelUsed: ROLE_CONFIGS[newRole].model
    };
    setMessages((prev) => [...prev, switchNotice]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    if (!licenseService.hasAccess()) {
      setShowPaywall(true);
      return;
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send conversation history to server-side Gemini endpoint
      const payloadMessages = newMessages.slice(-12).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          model: currentConfig.model,
          role: selectedRole,
          systemInstruction: activeInstruction
        })
      });

      const data = await res.json();
      const replyText = data.reply || data.error || 'No response received.';
      const usedModel = data.model || currentConfig.model;

      const aiMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: replyText,
        timestamp: Date.now(),
        modelUsed: usedModel
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `⚠️ Failed to connect to Gemini: ${err.message || 'Network error'}. Please check your connection or switch models.`,
        timestamp: Date.now(),
        modelUsed: currentConfig.model
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    const initial = getInitialMessages(selectedRole);
    setMessages(initial);
    try {
      localStorage.removeItem('cutecut_gemini_chat_history');
    } catch {
      // ignore
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-4xl h-[90vh] max-h-[820px] bg-[#121218] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#171720] border-b border-gray-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${currentConfig.color} flex items-center justify-center shadow-lg text-black font-bold`}>
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">Gemini Chatbot Copilot</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                  {currentConfig.model}
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-medium bg-purple-950/80 text-purple-300 border border-purple-800/40 hidden sm:inline-block">
                  {currentConfig.badge}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 truncate max-w-md">
                Multi-turn conversation assistant for video editing, storytelling, & timeline workflows
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSystemConfig(!showSystemConfig)}
              className={`p-2 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
                showSystemConfig
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-[#1e1e28] text-gray-400 hover:text-white border-gray-700/60'
              }`}
              title="Configure Role & System Instructions"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Role Config</span>
            </button>

            <button
              onClick={handleClearHistory}
              className="p-2 rounded-lg text-xs font-medium bg-[#1e1e28] text-gray-400 hover:text-red-400 border border-gray-700/60 transition flex items-center gap-1.5"
              title="Clear Conversation History"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/80 transition"
              title="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-[#14141d] border-b border-gray-800/60 overflow-x-auto text-xs shrink-0">
          <span className="text-gray-500 font-bold uppercase text-[9px] tracking-wider px-2">Role:</span>
          {(Object.keys(ROLE_CONFIGS) as ChatRoleType[]).map((roleKey) => {
            const cfg = ROLE_CONFIGS[roleKey];
            const isSelected = selectedRole === roleKey;
            const Icon = cfg.icon;
            return (
              <button
                key={roleKey}
                onClick={() => handleRoleChange(roleKey)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition text-xs whitespace-nowrap ${
                  isSelected
                    ? 'bg-gradient-to-r ' + cfg.color + ' text-black font-bold shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-[#1f1f2b]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-gray-400'}`} />
                <span>{cfg.name.split(' (')[0]}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${isSelected ? 'bg-black/20 text-black' : 'bg-gray-800 text-gray-400'}`}>
                  {cfg.model.replace('-preview', '')}
                </span>
              </button>
            );
          })}
        </div>

        {/* System Instruction Collapsible Drawer */}
        {showSystemConfig && (
          <div className="px-5 py-3.5 bg-[#191924] border-b border-gray-800 animate-in slide-in-from-top-2 duration-150 shrink-0 text-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Sliders className="w-3.5 h-3.5" />
                <span>Active System Instruction for Role ({currentConfig.name})</span>
              </div>
              <button
                onClick={() => setCustomSystemInstruction(currentConfig.defaultSystemInstruction)}
                className="text-[10px] text-gray-400 hover:text-cyan-300 underline"
              >
                Reset to Default
              </button>
            </div>
            <textarea
              value={customSystemInstruction || currentConfig.defaultSystemInstruction}
              onChange={(e) => setCustomSystemInstruction(e.target.value)}
              rows={3}
              className="w-full bg-[#111118] border border-gray-700/80 rounded-lg p-2.5 text-gray-200 text-xs focus:outline-hidden focus:border-cyan-500 font-mono resize-none"
              placeholder="Define customized instructions for the Gemini chatbot persona..."
            />
            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
              <Info className="w-3 h-3 text-cyan-400" />
              The chatbot remembers multi-turn context and uses this system instruction to shape its recommendations.
            </p>
          </div>
        )}

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-sm scrollbar-thin scrollbar-thumb-gray-800">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[88%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                    isUser
                      ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white'
                      : `bg-gradient-to-tr ${currentConfig.color} text-black font-bold`
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-white" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`group relative rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-cyan-600/90 text-white rounded-tr-none shadow-md shadow-cyan-900/20'
                      : 'bg-[#1b1b26] text-gray-200 border border-gray-800/80 rounded-tl-none shadow-md'
                  }`}
                >
                  {/* Top Model Badge for Assistant */}
                  {!isUser && (
                    <div className="flex items-center justify-between gap-3 pb-2 mb-2 border-b border-gray-800/60 text-[10px] text-gray-400">
                      <span className="font-mono text-cyan-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        {msg.modelUsed || currentConfig.model}
                      </span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}

                  {/* Body Text */}
                  <div className="whitespace-pre-wrap font-sans break-words space-y-2">
                    {msg.content}
                  </div>

                  {/* Action Bar inside Bubble */}
                  {!isUser && (
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-800/50 text-[10px] opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="flex items-center gap-1 text-gray-400 hover:text-cyan-300 transition px-2 py-0.5 rounded bg-black/20 hover:bg-black/40"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      {onAddTextToTimeline && (
                        <button
                          onClick={() => onAddTextToTimeline(msg.content)}
                          className="flex items-center gap-1 text-gray-400 hover:text-purple-300 transition px-2 py-0.5 rounded bg-black/20 hover:bg-black/40"
                          title="Add message content as a title clip on timeline"
                        >
                          <span>+ Add to Timeline</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${currentConfig.color} flex items-center justify-center shrink-0`}>
                <Bot className="w-4 h-4 text-white animate-spin" />
              </div>
              <div className="bg-[#1b1b26] border border-gray-800/80 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2 text-xs text-cyan-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{currentConfig.name} is thinking with {currentConfig.model}...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Suggestions Chips */}
        <div className="px-4 py-2 bg-[#15151e] border-t border-gray-800/60 overflow-x-auto shrink-0 flex items-center gap-2">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Quick Ideas:
          </span>
          {currentConfig.promptSuggestions.map((prompt, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] whitespace-nowrap bg-[#1c1c28] hover:bg-[#252535] text-gray-300 hover:text-white px-2.5 py-1 rounded-full border border-gray-800 hover:border-cyan-500/50 transition cursor-pointer shrink-0 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Bottom Input Area */}
        <div className="p-3 sm:p-4 bg-[#171720] border-t border-gray-800/80 shrink-0">
          <div className="relative flex items-center gap-2">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={2}
              placeholder={`Ask ${currentConfig.name} about timeline pacing, transitions, scripts, or shortcuts... (Enter to send, Shift+Enter for newline)`}
              className="w-full bg-[#111116] border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-200 placeholder-gray-500 focus:outline-hidden focus:border-cyan-500 font-sans resize-none scrollbar-thin"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className={`h-full px-4 rounded-xl font-bold flex items-center justify-center transition shadow-lg shrink-0 ${
                inputMessage.trim() && !isLoading
                  ? 'bg-gradient-to-r ' + currentConfig.color + ' text-black hover:opacity-90 cursor-pointer'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] text-gray-500">
            <span>Powered by Gemini 3 (@google/genai SDK) • Multi-turn active session</span>
            <span>Active model: <strong className="text-gray-400">{currentConfig.model}</strong></span>
          </div>
        </div>
      </div>

      <CuteCutProPaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        featureName="Gemini AI Copilot"
      />
    </div>
  );
};
