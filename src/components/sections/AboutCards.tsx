"use client";

import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { AboutCard, AboutCardId } from "@/lib/types";
import { cn } from "@/lib/utils";

// three.js is client-only and heavy; load it after hydration in its own chunk.
const AboutCardScene = dynamic(() => import("@/components/sections/AboutCardScene"), {
  ssr: false,
  loading: () => null,
});

interface AboutCardsProps {
  cards: AboutCard[];
}

/**
 * Spotlight row: hover/focus (or scroll position on mobile) picks the active card.
 * On lg+ the active card widens via flex-grow; below that it's a snap carousel / 2-col grid.
 */
export function AboutCards({ cards }: AboutCardsProps) {
  const [activeId, setActiveId] = useState<AboutCardId | undefined>(cards[0]?.id);
  const listRef = useRef<HTMLUListElement>(null);
  const frame = useRef(0);
  const inView = useInView(listRef);
  const reduceMotion = useReducedMotion();
  const animate = inView && !reduceMotion;

  // In the mobile snap carousel, spotlight whichever card is closest to center.
  function handleScroll() {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const list = listRef.current;
      if (!list || list.scrollWidth <= list.clientWidth) return;
      const center = list.scrollLeft + list.clientWidth / 2;
      let closest: { id: AboutCardId; distance: number } | undefined;
      for (const item of Array.from(list.children) as HTMLElement[]) {
        const distance = Math.abs(item.offsetLeft + item.offsetWidth / 2 - center);
        const id = item.dataset.id as AboutCardId;
        if (!closest || distance < closest.distance) closest = { id, distance };
      }
      if (closest) setActiveId(closest.id);
    });
  }

  return (
    <ul
      ref={listRef}
      onScroll={handleScroll}
      className="-mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-4 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 md:pb-0 lg:flex"
    >
      {cards.map((card) => {
        const active = card.id === activeId;
        return (
          <li
            key={card.id}
            data-id={card.id}
            className={cn(
              "h-[30rem] w-[82%] shrink-0 snap-center sm:w-[48%] md:w-auto lg:h-[34rem] lg:min-w-0 lg:basis-0 lg:transition-[flex-grow] lg:duration-700 lg:ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
              active ? "lg:grow-[1.7]" : "lg:grow",
            )}
            onPointerEnter={() => setActiveId(card.id)}
            onFocus={() => setActiveId(card.id)}
          >
            <CardShell card={card} active={active} animate={animate} />
          </li>
        );
      })}
    </ul>
  );
}

function useInView(ref: React.RefObject<Element | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return inView;
}

function CardShell({ card, active, animate }: { card: AboutCard; active: boolean; animate: boolean }) {
  return (
    <div
      className={cn(
        "h-full rounded-[2.25rem] border p-1.5 transition-colors duration-500",
        active ? "border-foreground/20" : "border-transparent",
      )}
    >
      <article
        data-active={active || undefined}
        className="group relative flex h-full flex-col overflow-hidden rounded-[1.85rem] border bg-[var(--card-surface)] p-7"
      >
        <CardVisual id={card.id} active={active} animate={animate} />

        {card.chips && (
          <ul
            aria-label={`${card.title} highlights`}
            className="absolute top-1/2 right-5 z-10 flex -translate-y-1/2 flex-col items-end gap-2"
          >
            {card.chips.map((chip, chipIndex) => (
              <li
                key={chip}
                style={{ transitionDelay: active ? `${200 + chipIndex * 70}ms` : "0ms" }}
                className="translate-x-3 rounded-full border border-[var(--glass-edge)] bg-background/70 px-3 py-1 font-mono text-[11px] whitespace-nowrap text-foreground opacity-0 shadow-sm backdrop-blur-md transition duration-500 group-data-active:translate-x-0 group-data-active:opacity-100 light:bg-white/80"
              >
                + {chip}
              </li>
            ))}
          </ul>
        )}

        <h3 className="relative z-10 text-[1.75rem] leading-[1.05] font-light tracking-tight whitespace-nowrap text-muted transition-colors duration-500 group-data-active:text-foreground 2xl:text-[2rem]">
          {card.title}
        </h3>

        <div className="relative z-10 mt-auto flex items-end justify-between gap-4">
          <p className="max-w-[18ch] text-sm leading-snug text-muted transition-colors duration-500 group-data-active:text-foreground">
            {card.blurb}
          </p>
          <a
            href={card.href}
            aria-label={`${card.title}: learn more`}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-foreground text-background transition-transform duration-300 hover:scale-105"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="size-4 transition-transform duration-500 group-data-active:-rotate-45"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </a>
        </div>
      </article>
    </div>
  );
}

interface Blob {
  color: string;
  className: string;
  delay: string;
}

