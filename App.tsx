
import React, { useEffect, useState, useRef } from "react";
import { HashRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { OptionCards } from "./components/OptionCards";
import { ResultPanel } from "./components/ResultPanel";
import { Uploader } from "./components/Uploader";
import { ThumbnailCarousel } from "./components/ThumbnailCarousel";
import { AudioPlayer } from "./components/AudioPlayer";
import { BrainstormChat } from "./components/BrainstormChat";
import { Attachment, GenerateResult, Limits } from "./types";
import { formatMMSS } from "./utils";
import { generateScenario } from "./services/geminiService";
import { mockBackend } from "./services/mockBackend";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

// Define missing itemVariants for motion elements
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const styleItems = [
  { key: "storytelling", title: "Сторителлинг", desc: "История с аркой героя" },
  { key: "provocative", title: "Провокация", desc: "Дерзко и хайпово" },
  { key: "educational", title: "Обучение", desc: "Польза и факты" },
  { key: "entertaining", title: "Развлечение", desc: "Юмор и динамика" },
];

const directionItems = [
  { key: "sale", title: "Продажи", desc: "Фокус на оффере" },
  { key: "expertise", title: "Экспертность", desc: "Личный бренд" },
  { key: "ads", title: "Реклама", desc: "Нативная подача" },
  { key: "engagement", title: "Вовлечение", desc: "Шеринг и комменты" },
];

const platformItems = [
  { key: "youtube", title: "YouTube", desc: "Горизонтально 16:9" },
  { key: "reels", title: "Reels / TikTok", desc: "Вертикально 9:16" },
  { key: "shorts", title: "Shorts", desc: "Короткий метр" }
];

function HomePage() {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [style, setStyle] = useState<any>("storytelling");
  const [direction, setDirection] = useState<any>("expertise");
  const [platform, setPlatform] = useState<any>("youtube");
  const [durationSec, setDurationSec] = useState(180);

  const [limits, setLimits] = useState<Limits | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<GenerateResult | null>(null);
  
  const [isListening, setIsListening] = useState(false);
  const [showBrainstorm, setShowBrainstorm] = useState(false);
  const recognitionRef = useRef<any>(null);

  const navigate = useNavigate();

  useEffect(() => {
    setLimits(mockBackend.getUserStatus());
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'ru-RU';
      recognitionRef.current.onresult = (e: any) => setText(p => p + " " + e.results[0][0].transcript);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;
    if (isListening) { recognitionRef.current.stop(); } 
    else { setIsListening(true); recognitionRef.current.start(); }
  };

  async function onGenerate() {
    if (!text && attachments.length === 0) return setError("Опишите вашу идею или добавьте файлы");
    setLoading(true);
    setError(null);
    setCurrentResult(null);

    if (!mockBackend.consumeCredit()) {
      setLoading(false);
      return setError("Дневной лимит исчерпан. Перейдите на PRO.");
    }

    try {
      const result = await generateScenario({
        input: { text, attachments },
        options: { style, direction, durationSec, platform, ctaStrength: "soft" },
      });
      setCurrentResult(result);
      setLimits(mockBackend.getUserStatus());
      setTimeout(() => {
        document.getElementById('result-area')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (e: any) {
      setError("Ошибка ИИ: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-emerald-500/30">
      {/* Анимированный фон */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[70%] h-[70%] bg-emerald-900/10 blur-[150px] rounded-full opacity-40 animate-pulse" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[70%] h-[70%] bg-blue-900/10 blur-[150px] rounded-full opacity-40 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mx-auto max-w-[1400px] px-4 sm:px-8 md:px-12 py-8 md:py-16 lg:py-24">
        
        <header className="flex flex-col md:flex-row items-center justify-between mb-16 lg:mb-24 gap-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
            <motion.div whileHover={{ scale: 1.02 }} className="cursor-default flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase flex items-center gap-3">
                <span className="text-white">SCENARIST</span>
                <span className="bg-emerald-500 text-black px-2.5 py-0.5 rounded-xl text-xl md:text-2xl not-italic -rotate-3 block">AI</span>
              </h1>
            </motion.div>
            <div className="hidden sm:block w-px h-10 bg-zinc-800/60" />
            <AudioPlayer />
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
             <div className="flex-1 sm:flex-none px-5 py-3 rounded-2xl glass-card flex items-center justify-center gap-3 border-zinc-800/40">
               <div className={`w-2 h-2 rounded-full ${limits?.isPro ? 'bg-emerald-500 shadow-[0_0_12px_#10b981]' : 'bg-zinc-600'}`} />
               <span className="text-[10px] font-bold font-mono uppercase tracking-[0.2em] text-zinc-400">
                 {limits?.isPro ? "STATUS: PRO" : `FREE: ${limits?.remainingToday} / ${limits?.dailyLimit}`}
               </span>
             </div>
             {!limits?.isPro && (
               <button 
                 onClick={() => navigate('/billing/success')} 
                 className="bg-white text-black px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl whitespace-nowrap"
               >
                 UPGRADE
               </button>
             )}
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Левая колонка: Ввод и настройки */}
          <section className="lg:col-span-5 space-y-12">
            
            <motion.div variants={itemVariants} className="glass-card rounded-[2.5rem] p-6 sm:p-10 md:p-12 border border-zinc-800/30 shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-10">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                   </div>
                   <span className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-500/80">Генератор идей</span>
                 </div>
                 <div className="flex gap-2">
                   <button onClick={() => setShowBrainstorm(true)} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all shadow-lg"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></button>
                   <button onClick={toggleVoiceInput} className={`p-3 rounded-xl border transition-all shadow-lg ${isListening ? 'bg-rose-500 border-rose-400 text-white animate-pulse' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'}`}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg></button>
                 </div>
              </div>

              <div className="relative z-10">
                <textarea 
                  value={text} 
                  onChange={(e) => setText(e.target.value)}
                  placeholder="О чем будет видео?..."
                  className="w-full min-h-[180px] bg-transparent text-xl font-bold placeholder:text-zinc-800 outline-none resize-none leading-relaxed text-zinc-100"
                />
                <AnimatePresence>
                  {showBrainstorm && (
                    <BrainstormChat 
                      currentInput={text} 
                      onClose={() => setShowBrainstorm(false)} 
                      onApply={(t) => {setText(p => p + "\n" + t); setShowBrainstorm(false);}} 
                    />
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-8 pt-10 border-t border-zinc-800/40 relative z-10">
                <Uploader onAttachmentsChange={setAttachments} />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card rounded-[2.5rem] p-8 sm:p-10 space-y-10 border border-zinc-800/30">
               <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block">Тайминг</span>
                    <span className="text-3xl font-black text-emerald-400 font-mono tracking-tighter">{formatMMSS(durationSec)}</span>
                  </div>
                  <div className="text-[10px] font-bold text-zinc-600 uppercase font-mono tracking-widest">~{Math.floor(durationSec * 2.3)} WORDS</div>
               </div>
               <div className="relative px-1">
                 <input 
                   type="range" min={15} max={600} step={15} value={durationSec} 
                   onChange={(e) => setDurationSec(Number(e.target.value))}
                   className="w-full h-1.5 bg-zinc-800/50 rounded-full appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all"
                 />
                 <div className="flex justify-between mt-4 text-[9px] font-black text-zinc-800 uppercase tracking-widest">
                   <span>Shorts</span>
                   <span>Mid</span>
                   <span>Long</span>
                 </div>
               </div>
            </motion.div>

            <div className="space-y-10">
              <OptionCards title="Формат" items={platformItems} value={platform} onChange={setPlatform} />
              <OptionCards title="Стиль" items={styleItems} value={style} onChange={setStyle} />
              <OptionCards title="Цель" items={directionItems} value={direction} onChange={setDirection} />
            </div>

            <motion.button 
              disabled={loading} onClick={onGenerate}
              whileHover={{ y: -4, scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="w-full py-8 md:py-10 bg-emerald-500 text-black font-black uppercase tracking-[0.4em] rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(16,185,129,0.3)] disabled:opacity-40 transition-all text-[11px] relative overflow-hidden group active:scale-95"
            >
              <span className="relative z-10">{loading ? "СИНТЕЗ ДАННЫХ..." : "ГЕНЕРИРОВАТЬ СЦЕНАРИЙ"}</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
            </motion.button>
          </section>

          {/* Правая колонка: Результат */}
          <section id="result-area" className="lg:col-span-7 space-y-16">
            <div className="min-h-[400px]">
              <ResultPanel loading={loading} error={error} result={currentResult} onCopy={() => {}} />
            </div>
            {currentResult && !loading && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <ThumbnailCarousel ideas={currentResult.thumbnailIdeas} />
              </motion.div>
            )}
          </section>
        </main>
      </motion.div>
    </div>
  );
}

function SuccessPage() {
  useEffect(() => mockBackend.subscribe(), []);
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6">
       <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-12 md:p-20 rounded-[3rem] text-center max-w-xl w-full border border-zinc-800/40 shadow-2xl">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-emerald-500/30">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 className="text-4xl font-black mb-6 uppercase tracking-tight">PRO АКТИВИРОВАН</h2>
          <p className="text-zinc-500 mb-12 font-bold uppercase tracking-[0.2em] text-[10px] leading-relaxed">Дневные лимиты сняты. Полный доступ к Deep Research и Storyboarding.</p>
          <Link to="/" className="block w-full py-6 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl">В ПАНЕЛЬ УПРАВЛЕНИЯ</Link>
       </motion.div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/billing/success" element={<SuccessPage />} />
      </Routes>
    </Router>
  );
}
