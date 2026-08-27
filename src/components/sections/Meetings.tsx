import { Reveal } from "@/components/ui/AnimatedSection";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Timeline, TimelineItem } from "@/components/ui/Timeline";
import meetings from "@/lib/data/meetings.json";
import type { MeetingsData } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function Meetings() {
  const { upcoming, past } = meetings as MeetingsData;

  return (
    <section id="meetings" className="border-y border-border">
      <div className="mx-auto max-w-6xl px-6 py-28">
        <Reveal>
          <SectionLabel index="03">Meetings</SectionLabel>
        </Reveal>
        <Reveal>
          <h2 className="mt-6 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Where we have been, where we are headed.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-16 lg:grid-cols-2">
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              Upcoming
            </h3>
            <Timeline>
              {upcoming.map((meeting) => (
                <TimelineItem key={meeting.id} accent>
                  <p className="font-mono text-xs text-muted">
                    {formatDate(meeting.date)} · {meeting.location}
                  </p>
                  <h4 className="mt-1 text-lg font-semibold">
                    {meeting.title}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {meeting.description}
                  </p>
                  {meeting.rsvpUrl && (
                    <a
                      href={meeting.rsvpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-sm text-accent transition-opacity hover:opacity-80"
                    >
                      RSVP &rarr;
                    </a>
                  )}
                </TimelineItem>
              ))}
            </Timeline>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
              Past
            </h3>
            <Timeline>
              {past.map((meeting) => (
                <TimelineItem key={meeting.id}>
                  <p className="font-mono text-xs text-muted">
                    {formatDate(meeting.date)}
                  </p>
                  <h4 className="mt-1 text-lg font-semibold">
                    {meeting.title}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {meeting.summary}
                  </p>
                  {meeting.recapUrl && (
                    <a
                      href={meeting.recapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-sm text-accent transition-opacity hover:opacity-80"
                    >
                      Recap &rarr;
                    </a>
                  )}
                </TimelineItem>
              ))}
            </Timeline>
          </div>
        </div>
      </div>
    </section>
  );
}
