
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: "user" | "model";
  text: string;
}

interface BrainstormChatProps {
  currentInput: string;
  onApply: (text: string) => void;
  onClose: () => void;
}

export const BrainstormChat: React.FC<BrainstormChatProps> = ({ currentInput, onApply, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: "Привет! Я твой AI-ассистент. О чем будем снимать? Могу помочь докрутить идею или предложить структуру." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `Ты — креативный ассистент по видео-контенту. Твоя цель: помогать пользователю генерировать виральные идеи для видео. 
          Текущий контекст пользователя: "${currentInput}".
          Отвечай кратко, емко, с фокусом на охваты и удержание. Предлагай конкретные улучшения.`
        }
      });

      // Include history context manually if needed, but chat.sendMessage handles it
      const response = await chat.sendMessage({ message: input });
      const modelText = response.text || "Извини, не смог придумать. Давай еще раз?";
      
      setMessages(prev => [...prev, { role: "model", text: modelText }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "model", text: "Произошла ошибка связи. Проверь API ключ или интернет." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute inset-0 z-50 bg-zinc-950/90 backdrop-blur-xl rounded-[1.5rem] border border-emerald-500/30 flex flex-col overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Brainstorm Assistant</span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-500 hover:text-white transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-lg ${msg.role === 'user' ? 'bg-zinc-800 text-zinc-100' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-50'} `}>
              {msg.text}
            </div>
            {msg.role === 'model' && i > 0 && (
              <button 
                onClick={() => onApply(msg.text)}
                className="mt-2 text-[9px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                Применить в ТЗ
              </button>
            )}
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-1 p-2">
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-zinc-900/80 border-t border-zinc-800 flex gap-3">
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Спроси совета или идеи..."
          className="flex-1 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-2 text-[13px] text-zinc-200 outline-none focus:border-emerald-500/50 transition-all"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-xl bg-emerald-500 text-black flex items-center justify-center disabled:opacity-30 transition-all hover:bg-emerald-400"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="22" y1="2" x2="11" y2="13"/><polyline points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </motion.div>
  );
};
