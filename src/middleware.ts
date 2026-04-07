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

  // Map subdomains to their respective routes
  const subdomainRoutes: Record<string, string> = {
    "ai": "/ai-automation",
    "ux": "/ux",
    "video-next": "/video",
  };

  // Check if this is a subdomain we handle
  if (subdomain in subdomainRoutes && !hostname.startsWith("www")) {
    const targetPath = subdomainRoutes[subdomain];
    const url = request.nextUrl.clone();
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-site-key", subdomain);

    // Check if pathname already contains the target path
    // This can happen when Prismic links include the full path
    // Must check for exact match or path with trailing slash to avoid false positives
    // e.g., "/video-first-page" should not match "/video"
    if (pathname === targetPath || pathname.startsWith(targetPath + "/")) {
      // Already has the prefix, just pass through
      requestHeaders.set("x-pathname", pathname);
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }

    // Add the prefix for subdomain routing
    url.pathname = `${targetPath}${pathname}`;
    requestHeaders.set("x-pathname", `${targetPath}${pathname}`);
    return NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
  }

  // For non-subdomain requests, pass pathname through and mark as main site
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  requestHeaders.set("x-site-key", "main");
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
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
