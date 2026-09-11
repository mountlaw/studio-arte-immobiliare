import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env";

/**
 * Proxy (ex middleware): mantiene viva la sessione Supabase (refresh dei
 * cookie) e manda al login chi prova a entrare nell'area riservata senza
 * essere autenticato. Il controllo "e' davvero un admin?" lo fa il layout.
 */
export async function proxy(request: NextRequest) {
  // I link delle email di Supabase (conferma indirizzo, reset password) possono atterrare
  // sulla home con ?code=...: li portiamo alla pagina che scambia il codice con la sessione.
  const code = request.nextUrl.searchParams.get("code");
  if (code && !request.nextUrl.pathname.startsWith("/auth/callback")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    url.search = "";
    url.searchParams.set("code", code);
    url.searchParams.set("next", request.nextUrl.searchParams.get("type") === "recovery" ? "/admin/reset" : "/admin");
    return NextResponse.redirect(url);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthPage = pathname === "/admin/login" || pathname === "/admin/reset" || pathname.startsWith("/auth/");
  if (pathname.startsWith("/admin") && !isAuthPage && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (pathname === "/admin/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ["/", "/admin/:path*", "/auth/:path*"],
};
