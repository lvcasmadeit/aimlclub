import { Reveal } from "@/components/ui/AnimatedSection";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Card } from "@/components/ui/Card";
import projects from "@/lib/data/projects.json";
import type { ProjectsNotice } from "@/lib/types";

const notice = projects as ProjectsNotice;

export function Projects() {
  return (
    <section id="projects" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-28">
        <Reveal>
          <SectionLabel index="03">Projects</SectionLabel>
        </Reveal>

        <Reveal className="mt-12">
          <Card className="mx-auto max-w-xl text-center">
            <h2 className="font-mono text-xl font-semibold uppercase tracking-[0.18em] sm:text-2xl">
              {notice.title}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
              {notice.subtitle}
            </p>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
