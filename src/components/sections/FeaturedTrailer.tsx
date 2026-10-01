"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

interface FeaturedTrailerProps {
  src: string;
  poster: string;
  label: string;
}

/** Muted trailer that plays while on screen (unless reduced motion); controls let viewers unmute. */
export function FeaturedTrailer({ src, poster, label }: FeaturedTrailerProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video || reduceMotion) return;
    if (inView) video.play().catch(() => {});
    else video.pause();
  }, [inView, reduceMotion]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      aria-label={label}
      muted
      loop
      playsInline
      controls
      preload="metadata"
      className="aspect-video w-full rounded-2xl border bg-background-soft object-cover"
    />
  );
}
