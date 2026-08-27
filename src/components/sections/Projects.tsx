import { Reveal, Stagger, RevealItem } from "@/components/ui/AnimatedSection";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Card } from "@/components/ui/Card";
import projects from "@/lib/data/projects.json";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusStyles: Record<Project["status"], string> = {
  active: "text-accent border-accent/40",
  shipped: "text-violet border-violet/40",
  exploring: "text-muted border-border",
};

export function Projects() {
  return (
    <section id="projects" className="border-y border-border">
      <div className="mx-auto max-w-6xl px-6 py-28">
        <Reveal>
          <SectionLabel index="02">Projects</SectionLabel>
        </Reveal>
        <Reveal>
          <h2 className="mt-6 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            What we are building right now.
          </h2>
        </Reveal>

        <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(projects as Project[]).map((project) => (
            <RevealItem key={project.id} className="h-full">
              <Card className="flex h-full flex-col">
                <span
                  className={cn(
                    "w-fit rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em]",
                    statusStyles[project.status],
                  )}
                >
                  {project.status}
                </span>

                <h3 className="mt-5 text-xl font-semibold">{project.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                  {project.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-tag px-2 py-1 font-mono text-[11px] text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {(project.githubUrl || project.demoUrl) && (
                  <div className="mt-6 flex gap-4 border-t border-border pt-4 text-sm">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted transition-colors hover:text-accent"
                      >
                        GitHub &rarr;
                      </a>
                    )}
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted transition-colors hover:text-accent"
                      >
                        Demo &rarr;
                      </a>
                    )}
                  </div>
                )}
              </Card>
            </RevealItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
