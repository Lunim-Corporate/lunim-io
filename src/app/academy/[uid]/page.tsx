// app/academy/[uid]/page.tsx
// Marketing, Engineering, Design, Filmmaking, HR
// Next
import { notFound } from "next/navigation";
import type { Metadata } from "next";
// Prismic
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";
import { AcademyCourseDocument } from "../../../../prismicio-types";

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

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { uid } = await params;
  const client = createClient();
  const doc = await client.getByUID<AcademyCourseDocument>("academy_course", uid).catch(() => null);
  if (!doc) {
    return { title: "Academy Course | Lunim" };
  }

  return {
    title: doc.data.meta_title || `${doc.uid} | Academy Course`,
    description: doc.data.meta_description || "An academy course by Lunim.",
  };
}