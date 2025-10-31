// src/app/blog/page.tsx
// Next
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
// Prismic
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";
// Utils
import { pickBaseMetadata } from "@/utils/metadata";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
  const client = createClient();

  const doc = await client.getSingle("blog_home_page").catch(() => null);
  if (!doc) return notFound();

  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return (
    <main className="bg-black min-h-screen">
      <SliceZone
        slices={doc.data.slices}
        components={components}
        context={{ searchParams: resolvedSearchParams }}
      />
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
  .getSingle("blog_home_page")
  .catch(() => null);
  if (!doc) {
    return {
      title: "Lunim Blog Page",
      description: "Welcome to Lunim's official blog page."
    };
  }

  // const parentUrl = (await parent).openGraph?.images?.[0]?.url || "";
  // const parentAlt = (await parent).openGraph?.images?.[0]?.alt || "";
  const parentKeywords = parentMetaData.keywords || "";
  const keywords = doc.data?.meta_keywords.filter((val) => Boolean(val.meta_keywords_text)).length >= 1 ? `${doc.data.meta_keywords.map((k) => k.meta_keywords_text?.toLowerCase()).join(", ")}, ${parentKeywords}` : parentKeywords;
  const title = doc.data?.meta_title || parentMetaData.title;
  const description = doc.data?.meta_description || parentMetaData.description;

  const fallBackPageName = doc.uid.replace(/-/g, ' ').replace(/^./, c => c.toUpperCase());

  return {
    ...parentMetaData,
    title: title,
    description: description,
    keywords: keywords, 
    openGraph: {
      ...parentMetaData.openGraph,
      title: typeof title === 'string' ? `${title}` : fallBackPageName,
      description: `${description}`,
      // images: [
      //   {
      //     url: `${doc.data?.meta_image}` || `${parentUrl}`,
      //     alt: `${doc.data?.meta_image_alt_text}` || `${parentAlt}`,
      //   }
      // ]
    },
  }
}