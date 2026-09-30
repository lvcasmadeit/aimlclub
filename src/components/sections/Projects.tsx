import Image from "next/image";
import { Reveal } from "@/components/ui/AnimatedSection";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ButtonLink } from "@/components/ui/Button";
import site from "@/lib/data/site.json";
import { getProjectsContent } from "@/lib/content";

export async function Projects() {
  const { notice, projects } = await getProjectsContent();

  return (
    <section id="projects" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <Reveal>
          <SectionLabel index="03">Projects</SectionLabel>
        </Reveal>

        <Reveal className="mt-10 sm:mt-12">
          {projects.length === 0 ? (
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
          ) : (
            <>
              <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                {notice.subtitle}
              </p>
              <div className="grid gap-5 md:grid-cols-2">
                {projects.map((project) => (
                  <article
                    key={project.id}
                    className="overflow-hidden rounded-2xl border border-border bg-background-soft/40"
                  >
                    {project.coverImageUrl ? (
                      <div className="relative aspect-video overflow-hidden border-b border-border bg-background-soft">
                        <Image
                          src={project.coverImageUrl}
                          alt={`${project.title} project preview`}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                    <div className="p-6 sm:p-7">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted">
                          {project.status}
                        </p>
                        {project.tags.length > 0 ? (
                          <ul
                            aria-label={`${project.title} technologies`}
                            className="flex flex-wrap gap-2"
                          >
                            {project.tags.map((tag) => (
                              <li
                                key={tag}
                                className="rounded-full border border-border px-2.5 py-1 font-mono text-[0.65rem] text-muted"
                              >
                                {tag}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                      <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                        {project.title}
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-muted">
                        {project.description}
                      </p>
                      {project.githubUrl || project.demoUrl ? (
                        <div className="mt-5 flex flex-wrap gap-4 text-sm font-medium">
                          {project.demoUrl ? (
                            <a
                              href={project.demoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-muted"
                            >
                              Live demo <span aria-hidden="true">↗</span>
                            </a>
                          ) : null}
                          {project.githubUrl ? (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-muted"
                            >
                              Source code <span aria-hidden="true">↗</span>
                            </a>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </Reveal>
      </div>
    </section>
  );
}
