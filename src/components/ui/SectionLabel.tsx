interface SectionLabelProps {
  index: string;
  children: string;
}

export function SectionLabel({ index, children }: SectionLabelProps) {
  return (
    <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-muted">
      <span className="text-accent">{index}</span>
      <span className="h-px w-8 bg-border" />
      <span>{children}</span>
    </div>
  );
}
