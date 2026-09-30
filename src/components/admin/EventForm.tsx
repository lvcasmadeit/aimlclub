"use client";

import { useActionState, useState } from "react";
import { saveEvent } from "@/app/admin/actions";
import {
  initialAdminActionState,
  type AdminActionState,
} from "@/lib/admin/action-state";
import type { AdminEvent } from "@/lib/admin/types";

function toLocalDateTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

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

export function EventForm({ event }: { event?: AdminEvent }) {
  const [state, formAction, pending] = useActionState(
    saveEvent,
    initialAdminActionState,
  );
  const [dateTbd, setDateTbd] = useState(event?.date_tbd ?? false);
  const [startInput, setStartInput] = useState(
    toLocalDateTime(event?.starts_at ?? null),
  );
  const [endInput, setEndInput] = useState(
    toLocalDateTime(event?.ends_at ?? null),
  );
  const [startsAt, setStartsAt] = useState(event?.starts_at ?? "");
  const [endsAt, setEndsAt] = useState(event?.ends_at ?? "");

  return (
    <form action={formAction} className="grid gap-5 sm:grid-cols-2">
      {event ? <input type="hidden" name="id" value={event.id} /> : null}
      <input type="hidden" name="startsAt" value={dateTbd ? "" : startsAt} />
      <input type="hidden" name="endsAt" value={dateTbd ? "" : endsAt} />

      <label className="grid gap-2 text-sm font-medium sm:col-span-2">
        Event title
        <input
          name="title"
          defaultValue={event?.title ?? ""}
          required
          maxLength={120}
          className="rounded-xl border border-border bg-background px-4 py-3 font-normal"
        />
      </label>

      <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          Start date and time <span className="font-normal text-muted">Your local time; shown in Eastern Time publicly</span>
          <input
            name="startsAtInput"
            type="datetime-local"
            value={startInput}
            required={!dateTbd}
            disabled={dateTbd}
            onChange={(inputEvent) => {
              const value = inputEvent.currentTarget.value;
              setStartInput(value);
              setStartsAt(value ? new Date(value).toISOString() : "");
            }}
            className="rounded-xl border border-border bg-background px-4 py-3 font-normal disabled:opacity-50"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          End date and time <span className="font-normal text-muted">Optional</span>
          <input
            name="endsAtInput"
            type="datetime-local"
            value={endInput}
            disabled={dateTbd}
            onChange={(inputEvent) => {
              const value = inputEvent.currentTarget.value;
              setEndInput(value);
              setEndsAt(value ? new Date(value).toISOString() : "");
            }}
            className="rounded-xl border border-border bg-background px-4 py-3 font-normal disabled:opacity-50"
          />
        </label>
      </div>

      <label className="flex items-center gap-3 text-sm text-muted sm:col-span-2">
        <input
          name="dateTbd"
          type="checkbox"
          checked={dateTbd}
          onChange={(inputEvent) => {
            const checked = inputEvent.currentTarget.checked;
            setDateTbd(checked);
            if (checked) {
              setStartInput("");
              setEndInput("");
              setStartsAt("");
              setEndsAt("");
            }
          }}
          className="size-4 accent-accent"
        />
        Date is still to be determined (TBD)
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Location
        <input
          name="location"
          defaultValue={event?.location ?? ""}
          required
          maxLength={160}
          placeholder="Room, building, or TBD"
          className="rounded-xl border border-border bg-background px-4 py-3 font-normal"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Visibility
        <select
          name="status"
          defaultValue={event?.status ?? "draft"}
          className="rounded-xl border border-border bg-background px-4 py-3 font-normal"
        >
          <option value="draft">Draft · admins only</option>
          <option value="published">Published · visible on site</option>
          <option value="archived">Archived · hidden from site</option>
        </select>
      </label>

      <label className="grid gap-2 text-sm font-medium sm:col-span-2">
        Event description
        <textarea
          name="description"
          defaultValue={event?.description ?? ""}
          required
          maxLength={2000}
          rows={4}
          className="resize-y rounded-xl border border-border bg-background px-4 py-3 font-normal"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium sm:col-span-2">
        Past-event summary <span className="font-normal text-muted">Optional; falls back to the description</span>
        <textarea
          name="summary"
          defaultValue={event?.summary ?? ""}
          maxLength={2000}
          rows={3}
          className="resize-y rounded-xl border border-border bg-background px-4 py-3 font-normal"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium">
        RSVP link <span className="font-normal text-muted">Optional</span>
        <input
          name="rsvpUrl"
          type="url"
          defaultValue={event?.rsvp_url ?? ""}
          placeholder="https://…"
          className="rounded-xl border border-border bg-background px-4 py-3 font-normal"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Recap link <span className="font-normal text-muted">Optional</span>
        <input
          name="recapUrl"
          type="url"
          defaultValue={event?.recap_url ?? ""}
          placeholder="https://…"
          className="rounded-xl border border-border bg-background px-4 py-3 font-normal"
        />
      </label>

      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {pending ? "Saving…" : event ? "Save event" : "Create event"}
        </button>
        <ActionMessage state={state} />
      </div>
    </form>
  );
}
