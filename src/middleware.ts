import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // /admin is a separate, non-localized route tree (see admin-auth's
  // design.md, Decision 1) - it only needs its Supabase session kept
  // fresh, not next-intl's locale detection/redirect.
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return updateSession(request);
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
