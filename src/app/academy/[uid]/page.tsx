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
import { Content } from "@prismicio/client";

type Params = { uid: string };

export default async function Page({ params }: { params: Promise<Params> }) {
  const { uid } = await params;

  const client = createClient();
  const doc = (await (client as any).getByUID("academy_course", uid).catch(() => null)) as AcademyCourseDocument | null;
  if (!doc) notFound();

  const slices = doc.data?.slices;

  return (
    <main className="bg-black text-white min-h-screen">
      <SliceZone slices={slices} components={components} />
    </main>
  );
}


export async function generateStaticParams() {
  const client = createClient();
  const docs = (await client.getAllByType('academy_course')) as unknown as AcademyCourseDocument[];
  return docs.map((d: AcademyCourseDocument) => ({ uid: d.uid! }));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // fetch data
  const client = createClient();
  const parentMetaData = await pickBaseMetadata(parent);
  const { uid } = await params;
  const doc = (await (client as any)
  .getByUID("academy_course", uid)
  .catch(() => null)) as AcademyCourseDocument | null;
  if (!doc) {
    return {
      title: "Lunim",
      description: "Welcome to Lunim's official academy course page."
    };
  }

  // const parentUrl = (await parent).openGraph?.images?.[0]?.url || "";
  // const parentAlt = (await parent).openGraph?.images?.[0]?.alt || "";
  const parentKeywords = parentMetaData.keywords || "";
  // Filter out empty keyword fields
  // Ensure each keyword is separated by a comma and space
  // Join keywords from current page (if any) to parent keywords
  const keywords = doc.data?.meta_keywords.filter((val: any) => Boolean(val.meta_keywords_text)).length >= 1 ? `${parentKeywords}, ${doc.data.meta_keywords.map((k: any) => k.meta_keywords_text?.toLowerCase()).join(", ")}` : parentKeywords;
  const title = doc.data?.meta_title || parentMetaData.title;
  const description = doc.data?.meta_description || parentMetaData.description;
  const canonicalUrl = doc.data?.meta_url || "";

  return {
    ...parentMetaData,
    title: title,
    description: description,
    keywords: keywords,
    openGraph: {
      ...parentMetaData.openGraph,
      title: typeof title ===  "object" ? parentMetaData.title?.absolute : `${title}`,
      description: `${description}`,
      url: canonicalUrl,
      // images: [
      //   {
      //     url: `${doc.data?.meta_image}` || `${parentUrl}`,
      //     alt: `${doc.data?.meta_image_alt_text}` || `${parentAlt}`,
      //   }
      // ]
    },
  }
}

// export async function generateMetadata({ params }: { params: Promise<Params> }, parent: ResolvingMetadata) {
//   const pathname = "/academy/[uid]";
//   const { uid } = await params; 

//   return getMetaDataInfo(pathname, parent, uid);
// }