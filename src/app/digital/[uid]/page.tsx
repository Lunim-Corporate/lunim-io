// digital/[uid]/page.tsx
// Discovery, User Experience, AI Workflows, Web3 & Decentralisation
// Next
import { notFound } from "next/navigation";
import type { Metadata } from "next";
// Prismic
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";
import { DigitalPageDocument } from "../../../../prismicio-types";

type Params = { uid: string };

export default async function Page({ params }: { params: Promise<Params> }) {
  const { uid } = await params;

  const client = createClient();
  const doc = await client.getByUID<DigitalPageDocument>("digital_page", uid).catch(() => null);
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
  const doc = await client.getByUID<DigitalPageDocument>("digital_page", uid).catch(() => null);
  if (!doc) {
    return { title: "Digital Page | Lunim" };
  }

  const docName = doc.uid[0].toUpperCase() + doc.uid.slice(1);

  return {
    title: doc.data.meta_title || `${docName} | Digital Page`,
    description: doc.data.meta_description || "A digital page by Lunim.",
  };
}