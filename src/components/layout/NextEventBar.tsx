import meetings from "@/lib/data/meetings.json";
import { getNextEvent } from "@/lib/meetings";
import { formatDate } from "@/lib/utils";
import type { MeetingsData } from "@/lib/types";

export function NextEventBar() {
  const next = getNextEvent((meetings as MeetingsData).upcoming);
  if (!next) return null;

  return (
    <a
      href="#meetings"
      data-next-event-bar
      className="fixed inset-x-0 top-16 z-30 flex h-10 items-center justify-center gap-2 border-b border-border bg-background-soft/80 px-6 font-mono text-xs tracking-[0.12em] backdrop-blur-md transition-colors hover:bg-hover"
    >
      <span className="shrink-0 text-muted uppercase">Next up</span>
      <span className="truncate text-foreground">{next.title}</span>
      <span className="hidden shrink-0 text-muted sm:inline">
        · {formatDate(next.date)}
      </span>
    </a>
  );
}
