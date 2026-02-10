"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";

/*
  Transition flow (single persistent overlay, no conditional rendering flicker):
  1. "fill"   — clip-path circle grows from card center → covers screen
  2. "hold"   — full screen color, navigate in background
  3. "reveal" — clip-path circle shrinks toward title center → uncovers page
  4. "idle"   — overlay hidden
*/

type Phase = "idle" | "fill" | "hold" | "reveal";

interface TransitionContextType {
  triggerTransition: (opts: {
    color: string;
    href: string;
    originX: number;
    originY: number;
  }) => void;
  registerRevealOrigin: (x: number, y: number) => void;
  transitionColor: string | null;
  isRevealing: boolean;
}

const TransitionContext = createContext<TransitionContextType>({
  triggerTransition: () => {},
  registerRevealOrigin: () => {},
  transitionColor: null,
  isRevealing: false,
});

export function usePageTransition() {
  return useContext(TransitionContext);
}

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const phaseRef = useRef<Phase>("idle");
  const colorRef = useRef("#000");
  const hrefRef = useRef("");
  const revealRegistered = useRef(false);
  const [, forceRender] = useState(0);

  /* Expose for context consumers */
  const [ctxColor, setCtxColor] = useState<string | null>(null);
  const [ctxRevealing, setCtxRevealing] = useState(false);

  function maxRadius() {
    return Math.hypot(window.innerWidth, window.innerHeight);
  }

  /* ---- trigger: start fill from card center ---- */
  const triggerTransition = useCallback(
    (opts: { color: string; href: string; originX: number; originY: number }) => {
      const el = overlayRef.current;
      if (!el) return;

      phaseRef.current = "fill";
      colorRef.current = opts.color;
      hrefRef.current = opts.href;
      revealRegistered.current = false;
      setCtxColor(opts.color);
      setCtxRevealing(false);

      const r = maxRadius();

      el.style.background = opts.color;
      el.style.visibility = "visible";
      el.style.transition = "none";
      el.style.clipPath = `circle(0px at ${opts.originX}px ${opts.originY}px)`;

      // Force reflow so the initial clip-path is applied before animating
      void el.offsetHeight;

      el.style.transition = `clip-path 0.65s cubic-bezier(0.22, 1, 0.36, 1)`;
      el.style.clipPath = `circle(${r}px at ${opts.originX}px ${opts.originY}px)`;
    },
    []
  );

  /* ---- listen for fill transition end → hold + navigate ---- */
  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;

    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName !== "clip-path") return;

      if (phaseRef.current === "fill") {
        phaseRef.current = "hold";
        // Snap to full screen (no circle clip)
        el.style.transition = "none";
        el.style.clipPath = "none";

        // Subtle shake feedback when color fills the screen
        el.style.transform = "translate(3px, 0)";
        requestAnimationFrame(() => {
          el.style.transition = "transform 60ms ease";
          el.style.transform = "translate(-2px, 0)";
          setTimeout(() => {
            el.style.transform = "translate(1px, 0)";
            setTimeout(() => {
              el.style.transition = "none";
              el.style.transform = "none";
              // Navigate after shake
              if (hrefRef.current) {
                router.push(hrefRef.current);
              }
              forceRender((n) => n + 1);
            }, 60);
          }, 60);
        });
      }
    };

    el.addEventListener("transitionend", onEnd);
    return () => el.removeEventListener("transitionend", onEnd);
  }, [router]);

  /* ---- target page registers title position → start reveal ---- */
  const registerRevealOrigin = useCallback((x: number, y: number) => {
    if (revealRegistered.current) return;
    revealRegistered.current = true;

    const el = overlayRef.current;
    if (!el || phaseRef.current !== "hold") return;

    startReveal(el, x, y);
  }, []);

  const revealRaf = useRef(0);

  function startReveal(el: HTMLDivElement, cx: number, cy: number) {
    phaseRef.current = "reveal";
    setCtxRevealing(true);

    // Animate a radial-gradient mask via rAF:
    // A transparent circle (hole) at the title center grows from 0 → maxR,
    // revealing the page underneath.
    const targetR = maxRadius();
    const duration = 750; // ms
    const start = performance.now();

    el.style.clipPath = "none";
    el.style.transition = "none";

    function easeOutQuart(t: number) {
      return 1 - Math.pow(1 - t, 4);
    }

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const easedR = easeOutQuart(progress) * targetR;

      const mask = `radial-gradient(circle ${easedR}px at ${cx}px ${cy}px, transparent 100%, ${colorRef.current} 100%)`;
      el.style.mask = mask;
      el.style.webkitMask = mask;

      if (progress < 1) {
        revealRaf.current = requestAnimationFrame(tick);
      } else {
        // Done — hide overlay
        phaseRef.current = "idle";
        el.style.visibility = "hidden";
        el.style.mask = "none";
        el.style.webkitMask = "none";
        hrefRef.current = "";
        revealRegistered.current = false;
        setCtxColor(null);
        setCtxRevealing(false);
      }
    }

    cancelAnimationFrame(revealRaf.current);
    revealRaf.current = requestAnimationFrame(tick);
  }

  /* ---- fallback: if pathname changes but no register within 500ms ---- */
  useEffect(() => {
    if (phaseRef.current === "hold" && hrefRef.current) {
      const base = hrefRef.current.split("?")[0];
      if (pathname === base || pathname.startsWith(base)) {
        const timer = setTimeout(() => {
          if (!revealRegistered.current && overlayRef.current) {
            revealRegistered.current = true;
            startReveal(
              overlayRef.current,
              window.innerWidth / 2,
              window.innerHeight * 0.35
            );
          }
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [pathname]);

  const contextValue: TransitionContextType = {
    triggerTransition,
    registerRevealOrigin,
    transitionColor: ctxColor,
    isRevealing: ctxRevealing,
  };

  return (
    <TransitionContext.Provider value={contextValue}>
      {children}
      {/* Single persistent overlay — never unmounted, just hidden */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[100] pointer-events-none"
        style={{ visibility: "hidden", background: "#000" }}
      />
    </TransitionContext.Provider>
  );
}
