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

export const Uploader: React.FC<UploaderProps> = (props) => {
  const { onAttachmentsChange, maxFiles = 3, hint } = props;
  const ref = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileStatus[]>([]);
  const lastEmittedRef = useRef<string>("");

  // Notify parent whenever valid files change, avoiding redundant updates during progress
  useEffect(() => {
    const validAttachments = files
      .filter((f) => f.status === "success" && f.result)
      .map((f) => f.result!);

    // Simple signature to prevent spamming parent with updates if the successful list hasn't changed
    const signature = JSON.stringify(validAttachments.map(v => v.name + v.dataBase64.length));

    if (signature !== lastEmittedRef.current) {
      lastEmittedRef.current = signature;
      onAttachmentsChange(validAttachments);
    }
  }, [files, onAttachmentsChange]);

  const processFile = async (file: File, id: string) => {
    updateFile(id, { status: "uploading", progress: 0 });

    if (file.size > 5 * 1024 * 1024) {
      updateFile(id, { status: "error", errorMessage: "Файл > 5 МБ" });
      return;
    }

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onprogress = (e) => {
          if (e.lengthComputable) {
            updateFile(id, { progress: (e.loaded / e.total) * 100 });
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
      updateFile(id, { status: "error", errorMessage: "Ошибка" });
    }
  };

  const updateFile = (id: string, data: Partial<FileStatus>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)));
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    
    // Filter out duplicates by name if needed, or just append. 
    // Here we respect maxFiles limit total.
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
    
    // Reset input so same file can be selected again if needed (after delete)
    if (ref.current) ref.current.value = "";
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-4">
       <div className="flex items-center justify-between pl-1">
        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Материалы</label>
        <span className="text-[10px] text-zinc-600 bg-zinc-900/50 px-2 py-0.5 rounded border border-zinc-800">
           {files.length} / {maxFiles}
        </span>
      </div>

      {/* Drop/Select Zone */}
      {files.length < maxFiles && (
        <div className="group relative rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 p-6 transition-all hover:border-zinc-600 hover:bg-zinc-900/40">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:text-zinc-200 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">Загрузить контент</div>
                <div className="text-xs text-zinc-500 max-w-[200px] leading-relaxed">
                  {hint ?? "Фото, текстовый файл или PDF. Мы извлечем смыслы."}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2 text-xs font-medium text-zinc-200 hover:border-zinc-600 hover:bg-zinc-700 hover:text-white transition"
                onClick={() => ref.current?.click()}
              >
                Выбрать
              </button>

              {/* Camera input for mobile support */}
              <label className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2 text-xs font-medium text-zinc-200 hover:border-zinc-600 hover:bg-zinc-700 hover:text-white transition cursor-pointer select-none flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                <input
                  className="hidden"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </label>
            </div>
          </div>

          <input
            ref={ref}
            className="hidden"
            type="file"
            multiple
            accept="image/*,text/plain,application/pdf"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* File List */}
      <AnimatePresence mode="popLayout">
        {files.length > 0 && (
          <motion.div className="flex flex-col gap-2">
             {files.map((f) => (
                <motion.div
                  key={f.id}
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 pr-10"
                >
                  <div className="flex items-center gap-3 relative z-10">
                     {/* Icon based on mimeType (simple logic) */}
                     <div className="shrink-0 w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                        {f.file.type.startsWith("image") ? (
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        ) : (
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        )}
                     </div>
                     
                     <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-zinc-200 truncate">{f.file.name}</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-2">
                           <span>{(f.file.size / 1024).toFixed(1)} KB</span>
                           {f.status === "error" && <span className="text-rose-400">• {f.errorMessage}</span>}
                        </div>
                     </div>

                     {/* Status Indicators */}
                     <div className="shrink-0 text-zinc-500">
                        {f.status === "uploading" && (
                           <div className="w-4 h-4 rounded-full border-2 border-zinc-600 border-t-emerald-500 animate-spin" />
                        )}
                        {f.status === "success" && (
                           <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        )}
                        {f.status === "error" && (
                           <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                     </div>
                  </div>
                  
                  {/* Remove Button */}
                  <button 
                     onClick={() => removeFile(f.id)}
                     className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 rounded-lg text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition z-20"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>

                  {/* Progress Bar */}
                  {f.status === "uploading" && (
                     <div className="absolute bottom-0 left-0 h-0.5 bg-emerald-500 transition-all duration-300" style={{ width: `${f.progress}%` }} />
                  )}
                </motion.div>
             ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}