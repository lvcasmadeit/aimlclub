import { cn } from "@/lib/utils";

interface SectionLabelProps {
  index: string;
  children: string;
  className?: string;
}

export function SectionLabel({ index, children, className }: SectionLabelProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-muted",
        className,
      )}
    >
      <span className="text-accent">{index}</span>
      <span className="h-px w-8 bg-border" />
      <span>{children}</span>
    </div>
  );
}
