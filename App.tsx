import React, { useEffect, useMemo, useState } from "react";
import { HashRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { OptionCards } from "./components/OptionCards";
import { ResultPanel } from "./components/ResultPanel";
import { Uploader } from "./components/Uploader";
import { GenerateRequest, GenerateResponse, GenerateResult, Limits, Attachment } from "./types";
import { clamp, formatMMSS } from "./utils";
import { generateScenario } from "./services/geminiService";
import { mockBackend } from "./services/mockBackend";

function HomePage() {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  // Key to force re-render/reset of Uploader component when clearing form
  const [uploaderKey, setUploaderKey] = useState(0);

  const [style, setStyle] = useState<GenerateRequest["options"]["style"]>("storytelling");
  const [direction, setDirection] = useState<GenerateRequest["options"]["direction"]>("expertise");
  const [platform, setPlatform] = useState<GenerateRequest["options"]["platform"]>("shorts");
  const [ctaStrength, setCtaStrength] = useState<GenerateRequest["options"]["ctaStrength"]>("soft");
  const [durationSec, setDurationSec] = useState(60);

  const [limits, setLimits] = useState<Limits | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultMarkdown, setResultMarkdown] = useState("");
  
  const navigate = useNavigate();

  const styleItems = useMemo(
    () => [
      {
        key: "storytelling",
        title: "Сторителлинг",
        desc: "Эмоции и удержание: история → вывод → доверие."
      },
      {
        key: "provocative",
        title: "Провокация",
        desc: "Разрыв шаблона: миф → правда. Высокий CTR."
      },
      {
        key: "educational",
        title: "Обучение",
        desc: "Польза: пошаговый алгоритм, примеры, экспертность."
      },
      {
        key: "entertaining",
        title: "Развлечение",
        desc: "Лёгкий, динамичный формат, юмор или лайфстайл."
      }
    ],
    []
  );

  const directionItems = useMemo(
    () => [
      { key: "sale", title: "Продажа", desc: "Конверсия в покупку через боль и решение." },
      { key: "expertise", title: "Экспертиза", desc: "Рост доверия и укрепление личного бренда." },
      { key: "ads", title: "Реклама", desc: "Нативная интеграция продукта в контент." },
      { key: "engagement", title: "Вовлечение", desc: "Максимум реакций: комментарии, репосты, виральность." }
    ],
    []
  );

  function refreshMe() {
    setLimits(mockBackend.getUserStatus());
  }

  useEffect(() => {
    refreshMe();
  }, []);

  function buildMarkdownFromResponse(r: GenerateResult) {
    const shotsTable =
      r.shots?.length
        ? [
            "### Таблица кадров",
            "",
            "| Время | Кадр/план | Текст на экране | Озвучка | B-roll/SFX |",
            "|---|---|---|---|---|",
            ...r.shots.map((s) => `| ${s.t} | ${s.frame} | ${s.onScreenText} | ${s.voiceOver} | ${s.broll} |`)
          ].join("\n")
        : "";

    return [
      "## Заголовки",
      ...(r.titleOptions || []).map((x) => `- ${x}`),
      "",
      "## Хуки (начало видео)",
      ...(r.hookOptions || []).map((x) => `- ${x}`),
      "",
      "## Сценарий",
      "",
      r.scriptMarkdown || "",
      "",
      shotsTable,
      "",
      "## Идеи для обложки",
      ...(r.thumbnailIdeas || []).map((x) => `- ${x}`),
      "",
      "## Хэштеги",
      (r.hashtags || []).map((x) => `#${x.replace(/^#/, "")}`).join(" "),
      "",
      "## Чек-лист перед съемкой",
      ...(r.checklist || []).map((x) => `- ${x}`)
    ]
      .filter(Boolean)
      .join("\n");
  }

  async function onGenerate() {
    setError(null);
    setLoading(true);
    setResultMarkdown("");

    const canProceed = mockBackend.consumeCredit();
    if (!canProceed) {
      setLoading(false);
      setError("Лимит бесплатных генераций исчерпан: 2 раза в день. Оформите подписку для безлимита.");
      refreshMe();
      return;
    }

    const payload: GenerateRequest = {
      input: { text, attachments },
      options: { style, direction, durationSec, platform, ctaStrength },
      client: { tz: "Europe/Amsterdam", uiVersion: "1.0.0" }
    };

    try {
      const result = await generateScenario(payload);
      const md = buildMarkdownFromResponse(result);
      setResultMarkdown(md);
      refreshMe();
    } catch (e: any) {
      setError(e.message || "Ошибка генерации.");
    } finally {
      setLoading(false);
    }
  }

  function onSubscribe() {
    navigate('/billing/success?session_id=mock_session_123');
  }

  async function onCopy() {
    if (!resultMarkdown) return;
    await navigator.clipboard.writeText(resultMarkdown);
  }

  const headerBadge = limits?.isPro ? "PRO" : limits ? `${limits.remainingToday}/${limits.dailyLimit}` : "...";

  return (
    <main className="min-h-screen px-4 py-8 md:py-16 bg-[#09090b] text-zinc-100 font-sans selection:bg-emerald-500/20">
      <div className="mx-auto max-w-[1400px]">
        {/* Main Glass Container */}
        <div className="relative rounded-[2.5rem] bg-zinc-950/40 border border-zinc-800/40 backdrop-blur-2xl shadow-2xl overflow-hidden">
          
          {/* Subtle Gradients */}
          <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative p-6 md:p-12">
            
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
              <div className="space-y-2 group cursor-default">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white transition-colors duration-500 group-hover:text-emerald-50">
                  Сценарист{" "}
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-400 bg-[length:200%_auto] bg-clip-text text-transparent transition-all duration-700 group-hover:bg-right">
                    AI
                  </span>
                </h1>
                <p className="text-zinc-400 text-base md:text-lg max-w-lg leading-relaxed">
                  Профессиональные сценарии для Reels, TikTok и YouTube.
                  <br className="hidden md:block"/>
                  От идеи до раскадровки за несколько секунд.
                </p>
              </div>

              <div className="flex items-center gap-4">
                 <div className={`px-4 py-2 rounded-full border text-xs font-bold tracking-widest uppercase transition-colors ${
                    limits?.isPro 
                    ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" 
                    : "border-zinc-800 bg-zinc-900/50 text-zinc-400"
                  }`}>
                    {limits?.isPro ? "Unlimited" : `${headerBadge} Free`}
                  </div>
                {!limits?.isPro && (
                  <button
                    onClick={onSubscribe}
                    className="group px-6 py-2.5 rounded-full bg-white text-zinc-950 text-sm font-bold hover:scale-105 transition duration-300 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                  >
                    Upgrade to PRO
                  </button>
                )}
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
              
              {/* Left Column: Controls */}
              <div className="lg:col-span-5 space-y-10">
                
                {/* Text Area */}
                <div className="space-y-4">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider pl-1">О чем видео?</label>
                  <div className="relative group">
                    <textarea
                      className="w-full min-h-[180px] rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 text-[15px] leading-relaxed text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:bg-zinc-900/50 transition-all resize-none shadow-inner"
                      placeholder="Опишите идею, вставьте черновик или просто набросайте мысли..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                  </div>
                </div>

                {/* Updated Uploader with state clearing support via key */}
                <Uploader 
                    key={uploaderKey} 
                    onAttachmentsChange={setAttachments} 
                />

                {/* Settings Block */}
                <div className="rounded-3xl border border-zinc-800/60 bg-zinc-900/20 p-8 space-y-8 backdrop-blur-sm">
                   
                   {/* Duration Slider */}
                   <div className="space-y-4">
                      <div className="flex items-end justify-between">
                         <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Хронометраж</label>
                         <span className="text-sm font-medium text-zinc-200 font-mono bg-zinc-800/50 px-3 py-1 rounded-lg border border-zinc-700/50">
                            {formatMMSS(durationSec)}
                         </span>
                      </div>
                      <div className="relative h-6 flex items-center">
                        <input
                          type="range"
                          min={10}
                          max={1800}
                          value={durationSec}
                          onChange={(e) => setDurationSec(clamp(Number(e.target.value), 10, 1800))}
                          className="absolute w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 z-10"
                        />
                         <div className="absolute w-full flex justify-between px-1 pointer-events-none top-4">
                           <div className="h-1 w-px bg-zinc-800"></div>
                           <div className="h-1 w-px bg-zinc-800"></div>
                           <div className="h-1 w-px bg-zinc-800"></div>
                           <div className="h-1 w-px bg-zinc-800"></div>
                           <div className="h-1 w-px bg-zinc-800"></div>
                        </div>
                      </div>
                   </div>

                   {/* Dropdowns */}
                   <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Платформа</label>
                        <div className="relative group">
                          <select
                            className="w-full appearance-none rounded-2xl border border-zinc-700/30 bg-zinc-800/30 px-5 py-3.5 text-sm text-zinc-200 focus:ring-1 focus:ring-emerald-500/50 focus:bg-zinc-800/50 outline-none transition cursor-pointer hover:border-zinc-600/50"
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value as any)}
                          >
                            <option value="tiktok">TikTok</option>
                            <option value="reels">Instagram Reels</option>
                            <option value="shorts">YouTube Shorts</option>
                            <option value="youtube">YouTube Video</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                             <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                         <div className="flex items-center gap-2">
                             <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Призыв (CTA)</label>
                         </div>
                        
                        <div className="relative group">
                          <select
                            className="w-full appearance-none rounded-2xl border border-zinc-700/30 bg-zinc-800/30 px-5 py-3.5 text-sm text-zinc-200 focus:ring-1 focus:ring-emerald-500/50 focus:bg-zinc-800/50 outline-none transition cursor-pointer hover:border-zinc-600/50"
                            value={ctaStrength}
                            onChange={(e) => setCtaStrength(e.target.value as any)}
                          >
                            <option value="soft">Мягкий / Нативный</option>
                            <option value="hard">Агрессивный / Продающий</option>
                          </select>
                           <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                             <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={onGenerate}
                    className="flex-1 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white px-8 py-5 text-sm font-bold tracking-wider uppercase hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition duration-300 shadow-xl"
                  >
                    {loading ? "Анализ данных..." : "Сгенерировать"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setText("");
                      setAttachments([]);
                      setResultMarkdown("");
                      setError(null);
                      setUploaderKey(k => k + 1); // Reset Uploader
                    }}
                    className="px-6 py-5 rounded-2xl border border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-800 transition duration-300"
                    title="Очистить форму"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
                 
                 {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/10 text-rose-200 text-sm flex items-start gap-3"
                    >
                        <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <span className="leading-relaxed">{error}</span>
                    </motion.div>
                )}
              </div>

              {/* Right Column: Interactive Options & Results */}
              <div className="lg:col-span-7 flex flex-col gap-10 h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <OptionCards title="Стиль подачи" items={styleItems} value={style} onChange={(v) => setStyle(v as any)} />
                    <OptionCards title="Цель видео" items={directionItems} value={direction} onChange={(v) => setDirection(v as any)} />
                </div>
                
                <div className="flex-1 min-h-[600px]">
                    <ResultPanel loading={loading} error={error} markdown={resultMarkdown} onCopy={onCopy} />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function SuccessPage() {
    const [params] = React.useState(new URLSearchParams(window.location.search));
    const sessionId = params.get('session_id');

    useEffect(() => {
        mockBackend.subscribe();
    }, []);

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#09090b] p-6 font-sans">
            <div className="max-w-md w-full rounded-[2rem] border border-zinc-800 bg-zinc-950 p-10 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
                    <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">Готово!</h2>
                <p className="text-zinc-400 mb-10 leading-relaxed text-lg">Подписка активирована. Теперь творите без ограничений.</p>
                
                <Link to="/" className="block w-full rounded-2xl bg-zinc-100 text-zinc-950 py-4 font-bold text-sm tracking-wide hover:bg-white hover:scale-[1.02] transition duration-300">
                    НАЧАТЬ РАБОТУ
                </Link>
                <div className="mt-8 text-[10px] text-zinc-600 font-mono tracking-widest uppercase opacity-50">Trans-ID: {sessionId ?? "DEV-MOCK"}</div>
            </div>
        </main>
    );
}

function CancelPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-[#09090b] p-6 font-sans">
             <div className="max-w-md w-full rounded-[2rem] border border-zinc-800 bg-zinc-950 p-10 text-center shadow-2xl">
                <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-rose-500/20">
                    <svg className="w-10 h-10 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">Отмена</h2>
                <p className="text-zinc-400 mb-10 leading-relaxed">Оплата не прошла. Ничего страшного, бесплатный тариф всё ещё с вами.</p>
                <Link to="/" className="block w-full rounded-2xl border border-zinc-700/50 bg-zinc-900 text-white py-4 font-bold text-sm tracking-wide hover:bg-zinc-800 hover:border-zinc-600 transition duration-300">
                    ВЕРНУТЬСЯ
                </Link>
            </div>
        </main>
    );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/billing/success" element={<SuccessPage />} />
        <Route path="/billing/cancel" element={<CancelPage />} />
      </Routes>
    </Router>
  );
}