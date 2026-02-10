"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePageTransition } from "../components/PageTransition";

const ease = [0.22, 1, 0.36, 1] as const;

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease } },
};

/* ── SVG geometric symbols ── */
function EngineeringSymbol({ color, size = 48 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <polygon points="24,4 42,14 42,34 24,44 6,34 6,14" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="24" cy="24" r="8" stroke={color} strokeWidth="1" fill="none" />
      <line x1="24" y1="4" x2="24" y2="16" stroke={color} strokeWidth="0.8" />
      <line x1="24" y1="32" x2="24" y2="44" stroke={color} strokeWidth="0.8" />
    </svg>
  );
}

function MusicSymbol({ color, size = 48 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <polygon points="8,40 24,6 40,40" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M8 28 Q16 22 24 28 Q32 34 40 28" stroke={color} strokeWidth="1" fill="none" />
    </svg>
  );
}

function DesignSymbol({ color, size = 48 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="24" y="4" width="28" height="28" transform="rotate(45 24 24)" stroke={color} strokeWidth="1.5" fill="none" />
      <line x1="24" y1="4" x2="24" y2="44" stroke={color} strokeWidth="0.6" />
      <line x1="4" y1="24" x2="44" y2="24" stroke={color} strokeWidth="0.6" />
    </svg>
  );
}

function WritingSymbol({ color, size = 48 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <line x1="12" y1="40" x2="36" y2="8" stroke={color} strokeWidth="2" />
      <line x1="10" y1="18" x2="38" y2="18" stroke={color} strokeWidth="0.6" />
      <line x1="10" y1="24" x2="38" y2="24" stroke={color} strokeWidth="0.6" />
      <line x1="10" y1="30" x2="38" y2="30" stroke={color} strokeWidth="0.6" />
    </svg>
  );
}

const symbolComponents = {
  engineering: EngineeringSymbol,
  music: MusicSymbol,
  design: DesignSymbol,
  writing: WritingSymbol,
};

/* ── category cards ── */
const categories = [
  {
    key: "engineering" as const,
    title: "Engineering",
    titleCn: "工程",
    sub: "SolidWorks · Zemax · Dev Logs",
    color: "var(--color-indigo)",
    rawColor: "#1a2a6c",
    hoverBg: "#1a2a6c",
    href: "/works/engineering",
  },
  {
    key: "music" as const,
    title: "Music",
    titleCn: "音乐",
    sub: "Jazz · Production · Sessions",
    color: "var(--color-red)",
    rawColor: "#8b1a1a",
    hoverBg: "#8b1a1a",
    href: "/works/music",
  },
  {
    key: "design" as const,
    title: "Design",
    titleCn: "设计",
    sub: "Graphic · Interaction · Web",
    color: "var(--color-ochre)",
    rawColor: "#8b6914",
    hoverBg: "#8b6914",
    href: "/works/design",
  },
  {
    key: "writing" as const,
    title: "Writing",
    titleCn: "写作",
    sub: "Essays · Prose · Thoughts",
    color: "var(--color-teal)",
    rawColor: "#1a5c5c",
    hoverBg: "#1a5c5c",
    href: "/works/writing",
  },
];

/* ── Strip reveal config ── */
const STRIP_COUNT = 10;
const STRIP_STAGGER = 0.06;
const STRIP_DURATION = 0.7;
const STRIP_DELAY_BASE = 0.15;

