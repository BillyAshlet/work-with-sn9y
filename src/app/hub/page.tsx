"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, Suspense } from "react";

/* ── Transition color sequence ── */
const transitionColors = ["#1a2a6c", "#8b1a1a", "#8b6914", "#1a5c5c"];

/* ── Section data ── */
const sections = [
  {
    title: "Works",
    titleCn: "作品集",
    subtitle: "Engineering · Music · Design · Writing",
    categories: [
      { label: "Engineering", color: "#1a2a6c" },
      { label: "Music", color: "#8b1a1a" },
      { label: "Design", color: "#8b6914" },
      { label: "Writing", color: "#1a5c5c" },
    ],
    href: "/works",
    enabled: true,
    number: "I",
    bg: "#0a0a0a",
    textColor: "rgba(255,255,255,0.9)",
    mutedColor: "rgba(255,255,255,0.3)",
  },
  {
    title: "Fields",
    titleCn: "场",
    subtitle: "Ambient · Loops · Calm",
    href: "#",
    enabled: false,
    number: "II",
    bg: "#0c1a1a",
    textColor: "rgba(200,230,230,0.9)",
    mutedColor: "rgba(140,190,190,0.4)",
  },
  {
    title: "Archive",
    titleCn: "档案",
    subtitle: "Thoughts · Inspirations · Collections",
    href: "#",
    enabled: false,
    number: "III",
    bg: "#12100e",
    textColor: "rgba(240,200,160,0.9)",
    mutedColor: "rgba(200,140,80,0.4)",
  },
];

const backgrounds: Record<number, string> = {
  0: "radial-gradient(ellipse at 50% 50%, #0d0d0d 0%, #050505 100%)",
  1: "radial-gradient(ellipse at 30% 60%, #0f2828 0%, #0a1414 40%, #0c1a1a 100%)",
  2: "radial-gradient(ellipse at 70% 40%, #1a1208 0%, #14100a 30%, #12100e 60%), radial-gradient(ellipse at 20% 70%, #0a1616 0%, transparent 60%)",
};

/* ═══════════════════════════════════════════════
   Decorative backgrounds per slide
   ═══════════════════════════════════════════════ */

