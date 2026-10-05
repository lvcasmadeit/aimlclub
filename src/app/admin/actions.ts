"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { AdminActionState } from "@/lib/admin/action-state";
import { getAdminAccess } from "@/lib/admin/access";
import { canWriteAdminContent } from "@/lib/admin/write-access";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const urlField = z.string().refine((value) => !value || isHttpUrl(value), {
  error: "Enter a valid http or https URL.",
});
const optionalTimestamp = z.string().refine(
  (value) => !value || !Number.isNaN(new Date(value).getTime()),
  { error: "Enter a valid date and time." },
);

const eventSchema = z
  .object({
    id: z.string().uuid().optional(),
    title: z.string().trim().min(1, { error: "Add an event title." }).max(120),
    dateTbd: z.boolean(),
    startsAt: optionalTimestamp,
    endsAt: optionalTimestamp,
    location: z
      .string()
      .trim()
      .min(1, { error: "Add an event location (or enter TBD)." })
      .max(160),
    description: z
      .string()
      .trim()
      .min(1, { error: "Add an event description." })
      .max(2000),
    summary: z.string().trim().max(2000),
    rsvpUrl: urlField,
    recapUrl: urlField,
    status: z.enum(["draft", "published", "archived"]),
  })
  .superRefine((event, context) => {
    if (!event.dateTbd && !event.startsAt) {
      context.addIssue({
        code: "custom",
        path: ["startsAt"],
        message: "Choose a date/time or mark the event as TBD.",
      });
    }
    if (event.dateTbd && (event.startsAt || event.endsAt)) {
      context.addIssue({
        code: "custom",
        path: ["dateTbd"],
        message: "Clear the dates before marking the event as TBD.",
      });
    }
    if (
      event.startsAt &&
      event.endsAt &&
      new Date(event.endsAt).getTime() <= new Date(event.startsAt).getTime()
    ) {
      context.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "The end time must be after the start time.",
      });
    }
  });

const projectSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1, { error: "Add a project title." }).max(120),
  description: z
    .string()
    .trim()
    .min(1, { error: "Add a project description." })
    .max(2000),
  tags: z.array(z.string().min(1).max(32)).max(8, {
    error: "Use no more than eight tags (32 characters each).",
  }),
  status: z.enum(["active", "shipped", "exploring"]),
  githubUrl: urlField,
  demoUrl: urlField,
  coverImagePath: z
    .string()
    .refine(
      (value) =>
        !value ||
        /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(?:jpg|jpeg|png|webp)$/i.test(value),
      { error: "Upload a valid project cover image." },
    ),
  visibility: z.enum(["draft", "published", "archived"]),
  sortOrder: z.number().int().min(-10000).max(10000),
});

function denied(message = "Your session is no longer authorized. Sign in again."): AdminActionState {
  return { status: "error", message };
}

function readOnly(): AdminActionState {
  return {
    status: "error",
    message: "Content changes are disabled outside the Production deployment.",
  };
}

function contentId(formData: FormData) {
  const result = z.string().uuid().safeParse(field(formData, "id"));
  return result.success ? result.data : null;
}

