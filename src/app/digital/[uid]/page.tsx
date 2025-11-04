// digital/[uid]/page.tsx
// Discovery, User Experience, AI Workflows, Web3 & Decentralisation
// Next
import { notFound } from "next/navigation";
import type { ResolvingMetadata } from "next";
// Prismic
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";
import { DigitalPageDocument } from "../../../../prismicio-types";
// Utils
import { getMetaDataInfo } from "@/utils/metadata";

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

export async function generateMetadata({ params }: { params: Promise<Params> }, parent: ResolvingMetadata) {
  const pathname = "/digital/[uid]";
  const { uid } = await params; 

  return getMetaDataInfo(pathname, parent, uid);
  }