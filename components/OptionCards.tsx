import React from "react";
import { motion } from "framer-motion";

type Item = { key: string; title: string; desc: string };

export function OptionCards(props: {
  title: string;
  items: Item[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">{props.title}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {props.items.map((it) => {
          const active = props.value === it.key;
          return (
            <motion.button
              key={it.key}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => props.onChange(it.key)}
              className={[
                "group relative flex flex-col items-start text-left rounded-3xl p-6 transition-all duration-300 border h-full",
                active
                  ? "border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-zinc-900/50 shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]"
                  : "border-zinc-800/40 bg-zinc-900/20 hover:border-zinc-700/60 hover:bg-zinc-800/30"
              ].join(" ")}
            >
              <div className="w-full flex items-center justify-between mb-3">
                <span className={`text-[15px] font-bold tracking-wide transition-colors ${active ? "text-emerald-400" : "text-zinc-200 group-hover:text-white"}`}>
                  {it.title}
                </span>
                {active && (
                   <motion.div 
                     layoutId={`check-${props.title}`}
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                   />
                )}
              </div>
              <p className={`text-sm leading-relaxed transition-colors ${active ? "text-emerald-100/70" : "text-zinc-500 group-hover:text-zinc-400"}`}>
                {it.desc}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}