import { Reveal } from "@/components/ui/AnimatedSection";
import { AboutCards } from "@/components/sections/AboutCards";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { SectionLabel } from "@/components/ui/SectionLabel";
import about from "@/lib/data/about.json";
import site from "@/lib/data/site.json";
import faq from "@/lib/data/faq.json";
import type { AboutCard, FaqItem } from "@/lib/types";

export function About() {
  return (
    <section id="about" className="py-20 sm:py-28">
      <Reveal className="mx-auto max-w-6xl px-6">
        <SectionLabel index="01">About</SectionLabel>
      </Reveal>

      {/* Cards break out of the 6xl column to use more of the viewport. */}
      <Reveal className="mx-auto mt-10 max-w-[96rem] px-6 sm:mt-12 lg:px-10">
        <AboutCards cards={about.cards as AboutCard[]} />
      </Reveal>

      <div className="mx-auto mt-24 grid max-w-6xl gap-8 px-6 sm:mt-28 lg:grid-cols-[1fr_1.4fr] lg:gap-12">
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
