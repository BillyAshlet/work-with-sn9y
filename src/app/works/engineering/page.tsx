"use client";

import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import { useRef, useEffect } from "react";
import { usePageTransition } from "@/app/components/PageTransition";

const projects = [
  {
    title: "Coming Soon",
    description: "SolidWorks 和 Zemax 开发日志即将上线\nSolidWorks & Zemax dev logs coming soon",
    tags: ["SolidWorks", "Zemax"],
  },
];

export default function EngineeringPage() {
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
      <div className="fixed top-0 left-0 right-0 h-[2px] z-50" style={{ background: "var(--color-indigo)" }} />

      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-12 py-6 backdrop-blur-md bg-[var(--color-bg)]/80"
      >
        <Link
          href="/works"
          className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-white transition-colors duration-300"
        >
          <ArrowLeft size={16} />
          <span className="tracking-[0.2em] uppercase font-light">Back</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/works/engineering/upload"
            className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-white transition-colors duration-300"
          >
            <Upload size={14} />
            <span className="tracking-[0.2em] uppercase font-light text-[11px]">上传</span>
          </Link>
          <span
            className="text-sm tracking-[0.3em] uppercase font-medium"
            style={{ fontFamily: "var(--font-display)", color: "#1a2a6c" }}
          >
            Engineering
          </span>
        </div>
      </nav>

      <div className="pt-28 pb-16 px-6 md:px-12 max-w-6xl mx-auto">
        {/* Header — technical blueprint style */}
        <div className="mb-20">
          {/* Hexagon symbol */}
          <div className="mb-8">
            <svg width="80" height="80" viewBox="0 0 48 48" fill="none" className="opacity-30">
              <polygon
                points="24,4 42,14 42,34 24,44 6,34 6,14"
                stroke="#1a2a6c"
                strokeWidth="1.5"
                fill="none"
              />
              <circle cx="24" cy="24" r="8" stroke="#1a2a6c" strokeWidth="1" fill="none" />
              <line x1="24" y1="4" x2="24" y2="16" stroke="#1a2a6c" strokeWidth="0.8" />
              <line x1="24" y1="32" x2="24" y2="44" stroke="#1a2a6c" strokeWidth="0.8" />
            </svg>
          </div>

          <p className="text-[11px] tracking-[0.4em] uppercase font-light mb-4" style={{ color: "#1a2a6c" }}>
            Portfolio · 01
          </p>
          <h1
            ref={titleRef}
            className="text-4xl md:text-6xl font-semibold tracking-[-0.02em] mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Engineering
          </h1>
          <p className="text-sm md:text-base text-[var(--color-muted)] font-light max-w-lg leading-relaxed">
            精密工程与光学设计的开发日志。SolidWorks 建模、Zemax 光学仿真与技术文档。
            <br className="mb-1" />
            <span className="opacity-60">Dev logs for precision engineering & optical design. SolidWorks modeling, Zemax optical simulation & technical documentation.</span>
          </p>

          {/* Technical grid decoration */}
          <div
            className="mt-8 h-px w-full max-w-md origin-left"
            style={{ background: "linear-gradient(to right, #1a2a6c, transparent)" }}
          />
        </div>

        {/* Projects grid — blueprint/technical card style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <div
              key={project.title}
              className="group relative border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] hover:bg-[var(--color-card-hover)] transition-all duration-500 overflow-hidden"
            >
              {/* Blueprint grid pattern header */}
              <div
                className="h-40 relative flex items-center justify-center"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(26,42,108,0.06) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(26,42,108,0.06) 1px, transparent 1px)
                  `,
                  backgroundSize: "20px 20px",
                }}
              >
                <span
                  className="text-6xl font-bold opacity-[0.06]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {/* Corner marks — technical drawing style */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t border-l" style={{ borderColor: "#1a2a6c33" }} />
                <div className="absolute top-3 right-3 w-4 h-4 border-t border-r" style={{ borderColor: "#1a2a6c33" }} />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l" style={{ borderColor: "#1a2a6c33" }} />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r" style={{ borderColor: "#1a2a6c33" }} />
              </div>

              <div className="p-6">
                <h3
                  className="text-lg font-medium mb-2 group-hover:text-white transition-colors"
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
                      style={{ borderColor: "#1a2a6c44", color: "#1a2a6c" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state hint */}
        <div className="mt-16 text-center">
          <p className="text-sm text-[var(--color-muted)] font-light">
            更多项目即将上线<br /><span className="opacity-60">More projects coming soon</span>
          </p>
        </div>
      </div>
    </main>
  );
}