export default function WorksPage() {
  const { triggerTransition } = usePageTransition();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [showReveal, setShowReveal] = useState(true);

  useEffect(() => {
    // Remove the reveal overlay after all strips have animated out
    const totalTime = (STRIP_DELAY_BASE + STRIP_COUNT * STRIP_STAGGER + STRIP_DURATION) * 1000 + 200;
    const timer = setTimeout(() => setShowReveal(false), totalTime);
    return () => clearTimeout(timer);
  }, []);

  const handleCardClick = useCallback(
    (e: React.MouseEvent, cat: (typeof categories)[number]) => {
      e.preventDefault();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      triggerTransition({
        color: cat.rawColor,
        href: cat.href,
        originX: rect.left + rect.width / 2,
        originY: rect.top + rect.height / 2,
      });
    },
    [triggerTransition]
  );

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-10 py-5 backdrop-blur-md bg-[var(--color-bg)]/80"
      >
        <Link
          href="/hub"
          className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-white transition-colors duration-300"
        >
          <ArrowLeft size={16} />
          <span className="tracking-[0.2em] uppercase font-light">返回 / Back</span>
        </Link>
        <span
          className="text-[11px] tracking-[0.35em] uppercase font-medium"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Works
        </span>
      </motion.nav>

      {/* Marquee divider */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="fixed top-[60px] left-0 right-0 z-30 py-3 border-b border-[var(--color-border)] overflow-hidden bg-[var(--color-bg)]/60 backdrop-blur-sm"
      >
        <div className="flex animate-marquee whitespace-nowrap">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="text-[10px] tracking-[0.5em] uppercase font-light text-[var(--color-muted)] mx-12"
            >
              Engineering &nbsp;·&nbsp; Music &nbsp;·&nbsp; Design &nbsp;·&nbsp; Writing &nbsp;·&nbsp; Portfolio
            </span>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <div className="pt-32 pb-16 px-6 md:px-10 max-w-6xl mx-auto">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={fadeUp} className="mb-14">
            <p className="text-[11px] tracking-[0.4em] uppercase text-[var(--color-muted)] font-light mb-4">
              作品集 / Portfolio
            </p>
            <h1
              className="text-4xl md:text-6xl font-semibold tracking-[-0.02em] mb-5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Selected Works
            </h1>
            {/* 4-color hint bar */}
            <div className="flex items-center gap-[2px] h-[2px] w-40 md:w-56">
              <motion.div
                className="flex-1 h-full rounded-full"
                style={{ background: "#1a2a6c" }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 0.5 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.div
                className="flex-1 h-full rounded-full"
                style={{ background: "#8b1a1a" }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 0.5 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.div
                className="flex-1 h-full rounded-full"
                style={{ background: "#8b6914" }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 0.5 }}
                transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.div
                className="flex-1 h-full rounded-full"
                style={{ background: "#1a5c5c" }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 0.5 }}
                transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </motion.div>

          {/* Category cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {categories.map((cat, i) => {
              const Symbol = symbolComponents[cat.key];
              const isHovered = hoveredIdx === i;
              return (
                <motion.div
                  key={cat.title}
                  variants={scaleIn}
                >
                  <motion.div
                    onClick={(e) => handleCardClick(e, cat)}
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className="group relative rounded-lg p-8 md:p-10 cursor-pointer overflow-hidden h-full min-h-[200px] md:min-h-[220px]"
                    style={{
                      border: `1px solid ${isHovered ? cat.rawColor + "60" : cat.rawColor + "15"}`,
                      transition: "border-color 0.5s ease",
                    }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {/* Default whitish background with color hint */}
                    <div
                      className="absolute inset-0 transition-opacity duration-700"
                      style={{
                        background: `linear-gradient(135deg, ${cat.rawColor}0a, rgba(255,255,255,0.02), transparent)`,
                        opacity: isHovered ? 0 : 1,
                      }}
                    />

                    {/* Saturated color background on hover */}
                    <div
                      className="absolute inset-0 transition-opacity duration-700"
                      style={{
                        background: `linear-gradient(135deg, ${cat.rawColor}30, ${cat.rawColor}10, transparent)`,
                        opacity: isHovered ? 1 : 0,
                      }}
                    />

                    {/* Color wash from left edge */}
                    <div
                      className="absolute inset-0 transition-all duration-700"
                      style={{
                        background: `radial-gradient(ellipse at 0% 50%, ${cat.rawColor}40, transparent 60%)`,
                        opacity: isHovered ? 1 : 0,
                      }}
                    />

                    {/* Accent line on left — white default, colored on hover */}
                    <div
                      className="absolute left-0 top-0 w-[3px] transition-all duration-700 ease-out"
                      style={{
                        background: isHovered ? cat.rawColor : cat.rawColor + "40",
                        height: isHovered ? "100%" : "30%",
                      }}
                    />

                    {/* Geometric symbol — white default, colored on hover */}
                    <div
                      className="absolute top-6 right-6 md:top-8 md:right-8 transition-all duration-700"
                      style={{
                        opacity: isHovered ? 0.6 : 0.15,
                        transform: isHovered ? "scale(1.15) rotate(5deg)" : "scale(1) rotate(0deg)",
                      }}
                    >
                      <Symbol color={isHovered ? cat.rawColor : cat.rawColor + "60"} size={60} />
                    </div>

                    <div className="relative z-10 flex flex-col justify-end h-full">
                      <div>
                        {/* Chinese subtitle */}
                        <p
                          className="text-[10px] tracking-[0.4em] uppercase font-light mb-2 transition-colors duration-500"
                          style={{ color: isHovered ? cat.rawColor + "aa" : cat.rawColor + "35" }}
                        >
                          {cat.titleCn}
                        </p>
                        <h3
                          className="text-2xl md:text-3xl font-medium tracking-[-0.01em] mb-3 transition-colors duration-500"
                          style={{
                            fontFamily: "var(--font-display)",
                            color: isHovered ? "white" : "rgba(255,255,255,0.75)",
                          }}
                        >
                          {cat.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          <p
                            className="text-xs md:text-sm font-light tracking-wide transition-colors duration-500"
                            style={{ color: isHovered ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)" }}
                          >
                            {cat.sub}
                          </p>
                          <motion.div
                            animate={{ x: isHovered ? 4 : 0 }}
                            transition={{ duration: 0.4 }}
                          >
                            <ArrowRight
                              size={18}
                              className="shrink-0 ml-4 transition-colors duration-500"
                              style={{ color: isHovered ? "white" : "rgba(255,255,255,0.2)" }}
                            />
                          </motion.div>
                        </div>
                      </div>
                    </div>

                    {/* Number watermark */}
                    <span
                      className="absolute bottom-3 right-6 text-[80px] md:text-[100px] font-bold leading-none transition-all duration-700 pointer-events-none select-none"
                      style={{
                        fontFamily: "var(--font-display)",
                        opacity: isHovered ? 0.06 : 0.025,
                        color: isHovered ? cat.rawColor : cat.rawColor + "50",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {/* Bottom glow line */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-px transition-opacity duration-700"
                      style={{
                        background: `linear-gradient(to right, transparent, ${cat.rawColor}50, transparent)`,
                        opacity: isHovered ? 1 : 0,
                      }}
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="border-t border-[var(--color-border)] py-6 px-6 md:px-10 flex items-center justify-between text-[10px] text-[var(--color-muted)] tracking-[0.2em] uppercase font-light"
      >
        <span>© {new Date().getFullYear()} Billy Ashlet</span>
        <span>A Brand New World</span>
      </motion.footer>

      {/* ═══ White strip reveal overlay ═══ */}
      {showReveal && (
        <div className="fixed inset-0 z-[90] pointer-events-none flex flex-col">
          {Array.from({ length: STRIP_COUNT }).map((_, i) => {
            const goLeft = i % 2 === 0;
            const delay = STRIP_DELAY_BASE + i * STRIP_STAGGER;
            return (
              <motion.div
                key={i}
                className="flex-1 w-full"
                style={{ background: "white" }}
                initial={{ x: 0 }}
                animate={{ x: goLeft ? "-105%" : "105%" }}
                transition={{
                  duration: STRIP_DURATION,
                  delay,
                  ease: [0.76, 0, 0.24, 1],
                }}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}
