"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useState, type FocusEvent } from "react";
import type { Project } from "@/lib/types";

interface ProjectCarouselProps {
  projects: Project[];
}

const slideVariants: Variants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 32 : -32,
  }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -32 : 32,
  }),
};

export function ProjectCarousel({ projects }: ProjectCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isPausedByUser, setIsPausedByUser] = useState<boolean | null>(null);
  const reduceMotion = useReducedMotion();
  const rotationPaused =
    Boolean(reduceMotion) ||
    (isPausedByUser ?? (isHovered || isFocused));
  const activeProject = projects[activeIndex];

  useEffect(() => {
    if (projects.length < 2 || rotationPaused) return;

    const interval = window.setInterval(() => {
      setDirection(1);
      setActiveIndex((current) => (current + 1) % projects.length);
    }, 6500);

    return () => window.clearInterval(interval);
  }, [projects.length, rotationPaused]);

  function moveBy(amount: number) {
    if (projects.length < 2) return;
    setDirection(amount);
    setActiveIndex((current) =>
      (current + amount + projects.length) % projects.length,
    );
  }

  function selectProject(index: number) {
    if (index === activeIndex) return;
    const forwardDistance = (index - activeIndex + projects.length) % projects.length;
    const backwardDistance = (activeIndex - index + projects.length) % projects.length;
    setDirection(forwardDistance <= backwardDistance ? 1 : -1);
    setActiveIndex(index);
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsFocused(false);
    }
  }

  if (!activeProject) {
    return <p className="text-sm text-muted">No projects to feature yet.</p>;
  }

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Club projects"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={handleBlur}
    >
      <AnimatePresence initial={false} mode="wait" custom={direction}>
        <motion.div
          key={activeProject.id}
          custom={direction}
          variants={slideVariants}
          initial={reduceMotion ? false : "enter"}
          animate="center"
          exit="exit"
          transition={{
            duration: reduceMotion ? 0 : 0.38,
            ease: [0.16, 1, 0.3, 1],
          }}
          aria-live={rotationPaused ? "polite" : "off"}
          aria-atomic="true"
          className="grid items-center gap-8 text-left lg:grid-cols-[minmax(0,0.85fr)_minmax(24rem,1.15fr)] lg:gap-16"
        >
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              {activeProject.status} project
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {activeProject.title}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
              {activeProject.description}
            </p>

            {activeProject.githubUrl || activeProject.demoUrl ? (
              <div className="mt-6 flex flex-wrap gap-5 text-sm font-medium">
                {activeProject.demoUrl ? (
                  <a
                    href={activeProject.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-muted"
                  >
                    Live demo <span aria-hidden="true">↗</span>
                  </a>
                ) : null}
                {activeProject.githubUrl ? (
                  <a
                    href={activeProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-muted"
                  >
                    Source code <span aria-hidden="true">↗</span>
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>

          <figure
            aria-label={`${activeProject.title} project preview`}
            className="relative aspect-[16/10] w-full overflow-hidden rounded-[1.5rem] border border-border bg-background-soft/50"
          >
            {activeProject.coverImageUrl ? (
              <Image
                src={activeProject.coverImageUrl}
                alt=""
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                unoptimized
                className="object-cover"
              />
            ) : (
              <div
                aria-hidden="true"
                className="absolute inset-0 overflow-hidden bg-gradient-to-br from-background-soft via-background to-background-soft"
              >
                <div className="absolute -right-12 -top-16 size-64 rounded-full border border-foreground/10" />
                <div className="absolute right-8 top-8 size-40 rounded-full border border-foreground/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-7xl font-semibold tracking-[-0.14em] text-foreground/10 sm:text-8xl">
                    AI<span className="text-accent/50">+</span>ML
                  </span>
                </div>
              </div>
            )}

            {activeProject.coverImageUrl ? (
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-background/10"
              />
            ) : null}

            <div className="absolute inset-x-5 top-5 flex items-center justify-between gap-3 sm:inset-x-6 sm:top-6">
              <span className="rounded-full border border-border bg-background/75 px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-foreground backdrop-blur-sm">
                Project {String(activeIndex + 1).padStart(2, "0")}
              </span>
              <span className="rounded-full border border-border bg-background/75 px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted backdrop-blur-sm">
                {activeProject.status}
              </span>
            </div>

            {activeProject.tags.length > 0 ? (
              <ul
                aria-label={`${activeProject.title} technologies`}
                className="absolute inset-x-5 bottom-5 flex flex-wrap gap-2 sm:inset-x-6 sm:bottom-6"
              >
                {activeProject.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-border bg-background/75 px-3 py-1.5 font-mono text-[0.65rem] text-muted backdrop-blur-sm"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}
          </figure>
        </motion.div>
      </AnimatePresence>

      {projects.length > 1 ? (
        <div className="mt-6 flex items-center justify-between gap-4">
          <p
            aria-live="polite"
            aria-atomic="true"
            className="font-mono text-xs tabular-nums text-muted"
          >
            {String(activeIndex + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
          </p>

          <div className="flex items-center gap-4">
            <div role="group" aria-label="Select project" className="flex items-center gap-1">
              {projects.map((project, index) => (
                <button
                  key={project.id}
                  type="button"
                  aria-label={`Show project ${index + 1}: ${project.title}`}
                  aria-pressed={index === activeIndex}
                  onClick={() => selectProject(index)}
                  className="flex h-10 items-center px-1 focus-visible:rounded-full"
                >
                  <span
                    aria-hidden="true"
                    className={`size-2 rounded-full transition-opacity ${
                      index === activeIndex
                        ? "bg-accent opacity-100"
                        : "bg-muted opacity-40 hover:opacity-80"
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {!reduceMotion ? (
                <button
                  type="button"
                  aria-label={rotationPaused ? "Resume project rotation" : "Pause project rotation"}
                  onClick={() => setIsPausedByUser(!rotationPaused)}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-border px-3 text-xs font-medium text-muted transition-colors hover:bg-hover hover:text-foreground"
                >
                  {rotationPaused ? "Play" : "Pause"}
                </button>
              ) : null}
              <button
                type="button"
                aria-label="Previous project"
                onClick={() => moveBy(-1)}
                className="inline-flex size-10 items-center justify-center rounded-full border border-border text-lg text-foreground transition-colors hover:bg-hover"
              >
                <span aria-hidden="true">←</span>
              </button>
              <button
                type="button"
                aria-label="Next project"
                onClick={() => moveBy(1)}
                className="inline-flex size-10 items-center justify-center rounded-full border border-border text-lg text-foreground transition-colors hover:bg-hover"
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
