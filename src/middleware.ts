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
  };

  // Check if this is a subdomain we handle
  if (subdomain in subdomainRoutes && !hostname.startsWith("www")) {
    const targetPath = subdomainRoutes[subdomain];
    const url = request.nextUrl.clone();

    // Check if pathname already contains the target path
    // This can happen when Prismic links include the full path
    if (pathname.startsWith(targetPath)) {
      // Already has the prefix, just pass through
      const response = NextResponse.next();
      response.headers.set("x-pathname", pathname);
      return response;
    }

    // Add the prefix for subdomain routing
    url.pathname = `${targetPath}${url.pathname}`;
    const response = NextResponse.rewrite(url);
    response.headers.set("x-pathname", `${targetPath}${pathname}`);
    return response;
  }

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
