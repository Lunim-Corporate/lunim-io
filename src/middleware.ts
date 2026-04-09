import { NextRequest, NextResponse } from "next/server";

/**
 * Paths that belong to the deal-room module and must NEVER be rewritten
 * by the subdomain routing logic.
 */
const DEAL_ROOM_PATHS = ["/deal-room", "/confirm-email", "/api/auth"];

function isDealRoomPath(pathname: string): boolean {
  return DEAL_ROOM_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

const subdomainRoutes: Record<string, string> = {
  ai: "/ai-automation",
  ux: "/ux",
  "video-next": "/video",
};

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  // ── Deal-room module: always pass through untouched ─────────────────────────
  // These routes are served by the (modules)/deal-room module and must not be
  // rewritten to a subdomain path.
  if (isDealRoomPath(pathname)) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", pathname);
    requestHeaders.set("x-site-key", "main");
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Extract subdomain from hostname
  // Matches: ai.lunim.io, ai.localhost:3000, ai-subdomain.netlify.app
  const subdomain = hostname.split(".")[0];
  const targetPath = subdomainRoutes[subdomain];

  if (!targetPath || hostname.startsWith("www")) {
    return NextResponse.next();
  }

  if (pathname === targetPath || pathname.startsWith(`${targetPath}/`)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `${targetPath}${pathname}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, etc.)
     *
     * NOTE: We intentionally do NOT exclude /api here so that the deal-room
     * guard above can short-circuit /api/auth/** before subdomain rewriting.
     */
    "/((?!_next/static|_next/image|favicon.ico|assets).*)",
  ],
};
