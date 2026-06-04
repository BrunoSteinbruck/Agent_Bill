/**
 * Session refresh + route guard, called from the Next.js proxy (formerly the
 * "middleware" file convention).
 *
 * Supabase access tokens are short-lived; this runs on every navigation to
 * refresh the cookie when needed and to keep the server and client in sync.
 * It also guards the product UI: unauthenticated visitors to `/app/*` are sent
 * to `/login`, and signed-in users who land on `/login` or `/signup` are sent
 * on to the app.
 *
 * IMPORTANT: always return `supabaseResponse` (or a redirect built from its
 * cookies). Returning a fresh NextResponse would drop the refreshed auth cookie
 * and silently log the user out on the next request.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { publicEnv } from "../env";
import type { Database } from "./types";

export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and getUser — it refreshes the
  // token and any intervening logic can race the cookie write.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = pathname.startsWith("/app");
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/app";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
