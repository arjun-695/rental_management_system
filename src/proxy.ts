import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { AppRole } from "@/types/next-auth";

// Route -> allowed roles mapping
const ROLE_HOME: Record<AppRole, string> = {
  ADMIN:  "/admin",
  OWNER:  "/owner",
  TENANT: "/tenant",
};

const ROUTE_ACL: { prefix: string; allowed: ReadonlySet<AppRole> }[] = [
  { prefix: "/admin",  allowed: new Set(["ADMIN"]) },
  { prefix: "/owner",  allowed: new Set(["ADMIN", "OWNER"]) },
  { prefix: "/tenant", allowed: new Set(["ADMIN", "TENANT"]) },
  // /dashboard is accessible to any authenticated user - no entry needed
];

const AUTH_PAGES = new Set(["/sign-in", "/sign-up"]);

//  --- Proxy ---
export async function proxy(request: NextRequest) {
  // 1. Get token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;
  const isAuthenticated = Boolean(token);
  const role: AppRole = (token?.role as AppRole) ?? "TENANT";

  // 1. Redirect unauthenticated users away from protected routes
  if (!isAuthenticated) {
    const isProtected =
      pathname.startsWith("/dashboard") ||
      ROUTE_ACL.some((r) => pathname.startsWith(r.prefix));
    if (isProtected) {
      const url = new URL("/sign-in", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }
  // 2. Redirect authenticated users away from auth pages
  if (AUTH_PAGES.has(pathname)) {
    return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
  }
  // 3. Enforce role-based access
  for (const { prefix, allowed } of ROUTE_ACL) {
    if (pathname.startsWith(prefix) && !allowed.has(role)) {
      return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
    }
  }
  return NextResponse.next();
}
// The matcher already excludes static assets - no need to re-check inside proxy
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
