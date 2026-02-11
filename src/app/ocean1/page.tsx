"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// ─── Canvas ─────────────────────────────────────────────────────────
function useOceanCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  isLoaded: boolean,
  dimFactor: number = 1, // 1 = normal, 0 = fully dimmed
  phase: string = "landing"
) {
  // Use refs so changes don't restart the effect
  const dimRef = useRef(dimFactor);
  const phaseRef = useRef(phase);
  dimRef.current = dimFactor;
  phaseRef.current = phase;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    let introTime = 0;
    let transitionTime = 0; // accumulates during transitioning phase
    let dpr = 1;

    // Intro timing
    const MOON_RISE_START = 1.5; // seconds after load
    const MOON_RISE_DURATION = 0.5; // seconds for moon to fully rise

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

    // ─── Sky: deep blue gradient, very dark ───
    function drawSky(envBright: number, moonProgress: number) {
      if (!ctx) return;
      const w = W();
      const h = H();
      const horizon = h * 0.52;

      // Background black
      const bg = Math.floor(3 * envBright);
      ctx.fillStyle = `rgb(${bg}, ${bg}, ${Math.floor(8 * envBright)})`;
      ctx.fillRect(0, 0, w, h);

      // Grey haze/glow along horizon, above midline, behind everything
      const horizon2 = h * 0.52;
      const hazeH = h * 0.25; // how far up the haze extends
      for (let y = horizon2; y > horizon2 - hazeH; y -= 2) {
        const frac = (horizon2 - y) / hazeH; // 0 at horizon, 1 at top
        const fade = Math.pow(1 - frac, 2.5); // strong near horizon, fades up
        const grey = Math.floor(45 * fade * envBright * moonProgress);
        ctx.fillStyle = `rgb(${grey}, ${grey}, ${Math.floor(grey * 1.1)})`;
        ctx.fillRect(0, y, w, 2);
      }
    }

    // ─── Moon: simple white circle, rises from waves ───
    function drawMoon(t: number, moonProgress: number, currentPhase: string = "landing") {
      if (!ctx || moonProgress <= 0) return;
      // Hide moon when morphing/login — login box takes over from moon
      if (currentPhase === "morphing" || currentPhase === "login") return;
      const w = W();
      const h = H();
      const cx = w / 2;
      const horizon = h * 0.52;
      const targetY = horizon * 0.62;
      const baseRadius = Math.min(w, h) * 0.11;

      // Moon rises from horizon to targetY
      const eased = 1 - (1 - moonProgress) * (1 - moonProgress); // ease-out quadratic: fast then slow
      const moonY = horizon + (targetY - horizon) * eased;

      // Tide level: same dominant wave freq as sea — high = tide up
      const tide = Math.sin(t * 0.25) * 0.5 + Math.sin(t * 0.35) * 0.3 + 0.5;
      // Moon brightness: INVERSE of tide — tide up = dim, tide down = bright
      // Range: 75%→95%, also fade in with moonProgress
      // During morph/login: moon brightens to match text (white/90%)
      const morphBoost = currentPhase !== "landing" ? 0.9 : 0;
      const baseBright = (0.95 - tide * 0.2) * moonProgress;
      const brightPulse = Math.min(1, baseBright + morphBoost * (1 - baseBright));
      const breath = 1 + (1 - tide) * 0.02;
      const radius = baseRadius * breath;

      const rv = Math.floor(255 * brightPulse);
      const gv = Math.floor(255 * brightPulse);
      const bv = Math.floor(255 * brightPulse);
      ctx.save();

      // Radial glow around moon
      const glowRadius = radius * 3;
      const glow = ctx.createRadialGradient(cx, moonY, radius * 0.8, cx, moonY, glowRadius);
      glow.addColorStop(0, `rgba(${rv}, ${gv}, ${bv}, ${0.12 * moonProgress})`);
      glow.addColorStop(0.4, `rgba(${rv}, ${gv}, ${bv}, ${0.04 * moonProgress})`);
      glow.addColorStop(1, `rgba(${rv}, ${gv}, ${bv}, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, moonY, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Moon circle
      ctx.fillStyle = `rgb(${rv}, ${gv}, ${bv})`;
      ctx.beginPath();
      ctx.arc(cx, moonY, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // ─── Stars: geometric triangles and squares, mirroring bubble positions ───
    // Stars use same baseX/baseY as bubbles but mirrored above horizon
    function drawStars(t: number, envBright: number) {
      if (!ctx) return;
      const w = W();
      const h = H();
      const horizon = h * 0.52;
      const cx = w / 2;

      ctx.save();
      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];
        // Mirror bubble position: same X spread, Y mirrored above horizon
        const spreadX = w * 0.7;
        const sx = cx - spreadX / 2 + b.baseX * spreadX;
        const sy = horizon - (b.baseY * horizon * 0.85 + horizon * 0.05);

        // Skip if too close to moon
        const moonY = horizon * 0.62;
        const distToMoon = Math.sqrt((sx - cx) ** 2 + (sy - moonY) ** 2);
        if (distToMoon < Math.min(w, h) * 0.15) continue;

        // Breathing flicker — same phase as corresponding bubble
        const flicker = (Math.sin(t * b.speed * 0.04 + b.phase) + 1) / 2;
        const alpha = (0.05 + flicker * 0.12) * envBright;

        const size = b.r * 0.9;
        const rot = b.phase + t * 0.05;
        const type = i % 3 === 0 ? 'sq' : 'tri';

        ctx.fillStyle = `rgba(220, 225, 255, ${alpha})`;
        ctx.beginPath();

        if (type === 'tri') {
          for (let v = 0; v < 3; v++) {
            const angle = rot + (v / 3) * Math.PI * 2 - Math.PI / 2;
            const px = sx + Math.cos(angle) * size;
            const py = sy + Math.sin(angle) * size;
            if (v === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
        } else {
          for (let v = 0; v < 4; v++) {
            const angle = rot + (v / 4) * Math.PI * 2;
            const px = sx + Math.cos(angle) * size;
            const py = sy + Math.sin(angle) * size;
            if (v === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
        }

        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // ─── Helper: compute wave height at x for a given layer ───
    function waveHeight(
      x: number, t: number, speed: number, seed: number,
      maxHeight: number, cx: number, spread: number, minH: number
    ): number {
      const nx = (x - cx) / (spread / 2); // -1→1
      // Smooth bell curve instead of linear: cos-based envelope
      const envelope = (Math.cos(nx * Math.PI) + 1) / 2; // 1 at center, 0 at edges, smooth
      const wave =
        Math.sin(x * 0.006 + t * speed + seed) * 0.5 +
        Math.sin(x * 0.013 + t * speed * 1.4 + seed * 0.7) * 0.3 +
        0.5;
      return Math.max(minH, maxHeight * envelope * wave);
    }

    function refWaveHeight(
      x: number, t: number, speed: number, seed: number,
      maxHeight: number, cx: number, spread: number, minH: number
    ): number {
      const nx = (x - cx) / (spread / 2);
      const envelope = (Math.cos(nx * Math.PI) + 1) / 2;
      const wave =
        Math.sin(x * 0.008 + t * speed * 1.6 + seed + 3) * 0.6 +
        Math.sin(x * 0.018 + t * speed * 2.0 + seed * 0.5 + 1) * 0.4 +
        0.6;
      return Math.max(minH, maxHeight * envelope * wave * 1.15);
    }

    // ─── Sea: smooth continuous wave shapes per layer ───
    // Each layer is ONE continuous path (no gaps between points)
    // Layers drawn back-to-front so near layers overlap far ones
    function drawSea(t: number, envBright: number, moonProgress: number = 1, currentPhase: string = "landing", transProgress: number = 0) {
      if (!ctx) return;
      const w = W();
      const h = H();
      const cx = w / 2;
      const horizon = h * 0.52;
      const minH = h * 0.012;

      ctx.save();

      const numLayers = 8;
      const step = 4; // x-step for smooth curves

      // ─── Lower background: deep blue ───
      {
        const desat = 0.55;
        const baseBright = 0.65;
        const bgR = Math.floor((8 + 14 * baseBright * desat) * envBright);
        const bgG = Math.floor((6 + 12 * baseBright * desat) * envBright);
        const bgB = Math.floor((35 + 80 * baseBright * desat) * envBright);
        ctx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`;
        ctx.fillRect(0, horizon, w, h - horizon);
      }

      // ─── Hidden moon reflection: circle buried below horizon ───
      if (moonProgress > 0 && currentPhase === "landing") {
        const reflRadius = Math.min(w, h) * 0.09;
        const reflY = horizon + (h - horizon) * 0.4;
        const tide = Math.sin(t * 0.25) * 0.5 + Math.sin(t * 0.35) * 0.3 + 0.5;
        const bright = (0.6 - tide * 0.1) * moonProgress * envBright;
        const mr = Math.floor(160 * bright);
        const mg = Math.floor(170 * bright);
        const mb = Math.floor(220 * bright);

        ctx.fillStyle = `rgb(${mr}, ${mg}, ${mb})`;
        ctx.beginPath();
        ctx.arc(cx, reflY, reflRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgb(${Math.min(255, mr + 30)}, ${Math.min(255, mg + 25)}, ${Math.min(255, mb + 15)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, reflY, reflRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // ─── Mountains: brown silhouettes on both sides, asymmetric ───
      {
        const moonY = horizon * 0.62;
        const maxMtnH = (horizon - moonY) * 0.25;

        const mtnColor = (shade: number) => {
          const r = Math.floor((6 + shade * 8) * envBright);
          const g = Math.floor((8 + shade * 10) * envBright);
          const b = Math.floor((18 + shade * 18) * envBright);
          return `rgb(${r}, ${g}, ${b})`;
        };

        // Left mountain: taller at edge, two peaks, slopes down toward center
        // Back layer
        ctx.fillStyle = mtnColor(0.2);
        ctx.beginPath();
        ctx.moveTo(0, horizon);
        ctx.lineTo(0, horizon - maxMtnH * 0.9);
        ctx.quadraticCurveTo(w * 0.06, horizon - maxMtnH * 1.0, w * 0.10, horizon - maxMtnH * 0.65);
        ctx.quadraticCurveTo(w * 0.14, horizon - maxMtnH * 0.8, w * 0.18, horizon - maxMtnH * 0.45);
        ctx.quadraticCurveTo(w * 0.22, horizon - maxMtnH * 0.2, w * 0.28, horizon);
        ctx.closePath();
        ctx.fill();

        // Mid layer
        ctx.fillStyle = mtnColor(0.5);
        ctx.beginPath();
        ctx.moveTo(0, horizon);
        ctx.lineTo(0, horizon - maxMtnH * 0.65);
        ctx.quadraticCurveTo(w * 0.04, horizon - maxMtnH * 0.75, w * 0.08, horizon - maxMtnH * 0.5);
        ctx.quadraticCurveTo(w * 0.12, horizon - maxMtnH * 0.55, w * 0.15, horizon - maxMtnH * 0.3);
        ctx.quadraticCurveTo(w * 0.18, horizon - maxMtnH * 0.1, w * 0.22, horizon);
        ctx.closePath();
        ctx.fill();

        // Front layer
        ctx.fillStyle = mtnColor(0.9);
        ctx.beginPath();
        ctx.moveTo(0, horizon);
        ctx.lineTo(0, horizon - maxMtnH * 0.4);
        ctx.quadraticCurveTo(w * 0.03, horizon - maxMtnH * 0.45, w * 0.06, horizon - maxMtnH * 0.25);
        ctx.quadraticCurveTo(w * 0.10, horizon - maxMtnH * 0.1, w * 0.15, horizon);
        ctx.closePath();
        ctx.fill();

        // Right mountain: different shape, taller at edge, single broader peak
        // Back layer
        ctx.fillStyle = mtnColor(0.15);
        ctx.beginPath();
        ctx.moveTo(w, horizon);
        ctx.lineTo(w, horizon - maxMtnH * 0.85);
        ctx.quadraticCurveTo(w - w * 0.08, horizon - maxMtnH * 0.95, w - w * 0.13, horizon - maxMtnH * 0.55);
        ctx.quadraticCurveTo(w - w * 0.18, horizon - maxMtnH * 0.35, w - w * 0.25, horizon - maxMtnH * 0.15);
        ctx.quadraticCurveTo(w - w * 0.28, horizon - maxMtnH * 0.05, w - w * 0.30, horizon);
        ctx.closePath();
        ctx.fill();

        // Mid layer
        ctx.fillStyle = mtnColor(0.45);
        ctx.beginPath();
        ctx.moveTo(w, horizon);
        ctx.lineTo(w, horizon - maxMtnH * 0.6);
        ctx.quadraticCurveTo(w - w * 0.05, horizon - maxMtnH * 0.7, w - w * 0.10, horizon - maxMtnH * 0.4);
        ctx.quadraticCurveTo(w - w * 0.15, horizon - maxMtnH * 0.2, w - w * 0.22, horizon);
        ctx.closePath();
        ctx.fill();

        // Front layer
        ctx.fillStyle = mtnColor(0.85);
        ctx.beginPath();
        ctx.moveTo(w, horizon);
        ctx.lineTo(w, horizon - maxMtnH * 0.35);
        ctx.quadraticCurveTo(w - w * 0.04, horizon - maxMtnH * 0.4, w - w * 0.07, horizon - maxMtnH * 0.2);
        ctx.quadraticCurveTo(w - w * 0.11, horizon - maxMtnH * 0.05, w - w * 0.16, horizon);
        ctx.closePath();
        ctx.fill();
      }

      for (let layer = 0; layer < numLayers; layer++) {
        const layerFrac = layer / (numLayers - 1);
        const speed = 0.25 + layerFrac * 0.6;
        const seed = layer * 4.3;
        // During transition: waves surge upward dramatically
        const surgeMultiplier = 1 + transProgress * (12 + layerFrac * 8);
        const maxHeightUp = h * (0.02 + layerFrac * 0.06) * surgeMultiplier;
        const maxHeightDown = h * (0.04 + layerFrac * 0.12);
        const spread = w * (0.85 + layerFrac * 0.15);

        // Color per layer
        const bright = 1 - layerFrac * 0.65;
        const leftX = cx - spread / 2;
        const rightX = cx + spread / 2;

        // ─── Upper sea: blue waves ───
        const pushStrength = 1 - moonProgress;
        function upperWaveH(x: number): number {
          const base = waveHeight(x, t, speed, seed, maxHeightUp, cx, spread, minH);
          if (pushStrength <= 0) return base;
          const nx = (x - cx) / (spread / 2);
          const pushFactor = 1 + pushStrength * (Math.abs(nx) * 1.8 - 0.9);
          return Math.max(minH, base * Math.max(0.1, pushFactor));
        }

        const uR = Math.floor((4 + 12 * bright) * envBright);
        const uG = Math.floor((2 + 6 * bright) * envBright);
        const uB = Math.floor((60 + 140 * bright) * envBright);
        ctx.fillStyle = `rgb(${uR}, ${uG}, ${uB})`;
        ctx.beginPath();
        ctx.moveTo(leftX, horizon);

        let prevX = leftX;
        let prevY = horizon - upperWaveH(leftX);
        ctx.lineTo(prevX, prevY);

        for (let x = leftX + step; x <= rightX; x += step) {
          const hy = horizon - upperWaveH(x);
          const cpX = (prevX + x) / 2;
          const cpY = (prevY + hy) / 2;
          ctx.quadraticCurveTo(prevX, prevY, cpX, cpY);
          prevX = x;
          prevY = hy;
        }
        ctx.lineTo(rightX, horizon - upperWaveH(rightX));
        ctx.lineTo(rightX, horizon);
        ctx.closePath();
        ctx.fill();

        // Wave texture: thin lighter lines along the wave top
        if (layer > 1) {
          const texAlpha = 0.08 + layerFrac * 0.06;
          ctx.strokeStyle = `rgba(120, 140, 255, ${texAlpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          for (let x = leftX; x <= rightX; x += step * 2) {
            const hy = horizon - upperWaveH(x) + 1.5;
            if (x === leftX) ctx.moveTo(x, hy);
            else ctx.lineTo(x, hy);
          }
          ctx.stroke();
        }

        // Lower wave A: black
        const blackShade = Math.floor((2 + layerFrac * 4) * envBright);
        ctx.fillStyle = `rgb(${blackShade}, ${blackShade}, ${Math.floor(blackShade * 1.3)})`;
        ctx.beginPath();
        ctx.moveTo(leftX, horizon);

        prevX = leftX;
        prevY = horizon + refWaveHeight(leftX, t, speed, seed, maxHeightDown, cx, spread, minH);
        ctx.lineTo(prevX, prevY);

        for (let x = leftX + step; x <= rightX; x += step) {
          const hy = horizon + refWaveHeight(x, t, speed, seed, maxHeightDown, cx, spread, minH);
          const cpX = (prevX + x) / 2;
          const cpY = (prevY + hy) / 2;
          ctx.quadraticCurveTo(prevX, prevY, cpX, cpY);
          prevX = x;
          prevY = hy;
        }
        ctx.lineTo(rightX, horizon + refWaveHeight(rightX, t, speed, seed, maxHeightDown, cx, spread, minH));
        ctx.lineTo(rightX, horizon);
        ctx.closePath();
        ctx.fill();

        // Lower wave B: offset phase, slightly different black shade
        const seedB = seed + 17.5;
        const speedB = speed * 0.75;
        const blackB = Math.floor((3 + layerFrac * 5) * envBright);
        ctx.fillStyle = `rgb(${blackB}, ${blackB}, ${Math.floor(blackB * 1.2)})`;
        ctx.beginPath();
        ctx.moveTo(leftX, horizon);

        prevX = leftX;
        prevY = horizon + refWaveHeight(leftX, t, speedB, seedB, maxHeightDown * 0.85, cx, spread, minH);
        ctx.lineTo(prevX, prevY);

        for (let x = leftX + step; x <= rightX; x += step) {
          const hy = horizon + refWaveHeight(x, t, speedB, seedB, maxHeightDown * 0.85, cx, spread, minH);
          const cpX = (prevX + x) / 2;
          const cpY = (prevY + hy) / 2;
          ctx.quadraticCurveTo(prevX, prevY, cpX, cpY);
          prevX = x;
          prevY = hy;
        }
        ctx.lineTo(rightX, horizon + refWaveHeight(rightX, t, speedB, seedB, maxHeightDown * 0.85, cx, spread, minH));
        ctx.lineTo(rightX, horizon);
        ctx.closePath();
        ctx.fill();
      }

      // ─── Moon reflection: brighter smooth shapes in center ───
      if (currentPhase !== "landing") { /* skip moon reflection shapes */ }
      else for (let layer = 0; layer < 4; layer++) {
        const layerFrac = layer / 3;
        const spread = w * (0.02 + layerFrac * 0.06);
        const maxH = h * (0.06 + (1 - layerFrac) * 0.08);
        const leftX = cx - spread / 2;
        const rightX = cx + spread / 2;

        const bright = 1 - layerFrac * 0.5;
        const mr = Math.floor(50 + 180 * bright);
        const mg = Math.floor(45 + 160 * bright);
        const mb = Math.floor(130 + 125 * bright);

        // Above horizon
        ctx.fillStyle = `rgb(${mr}, ${mg}, ${mb})`;
        ctx.beginPath();
        ctx.moveTo(leftX, horizon);
        for (let x = leftX; x <= rightX; x += step) {
          const distFromCenter = Math.abs(x - cx) / (spread / 2 + 1);
          const env = Math.pow(1 - Math.min(1, distFromCenter), 1.3);
          const wave = Math.sin(x * 0.015 + t * 1.0 + layer * 2.5) * 0.4 + 0.6;
          ctx.lineTo(x, horizon - maxH * env * wave * 0.25);
        }
        ctx.lineTo(rightX, horizon);
        ctx.closePath();
        ctx.fill();

        // Below horizon
        const rr = Math.floor(mr * 0.55);
        const rg = Math.floor(mg * 0.55);
        const rb = Math.floor(mb * 0.7);
        ctx.fillStyle = `rgb(${rr}, ${rg}, ${rb})`;
        ctx.beginPath();
        ctx.moveTo(leftX, horizon);
        for (let x = leftX; x <= rightX; x += step) {
          const distFromCenter = Math.abs(x - cx) / (spread / 2 + 1);
          const env = Math.pow(1 - Math.min(1, distFromCenter), 1.3);
          const wave = Math.sin(x * 0.015 + t * 1.0 + layer * 2.5) * 0.4 + 0.6;
          ctx.lineTo(x, horizon + maxH * env * wave * 0.8);
        }
        ctx.lineTo(rightX, horizon);
        ctx.closePath();
        ctx.fill();
      }

      // ─── Horizon line ───
      ctx.fillStyle = "#0c0870";
      ctx.fillRect(0, horizon - 1, w, 2);

      ctx.restore();
    }

    // ─── Moon reflection: horizontal light bands below horizon ───
    function drawMoonReflection(t: number, moonProgress: number, envBright: number) {
      if (!ctx || moonProgress <= 0) return;
      const w = W();
      const h = H();
      const cx = w / 2;
      const horizon = h * 0.52;

      ctx.save();

      const numBands = 12;
      const maxDepth = h * 0.35;
      const tide = Math.sin(t * 0.25) * 0.5 + Math.sin(t * 0.35) * 0.3 + 0.5;

      for (let i = 0; i < numBands; i++) {
        const frac = i / (numBands - 1); // 0=near horizon, 1=deep

        // Y position: stacked downward from horizon
        const bandY = horizon + 5 + frac * maxDepth;

        // Height: thicker near top, thinner deeper
        const heightWave = Math.sin(t * 0.5 + i * 1.8) * 1.5;
        const bandHeight = (3 + (1 - frac) * 5 + heightWave) * moonProgress;

        // Width: wider near top, narrower deeper (perspective), sin oscillation
        const widthBase = w * (0.06 + (1 - frac) * 0.12);
        const widthWave = Math.sin(t * 0.6 + i * 1.3) * widthBase * 0.15;
        const bandWidth = (widthBase + widthWave) * moonProgress;

        // Horizontal offset: slight sway
        const sway = Math.sin(t * 0.4 + i * 0.7) * 6;

        // Color: brighter near top, dimmer deeper, all opaque
        const bright = (1 - frac * 0.7) * (0.55 - tide * 0.08) * moonProgress * envBright;
        const rv = Math.floor(70 + 150 * bright);
        const gv = Math.floor(75 + 140 * bright);
        const bv = Math.floor(150 + 105 * bright);

        ctx.fillStyle = `rgb(${rv}, ${gv}, ${bv})`;
        ctx.fillRect(
          cx - bandWidth / 2 + sway,
          bandY,
          bandWidth,
          bandHeight
        );
      }

      ctx.restore();
    }

    // ─── Light shafts: moonlight penetrating underwater ───
    function drawLightShafts(t: number, envBright: number) {
      if (!ctx) return;
      const w = W();
      const h = H();
      const cx = w / 2;
      const horizon = h * 0.52;
      const seaBottom = h;

      ctx.save();

      // Several shafts, centered under moon, fanning out slightly
      const shafts = [
        { offsetX: 0, widthTop: 8, widthBot: 40, opacity: 0.07 },
        { offsetX: -60, widthTop: 5, widthBot: 55, opacity: 0.04 },
        { offsetX: 70, widthTop: 6, widthBot: 50, opacity: 0.04 },
        { offsetX: -140, widthTop: 4, widthBot: 45, opacity: 0.025 },
        { offsetX: 150, widthTop: 4, widthBot: 40, opacity: 0.025 },
        { offsetX: -30, widthTop: 6, widthBot: 35, opacity: 0.05 },
        { offsetX: 35, widthTop: 5, widthBot: 30, opacity: 0.05 },
      ];

      for (const shaft of shafts) {
        // Slight sway with sin
        const sway = Math.sin(t * 0.15 + shaft.offsetX * 0.01) * 8;
        const topX = cx + shaft.offsetX + sway;
        const botX = cx + shaft.offsetX * 1.8 + sway * 2;

        const topW = shaft.widthTop;
        const botW = shaft.widthBot + Math.sin(t * 0.2 + shaft.offsetX) * 5;

        // Trapezoid shape
        ctx.beginPath();
        ctx.moveTo(topX - topW / 2, horizon + 5);
        ctx.lineTo(topX + topW / 2, horizon + 5);
        ctx.lineTo(botX + botW / 2, seaBottom);
        ctx.lineTo(botX - botW / 2, seaBottom);
        ctx.closePath();

        // Color: ultramarine-white, very subtle
        const r = Math.floor(30 * envBright);
        const g = Math.floor(40 * envBright);
        const b = Math.floor(140 * envBright);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${shaft.opacity * envBright})`;
        ctx.fill();
      }

      ctx.restore();
    }

    // ─── Bubbles: circles rising slowly under water ───
    // Pre-generate bubble positions (seeded, deterministic)
    const bubbles: { baseX: number; baseY: number; r: number; speed: number; drift: number; phase: number }[] = [];
    for (let i = 0; i < 35; i++) {
      const seed = i * 7.13;
      bubbles.push({
        baseX: (Math.sin(seed * 1.3) * 0.5 + 0.5), // 0→1 normalized x
        baseY: (Math.sin(seed * 2.7) * 0.5 + 0.5), // 0→1 normalized y within sea
        r: 2 + Math.sin(seed * 3.1) * 2 + Math.random() * 3,
        speed: 8 + Math.sin(seed * 0.9) * 5,
        drift: 0.5 + Math.sin(seed * 1.7) * 0.3,
        phase: seed,
      });
    }

    function drawBubbles(t: number, envBright: number) {
      if (!ctx) return;
      const w = W();
      const h = H();
      const cx = w / 2;
      const horizon = h * 0.52;
      const seaBottom = h * 0.88;
      const seaHeight = seaBottom - horizon;

      ctx.save();
      for (const b of bubbles) {
        // Y: rises over time, loops
        const cycleY = ((b.baseY + t * b.speed * 0.001) % 1);
        const y = horizon + cycleY * seaHeight;

        // X: centered distribution, slight horizontal drift with sin
        const spreadX = w * 0.7;
        const x = cx - spreadX / 2 + b.baseX * spreadX + Math.sin(t * b.drift + b.phase) * 12;

        // Brightness: brighter near center (moonlight), dimmer at edges
        const distFromCenter = Math.abs(x - cx) / (spreadX / 2);
        const moonBright = Math.pow(1 - Math.min(1, distFromCenter), 1.5);

        // Fade near horizon (just appeared) and near bottom (about to loop)
        const vertFade = Math.min(cycleY * 5, (1 - cycleY) * 5, 1);

        // Check if bubble is in black wave zone (covered by waves)
        // Use a representative wave height at this x to estimate
        const waveEdge = horizon + refWaveHeight(x, t, 0.6, 8.6, h * 0.1, cx, w * 0.9, h * 0.012);
        const inBlack = y < waveEdge ? 0.5 : 1.0; // 50% fade if in black area

        // White-ish bubbles
        const baseW = 180 + Math.floor(75 * moonBright);
        const r = Math.min(255, Math.floor(baseW * envBright));
        const g = Math.min(255, Math.floor((baseW - 10) * envBright));
        const bv = Math.min(255, Math.floor((baseW + 20) * envBright));

        // Outline circle — white constructivist style
        ctx.strokeStyle = `rgba(${r}, ${g}, ${bv}, ${0.35 * vertFade * inBlack})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(x, y, b.r, 0, Math.PI * 2);
        ctx.stroke();

        // Subtle white fill
        ctx.fillStyle = `rgba(${r}, ${g}, ${bv}, ${0.12 * vertFade * moonBright * inBlack})`;
        ctx.beginPath();
        ctx.arc(x, y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // ─── Animation loop ───
    function draw() {
      if (!ctx) return;
      time += 0.016;
      introTime += 0.016;

      // Moon rise progress: 0 before start, 0→1 during rise, 1 after
      const moonProgress = Math.min(1, Math.max(0,
        (introTime - MOON_RISE_START) / MOON_RISE_DURATION
      ));

      // Environment brightness: 0.92 → 1.0 as moon rises, modulated by dimFactor
      const envBright = 0.92 + moonProgress * 0.08;

      drawSky(envBright, moonProgress);
      drawStars(time, envBright);
      drawLightShafts(time, envBright);
      drawMoon(time, moonProgress, phaseRef.current);
      // Accumulate transition time
      if (phaseRef.current === "transitioning") {
        transitionTime += 0.016;
      }
      const transProgress = Math.min(1, transitionTime / 1.2); // 1.2s to fill screen

      drawSea(time, envBright, moonProgress, phaseRef.current, transProgress);
      drawBubbles(time, envBright);

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

// ─── Page ───────────────────────────────────────────────────────────
type Phase = "landing" | "morphing" | "login" | "transitioning";

export default function Ocean1Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showEnter, setShowEnter] = useState(false);
  const [phase, setPhase] = useState<Phase>("landing");
  const router = useRouter();

  // dimFactor: 1 = normal, 0 = dimmed
  const dimFactor = phase === "login" ? 0 : 1;
  useOceanCanvas(canvasRef, isLoaded, dimFactor, phase);

  useEffect(() => {
    const t1 = setTimeout(() => setIsLoaded(true), 100);
    const t2 = setTimeout(() => setShowEnter(true), 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleEnter = () => {
    setShowEnter(false);
    setPhase("morphing");
    // After morph animation completes, show login
    setTimeout(() => setPhase("login"), 1200);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#030308] cursor-default select-none">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=ZCOOL+XiaoWei&family=Ma+Shan+Zheng&display=swap"
        rel="stylesheet"
      />

      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Dim overlay for login phase */}
      <motion.div
        className="absolute inset-0 z-[1] pointer-events-none bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />

      {/* Typography — morphs into circle on enter */}
      <AnimatePresence>
        {(phase === "landing" || phase === "morphing") && (
          <motion.div
            className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
            animate={phase === "morphing" ? {
              // Shrink into white circle, move up to moon position (~32%)
              scale: 0,
              y: "-18vh",
              opacity: 0,
            } : {}}
            transition={phase === "morphing" ? {
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            } : {}}
          >
            <div className="relative flex flex-col items-center gap-0">
              {isLoaded && (
                <motion.h1
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                  className="text-[clamp(3.5rem,10vw,8rem)] leading-none tracking-[0.2em] text-white/90"
                  style={{ fontFamily: "'ZCOOL XiaoWei', serif" }}
                >
                  汐镜
                </motion.h1>
              )}

              <motion.div
                initial={{ scaleX: 0 }}
                animate={isLoaded ? { scaleX: 1 } : {}}
                transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
                className="w-[clamp(100px,16vw,220px)] h-[1px] my-1 origin-center bg-white/25"
              />

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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* White circle that appears during morph, moves up to moon */}
      <AnimatePresence>
        {phase === "morphing" && (
          <motion.div
            className="absolute z-10 left-1/2 rounded-full bg-white pointer-events-none"
            initial={{
              width: 100,
              height: 100,
              top: "50%",
              x: "-50%",
              y: "-50%",
              opacity: 0,
            }}
            animate={{
              width: 60,
              height: 60,
              top: "32%",
              x: "-50%",
              y: "-50%",
              opacity: [0, 1, 1, 0.9],
            }}
            transition={{
              duration: 1.0,
              ease: [0.22, 1, 0.36, 1],
              opacity: { times: [0, 0.2, 0.7, 1], duration: 1.0 },
            }}
          />
        )}
      </AnimatePresence>

      {/* Enter button */}
      <AnimatePresence>
        {showEnter && phase === "landing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute bottom-[18vh] left-1/2 -translate-x-1/2 z-10 pointer-events-auto"
          >
            <button
              onClick={handleEnter}
              className="group px-8 py-2.5 border border-white/10 bg-transparent text-white/35 text-[clamp(0.55rem,0.8vw,0.7rem)] font-medium tracking-[0.45em] uppercase transition-all duration-500 hover:border-white/25 hover:text-white/70 cursor-pointer"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Enter
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login box: morphs from moon circle into white rounded rectangle */}
      <AnimatePresence>
        {phase === "login" && (
          <motion.div
            className="absolute z-30 left-1/2 pointer-events-auto overflow-hidden"
            initial={{
              width: "min(22vw, 22vh)",
              height: "min(22vw, 22vh)",
              borderRadius: "50%",
              top: "32.2%",
              x: "-50%",
              y: "-50%",
              backgroundColor: "rgba(255,255,255,0.65)",
            }}
            animate={{
              width: 280,
              height: 310,
              borderRadius: "16px",
              top: "50%",
              x: "-50%",
              y: "-50%",
              backgroundColor: "rgba(255,255,255,0.65)",
            }}
            transition={{
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {/* Login content inside white box */}
            <motion.div
              className="relative w-full h-full flex flex-col items-center justify-center px-8 gap-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {/* Title */}
              <div className="flex flex-col items-center gap-1 mb-2">
                <h2
                  className="text-gray-800 text-2xl tracking-[0.15em]"
                  style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
                >
                  汐镜
                </h2>
                <div className="w-10 h-[1px] bg-gray-300" />
              </div>

              {/* Inputs */}
              <div className="w-full flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="账号"
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg text-gray-700 text-sm tracking-wider placeholder:text-gray-400 focus:outline-none focus:bg-gray-50 transition-colors duration-300"
                  style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
                />
                <input
                  type="password"
                  placeholder="密码"
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg text-gray-700 text-sm tracking-wider placeholder:text-gray-400 focus:outline-none focus:bg-gray-50 transition-colors duration-300"
                  style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
                />
              </div>

              {/* Login button */}
              <button
                onClick={() => { setPhase("transitioning"); }}
                className="w-full py-3 bg-gray-100 text-gray-500 text-sm tracking-[0.3em] rounded-lg transition-all duration-500 hover:bg-gray-200 hover:text-gray-700 cursor-pointer"
                style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
              >
                登录
              </button>

              {/* Back button */}
              <button
                onClick={() => { setPhase("landing"); setShowEnter(true); }}
                className="text-gray-400 text-xs tracking-[0.2em] transition-all duration-500 hover:text-gray-600 cursor-pointer"
                style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
              >
                ← 返回
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
