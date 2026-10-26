import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Heart,
  Activity,
  AlertTriangle,
  BookOpen,
  ExternalLink,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export const ChatbotWidget = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: "👋 Hello! I am your CareBridge AI Healthcare Assistant. Ask me about your health, first-aid measures, clinical triage, or symptoms.",
      citations: [],
      isEmergency: false,
      modelStatus: 'rag_active',
      time: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, loading]);

  if (!user || !['PATIENT', 'GUARDIAN', 'FAMILY_MEMBER'].includes(user.role)) return null;

  const sendMessage = async () => {
    const queryText = input.trim();
    if (!queryText || loading) return;

    const userMsg = { from: 'user', text: queryText, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Connect through Express backend to local FastAPI RAG service
      const res = await axios.post(
        '/api/ai/chat',
        {
          query: queryText,
          userId: user.id || user._id,
          role: user.role
        },
        { timeout: 8000 }
      );

      const data = res.data;
      setMessages((prev) => [
        ...prev,
        {
          from: 'bot',
          text: data.answer,
          citations: data.citations || [],
          isEmergency: Boolean(data.is_emergency),
          modelStatus: data.model_status || 'deterministic_rag_fallback',
          disclaimer: data.disclaimer,
          time: new Date()
        }
      ]);
    } catch (err) {
      // Fallback when FastAPI AI service is offline
      setMessages((prev) => [
        ...prev,
        {
          from: 'bot',
          text: "CareBridge AI Offline Fallback: The local AI inference service is temporarily initializing. For immediate medical guidance, please refer to our verified First-Aid Directory or contact our on-duty verified doctors.",
          citations: [
            {
              title: "CareBridge Clinical Emergency Directory",
              publisher: "CareBridge Health Triage Protocol",
              sourceUrl: "/emergency",
              snippet: "Direct access to emergency hotline numbers and first aid procedures."
            }
          ],
          isEmergency:
            queryText.toLowerCase().includes('chest pain') ||
            queryText.toLowerCase().includes('heart attack'),
          modelStatus: 'offline_fallback',
          time: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setOpen((p) => !p)}
        id="chatbot-toggle-btn"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-400 text-slate-950 font-black shadow-2xl shadow-teal-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition"
        aria-label="Open AI Health Assistant"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 z-50 w-84 sm:w-96 h-[540px] bg-slate-900/95 rounded-3xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden backdrop-blur-xl"
          >
            {/* Header */}
            <div className="bg-slate-950 px-4 py-3.5 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-white font-bold text-xs flex items-center gap-1.5">
                    CareBridge AI Assistant
                    <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[9px] px-1.5 py-0.5 rounded-full font-mono">
                      RAG Verified
                    </span>
                  </p>
                  <p className="text-slate-400 text-[10px]">Grounded Clinical Retrieval</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3.5 py-3.5 space-y-3 bg-slate-950/40">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.from === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                    {msg.from === 'bot' && (
                      <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center mr-1.5 flex-shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.from === 'user'
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-medium rounded-tr-xs shadow-md'
                          : msg.isEmergency
                          ? 'bg-red-950/80 text-red-200 border border-red-500 rounded-tl-xs shadow-md'
                          : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-xs shadow-sm'
                      }`}
                    >
                      {msg.isEmergency && (
                        <div className="flex items-center gap-1.5 text-red-400 font-black mb-1.5 pb-1 border-b border-red-800">
                          <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
                          <span>EMERGENCY DIRECTIVE</span>
                        </div>
                      )}
                      {msg.text}

                      {/* Citations list */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-700/60 text-[10px]">
                          <p className="font-bold text-teal-300 mb-1 flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-teal-400" />
                            Clinical Literature Citations:
                          </p>
                          <div className="space-y-1">
                            {msg.citations.map((c, ci) => (
                              <div
                                key={ci}
                                className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800 text-slate-300"
                              >
                                <span className="font-bold text-teal-400">{c.title}</span> ({c.publisher})
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center space-x-2 pl-1">
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex space-x-1.5 bg-slate-800 px-3.5 py-2.5 rounded-2xl border border-slate-700">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${d * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Safety Disclaimer Banner */}
            <div className="bg-amber-950/60 px-3 py-1.5 border-t border-amber-800/60 text-[10px] text-amber-200 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                Informational tool only. Not a medical doctor.
              </span>
              <a href="/emergency" className="font-bold underline text-amber-300 flex items-center gap-1">
                <PhoneCall className="w-3 h-3" />
                SOS
              </a>
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-800 flex-shrink-0 bg-slate-950">
              <div className="flex items-center space-x-2 bg-slate-900 rounded-xl border border-slate-800 px-3 py-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask about symptoms, burns, fever, choking…"
                  className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                  id="chatbot-input"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="w-7 h-7 bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-950 rounded-lg flex items-center justify-center font-bold hover:scale-105 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  id="chatbot-send-btn"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
