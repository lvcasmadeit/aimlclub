import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/AnimatedSection";
import { SectionLabel } from "@/components/ui/SectionLabel";
import site from "@/lib/data/site.json";

const channels = [
  { label: "Instagram", href: site.instagram },
  { label: "GitHub", href: site.github },
  { label: "LinkedIn", href: site.linkedin },
  { label: "CampusGroups", href: site.campusGroups },
];

export function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <Reveal>
        <div className="flex justify-center">
          <SectionLabel index="05">Get in touch</SectionLabel>
        </div>
      </Reveal>

      <div className="mx-auto mt-8 max-w-3xl text-center lg:mt-10">
        <Reveal>
          <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
            Come build the future with us.
          </h2>
          <p className="mx-auto mt-6 max-w-md text-center text-base leading-relaxed text-muted sm:text-lg">
            No experience required, just curiosity. Join the conversation on
            Discord, or browse the official club directory on CampusGroups.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink
              href={site.discord}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Discord
            </ButtonLink>
            {channels.map((channel) => (
              <ButtonLink
                key={channel.label}
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                variant="ghost"
              >
                {channel.label}
              </ButtonLink>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
