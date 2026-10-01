import Image from "next/image";
import { FeaturedTrailer } from "@/components/sections/FeaturedTrailer";
import featured from "@/lib/data/featured-event.json";
import type { MeetingsData } from "@/lib/types";
import { formatLocation, formatMeetingWhen } from "@/lib/utils";

/** Trailer + flyer for the featured event, shown under the meetings timeline. */
export function FeaturedEvent({ meetings }: { meetings: MeetingsData }) {
  const event = meetings.upcoming.find((meeting) => meeting.id === featured.eventId);
  const { trailer, flyer } = featured;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
          <span className="mr-3 font-mono text-xs font-normal tracking-[0.25em] text-muted uppercase">Featured</span>
          {featured.title}
        </h3>
        {event && (
          <p className="font-mono text-xs tracking-wide text-muted">
            {formatMeetingWhen(event.date, event.endDate, true)} · {formatLocation(event.location)}
          </p>
        )}
      </div>

      {/* Column widths follow the media aspect ratios (16:9 and 3:4) so both share one height. */}
      <div className="mt-6 grid gap-4 md:grid-cols-[16fr_6.75fr]">
        <FeaturedTrailer src={trailer.src} poster={trailer.poster} label={trailer.label} />
        <a
          href={flyer.src}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-auto block w-full max-w-sm overflow-hidden rounded-2xl border transition-transform duration-300 hover:-translate-y-0.5 md:max-w-none"
        >
          <Image
            src={flyer.src}
            width={flyer.width}
            height={flyer.height}
            alt={flyer.alt}
            sizes="(min-width: 1152px) 330px, (min-width: 768px) 30vw, 384px"
            className="h-auto w-full"
          />
        </a>
      </div>
    </div>
  );
}
