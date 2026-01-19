import AnalyticsProvider from "./AnalyticsProvider";
import { GA_ID } from "@/lib/gtag";
// React
import { Suspense } from "react";
// Next
import Script from "next/script";
import { draftMode, headers } from "next/headers";
import { Metadata } from "next";
// Prismic
import { createClient, repositoryName } from "@/prismicio";
import { PrismicPreview } from "@prismicio/next";
import NavigationMenu from "@/slices/NavigationMenu";
import Footer from "@/slices/Footer";
import { Content } from "@prismicio/client";
// Styles
import "./globals.css";
// Components
import SmoothScroll from "@/components/SmoothScroll";
import ScrollManager from "@/components/ScrollManager";


export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get("host") || "lunim.io";
  const pathname = headersList.get("x-pathname") || "/";
  const siteKey = getSiteKey(hostname, pathname);

  // Determine base URL based on hostname
  let baseUrl: string;
  let siteName: string;
  let siteTitle: string;
  let siteDescription: string;

  if (siteKey === "ai") {
    baseUrl = `https://${hostname}`;
    siteName = "Lunim AI Automation";
    siteTitle = "Lunim AI Automation – AI-Powered Solutions";
    siteDescription = "Transform your business with AI automation solutions from Lunim.";
  } else if (siteKey === "ux") {
    baseUrl = `https://${hostname}`;
    siteName = "Lunim UX";
    siteTitle = "Lunim UX – Human-Centered Design";
    siteDescription = "Design better product experiences with Lunim UX.";
  } else if (siteKey === "video") {
    baseUrl = `https://${hostname}`;
    siteName = "Lunim Video Production";
    siteTitle = "Lunim Video Production – Professional Video Services";
    siteDescription = "Create compelling visual stories with professional video production from Lunim.";
  } else {
    baseUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || "https://lunim-v3-progress.netlify.app/";
    siteName = "Lunim";
    siteTitle = "Lunim.io – Innovative Digital Solutions";
    siteDescription = "Lunim.io creates seamless digital experiences with cutting-edge technology and design.";
  }

  return {
    title: {
      template: `%s | ${siteName}`,
      default: siteName,
    },
    description: siteDescription,
    keywords: "technology, innovation, software, development, lunim, AI, automation",
    metadataBase: new URL(baseUrl),
    openGraph: {
      type: "website",
      locale: "en_GB",
      siteName: siteName,
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDescription,
      images: [
        `${baseUrl}/assets/images/og-image.jpg`
      ],
    },
  };
}

// Helper function to determine site key from hostname and pathname
function getSiteKey(
  hostname: string,
  pathname: string = "/"
): "main" | "ai" | "ux" | "video" {
  const subdomain = hostname.split(".")[0];

  // Check if it's a subdomain we handle
  if (subdomain === "ai" && !hostname.startsWith("www")) {
    return "ai";
  }
  if (subdomain === "ux" && !hostname.startsWith("www")) {
    return "ux";
  }
  if (subdomain === "video-next" && !hostname.startsWith("www")) {
    return "video";
  }

  // Check if pathname starts with a subdomain route prefix
  if (pathname.startsWith("/ai-automation")) {
    return "ai";
  }
  if (pathname.startsWith("/ux")) {
    return "ux";
  }
  if (pathname.startsWith("/video")) {
    return "video";
  }

  // Default to main for lunim.io, www.lunim.io, and Netlify preview URLs
  return "main";
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isEnabled: isDraft } = await draftMode();
  const headersList = await headers();
  const hostname = headersList.get("host") || "lunim.io";
  const pathname = headersList.get("x-pathname") || "/";
  const siteKey = getSiteKey(hostname, pathname);

  const client = createClient();

  let navigationMenu: any = null;
  let navigationSlices: any[] = [];
  let footerSlice: any = null;
  let footerSlices: any[] = [];

  if (siteKey === "main") {
    // Main domain: use existing singleton navigation and footer
    const primaryNav = (await (client as any)
      .getSingle("primary_navigation")
      .catch(() => null)) as Content.PrimaryNavigationDocument | null;

    navigationSlices = primaryNav?.data?.slices || [];
    navigationMenu = navigationSlices.find(
      (slice: any) => slice.slice_type === "navigation_menu"
    );

    const footer = (await (client as any)
      .getSingle("footer")
      .catch(() => null)) as Content.FooterDocument | null;

    footerSlices = footer?.data?.slices || [];
    footerSlice = footerSlices.find(
      (slice: any) => slice.slice_type === "footer"
    );
  } else {
    // Subdomain: fetch generic navigation and footer by domain
    const domainMap: Record<string, string> = {
      "ai": "ai-automation",
      "ux": "ux",
      "video": "video",
    };

    const domainValue = domainMap[siteKey];

    // Fetch navigation for subdomain
    const navDocs = await (client as any)
      .getAllByType("primary_navigation_generic")
      .catch(() => []);

    const navDoc = navDocs.find(
      (doc: any) => doc.data?.domain === domainValue
    );

    if (navDoc) {
      navigationSlices = navDoc.data?.slices || [];
      navigationMenu = navigationSlices.find(
        (slice: any) => slice.slice_type === "navigation_menu"
      );
    }

    // Fetch footer for subdomain
    const footerDocs = await (client as any)
      .getAllByType("footer_generic")
      .catch(() => []);

    const footerDoc = footerDocs.find(
      (doc: any) => doc.data?.domain === domainValue
    );

    if (footerDoc) {
      footerSlices = footerDoc.data?.slices || [];
      footerSlice = footerSlices.find(
        (slice: any) => slice.slice_type === "footer"
      );
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {!isDraft && GA_ID ? (
          <>
            {/* gtag loader */}
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            {/* init gtag */}
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  anonymize_ip: true,
                  allow_ad_personalization_signals: false
                });
              `}
            </Script>
          </>
        ) : null}
        <script
          async
          defer
          src="https://static.cdn.prismic.io/prismic.js?new=true&repo=lunim-v3"
        ></script>
      </head>
      <body className="bg-black">
        <ScrollManager />
        <Suspense fallback={null}>
          <SmoothScroll />
        </Suspense>
        <PrismicPreview repositoryName={repositoryName}>
          {navigationMenu && (
            <NavigationMenu
              slice={navigationMenu}
              index={0}
              slices={navigationSlices}
              context={{}}
            />
          )}
          <Suspense fallback={null}>
            <AnalyticsProvider disabled={isDraft || !GA_ID}>
              {children}
            </AnalyticsProvider>
          </Suspense>
          {footerSlice && (
            <Footer
              slice={footerSlice}
              index={0}
              slices={footerSlices}
              context={{}}
            />
          )}
        </PrismicPreview>
      </body>
    </html>
  );
}
