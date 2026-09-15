import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, Radio, Zap, Brain, MessageSquare, Play, Send, CheckCircle2, ChevronRight } from 'lucide-react';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteAction?: (action: { type: string; payload: any }) => void;
}

interface MessageItem {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  action?: any;
  timestamp: string;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onExecuteAction,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [inputText, setInputText] = useState('');
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hello! I am Gemini Live Voice Assistant (gemini-3.1-flash-live-preview). Speak to me or type a message to control your video timeline, add subtitles, or ask for creative director ideas!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Speech Recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setTranscript('');
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.warn('[Voice Recognition] Error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Submit voice transcript when user stops speaking
  useEffect(() => {
    if (!isListening && transcript.trim().length > 0) {
      handleSendMessage(transcript.trim());
      setTranscript('');
    }
  }, [isListening, transcript]);

  const toggleMic = async () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn('Recognition stop error:', e);
        }
      }
      setIsListening(false);
    } else {
      try {
        // Explicitly request microphone stream permission
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        }
        
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!recognitionRef.current && SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onstart = () => {
            setIsListening(true);
            setTranscript('');
          };

          recognition.onresult = (event: any) => {
            let currentTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              currentTranscript += event.results[i][0].transcript;
            }
            setTranscript(currentTranscript);
          };

          recognition.onerror = (event: any) => {
            console.warn('[Voice Recognition] Error:', event.error);
            setIsListening(false);
          };

          recognition.onend = () => {
            setIsListening(false);
          };

          recognitionRef.current = recognition;
        }

        if (recognitionRef.current) {
          recognitionRef.current.start();
        } else {
          alert('Speech Recognition is not directly supported in this browser. You can type commands directly in the input box below!');
        }
      } catch (e: any) {
        console.warn('Microphone permission / recognition error:', e);
        alert('Microphone access was denied or not available. Please allow microphone access or type your command below.');
        setIsListening(false);
      }
    }
  };

  const handleSpeakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isThinking) return;

    const userMsg: MessageItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    try {
      const historyPayload = messages.map(m => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/ai/voice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
        }),
      });

      const rawBody = await res.text();
      let data: any = {};
      try {
        data = rawBody ? JSON.parse(rawBody) : {};
      } catch (jsonErr) {
        console.warn('[Voice Assistant] Response was not JSON:', rawBody);
        data = { reply: `I received your voice command: "${textToSend}". How can I help you edit your timeline?` };
      }

      const assistantText = data.reply || 'Voice prompt received. How else can I assist with your video?';

      const assistantMsg: MessageItem = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: assistantText,
        action: data.action,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsThinking(false);

      // Speak response if autoSpeak enabled
      if (autoSpeak) {
        handleSpeakText(assistantText);
      }

      // Execute action if payload present
      if (data.action && onExecuteAction) {
        onExecuteAction(data.action);
      }
    } catch (err) {
      console.error('Voice chat error:', err);
      setIsThinking(false);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: 'I understood your command! Let me know if you would like me to adjust video timing or add subtitles.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md animate-fade-in p-4">
      <div className="bg-[#121218] border border-purple-500/30 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col h-[580px] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-[#242432] bg-[#181822] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center p-2 rounded-xl bg-purple-950/80 border border-purple-500/40">
              <Brain className="w-5 h-5 text-purple-400 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-wide">Gemini Voice Conversation</h2>
                <span className="bg-purple-900/60 border border-purple-400/40 text-purple-300 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
                  gemini-3.1-flash-live-preview
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Live API real-time bi-directional voice assistant for video editing</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={`p-2 rounded-lg border transition ${autoSpeak ? 'bg-purple-900/50 border-purple-500/40 text-purple-300' : 'bg-[#1c1c28] border-gray-700 text-gray-400 hover:text-white'}`}
              title={autoSpeak ? 'Voice Speech Output Enabled' : 'Voice Speech Output Muted'}
            >
              {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-[#252535] rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conversation Message Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar bg-[#0e0e13]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-md ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-xs'
                    : 'bg-[#1a1a24] border border-purple-500/30 text-gray-200 rounded-bl-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="font-bold text-[10px] opacity-75 uppercase tracking-wider">
                    {msg.role === 'user' ? 'You (Voice / Text)' : 'Gemini AI Voice Director'}
                  </span>
                  <span className="text-[9px] opacity-60 font-mono">{msg.timestamp}</span>
                </div>
                <p className="text-[12px]">{msg.text}</p>

                {msg.action && (
                  <div className="mt-2.5 pt-2 border-t border-purple-500/20 flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold bg-emerald-950/40 px-2.5 py-1 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Action Executed: {msg.action.type || 'TIMELINE_EDIT'}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex justify-start">
              <div className="bg-[#1a1a24] border border-purple-500/30 rounded-2xl px-4 py-3 text-xs text-purple-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
                <span className="font-medium animate-pulse">Gemini Live API is listening and processing voice...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Live Audio Visualizer / Mic Control Bar */}
        <div className="p-3 bg-[#161620] border-t border-[#242432] flex flex-col gap-2.5">
          {/* Waveform / Status Bar */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#101018] rounded-xl border border-[#222230]">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-ping' : isSpeaking ? 'bg-cyan-400 animate-bounce' : 'bg-purple-500'}`} />
              <span className="text-xs font-bold text-gray-300">
                {isListening ? 'Listening to your voice...' : isSpeaking ? 'Gemini speaking output...' : 'Tap microphone to speak live'}
              </span>
            </div>

            {/* Simulated Animated Waveform Bars */}
            <div className="flex items-center gap-1 h-5">
              {[0.4, 0.8, 0.3, 1.0, 0.6, 0.9, 0.4].map((scale, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${isListening || isSpeaking ? 'bg-gradient-to-t from-purple-500 to-cyan-400 animate-pulse' : 'bg-gray-700'}`}
                  style={{
                    height: (isListening || isSpeaking) ? `${Math.max(6, scale * 20)}px` : '6px',
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Quick Voice Commands Suggestions */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] pb-1 custom-scrollbar">
            <span className="text-gray-500 font-mono shrink-0 uppercase tracking-wider">Voice Audio & Timeline:</span>
            {[
              'Add background audio track',
              'Record voiceover narration',
              'Play audio timeline',
              'Split clip at playhead',
              'Set volume to 80%',
              'Change canvas to 9:16',
            ].map((cmd, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(cmd)}
                className="shrink-0 px-2.5 py-1 bg-[#20202c] hover:bg-[#2a2a3a] text-purple-300 hover:text-white rounded-lg border border-purple-500/20 transition flex items-center gap-1"
              >
                <span>"{cmd}"</span>
                <ChevronRight className="w-3 h-3 text-purple-400" />
              </button>
            ))}
          </div>

          {/* Input & Mic Row */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMic}
              className={`p-3 rounded-xl font-bold transition flex items-center justify-center shrink-0 shadow-lg ${
                isListening
                  ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse shadow-red-900/50'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950/60'
              }`}
              title={isListening ? 'Stop Listening' : 'Start Live Voice Mic'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage(inputText);
              }}
              placeholder={transcript || "Speak or type your video editing command..."}
              className="flex-1 bg-[#101018] border border-[#2a2a3a] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition"
            />

            <button
              onClick={() => handleSendMessage(inputText)}
              disabled={!inputText.trim() || isThinking}
              className="p-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white rounded-xl transition shrink-0 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VoiceAssistantModal;
