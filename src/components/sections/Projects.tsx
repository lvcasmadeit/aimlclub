import { Reveal } from "@/components/ui/AnimatedSection";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ButtonLink } from "@/components/ui/Button";
import projects from "@/lib/data/projects.json";
import site from "@/lib/data/site.json";
import type { ProjectsNotice } from "@/lib/types";

const notice = projects as ProjectsNotice;

export function Projects() {
  return (
    <section id="projects" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <Reveal>
          <SectionLabel index="03">Projects</SectionLabel>
        </Reveal>

        <Reveal className="mt-10 sm:mt-12">
          <div className="mx-auto max-w-xl rounded-2xl border border-border bg-background-soft/60 px-6 py-10 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              {notice.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              {notice.subtitle}
            </p>
            <ButtonLink
              href={site.joinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6"
            >
              Join Discord
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
