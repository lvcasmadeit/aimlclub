import Link from "next/link";
import { DeleteContentForm } from "@/components/admin/DeleteContentForm";
import { EventForm } from "@/components/admin/EventForm";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { signOutAdmin } from "@/app/admin/actions";
import type { AdminEvent, AdminProject } from "@/lib/admin/types";
import { formatMeetingWhen } from "@/lib/utils";

function eventDate(event: AdminEvent) {
  if (event.date_tbd || !event.starts_at) return "Date TBA";
  return formatMeetingWhen(event.starts_at, event.ends_at ?? undefined);
}

function Status({ children }: { children: string }) {
  return (
    <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted">
      {children}
    </span>
  );
}

export function AdminDashboard({
  email,
  events,
  projects,
  hasLoadError,
  writeMode,
}: {
  email: string;
  events: AdminEvent[];
  projects: AdminProject[];
  hasLoadError: boolean;
  writeMode: "production" | "local" | "read-only";
}) {
  const canWriteContent = writeMode !== "read-only";
  const publishedEvents = events.filter((event) => event.status === "published").length;
  const publishedProjects = projects.filter(
    (project) => project.visibility === "published",
  ).length;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10 sm:py-14">
      <header className="flex flex-wrap items-center justify-between gap-5 border-b border-border pb-7">
        <div>
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-[0.16em] text-muted transition-colors hover:text-foreground"
          >
            AI &amp; ML Club · Admin
          </Link>
          <p className="mt-2 text-sm text-muted">Signed in as {email}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/#meetings"
            className="rounded-xl border border-border px-4 py-2.5 text-sm transition-colors hover:bg-hover"
          >
            View site
          </Link>
          <Link
            href="/auth/update-password"
            className="rounded-xl border border-border px-4 py-2.5 text-sm transition-colors hover:bg-hover"
          >
            Set/change password
          </Link>
          <form action={signOutAdmin}>
            <button
              type="submit"
              className="rounded-xl border border-border px-4 py-2.5 text-sm transition-colors hover:bg-hover"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="py-10 sm:py-14">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
          Content management
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
          Keep the club timeline moving.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          {canWriteContent
            ? "Draft updates, publish them to the public site, or archive entries that should no longer appear."
            : "Review Production events and projects. Editing is available only from the Production deployment."}
        </p>
      </div>

      {writeMode === "local" ? (
        <p
          role="alert"
          className="rounded-2xl border border-border bg-background-soft/30 px-5 py-4 text-sm text-muted"
        >
          Local write mode · this dashboard is connected to Production Supabase. Saves, publishes, deletes, and cover uploads affect live data.
        </p>
      ) : !canWriteContent ? (
        <p
          role="status"
          className="rounded-2xl border border-border bg-background-soft/30 px-5 py-4 text-sm text-muted"
        >
          Read-only mode · this deployment is connected to Production content.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-background-soft/40 p-5">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
            Events
          </p>
          <p className="mt-2 text-3xl font-semibold">{publishedEvents}</p>
          <p className="mt-1 text-sm text-muted">published · {events.length} total</p>
        </div>
        <div className="rounded-2xl border border-border bg-background-soft/40 p-5">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
            Projects
          </p>
          <p className="mt-2 text-3xl font-semibold">{publishedProjects}</p>
          <p className="mt-1 text-sm text-muted">published · {projects.length} total</p>
        </div>
      </div>

      {hasLoadError ? (
        <p
          role="alert"
          className="mt-6 rounded-2xl border border-border px-5 py-4 text-sm text-muted"
        >
          Some content could not be loaded. Check the Supabase migration and try refreshing.
        </p>
      ) : null}

      <nav aria-label="Admin sections" className="mt-8 flex gap-5 text-sm">
        <a href="#admin-events" className="underline decoration-border underline-offset-4">
          Events
        </a>
        <a href="#admin-projects" className="underline decoration-border underline-offset-4">
          Projects
        </a>
      </nav>

      <section id="admin-events" className="scroll-mt-8 py-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
              Timeline
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Events</h2>
          </div>
          <p className="text-sm text-muted">Dated events move to the past timeline automatically.</p>
        </div>

        {canWriteContent ? (
          <details open className="rounded-2xl border border-border bg-background-soft/30 p-5 sm:p-7">
            <summary className="cursor-pointer text-base font-semibold">
              Add an event
            </summary>
            <div className="mt-6 border-t border-border pt-6">
              <EventForm />
            </div>
          </details>
        ) : null}

        <div className="mt-4 space-y-3">
          {events.map((event) => (
            <details
              key={event.id}
              className="rounded-2xl border border-border bg-background-soft/20 p-5"
            >
              <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
                <span>
                  <span className="block font-medium">{event.title}</span>
                  <span className="mt-1 block text-sm text-muted">
                    {eventDate(event)} · {event.location}
                  </span>
                </span>
                <Status>{event.status}</Status>
              </summary>
              <div className="mt-6 border-t border-border pt-6">
                {canWriteContent ? (
                  <>
                    <EventForm event={event} />
                    <DeleteContentForm id={event.id} kind="event" />
                  </>
                ) : (
                  <div className="space-y-4 text-sm leading-relaxed text-muted">
                    <p>{event.description}</p>
                    {event.summary ? <p>{event.summary}</p> : null}
                    <div className="flex flex-wrap gap-4">
                      {event.rsvp_url ? (
                        <a
                          href={event.rsvp_url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-4"
                        >
                          RSVP link
                        </a>
                      ) : null}
                      {event.recap_url ? (
                        <a
                          href={event.recap_url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-4"
                        >
                          Recap link
                        </a>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            </details>
          ))}
          {events.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-5 py-8 text-sm text-muted">
              No events yet. Add one above to start filling the timeline.
            </p>
          ) : null}
        </div>
      </section>

      <section id="admin-projects" className="scroll-mt-8 border-t border-border py-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
              Showcase
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Projects</h2>
          </div>
          <p className="text-sm text-muted">
            {canWriteContent
              ? "Upload a cover and add useful links and tags."
              : "Review project descriptions, links, tags, and visibility."}
          </p>
        </div>

        {canWriteContent ? (
          <details open className="rounded-2xl border border-border bg-background-soft/30 p-5 sm:p-7">
            <summary className="cursor-pointer text-base font-semibold">
              Add a project
            </summary>
            <div className="mt-6 border-t border-border pt-6">
              <ProjectForm />
            </div>
          </details>
        ) : null}

        <div className="mt-4 space-y-3">
          {projects.map((project) => (
            <details
              key={project.id}
              className="rounded-2xl border border-border bg-background-soft/20 p-5"
            >
              <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
                <span>
                  <span className="block font-medium">{project.title}</span>
                  <span className="mt-1 block text-sm text-muted">
                    {project.status} · order {project.sort_order}
                  </span>
                </span>
                <Status>{project.visibility}</Status>
              </summary>
              <div className="mt-6 border-t border-border pt-6">
                {canWriteContent ? (
                  <>
                    <ProjectForm project={project} />
                    <DeleteContentForm id={project.id} kind="project" />
                  </>
                ) : (
                  <div className="space-y-4 text-sm leading-relaxed text-muted">
                    <p>{project.description}</p>
                    <p>{project.tags.length ? project.tags.join(" · ") : "No tags"}</p>
                    <div className="flex flex-wrap gap-4">
                      {project.github_url ? (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-4"
                        >
                          GitHub
                        </a>
                      ) : null}
                      {project.demo_url ? (
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-4"
                        >
                          Demo
                        </a>
                      ) : null}
                      {project.cover_image_url ? (
                        <a
                          href={project.cover_image_url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-4"
                        >
                          Cover image
                        </a>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            </details>
          ))}
          {projects.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-5 py-8 text-sm text-muted">
              No projects yet. Add one above to populate the public Projects section.
            </p>
          ) : null}
        </div>
      </section>

      <footer className="border-t border-border py-6 text-xs text-muted">
        {canWriteContent
          ? "Changes to published entries appear on the public site after saving."
          : "This deployment is read-only; manage content from the Production deployment."}
      </footer>
    </main>
  );
}
