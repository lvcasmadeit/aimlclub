"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";
import blackTextLogo from "@/assets/logos/blackonwhitetext.png";
import whiteTextLogo from "@/assets/logos/whiteonblacktext.png";
import { HeroLandscape } from "@/components/sections/landscape/HeroLandscape";
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
      <motion.div
        className="relative z-10 mx-0 w-full px-6 pt-28 pb-12 text-left md:pl-12 lg:ml-[7vw] lg:w-[44vw] lg:max-w-none lg:px-0"
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

        <motion.h1 variants={item} className="mt-6 max-w-4xl">
          <span className="sr-only">{site.heroTitle}</span>
          <span
            aria-hidden="true"
            className="relative block aspect-[107/25] w-full max-w-[40rem] overflow-hidden"
          >
            <Image
              src={whiteTextLogo}
              alt=""
              fill
              sizes="(min-width: 40rem) 40rem, calc(100vw - 3rem)"
              className="object-cover light:hidden"
            />
            <Image
              src={blackTextLogo}
              alt=""
              fill
              sizes="(min-width: 40rem) 40rem, calc(100vw - 3rem)"
              className="hidden object-cover light:block"
            />
          </span>
          <span className="mt-5 block font-sans text-[clamp(1.875rem,7.5vw,3rem)] font-normal leading-snug tracking-normal text-foreground sm:mt-6">
            {site.tagline}
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-8 max-w-xl text-base leading-relaxed text-foreground/90 sm:text-lg"
        >
          {site.mission}
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 flex flex-wrap items-center justify-start gap-3 sm:gap-4"
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

      <HeroLandscape className="absolute top-1/2 right-[5vw] hidden aspect-square w-[38vw] max-w-[40rem] -translate-y-1/2 lg:block" />
    </section>
  );
}
