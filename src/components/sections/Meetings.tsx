import { Reveal } from "@/components/ui/AnimatedSection";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { FeaturedEvent } from "@/components/sections/FeaturedEvent";
import { MeetingTimeline } from "@/components/sections/MeetingTimeline";
import { getMeetingsContent } from "@/lib/content";
import { buildTimeline } from "@/lib/meetings";

export async function Meetings() {
  const meetings = await getMeetingsContent();
  const { entries, focusId } = buildTimeline(meetings);

  return (
    <section id="meetings" className="border-y border-border">
      <div className="mx-auto max-w-6xl px-6 pt-20 sm:pt-28">
        <Reveal>
          <SectionLabel index="02">Meetings</SectionLabel>
        </Reveal>
        <Reveal>
          <h2 className="mt-6 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Where we have been, where we are headed.
          </h2>
        </Reveal>
      </div>
      <div className="pb-20 sm:pb-28">
        <MeetingTimeline entries={entries} focusId={focusId} />
        <Reveal className="mx-auto mt-16 max-w-6xl px-6 sm:mt-20">
          <FeaturedEvent meetings={meetings} />
        </Reveal>
      </div>
    </section>
  );
}
