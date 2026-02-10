"use client";

import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import { useRef, useEffect, useMemo } from "react";
import { usePageTransition } from "@/app/components/PageTransition";

const projects = [
  {
    title: "Coming Soon",
    description: "爵士乐编曲与制作作品即将上线\nJazz compositions & productions coming soon",
    tags: ["Jazz", "Logic Pro"],
  },
];

export default function MusicPage() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { registerRevealOrigin } = usePageTransition();

  useEffect(() => {
    if (titleRef.current) {
      const rect = titleRef.current.getBoundingClientRect();
      registerRevealOrigin(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
  }, [registerRevealOrigin]);

  return (
    <main className="min-h-screen relative">
      {/* Accent color bar at top */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-50" style={{ background: "var(--color-red)" }} />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-12 py-6 backdrop-blur-md bg-[var(--color-bg)]/80">
        <Link
          href="/works"
          className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-white transition-colors duration-300"
        >
          <ArrowLeft size={16} />
          <span className="tracking-[0.2em] uppercase font-light">Back</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/works/music/upload"
            className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-white transition-colors duration-300"
          >
            <Upload size={14} />
            <span className="tracking-[0.2em] uppercase font-light text-[11px]">上传</span>
          </Link>
          <span
            className="text-sm tracking-[0.3em] uppercase font-medium"
            style={{ fontFamily: "var(--font-display)", color: "#8b1a1a" }}
          >
            Music
          </span>
        </div>
      </nav>

      <div className="pt-28 pb-16 px-6 md:px-12 max-w-6xl mx-auto">
        {/* Header — vinyl / waveform style */}
        <div className="mb-20">
          {/* Triangle + wave symbol */}
          <div className="mb-8">
            <svg width="80" height="80" viewBox="0 0 48 48" fill="none" className="opacity-30">
              <polygon points="8,40 24,6 40,40" stroke="#8b1a1a" strokeWidth="1.5" fill="none" />
              <path d="M8 28 Q16 22 24 28 Q32 34 40 28" stroke="#8b1a1a" strokeWidth="1" fill="none" />
            </svg>
          </div>

          <p className="text-[11px] tracking-[0.4em] uppercase font-light mb-4" style={{ color: "#8b1a1a" }}>
            Portfolio · 02
          </p>
          <h1
            ref={titleRef}
            className="text-4xl md:text-6xl font-semibold tracking-[-0.02em] mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Music
          </h1>
          <p className="text-sm md:text-base text-[var(--color-muted)] font-light max-w-lg leading-relaxed">
            爵士乐演奏、Logic Pro 编曲制作与艺术家合作记录。
            <br className="mb-1" />
            <span className="opacity-60">Jazz performance, Logic Pro production & artist collaboration sessions.</span>
          </p>

          <div
            className="mt-8 h-px w-full max-w-md origin-left"
            style={{ background: "linear-gradient(to right, #8b1a1a, transparent)" }}
          />
        </div>

        {/* Projects — horizontal album-style layout */}
        <div className="space-y-6">
          {projects.map((project, i) => (
            <div
              key={project.title}
              className="group flex flex-col md:flex-row border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] hover:bg-[var(--color-card-hover)] transition-all duration-500 overflow-hidden"
            >
              {/* Album art placeholder — waveform visualization */}
              <div
                className="w-full md:w-64 h-48 md:h-auto shrink-0 relative flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #8b1a1a08, #8b1a1a15)" }}
              >
                {/* Waveform bars */}
                <div className="flex items-end gap-[3px] h-16">
                  {Array.from({ length: 24 }).map((_, j) => {
                    const h = Math.sin(j * 0.5) * 30 + 20;
                    return (
                      <div
                        key={j}
                        className="w-[3px] rounded-full"
                        style={{ background: "#8b1a1a", opacity: 0.25, height: h }}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="p-6 md:p-8 flex flex-col justify-center">
                <h3
                  className="text-xl font-medium mb-2 group-hover:text-white transition-colors"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {project.title}
                </h3>
                <p className="text-xs text-[var(--color-muted)] font-light leading-relaxed mb-4">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] tracking-wider uppercase px-2 py-1 rounded border font-light"
                      style={{ borderColor: "#8b1a1a44", color: "#8b1a1a" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-[var(--color-muted)] font-light">
            更多作品即将上线<br /><span className="opacity-60">More works coming soon</span>
          </p>
        </div>
      </div>
    </main>
  );
}
