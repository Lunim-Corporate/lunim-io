import { createClient } from "../../prismicio";
import { SliceZone } from "@prismicio/react";
import { components } from "@lunim/ui/slices";
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
import { generateMetaDataInfo } from "@lunim/utils";
import { pickBaseMetadata } from "@lunim/utils";

export default async function VideoPage() {
  const client = createClient();
  const doc = await client.getSingle("video").catch(() => null);

  if (!doc) {
    notFound();
  }

  return (
    <main className="bg-black">
      <SliceZone slices={doc.data.slices} components={components} />
    </main>
  );
}

export async function generateMetadata(
  _context: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const client = createClient();
  const parentMetaData = await pickBaseMetadata(parent);
  const doc = await client.getSingle("video").catch(() => null);

  if (!doc) {
    return {
      title: "Video Production",
      description: "Professional video production services from Lunim.",
    };
  }

  return generateMetaDataInfo(doc.data, parentMetaData, true);
}
