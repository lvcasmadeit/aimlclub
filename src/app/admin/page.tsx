import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { signOutAdmin } from "@/app/admin/actions";
import { getAdminContent } from "@/lib/admin/content";
import { getAdminAccess } from "@/lib/admin/access";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const access = await getAdminAccess();

  if (access.status === "not-configured") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-20">
        <Link href="/" className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
          AI &amp; ML Club · Back to site
        </Link>
        <div className="mt-8 rounded-3xl border border-border bg-background-soft/40 p-6 sm:p-10">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Supabase setup required
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Connect a Supabase project to use the dashboard.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>, then apply the SQL
            migration described in <code>SUPABASE_SETUP.md</code>.
          </p>
        </div>
      </main>
    );
  }

  if (access.status === "signed-out") redirect("/admin/login");

  if (access.status === "not-admin") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-20">
        <div className="rounded-3xl border border-border bg-background-soft/40 p-6 sm:p-10">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Access restricted
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            This account is not an admin.
          </h1>
          <p className="mt-4 text-sm text-muted">Signed in as {access.email}.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <form action={signOutAdmin}>
              <button className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-background">
                Sign out
              </button>
            </form>
            <Link href="/" className="rounded-xl border border-border px-4 py-2.5 text-sm">
              Back to site
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (access.status === "schema-missing") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-20">
        <div className="rounded-3xl border border-border bg-background-soft/40 p-6 sm:p-10">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Migration required
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Apply the admin database migration.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Supabase authentication succeeded, but the admin allowlist could not
            be checked. Run the migration in <code>supabase/migrations</code> and
            refresh this page.
          </p>
        </div>
      </main>
    );
  }

  const content = await getAdminContent(access.supabase);

  return (
    <AdminDashboard
      email={access.email}
      events={content.events}
      projects={content.projects}
      hasLoadError={Boolean(content.error)}
    />
  );
}
