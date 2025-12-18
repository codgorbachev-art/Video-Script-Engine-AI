import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ResultPanel(props: {
  loading: boolean;
  error: string | null;
  markdown: string;
  onCopy: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    props.onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group h-full flex flex-col rounded-[2.5rem] border border-white/10 bg-zinc-900/80 backdrop-blur-3xl shadow-2xl overflow-hidden relative">
      {/* Optional: Subtle gradient glow inside the panel */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
           <div className={`h-2 w-2 rounded-full ring-2 ring-offset-2 ring-offset-zinc-900 transition-all duration-500 ${props.loading ? "bg-emerald-500 ring-emerald-500/50 animate-pulse" : props.markdown ? "bg-emerald-400 ring-emerald-400/20" : "bg-zinc-700 ring-zinc-700/50"}`}></div>
           <span className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest">
             {props.loading ? "Генерация..." : "Сценарий"}
           </span>
        </div>
        
        <button
          type="button"
          onClick={handleCopy}
          disabled={!props.markdown || props.loading}
          className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed group/btn"
        >
          <span className={`flex items-center gap-2 transition-transform duration-300 ${copied ? "-translate-y-8" : "translate-y-0"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Копировать
          </span>
          <span className={`absolute inset-0 flex items-center justify-center gap-2 text-emerald-400 transition-transform duration-300 ${copied ? "translate-y-0" : "translate-y-8"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Скопировано
          </span>
        </button>
      </div>

      {/* Content Area */}
      <div className="relative z-10 flex-1 p-0 overflow-y-auto custom-scrollbar bg-black/20">
        {props.loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full space-y-8 p-10"
          >
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-t-2 border-emerald-500 rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-r-2 border-emerald-500/50 rounded-full animate-spin duration-[1.5s]"></div>
              <div className="absolute inset-4 border-l-2 border-emerald-500/30 rounded-full animate-spin duration-[2s]"></div>
            </div>
            <div className="text-center space-y-3">
              <p className="text-lg font-medium text-zinc-200">Пишу сценарий...</p>
              <div className="flex flex-col gap-1 text-xs text-zinc-500 font-mono uppercase tracking-wider">
                <span className="animate-pulse">Анализ контекста</span>
                <span className="animate-pulse delay-75">Подбор хуков</span>
                <span className="animate-pulse delay-150">Структурирование кадров</span>
              </div>
            </div>
          </motion.div>
        ) : props.error ? (
          <div className="h-full flex items-center justify-center p-10">
             <div className="max-w-sm text-center space-y-4 p-8 rounded-3xl bg-rose-500/5 border border-rose-500/10">
                <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto text-rose-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                </div>
                <div>
                  <p className="text-base font-bold text-rose-200">Ошибка генерации</p>
                  <p className="text-sm text-rose-300/60 mt-2 leading-relaxed">{props.error}</p>
                </div>
             </div>
          </div>
        ) : props.markdown ? (
          <div className="min-h-full p-8 md:p-10">
            <pre className="whitespace-pre-wrap font-sans text-[15px] md:text-[16px] leading-8 text-zinc-100 tracking-normal">
              {props.markdown}
            </pre>
            
            {/* Footer hint */}
            <div className="mt-12 pt-8 border-t border-white/5 text-center">
                <p className="text-xs text-zinc-600">
                    Совет: Скопируйте текст в Google Docs или Notion для дальнейшей работы.
                </p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600/50 select-none space-y-6 p-10">
            <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
                <div className="relative p-6 rounded-[2rem] bg-zinc-900 border border-zinc-800 shadow-xl">
                   <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 group-hover:text-emerald-400 transition-colors duration-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
            </div>
            <div className="text-center space-y-2">
                <p className="text-base font-medium text-zinc-400">Результат появится здесь</p>
                <p className="text-sm text-zinc-600 max-w-[200px] mx-auto">
                    Заполните параметры слева и нажмите «Сгенерировать»
                </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}