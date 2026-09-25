"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { ButtonLink } from "@/components/ui/Button";
import site from "@/lib/data/site.json";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="hero"
      onPointerMove={(event) => {
        if (event.pointerType === "touch") return;

        const section = event.currentTarget;
        const bounds = section.getBoundingClientRect();
        section.style.setProperty(
          "--pointer-x",
          `${event.clientX - bounds.left}px`,
        );
        section.style.setProperty(
          "--pointer-y",
          `${event.clientY - bounds.top}px`,
        );
        section.dataset.pointerActive = "true";
      }}
      onPointerLeave={(event) => {
        delete event.currentTarget.dataset.pointerActive;
      }}
      className="relative flex min-h-svh items-center overflow-hidden"
    >
      <div aria-hidden className="hero-dot-grid" />
      <div aria-hidden className="hero-dot-glow" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />

      <motion.div
        className="relative mx-auto w-full max-w-6xl px-6 pt-28 pb-12 text-center"
        variants={container}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
      >
        <motion.p
          variants={item}
          className="font-mono text-xs uppercase tracking-[0.3em] text-accent"
        >
          {site.university}
        </motion.p>

        <motion.h1
          variants={item}
          className="mt-6 text-[clamp(3rem,15vw,6rem)] font-semibold leading-[1.05] tracking-tight"
        >
          {site.name}
          <span className="mt-4 block font-pixel text-[clamp(1.875rem,7.5vw,3rem)] font-medium leading-snug tracking-normal text-muted">
            {site.tagline}
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-muted"
        >
          {site.mission}
        </motion.p>

        <motion.div variants={item} className="mt-10 flex justify-center">
          <ButtonLink
            href={site.joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shadow-[0_0_32px_rgba(194,65,12,0.45)]"
          >
            Join the club
          </ButtonLink>
        </motion.div>
      </motion.div>
    </section>
  );
}
