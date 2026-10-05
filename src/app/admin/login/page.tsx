import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getAdminAccess } from "@/lib/admin/access";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reason?: string }>;
}) {
  const { error, reason } = await searchParams;
  const configured = isSupabaseConfigured();
  const access = configured ? await getAdminAccess() : null;

  if (access?.status === "admin") redirect("/admin");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-20">
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:text-foreground"
      >
        AI &amp; ML Club · Back to site
      </Link>
      <div className="mt-8 rounded-3xl border border-border bg-background-soft/40 p-6 sm:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
          Admin access
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Sign in to manage club updates.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          Sign in with your password. While signed in, you can set or change it
          from the dashboard; email recovery and a sign-in link remain available.
          No public registration is available.
        </p>

        {!configured ? (
          <div className="mt-8 rounded-2xl border border-border bg-background px-5 py-4 text-sm leading-relaxed text-muted">
            Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> to your local env
            and configure the Supabase project. See <code>SUPABASE_SETUP.md</code>.
          </div>
        ) : access?.status === "schema-missing" ? (
          <div className="mt-8 rounded-2xl border border-border bg-background px-5 py-4 text-sm leading-relaxed text-muted">
            Supabase is connected, but the admin migration is missing. Apply the
            SQL in <code>supabase/migrations</code> before signing in.
          </div>
        ) : (
          <>
            {access?.status === "not-admin" ? (
              <p role="alert" className="mt-6 text-sm text-muted">
                This account is authenticated but is not on the admin allowlist.
              </p>
            ) : null}
            <AdminLoginForm
              callbackError={error === "callback"}
              callbackErrorReason={reason}
            />
          </>
        )}
      </div>
    </main>
  );
}
