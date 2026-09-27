import { Reveal } from "@/components/ui/AnimatedSection";
import { AboutTabs } from "@/components/sections/AboutTabs";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { SectionLabel } from "@/components/ui/SectionLabel";
import about from "@/lib/data/about.json";
import site from "@/lib/data/site.json";
import faq from "@/lib/data/faq.json";
import type { AboutTab, FaqItem } from "@/lib/types";

export function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <Reveal>
        <SectionLabel index="01">About</SectionLabel>
      </Reveal>

      <AboutTabs tabs={about.tabs as AboutTab[]} />

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
