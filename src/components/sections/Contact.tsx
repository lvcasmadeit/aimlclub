import { Reveal } from "@/components/ui/AnimatedSection";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ContactForm } from "@/components/sections/ContactForm";
import site from "@/lib/data/site.json";

const channels = [
  { label: "Discord", value: "Join the conversation", href: site.discord },
  { label: "Instagram", value: "@umlaiml", href: site.instagram },
  { label: "GitHub", value: "Our open repos", href: site.github },
  { label: "LinkedIn", value: "Follow the club", href: site.linkedin },
  {
    label: "Campus Groups",
    value: "Make it official",
    href: site.campusGroups,
  },
  { label: "Email", value: site.email, href: `mailto:${site.email}` },
];

export function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <Reveal>
        <SectionLabel index="05">Get in touch</SectionLabel>
      </Reveal>

      <div className="mt-8 grid gap-12 lg:mt-10 lg:grid-cols-2">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Come build the future with us.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted sm:text-lg">
            No experience required, just curiosity. Drop us a message or find us
            on any of these channels.
          </p>

          <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
            {channels.map((channel) => {
              const external = !channel.href.startsWith("mailto:");
              return (
                <a
                  key={channel.label}
                  href={channel.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="group bg-background-soft/60 p-5 transition-colors hover:bg-hover"
                >
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                    {channel.label}
                  </p>
                  <p className="mt-2 text-sm text-muted transition-colors group-hover:text-foreground">
                    {channel.value} &rarr;
                  </p>
                </a>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
