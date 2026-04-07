import AnalyticsProvider from "./AnalyticsProvider";
import { GA_ID } from "@/lib/gtag";
import { getLayoutContent, type SiteKey } from "@/lib/siteContent";
// React
import { Suspense } from "react";
// Next
import Script from "next/script";
import { draftMode, headers } from "next/headers";
import { Metadata } from "next";
// Prismic
import { repositoryName } from "@/prismicio";
import { PrismicPreview } from "@prismicio/next";
import NavigationMenu from "@/slices/NavigationMenu";
import Footer from "@/slices/Footer";
// Styles
import "./globals.css";
// Components
import SmoothScroll from "@/components/SmoothScroll";
import ScrollManager from "@/components/ScrollManager";

/**
 * Paths handled by plug-and-play modules that manage their own chrome.
 * When a request matches, the Prismic nav + footer are suppressed so the
 * module can render its own standalone UI.
 *
 * To add a new module: just append its base path here.
 */
const MODULE_PATHS = ["/deal-room", "/confirm-email"];

function isModulePath(pathname: string): boolean {
  return MODULE_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

const SITE_META: Record<SiteKey, { siteName: string; siteTitle: string; siteDescription: string }> = {
  ai: {
    siteName: "Lunim AI Automation",
    siteTitle: "Lunim AI Automation – AI-Powered Solutions",
    siteDescription: "Transform your business with AI automation solutions from Lunim.",
  },
  ux: {
    siteName: "Lunim UX",
    siteTitle: "Lunim UX – Human-Centered Design",
    siteDescription: "Design better product experiences with Lunim UX.",
  },
  video: {
    siteName: "Lunim Video Production",
    siteTitle: "Lunim Video Production – Professional Video Services",
    siteDescription: "Create compelling visual stories with professional video production from Lunim.",
  },
  main: {
    siteName: "Lunim",
    siteTitle: "Lunim.io – Innovative Digital Solutions",
    siteDescription: "Lunim.io creates seamless digital experiences with cutting-edge technology and design.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const siteKey = (headersList.get("x-site-key") as SiteKey) ?? "main";
  const hostname = headersList.get("host") || "lunim.io";

  const baseUrl =
    siteKey !== "main"
      ? `https://${hostname}`
      : process.env.NEXT_PUBLIC_WEBSITE_URL || "https://lunim-v3-progress.netlify.app/";

  const { siteName, siteTitle, siteDescription } = SITE_META[siteKey];

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
      images: [`${baseUrl}/assets/images/og-image.jpg`],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isEnabled: isDraft } = await draftMode();
  const headersList = await headers();
  const siteKey = (headersList.get("x-site-key") as SiteKey) ?? "main";
  const pathname = headersList.get("x-pathname") ?? "";

  // Module routes manage their own chrome — skip Prismic nav/footer entirely
  const isModule = isModulePath(pathname);

  const { navigationMenu, navigationSlices, footerSlice, footerSlices } =
    isModule
      ? { navigationMenu: null, navigationSlices: [], footerSlice: null, footerSlices: [] }
      : await getLayoutContent(siteKey);

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
        {isDraft ? (
          <script
            async
            defer
            src="https://static.cdn.prismic.io/prismic.js?new=true&repo=lunim-v3"
          ></script>
        ) : null}
      </head>
      <body className={isModule ? "" : "bg-black"}>
        {!isModule && <ScrollManager />}
        {!isModule && (
          <Suspense fallback={null}>
            <SmoothScroll />
          </Suspense>
        )}
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
