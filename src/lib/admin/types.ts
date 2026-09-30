import type { Project } from "@/lib/types";

export type ContentStatus = "draft" | "published" | "archived";

export interface AdminEvent {
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
  status: ContentStatus;
  created_at: string;
}

export interface AdminProject {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: Project["status"];
  github_url: string | null;
  demo_url: string | null;
  cover_image_path: string | null;
  cover_image_url: string | null;
  visibility: ContentStatus;
  sort_order: number;
  created_at: string;
}
