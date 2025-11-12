import type { Metadata } from "next";
import { pickBaseMetadata } from "./metadata";

export const generateMetaDataInfo = (
  docData: Record<string, any>,
  parentMetaData: Awaited<ReturnType<typeof pickBaseMetadata>>,
  isHomePage: boolean = false,
): Metadata => {
    const parentKeywords = parentMetaData.keywords || "";
  // Filter out empty keyword fields
  // Ensure each keyword is separated by a comma and space
  // Join keywords from current page (if any) to parent keywords
  const keywords = docData?.meta_keywords.filter((val: any) => Boolean(val.meta_keywords_text)).length >= 1 ? `${parentKeywords}, ${docData.meta_keywords.map((k: any) => k.meta_keywords_text?.toLowerCase()).join(", ")}` : parentKeywords;
  const title = docData?.meta_title || parentMetaData.title;
  const description = docData?.meta_description || parentMetaData.description;
  const canonicalUrl = docData?.meta_url || "";

  return {
    ...parentMetaData,
    title: title,
    description: description,
    keywords: keywords,
    openGraph: {
      ...parentMetaData.openGraph,
      // Prevents issues where title is an object (due to Next.js Metadata type)
      // Title is only an object when no title is set in Prismic and it falls back to parentMetaData.title. Title value will read [object Object] in head tag`
      title: typeof title ===  "object" ? parentMetaData.title?.absolute : `${title}`,
      description: `${description}`,
      url: isHomePage ? process.env.NEXT_PUBLIC_WEBSITE_URL : canonicalUrl,
    },
  }
}