"use client";

import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import { useRef, useEffect } from "react";
import { usePageTransition } from "@/app/components/PageTransition";

const pieces = [
  {
    title: "Coming Soon",
    excerpt: "随笔与散文即将上线\nEssays & prose coming soon",
    date: "TBD",
  },
];

export default function WritingPage() {
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
      <div className="fixed top-0 left-0 right-0 h-[2px] z-50" style={{ background: "var(--color-teal)" }} />

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
            href="/works/writing/upload"
            className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-white transition-colors duration-300"
          >
            <Upload size={14} />
            <span className="tracking-[0.2em] uppercase font-light text-[11px]">上传</span>
          </Link>
          <span
            className="text-sm tracking-[0.3em] uppercase font-medium"
            style={{ fontFamily: "var(--font-display)", color: "#1a5c5c" }}
          >
            Writing
          </span>
        </div>
      </nav>

      <div className="pt-28 pb-16 px-6 md:px-12 max-w-3xl mx-auto">
        {/* Header — editorial / literary style, narrower max-width */}
        <div className="mb-20">
          {/* Diagonal + lines symbol */}
          <div className="mb-8">
            <svg width="80" height="80" viewBox="0 0 48 48" fill="none" className="opacity-30">
              <line x1="12" y1="40" x2="36" y2="8" stroke="#1a5c5c" strokeWidth="2" />
              <line x1="10" y1="18" x2="38" y2="18" stroke="#1a5c5c" strokeWidth="0.6" />
              <line x1="10" y1="24" x2="38" y2="24" stroke="#1a5c5c" strokeWidth="0.6" />
              <line x1="10" y1="30" x2="38" y2="30" stroke="#1a5c5c" strokeWidth="0.6" />
            </svg>
          </div>

          <p className="text-[11px] tracking-[0.4em] uppercase font-light mb-4" style={{ color: "#1a5c5c" }}>
            Portfolio · 04
          </p>
          <h1
            ref={titleRef}
            className="text-4xl md:text-6xl font-semibold tracking-[-0.02em] mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Writing
          </h1>
          <p className="text-sm md:text-base text-[var(--color-muted)] font-light max-w-lg leading-relaxed">
            随笔、散文与思考。受海明威与史蒂芬·金启发的文字实验。
            <br className="mb-1" />
            <span className="opacity-60">Essays, prose & reflections. Writing experiments inspired by Hemingway & Stephen King.</span>
          </p>

          <div
            className="mt-8 h-px w-full max-w-md origin-left"
            style={{ background: "linear-gradient(to right, #1a5c5c, transparent)" }}
          />
        </div>

        {/* Pieces — editorial / single-column literary layout */}
        <div className="space-y-12">
          {pieces.map((piece, i) => (
            <article
              key={piece.title}
              className="group cursor-pointer"
            >
              {/* Date */}
              <p className="text-[10px] tracking-[0.3em] uppercase font-light mb-3" style={{ color: "#1a5c5c" }}>
                {piece.date}
              </p>

              {/* Title — serif for literary feel */}
              <h2
                className="text-2xl md:text-3xl font-normal mb-4 group-hover:text-white transition-colors duration-500"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {piece.title}
              </h2>

              {/* Excerpt */}
              <p className="text-sm text-[var(--color-muted)] font-light leading-[1.8] max-w-xl">
                {piece.excerpt}
              </p>

              {/* Divider */}
              <div
                className="mt-8 h-px w-16 group-hover:w-32 transition-all duration-700"
                style={{ background: "#1a5c5c44" }}
              />
            </article>
          ))}
        </div>

        <div className="mt-20 text-center">
          <p
            className="text-lg font-light italic"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-muted)", opacity: 0.5 }}
          >
            &ldquo;All you have to do is write one true sentence.&rdquo;
          </p>
          <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-muted)] mt-3 font-light opacity-40">
            — Ernest Hemingway
          </p>
        </div>
      </div>
    </main>
  );
}
