"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";
import cloudHeroDark from "@/assets/cloudherodark-dithered.png";
import cloudHeroLight from "@/assets/cloudherolight-dithered.png";
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
    <section id="hero" className="relative flex min-h-svh items-center overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <Image
          src={cloudHeroDark}
          alt=""
          fill
          sizes="100vw"
          fetchPriority="high"
          className="object-cover object-[60%_center] light:hidden"
        />
        <Image
          src={cloudHeroLight}
          alt=""
          fill
          sizes="100vw"
          fetchPriority="high"
          className="hidden object-cover object-[60%_center] light:block"
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
      </div>

      <motion.div
        className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-28 pb-12 text-center"
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
          className="mx-auto mt-6 max-w-4xl font-sans text-[clamp(3rem,15vw,6rem)] font-normal leading-[1.05] tracking-tight"
        >
          {site.heroTitle}
          <span className="mt-5 block font-sans text-[clamp(1.875rem,7.5vw,3rem)] font-normal leading-snug tracking-normal text-foreground sm:mt-6">
            {site.tagline}
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-foreground/90 sm:text-lg"
        >
          {site.mission}
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
        >
          <ButtonLink
            href={site.joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shadow-[0_0_32px_color-mix(in_srgb,var(--accent)_40%,transparent)]"
          >
            Join Discord
          </ButtonLink>
          <ButtonLink href="#meetings" variant="ghost">
            See what&apos;s next
          </ButtonLink>
        </motion.div>
      </motion.div>
    </section>
  );
}
