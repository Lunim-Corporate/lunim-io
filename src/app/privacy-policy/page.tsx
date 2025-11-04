// Prismic
import { createClient } from "@/prismicio";
import { SliceZone } from "@prismicio/react";
import type { Content } from "@prismicio/client";
import { components } from "@/slices";
// Next
import { Metadata, ResolvingMetadata } from "next";
// Utils
import { pickBaseMetadata } from "@/utils/metadata";
// import { getCanonicalUrl } from "@/utils/getCanonical";

export const revalidate = 60;

export default async function Page() {
  const client = createClient();
  const doc = await client
    .getSingle<Content.PrivacyPolicySmDocument>("privacy_policy_sm")
    .catch(() => null);

  if (!doc || !Array.isArray(doc.data.slices)) {
    return (
      <main className="p-6 text-white bg-black">
        Privacy Policy not published.
      </main>
    );
  }

  return (
    <main className="bg-[#0f172a] text-white min-h-screen p-8">
      <SliceZone slices={doc.data.slices} components={components} />
    </main>
  );
}

export async function generateMetadata(
  _context: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // fetch data
  const client = createClient();
  const parentMetaData = await pickBaseMetadata(parent);
  const doc = await client
  .getSingle<Content.PrivacyPolicySmDocument>("privacy_policy_sm")
  .catch(() => null);
  if (!doc) {
    return {
      title: "Privacy Policy | Lunim",
      description: "Welcome to Lunim's official privacy policy page."
    };
  }


  // const parentUrl = (await parent).openGraph?.images?.[0]?.url || "";
  // const parentAlt = (await parent).openGraph?.images?.[0]?.alt || "";
  const parentKeywords = parentMetaData.keywords || "";
  // Ensure each keyword is separated by a comma and space
  const keywords = doc.data?.meta_keywords.filter((val) => Boolean(val.meta_keywords_text)).length >= 1 ? `${doc.data.meta_keywords.map((k) => k.meta_keywords_text?.toLowerCase()).join(", ")}, ${parentKeywords}` : parentKeywords;
  const title = doc.data?.meta_title || parentMetaData.title;
  const description = doc.data?.meta_description || parentMetaData.description;

  const fallBackPageName = doc.uid.replace(/-/g, ' ').replace(/^./, c => c.toUpperCase());
  // const canonical = await getCanonicalUrl();

  return {
    ...parentMetaData,
    title: title,
    description: description,
    keywords: keywords, 
    openGraph: {
      ...parentMetaData.openGraph,
      title: typeof title === 'string' ? `${title}` : fallBackPageName,
      description: `${description}`,
      // url: canonical,
      // images: [
      //   {
      //     url: `${doc.data?.meta_image}` || `${parentUrl}`,
      //     alt: `${doc.data?.meta_image_alt_text}` || `${parentAlt}`,
      //   }
      // ]
    },
  }
}