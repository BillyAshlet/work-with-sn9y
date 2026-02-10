"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  Music,
  FileText,
  Image as ImageIcon,
  Film,
  File,
  X,
  Download,
  Eye,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState, useRef, useCallback, useEffect } from "react";

interface WorkFile {
  id: string;
  name: string;
  size: number;
  type: string;
  category: string;
  url: string;
  uploadedAt: number;
  thumbnail?: string;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return ImageIcon;
  if (type.startsWith("video/")) return Film;
  if (type.startsWith("audio/")) return Music;
  if (type.includes("pdf")) return FileText;
  return File;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const STORAGE_KEY = "billy-works-files";

function loadFiles(): WorkFile[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveFiles(files: WorkFile[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
}

interface UploadPageProps {
  category: string;
  categoryLabel: string;
  categoryLabelCn: string;
  accentColor: string;
  backHref: string;
}

export default function UploadPage({
  category,
  categoryLabel,
  categoryLabelCn,
  accentColor,
  backHref,
}: UploadPageProps) {
  const [files, setFiles] = useState<WorkFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [previewFile, setPreviewFile] = useState<WorkFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFiles(loadFiles());
  }, []);

  const addFiles = useCallback(
    (newFileList: FileList) => {
      const promises = Array.from(newFileList).map(
        (file) =>
          new Promise<WorkFile>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const workFile: WorkFile = {
                id: crypto.randomUUID(),
                name: file.name,
                size: file.size,
                type: file.type,
                category,
                url: reader.result as string,
                uploadedAt: Date.now(),
              };
              if (file.type.startsWith("image/")) {
                workFile.thumbnail = reader.result as string;
              }
              resolve(workFile);
            };
            reader.readAsDataURL(file);
          })
      );

      Promise.all(promises).then((newFiles) => {
        setFiles((prev) => {
          const updated = [...newFiles, ...prev];
          saveFiles(updated);
          return updated;
        });
      });
    },
    [category]
  );

  const deleteFile = (id: string) => {
    setFiles((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      saveFiles(updated);
      return updated;
    });
    if (previewFile?.id === id) setPreviewFile(null);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const filteredFiles = files.filter((f) => f.category === category);

  return (
    <main className="min-h-screen relative">
      {/* Accent bar */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-50" style={{ background: accentColor }} />

      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-12 py-6 backdrop-blur-md bg-[var(--color-bg)]/80"
      >
        <Link
          href={backHref}
          className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-white transition-colors duration-300"
        >
          <ArrowLeft size={16} />
          <span className="tracking-[0.2em] uppercase font-light">返回</span>
        </Link>
        <span
          className="text-sm tracking-[0.3em] uppercase font-medium"
          style={{ fontFamily: "var(--font-display)", color: accentColor }}
        >
          {categoryLabel} · 上传
        </span>
      </motion.nav>

      <div className="pt-28 pb-16 px-6 md:px-12 max-w-5xl mx-auto">
        {/* Upload area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border border-dashed rounded-2xl p-12 mb-10 text-center cursor-pointer transition-all duration-500 ${
            dragOver
              ? "border-white/40 bg-white/5"
              : "border-[var(--color-border)] hover:border-white/20 hover:bg-[var(--color-card)]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
          <Upload
            size={28}
            className={`mx-auto mb-4 transition-colors duration-300 ${
              dragOver ? "text-white" : "text-[var(--color-muted)]"
            }`}
          />
          <p className="text-sm text-[var(--color-muted)] font-light">
            拖拽文件到这里，或点击上传
          </p>
          <p className="text-xs text-[var(--color-muted)] mt-1 font-light opacity-60">
            Drag & drop files here, or click to upload
          </p>
          <p className="text-xs mt-3 font-light" style={{ color: accentColor, opacity: 0.7 }}>
            上传到「{categoryLabelCn}」分类
          </p>
        </motion.div>

        {/* File grid */}
        <AnimatePresence mode="popLayout">
          {filteredFiles.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <p className="text-[var(--color-muted)] text-sm font-light">
                还没有作品
              </p>
              <p className="text-[var(--color-muted)] text-xs mt-2 font-light opacity-50">
                No works yet — upload your first work
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredFiles.map((file, i) => {
                const Icon = getFileIcon(file.type);
                return (
                  <motion.div
                    key={file.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="group relative border border-[var(--color-border)] rounded-xl bg-[var(--color-card)] hover:bg-[var(--color-card-hover)] overflow-hidden transition-all duration-300"
                  >
                    <div className="relative h-40 flex items-center justify-center bg-black/20 overflow-hidden">
                      {file.thumbnail ? (
                        <img
                          src={file.thumbnail}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Icon size={36} className="text-[var(--color-muted)] opacity-40" />
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewFile(file);
                          }}
                          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                          <Eye size={16} className="text-white" />
                        </button>
                        <a
                          href={file.url}
                          download={file.name}
                          onClick={(e) => e.stopPropagation()}
                          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                          <Download size={16} className="text-white" />
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFile(file.id);
                          }}
                          className="w-9 h-9 rounded-full bg-white/10 hover:bg-red-500/30 flex items-center justify-center transition-colors"
                        >
                          <Trash2 size={16} className="text-white" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-light truncate">{file.name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-[var(--color-muted)] font-light">
                          {formatSize(file.size)}
                        </span>
                        <span className="text-xs text-[var(--color-muted)] font-light">
                          {formatDate(file.uploadedAt)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview modal */}
      <AnimatePresence>
        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setPreviewFile(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-4xl max-h-[85vh] w-full bg-[var(--color-card)] rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
                <p className="text-sm font-light truncate pr-4">{previewFile.name}</p>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-6 flex items-center justify-center max-h-[calc(85vh-60px)] overflow-auto">
                {previewFile.type.startsWith("image/") ? (
                  <img
                    src={previewFile.url}
                    alt={previewFile.name}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  />
                ) : previewFile.type.startsWith("video/") ? (
                  <video
                    src={previewFile.url}
                    controls
                    className="max-w-full max-h-[70vh] rounded-lg"
                  />
                ) : previewFile.type.startsWith("audio/") ? (
                  <div className="flex flex-col items-center gap-6 py-12">
                    <Music size={48} className="text-[var(--color-muted)]" />
                    <audio src={previewFile.url} controls className="w-full max-w-md" />
                  </div>
                ) : previewFile.type.includes("pdf") ? (
                  <iframe
                    src={previewFile.url}
                    className="w-full h-[70vh] rounded-lg"
                    title={previewFile.name}
                  />
                ) : (
                  <div className="text-center py-12">
                    <File size={48} className="mx-auto mb-4 text-[var(--color-muted)]" />
                    <p className="text-sm text-[var(--color-muted)] font-light">
                      无法预览此文件
                      <br />
                      <span className="opacity-60">Cannot preview this file</span>
                    </p>
                    <a
                      href={previewFile.url}
                      download={previewFile.name}
                      className="inline-block mt-4 px-4 py-2 text-sm border border-[var(--color-border)] rounded-lg hover:bg-white/5 transition-colors"
                    >
                      下载文件 / Download
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