export async function saveEvent(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!canWriteAdminContent()) return readOnly();

  const access = await getAdminAccess();
  if (access.status !== "admin") return denied();

  const id = field(formData, "id");
  const checked = eventSchema.safeParse({
    id: id || undefined,
    title: field(formData, "title"),
    dateTbd: formData.get("dateTbd") === "on",
    startsAt: field(formData, "startsAt"),
    endsAt: field(formData, "endsAt"),
    location: field(formData, "location"),
    description: field(formData, "description"),
    summary: field(formData, "summary"),
    rsvpUrl: field(formData, "rsvpUrl"),
    recapUrl: field(formData, "recapUrl"),
    status: field(formData, "status"),
  });

  if (!checked.success) {
    return { status: "error", message: checked.error.issues[0]?.message ?? "Check the event fields." };
  }

  const event = checked.data;
  const payload = {
    title: event.title,
    starts_at: event.dateTbd ? null : new Date(event.startsAt).toISOString(),
    ends_at: event.dateTbd || !event.endsAt ? null : new Date(event.endsAt).toISOString(),
    date_tbd: event.dateTbd,
    location: event.location,
    description: event.description,
    summary: event.summary || null,
    rsvp_url: event.rsvpUrl || null,
    recap_url: event.recapUrl || null,
    status: event.status,
    updated_at: new Date().toISOString(),
  };

  const result = event.id
    ? await access.supabase
        .from("events")
        .update(payload)
        .eq("id", event.id)
        .select("id")
        .maybeSingle()
    : await access.supabase
        .from("events")
        .insert({ ...payload, created_by: access.userId })
        .select("id")
        .single();

  if (result.error || !result.data) {
    console.error("Unable to save event.", result.error?.message);
    return { status: "error", message: "The event could not be saved. Please try again." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { status: "success", message: "Event saved." };
}

export async function saveProject(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!canWriteAdminContent()) return readOnly();

  const access = await getAdminAccess();
  if (access.status !== "admin") return denied();

  const id = field(formData, "id");
  const tags = field(formData, "tags")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const checked = projectSchema.safeParse({
    id: id || undefined,
    title: field(formData, "title"),
    description: field(formData, "description"),
    tags,
    status: field(formData, "status"),
    githubUrl: field(formData, "githubUrl"),
    demoUrl: field(formData, "demoUrl"),
    coverImagePath: field(formData, "coverImagePath"),
    visibility: field(formData, "visibility"),
    sortOrder: Number(field(formData, "sortOrder") || "0"),
  });

  if (!checked.success) {
    return { status: "error", message: checked.error.issues[0]?.message ?? "Check the project fields." };
  }

  const project = checked.data;
  let previousCoverPath: string | null = null;

  if (project.id) {
    const { data } = await access.supabase
      .from("projects")
      .select("cover_image_path")
      .eq("id", project.id)
      .maybeSingle();
    previousCoverPath = data?.cover_image_path ?? null;
  }

  const payload = {
    title: project.title,
    description: project.description,
    tags: project.tags,
    status: project.status,
    github_url: project.githubUrl || null,
    demo_url: project.demoUrl || null,
    cover_image_path: project.coverImagePath || null,
    visibility: project.visibility,
    sort_order: project.sortOrder,
    updated_at: new Date().toISOString(),
  };

  const result = project.id
    ? await access.supabase
        .from("projects")
        .update(payload)
        .eq("id", project.id)
        .select("id")
        .maybeSingle()
    : await access.supabase
        .from("projects")
        .insert({ ...payload, created_by: access.userId })
        .select("id")
        .single();

  if (result.error || !result.data) {
    console.error("Unable to save project.", result.error?.message);
    return { status: "error", message: "The project could not be saved. Please try again." };
  }

  if (
    previousCoverPath &&
    previousCoverPath !== (project.coverImagePath || null)
  ) {
    const { count, error } = await access.supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("cover_image_path", previousCoverPath);

    if (!error && count === 0) {
      await access.supabase.storage
        .from("project-covers")
        .remove([previousCoverPath]);
    }
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { status: "success", message: "Project saved." };
}

export async function deleteEvent(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!canWriteAdminContent()) return readOnly();

  const access = await getAdminAccess();
  if (access.status !== "admin") return denied();

  const id = contentId(formData);
  if (!id) return { status: "error", message: "This event could not be identified." };

  const { data, error } = await access.supabase
    .from("events")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("Unable to delete event.", error?.message);
    return { status: "error", message: "The event could not be deleted. Please try again." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { status: "success", message: "Event deleted." };
}

export async function deleteProject(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!canWriteAdminContent()) return readOnly();

  const access = await getAdminAccess();
  if (access.status !== "admin") return denied();

  const id = contentId(formData);
  if (!id) return { status: "error", message: "This project could not be identified." };

  const { data: project, error: lookupError } = await access.supabase
    .from("projects")
    .select("cover_image_path")
    .eq("id", id)
    .maybeSingle();

  if (lookupError || !project) {
    console.error("Unable to look up project before deletion.", lookupError?.message);
    return { status: "error", message: "The project could not be found. Refresh and try again." };
  }

  const { data, error } = await access.supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("Unable to delete project.", error?.message);
    return { status: "error", message: "The project could not be deleted. Please try again." };
  }

  if (project.cover_image_path) {
    const { count, error: countError } = await access.supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("cover_image_path", project.cover_image_path);

    if (!countError && count === 0) {
      const { error: storageError } = await access.supabase.storage
        .from("project-covers")
        .remove([project.cover_image_path]);
      if (storageError) {
        console.error("Unable to remove deleted project's cover image.", storageError.message);
      }
    }
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { status: "success", message: "Project deleted." };
}

export async function signOutAdmin() {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
