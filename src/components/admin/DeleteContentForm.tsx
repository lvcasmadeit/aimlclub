"use client";

import { useActionState, type FormEvent } from "react";
import {
  deleteEvent,
  deleteProject,
} from "@/app/admin/actions";
import {
  initialAdminActionState,
  type AdminActionState,
} from "@/lib/admin/action-state";

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

export function DeleteContentForm({
  id,
  kind,
}: {
  id: string;
  kind: "event" | "project";
}) {
  const deleteAction = kind === "event" ? deleteEvent : deleteProject;
  const [state, formAction, pending] = useActionState(
    deleteAction,
    initialAdminActionState,
  );

  function confirmDeletion(event: FormEvent<HTMLFormElement>) {
    const label = kind === "event" ? "event" : "project";
    if (!window.confirm(`Permanently delete this ${label}? This cannot be undone.`)) {
      event.preventDefault();
    }
  }

  return (
    <form
      action={formAction}
      onSubmit={confirmDeletion}
      className="mt-5 flex flex-wrap items-center gap-4 border-t border-border pt-5"
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl border border-border px-4 py-2.5 text-sm text-muted transition-colors hover:bg-hover hover:text-foreground disabled:opacity-50"
      >
        {pending ? "Deleting…" : `Delete ${kind}`}
      </button>
      <ActionMessage state={state} />
    </form>
  );
}
