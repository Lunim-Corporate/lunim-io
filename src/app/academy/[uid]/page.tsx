// app/academy/[uid]/page.tsx
// Marketing, Engineering, Design, Filmmaking, HR
// Next
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
// Prismic
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";
import { AcademyCourseDocument } from "../../../../prismicio-types";
// Utils
import { pickBaseMetadata } from "@/utils/metadata";
// import { getCanonicalUrl } from "@/utils/getCanonical";

type Params = { uid: string };

export default async function Page({ params }: { params: Promise<Params> }) {
  const { uid } = await params;

  const client = createClient();
  const doc = await client.getByUID<AcademyCourseDocument>("academy_course", uid).catch(() => null);
  if (!doc) notFound();

  const slices = doc.data?.slices;

  return (
    <main className="bg-black text-white min-h-screen">
      <SliceZone slices={slices} components={components} />
    </main>
  );
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // fetch data
  const { uid } = await params;
  const client = createClient();
  const parentMetaData = await pickBaseMetadata(parent);
  const doc = await client
  .getByUID<AcademyCourseDocument>("academy_course", uid)
  .catch(() => null);
  if (!doc) {
    return {
      title: "Lunim Academy Course",
      description: "Welcome to Lunim's Academy Course Page."
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