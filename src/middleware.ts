import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

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

  // For non-subdomain requests, pass pathname through
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
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
