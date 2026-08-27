import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-border bg-background-soft/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_0_32px_-12px_var(--color-accent)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
