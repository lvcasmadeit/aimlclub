import { ProjectCarousel } from "@/components/sections/ProjectCarousel";
import { Reveal } from "@/components/ui/AnimatedSection";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getProjectsContent } from "@/lib/content";

export async function Projects() {
  const projects = await getProjectsContent();

  return (
    <section id="projects" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <Reveal>
          <SectionLabel index="03">Projects</SectionLabel>
        </Reveal>

        <Reveal className="mt-10 sm:mt-12">
          <ProjectCarousel projects={projects} />
        </Reveal>
      </div>
    </section>
  );
}
