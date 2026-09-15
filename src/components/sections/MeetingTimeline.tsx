"use client";

import { useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import type { TimelineEntry } from "@/lib/types";
import { cn, formatDate, formatLocation } from "@/lib/utils";

interface MeetingTimelineProps {
  entries: TimelineEntry[];
  focusId: string | undefined;
}

function statusCopy(status: "next" | "past" | "future") {
  if (status === "next") return "Next up";
  if (status === "past") return "Past";
  return "Upcoming";
}

export function MeetingTimeline({ entries, focusId }: MeetingTimelineProps) {
  const scrollerRef = useRef<HTMLOListElement>(null);
  const focusRef = useRef<HTMLLIElement>(null);
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const target = focusRef.current;
    if (!scroller || !target) return;
    if (window.matchMedia("(max-width: 767px)").matches) return;

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
      <div className="mx-auto mt-10 max-w-6xl px-6">
        <div className="rounded-2xl border border-dashed border-border bg-background-soft/40 px-6 py-10 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
            Calendar TBA
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
            Dates will land here once they are locked in. Join Discord and you
            will hear first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mt-10 md:mt-12">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-16 bg-gradient-to-r from-background to-transparent md:block" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-16 bg-gradient-to-l from-background to-transparent md:block" />

      <ol
        ref={scrollerRef}
        tabIndex={0}
        aria-label="Meeting timeline"
        onKeyDown={(event) => {
          const scroller = scrollerRef.current;
          if (!scroller) return;
          if (window.matchMedia("(max-width: 767px)").matches) return;
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
        className="flex flex-col gap-4 px-6 md:flex-row md:gap-0 md:overflow-x-auto md:overscroll-x-contain md:px-[max(1.5rem,calc(50%-11rem))] md:pb-8 md:pt-6 md:snap-x md:snap-mandatory [scrollbar-width:thin] md:[scrollbar-width:none] md:[-ms-overflow-style:none] md:[&::-webkit-scrollbar]:hidden focus-visible:outline-offset-[-2px]"
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
                "flex w-full shrink-0 flex-col md:w-[min(18rem,75vw)] md:snap-center md:items-center md:px-3",
                status === "next" && "md:w-[min(22rem,85vw)]",
              )}
            >
              <div className="relative hidden h-12 w-full items-center justify-center overflow-hidden md:flex">
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-1/2 h-px bg-border"
                />
                {status === "next" ? (
                  <span
                    aria-hidden
                    className="animate-event-glow pointer-events-none absolute left-1/2 top-1/2 z-10 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent blur-sm"
                  />
                ) : null}
                <span
                  aria-hidden
                  className={cn(
                    "relative z-20 rounded-full border",
                    status === "next" && "h-5 w-5 border-accent bg-accent",
                    status === "past" &&
                      "h-[11px] w-[11px] border-border bg-muted/40",
                    status === "future" &&
                      "h-[11px] w-[11px] border-accent/50 bg-background",
                  )}
                />
              </div>

              <article
                className={cn(
                  "relative w-full rounded-2xl border p-5",
                  status === "next" && "border-accent/50 bg-background-soft",
                  status === "past" &&
                    "border-border bg-background-soft/40 text-muted",
                  status === "future" && "border-border bg-background-soft/60",
                )}
              >
                <p
                  className={cn(
                    "font-mono text-[0.7rem] uppercase tracking-[0.16em]",
                    status === "next" ? "text-accent" : "text-muted",
                  )}
                >
                  {statusCopy(status)}
                </p>
                <p className="mt-2 font-mono text-xs text-muted">
                  {formatDate(entry.date)}
                  {entry.kind === "upcoming"
                    ? ` · ${formatLocation(entry.location)}`
                    : null}
                </p>
                <h4
                  className={cn(
                    "mt-1 font-semibold text-foreground",
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
    </div>
  );
}
