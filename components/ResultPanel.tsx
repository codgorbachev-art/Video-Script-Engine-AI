
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GenerateResult } from "../types";

interface SectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string;
}

const CollapsibleSection: React.FC<SectionProps> = ({ title, isOpen, onToggle, children, icon, badge }) => (
  <motion.div layout className="border-b border-zinc-800/40 last:border-0">
    <button onClick={onToggle} className="w-full flex flex-col sm:flex-row sm:items-center justify-between px-6 md:px-10 py-8 md:py-10 hover:bg-zinc-800/20 transition-all text-left group gap-4">
      <div className="flex items-center gap-5 md:gap-8 min-w-0">
        <div className={`p-3.5 md:p-4 rounded-2xl md:rounded-3xl transition-all shadow-lg shrink-0 ${isOpen ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-zinc-900 text-zinc-600 border border-zinc-800/50'}`}>{icon}</div>
        <div className="flex flex-col min-w-0">
          <span className={`text-[12px] md:text-[14px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] transition-colors truncate ${isOpen ? 'text-zinc-100' : 'text-zinc-500 group-hover:text-zinc-300'}`}>{title}</span>
          {badge && <span className="text-[8px] md:text-[9px] font-bold text-emerald-500/60 uppercase tracking-widest mt-1 font-mono">{badge}</span>}
        </div>
      </div>
      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className={`shrink-0 self-end sm:self-center ${isOpen ? 'text-emerald-500' : 'text-zinc-700'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
      </motion.div>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
          <div className="px-6 md:px-10 pb-12 md:pb-16 pt-2 text-zinc-300 min-w-0">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

export function ResultPanel(props: {
  loading: boolean;
  error: string | null;
  result: GenerateResult | null;
  onCopy: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ research: true, script: true, shots: true });
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingSteps = [
    "Deep Research: Подключение к базам данных...",
    "Анализ объекта: Идентификация и спецификации...",
    "Market Intel: Сканирование отзывов и болей...",
    "SEO Engine: Подбор триггеров и крючков...",
    "Script Synthesis: Сборка экспертного контента...",
    "Visual Plan: Генерация раскадровки сцен..."
  ];

  useEffect(() => {
    let interval: any;
    if (props.loading) {
      interval = setInterval(() => setLoadingStep(p => (p + 1) % loadingSteps.length), 4000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [props.loading]);

  const handleCopy = () => {
    if (!props.result) return;
    navigator.clipboard.writeText(props.result.scriptMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (props.loading) {
    return (
      <div className="h-full min-h-[450px] md:min-h-[600px] glass-card rounded-[3rem] flex flex-col items-center justify-center p-8 md:p-12 text-center space-y-12 border border-zinc-800/50 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/[0.01] animate-pulse" />
        <div className="relative scale-90 md:scale-100 z-10">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="w-48 h-48 md:w-64 md:h-64 border border-emerald-500/5 rounded-full flex items-center justify-center">
            <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 5, repeat: Infinity }} className="w-32 h-32 md:w-48 md:h-48 border-2 border-dashed border-emerald-500/10 rounded-full" />
          </motion.div>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
             <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping mb-4" />
             <span className="text-emerald-500/40 font-mono text-[9px] font-black uppercase tracking-[0.4em]">PROCESSING</span>
          </div>
        </div>
        <div className="space-y-6 w-full max-w-sm z-10">
          <h3 className="text-lg md:text-xl font-black uppercase tracking-[0.3em] text-white/90">DEEP RESEARCH ENGINE</h3>
          <div className="h-10 overflow-hidden px-4">
            <AnimatePresence mode="wait">
              <motion.p key={loadingStep} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="text-emerald-500/60 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] font-mono leading-tight">{loadingSteps[loadingStep]}</motion.p>
            </AnimatePresence>
          </div>
          <div className="w-full h-1 bg-zinc-900/50 rounded-full overflow-hidden">
             <motion.div initial={{ width: "0%" }} animate={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }} className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981]" />
          </div>
        </div>
      </div>
    );
  }

  if (props.error) {
    return (
      <div className="glass-card rounded-[2.5rem] p-12 text-center border border-rose-500/20 shadow-xl">
        <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 text-rose-500 border border-rose-500/20">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <p className="text-rose-200/60 text-[11px] font-black uppercase tracking-widest">{props.error}</p>
        <button onClick={() => window.location.reload()} className="mt-8 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors underline underline-offset-8">Перезагрузить систему</button>
      </div>
    );
  }

  if (!props.result) {
    return (
      <div className="h-full min-h-[400px] md:min-h-[600px] glass-card rounded-[2.5rem] md:rounded-[3rem] flex flex-col items-center justify-center p-12 opacity-30 text-zinc-700 text-center grayscale border border-zinc-900">
         <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="mb-10"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
         <p className="text-[10px] font-black uppercase tracking-[1em]">SYSTEM_STANDBY</p>
      </div>
    );
  }

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border border-zinc-800/40">
      <div className="p-5 md:p-8 border-b border-zinc-800/50 bg-emerald-500/[0.02] flex flex-col sm:flex-row gap-6 justify-between items-center">
         <div className="flex items-center gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/80 font-mono">Status: Analysis_Finalized</span>
         </div>
         <button onClick={handleCopy} className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${copied ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/40'}`}>
           {copied ? "Скопировано в буфер" : "Скопировать сценарий"}
         </button>
      </div>

      <CollapsibleSection title="Technical Research" isOpen={openSections.research} onToggle={() => setOpenSections(p => ({...p, research: !p.research}))} badge="DATA ANALYTICS" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}>
        <div className="p-6 md:p-10 rounded-[2rem] bg-black/50 border border-emerald-500/10 space-y-8 font-mono relative overflow-hidden group min-w-0">
           <div className="relative z-10 space-y-6">
             <div className="text-[9px] font-black text-emerald-500/50 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> ОБЪЕКТ ИССЛЕДОВАНИЯ
             </div>
             <p className="text-zinc-100 text-[14px] md:text-[15px] leading-relaxed font-bold italic opacity-90">{props.result.extractedText}</p>
           </div>
           
           {props.result.sources && props.result.sources.length > 0 && (
             <div className="pt-8 border-t border-emerald-500/10 relative z-10">
               <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-4">ВЕРИФИЦИРОВАННЫЕ ИСТОЧНИКИ</div>
               <div className="flex flex-wrap gap-2.5">
                 {props.result.sources.map((s, i) => (
                   <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-[9px] font-bold text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-all truncate max-w-[160px] md:max-w-[200px] uppercase tracking-wider">
                     {s.title}
                   </a>
                 ))}
               </div>
             </div>
           )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Pro Script Engine" isOpen={openSections.script} onToggle={() => setOpenSections(p => ({...p, script: !p.script}))} badge="CONTENT DYNAMICS" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>
        <div className="space-y-6 md:space-y-8 min-w-0">
           {props.result.scriptMarkdown.split('\n').map((line, i) => {
             const isHeader = line.startsWith('[') || line.startsWith('#') || line.toUpperCase().includes('АКТ') || line.toUpperCase().includes('СЦЕНА');
             if (!line.trim()) return null;
             return (
               <p key={i} className={`${isHeader ? 'text-emerald-400 font-black mt-10 first:mt-4 mb-6 border-l-[4px] border-emerald-500 pl-6 text-lg md:text-xl uppercase tracking-tight' : 'text-zinc-100 font-semibold text-base md:text-lg leading-relaxed opacity-90'}`}>
                 {line}
               </p>
             );
           })}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Storyboard Visuals" isOpen={openSections.shots} onToggle={() => setOpenSections(p => ({...p, shots: !p.shots}))} badge="SCENE BREAKDOWN" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/></svg>}>
        <div className="space-y-6 md:space-y-10 min-w-0">
          {props.result.shots.map((shot, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-6 md:p-10 rounded-[2rem] bg-zinc-900/40 border border-zinc-800/50 flex flex-col lg:flex-row gap-8 lg:gap-12 hover:bg-zinc-900/60 transition-all group shadow-2xl">
               <div className="lg:w-28 shrink-0 flex items-center lg:flex-col lg:items-start gap-6 lg:gap-0">
                  <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-black font-mono font-black text-[10px] md:text-xs shadow-lg">
                    {shot.t}
                  </div>
                  <div className="flex-1 lg:flex-none w-full h-px lg:w-[2px] lg:h-24 bg-zinc-800 rounded-full mt-5 group-hover:bg-emerald-500/20 transition-all" />
               </div>
               <div className="flex-1 space-y-8 min-w-0">
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em] block font-mono">Визуальный план</span>
                    <p className="text-zinc-100 font-black leading-tight text-lg md:text-xl">{shot.frame}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 pt-2">
                     <div className="p-6 rounded-[1.5rem] md:rounded-[2rem] bg-black/50 border border-zinc-800/40 hover:border-zinc-700/60 transition-all">
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-3 font-mono">Аудио / Диктор</span>
                        <p className="text-[15px] text-zinc-400 font-medium italic leading-relaxed">«{shot.voiceOver}»</p>
                     </div>
                     <div className="p-6 rounded-[1.5rem] md:rounded-[2rem] bg-emerald-500/[0.03] border border-emerald-500/10 hover:border-emerald-500/20 transition-all">
                        <span className="text-[9px] font-black text-emerald-500/40 uppercase tracking-widest block mb-3 font-mono">Графика на экране</span>
                        <p className="text-[15px] text-emerald-100 font-black uppercase tracking-wide leading-tight">{shot.onScreenText}</p>
                     </div>
                  </div>
               </div>
            </motion.div>
          ))}
        </div>
      </CollapsibleSection>
    </motion.div>
  );
}
