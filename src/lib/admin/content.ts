import "server-only";

import type { AdminEvent, AdminProject } from "@/lib/admin/types";
import type { createSupabaseServerClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export async function getAdminContent(supabase: SupabaseServerClient) {
  const [eventsResult, projectsResult] = await Promise.all([
    supabase
      .from("events")
      .select(
        "id, title, starts_at, ends_at, date_tbd, location, description, summary, rsvp_url, recap_url, status, created_at",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("projects")
      .select(
        "id, title, description, tags, status, github_url, demo_url, cover_image_path, visibility, sort_order, created_at",
      )
      .order("created_at", { ascending: false }),
  ]);

  const projectRows = (projectsResult.data ?? []) as AdminProject[];
  const projects = projectRows.map((project) => ({
    ...project,
    cover_image_url: project.cover_image_path
      ? supabase.storage
          .from("project-covers")
          .getPublicUrl(project.cover_image_path).data.publicUrl
      : null,
  }));

  return {
    events: (eventsResult.data ?? []) as AdminEvent[],
    projects,
    error: eventsResult.error?.message ?? projectsResult.error?.message ?? null,
  };
}
