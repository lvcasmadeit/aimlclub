"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthRequestError = {
  code?: string;
  status?: number;
  message: string;
};

type LoginMode = "password" | "magic-link" | "reset-password";

function getEmailActionErrorMessage(error: AuthRequestError) {
  const code = error.code?.toLowerCase();

  if (
    code === "over_email_send_rate_limit" ||
    code === "over_request_rate_limit" ||
    error.status === 429
  ) {
    return "Supabase has reached its email-send limit. Pause retries until the limit window resets; if it persists, check Authentication → Logs and your SMTP provider's sending limits.";
  }
  if (error.message.toLowerCase().includes("redirect")) {
    return "Supabase rejected this callback URL. Add the current origin plus /auth/callback under Authentication → URL Configuration → Redirect URLs.";
  }

  return `Could not complete the email request (Supabase error: ${code ?? error.status ?? "unknown"}). Check Authentication → Logs for details.`;
}

function getPasswordLoginErrorMessage(error: AuthRequestError) {
  if (
    error.code === "over_request_rate_limit" ||
    error.status === 429
  ) {
    return "Too many sign-in attempts. Wait a while before trying again.";
  }
  return "The email or password is incorrect. If this is your first password login, use “Forgot or set password?” below.";
}

function getCallbackErrorMessage(reason?: string) {
  const code = reason?.toLowerCase();

  if (code === "otp_expired" || code === "flow_state_expired") {
    return "Supabase reports that this sign-in link expired or was already consumed. Request one fresh link. If this happens immediately every time, an email security scanner may be opening the link first.";
  }
  if (
    code === "flow_state_not_found" ||
    code === "pkce_code_verifier_not_found" ||
    code === "bad_code_verifier"
  ) {
    return "The callback reached this app, but the matching browser sign-in state was missing. Request a new link from this same browser profile, not a private or in-app browser.";
  }
  if (code === "missing_code") {
    return "Supabase returned to the callback without an authorization code. Check that the email template uses Supabase’s confirmation URL ({{ .ConfirmationURL }}) and honors the requested redirect.";
  }
  if (code === "not_configured") {
    return "Supabase is not configured in this app process. Check the local environment and restart the development server.";
  }

  const safeCode = code && /^[a-z0-9_-]{1,64}$/.test(code) ? code : "unknown";
  return `Supabase could not complete the sign-in callback (code: ${safeCode}). Try password sign-in, or request a fresh link; check the local dev server terminal if it persists.`;
}

export function AdminLoginForm({
  callbackError = false,
  callbackErrorReason,
}: {
  callbackError?: boolean;
  callbackErrorReason?: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("password");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(
    callbackError ? getCallbackErrorMessage(callbackErrorReason) : "",
  );
  const [isError, setIsError] = useState(callbackError);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const authError = hash.get("error_code") ?? hash.get("error");
    if (!authError) return;

    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${window.location.search}`,
    );
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setIsError(false);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();

    try {
      const supabase = createSupabaseBrowserClient();

      if (mode === "password") {
        const password = String(formData.get("password") ?? "");
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          console.error("Unable to sign in to admin dashboard.", {
            code: error.code,
            status: error.status,
          });
          setIsError(true);
          setMessage(getPasswordLoginErrorMessage(error));
        } else {
          router.replace("/admin");
        }
        return;
      }

      if (mode === "magic-link") {
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
          setMessage(getEmailActionErrorMessage(error));
        } else {
          setMessage("If this email is invited, a sign-in link is on its way.");
        }
        return;
      }

      const redirectTo = `${window.location.origin}/auth/callback?next=/auth/update-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        console.error("Unable to request admin password reset.", {
          code: error.code,
          status: error.status,
        });
        setIsError(true);
        setMessage(getEmailActionErrorMessage(error));
      } else {
        setMessage("If this email has an invited account, a password-reset link is on its way.");
      }
    } catch {
      setIsError(true);
      setMessage("Supabase is unavailable. Check the dashboard setup and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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

      {mode === "password" ? (
        <div>
          <label htmlFor="admin-password" className="mb-2 block text-sm font-medium">
            Password
          </label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={128}
            className="w-full rounded-xl border border-border bg-background-soft px-4 py-3 text-foreground focus-visible:outline-accent"
          />
        </div>
      ) : null}

      {mode === "reset-password" ? (
        <p className="text-sm leading-relaxed text-muted">
          Use this once to set a password, or whenever you need to reset a forgotten one.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting
          ? mode === "password"
            ? "Signing in…"
            : "Sending email…"
          : mode === "password"
            ? "Sign in"
            : mode === "magic-link"
              ? "Email me a sign-in link"
              : "Email me a password-reset link"}
      </button>

      <div className="flex flex-wrap justify-between gap-x-5 gap-y-2 text-sm">
        {mode === "password" ? (
          <>
            <button
              type="button"
              onClick={() => {
                setMode("reset-password");
                setMessage("");
                setIsError(false);
              }}
              className="text-muted underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Forgot or set password?
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("magic-link");
                setMessage("");
                setIsError(false);
              }}
              className="text-muted underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Use a sign-in link instead
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => {
              setMode("password");
              setMessage("");
              setIsError(false);
            }}
            className="text-muted underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Back to password sign-in
          </button>
        )}
      </div>

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
