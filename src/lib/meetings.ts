import type { MeetingsData, TimelineEntry, UpcomingMeeting } from "@/lib/types";

function isPlaceholder(value: string): boolean {
  return value.trim().toUpperCase() === "TBD";
}

function hasScheduledDate(meeting: { date: string }): boolean {
  if (isPlaceholder(meeting.date)) return false;
  return !Number.isNaN(new Date(meeting.date).getTime());
}

function byDate(a: { date: string }, b: { date: string }): number {
  const aScheduled = hasScheduledDate(a);
  const bScheduled = hasScheduledDate(b);
  if (aScheduled && bScheduled) {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  }
  if (aScheduled) return -1;
  if (bScheduled) return 1;
  return 0;
}

export function getNextEvent(
  upcoming: UpcomingMeeting[],
): UpcomingMeeting | undefined {
  if (upcoming.length === 0) return undefined;

  const scheduled = upcoming.filter(hasScheduledDate).sort(byDate);
  if (scheduled.length > 0) return scheduled[0];

  return upcoming[0];
}

export function buildTimeline(data: MeetingsData): {
  entries: TimelineEntry[];
  focusId: string | undefined;
} {
  const past: TimelineEntry[] = data.past
    .map((meeting) => ({ kind: "past" as const, ...meeting }))
    .sort(byDate);

  const upcoming: TimelineEntry[] = data.upcoming
    .map((meeting) => ({ kind: "upcoming" as const, ...meeting }))
    .sort(byDate);

  const entries = [...past, ...upcoming];
  const next = getNextEvent(data.upcoming);
  const focusId = next?.id ?? past.at(-1)?.id;

  return { entries, focusId };
}
