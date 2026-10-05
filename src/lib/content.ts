import "server-only";

import { cache } from "react";
import meetingFallback from "@/lib/data/meetings.json";
import projectFallback from "@/lib/data/projects.json";
import type {
  MeetingsData,
  PastMeeting,
  Project,
  UpcomingMeeting,
} from "@/lib/types";
import { createSupabasePublicClient } from "@/lib/supabase/public";

type EventRow = {
  id: string;
  title: string;
  starts_at: string | null;
  ends_at: string | null;
  date_tbd: boolean;
  location: string;
  description: string;
  summary: string | null;
  rsvp_url: string | null;
  recap_url: string | null;
};

type ProjectRow = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: Project["status"];
  github_url: string | null;
  demo_url: string | null;
  cover_image_path: string | null;
};

export const getMeetingsContent = cache(async function getMeetingsContent(): Promise<MeetingsData> {
  const supabase = createSupabasePublicClient();
  if (!supabase) return meetingFallback as MeetingsData;

  const { data, error } = await supabase
    .from("events")
    .select(
      "id, title, starts_at, ends_at, date_tbd, location, description, summary, rsvp_url, recap_url",
    )
    .eq("status", "published");

  if (error || !data) {
    console.error("Unable to load published events from Supabase.", error?.message);
    return meetingFallback as MeetingsData;
  }

  const now = Date.now();
  const upcoming: UpcomingMeeting[] = [];
  const past: PastMeeting[] = [];

  for (const row of data as EventRow[]) {
    const date = row.date_tbd || !row.starts_at ? "TBD" : row.starts_at;
    const isUpcoming =
      date === "TBD" || new Date(date).getTime() >= now;

    if (isUpcoming) {
      upcoming.push({
        id: row.id,
        title: row.title,
        date,
        ...(row.ends_at ? { endDate: row.ends_at } : {}),
        location: row.location,
        description: row.description,
        ...(row.rsvp_url ? { rsvpUrl: row.rsvp_url } : {}),
      });
    } else {
      past.push({
        id: row.id,
        title: row.title,
        date,
        summary: row.summary?.trim() || row.description,
        ...(row.recap_url ? { recapUrl: row.recap_url } : {}),
      });
    }
  }

  return { upcoming, past };
});

export const getProjectsContent = cache(async function getProjectsContent(): Promise<Project[]> {
  const fallback = projectFallback as Project[];
  const supabase = createSupabasePublicClient();
  if (!supabase) return fallback;

  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, title, description, tags, status, github_url, demo_url, cover_image_path",
    )
    .eq("visibility", "published")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Unable to load published projects from Supabase.", error?.message);
    return fallback;
  }

  const projects = (data as ProjectRow[]).map((row) => {
    const coverImageUrl = row.cover_image_path
      ? supabase.storage
          .from("project-covers")
          .getPublicUrl(row.cover_image_path).data.publicUrl
      : undefined;

    return {
      id: row.id,
      title: row.title,
      description: row.description,
      tags: row.tags,
      status: row.status,
      ...(row.github_url ? { githubUrl: row.github_url } : {}),
      ...(row.demo_url ? { demoUrl: row.demo_url } : {}),
      ...(coverImageUrl ? { coverImageUrl } : {}),
    };
  });

  return projects;
});
