"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

const ease = [0.22, 1, 0.36, 1] as const;

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease } },
};

const clipReveal = {
  hidden: { clipPath: "inset(100% 0 0 0)" },
  visible: {
    clipPath: "inset(0% 0 0 0)",
    transition: { duration: 1.2, ease },
  },
};

const lineGrow = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 1.4, ease, delay: 0.6 } },
};

export default function LandingPage() {
  const [time, setTime] = useState("");
  const router = useRouter();
  const [transPhase, setTransPhase] = useState<"idle" | "distort" | "ball">("idle");
  const inkCanvasRef = useRef<HTMLCanvasElement>(null);
  const inkAnimRef = useRef<number>(0);
  const ballOriginRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const handleStart = useCallback(() => {
    if (transPhase !== "idle") return;
    // 1: title blurs + morphs into ball
    setTransPhase("distort");
    // 2: ball phase — canvas draws the white ball, then expands as circle
    setTimeout(() => setTransPhase("ball"), 210);
    // 3: navigate after circle fills screen
    setTimeout(() => router.push("/hub?entry=ink"), 850);
  }, [transPhase, router]);

  const isTransActive = transPhase !== "idle";

  /* ── Ink explosion animation (Canvas metaballs) ── */
  useEffect(() => {
    if (transPhase !== "ball") return;
    const canvas = inkCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const w = canvas.width;
    const h = canvas.height;
    // Use the title's actual position as the origin
    const originEl = ballOriginRef.current;
    let cx = w / 2;
    let cy = h / 2;
    if (originEl) {
      const rect = originEl.getBoundingClientRect();
      cx = rect.left + rect.width / 2;
      cy = rect.top + rect.height / 2;
    }

    // Max radius needed to cover entire screen from the origin point
    const maxR = Math.sqrt(
      Math.max(cx, w - cx) ** 2 + Math.max(cy, h - cy) ** 2
    ) + 20;

    // Phase timing
    const ballDuration = 63; // hold as small ball
    const expandDuration = 340; // fast circle expansion

    const start = Date.now();
    let running = true;

    const render = () => {
      if (!running) return;
      const elapsed = Date.now() - start;
      ctx.clearRect(0, 0, w, h);

      let r: number;
      if (elapsed < ballDuration) {
        // Phase 1: solid white ball, slight grow
        r = 20 + (elapsed / ballDuration) * 5;
      } else {
        // Phase 2: circle expands — piecewise: linear then power function
        const t = Math.min((elapsed - ballDuration) / expandDuration, 1);
        let eased: number;
        if (t < 0.35) {
          // Linear ramp: 0 → 0.15
          eased = (t / 0.35) * 0.15;
        } else {
          // Power function burst: 0.15 → 1.0 (much faster than exponential)
          const pt = (t - 0.35) / 0.65; // 0..1
          eased = 0.15 + Math.pow(pt, 0.5) * 0.85; // sqrt = concave up, fast start
        }
        r = 25 + eased * (maxR - 25);
      }

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();

      if (elapsed < ballDuration + expandDuration) {
        inkAnimRef.current = requestAnimationFrame(render);
      }
    };

    inkAnimRef.current = requestAnimationFrame(render);
    return () => {
      running = false;
      cancelAnimationFrame(inkAnimRef.current);
    };
  }, [transPhase]);

  /* ── Glass distortion on title ── */
  const titleRef = useRef<HTMLDivElement>(null);
  const [lens, setLens] = useState({ x: 0, y: 0, active: false });

  const handleTitleMove = useCallback((e: React.MouseEvent) => {
    if (isTransActive) return;
    const rect = titleRef.current?.getBoundingClientRect();
    if (!rect) return;
    setLens({ x: e.clientX - rect.left, y: e.clientY - rect.top, active: true });
  }, [isTransActive]);

  const handleTitleLeave = useCallback(() => {
    setLens((prev) => ({ ...prev, active: false }));
  }, []);

  return (
    <main
      className="relative h-screen flex flex-col items-center justify-center overflow-hidden cursor-pointer"
      onClick={handleStart}
    >
      {/* Geometric background shapes */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Teal breathing ring — hidden during transition */}
        {!isTransActive && <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full"
          >
            {/* Outer glow ring — solid, breathing */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: "3px solid #2C365E", boxShadow: "0 0 20px 4px rgba(44,54,94,0.5), 0 0 50px 10px rgba(44,54,94,0.2), inset 0 0 30px 5px rgba(44,54,94,0.08)" }}
              animate={{ scale: [1, 1.03, 1], opacity: [0.4, 0.75, 0.4] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Inner glow ring — solid, offset breathing */}
            <motion.div
              className="absolute inset-8 rounded-full"
              style={{ border: "2px solid #2C365E", boxShadow: "0 0 16px 3px rgba(44,54,94,0.4), inset 0 0 20px 3px rgba(44,54,94,0.06)" }}
              animate={{ scale: [1, 0.97, 1], opacity: [0.25, 0.5, 0.25] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />
            {/* Bright highlight arc — breathing accent */}
            <motion.div
              className="absolute inset-[-2px] rounded-full"
              style={{ border: "1px solid transparent", borderTopColor: "rgba(80,100,180,0.4)", borderRightColor: "rgba(80,100,180,0.15)" }}
              animate={{ rotate: [0, 360], opacity: [0.3, 0.7, 0.3] }}
              transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
            />
            {/* Ambient fluorescent glow — stronger */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ boxShadow: "0 0 100px 30px rgba(44,54,94,0.18), 0 0 180px 60px rgba(44,54,94,0.08), 0 0 300px 100px rgba(44,54,94,0.04)" }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.5, ease, delay: 0.5 }}
          className="absolute top-0 right-[15%] w-[2px] h-full origin-top"
          style={{ background: `linear-gradient(to bottom, transparent, var(--color-red), transparent)`, opacity: 0.25 }}
        />
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, ease, delay: 0.7 }}
          className="absolute top-[40%] left-0 h-[2px] w-full origin-left"
          style={{ background: `linear-gradient(to right, transparent, var(--color-ochre), transparent)`, opacity: 0.2 }}
        />
        <motion.div
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: 0.22, rotate: 45 }}
          transition={{ duration: 1.5, delay: 1 }}
          className="absolute bottom-[20%] left-[12%] w-16 h-16 md:w-24 md:h-24 animate-float"
          style={{ border: "2px solid var(--color-teal)", boxShadow: "0 0 15px 3px rgba(26,92,92,0.2)" }}
        />
        {/* ── Texture: orderly grids & ruled lines ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.06 }}
          transition={{ duration: 2, delay: 1 }}
          className="absolute top-[6%] left-[8%] right-[8%] h-[80px] md:h-[100px]"
          style={{
            backgroundImage: "repeating-linear-gradient(to bottom, white 0px, white 0.5px, transparent 0.5px, transparent 18px)",
            backgroundSize: "100% 18px",
          }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ duration: 2, delay: 1.2 }}
          className="absolute bottom-[6%] left-[8%] right-[8%] h-[70px] md:h-[90px]"
          style={{
            backgroundImage: "repeating-linear-gradient(to bottom, white 0px, white 0.5px, transparent 0.5px, transparent 18px)",
            backgroundSize: "100% 18px",
          }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ duration: 2, delay: 1.3 }}
          className="absolute top-[15%] bottom-[15%] left-[5%] w-[80px] md:w-[100px]"
          style={{
            backgroundImage: "repeating-linear-gradient(to right, white 0px, white 0.5px, transparent 0.5px, transparent 20px)",
            backgroundSize: "20px 100%",
          }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ duration: 2, delay: 1.4 }}
          className="absolute top-[15%] bottom-[15%] right-[5%] w-[80px] md:w-[100px]"
          style={{
            backgroundImage: "repeating-linear-gradient(to right, white 0px, white 0.5px, transparent 0.5px, transparent 20px)",
            backgroundSize: "20px 100%",
          }}
        />
      </div>

      {/* Time — top right */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="fixed top-5 right-6 md:right-10 z-40"
      >
        <span className="text-[10px] font-mono text-[var(--color-muted)] tabular-nums">
          {time}
        </span>
      </motion.div>

      {/* Ink explosion canvas overlay */}
      <canvas
        ref={inkCanvasRef}
        className="fixed inset-0 z-[60] pointer-events-none"
        style={{ display: transPhase === "ball" ? "block" : "none" }}
      />

      {/* Hero content */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center px-6"
      >
        <motion.p
          variants={fadeUp}
          className="text-[11px] md:text-xs tracking-[0.5em] uppercase font-light text-[var(--color-muted)] mb-8"
        >
          Billy Ashlet
        </motion.p>

        <motion.div variants={fadeUp} className="mb-8 overflow-visible">
          <div
            ref={titleRef}
            onMouseMove={handleTitleMove}
            onMouseLeave={handleTitleLeave}
            className="relative overflow-visible p-8 -m-8"
          >
            {/* Bubble lens — hidden during transition */}
            {!isTransActive && (
              <div
                className="absolute rounded-full pointer-events-none z-10 transition-opacity duration-200"
                style={{
                  width: 50,
                  height: 50,
                  left: lens.x - 25,
                  top: lens.y - 25,
                  opacity: lens.active ? 1 : 0,
                  boxShadow: "inset 0 -4px 10px 2px rgba(255,255,255,0.12), inset 0 2px 6px 1px rgba(255,255,255,0.06), 0 0 12px 3px rgba(255,255,255,0.08)",
                  background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.08) 35%, rgba(255,255,255,0.02) 60%, transparent 75%)",
                  border: "none",
                  backdropFilter: "blur(1.5px) contrast(1.1) brightness(1.15)",
                  WebkitBackdropFilter: "blur(1.5px) contrast(1.1) brightness(1.15)",
                  mask: "radial-gradient(circle, black 40%, transparent 70%)",
                  WebkitMaskImage: "radial-gradient(circle, black 40%, transparent 70%)",
                }}
              />
            )}
            {/* Title — blurs away while ball forms */}
            <div className="relative" ref={ballOriginRef}>
              <motion.h1
                className="text-5xl sm:text-6xl md:text-8xl lg:text-[9rem] font-semibold tracking-[-0.03em] text-center leading-[0.9]"
                animate={
                  transPhase !== "idle"
                    ? { opacity: 0, filter: "blur(20px)", scale: 0.4 }
                    : { opacity: 1, filter: "blur(0px)", scale: 1 }
                }
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              >
                <div>A Brand</div>
                <div>
                  <span className="italic font-normal" style={{ fontFamily: "var(--font-serif)" }}>New</span>{" "}
                  World
                </div>
              </motion.h1>
              {/* White ball — grows from center of title as text blurs (drawn on canvas in ball phase) */}
              {transPhase === "distort" && (
                <motion.div
                  className="absolute top-1/2 left-1/2 rounded-full bg-white"
                  style={{ x: "-50%", y: "-50%" }}
                  initial={{ width: 0, height: 0, opacity: 0 }}
                  animate={{ width: 40, height: 40, opacity: 1 }}
                  transition={{ duration: 0.19, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={lineGrow}
          className="w-24 md:w-40 h-[2.5px] mb-8 origin-center rounded-full"
          style={{ background: "var(--color-red)", boxShadow: "0 0 12px 2px rgba(139,26,26,0.3)" }}
          animate={isTransActive ? { opacity: 0, scaleX: 0 } : {}}
          transition={{ duration: 0.3 }}
        />

        <motion.p
          variants={fadeUp}
          className="text-[11px] md:text-xs tracking-[0.4em] uppercase font-light text-[var(--color-muted)] text-center mb-12"
          animate={isTransActive ? { opacity: 0 } : {}}
          transition={{ duration: 0.3 }}
        >
          Be Brave &nbsp;&nbsp;·&nbsp;&nbsp; Be Honest &nbsp;&nbsp;·&nbsp;&nbsp; Be Caring
        </motion.p>

        <motion.div
          variants={fadeUp}
          onClick={handleStart}
          className="group flex flex-col items-center gap-3 cursor-pointer -mt-2"
          animate={isTransActive ? { opacity: 0 } : {}}
          transition={{ duration: 0.3 }}
        >
          <motion.p
            className="text-2xl md:text-3xl lg:text-4xl font-light tracking-[0.08em] text-white/50 transition-all duration-500 group-hover:text-white/80 group-hover:tracking-[0.12em]"
            style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
          >
            Welcome :)
          </motion.p>
          <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <span className="text-[9px] tracking-[0.4em] uppercase text-white/30 font-light">
              click to enter
            </span>
            <motion.svg
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              className="text-white/40"
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <span className="text-[9px] tracking-[0.3em] uppercase text-[var(--color-muted)] font-light opacity-40">
          © {new Date().getFullYear()} Billy Ashlet
        </span>
      </div>
    </main>
  );
}
