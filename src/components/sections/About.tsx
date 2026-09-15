import { Reveal } from "@/components/ui/AnimatedSection";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import site from "@/lib/data/site.json";
import faq from "@/lib/data/faq.json";
import type { FaqItem } from "@/lib/types";

const operatingPrinciples = [
  {
    title: "Ship, then polish",
    body: "We start building from week one. Real projects teach faster than any lecture.",
  },
  {
    title: "Learn in public",
    body: "Demos, write-ups, and open repos. We share the messy middle, not just the wins.",
  },
  {
    title: "Pods, not hierarchy",
    body: "Small teams own projects end to end, the way a startup ships features.",
  },
  {
    title: "Everyone is welcome",
    body: "Beginner or researcher, every major. Curiosity is the only prerequisite.",
  },
];

export function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <Reveal>
        <SectionLabel index="01">About</SectionLabel>
      </Reveal>

      <div className="mt-8 grid gap-12 lg:mt-10 lg:grid-cols-2">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            We run like a startup, not a study group.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Our community brings together computer science students and students
            from across the university who are curious about AI and machine
            learning. Whether you&apos;re experienced or just getting started,
            there&apos;s a place for you here.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <dl className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
            {operatingPrinciples.map((principle) => (
              <div key={principle.title} className="bg-background-soft/60 p-6">
                <dt className="font-medium">{principle.title}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted">
                  {principle.body}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      <div className="mt-16 grid gap-8 sm:mt-20 lg:grid-cols-[1fr_1.4fr] lg:gap-12">
        <Reveal>
          <h3 className="text-2xl font-semibold tracking-tight">
            Frequently asked
          </h3>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            New here? Start with these, then come say hi on{" "}
            <a
              href={site.joinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline decoration-accent/70 underline-offset-4 transition-colors hover:text-accent"
            >
              Discord
            </a>
            .
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <FaqAccordion items={faq as FaqItem[]} />
        </Reveal>
      </div>
    </section>
  );
}