/* Works — animated 3D-feeling white geometric elements */
function WorksDecor({ entryPhase }: { entryPhase: string }) {
  // Track phases: "fly" means we saw the fly phase at least once
  const sawFlyRef = useRef(false);
  const [flyDone, setFlyDone] = useState(true); // true = show everything normally

  if (entryPhase === "fly" && !sawFlyRef.current) {
    sawFlyRef.current = true;
  }

  useEffect(() => {
    if (entryPhase === "drip" || entryPhase === "pause") {
      // Entering from Landing — prepare: hide extras
      setFlyDone(false);
    }
    if (entryPhase === "fly") {
      // Fly started — extras still hidden, start timer for when fly ends
      setFlyDone(false);
      const t = setTimeout(() => setFlyDone(true), 750);
      return () => clearTimeout(t);
    }
  }, [entryPhase]);

  const fly = sawFlyRef.current;
  const showExtras = flyDone;

  // Each element gets its own keyframe that flies from screen center to its final position.
  // We generate unique keyframes per element using CSS calc() based on their known positions.
  // Format: flyStyle(name, delay) where name matches a generated @keyframes.

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Per-element fly-in keyframes — each starts at viewport center, ends at element position */}
      {fly && (
        <style>{`
          /* translate = (screen_center - element_center) for each axis */
          /* Cube: right:0%, top:3% → center at (100vw-50%, 3vh+50%) */
          @keyframes flyCube {
            0% { transform: translate(calc(-50vw + 50%), calc(47vh - 50%)) scale(0.03); opacity: 0; }
            30% { opacity: 1; }
            100% { transform: translate(0,0) scale(1); opacity: 1; }
          }
          /* Triangle: left:0%, bottom:4% → center at (50%, 100vh-4vh-50%) */
          @keyframes flyTri {
            0% { transform: translate(calc(50vw - 50%), calc(-46vh + 50%)) scale(0.03); opacity: 0; }
            30% { opacity: 1; }
            100% { transform: translate(0,0) scale(1); opacity: 1; }
          }
          /* Compass: left:3%, top:28% → center at (3vw+50%, 28vh+50%) */
          @keyframes flyCompass {
            0% { transform: translate(calc(47vw - 50%), calc(22vh - 50%)) scale(0.03); opacity: 0; }
            30% { opacity: 1; }
            100% { transform: translate(0,0) scale(1); opacity: 1; }
          }
          /* Hexagon: right:6%, bottom:12% → center at (100vw-6vw-50%, 100vh-12vh-50%) */
          @keyframes flyHex {
            0% { transform: translate(calc(-44vw + 50%), calc(-38vh + 50%)) scale(0.03); opacity: 0; }
            30% { opacity: 1; }
            100% { transform: translate(0,0) scale(1); opacity: 1; }
          }
        `}</style>
      )}

      {/* Rotating wireframe cube — top right */}
      <div className="absolute top-[3%] right-[0%] w-[300px] h-[300px] md:w-[420px] md:h-[420px]"
        style={fly ? { animation: "flyCube 1.3s cubic-bezier(0.16,1,0.3,1) 0s both" } : {}}>

        <motion.svg
          viewBox="0 0 200 200" fill="none" className="w-full h-full"
          animate={flyDone ? { rotate: [0, 20, -12, 0], y: [0, -30, 0], x: [0, 8, 0] } : {}}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="45" y="50" width="85" height="85" stroke="white" strokeWidth="3.5" opacity="0.22" />
          <rect x="68" y="26" width="85" height="85" stroke="white" strokeWidth="2.2" opacity="0.12" />
          <line x1="45" y1="50" x2="68" y2="26" stroke="white" strokeWidth="2.2" opacity="0.15" />
          <line x1="130" y1="50" x2="153" y2="26" stroke="white" strokeWidth="2.2" opacity="0.15" />
          <line x1="130" y1="135" x2="153" y2="111" stroke="white" strokeWidth="2.2" opacity="0.15" />
          <line x1="45" y1="135" x2="68" y2="111" stroke="white" strokeWidth="2.2" opacity="0.15" />
        </motion.svg>
      </div>

      {/* Tilted triangle — bottom left */}
      <div className="absolute bottom-[4%] left-[0%] w-[240px] h-[240px] md:w-[320px] md:h-[320px]"
        style={fly ? { animation: "flyTri 1.3s cubic-bezier(0.16,1,0.3,1) 0.06s both" } : {}}>
        <motion.svg
          viewBox="0 0 200 200" fill="none" className="w-full h-full"
          style={{ transform: "rotate(-12deg)" }}
          animate={flyDone ? { y: [0, -40, 0], x: [0, 15, 0], rotate: [-12, -20, -12] } : {}}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        >
          <polygon points="85,10 190,165 10,180" stroke="white" strokeWidth="3" opacity="0.2" fill="none" />
          <polygon points="90,55 155,148 30,158" stroke="white" strokeWidth="1.2" opacity="0.09" fill="none" />
        </motion.svg>
      </div>

      {/* Rotating compass circle — mid-left */}
      <div className="absolute top-[28%] left-[3%] w-[120px] h-[120px] md:w-[160px] md:h-[160px]"
        style={fly ? { animation: "flyCompass 1.3s cubic-bezier(0.16,1,0.3,1) 0.12s both" } : {}}>
        <motion.svg
          viewBox="0 0 100 100" fill="none" className="w-full h-full"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="2" opacity="0.18" />
          <circle cx="50" cy="50" r="34" stroke="white" strokeWidth="1.2" opacity="0.09" strokeDasharray="3 6" />
          <line x1="50" y1="6" x2="50" y2="22" stroke="white" strokeWidth="1.8" opacity="0.18" />
          <line x1="50" y1="78" x2="50" y2="94" stroke="white" strokeWidth="1.8" opacity="0.18" />
          <line x1="6" y1="50" x2="22" y2="50" stroke="white" strokeWidth="1.8" opacity="0.18" />
          <line x1="78" y1="50" x2="94" y2="50" stroke="white" strokeWidth="1.8" opacity="0.18" />
        </motion.svg>
      </div>

      {/* Drifting hexagon — bottom right */}
      <div className="absolute bottom-[12%] right-[6%] w-[100px] h-[100px] md:w-[140px] md:h-[140px]"
        style={fly ? { animation: "flyHex 1.3s cubic-bezier(0.16,1,0.3,1) 0.09s both" } : {}}>
        <motion.svg
          viewBox="0 0 100 100" fill="none" className="w-full h-full"
          animate={flyDone ? { y: [0, -25, 0], x: [0, -8, 0], rotate: [0, 30, 0] } : {}}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        >
          <polygon points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5" stroke="white" strokeWidth="2" opacity="0.17" fill="none" />
        </motion.svg>
      </div>

      {/* Textures + colored shapes — hidden during fly, fade in after */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: showExtras ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      >
      {/* Diagonal lines */}
      <motion.div
        className="absolute top-[-5%] left-[12%] w-[5px] h-[350px] md:h-[500px] origin-top"
        style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.32), rgba(255,255,255,0.06), transparent)", transform: "rotate(55deg)" }}
        initial={fly ? { scaleY: 0, opacity: 0 } : false}
        animate={{ scaleY: 1, opacity: [0.5, 1, 0.5] }}
        transition={fly ? { duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 } : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[30%] right-[10%] w-[4px] h-[250px] md:h-[380px]"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.18), transparent)", transform: "rotate(-50deg)" }}
        initial={fly ? { scaleY: 0, opacity: 0 } : false}
        animate={{ scaleY: 1, opacity: [0.3, 0.8, 0.3] }}
        transition={fly ? { duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.35 } : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[50%] left-[35%] w-[3px] h-[200px] md:h-[300px]"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.12), transparent)", transform: "rotate(62deg)" }}
        animate={{ opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Scan line */}
      <motion.div
        className="absolute left-[0%] right-[30%] h-px"
        style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.18), rgba(255,255,255,0.22), transparent)" }}
        animate={{ top: ["60%", "75%", "60%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Cross marks */}
      <motion.svg className="absolute top-[18%] left-[26%] w-[20px] h-[20px]" viewBox="0 0 20 20" fill="none" animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
        <line x1="4" y1="10" x2="16" y2="10" stroke="white" strokeWidth="1.8" /><line x1="10" y1="4" x2="10" y2="16" stroke="white" strokeWidth="1.8" />
      </motion.svg>
      <motion.svg className="absolute bottom-[25%] left-[50%] w-[16px] h-[16px]" viewBox="0 0 20 20" fill="none" animate={{ opacity: [0.08, 0.25, 0.08], scale: [1, 1.15, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}>
        <line x1="4" y1="10" x2="16" y2="10" stroke="white" strokeWidth="1.6" /><line x1="10" y1="4" x2="10" y2="16" stroke="white" strokeWidth="1.6" />
      </motion.svg>
      <motion.svg className="absolute top-[62%] right-[28%] w-[14px] h-[14px]" viewBox="0 0 20 20" fill="none" animate={{ opacity: [0.06, 0.2, 0.06], scale: [1, 1.1, 1] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 3 }}>
        <line x1="4" y1="10" x2="16" y2="10" stroke="white" strokeWidth="1.6" /><line x1="10" y1="4" x2="10" y2="16" stroke="white" strokeWidth="1.6" />
      </motion.svg>

      {/* Particles */}
      <motion.div className="absolute w-[3.5px] h-[3.5px] rounded-full bg-white" style={{ top: "10%", left: "85%", opacity: 0.28 }} animate={{ y: [0, -20, 0], x: [0, 8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute w-[3px] h-[3px] rounded-full bg-white" style={{ top: "80%", left: "15%", opacity: 0.22 }} animate={{ y: [0, 18, 0], x: [0, -10, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }} />
      <motion.div className="absolute w-[3.5px] h-[3.5px] rounded-full bg-white" style={{ top: "42%", right: "3%", opacity: 0.2 }} animate={{ y: [0, -25, 0], x: [0, -6, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
      <motion.div className="absolute w-[2.5px] h-[2.5px] rounded-full bg-white" style={{ top: "22%", left: "62%", opacity: 0.15 }} animate={{ y: [0, 14, 0], x: [0, -8, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }} />
      <motion.div className="absolute w-[2px] h-[2px] rounded-full bg-white" style={{ top: "55%", left: "38%", opacity: 0.12 }} animate={{ y: [0, -16, 0], x: [0, 10, 0] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 5 }} />
      <motion.div className="absolute w-[2.5px] h-[2.5px] rounded-full bg-white" style={{ top: "88%", left: "72%", opacity: 0.14 }} animate={{ y: [0, 18, 0], x: [0, -5, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 4 }} />
      <motion.div className="absolute w-[2px] h-[2px] rounded-full bg-white" style={{ top: "13%", left: "42%", opacity: 0.12 }} animate={{ y: [0, -12, 0], x: [0, 6, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 6 }} />
      <motion.div className="absolute w-[1.5px] h-[1.5px] rounded-full bg-white" style={{ top: "32%", left: "92%", opacity: 0.09 }} animate={{ y: [0, 8, 0] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute w-[1.5px] h-[1.5px] rounded-full bg-white" style={{ top: "72%", left: "6%", opacity: 0.08 }} animate={{ y: [0, -10, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 7 }} />
      <motion.div className="absolute w-[1.5px] h-[1.5px] rounded-full bg-white" style={{ top: "48%", left: "22%", opacity: 0.07 }} animate={{ y: [0, 6, 0], x: [0, -5, 0] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 4 }} />
      <motion.div className="absolute w-[1.5px] h-[1.5px] rounded-full bg-white" style={{ top: "92%", left: "52%", opacity: 0.08 }} animate={{ y: [0, -12, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }} />

      {/* 4-color geometric shapes — scale from center if flying */}
      <motion.svg
        className="absolute inset-0 w-full h-full" viewBox="0 0 1000 600" fill="none"
        style={{ transformOrigin: "50% 50%" }}
        initial={fly ? { scale: 0, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={fly ? { duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 } : { duration: 0 }}
      >
        <rect x="85" y="50" width="40" height="40" transform="rotate(45 105 70)" stroke="#1a2a6c" strokeWidth="3" opacity="0.4" fill="none" />
        <rect x="810" y="115" width="35" height="35" transform="rotate(45 827.5 132.5)" stroke="#8b1a1a" strokeWidth="2.8" opacity="0.35" fill="none" />
        <rect x="640" y="460" width="42" height="42" transform="rotate(45 661 481)" stroke="#8b6914" strokeWidth="3" opacity="0.38" fill="none" />
        <rect x="165" y="415" width="32" height="32" transform="rotate(45 181 431)" stroke="#1a5c5c" strokeWidth="2.8" opacity="0.35" fill="none" />
        <circle cx="340" cy="105" r="16" stroke="#8b6914" strokeWidth="2.5" opacity="0.35" fill="none" />
        <circle cx="740" cy="335" r="20" stroke="#1a2a6c" strokeWidth="2.5" opacity="0.32" fill="none" />
        <circle cx="490" cy="505" r="14" stroke="#1a5c5c" strokeWidth="2.2" opacity="0.38" fill="none" />
        <circle cx="890" cy="65" r="12" stroke="#8b1a1a" strokeWidth="2.2" opacity="0.32" fill="none" />
        <circle cx="240" cy="185" r="6" fill="#1a2a6c" opacity="0.35" />
        <circle cx="590" cy="85" r="5" fill="#8b1a1a" opacity="0.32" />
        <circle cx="440" cy="385" r="7" fill="#8b6914" opacity="0.35" />
        <circle cx="790" cy="235" r="5" fill="#1a5c5c" opacity="0.32" />
        <circle cx="140" cy="335" r="6" fill="#8b1a1a" opacity="0.32" />
        <circle cx="940" cy="435" r="5" fill="#1a2a6c" opacity="0.3" />
        <polygon points="535,35 565,85 505,85" stroke="#1a5c5c" strokeWidth="2.5" opacity="0.35" fill="none" />
        <polygon points="80,475 120,540 40,540" stroke="#8b6914" strokeWidth="2.5" opacity="0.32" fill="none" />
      </motion.svg>
      </motion.div>
    </div>
  );
}

/* Fields — ink drops, splatter dots, organic blobs */
function FieldsDecor() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Large ink blob — top right */}
      <svg className="absolute top-[12%] right-[5%] w-[250px] h-[250px] md:w-[350px] md:h-[350px]" viewBox="0 0 300 300" fill="none">
        <path
          d="M150 40 Q200 60 210 120 Q220 180 180 220 Q140 260 100 230 Q60 200 70 140 Q80 80 150 40 Z"
          stroke="#2dd4bf"
          strokeWidth="0.5"
          opacity="0.06"
          fill="none"
        />
        <path
          d="M150 70 Q185 85 190 130 Q195 175 165 200 Q135 225 110 205 Q85 185 90 140 Q95 95 150 70 Z"
          fill="#2dd4bf"
          opacity="0.015"
        />
      </svg>

      {/* Scattered ink drops */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 600" fill="none">
        {/* Large drops */}
        <circle cx="120" cy="380" r="18" fill="#14b8a6" opacity="0.025" />
        <circle cx="780" cy="150" r="12" fill="#2dd4bf" opacity="0.03" />
        <circle cx="650" cy="450" r="22" fill="#0d9488" opacity="0.02" />
        {/* Small splatter */}
        <circle cx="200" cy="120" r="3" fill="#2dd4bf" opacity="0.06" />
        <circle cx="215" cy="135" r="2" fill="#2dd4bf" opacity="0.04" />
        <circle cx="190" cy="140" r="1.5" fill="#2dd4bf" opacity="0.05" />
        <circle cx="850" cy="350" r="4" fill="#14b8a6" opacity="0.05" />
        <circle cx="860" cy="370" r="2" fill="#14b8a6" opacity="0.04" />
        <circle cx="840" cy="360" r="1.5" fill="#14b8a6" opacity="0.03" />
        {/* Tiny scattered dots */}
        <circle cx="400" cy="200" r="1" fill="#2dd4bf" opacity="0.06" />
        <circle cx="550" cy="100" r="1.5" fill="#2dd4bf" opacity="0.04" />
        <circle cx="300" cy="500" r="1" fill="#14b8a6" opacity="0.05" />
        <circle cx="700" cy="300" r="1.5" fill="#2dd4bf" opacity="0.03" />
        <circle cx="150" cy="250" r="1" fill="#0d9488" opacity="0.04" />
        <circle cx="900" cy="200" r="2" fill="#2dd4bf" opacity="0.03" />
      </svg>

      {/* Drip line — left side */}
      <motion.div
        className="absolute top-[20%] left-[12%] w-[1px] h-[180px]"
        style={{ background: "linear-gradient(to bottom, #2dd4bf, transparent)" }}
        animate={{ opacity: [0.03, 0.08, 0.03], scaleY: [0.8, 1, 0.8] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Ambient teal glow */}
      <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] rounded-full opacity-[0.03]"
        style={{ background: "radial-gradient(circle, #2dd4bf, transparent 70%)" }} />
    </div>
  );
}

/* Archive — rough paper texture, map-like contour lines, aged marks */
function ArchiveDecor() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Paper grain noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Topographic contour lines */}
      <svg className="absolute top-[10%] left-[5%] w-[400px] h-[400px] md:w-[550px] md:h-[550px]" viewBox="0 0 500 500" fill="none">
        <ellipse cx="250" cy="250" rx="200" ry="160" stroke="#c87832" strokeWidth="0.4" opacity="0.04" fill="none" />
        <ellipse cx="240" cy="260" rx="160" ry="120" stroke="#c87832" strokeWidth="0.4" opacity="0.05" fill="none" />
        <ellipse cx="230" cy="270" rx="120" ry="85" stroke="#c87832" strokeWidth="0.3" opacity="0.05" fill="none" />
        <ellipse cx="225" cy="275" rx="80" ry="55" stroke="#c87832" strokeWidth="0.3" opacity="0.04" fill="none" />
        <ellipse cx="220" cy="280" rx="45" ry="30" stroke="#c87832" strokeWidth="0.3" opacity="0.03" fill="none" />
      </svg>

      {/* Aged stain marks */}
      <div className="absolute top-[20%] right-[15%] w-[180px] h-[180px] rounded-full opacity-[0.03]"
        style={{ background: "radial-gradient(ellipse at 40% 40%, #c87832, transparent 70%)" }} />
      <div className="absolute bottom-[25%] left-[20%] w-[120px] h-[120px] rounded-full opacity-[0.025]"
        style={{ background: "radial-gradient(ellipse at 60% 60%, #8b6914, transparent 70%)" }} />

      {/* Scattered cross marks — like map annotations */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 600" fill="none">
        {/* Cross marks */}
        <g stroke="#c87832" strokeWidth="0.5" opacity="0.06">
          <line x1="175" y1="140" x2="185" y2="150" /><line x1="185" y1="140" x2="175" y2="150" />
          <line x1="720" y1="380" x2="730" y2="390" /><line x1="730" y1="380" x2="720" y2="390" />
          <line x1="450" y1="480" x2="460" y2="490" /><line x1="460" y1="480" x2="450" y2="490" />
        </g>
        {/* Dashed path — like a route on a map */}
        <path
          d="M100 500 Q250 400 400 420 Q550 440 700 350 Q850 260 950 280"
          stroke="#c87832"
          strokeWidth="0.4"
          opacity="0.04"
          fill="none"
          strokeDasharray="6 10"
        />
        {/* Small circles — like map waypoints */}
        <circle cx="400" cy="420" r="3" stroke="#c87832" strokeWidth="0.4" opacity="0.05" fill="none" />
        <circle cx="700" cy="350" r="3" stroke="#c87832" strokeWidth="0.4" opacity="0.05" fill="none" />
      </svg>

      {/* Teal accent — subtle dual-tone */}
      <div className="absolute bottom-[10%] right-[8%] w-[200px] h-[200px] rounded-full opacity-[0.02]"
        style={{ background: "radial-gradient(circle, #1a8a8a, transparent 70%)" }} />
    </div>
  );
}

const decorComponents = ["works", "fields", "archive"] as const;

/* ── Horizontal slide transition ── */
const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

function HubPageInner() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [transitionPhase, setTransitionPhase] = useState<"idle" | "black" | "colors" | "white" | "done">("idle");
  const isAnimating = useRef(false);
  const touchStartX = useRef(0);
  const router = useRouter();
  const searchParams = useSearchParams();

  /* ── Entry animation from Landing page ── */
  const isFromLanding = searchParams.get("entry") === "ink";
  const [entryPhase, setEntryPhase] = useState<"drip" | "pause" | "fly" | "reveal" | "done">(isFromLanding ? "drip" : "done");
  const dripCanvasRef = useRef<HTMLCanvasElement>(null);
  const dripAnimRef = useRef<number>(0);

  // Clean URL without reload when entering from Landing
  useEffect(() => {
    if (isFromLanding) {
      window.history.replaceState({}, "", "/hub");
    }
  }, [isFromLanding]);

  // Drip animation — white falls down like ink
  useEffect(() => {
    if (entryPhase !== "drip") return;
    const canvas = dripCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const w = canvas.width;
    const h = canvas.height;

    // Create drip columns — irregular widths, large delay variation for dramatic depth differences
    const cols: { x: number; w: number; delay: number; gMul: number }[] = [];
    let xPos = -20;
    while (xPos < w + 40) {
      const colW = 30 + Math.random() * 80;
      cols.push({
        x: xPos,
        w: colW,
        delay: Math.random() * 350, // 0-350ms stagger — big depth gaps
        gMul: 0.7 + Math.random() * 0.6, // per-column gravity multiplier (0.7-1.3)
      });
      xPos += colW - 10; // slight overlap
    }

    const gravity = 0.0018; // base quadratic coefficient
    const start = Date.now();
    let running = true;

    const render = () => {
      if (!running) return;
      const elapsed = Date.now() - start;

      // Start white, then drip reveals black underneath
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);

      // Draw black (revealed) areas — each column drips with gravity (quadratic)
      ctx.fillStyle = "#050505";
      let allDone = true;
      for (const col of cols) {
        // Quadratic position with per-column gravity: y = 0.5 * g * gMul * t²
        const t = Math.max(elapsed - col.delay, 0);
        const y = 0.5 * gravity * col.gMul * t * t;

        if (y <= h + 60) allDone = false;

        // Simple wobble for organic bottom edge
        const wobble = Math.sin(col.x * 0.02 + elapsed * 0.003) * 15 + Math.sin(col.x * 0.05 + elapsed * 0.005) * 8;

        ctx.beginPath();
        ctx.moveTo(col.x - 5, 0);
        ctx.lineTo(col.x + col.w + 5, 0);
        ctx.lineTo(col.x + col.w + 5, y + wobble);
        // Rounded drip bottom
        ctx.quadraticCurveTo(
          col.x + col.w / 2, y + wobble + 20 + Math.random() * 10,
          col.x - 5, y + wobble
        );
        ctx.closePath();
        ctx.fill();
      }

      // Check if all drips have passed bottom
      if (allDone || elapsed > 1800) {
        ctx.fillStyle = "#050505";
        ctx.fillRect(0, 0, w, h);
        setEntryPhase("pause");
        return;
      }

      dripAnimRef.current = requestAnimationFrame(render);
    };

    dripAnimRef.current = requestAnimationFrame(render);
    return () => {
      running = false;
      cancelAnimationFrame(dripAnimRef.current);
    };
  }, [entryPhase]);

  // Pause → fly → reveal → done timing
  useEffect(() => {
    if (entryPhase === "pause") {
      // 0.2s pause after drip, then fly
      const t = setTimeout(() => setEntryPhase("fly"), 200);
      return () => clearTimeout(t);
    }
    if (entryPhase === "fly") {
      // Geometries fly in for 1.3s, then 0.1s pause, then reveal content
      const t1 = setTimeout(() => setEntryPhase("reveal"), 1400);
      const t2 = setTimeout(() => setEntryPhase("done"), 2600);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [entryPhase]);

  const isEntryAnimating = entryPhase !== "done";
  const isEntryBlack = entryPhase === "drip" || entryPhase === "pause";
  const showContent = entryPhase === "reveal" || entryPhase === "done";

  const handleEnter = useCallback((href: string) => {
    if (transitionPhase !== "idle") return;
    // Phase 1: fade to black (already dark, quick)
    setTransitionPhase("black");
    // Phase 2: bloom into 4-color gradient
    setTimeout(() => setTransitionPhase("colors"), 400);
    // Phase 3: fade to white — stays white
    setTimeout(() => setTransitionPhase("white"), 1400);
    // Phase 4: navigate while white is still covering — no flash
    setTimeout(() => {
      router.push(href);
    }, 1900);
  }, [transitionPhase, router]);

  const goTo = useCallback(
    (next: number, dir?: number) => {
      if (isAnimating.current) return;
      const wrapped = ((next % sections.length) + sections.length) % sections.length;
      if (wrapped === current) return;
      isAnimating.current = true;
      setDirection(dir ?? (next > current ? 1 : -1));
      setCurrent(wrapped);
      setTimeout(() => {
        isAnimating.current = false;
      }, 700);
    },
    [current]
  );

  /* Keyboard */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goTo(current + 1, 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goTo(current - 1, -1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, goTo]);

  /* Wheel — horizontal bias: use deltaX if available, fallback to deltaY */
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 20) return;
      if (delta > 0) goTo(current + 1, 1);
      else goTo(current - 1, -1);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [current, goTo]);

  /* Touch — horizontal swipe */
  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const delta = touchStartX.current - e.changedTouches[0].clientX;
      if (Math.abs(delta) < 50) return;
      if (delta > 0) goTo(current + 1, 1);
      else goTo(current - 1, -1);
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [current, goTo]);

  const section = sections[current];

  return (
    <main className="relative h-screen w-screen overflow-hidden" style={{ background: isEntryAnimating ? "#050505" : section.bg }}>
      {/* Background gradient */}
      <motion.div
        className="absolute inset-0 z-0"
        animate={{ background: backgrounds[current] }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Drip canvas overlay */}
      <canvas
        ref={dripCanvasRef}
        className="fixed inset-0 z-[80] pointer-events-none"
        style={{ display: entryPhase === "drip" ? "block" : "none" }}
      />

      {/* Black overlay during pause phase */}
      {entryPhase === "pause" && (
        <div className="fixed inset-0 z-[80]" style={{ background: "#050505" }} />
      )}

      {/* Nav — hidden during drip/pause, fades in after */}
      {(entryPhase === "done" || entryPhase === "reveal") && (
        <motion.nav
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Link
            href="/"
            className="text-[11px] tracking-[0.35em] uppercase font-medium hover:opacity-70 transition-opacity"
            style={{ fontFamily: "var(--font-display)", color: section.textColor }}
          >
            Billy Ashlet
          </Link>
          <p className="text-[10px] tracking-[0.3em] uppercase font-light hidden md:block"
            style={{ color: section.mutedColor }}
          >
            Choose Your Path
          </p>
        </motion.nav>
      )}

      {/* Slides — horizontal */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 z-10 flex items-center justify-center"
          onAnimationComplete={() => { isAnimating.current = false; }}
          style={{ opacity: (entryPhase === "done" || entryPhase === "reveal" || entryPhase === "fly") ? 1 : 0, transition: "opacity 0.6s ease" }}
        >
          {/* Decorative background */}
          {current === 0 && <WorksDecor entryPhase={entryPhase} />}
          {current === 1 && <FieldsDecor />}
          {current === 2 && <ArchiveDecor />}

          {/* Content — hidden during fly, fades in during reveal */}
          <motion.div
            className="relative z-10 text-center px-6 max-w-2xl mx-auto"
            initial={entryPhase === "fly" || entryPhase === "reveal" ? { opacity: 0 } : false}
            animate={{ opacity: (entryPhase === "fly" || entryPhase === "pause" || entryPhase === "drip") ? 0 : 1 }}
            transition={{ duration: 0.8 }}
          >
            <p
              className="text-[10px] tracking-[0.8em] uppercase font-light mb-6"
              style={{ color: section.mutedColor }}
            >
              {section.number}
            </p>

            {section.enabled ? (
              <h1
                onClick={() => handleEnter(section.href)}
                className="text-6xl md:text-8xl lg:text-9xl font-semibold tracking-[-0.04em] mb-3 transition-opacity duration-300 hover:opacity-80 cursor-pointer"
                style={{ fontFamily: "var(--font-display)", color: section.textColor }}
              >
                {section.title}
              </h1>
            ) : (
              <h1
                className="text-6xl md:text-8xl lg:text-9xl font-semibold tracking-[-0.04em] mb-3"
                style={{ fontFamily: "var(--font-display)", color: section.textColor }}
              >
                {section.title}
              </h1>
            )}

            <p
              className="text-lg md:text-2xl font-light mb-8"
              style={{ color: section.mutedColor }}
            >
              {section.titleCn}
            </p>

            <div className="w-10 h-px mx-auto mb-6" style={{ background: section.mutedColor }} />

            {/* Subtitle — with colored rectangles for Works */}
            {section.categories ? (
              <div className="flex items-center justify-center gap-4 md:gap-6 mb-10">
                {section.categories.map((cat: { label: string; color: string }, ci: number) => (
                  <div key={cat.label} className="flex flex-col items-center gap-[6px]">
                    <span
                      className="text-[10px] md:text-[11px] tracking-[0.3em] uppercase font-light"
                      style={{ color: section.mutedColor, opacity: 0.7 }}
                    >
                      {cat.label}
                    </span>
                    <div
                      className="w-full h-[3px] rounded-sm"
                      style={{ background: cat.color, opacity: 0.45 }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p
                className="text-[11px] tracking-[0.3em] uppercase font-light mb-10"
                style={{ color: section.mutedColor, opacity: 0.7 }}
              >
                {section.subtitle}
              </p>
            )}

            {section.enabled ? (
              <button
                onClick={() => handleEnter(section.href)}
                className="inline-flex items-center gap-3 text-[11px] tracking-[0.4em] uppercase font-light transition-all duration-500 hover:gap-5 group cursor-pointer"
                style={{ color: section.textColor, opacity: 0.6 }}
              >
                <span>Enter</span>
                <svg width="24" height="8" viewBox="0 0 24 8">
                  <line x1="0" y1="4" x2="20" y2="4" stroke="currentColor" strokeWidth="0.8" />
                  <line x1="17" y1="1" x2="21" y2="4" stroke="currentColor" strokeWidth="0.8" />
                  <line x1="17" y1="7" x2="21" y2="4" stroke="currentColor" strokeWidth="0.8" />
                </svg>
              </button>
            ) : (
              <span
                className="text-[10px] tracking-[0.4em] uppercase font-light"
                style={{ color: section.mutedColor, opacity: 0.4 }}
              >
                即将上线 / Coming Soon
              </span>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Page indicators — bottom center, horizontal dots */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3">
        {sections.map((s, i) => (
          <button
            key={s.title}
            onClick={() => goTo(i, i > current ? 1 : -1)}
            className="group relative flex flex-col items-center"
            aria-label={`Go to ${s.title}`}
          >
            <div
              className="w-8 h-[2px] rounded-full transition-all duration-500"
              style={{
                background: i === current ? section.textColor : section.mutedColor,
                opacity: i === current ? 0.8 : 0.15,
                transform: i === current ? "scaleX(1)" : "scaleX(0.6)",
              }}
            />
            <span
              className="absolute -top-5 text-[8px] tracking-[0.3em] uppercase font-light opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap"
              style={{ color: section.mutedColor }}
            >
              {s.title}
            </span>
          </button>
        ))}
      </div>

      {/* Horizontal scroll hint — bottom right */}
      <div className="fixed bottom-8 right-6 md:right-10 z-50 flex items-center gap-2">
        <motion.svg
          width="24" height="12" viewBox="0 0 24 12"
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ opacity: 0.2 }}
        >
          <line x1="0" y1="6" x2="18" y2="6" stroke={section.mutedColor as string} strokeWidth="0.8" />
          <line x1="14" y1="2" x2="19" y2="6" stroke={section.mutedColor as string} strokeWidth="0.8" />
          <line x1="14" y1="10" x2="19" y2="6" stroke={section.mutedColor as string} strokeWidth="0.8" />
        </motion.svg>
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-10 py-3">
        <span className="text-[9px] tracking-[0.2em] uppercase font-light" style={{ color: section.mutedColor, opacity: 0.3 }}>
          © {new Date().getFullYear()}
        </span>
        <span className="text-[9px] tracking-[0.2em] uppercase font-light" style={{ color: section.mutedColor, opacity: 0.3 }}>
          {current + 1} / {sections.length}
        </span>
      </div>

      {/* ═══ Smooth transition overlay ═══ */}
      {transitionPhase !== "idle" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: "#0a0a0a" }}>
          {/* Layer 1: Black base — always present as container bg, no flash */}

          {/* Layer 2: 4-color blended gradient */}
          <div
            className="absolute inset-0 transition-opacity ease-in-out"
            style={{
              background: `
                radial-gradient(ellipse at 20% 30%, #1a2a6c, transparent 50%),
                radial-gradient(ellipse at 80% 25%, #8b1a1a, transparent 50%),
                radial-gradient(ellipse at 25% 75%, #1a5c5c, transparent 50%),
                radial-gradient(ellipse at 75% 70%, #8b6914, transparent 50%),
                #0a0a0a
              `,
              opacity: transitionPhase === "colors" ? 1 : 0,
              transitionDuration: transitionPhase === "colors" ? "800ms" : "500ms",
            }}
          />

          {/* Layer 3: White wash */}
          <div
            className="absolute inset-0 transition-opacity ease-in-out"
            style={{
              background: "white",
              opacity: transitionPhase === "white" || transitionPhase === "done" ? 1 : 0,
              transitionDuration: "600ms",
            }}
          />

          {/* Center text — appears during color phase */}
          <p
            className="relative z-10 text-[11px] tracking-[0.6em] uppercase font-light transition-opacity ease-in-out"
            style={{
              color: "rgba(255,255,255,0.7)",
              opacity: transitionPhase === "colors" ? 1 : 0,
              transitionDuration: "600ms",
            }}
          >
            Portfolio
          </p>
        </div>
      )}
    </main>
  );
}

export default function HubPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-[#0a0a0a]" />}>
      <HubPageInner />
    </Suspense>
  );
}
