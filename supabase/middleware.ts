import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const pathname = url.pathname;
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/auth/");
  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/health");
  const isProtected = !isPublic && !isAuthPage;

  if (!user && isProtected) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Logged-in users hitting login/signup → bounce to dashboard
  if (user && (pathname === "/login" || pathname === "/signup")) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // If user has no company yet, force them through onboarding
  if (user && isProtected && pathname !== "/onboarding") {
    const { data: profile } = await supabase
      .from("users")
      .select("company_id")
      .eq("id", user.id)
      .maybeSingle();
    if (profile && !profile.company_id) {
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
