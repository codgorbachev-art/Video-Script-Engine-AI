
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Item = { key: string; title: string; desc: string };

export function OptionCards(props: {
  title: string;
  items: Item[];
  value: string;
  onChange: (v: string) => void;
  tooltip?: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pl-4">
        <div className="flex items-center gap-5">
          <div className="w-1 h-8 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
          <div className="flex items-center gap-3">
            <div className="text-[12px] font-black text-white uppercase tracking-[0.4em] font-mono">
              {props.title}
            </div>
            {props.tooltip && (
              <div className="relative flex items-center">
                <button
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  className="w-5 h-5 rounded-xl border border-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-600 hover:border-emerald-500/50 hover:text-emerald-500 transition-all cursor-help bg-zinc-950/50"
                >
                  ?
                </button>
                <AnimatePresence>
                  {showTooltip && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute bottom-full left-0 mb-6 w-72 p-6 rounded-[1.5rem] glass-card border-emerald-500/20 shadow-[0_40px_80px_-20px_rgba(0,0,0,1)] z-[100] pointer-events-none"
                    >
                      <p className="text-[11px] font-bold text-zinc-400 leading-relaxed uppercase tracking-wider">
                        {props.tooltip}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {props.items.map((it) => {
          const active = props.value === it.key;
          return (
            <motion.button
              key={it.key}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => props.onChange(it.key)}
              className={[
                "relative flex flex-col items-start text-left rounded-[2rem] p-7 md:p-8 transition-all duration-500 border overflow-hidden group min-w-0",
                active
                  ? "border-emerald-500/40 bg-emerald-500/[0.04] shadow-xl"
                  : "border-zinc-800/50 bg-zinc-900/10 hover:bg-zinc-800/30 hover:border-zinc-700/60"
              ].join(" ")}
            >
              <AnimatePresence>
                {active && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.08] via-transparent to-transparent pointer-events-none"
                  />
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between w-full mb-4 relative z-10">
                <span className={`text-[15px] font-black tracking-tight uppercase transition-all duration-500 ${active ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"}`}>
                  {it.title}
                </span>
                <div className={`w-4 h-4 rounded-xl border-2 transition-all duration-500 flex items-center justify-center ${active ? "bg-emerald-500 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "border-zinc-800 group-hover:border-zinc-700"}`}>
                   {active && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                </div>
              </div>
              <p className={`text-[11px] leading-relaxed transition-all duration-500 font-bold uppercase tracking-[0.1em] relative z-10 ${active ? "text-emerald-500/60" : "text-zinc-600"}`}>
                {it.desc}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
