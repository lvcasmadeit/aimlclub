"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type PasswordUpdateError = {
  code?: string;
  status?: number;
};

function getPasswordUpdateErrorMessage(error: PasswordUpdateError) {
  if (error.code === "weak_password") {
    return "Supabase rejected that password. Choose a stronger password and try again.";
  }
  if (error.code === "same_password") {
    return "Choose a password you have not used for this account before.";
  }
  return "Could not update the password. Your session may have expired; sign in again or request a password-reset email and retry.";
}

export function AdminPasswordUpdateForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("password-confirmation") ?? "");

    if (password !== confirmation) {
      setIsError(true);
      setMessage("The passwords do not match.");
      return;
    }
    if (password.length < 12) {
      setIsError(true);
      setMessage("Choose a password with at least 12 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        console.error("Unable to update admin password.", {
          code: error.code,
          status: error.status,
        });
        setIsError(true);
        setMessage(getPasswordUpdateErrorMessage(error));
      } else {
        router.replace("/admin");
      }
    } catch {
      setIsError(true);
      setMessage("Supabase is unavailable. Request a new reset link and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div>
        <label htmlFor="new-admin-password" className="mb-2 block text-sm font-medium">
          New password
        </label>
        <input
          id="new-admin-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          maxLength={128}
          className="w-full rounded-xl border border-border bg-background-soft px-4 py-3 text-foreground focus-visible:outline-accent"
        />
      </div>
      <div>
        <label
          htmlFor="confirm-admin-password"
          className="mb-2 block text-sm font-medium"
        >
          Confirm new password
        </label>
        <input
          id="confirm-admin-password"
          name="password-confirmation"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          maxLength={128}
          className="w-full rounded-xl border border-border bg-background-soft px-4 py-3 text-foreground focus-visible:outline-accent"
        />
      </div>
      <p className="text-xs text-muted">Use at least 12 characters.</p>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Updating password…" : "Save new password"}
      </button>
      <p
        role={isError ? "alert" : "status"}
        aria-live="polite"
        className="min-h-5 text-sm text-muted"
      >
        {message}
      </p>
    </form>
  );
}
