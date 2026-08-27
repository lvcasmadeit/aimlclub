import type { ReactNode } from "react";
import { Stagger, RevealItem } from "@/components/ui/AnimatedSection";

interface TimelineProps {
  children: ReactNode;
}

/** Vertical timeline rail; pair with <TimelineItem> rows. */
export function Timeline({ children }: TimelineProps) {
  return (
    <Stagger className="relative mt-6 space-y-8 before:absolute before:left-[5px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border">
      {children}
    </Stagger>
  );
}

export function TimelineItem({
  accent = false,
  children,
}: {
  accent?: boolean;
  children: ReactNode;
}) {
  return (
    <RevealItem className="relative pl-8">
      <span
        aria-hidden
        className={
          "absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border " +
          (accent
            ? "border-accent bg-accent shadow-[0_0_12px_var(--color-accent)]"
            : "border-border bg-background")
        }
      />
      {children}
    </RevealItem>
  );
}
