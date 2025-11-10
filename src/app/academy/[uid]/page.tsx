// app/academy/[uid]/page.tsx
// Marketing, Engineering, Design, Filmmaking, HR
// Next
import { notFound } from "next/navigation";
import type { ResolvingMetadata } from "next";
// Prismic
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";
import { AcademyCourseDocument } from "../../../../prismicio-types";
// Utils
import { getMetaDataInfo } from "@/utils/metadata";

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

export async function generateMetadata({ params }: { params: Promise<Params> }, parent: ResolvingMetadata) {
  const pathname = "/academy/[uid]";
  const { uid } = await params; 

  return getMetaDataInfo(pathname, parent, uid);
}
  
export async function generateStaticParams() {
  const client = createClient();
  const docs = await client.getAllByType('academy_course');
  return docs.map(d => ({ uid: d.uid }));
}