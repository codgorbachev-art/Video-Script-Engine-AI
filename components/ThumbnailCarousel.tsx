
import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { generateThumbnailVisual } from "../services/geminiService";

interface ThumbnailCarouselProps {
  ideas: string[];
}

interface ThumbnailCardProps {
  idea: string;
  index: number;
  visual?: string;
  isLoading: boolean;
  error: string | null;
  onVisualize: () => void;
  onDownload: () => void;
}

const ThumbnailCard: React.FC<ThumbnailCardProps> = ({ 
  idea, 
  index, 
  visual, 
  isLoading, 
  error, 
  onVisualize, 
  onDownload 
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 200 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const rotateX = useTransform(y, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-8, 8]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((event.clientX - (rect.left + rect.width / 2)) / rect.width);
    mouseY.set((event.clientY - (rect.top + rect.height / 2)) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div className="shrink-0 py-4 snap-start scroll-ml-6 md:scroll-ml-0">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileHover={{ y: -6 }}
        className="w-[300px] sm:w-[340px] md:w-[400px] rounded-[2.5rem] bg-zinc-900/50 border border-zinc-800/60 backdrop-blur-xl overflow-hidden flex flex-col group transition-all relative shadow-2xl"
      >
        <div className="aspect-video bg-black relative overflow-hidden flex items-center justify-center">
          <AnimatePresence mode="wait">
            {visual ? (
              <motion.div key="img" className="w-full h-full relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <img src={visual} className="w-full h-full object-cover select-none" alt="Thumbnail" />
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-center items-center p-8 gap-4">
                    <button onClick={onDownload} className="w-full py-3.5 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Скачать 1K HD</button>
                    <button onClick={onVisualize} className="w-full py-3 rounded-2xl bg-zinc-900/80 text-zinc-400 font-bold text-[9px] uppercase tracking-widest border border-zinc-800 hover:text-white transition-all">Обновить генерацию</button>
                </div>
              </motion.div>
            ) : isLoading ? (
              <div className="flex flex-col items-center gap-5">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-10 h-10 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest font-mono">RENDERING...</span>
              </div>
            ) : error ? (
              <button onClick={onVisualize} className="text-rose-400 font-black text-[10px] uppercase tracking-widest flex flex-col items-center gap-3">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                 Ошибка. Повторить?
              </button>
            ) : (
              <button onClick={onVisualize} className="bg-white text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">Визуализировать</button>
            )}
          </AnimatePresence>
        </div>
        
        <div className="p-8 space-y-4 bg-zinc-900/30 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] font-mono">Concept {index + 1}</span>
              <div className={`w-1.5 h-1.5 rounded-full transition-all ${visual ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-zinc-800'}`} />
            </div>
            <p className="text-[14px] text-zinc-400 leading-relaxed font-bold line-clamp-3 group-hover:text-zinc-200 transition-colors uppercase tracking-tight">
              {idea}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export function ThumbnailCarousel({ ideas }: ThumbnailCarouselProps) {
  const [visuals, setVisuals] = useState<Record<number, string>>({});
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
  const [errorStates, setErrorStates] = useState<Record<number, string | null>>({});

  const handleVisualize = async (index: number, idea: string) => {
    if (loadingStates[index]) return;
    setLoadingStates(p => ({ ...p, [index]: true }));
    setErrorStates(p => ({ ...p, [index]: null }));
    try {
      const imageUrl = await generateThumbnailVisual(idea);
      setVisuals(p => ({ ...p, [index]: imageUrl }));
    } catch (err: any) {
      setErrorStates(p => ({ ...p, [index]: "Error" }));
    } finally {
      setLoadingStates(p => ({ ...p, [index]: false }));
    }
  };

  return (
    <div className="space-y-8 md:space-y-12 py-10 md:py-16 border-t border-zinc-800/20">
      <div className="flex items-center gap-6 px-6 sm:px-0">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-xl">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </div>
        <div>
           <h3 className="text-sm md:text-base font-black text-zinc-100 uppercase tracking-[0.2em]">Галерея обложек</h3>
           <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Визуальные концепты кликабельности</p>
        </div>
      </div>

      <div className="relative -mx-6 md:mx-0 overflow-hidden">
        <div className="flex gap-6 md:gap-10 overflow-x-auto pb-12 px-6 md:px-0 no-scrollbar snap-x snap-mandatory scroll-smooth">
          {ideas.map((idea, index) => (
            <ThumbnailCard 
              key={index}
              idea={idea}
              index={index}
              visual={visuals[index]}
              isLoading={loadingStates[index]}
              error={errorStates[index]}
              onVisualize={() => handleVisualize(index, idea)}
              onDownload={() => {
                if (!visuals[index]) return;
                const a = document.createElement("a");
                a.href = visuals[index];
                a.download = `cover-${index + 1}.png`;
                a.click();
              }}
            />
          ))}
          {/* Буфер для полной видимости последней карточки на мобильных */}
          <div className="shrink-0 w-12 md:w-20" />
        </div>
        
        {/* Затенение краев для навигации */}
        <div className="hidden lg:block absolute top-0 left-0 bottom-12 w-20 bg-gradient-to-r from-[#050505] to-transparent pointer-events-none" />
        <div className="hidden lg:block absolute top-0 right-0 bottom-12 w-20 bg-gradient-to-l from-[#050505] to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
