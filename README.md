[![Netlify Status](https://api.netlify.com/api/v1/badges/29afd6fc-8952-4273-93c8-aed676e22ca6/deploy-status)](https://app.netlify.com/projects/lunim-v3-progress/deploys)

# Lunim.io

A full-stack Next.js 15 application for Lunim, a digital innovation and technology consulting company. Features include:

- 🎨 **Prismic CMS Integration** - Headless content management with 28+ reusable slices
- 🌐 **Multi-Domain Subdomain Routing** - Support for brand-specific subdomains (e.g., `ai.lunim.io`)
- 🤖 **Luna AI Assistant** - Voice-first conversational AI with OpenAI integration
- 📱 **Responsive Design** - Tailwind CSS with smooth animations (Framer Motion, GSAP)
- 💳 **Payment Integration** - Stripe for academy courses
- 📊 **Analytics** - Google Analytics with custom event tracking

## Tech Stack

- **Framework**: Next.js 15.5.7 (App Router) with React 19.1.0
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS 4.1.14
- **CMS**: Prismic
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Deployment**: Netlify

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Prismic account
- Supabase project (optional, for Luna features)

### Installation

```bash
# Install dependencies
npm install

# Start development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Preview production build
npm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Prismic
NEXT_PUBLIC_PRISMIC_ENVIRONMENT=your-repo-name

# Supabase (for Luna features)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# Email
RESEND_API_KEY=your-resend-key

# OpenAI (for Luna)
OPENAI_API_KEY=your-openai-key

# Site URL
NEXT_PUBLIC_WEBSITE_URL=https://lunim.io
```

## Subdomain Routing Architecture

This application supports multi-tenant subdomain routing, allowing brand-specific experiences on different subdomains (e.g., `ai.lunim.io` for AI Automation).

### How It Works

The subdomain routing system uses a combination of:

1. **Next.js Middleware** ([src/middleware.ts](src/middleware.ts)) - Detects subdomain and rewrites URLs internally
2. **Domain-Aware Layouts** ([src/app/layout.tsx](src/app/layout.tsx)) - Fetches subdomain-specific navigation/footer from Prismic
3. **Nested Layouts** - Brand-specific CSS per subdomain
4. **Link Transformation** ([src/components/SubdomainAwarePrismicLink.tsx](src/components/SubdomainAwarePrismicLink.tsx)) - Clean URLs on subdomains

**Example Flow:**

```
User visits: ai.lunim.io/page
         ↓
Middleware rewrites to: /ai-automation/page (internal routing)
         ↓
Next.js renders: src/app/(subdomains)/ai-automation/[uid]/page.tsx
         ↓
Links on page strip prefix: /page (displayed in browser)
```

### Adding a New Subdomain

Follow these steps to add a new subdomain (e.g., `web3.lunim.io`):

#### 1. Update Middleware

Edit [src/middleware.ts](src/middleware.ts:12-14):

```typescript
const subdomainRoutes: Record<string, string> = {
  "ai": "/ai-automation",
  "web3": "/web3-services", // Add new mapping
};
```

#### 2. Create Nested Layout

Create `src/app/(subdomains)/web3-services/layout.tsx`:

```typescript
import "./brand.css";

export default function Web3ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

Create `src/app/(subdomains)/web3-services/brand.css`:

```css
:root {
  --web3-brand-primary: #ff6b00;
  --web3-brand-secondary: #00ff88;
  /* Add your brand colors */
}
```

#### 3. Create Page Routes

**Homepage** - `src/app/(subdomains)/web3-services/page.tsx`:

```typescript
import { createClient } from "@/prismicio";
import { SliceZone } from "@prismicio/react";
import { components } from "@/slices";
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
import { generateMetaDataInfo, pickBaseMetadata } from "@/utils/metadataHelpers";

export default async function Web3ServicesPage() {
  const client = createClient();
  const doc = await client.getSingle("web3_services").catch(() => null);

  if (!doc) notFound();

  return (
    <main className="bg-black">
      <SliceZone slices={doc.data.slices} components={components} />
    </main>
  );
}

export async function generateMetadata(
  _context: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const client = createClient();
  const parentMetaData = await pickBaseMetadata(parent);
  const doc = await client.getSingle("web3_services").catch(() => null);

  if (!doc) {
    return { title: "Web3 Services", description: "..." };
  }

  return generateMetaDataInfo(doc.data, parentMetaData, true);
}
```

**Dynamic Pages** - `src/app/(subdomains)/web3-services/[uid]/page.tsx`:

```typescript
import { createClient } from "@/prismicio";
import { SliceZone } from "@prismicio/react";
import { components } from "@/slices";
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
import { generateMetaDataInfo, pickBaseMetadata } from "@/utils/metadataHelpers";

type Params = { uid: string };

export default async function Web3ServicesDynamicPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { uid } = await params;
  const client = createClient();
  const doc = await client
    .getByUID("web3_services_page", uid)
    .catch(() => null);

  if (!doc) notFound();

  return (
    <main className="bg-black text-white min-h-screen">
      <SliceZone slices={doc.data?.slices} components={components} />
    </main>
  );
}

export async function generateStaticParams() {
  const client = createClient();
  const docs = await client.getAllByType("web3_services_page");
  return docs.map((d) => ({ uid: d.uid! }));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { uid } = await params;
  const client = createClient();
  const parentMetaData = await pickBaseMetadata(parent);
  const doc = await client
    .getByUID("web3_services_page", uid)
    .catch(() => null);

  if (!doc) {
    return { title: "Web3 Services", description: "..." };
  }

  return generateMetaDataInfo(
    doc.data,
    parentMetaData,
    false,
    false,
    ["web3-services", uid]
  );
}
```

#### 4. Update Prismic Link Resolver

Edit [src/prismicio.ts](src/prismicio.ts:47-90):

```typescript
export const linkResolver: LinkResolverFunction = (link) => {
  // ... existing routes

  // Add Web3 routes
  if (link.type === "web3_services_page") {
    if (link.uid) return `/web3-services/${encodeURIComponent(link.uid)}`;
  }
  if (link.type === "web3_services") {
    return "/web3-services";
  }

  return undefined;
};

const routes: Route[] = [
  // ... existing routes
  { type: "web3_services", path: "/web3-services" },
  { type: "web3_services_page", path: "/web3-services/:uid" },
];
```

#### 5. Update RootLayout

Edit [src/app/layout.tsx](src/app/layout.tsx:50-69):

**In `getSiteKey()` function**:

```typescript
function getSiteKey(hostname: string): "main" | "ai" | "web3" {
  const subdomain = hostname.split(".")[0];
  if (subdomain === "ai" && !hostname.startsWith("www")) {
    return "ai";
  }
  if (subdomain === "web3" && !hostname.startsWith("www")) {
    return "web3";
  }
  return "main";
}
```

**In `generateMetadata()` function**:

```typescript
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get("host") || "lunim.io";
  const siteKey = getSiteKey(hostname);

  let baseUrl: string;
  let siteName: string;

  if (siteKey === "ai") {
    baseUrl = `https://${hostname}`;
    siteName = "Lunim AI Automation";
  } else if (siteKey === "web3") {
    baseUrl = `https://${hostname}`;
    siteName = "Lunim Web3 Services";
  } else {
    baseUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || "https://lunim.io";
    siteName = "Lunim";
  }

  // ... rest of metadata
}
```

**In `RootLayout()` function**:

```typescript
const domainMap: Record<string, string> = {
  "ai": "ai-automation",
  "web3": "web3-services", // Add mapping
};
```

#### 6. Update Breadcrumbs

Edit [src/slices/Breadcrumbs/index.tsx](src/slices/Breadcrumbs/index.tsx:27-33):

**In `getSiteKey()` function**:

```typescript
function getSiteKey(hostname: string): "main" | "ai" | "web3" {
  const subdomain = hostname.split(".")[0];
  if (subdomain === "ai" && !hostname.startsWith("www")) {
    return "ai";
  }
  if (subdomain === "web3" && !hostname.startsWith("www")) {
    return "web3";
  }
  return "main";
}
```

**Update domain mapping**:

```typescript
const domainMap: Record<string, string> = {
  "ai": "ai-automation",
  "web3": "web3-services", // Add mapping
};
```

Edit [src/slices/Breadcrumbs/BreadcrumbsClient.tsx](src/slices/Breadcrumbs/BreadcrumbsClient.tsx:102-107):

```typescript
const homeConfig = useMemo(() => {
  if (siteKey === "ai") {
    return { href: "/ai-automation", label: "Home" };
  }
  if (siteKey === "web3") {
    return { href: "/web3-services", label: "Home" };
  }
  return { href: "/", label: "Home" };
}, [siteKey]);
```

#### 7. Update SubdomainAwarePrismicLink

Edit [src/components/SubdomainAwarePrismicLink.tsx](src/components/SubdomainAwarePrismicLink.tsx:24-45):

```typescript
const hostname = window.location.hostname;
const subdomain = hostname.split(".")[0];

