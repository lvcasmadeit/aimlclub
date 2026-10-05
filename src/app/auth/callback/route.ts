import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function safeReason(reason: string | null | undefined) {
  return reason && /^[a-z0-9_-]{1,64}$/i.test(reason) ? reason : null;
}

function redirectToLogin(request: NextRequest, reason: string) {
  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("error", "callback");
  loginUrl.searchParams.set("reason", reason);
  return NextResponse.redirect(loginUrl);
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = request.nextUrl.searchParams.get("next");
  const redirectPath =
    nextPath === "/admin" ||
    nextPath?.startsWith("/admin/") ||
    nextPath === "/auth/update-password"
      ? nextPath
      : "/admin";

  if (!isSupabaseConfigured()) {
    return redirectToLogin(request, "not_configured");
  }

  if (!code) {
    const providerError = safeReason(
      request.nextUrl.searchParams.get("error_code"),
    );
    return redirectToLogin(request, providerError ?? "missing_code");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const reason = safeReason(error.code) ?? "exchange_failed";
    console.error("Unable to exchange Supabase auth callback code.", {
      code: reason,
      status: error.status,
    });
    return redirectToLogin(request, reason);
  }

  return NextResponse.redirect(new URL(redirectPath, request.url));
}
