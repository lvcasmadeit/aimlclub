import "server-only";

export type AdminWriteMode = "production" | "local" | "read-only";

/**
 * Local development and the Vercel Production deployment share the Production
 * Supabase database. Vercel Preview deployments remain read-only.
 */
export function getAdminWriteMode(): AdminWriteMode {
  if (process.env.VERCEL_ENV === "production") return "production";
  if (process.env.NODE_ENV === "development") return "local";
  return "read-only";
}

export function canWriteAdminContent() {
  return getAdminWriteMode() !== "read-only";
}
