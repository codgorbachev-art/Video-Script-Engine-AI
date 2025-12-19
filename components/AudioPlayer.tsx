
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [showVolume, setShowVolume] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const trackUrl = "https://cdn.pixabay.com/audio/2022/05/27/audio_1808f3030e.mp3"; 

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("Autoplay blocked"));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center gap-2">
      <audio ref={audioRef} src={trackUrl} loop />
      
      <div 
        className="relative flex items-center bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl md:rounded-2xl p-1"
        onMouseEnter={() => setShowVolume(true)}
        onMouseLeave={() => setShowVolume(false)}
      >
        <AnimatePresence>
          {showVolume && (
            <motion.div
              initial={{ width: 0, opacity: 0, x: 10 }}
              animate={{ width: 100, opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: 10 }}
              className="overflow-hidden flex items-center px-3"
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={togglePlay}
          className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg md:rounded-xl transition-colors ${isPlaying ? 'text-emerald-500 bg-emerald-500/5' : 'text-zinc-500'}`}
        >
          {isPlaying ? (
            <div className="flex items-end gap-0.5 h-3">
              {[0.4, 0.7, 0.5, 0.9].map((h, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [`${h*100}%`, `${(h > 0.5 ? h-0.3 : h+0.3)*100}%`, `${h*100}%`] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                  className="w-0.5 bg-current rounded-full"
                />
              ))}
            </div>
          ) : (
            /* Fix: Replace md:width and md:height with responsive Tailwind classes */
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 md:w-[18px] md:h-[18px]"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          )}
        </motion.button>
      </div>
      
      <div className="hidden lg:block">
        <div className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-0.5">Студийный фон</div>
        <div className="text-[10px] font-bold text-zinc-400 truncate max-w-[80px]">{isPlaying ? "Играет..." : "Пауза"}</div>
      </div>
    </div>
  );
}
