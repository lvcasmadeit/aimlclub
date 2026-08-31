"use client";

import { useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import type { TimelineEntry } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

interface MeetingTimelineProps {
  entries: TimelineEntry[];
  focusId: string | undefined;
}

export function MeetingTimeline({ entries, focusId }: MeetingTimelineProps) {
  const scrollerRef = useRef<HTMLOListElement>(null);
  const focusRef = useRef<HTMLLIElement>(null);
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const target = focusRef.current;
    if (!scroller || !target) return;

    const scrollerBox = scroller.getBoundingClientRect();
    const targetBox = target.getBoundingClientRect();
    const delta =
      targetBox.left +
      targetBox.width / 2 -
      (scrollerBox.left + scrollerBox.width / 2);

    scroller.scrollTo({
      left: scroller.scrollLeft + delta,
      behavior: "auto",
    });
  }, [focusId]);

  if (entries.length === 0) {
    return (
      <p className="mx-auto mt-12 max-w-6xl px-6 text-sm text-muted">
        Dates will land here once they are locked in.
      </p>
    );
  }

  return (
    <ol
      ref={scrollerRef}
      tabIndex={0}
      aria-label="Meeting timeline"
      onKeyDown={(event) => {
        const scroller = scrollerRef.current;
        if (!scroller) return;
        const behavior: ScrollBehavior = reduceMotion ? "auto" : "smooth";
        if (event.key === "ArrowRight") {
          event.preventDefault();
          scroller.scrollBy({ left: 220, behavior });
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          scroller.scrollBy({ left: -220, behavior });
        }
      }}
      className="mt-12 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain px-[max(1.5rem,calc(50%-11rem))] pb-8 pt-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-offset-[-2px]"
    >
      {entries.map((entry) => {
        const focused = entry.id === focusId;
        const status = focused
          ? "next"
          : entry.kind === "past"
            ? "past"
            : "future";

        return (
          <li
            key={entry.id}
            ref={focused ? focusRef : undefined}
            aria-current={focused ? "date" : undefined}
            className={cn(
              "flex w-[min(18rem,75vw)] shrink-0 snap-center flex-col items-center px-3",
              status === "next" && "w-[min(22rem,85vw)]",
            )}
          >
            <div className="relative flex h-12 w-full items-center justify-center">
              <span
                aria-hidden
                className="absolute inset-x-0 top-1/2 h-px bg-border"
              />
              <span
                aria-hidden
                className={cn(
                  "relative z-10 rounded-full border",
                  status === "next" && "h-5 w-5 border-accent bg-accent",
                  status === "past" &&
                    "h-[11px] w-[11px] border-border bg-muted/40",
                  status === "future" &&
                    "h-[11px] w-[11px] border-accent/50 bg-background",
                )}
              >
                {status === "next" ? (
                  <span className="animate-event-glow absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent blur-md" />
                ) : null}
              </span>
            </div>

            <article
              className={cn(
                "relative isolate w-full rounded-2xl border p-5",
                status === "next" && "border-accent/50 bg-background-soft",
                status === "past" &&
                  "border-border bg-background-soft/40 text-muted",
                status === "future" && "border-border bg-background-soft/60",
              )}
            >
              {status === "next" ? (
                <span
                  aria-hidden
                  className="animate-event-glow pointer-events-none absolute -inset-3 -z-10 rounded-3xl bg-accent/45 blur-2xl"
                />
              ) : null}
              <p className="font-mono text-xs text-muted">
                {formatDate(entry.date)}
                {entry.kind === "upcoming" &&
                entry.location.trim().toUpperCase() !== "TBD"
                  ? ` · ${entry.location}`
                  : null}
              </p>
              <h4
                className={cn(
                  "mt-1 font-semibold",
                  status === "next" ? "text-xl" : "text-lg",
                  status === "past" && "text-muted",
                )}
              >
                {entry.title}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {entry.kind === "past" ? entry.summary : entry.description}
              </p>
              {entry.kind === "upcoming" && entry.rsvpUrl ? (
                <a
                  href={entry.rsvpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm text-accent transition-opacity hover:opacity-80"
                >
                  RSVP &rarr;
                </a>
              ) : null}
              {entry.kind === "past" && entry.recapUrl ? (
                <a
                  href={entry.recapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm text-accent transition-opacity hover:opacity-80"
                >
                  Recap &rarr;
                </a>
              ) : null}
            </article>
          </li>
        );
      })}
    </ol>
  );
}
