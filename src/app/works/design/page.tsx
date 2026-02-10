"use client";

import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import { useRef, useEffect } from "react";
import { usePageTransition } from "@/app/components/PageTransition";

const projects = [
  {
    title: "Coming Soon",
    description: "平面设计与交互设计作品即将上线\nGraphic & interaction design works coming soon",
    tags: ["Graphic", "Interaction"],
  },
];

export default function DesignPage() {
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
      <div className="fixed top-0 left-0 right-0 h-[2px] z-50" style={{ background: "var(--color-ochre)" }} />

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
            href="/works/design/upload"
            className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-white transition-colors duration-300"
          >
            <Upload size={14} />
            <span className="tracking-[0.2em] uppercase font-light text-[11px]">上传</span>
          </Link>
          <span
            className="text-sm tracking-[0.3em] uppercase font-medium"
            style={{ fontFamily: "var(--font-display)", color: "#8b6914" }}
          >
            Design
          </span>
        </div>
      </nav>

      <div className="pt-28 pb-16 px-6 md:px-12 max-w-6xl mx-auto">
        {/* Header — composition / grid style */}
        <div className="mb-20">
          {/* Diamond + grid symbol */}
          <div className="mb-8">
            <svg width="80" height="80" viewBox="0 0 48 48" fill="none" className="opacity-30">
              <rect
                x="24" y="4" width="28" height="28"
                transform="rotate(45 24 24)"
                stroke="#8b6914"
                strokeWidth="1.5"
                fill="none"
              />
              <line x1="24" y1="4" x2="24" y2="44" stroke="#8b6914" strokeWidth="0.6" />
              <line x1="4" y1="24" x2="44" y2="24" stroke="#8b6914" strokeWidth="0.6" />
            </svg>
          </div>

          <p className="text-[11px] tracking-[0.4em] uppercase font-light mb-4" style={{ color: "#8b6914" }}>
            Portfolio · 03
          </p>
          <h1
            ref={titleRef}
            className="text-4xl md:text-6xl font-semibold tracking-[-0.02em] mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Design
          </h1>
          <p className="text-sm md:text-base text-[var(--color-muted)] font-light max-w-lg leading-relaxed">
            平面设计、网站交互设计与视觉实验。
            <br className="mb-1" />
            <span className="opacity-60">Graphic design, web interaction design & visual experiments.</span>
          </p>

          <div
            className="mt-8 h-px w-full max-w-md origin-left"
            style={{ background: "linear-gradient(to right, #8b6914, transparent)" }}
          />
        </div>

        {/* Projects — masonry / gallery style with asymmetric grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
          {projects.map((project, i) => (
            <div
              key={project.title}
              className="group break-inside-avoid border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] hover:bg-[var(--color-card-hover)] transition-all duration-500 overflow-hidden"
            >
              {/* Design canvas placeholder — golden ratio grid */}
              <div
                className="relative aspect-[4/3] flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #8b691408, #8b691415)" }}
              >
                {/* Compositional grid lines */}
                <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 300" fill="none">
                  <line x1="148" y1="0" x2="148" y2="300" stroke="#8b6914" strokeWidth="0.5" />
                  <line x1="252" y1="0" x2="252" y2="300" stroke="#8b6914" strokeWidth="0.5" />
                  <line x1="0" y1="112" x2="400" y2="112" stroke="#8b6914" strokeWidth="0.5" />
                  <line x1="0" y1="188" x2="400" y2="188" stroke="#8b6914" strokeWidth="0.5" />
                  {/* Diagonal */}
                  <line x1="0" y1="0" x2="400" y2="300" stroke="#8b6914" strokeWidth="0.3" strokeDasharray="4 4" />
                </svg>
                <span
                  className="text-5xl font-bold opacity-[0.04]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="p-5">
                <h3
                  className="text-base font-medium mb-2 group-hover:text-white transition-colors"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {project.title}
                </h3>
                <p className="text-xs text-[var(--color-muted)] font-light leading-relaxed mb-3">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] tracking-wider uppercase px-2 py-1 rounded border font-light"
                      style={{ borderColor: "#8b691444", color: "#8b6914" }}
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
