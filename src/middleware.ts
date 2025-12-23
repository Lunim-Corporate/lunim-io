import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  console.log('[Middleware Debug] hostname:', hostname, 'pathname:', pathname);

  // Extract subdomain from hostname
  // Matches: ai.lunim.io, ai.localhost:3000, ai-subdomain.netlify.app
  const subdomain = hostname.split(".")[0];
  console.log('[Middleware Debug] subdomain:', subdomain);

  // Map subdomains to their respective routes
  const subdomainRoutes: Record<string, string> = {
    "ai": "/ai-automation",
    "video-next": "/video",
  };

  console.log('[Middleware Debug] subdomain in routes?', subdomain in subdomainRoutes);
  console.log('[Middleware Debug] hostname.startsWith("www")?', hostname.startsWith("www"));

  // Check if this is a subdomain we handle
  if (subdomain in subdomainRoutes && !hostname.startsWith("www")) {
    console.log('[Middleware Debug] Matched subdomain routing!');
    const targetPath = subdomainRoutes[subdomain];
    const url = request.nextUrl.clone();

    console.log('[Middleware Debug] targetPath:', targetPath);
    console.log('[Middleware Debug] pathname.startsWith(targetPath)?', pathname.startsWith(targetPath));

    // Check if pathname already contains the target path
    // This can happen when Prismic links include the full path
    // Must check for exact match or path with trailing slash to avoid false positives
    // e.g., "/video-first-page" should not match "/video"
    if (pathname === targetPath || pathname.startsWith(targetPath + "/")) {
      console.log('[Middleware Debug] Path already has prefix, passing through');
      // Already has the prefix, just pass through
      const response = NextResponse.next();
      response.headers.set("x-pathname", pathname);
      return response;
    }

    // Add the prefix for subdomain routing
    console.log('[Middleware Debug] Rewriting from', pathname, 'to', `${targetPath}${pathname}`);
    url.pathname = `${targetPath}${pathname}`;
    const response = NextResponse.rewrite(url);
    response.headers.set("x-pathname", `${targetPath}${pathname}`);
    return response;
  }

  console.log('[Middleware Debug] No subdomain match, passing through');
  // For non-subdomain requests, pass pathname through
  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|assets).*)",
  ],
};
