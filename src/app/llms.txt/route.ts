import { NextResponse } from "next/server";
import { createClient } from "@/prismicio";
import { readdirSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch dynamic data from Prismic
    const client = createClient();

    // Get homepage data
    const homepage = await (client as any)
      .getSingle("homepage")
      .catch(() => null);

    // Get all blog posts
    const blogPosts = await client
      .getAllByType("blog_post")
      .catch(() => []);

    // Get all academy courses
    const courses = await client
      .getAllByType("academy_course")
      .catch(() => []);

    // Get blog authors (they are the actual team members writing content)
    const authors = await client
      .getAllByType("author")
      .catch(() => []);

    // Get our-team page (single document with slices)
    const ourTeamPage = await (client as any)
      .getSingle("our_team_page")
      .catch(() => null);

    // Dynamically discover API routes
    const apiRoutes: string[] = [];
    try {
      const scanDir = (dir: string, base = "/api"): void => {
        const entries = readdirSync(join(process.cwd(), "src/app", dir), {
          withFileTypes: true,
        });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            scanDir(join(dir, entry.name), `${base}/${entry.name}`);
          } else if (entry.name === "route.ts" || entry.name === "route.tsx") {
            apiRoutes.push(base);
          }
        }
      };
      scanDir("api");
    } catch {
      // Fallback to known routes if scanning fails
      apiRoutes.push(
        "/api/contact",
        "/api/academy/checkout",
        "/api/stripe/webhook",
        "/api/luna/conversation",
        "/api/luna/tts",
        "/api/luna/whisper",
        "/api/views"
      );
    }

    const content = `# Lunim.io - Technology and Innovation Solutions

> Human-readable description of the website
Lunim is a technology and innovation company providing cutting-edge solutions in software development, AI/ML integration, and digital transformation. We offer custom development services, consulting, and educational programs through our academy.

## Core Services
- Custom Software Development
- AI/ML Integration and Consulting
- Digital Transformation Solutions
- Technology Training and Academy Programs
- Luna AI Assistant Integration

## Technology Stack
- **Framework**: Next.js 15 with App Router
- **CMS**: Prismic (Headless CMS)
- **Payment Processing**: Stripe
- **Database**: Supabase
- **Email**: Resend + React Email
- **Animation**: GSAP, Framer Motion
- **UI Components**: React 19, Lucide Icons
- **Styling**: Tailwind CSS v4

## Key Features
- Dynamic Content Management via Prismic
- Stripe Payment Integration for Academy
- Luna AI Assistant with Voice Capabilities
- Real-time Analytics and View Tracking
- Course Management via Eventbrite Integration
- Contact Form with Email Notifications
- SEO-Optimized with Schema.org Markup
- Performance-Optimized with Image/Font Optimization

## Site Structure
- Homepage: Dynamic content slices from Prismic (${homepage?.data?.slices?.length || 0} slices)
- Academy: ${courses.length} courses available
- Blog: ${blogPosts.length} published articles
- Team: ${authors.length} content authors
- Our Team: Company team page (${ourTeamPage?.data?.slices?.length || 0} sections)
- Media: Press releases and company updates
- Privacy Policy: Legal and compliance information

## Available Pages
- / (Homepage)
- /academy (Course listings)
- /academy/[uid] (Individual course pages)
- /blog (Blog listings)
- /blog/[uid] (Individual blog posts)
- /blog/authors (Author directory)
- /blog/authors/[uid] (Author profiles)
- /our-team (Team directory)
- /media (Media center)
- /privacy-policy (Privacy policy)
- /digital/[[...uid]] (Digital services catch-all)

## API Endpoints (${apiRoutes.length} total)
${apiRoutes.map((route) => `- ${route}`).join("\n")}

## Content Statistics (Real-time)
- Active Courses: ${courses.length}
- Published Blog Posts: ${blogPosts.length}
- Content Authors: ${authors.length}
- Homepage Sections: ${homepage?.data?.slices?.length || 0}
- Our Team Sections: ${ourTeamPage?.data?.slices?.length || 0}

## SEO & Metadata
- Organization Schema: Structured data for search engines
- Dynamic metadata generation per page
- Sitemap and robots.txt for crawlers
- Open Graph and Twitter Card support

## Contact Information
- Website: https://lunim.io
- Organization Name: Lunim
- Logo: https://images.prismic.io/lunim-v3/aO4uRJ5xUNkB17lv_lunim-logo.png

## Development
- Repository: Private Git repository
- Build System: Next.js with Turbopack
- Deployment: Netlify
- Revalidation: ISR with 60-second intervals

---
This file is dynamically generated for AI/LLM optimization (AIO).
Generated on-demand at: ${new Date().toISOString()}
Content freshness: Real-time data from Prismic CMS
`;

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=300", // 5 minutes cache
      },
    });
  } catch (error) {
    console.error("Error generating llms.txt:", error);

    // Fallback static content if dynamic generation fails
    const fallbackContent = `# Lunim.io - Technology and Innovation Solutions

> Human-readable description of the website
Lunim is a technology and innovation company providing cutting-edge solutions in software development, AI/ML integration, and digital transformation.

---
Error generating dynamic content. Please try again later.
Generated at: ${new Date().toISOString()}
`;

    return new NextResponse(fallbackContent, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
      status: 500,
    });
  }
}
