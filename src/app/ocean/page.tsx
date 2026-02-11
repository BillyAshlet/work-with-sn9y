"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ULTRAMARINE = "rgba(26, 10, 155, 1)";
const MOON_COLOR = "#d8dce8";
const MOON_EDGE = "#a0a8c0";
const REFLECTION_PURPLE = "#6040b0";
const REFLECTION_LIGHT = "#8060d0";

// ─── Canvas Animation ───────────────────────────────────────────────
function useOceanCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  isLoaded: boolean
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    let dpr = 1;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;

    // ─── Background: subtle wave texture on near-black ───
    function drawBackground() {
      if (!ctx) return;
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, W(), H());
    }

    // ─── Perspective width at a given distance from horizon ───
    // At horizon → full width. Further away → narrows to a point (diamond perspective)
    function getSeaWidth(distFromHorizon: number, maxDist: number): number {
      const w = W();
      const fullWidth = w * 0.85;
      // Soft curve narrowing — rounder than strict rhombus
      const t = distFromHorizon / maxDist;
      const ratio = Math.pow(1 - t, 1.4);
      return fullWidth * Math.max(0, ratio);
    }

    // ─── Draw sea waves (upper half — above horizon going up) ───
    // Sea is made of flowing sin-wave strips: ultramarine + black interleaved
    function drawSeaHalf(t: number, yStart: number, yEnd: number, direction: number) {
      if (!ctx) return;
      const w = W();
      const cx = w / 2;
      const totalDist = Math.abs(yEnd - yStart);
      const step = 2.5; // pixel step for each wave line

      for (let dist = 0; dist < totalDist; dist += step) {
        const y = yStart + dist * direction;
        const seaWidth = getSeaWidth(dist, totalDist);
        if (seaWidth <= 0) continue;

        const leftX = cx - seaWidth / 2;
        const rightX = cx + seaWidth / 2;

        // Each line is a sin wave — alternating ultramarine and black
        // Multiple overlapping frequencies for organic feel
        const lineIndex = Math.floor(dist / step);
        const phase = lineIndex * 0.4;

        // Ultramarine wave
        ctx.beginPath();
        ctx.strokeStyle = `rgba(26, 10, 155, ${0.7 + Math.sin(dist * 0.02 + t * 0.3) * 0.2})`;
        ctx.lineWidth = 1.8 + Math.sin(dist * 0.03 + t * 0.2) * 0.5;
        for (let x = leftX; x <= rightX; x += 3) {
          const normX = (x - leftX) / (rightX - leftX); // 0→1
          const amp = 6 + Math.sin(dist * 0.015 + t * 0.4) * 3;
          const wave =
            Math.sin(x * 0.01 + t * 0.7 + phase) * amp +
            Math.sin(x * 0.025 + t * 0.5 + phase * 1.3) * amp * 0.4 +
            Math.sin(x * 0.005 + t * 0.3 + phase * 0.7) * amp * 0.6;
          // Fade at edges
          const edgeFade = Math.min(normX, 1 - normX) * 4;
          const fadedWave = wave * Math.min(1, edgeFade);
          if (x === leftX) ctx.moveTo(x, y + fadedWave);
          else ctx.lineTo(x, y + fadedWave);
        }
        ctx.stroke();

        // Black gap wave (offset) — creates the interleaving
        if (lineIndex % 2 === 0) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(5, 5, 5, ${0.6 + Math.sin(dist * 0.025 + t * 0.2 + 1) * 0.2})`;
          ctx.lineWidth = 2 + Math.sin(dist * 0.02 + t * 0.15 + 2) * 0.8;
          for (let x = leftX; x <= rightX; x += 3) {
            const normX = (x - leftX) / (rightX - leftX);
            const amp = 5 + Math.sin(dist * 0.018 + t * 0.35 + 1) * 2;
            const wave =
              Math.sin(x * 0.012 + t * 0.6 + phase + 1.5) * amp +
              Math.sin(x * 0.028 + t * 0.45 + phase * 1.1 + 0.8) * amp * 0.35;
            const edgeFade = Math.min(normX, 1 - normX) * 4;
            const fadedWave = wave * Math.min(1, edgeFade);
            if (x === leftX) ctx.moveTo(x, y + fadedWave + step * 0.5);
            else ctx.lineTo(x, y + fadedWave + step * 0.5);
          }
          ctx.stroke();
        }
      }
    }

    // ─── Moon: flat geometric circle, partially behind sea ───
    function drawMoon() {
      if (!ctx) return;
      const w = W();
      const h = H();
      const cx = w / 2;
      const horizon = h * 0.5;
      const radius = Math.min(w, h) * 0.085;
      const seaExtent = h * 0.2;
      // Moon bottom edge touches diamond top vertex
      const moonCy = (horizon - seaExtent) - radius;

      ctx.save();

      // Moon body — flat solid, no haze
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = MOON_COLOR;
      ctx.beginPath();
      ctx.arc(cx, moonCy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Strong outline
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = MOON_EDGE;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, moonCy, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }

    // ─── Moon reflection: mirrored below horizon, purple, distorted ───
    function drawMoonReflection(t: number) {
      if (!ctx) return;
      const w = W();
      const h = H();
      const cx = w / 2;
      const horizon = h * 0.5;
      const moonRadius = Math.min(w, h) * 0.085;
      const seaExtent = h * 0.2;
      const moonCy = (horizon - seaExtent) - moonRadius;

      // Mirror position
      const reflCy = horizon + (horizon - moonCy);
      const reflRadius = moonRadius * 0.85;

      ctx.save();

      // Vertical strips with wave displacement
      for (let strip = -reflRadius; strip <= reflRadius; strip += 1.5) {
        const nx = strip / reflRadius;
        const envelope = Math.sqrt(Math.max(0, 1 - nx * nx));
        const halfH = envelope * reflRadius * 1.1;

        const waveX =
          Math.sin(strip * 0.06 + t * 1.2) * 5 +
          Math.sin(strip * 0.12 + t * 1.8) * 2.5;

        const opacity = (0.4 - Math.abs(nx) * 0.2) * envelope;

        ctx.globalAlpha = opacity;
        ctx.fillStyle = REFLECTION_PURPLE;
        ctx.fillRect(
          cx + strip + waveX,
          reflCy - halfH * 0.4,
          2,
          halfH * 1.1
        );

        if (Math.abs(nx) < 0.5) {
          ctx.globalAlpha = opacity * 0.4;
          ctx.fillStyle = REFLECTION_LIGHT;
          ctx.fillRect(
            cx + strip + waveX + 0.5,
            reflCy - halfH * 0.2,
            1,
            halfH * 0.5
          );
        }
      }

      ctx.restore();
    }

    // ─── Animation loop ───
    function draw() {
      if (!ctx) return;
      const w = W();
      const h = H();
      time += 0.016;

      ctx.clearRect(0, 0, w * dpr, h * dpr);

      const horizon = h * 0.5;
      const seaExtent = h * 0.2; // how far sea extends from horizon

      drawBackground();

      // Draw moon behind sea
      drawMoon();

      // Upper sea: horizon going up, perspective narrows upward
      drawSeaHalf(time, horizon, horizon - seaExtent, -1);

      // Lower sea (reflection): horizon going down, perspective narrows downward — symmetric
      drawSeaHalf(time + 0.5, horizon, horizon + seaExtent, 1);

      // Moon reflection on top of lower sea
      drawMoonReflection(time);

      animationId = requestAnimationFrame(draw);
    }

    if (isLoaded) {
      draw();
    }

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef, isLoaded]);
}

// ─── Main Page Component ────────────────────────────────────────────
export default function OceanMiragePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showEnter, setShowEnter] = useState(false);

  useOceanCanvas(canvasRef, isLoaded);

  useEffect(() => {
    const t1 = setTimeout(() => setIsLoaded(true), 100);
    const t2 = setTimeout(() => setShowEnter(true), 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050505] cursor-default select-none">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=ZCOOL+XiaoWei&display=swap"
        rel="stylesheet"
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
      />

      {/* Typography — compact, centered at horizon */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <div className="relative flex flex-col items-center gap-0">
          <AnimatePresence>
            {isLoaded && (
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                className="text-[clamp(3rem,8vw,6.5rem)] leading-none tracking-[0.2em] text-white/90"
                style={{ fontFamily: "'ZCOOL XiaoWei', serif" }}
              >
                汐镜
              </motion.h1>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={isLoaded ? { scaleX: 1 } : {}}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
            className="w-[clamp(100px,16vw,220px)] h-[1px] my-1 origin-center bg-white/25"
          />

          <AnimatePresence>
            {isLoaded && (
              <motion.h2
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
                className="text-[clamp(0.55rem,1vw,0.85rem)] font-medium tracking-[0.5em] text-white/40 uppercase leading-none mt-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Ocean Mirage
              </motion.h2>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showEnter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute bottom-[10vh] left-1/2 -translate-x-1/2 z-10 pointer-events-auto"
          >
            <button
              onClick={() => {
                // TODO: Navigate to main app
              }}
              className="group px-8 py-2.5 border border-white/10 bg-transparent text-white/35 text-[clamp(0.55rem,0.8vw,0.7rem)] font-medium tracking-[0.45em] uppercase transition-all duration-500 hover:border-white/25 hover:text-white/70 cursor-pointer"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Enter
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
