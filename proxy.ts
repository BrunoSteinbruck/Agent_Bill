import type { NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

/**
 * Next.js 16 renamed the `middleware` file convention to `proxy`. The behavior
 * is identical: this runs on matched navigations to refresh the Supabase
 * session cookie and guard the product UI.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on every navigation EXCEPT:
     *  - /api/*        (route handlers authenticate themselves; the Lithic
     *                   webhook must stay reachable without a session)
     *  - Next.js internals and static assets
     */
    "/((?!api|_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
