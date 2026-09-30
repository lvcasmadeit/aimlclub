import "server-only";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AdminAccess =
  | { status: "not-configured" }
  | { status: "signed-out" }
  | { status: "not-admin"; email: string }
  | { status: "schema-missing" }
  | {
      status: "admin";
      email: string;
      userId: string;
      supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
    };

export async function getAdminAccess(): Promise<AdminAccess> {
  if (!isSupabaseConfigured()) return { status: "not-configured" };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims as
    | { sub?: unknown; email?: unknown }
    | undefined;

  if (error || typeof claims?.sub !== "string") {
    return { status: "signed-out" };
  }

  const email = typeof claims.email === "string" ? claims.email.toLowerCase() : "";
  if (!email) return { status: "signed-out" };

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError) return { status: "schema-missing" };
  if (isAdmin !== true) return { status: "not-admin", email };

  return { status: "admin", email, userId: claims.sub, supabase };
}

export async function requireAdmin() {
  const access = await getAdminAccess();
  if (access.status !== "admin") {
    throw new Error("Unauthorized admin action.");
  }
  return access;
}
