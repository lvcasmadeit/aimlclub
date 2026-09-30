"use client";

import Image from "next/image";
import { useActionState, useState, type ChangeEvent } from "react";
import { saveProject } from "@/app/admin/actions";
import {
  initialAdminActionState,
  type AdminActionState,
} from "@/lib/admin/action-state";
import type { AdminProject } from "@/lib/admin/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const imageExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function ActionMessage({ state }: { state: AdminActionState }) {
  if (!state.message) return null;
  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      aria-live="polite"
      className="text-sm text-muted"
    >
      {state.message}
    </p>
  );
}

export function ProjectForm({ project }: { project?: AdminProject }) {
  const [state, formAction, pending] = useActionState(
    saveProject,
    initialAdminActionState,
  );
  const [coverPath, setCoverPath] = useState(project?.cover_image_path ?? "");
  const [coverUrl, setCoverUrl] = useState(project?.cover_image_url ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  async function uploadCover(file: File) {
    const extension = imageExtensions[file.type];
    if (!extension) {
      setUploadMessage("Choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadMessage("The image must be 5 MB or smaller.");
      return;
    }

    setIsUploading(true);
    setUploadMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError || !data.user) {
        setUploadMessage("Your session expired. Sign in again before uploading.");
        return;
      }

      const path = `${data.user.id}/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage
        .from("project-covers")
        .upload(path, file, {
          cacheControl: "31536000",
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        setUploadMessage("Upload failed. Check the file and try again.");
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("project-covers")
        .getPublicUrl(path);
      setCoverPath(path);
      setCoverUrl(publicUrl.publicUrl);
      setUploadMessage("Cover uploaded. Save the project to publish the change.");
    } catch {
      setUploadMessage("Supabase is unavailable. Check the dashboard setup and try again.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (file) void uploadCover(file);
  }

  return (
    <form action={formAction} className="grid gap-5 sm:grid-cols-2">
      {project ? <input type="hidden" name="id" value={project.id} /> : null}
      <input type="hidden" name="coverImagePath" value={coverPath} />

      <label className="grid gap-2 text-sm font-medium sm:col-span-2">
        Project title
        <input
          name="title"
          defaultValue={project?.title ?? ""}
          required
          maxLength={120}
          className="rounded-xl border border-border bg-background px-4 py-3 font-normal"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium sm:col-span-2">
        Description
        <textarea
          name="description"
          defaultValue={project?.description ?? ""}
          required
          maxLength={2000}
          rows={4}
          className="resize-y rounded-xl border border-border bg-background px-4 py-3 font-normal"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Tags <span className="font-normal text-muted">Comma separated, up to 8</span>
        <input
          name="tags"
          defaultValue={project?.tags.join(", ") ?? ""}
          placeholder="Python, NLP, React"
          className="rounded-xl border border-border bg-background px-4 py-3 font-normal"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Project status
        <select
          name="status"
          defaultValue={project?.status ?? "exploring"}
          className="rounded-xl border border-border bg-background px-4 py-3 font-normal"
        >
          <option value="exploring">Exploring</option>
          <option value="active">Active</option>
          <option value="shipped">Shipped</option>
        </select>
      </label>

      <label className="grid gap-2 text-sm font-medium">
        GitHub URL <span className="font-normal text-muted">Optional</span>
        <input
          name="githubUrl"
          type="url"
          defaultValue={project?.github_url ?? ""}
          placeholder="https://github.com/…"
          className="rounded-xl border border-border bg-background px-4 py-3 font-normal"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Demo URL <span className="font-normal text-muted">Optional</span>
        <input
          name="demoUrl"
          type="url"
          defaultValue={project?.demo_url ?? ""}
          placeholder="https://…"
          className="rounded-xl border border-border bg-background px-4 py-3 font-normal"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Visibility
        <select
          name="visibility"
          defaultValue={project?.visibility ?? "draft"}
          className="rounded-xl border border-border bg-background px-4 py-3 font-normal"
        >
          <option value="draft">Draft · admins only</option>
          <option value="published">Published · visible on site</option>
          <option value="archived">Archived · hidden from site</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Display order <span className="font-normal text-muted">Lower appears first</span>
        <input
          name="sortOrder"
          type="number"
          min={-10000}
          max={10000}
          defaultValue={project?.sort_order ?? 0}
          className="rounded-xl border border-border bg-background px-4 py-3 font-normal"
        />
      </label>

      <div className="grid gap-3 sm:col-span-2">
        <span className="text-sm font-medium">Cover image</span>
        {coverUrl ? (
          <div className="relative aspect-video max-w-lg overflow-hidden rounded-xl border border-border bg-background-soft">
            <Image
              src={coverUrl}
              alt="Project cover preview"
              fill
              sizes="(max-width: 640px) 100vw, 512px"
              unoptimized
              className="object-cover"
            />
          </div>
        ) : (
          <p className="text-sm text-muted">Optional · JPEG, PNG, or WebP · max 5 MB</p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-hover">
            {isUploading ? "Uploading…" : coverUrl ? "Replace image" : "Upload image"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={isUploading || pending}
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>
          {coverUrl ? (
            <button
              type="button"
              disabled={isUploading || pending}
              onClick={() => {
                setCoverPath("");
                setCoverUrl("");
                setUploadMessage("Cover removed. Save the project to keep this change.");
              }}
              className="text-sm text-muted underline underline-offset-4 hover:text-foreground disabled:opacity-50"
            >
              Remove image
            </button>
          ) : null}
          {uploadMessage ? (
            <span role="status" aria-live="polite" className="text-sm text-muted">
              {uploadMessage}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button
          type="submit"
          disabled={pending || isUploading}
          className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {pending ? "Saving…" : project ? "Save project" : "Create project"}
        </button>
        <ActionMessage state={state} />
      </div>
    </form>
  );
}
