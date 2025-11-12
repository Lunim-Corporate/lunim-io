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
  // Filter out empty keyword fields
  // Ensure each keyword is separated by a comma and space
  // Join keywords from current page (if any) to parent keywords
  const keywords = docData?.meta_keywords.filter((val: any) => Boolean(val.meta_keywords_text)).length >= 1 ? `${parentKeywords}, ${docData.meta_keywords.map((k: any) => k.meta_keywords_text?.toLowerCase()).join(", ")}` : parentKeywords;
  const title = docData?.meta_title || parentMetaData.title;
  const description = docData?.meta_description || parentMetaData.description;
  const canonicalUrl = docData?.meta_url || "";
  
  let siteUrl: string | undefined;
  let uidString: string | undefined;
  let cacheToken: string | undefined;
  let imageUrl: string | undefined;
  let imageAlt: string | undefined;
    
    /* Digital or nested digital route check
    Used to conditionally add Open Graph images for these routes */
    if (isDigitalOrNestedDigitalRoute) {
        // Og Image via API route
        // Use the published site URL in production (from NEXT_PUBLIC_WEBSITE_URL),
        // and localhost during development to ensure `new URL(...)` always receives
        // a valid absolute base.
        siteUrl =
            process.env.NODE_ENV === "production"
                ? process.env.NEXT_PUBLIC_WEBSITE_URL
                : "http://localhost:3000";
        uidString = uid && uid.length ? uid.join("/") : "";
    
        // use a stable token tied to the document so image URLs change when content changes
        cacheToken = encodeURIComponent(String(Date.now()));
    
        // point metadata to the API route
        // Adding `v=` cache buster to ensure updated images are fetched when content changes
        imageUrl = new URL(`/api/og?uid=${encodeURIComponent(uidString)}&v=${cacheToken}`, siteUrl).toString();
        imageAlt = docData?.meta_image?.alt || "Lunim";
  }

  return {
    ...(parentMetaData as unknown as Metadata),
    title: title,
    description: description,
    keywords: keywords,
    openGraph: {
      ...(parentMetaData.openGraph as Metadata["openGraph"] || {}),
      // Prevents issues where title is an object (due to Next.js Metadata type)
      // Title is only an object when no title is set in Prismic and it falls back to parentMetaData.title. Title value will read [object Object] in head tag`
      title: typeof title ===  "object" ? parentMetaData.title?.absolute : `${title}`,
      description: `${description}`,
      url: isHomePage ? process.env.NEXT_PUBLIC_WEBSITE_URL : canonicalUrl,
      // Show images key for `digital/[[...uid]]` route
      // Other routes do not need this because they have an opengraph-image.tsx generating images automatically
      ...(isDigitalOrNestedDigitalRoute && {images: [{ url: imageUrl as string, alt: imageAlt as string, width: 1200, height: 630 }],})
    },
  }
}