// Define prefix mapping
const subdomainPrefixMap: Record<string, string> = {
  "ai": "/ai-automation",
  "web3": "/web3-services",
};

// Only transform for known subdomains
if (!(subdomain in subdomainPrefixMap) || hostname.startsWith("www")) {
  return props;
}

const prefix = subdomainPrefixMap[subdomain];
const url = asLink(props.field);
if (!url || typeof url !== "string") return props;

// Strip prefix if present
if (url.startsWith(prefix)) {
  const newUrl = url.replace(new RegExp(`^${prefix}`), "") || "/";

  return {
    ...props,
    field: { ...props.field, url: newUrl },
  } as PrismicNextLinkProps;
}
```

#### 8. Setup Prismic CMS

In your Prismic repository:

1. **Create Custom Types**:
   - `web3_services` (singleton) - Homepage for Web3 subdomain
   - `web3_services_page` (repeatable) - Dynamic pages for Web3 subdomain
   - `primary_navigation_generic` (if not exists) - For subdomain navigation
   - `footer_generic` (if not exists) - For subdomain footer

2. **Add Domain Field**:
   - In `primary_navigation_generic` and `footer_generic` custom types
   - Add a "Key Text" field named `domain`
   - Set value to match your internal routing prefix (e.g., "web3-services")

3. **Create Documents**:
   - Create navigation document with `domain = "web3-services"`
   - Create footer document with `domain = "web3-services"`
   - Create homepage document (web3_services singleton)
   - Create child pages (web3_services_page documents)

#### 9. Configure DNS

Add DNS record for your subdomain:

```
Type: CNAME
Name: web3
Value: yourdomain.netlify.app (or your hosting provider)
TTL: Auto
```

For production on custom domains, consult your DNS provider's documentation.

#### 10. Local Testing

Add to `/etc/hosts` (macOS/Linux) or `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
127.0.0.1 web3.localhost
```

Then visit: `http://web3.localhost:3000`

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│  User Request: web3.lunim.io/products                   │
└───────────────────────┬─────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Middleware (src/middleware.ts)                         │
│  • Detects subdomain: "web3"                            │
│  • Rewrites to: /web3-services/products                 │
└───────────────────────┬─────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  RootLayout (src/app/layout.tsx)                        │
│  • getSiteKey() → "web3"                                │
│  • Fetches navigation where domain="web3-services"      │
│  • Fetches footer where domain="web3-services"          │
└───────────────────────┬─────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Nested Layout                                          │
│  (src/app/(subdomains)/web3-services/layout.tsx)        │
│  • Imports brand.css with Web3 brand colors             │
└───────────────────────┬─────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Page Component                                         │
│  (src/app/(subdomains)/web3-services/[uid]/page.tsx)    │
│  • Fetches web3_services_page where uid="products"      │
│  • Renders SliceZone with page content                  │
└───────────────────────┬─────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  SubdomainAwarePrismicLink                              │
│  • Strips /web3-services prefix from URLs               │
│  • User sees: /products (not /web3-services/products)   │
└─────────────────────────────────────────────────────────┘
```

### Key Files Reference

- **[src/middleware.ts](src/middleware.ts)** - Subdomain detection and URL rewriting
- **[src/app/layout.tsx](src/app/layout.tsx)** - Domain-aware navigation/footer fetching
- **[src/prismicio.ts](src/prismicio.ts)** - Link resolver and route definitions
- **[src/components/SubdomainAwarePrismicLink.tsx](src/components/SubdomainAwarePrismicLink.tsx)** - Clean URL transformation
- **[src/slices/Breadcrumbs/](src/slices/Breadcrumbs/)** - Subdomain-aware breadcrumbs
- **[src/slices/NavigationMenu/NavigationMenuClient.tsx](src/slices/NavigationMenu/NavigationMenuClient.tsx)** - Navigation using clean links

### Troubleshooting

**Issue**: Navigation links not working on subdomain

**Solution**: Ensure you added routes to both `linkResolver` and `routes` array in [src/prismicio.ts](src/prismicio.ts)

---

**Issue**: Breadcrumbs showing duplicate home links

**Solution**: Check that `getSiteKey()` correctly identifies subdomain and returns appropriate home config

---

**Issue**: URLs showing doubled prefix (e.g., `/web3-services/web3-services/page`)

**Solution**: Verify `SubdomainAwarePrismicLink` includes your subdomain in `subdomainPrefixMap`

---

**Issue**: Main domain redirecting incorrectly

**Solution**: Middleware only redirects when pathname starts with subdomain prefix AND user is on main domain

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
