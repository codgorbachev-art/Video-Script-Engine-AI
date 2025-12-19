
import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Attachment } from "../types";

interface FileStatus {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  errorMessage?: string;
  result?: Attachment;
}

interface UploaderProps {
  onAttachmentsChange: (files: Attachment[]) => void;
  maxFiles?: number;
  hint?: string;
}

const TYPE_COLORS = {
  image: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  pdf: "text-rose-500 bg-rose-500/10 border-rose-500/20",
  text: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  other: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20"
};

export const Uploader: React.FC<UploaderProps> = (props) => {
  const { onAttachmentsChange, maxFiles = 3, hint } = props;
  const ref = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileStatus[]>([]);
  const lastEmittedRef = useRef<string>("");

  useEffect(() => {
    const validAttachments = files
      .filter((f) => f.status === "success" && f.result)
      .map((f) => f.result!);

    const signature = JSON.stringify(validAttachments.map(v => v.name + v.dataBase64.length));

    if (signature !== lastEmittedRef.current) {
      lastEmittedRef.current = signature;
      onAttachmentsChange(validAttachments);
    }
  }, [files, onAttachmentsChange]);

  const processFile = async (file: File, id: string) => {
    updateFile(id, { status: "uploading", progress: 0 });

    if (file.size > 5 * 1024 * 1024) {
      updateFile(id, { status: "error", errorMessage: "Превышен лимит 5МБ" });
      return;
    }

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onprogress = (e) => {
          if (e.lengthComputable) {
            updateFile(id, { progress: Math.round((e.loaded / e.total) * 100) });
          }
        };
        reader.onload = () => {
          const res = String(reader.result || "");
          const idx = res.indexOf("base64,");
          resolve(idx >= 0 ? res.slice(idx + 7) : "");
        };
        reader.onerror = () => reject(new Error("Ошибка чтения"));
        reader.readAsDataURL(file);
      });

      updateFile(id, {
        status: "success",
        progress: 100,
        result: {
          name: file.name,
          mimeType: file.type || "application/octet-stream",
          dataBase64: base64,
        },
      });
    } catch (e) {
      updateFile(id, { status: "error", errorMessage: "Сбой загрузки" });
    }
  };

  const updateFile = (id: string, data: Partial<FileStatus>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)));
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    
    const remainingSlots = maxFiles - files.length;
    if (remainingSlots <= 0) return;

    const newFilesRaw = Array.from(fileList).slice(0, remainingSlots);
    const newFileEntries: FileStatus[] = newFilesRaw.map((f) => ({
      id: Math.random().toString(36).substring(7),
      file: f,
      progress: 0,
      status: "pending",
    }));

    setFiles((prev) => [...prev, ...newFileEntries]);
    newFileEntries.forEach((entry) => processFile(entry.file, entry.id));
    
    if (ref.current) ref.current.value = "";
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const getFormatDetails = (mime: string) => {
    if (mime.includes("pdf")) return { label: "PDF", style: TYPE_COLORS.pdf };
    if (mime.includes("image")) return { label: "IMG", style: TYPE_COLORS.image };
    if (mime.includes("text")) return { label: "TXT", style: TYPE_COLORS.text };
    return { label: "FILE", style: TYPE_COLORS.other };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] font-mono">Документы ({files.length}/{maxFiles})</label>
        {files.length > 0 && (
           <button 
             onClick={() => setFiles([])}
             className="text-[9px] font-bold text-zinc-700 hover:text-rose-400 uppercase transition-colors"
           >
             Очистить
           </button>
        )}
      </div>

      {files.length < maxFiles && (
        <motion.div 
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="group relative rounded-[2rem] border-2 border-dashed border-zinc-800/40 bg-zinc-950/20 p-8 transition-all hover:border-emerald-500/20 hover:bg-emerald-500/[0.03] cursor-pointer"
          onClick={() => ref.current?.click()}
        >
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:text-emerald-500 group-hover:border-emerald-500/30 transition-all flex items-center justify-center shadow-xl">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <div className="space-y-1.5">
              <div className="text-[13px] font-black text-zinc-200 uppercase tracking-tight">Добавить файлы</div>
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                {hint ?? "Изображения или PDF до 5 МБ"}
              </p>
            </div>
          </div>
          <input ref={ref} className="hidden" type="file" multiple accept="image/*,text/plain,application/pdf" onChange={(e) => handleFiles(e.target.files)} />
        </motion.div>
      )}

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {files.map((f) => {
            const { label, style } = getFormatDetails(f.file.type);
            return (
              <motion.div
                key={f.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="group relative overflow-hidden rounded-[1.5rem] border border-zinc-800/40 bg-zinc-900/40 p-5 shadow-xl transition-all hover:border-zinc-700/60"
              >
                <div className="flex items-center gap-5 relative z-10">
                   <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border font-mono text-[10px] font-black ${style}`}>
                      {label}
                   </div>
                   
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 mb-2">
                         <span className="text-[13px] font-bold text-zinc-100 truncate">{f.file.name}</span>
                         {f.status === "uploading" && (
                           <span className="text-[10px] font-black font-mono text-emerald-400">{f.progress}%</span>
                         )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] font-bold text-zinc-600 font-mono">
                           {(f.file.size / 1024).toFixed(0)} KB
                         </span>
                         {f.status === "error" && (
                           <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{f.errorMessage}</span>
                         )}
                         {f.status === "success" && (
                           <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest">OK</span>
                           </div>
                         )}
                      </div>
                   </div>

                   <button 
                     onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                     className="shrink-0 w-9 h-9 rounded-xl bg-zinc-800/50 text-zinc-600 hover:text-rose-400 hover:bg-rose-500/5 transition-all flex items-center justify-center border border-transparent hover:border-rose-500/20"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                   </button>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800/20">
                   {f.status === "uploading" && (
                     <motion.div 
                       className="h-full bg-emerald-500"
                       initial={{ width: 0 }}
                       animate={{ width: `${f.progress}%` }}
                     />
                   )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
