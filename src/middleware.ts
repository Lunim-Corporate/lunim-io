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

  // Check if user is on main domain trying to access subdomain-exclusive content
  const isMainDomain = !Object.keys(subdomainRoutes).includes(subdomain) || hostname.startsWith("www");

  if (isMainDomain && pathname.startsWith("/ai-automation")) {
    // Redirect to the subdomain
    const protocol = request.nextUrl.protocol;
    const baseDomain = hostname.includes("localhost")
      ? "localhost:3000"
      : hostname.replace(/^(www\.)?/, ""); // Remove www if present

    // Construct subdomain URL
    const subdomainHost = hostname.includes("localhost")
      ? "ai.localhost:3000"
      : `ai.${baseDomain.split(".").slice(-2).join(".")}`;  // Get base domain (e.g., lunim.io from www.lunim.io)

    // Remove /ai-automation prefix from pathname for subdomain
    const newPathname = pathname.replace(/^\/ai-automation/, "") || "/";
    const redirectUrl = `${protocol}//${subdomainHost}${newPathname}${request.nextUrl.search}`;

    return NextResponse.redirect(redirectUrl, 301); // Permanent redirect
  }

  // Check if this is a subdomain we handle
  if (subdomain in subdomainRoutes && !hostname.startsWith("www")) {
    const targetPath = subdomainRoutes[subdomain];
    const url = request.nextUrl.clone();

    // Check if pathname already contains the target path
    // This can happen when Prismic links include the full path
    if (pathname.startsWith(targetPath)) {
      // Already has the prefix, just pass through
      return NextResponse.next();
    }

    // Add the prefix for subdomain routing
    url.pathname = `${targetPath}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
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