// Positioned relative to the square object stage, so they stay round as the card widens.
const blobs: Record<AboutCardId, Blob[]> = {
  hacks: [
    { color: "--blob-ice", className: "-top-[10%] left-[20%] size-[110%]", delay: "0s" },
    { color: "--blob-periwinkle", className: "top-[25%] -left-[35%] size-[100%]", delay: "-5s" },
    { color: "--blob-sky", className: "top-[30%] left-[30%] size-[90%]", delay: "-9s" },
  ],
  speakers: [
    { color: "--blob-periwinkle", className: "-top-[15%] left-[15%] size-[110%]", delay: "-3s" },
    { color: "--blob-cobalt", className: "top-[20%] -left-[35%] size-[100%]", delay: "-7s" },
    { color: "--blob-ice", className: "top-[35%] left-[35%] size-[85%]", delay: "-11s" },
  ],
  workshops: [
    { color: "--blob-sky", className: "-top-[15%] left-[10%] size-[110%]", delay: "-2s" },
    { color: "--blob-ice", className: "top-[30%] -left-[30%] size-[95%]", delay: "-6s" },
    { color: "--blob-cobalt", className: "top-[10%] left-[45%] size-[80%]", delay: "-10s" },
  ],
  projects: [
    { color: "--blob-periwinkle", className: "top-[15%] -left-[35%] size-[100%]", delay: "-4s" },
    { color: "--blob-ice", className: "top-[30%] left-[35%] size-[100%]", delay: "-8s" },
    { color: "--blob-sky", className: "-top-[20%] left-[15%] size-[85%]", delay: "-12s" },
  ],
};

/** Gradient blobs + three.js glass object on a centered square stage. */
function CardVisual({ id, active, animate }: { id: AboutCardId; active: boolean; animate: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="absolute top-[52%] left-1/2 aspect-square h-[46%] -translate-x-1/2 -translate-y-1/2">
        {blobs[id].map((blob) => (
          <div
            key={blob.color}
            className={cn(
              "animate-blob-drift absolute rounded-full opacity-[calc(var(--blob-opacity)*0.75)] blur-2xl transition-opacity duration-700 group-data-active:opacity-[var(--blob-opacity)]",
              blob.className,
            )}
            style={{
              background: `radial-gradient(circle, var(${blob.color}) 0%, transparent 68%)`,
              animationDelay: blob.delay,
            }}
          />
        ))}
        <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-data-active:scale-[1.08]">
          {/* Canvas overhangs the stage so swaying objects never clip at its edge. */}
          <div className="absolute -inset-[18%]">
            <AboutCardScene id={id} active={active} animate={animate} fallback={<CardObject id={id} />} />
          </div>
        </div>
      </div>
    </div>
  );
}

const glass = (light = "35% 30%"): CSSProperties => ({
  background: `radial-gradient(circle at ${light}, var(--glass-hi) 0%, var(--glass-body) 32%, var(--glass-shade) 100%)`,
  boxShadow: "inset 0 0 0 1px var(--glass-edge), inset -10px -14px 30px rgba(255,255,255,0.12)",
});

/** CSS fallback objects (stage-relative, centered) for browsers without WebGL. */
function CardObject({ id }: { id: AboutCardId }) {
  switch (id) {
    case "hacks":
      return (
        <>
          <div className="absolute top-[19%] left-[19%] aspect-square w-[62%] rounded-full" style={glass()} />
          <div className="absolute top-[8%] left-[68%] aspect-square w-[16%] rounded-full opacity-85" style={glass("40% 35%")} />
        </>
      );
    case "speakers":
      return (
        <div className="absolute inset-0 -rotate-12">
          <div className="absolute top-[6%] left-1/2 aspect-square w-[40%] -translate-x-1/2 rounded-full" style={glass()} />
          <div className="absolute top-[46%] left-1/2 h-[46%] w-[16%] -translate-x-1/2 rounded-b-full rounded-t-md" style={glass("30% 20%")} />
        </div>
      );
    case "workshops":
      return (
        <div className="absolute inset-0 [perspective:700px]">
          {Array.from({ length: 6 }, (_, sheet) => (
            <div
              key={sheet}
              className="absolute aspect-[3/5] w-[34%] rounded-md border border-[var(--glass-edge)] backdrop-blur-[2px]"
              style={{
                left: `${13 + sheet * 8}%`,
                top: `${12 + sheet * 2}%`,
                transform: "rotateY(-24deg)",
                background:
                  "linear-gradient(160deg, color-mix(in srgb, var(--glass-hi) 55%, transparent), color-mix(in srgb, var(--glass-body) 45%, transparent))",
              }}
            />
          ))}
        </div>
      );
    case "projects":
      return (
        <>
          <div className="absolute top-[8%] left-[35%] aspect-square w-[30%] rotate-6 rounded-2xl" style={glass("30% 25%")} />
          <div className="absolute top-[50%] left-[14%] aspect-square w-[30%] -rotate-6 rounded-2xl" style={glass("30% 25%")} />
          <div className="absolute top-[50%] left-[56%] aspect-square w-[30%] rotate-[18deg] rounded-2xl" style={glass("30% 25%")} />
        </>
      );
  }
}
