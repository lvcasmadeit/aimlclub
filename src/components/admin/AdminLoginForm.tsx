"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthRequestError = {
  code?: string;
  status?: number;
  message: string;
};

function getAuthErrorMessage(error: AuthRequestError) {
  const code = error.code?.toLowerCase();

  if (
    code === "over_email_send_rate_limit" ||
    code === "over_request_rate_limit" ||
    error.status === 429
  ) {
    return "Supabase has reached its email-send limit. Pause retries until the limit window resets; if it persists, check Authentication → Logs and your SMTP provider's sending limits. Repeated requests will not bypass the limit.";
  }
  if (code === "user_not_found") {
    return "No Supabase Auth user exists for this address. Invite it under Authentication → Users; the admin allowlist row alone is not enough.";
  }
  if (code === "email_not_confirmed") {
    return "This account has not completed its Supabase invitation/confirmation. Resend the invite under Authentication → Users and complete it first.";
  }
  if (code === "email_provider_disabled") {
    return "Email sign-in is disabled in Supabase. Enable the Email provider under Authentication → Providers.";
  }
  if (error.message.toLowerCase().includes("redirect")) {
    return "Supabase rejected this callback URL. Add the exact current origin plus /auth/callback under Authentication → URL Configuration → Redirect URLs.";
  }

  return `Could not send the link (Supabase error: ${code ?? error.status ?? "unknown"}). Check Authentication → Logs for details.`;
}

function getExpiredLinkMessage() {
  return "That sign-in link could not be verified; it may have expired or already been used. Request a fresh link and open the newest email; each link works only once.";
}

export function AdminLoginForm({ callbackError = false }: { callbackError?: boolean }) {
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState(
    callbackError ? getExpiredLinkMessage() : "",
  );
  const [isError, setIsError] = useState(callbackError);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const authError = hash.get("error");
    if (!authError) return;

    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${window.location.search}`,
    );
  }, []);

  async function requestMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSending(true);
    setMessage("");
    setIsError(false);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin`,
        },
      });

      if (error) {
        console.error("Unable to send admin sign-in link.", {
          code: error.code,
          status: error.status,
        });
        setIsError(true);
        setMessage(getAuthErrorMessage(error));
      } else {
        setMessage("If this email is invited, a sign-in link is on its way.");
      }
    } catch {
      setIsError(true);
      setMessage("Supabase is unavailable. Check the dashboard setup and try again.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form onSubmit={requestMagicLink} className="mt-8 space-y-5">
      <div>
        <label htmlFor="admin-email" className="mb-2 block text-sm font-medium">
          University email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          placeholder="you@student.uml.edu"
          className="w-full rounded-xl border border-border bg-background-soft px-4 py-3 text-foreground placeholder:text-muted focus-visible:outline-accent"
        />
      </div>
      <button
        type="submit"
        disabled={isSending}
        className="w-full rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSending ? "Sending link…" : "Email me a sign-in link"}
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
