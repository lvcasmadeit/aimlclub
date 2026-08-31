import meetings from "@/lib/data/meetings.json";
import { getNextEvent } from "@/lib/meetings";
import type { MeetingsData } from "@/lib/types";

export function NextEventBar() {
  const next = getNextEvent((meetings as MeetingsData).upcoming);
  if (!next) return null;

  return (
    <a
      href="#meetings"
      className="flex h-10 items-center justify-center gap-2 border-b border-border bg-background-soft px-6 font-mono text-xs tracking-[0.12em] transition-colors hover:bg-hover"
    >
      <span className="shrink-0 text-muted uppercase">Next Event:</span>
      <span className="truncate text-accent">{next.title}</span>
    </a>
  );
}
