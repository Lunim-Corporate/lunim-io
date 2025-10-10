// app/tech/casestudies/[uid]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

type Params = { uid: string };

// Next 15: params is a Promise
export default async function Page({ params }: { params: Promise<Params> }) {
  const { uid } = await params;

  const client = createClient();
  const doc = await client.getByUID("case_study_sm", uid).catch(() => null);
  if (!doc) notFound();

  const slices: any[] = (doc.data as any).slices ?? [];

  return (
    <main className="bg-black text-white min-h-screen">
      <SliceZone slices={slices} components={components} />
    </main>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { uid } = await params;
  const client = createClient();
  const doc = await client.getByUID("case_study_sm", uid).catch(() => null);
  if (!doc) {
    return { title: "Case Study | Lunim" };
  }
  return {
    title: (doc.data as any).meta_title || `${doc.uid} | Case Study`,
    description: (doc.data as any).meta_description || "Project case study by Lunim.",
  };
}

// Static generation for known UIDs (optional)
export async function generateStaticParams() {
  const client = createClient();
  const docs = await client.getAllByType("case_study_sm");
  return docs.map((d) => ({ uid: d.uid! }));
}
