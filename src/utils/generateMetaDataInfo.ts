import type { Metadata } from "next";
import { pickBaseMetadata } from "./metadata";

export const generateMetaDataInfo = (
  docData: Record<string, any>,
  parentMetaData: Awaited<ReturnType<typeof pickBaseMetadata>>,
  isHomePage: boolean = false,
  isDigitalOrNestedDigitalRoute: boolean = false,
  uid: string[] | null = []
): Metadata => {
  const parentKeywords = (parentMetaData as any).keywords || "";

  // Build keywords safely (handle missing/invalid arrays)
  const pageKeywords = Array.isArray(docData?.meta_keywords)
    ? docData.meta_keywords.map((k: any) => k.meta_keywords_text?.toLowerCase()).filter(Boolean)
    : [];
  const keywords = pageKeywords.length ? `${parentKeywords}, ${pageKeywords.join(", ")}` : parentKeywords;

  const title = docData?.meta_title || parentMetaData.title;
  const description = docData?.meta_description || parentMetaData.description;
  const canonicalUrl = docData?.meta_url || "";

  // Helpers
  const getSiteUrl = () => {
    return process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_WEBSITE_URL
      : "http://localhost:3000";
  };

  const getImageAlt = () => {
    return docData?.meta_image?.alt || docData?.meta_image_alt_text || "Lunim";
  };

  const normalizePath = (path: string) => {
    if (!path) return "/";
    // If path is an absolute URL, extract pathname
    try {
      const parsed = new URL(path, getSiteUrl());
      return parsed.pathname || "/";
    } catch {
      return path.startsWith("/") ? path : `/${path}`;
    }
  };

  // Build canonical site base and cache token
  const siteBase = getSiteUrl();
  const cacheToken = encodeURIComponent(String(Date.now()));

  // imageEntry will be set when we can determine an image URL
  let imageUrl: string | undefined;
  let imageAlt: string | undefined;

  if (isDigitalOrNestedDigitalRoute) {
    const uidString = uid && uid.length ? uid.join("/") : "";
    imageUrl = new URL(`/api/og?uid=${encodeURIComponent(uidString)}&v=${cacheToken}`, siteBase).toString();
    imageAlt = getImageAlt();
  } else {
    // Non-digital routes: point to the route's `opengraph-image` endpoint
    let routePath = "/";
    if (canonicalUrl && canonicalUrl.trim() !== "") {
      routePath = normalizePath(canonicalUrl);
    } else if (uid && Array.isArray(uid) && uid.length) {
      routePath = `/${uid.join("/")}`;
    } else if (isHomePage) {
      routePath = "/";
    }

    // Normalize trailing slash (keep root as '/')
    if (routePath !== "/") {
      while (routePath.length > 1 && routePath.endsWith("/")) {
        routePath = routePath.slice(0, -1);
      }
    }

    const imageEndpoint = routePath === "/" ? `/opengraph-image?v=${cacheToken}` : `${routePath}/opengraph-image?v=${cacheToken}`;
    imageUrl = new URL(imageEndpoint, siteBase).toString();
    imageAlt = getImageAlt();
  }

  const imagesEntry = imageUrl
    ? [{ url: imageUrl as string, alt: (imageAlt as string) || "Lunim", width: 1200, height: 630 }]
    : undefined;

  return {
    ...(parentMetaData as unknown as Metadata),
    title: title,
    description: description,
    keywords: keywords,
    openGraph: {
      ...(parentMetaData.openGraph as Metadata["openGraph"] || {}),
      // Title is only an object when no title is set in Prismic and therefore falls back to parentMetaData.title (reads [object Object] in head tag`
      title: typeof title === "object" ? parentMetaData.title?.absolute : `${title}`,
      description: `${description}`,
      url: isHomePage ? process.env.NEXT_PUBLIC_WEBSITE_URL : canonicalUrl,
      ...(imagesEntry && { images: imagesEntry }),
    },
  };
}