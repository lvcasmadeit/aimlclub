import type { MeetingsData, TimelineEntry, UpcomingMeeting } from "@/lib/types";
import { isTbd } from "@/lib/utils";

function hasScheduledDate(meeting: { date: string }): boolean {
  if (isTbd(meeting.date)) return false;
  return !Number.isNaN(new Date(meeting.date).getTime());
}

function isStillUpcoming(meeting: { date: string }, now: number): boolean {
  if (!hasScheduledDate(meeting)) return true;
  return new Date(meeting.date).getTime() >= now;
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
  now = Date.now(),
): UpcomingMeeting | undefined {
  const remaining = upcoming.filter((meeting) => isStillUpcoming(meeting, now));
  if (remaining.length === 0) return undefined;

  const scheduled = remaining.filter(hasScheduledDate).sort(byDate);
  if (scheduled.length > 0) return scheduled[0];

  return remaining[0];
}

export function buildTimeline(
  data: MeetingsData,
  now = Date.now(),
): {
  entries: TimelineEntry[];
  focusId: string | undefined;
} {
  const pastIds = new Set(data.past.map((meeting) => meeting.id));
  const expired = data.upcoming.filter(
    (meeting) => !isStillUpcoming(meeting, now) && !pastIds.has(meeting.id),
  );
  const remaining = data.upcoming.filter((meeting) =>
    isStillUpcoming(meeting, now),
  );

  const past: TimelineEntry[] = [
    ...data.past.map((meeting) => ({ kind: "past" as const, ...meeting })),
    ...expired.map((meeting) => ({
      kind: "past" as const,
      id: meeting.id,
      title: meeting.title,
      date: meeting.date,
      summary: meeting.description,
    })),
  ].sort(byDate);

  const upcoming: TimelineEntry[] = remaining
    .map((meeting) => ({ kind: "upcoming" as const, ...meeting }))
    .sort(byDate);

  const entries = [...past, ...upcoming];
  const next = getNextEvent(remaining, now);
  const focusId = next?.id ?? past.at(-1)?.id;

  return { entries, focusId };
}
