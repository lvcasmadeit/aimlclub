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
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      <div aria-hidden className="hero-scan" />
      <div
        aria-hidden
        className="animate-float-blob pointer-events-none absolute -top-1/5 left-1/2 h-[70vh] w-[70vh] -translate-x-1/2 rounded-full bg-accent/25 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-1/6 -left-16 h-[42vh] w-[42vh] rounded-full bg-accent/12 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 h-[48vh] w-[48vh] rounded-full bg-violet/20 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,var(--background)_100%)]"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />

      <motion.div
        className="relative mx-auto w-full max-w-6xl px-6 pt-24"
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
          className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl"
        >
          {site.name}
          <span className="block text-muted">{site.tagline}</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-8 max-w-xl text-lg leading-relaxed text-muted"
        >
          {site.mission}
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-wrap gap-4">
          <ButtonLink
            href={site.joinUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Join the club
          </ButtonLink>
          <ButtonLink href="#projects" variant="ghost">
            See our work
          </ButtonLink>
        </motion.div>

        <motion.dl
          variants={item}
          className="mt-16 flex flex-wrap gap-x-12 gap-y-6 border-t border-border pt-8"
        >
          {site.stats.map((stat) => (
            <div key={stat.label}>
              <dt className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                {stat.label}
              </dt>
              <dd className="mt-1 text-3xl font-semibold">{stat.value}</dd>
            </div>
          ))}
        </motion.dl>
      </motion.div>
    </section>
  );
}
