import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = request.nextUrl.searchParams.get("next");
  const redirectPath =
    nextPath === "/admin" || nextPath?.startsWith("/admin/")
      ? nextPath
      : "/admin";

  if (!isSupabaseConfigured() || !code) {
    return NextResponse.redirect(
      new URL("/admin/login?error=callback", request.url),
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL("/admin/login?error=callback", request.url),
    );
  }

  return NextResponse.redirect(new URL(redirectPath, request.url));
}
