"use client";

import { useInView, useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { useCallback, useRef, useSyncExternalStore } from "react";
import { displayLoss, OPTIMIZERS } from "./loss";
import type { RaceProgress } from "./LandscapeScene";

// three.js loads in its own chunk (shared with the About cards), and only on large screens.
const LandscapeScene = dynamic(() => import("./LandscapeScene"), { ssr: false, loading: () => null });

const DESKTOP = "(min-width: 64rem)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(DESKTOP);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const SWATCHES: Record<(typeof OPTIMIZERS)[number], string> = {
  sgd: "var(--foreground)",
  momentum: "var(--landscape-momentum)",
  adam: "var(--landscape-adam)",
};

/** Interactive loss landscape with an SGD / Momentum / Adam race, for the hero's right side (lg+). */
export function HeroLandscape({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isDesktop = useSyncExternalStore(subscribe, () => window.matchMedia(DESKTOP).matches, () => false);
  const inView = useInView(ref);
  const reduceMotion = useReducedMotion() ?? false;

  // The HUD updates ~30×/s, so write text directly instead of re-rendering React.
  const stepText = useRef<HTMLSpanElement>(null);
  const lossText = useRef<Array<HTMLSpanElement | null>>([]);
  const handleProgress = useCallback(({ step, losses }: RaceProgress) => {
    if (stepText.current) stepText.current.textContent = String(step).padStart(3, "0");
    losses.forEach((value, i) => {
      const element = lossText.current[i];
      if (element) element.textContent = displayLoss(value).toFixed(3);
    });
  }, []);

  if (!isDesktop) return <div ref={ref} className={className} aria-hidden="true" />;

  return (
    <div ref={ref} className={className} aria-hidden="true">
      <LandscapeScene active={inView} reduceMotion={reduceMotion} onProgress={handleProgress} />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between font-mono text-[11px] tracking-[0.15em] text-muted">
        <span>f(θ) · loss landscape</span>
        <span>
          step <span ref={stepText}>000</span>
        </span>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between font-mono text-[11px] text-muted">
        <ul className="space-y-1">
          {OPTIMIZERS.map((name, i) => (
            <li key={name} className="flex items-center gap-2">
              <span className="size-1.5 rounded-full" style={{ background: SWATCHES[name] }} />
              <span className="w-16 text-foreground">{name}</span>
              <span ref={(element) => void (lossText.current[i] = element)} className="tabular-nums">
                –
              </span>
            </li>
          ))}
        </ul>
        <span>drag to orbit · click to drop</span>
      </div>
    </div>
  );
}
