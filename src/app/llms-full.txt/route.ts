import { NextResponse } from "next/server";
import { createClient } from "@/prismicio";
import { readdirSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch dynamic data from Prismic
    const client = createClient();

    // Get all content types
    const homepage = await (client as any)
      .getSingle("homepage")
      .catch(() => null);

    const blogPosts = await client
      .getAllByType("blog_post")
      .catch(() => []);

    const courses = await client
      .getAllByType("academy_course")
      .catch(() => []);

    const authors = await client.getAllByType("author").catch(() => []);

    const ourTeamPage = await (client as any)
      .getSingle("our_team_page")
      .catch(() => null);

    const caseStudies = await client
      .getAllByType("case_study_sm")
      .catch(() => []);

    const academyPage = await (client as any)
      .getSingle("academy")
      .catch(() => null);

    const blogHomePage = await (client as any)
      .getSingle("blog_home_page")
      .catch(() => null);

    // Dynamically discover API routes
    const apiRoutes: string[] = [];
    const scanApiDir = (dir: string, base = "/api"): void => {
      try {
        const entries = readdirSync(join(process.cwd(), "src/app", dir), {
          withFileTypes: true,
        });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            scanApiDir(join(dir, entry.name), `${base}/${entry.name}`);
          } else if (entry.name === "route.ts" || entry.name === "route.tsx") {
            apiRoutes.push(base);
          }
        }
      } catch {
        // Skip if directory doesn't exist
      }
    };
    scanApiDir("api");

    // Dynamically discover all pages
    const pages: string[] = [];
    const scanPagesDir = (dir: string, base = ""): void => {
      try {
        const fullPath = join(process.cwd(), "src/app", dir);
        const entries = readdirSync(fullPath, { withFileTypes: true });

        for (const entry of entries) {
          const relativePath = dir ? join(dir, entry.name) : entry.name;

          if (entry.isDirectory()) {
            // Skip special Next.js directories
            if (
              entry.name.startsWith("api") ||
              entry.name.startsWith("_") ||
              entry.name === "llms.txt" ||
              entry.name === "llms-full.txt"
            ) {
              continue;
            }

            // Handle dynamic routes
            if (entry.name.startsWith("[")) {
              const routeName = entry.name.replace(/\[\.\.\.(\w+)\]/, "[...$1]");
              pages.push(`${base}/${routeName}`);
            } else {
              pages.push(`${base}/${entry.name}`);
            }

            scanPagesDir(relativePath, `${base}/${entry.name}`);
          } else if (entry.name === "page.tsx" || entry.name === "page.ts") {
            if (base && !pages.includes(base)) {
              pages.push(base);
            }
          }
        }
      } catch {
        // Skip if directory doesn't exist
      }
    };
    scanPagesDir("");
    pages.push("/"); // Add root

    // Get detailed course information
    const courseDetails = courses
      .map((course: any) => {
        const title = course.data?.course_title || course.uid || "Untitled Course";
        const description = course.data?.course_description || "No description";
        const category = course.data?.course_category || "Uncategorized";
        const price = course.data?.course_price || "Contact for pricing";
        const sliceCount = course.data?.slices?.length || 0;
        return `  ### ${title}
  - UID: ${course.uid}
  - Category: ${category}
  - Price: ${price}
  - Description: ${typeof description === 'string' ? description.substring(0, 150) : "No description"}${typeof description === 'string' && description.length > 150 ? '...' : ''}
  - Slices: ${sliceCount}
  - Last Published: ${course.last_publication_date ? new Date(course.last_publication_date).toLocaleDateString() : 'N/A'}
  - URL: /academy/${course.uid}`;
      })
      .join("\n\n");

    // Get detailed blog post information with full details
    const detailedBlogPosts = blogPosts
      .slice(0, 20)
      .map((post: any, index: number) => {
        const title = post.data?.title || post.uid || "Untitled Post";
        const excerpt = post.data?.excerpt || post.data?.content?.[0]?.text || "No excerpt";
        const author = post.data?.author?.uid || "Unknown";
        const category = post.data?.category || "Uncategorized";
        const publishDate = post.first_publication_date
          ? new Date(post.first_publication_date).toLocaleDateString()
          : "N/A";
        return `  ${index + 1}. **${title}**
     - UID: ${post.uid}
     - Author: ${author}
     - Category: ${category}
     - Published: ${publishDate}
     - Excerpt: ${typeof excerpt === 'string' ? excerpt.substring(0, 120) : "No excerpt"}${typeof excerpt === 'string' && excerpt.length > 120 ? '...' : ''}
     - URL: /blog/${post.uid}`;
      })
      .join("\n\n");

    // Get author information with details
    const authorDetails = authors
      .map((author: any) => {
        const name = author.data?.author_name || author.uid || "Unknown Author";
        const bio = author.data?.author_bio || "No bio available";
        const hasImage = !!author.data?.author_image?.url;
        const postCount = blogPosts.filter(
          (post: any) => post.data?.author?.uid === author.uid
        ).length;
        return `  ### ${name}
  - UID: ${author.uid}
  - Bio: ${typeof bio === 'string' ? bio.substring(0, 150) : "No bio"}${typeof bio === 'string' && bio.length > 150 ? '...' : ''}
  - Has Profile Image: ${hasImage ? "Yes" : "No"}
  - Articles Written: ${postCount}
  - Profile URL: /blog/authors/${author.uid}`;
      })
      .join("\n\n");

    // Get case study information with details
    const caseStudyDetails = caseStudies
      .map((study: any) => {
        const title = study.data?.case_study_title || study.uid || "Untitled Case Study";
        const client = study.data?.client_name || "Confidential";
        const industry = study.data?.industry || "Various";
        const description = study.data?.description || "No description";
        return `  ### ${title}
  - UID: ${study.uid}
  - Client: ${client}
  - Industry: ${industry}
  - Description: ${typeof description === 'string' ? description.substring(0, 150) : "No description"}${typeof description === 'string' && description.length > 150 ? '...' : ''}
  - Published: ${study.first_publication_date ? new Date(study.first_publication_date).toLocaleDateString() : 'N/A'}`;
      })
      .join("\n\n");

    // Get homepage slice types with details
    const homepageSlices = homepage?.data?.slices
      ?.map((slice: any, index: number) => {
        const variation = slice.variation || "default";
        const hasItems = slice.items && slice.items.length > 0;
        return `  ${index + 1}. **${slice.slice_type}** (variation: ${variation})
     - Has Items: ${hasItems ? `Yes (${slice.items.length})` : "No"}`;
      })
      .join("\n");

    // Get blog post categories
    const blogCategories = [...new Set(blogPosts.map((post: any) => post.data?.category).filter(Boolean))];

    // Get course categories
    const courseCategories = [...new Set(courses.map((course: any) => course.data?.course_category).filter(Boolean))];

    // Get all unique slice types across the site
    const allSliceTypes = new Set<string>();
    [homepage, academyPage, blogHomePage, ourTeamPage].forEach((page) => {
      page?.data?.slices?.forEach((slice: any) => {
        allSliceTypes.add(slice.slice_type);
      });
    });
    [...courses, ...blogPosts, ...caseStudies].forEach((doc: any) => {
      doc?.data?.slices?.forEach((slice: any) => {
        allSliceTypes.add(slice.slice_type);
      });
    });

    // Get academy page slice details
    const academySlices = academyPage?.data?.slices
      ?.map((slice: any, index: number) => {
        const variation = slice.variation || "default";
        const hasItems = slice.items && slice.items.length > 0;
        return `  ${index + 1}. **${slice.slice_type}** (variation: ${variation})
     - Has Items: ${hasItems ? `Yes (${slice.items.length})` : "No"}`;
      })
      .join("\n");

    // Get blog home page slice details
    const blogHomeSlices = blogHomePage?.data?.slices
      ?.map((slice: any, index: number) => {
        const variation = slice.variation || "default";
        const hasItems = slice.items && slice.items.length > 0;
        return `  ${index + 1}. **${slice.slice_type}** (variation: ${variation})
     - Has Items: ${hasItems ? `Yes (${slice.items.length})` : "No"}`;
      })
      .join("\n");

    // Get our team page slice details
    const ourTeamSlices = ourTeamPage?.data?.slices
      ?.map((slice: any, index: number) => {
        const variation = slice.variation || "default";
        const hasItems = slice.items && slice.items.length > 0;
        return `  ${index + 1}. **${slice.slice_type}** (variation: ${variation})
     - Has Items: ${hasItems ? `Yes (${slice.items.length})` : "No"}`;
      })
      .join("\n");

    const content = `# Lunim.io - Complete Site Documentation (LLMs Full)

## Site Overview
Lunim is a technology and innovation company providing cutting-edge solutions in software development, AI/ML integration, and digital transformation. We offer custom development services, consulting, and educational programs through our academy.

---

## Core Services
- **Custom Software Development**: Tailored software solutions for businesses
- **AI/ML Integration and Consulting**: Artificial intelligence and machine learning implementation
- **Digital Transformation Solutions**: Modernizing business processes and systems
- **Technology Training and Academy Programs**: Educational courses in various tech domains
- **Luna AI Assistant Integration**: Voice-enabled AI assistant for interactive experiences

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15.5.4 with App Router
- **React**: Version 19.1.0
- **Styling**: Tailwind CSS v4.1.14
- **Animations**:
  - GSAP 3.13.0 (Timeline-based animations)
  - Framer Motion 12.23.22 (Component animations)
  - React TSParticles 2.12.2 (Particle effects)
- **Icons**: Lucide React 0.545.0
- **Fonts**:
  - Inter (@fontsource/inter 5.2.8)
  - Noto Sans Display (@fontsource/noto-sans-display 5.2.10)

### Backend & Infrastructure
- **CMS**: Prismic (Headless CMS with SliceMachine)
- **Database**: Supabase 2.74.0
- **Payment Processing**: Stripe 19.1.0
- **Email Service**: Resend 6.4.2 with React Email 2.0.0
- **Event Management**: Eventbrite API Integration
- **Deployment**: Netlify with Next.js Plugin
- **Build Tool**: Next.js with Turbopack

### Development Tools
- **TypeScript**: Version 5
- **Linting**: ESLint 9 with Next.js config
- **Package Manager**: npm
- **Prismic Tools**:
  - Slice Machine UI 2.19.1
  - Prismic CLI 4.2.3
  - Prismic TS Codegen 0.1.28

---

## Content Management (Prismic CMS)

### Document Types
1. **homepage** (Single)
2. **academy** (Single)
3. **academy_course** (Repeatable) - ${courses.length} courses
4. **blog_home_page** (Single)
5. **blog_post** (Repeatable) - ${blogPosts.length} posts
6. **author** (Repeatable) - ${authors.length} authors
7. **our_team_page** (Single)
8. **case_study_sm** (Repeatable) - ${caseStudies.length} case studies
9. **privacy_policy** (Single)
10. **digital_page** (Repeatable)
11. **footer** (Single)
12. **primary_navigation** (Single)

### Available Slice Types Across Site (${allSliceTypes.size} unique types)
${Array.from(allSliceTypes).sort().map(type => `- ${type}`).join("\n")}

### Homepage Structure (${homepage?.data?.slices?.length || 0} slices)
${homepageSlices || "  No slices available"}

### Academy Page Structure (${academyPage?.data?.slices?.length || 0} slices)
${academySlices || "  No slices available"}

### Blog Home Page Structure (${blogHomePage?.data?.slices?.length || 0} slices)
${blogHomeSlices || "  No slices available"}

### Our Team Page Structure (${ourTeamPage?.data?.slices?.length || 0} slices)
${ourTeamSlices || "  No slices available"}

---

## Academy Courses (${courses.length} total)

### Course Categories (${courseCategories.length} total)
${courseCategories.length > 0 ? courseCategories.map(cat => `- ${cat}`).join("\n") : "No categories"}

### Course Listings (All Courses with Details):
${courseDetails || "  No courses available"}

---

## Blog Content

### Blog Categories (${blogCategories.length} total)
${blogCategories.length > 0 ? blogCategories.map(cat => `- ${cat}`).join("\n") : "No categories"}

### Published Posts (${blogPosts.length} total)
#### Recent Posts (Latest 20 with Details):
${detailedBlogPosts || "  No blog posts available"}

### Content Authors (${authors.length} total)
${authorDetails || "  No authors available"}

---

## Case Studies (${caseStudies.length} total)
${caseStudyDetails || "  No case studies available"}

---

## Site Pages (${pages.length} total)
${pages
  .sort()
  .map((page) => `- ${page || "/"}`)
  .join("\n")}

---

## API Endpoints (${apiRoutes.length} total)

### Available Routes:
${apiRoutes.sort().map((route) => `- ${route}`).join("\n")}

### Endpoint Details:

#### Contact & Communication
- **/api/contact**: Handle contact form submissions, send emails via Resend

#### Academy & Payments
- **/api/academy/checkout**: Process course enrollment and Stripe payments
- **/api/stripe/webhook**: Handle Stripe payment webhooks (subscription, payment events)
- **/api/eventbrite/course**: Fetch course information from Eventbrite

#### Luna AI Assistant
- **/api/luna/conversation**: Main conversation endpoint for Luna AI
- **/api/luna/tts**: Text-to-speech conversion for Luna's voice
- **/api/luna/whisper**: Speech-to-text (voice input processing)
- **/api/luna/plan**: Planning and strategy generation
- **/api/luna/analytics**: Analytics and usage tracking for Luna
- **/api/luna/clarify**: Clarification and context gathering

#### CMS & Revalidation
- **/api/preview**: Prismic preview mode
- **/api/exit-preview**: Exit Prismic preview mode
- **/api/revalidate**: On-demand ISR revalidation

#### Analytics
- **/api/views**: Page view tracking and analytics

#### Open Graph Images
- **/api/og**: Dynamic Open Graph image generation

---

## Key Features

### Content Management
- Dynamic content slices via Prismic SliceMachine
- Real-time preview mode for content editors
- On-demand revalidation with 60-second ISR
- Type-safe content with TypeScript code generation

### E-Commerce & Payments
- Stripe integration for course payments
- Webhook handling for payment events
- Secure checkout flow
- Eventbrite integration for course management

### AI/ML Features
- Luna AI Assistant with conversational interface
- Voice input (Speech-to-Text via Whisper)
- Voice output (Text-to-Speech)
- Context-aware responses
- Analytics tracking

### SEO & Performance
- Schema.org structured data (Organization, Article, Course)
- Dynamic metadata generation per page
- Automatic sitemap generation
- robots.txt for crawler management
- Open Graph and Twitter Card support
- Image and font optimization
- Incremental Static Regeneration (ISR)

### User Experience
- Responsive design with Tailwind CSS
- Smooth animations with GSAP and Framer Motion
- Interactive particle effects
- Custom arrow connections (react-xarrows)
- Boring Avatars for user placeholders

---

## Content Statistics (Real-time)

- **Total Pages**: ${pages.length}
- **Total API Endpoints**: ${apiRoutes.length}
- **Academy Courses**: ${courses.length}
- **Blog Posts**: ${blogPosts.length}
- **Content Authors**: ${authors.length}
- **Case Studies**: ${caseStudies.length}
- **Homepage Sections**: ${homepage?.data?.slices?.length || 0}
- **Academy Page Sections**: ${academyPage?.data?.slices?.length || 0}
- **Blog Home Sections**: ${blogHomePage?.data?.slices?.length || 0}
- **Our Team Sections**: ${ourTeamPage?.data?.slices?.length || 0}

---

## SEO & Metadata Configuration

### Structured Data
- Organization schema with logo and social links
- Article schema for blog posts
- Course schema for academy offerings
- Breadcrumb navigation

### Meta Tags
- Dynamic title and description per page
- Open Graph images and metadata
- Twitter Card support
- Canonical URLs
- Meta keywords (configurable per page in Prismic)

### Sitemaps & Robots
- Dynamic sitemap generation at /sitemap.xml
- robots.txt for crawler directives
- Proper indexing rules

---

## Contact Information

- **Website**: https://lunim.io
- **Organization**: Lunim
- **Alternate Name**: Lunim.io
- **Logo**: https://images.prismic.io/lunim-v3/aO4uRJ5xUNkB17lv_lunim-logo.png
- **Description**: Technology and innovation solutions

### Social Media
(Configure in Prismic organization schema)

---

## Development Information

### Repository
- Type: Private Git repository
- Main Branch: main
- Recent Activity: Active development

### Build Configuration
- Build System: Next.js with Turbopack
- Output: Standalone with static optimization
- Deployment: Netlify with automated CI/CD
- Environment: Node.js

### Performance Optimizations
- Incremental Static Regeneration (60s revalidate)
- Image optimization via next/image
- Font optimization with @fontsource
- Code splitting and lazy loading
- Edge caching with proper Cache-Control headers

---

## Integration Details

### Prismic CMS
- Repository: lunim-v3
- API: Prismic REST API
- Content Modeling: SliceMachine
- Preview Mode: Enabled

### Stripe Payments
- Integration: Stripe SDK 19.1.0
- Webhooks: Real-time payment events
- Security: Webhook signature verification

### Supabase Database
- Client: @supabase/supabase-js 2.74.0
- Usage: User data, analytics, application state

### Email Service (Resend)
- Provider: Resend 6.4.2
- Templates: React Email components
- Use Cases: Contact forms, transactional emails

---

## File Generation Info

- **Type**: Dynamic content generation
- **Generated at**: ${new Date().toISOString()}
- **Freshness**: Real-time data from Prismic CMS
- **Cache Duration**: 5 minutes
- **Update Frequency**: On-demand per request
- **Content Source**: Prismic API + Filesystem scanning

---

## Additional Technical Details

### Dependencies Overview
- **Total npm packages**: 36+ direct dependencies
- **Key Libraries**:
  - React & Next.js ecosystem (react, react-dom, next)
  - Prismic ecosystem (@prismicio/client, @prismicio/react, @prismicio/next)
  - Stripe for payments
  - Supabase for database
  - GSAP & Framer Motion for animations
  - Tailwind CSS for styling
  - TypeScript for type safety

### Content Delivery Network (CDN)
- **Prismic CDN**: Images and assets served via Prismic's global CDN
- **Image Domain**: images.prismic.io
- **Optimization**: Automatic image resizing, format conversion (WebP), lazy loading

### API Response Times
- **Prismic API**: Real-time content fetching
- **ISR Revalidation**: 60-second background updates
- **Cache Strategy**: Stale-while-revalidate for optimal performance

### Security Measures
- **Environment Variables**: Secure storage for API keys
- **Stripe Webhooks**: Signature verification for payment events
- **HTTPS**: Enforced across all domains
- **CORS**: Configured for API endpoints
- **Content Security**: Prismic preview tokens

### Accessibility Features
- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- Screen reader compatibility
- Proper heading hierarchy

### Browser Support
- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ JavaScript features
- Progressive enhancement approach

---

## Content Update Workflow

### Publishing Flow
1. Content editors create/edit in Prismic
2. Preview changes using preview mode (/api/preview)
3. Publish changes in Prismic
4. Webhook triggers revalidation (/api/revalidate)
5. Next.js rebuilds affected pages via ISR
6. Changes go live within 60 seconds

### Content Types Update Frequency
- **Blog Posts**: Regular updates (weekly/monthly)
- **Courses**: Periodic updates (monthly/quarterly)
- **Case Studies**: As new projects complete
- **Homepage**: Strategic updates (quarterly)
- **Authors**: Occasional updates (as team changes)

---

## Usage Notes for AI/LLMs

This file provides comprehensive information about the Lunim.io website structure, content, and capabilities. Use this information to:

1. **Answer questions** about site structure and available pages
2. **Guide users** to relevant content and resources
3. **Understand** the technology stack and integrations
4. **Reference** API endpoints for development tasks
5. **Navigate** content types and their relationships
6. **Explain** features and functionality
7. **Provide context** about courses, blog posts, and authors
8. **Help with** technical implementation details
9. **Understand** the Prismic slice-based architecture
10. **Reference** specific UIDs and routes

### Quick Reference
- **Simple Overview**: /llms.txt
- **Complete Details**: /llms-full.txt (this file)
- **Homepage**: https://lunim.io
- **Blog**: https://lunim.io/blog
- **Academy**: https://lunim.io/academy
- **API Base**: https://lunim.io/api

---

## Data Freshness

This documentation is generated dynamically on each request with real-time data from:
- Prismic CMS API (live content)
- Filesystem scanning (current codebase structure)
- Package.json (dependency versions)

**Cache Duration**: 5 minutes
**Last Generated**: ${new Date().toISOString()}
**Source**: Production Prismic repository (lunim-v3)

---

*This file is automatically generated for AI/LLM optimization (AIO).*
*Documentation format: llms-full.txt specification*
*Version: 2.0*
*Generator: Next.js 15.5.4 Dynamic Route Handler*
`;

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=300", // 5 minutes cache
      },
    });
  } catch (error) {
    console.error("Error generating llms-full.txt:", error);

    const fallbackContent = `# Lunim.io - Complete Site Documentation (Error)

An error occurred while generating the full site documentation.

## Error Details
Generated at: ${new Date().toISOString()}
Error: ${error instanceof Error ? error.message : "Unknown error"}

Please try accessing /llms.txt for basic site information, or contact support if this error persists.
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
