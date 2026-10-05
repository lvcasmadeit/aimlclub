import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminPasswordUpdateForm } from "@/components/admin/AdminPasswordUpdateForm";
import { getAdminAccess } from "@/lib/admin/access";

export const dynamic = "force-dynamic";

export default async function UpdateAdminPasswordPage() {
  const access = await getAdminAccess();
  if (access.status !== "admin") redirect("/admin/login");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-20">
      <Link
        href="/admin"
        className="font-mono text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:text-foreground"
      >
        AI &amp; ML Club · Back to dashboard
      </Link>
      <div className="mt-8 rounded-3xl border border-border bg-background-soft/40 p-6 sm:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
          Admin account
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Set a new password.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          Choose a password for {access.email}. Passwords are managed securely by
          Supabase Auth.
        </p>
        <AdminPasswordUpdateForm />
      </div>
    </main>
  );
}
