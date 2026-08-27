import { Reveal } from "@/components/ui/AnimatedSection";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ContactForm } from "@/components/sections/ContactForm";
import site from "@/lib/data/site.json";

const channels = [
  { label: "Discord", value: "Join the conversation", href: site.discord },
  { label: "Instagram", value: "@umlaiml", href: site.instagram },
  { label: "GitHub", value: "Our open repos", href: site.github },
  {
    label: "CampusGroups",
    value: "Make it official",
    href: site.campusGroups,
  },
];

export function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-28">
      <Reveal>
        <SectionLabel index="05">Get in touch</SectionLabel>
      </Reveal>

      <div className="mt-10 grid gap-12 lg:grid-cols-2">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Come build the future with us.
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
            No experience required, just curiosity. Drop us a message or find us
            on any of these channels.
          </p>

          <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
            {channels.map((channel) => (
              <a
                key={channel.label}
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-background-soft/60 p-5 transition-colors hover:bg-hover"
              >
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                  {channel.label}
                </p>
                <p className="mt-2 text-sm text-muted transition-colors group-hover:text-foreground">
                  {channel.value} &rarr;
                </p>
              </a>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
