// Prismic
import { createClient } from "@/prismicio";
import { SliceZone } from "@prismicio/react";
import type { Content } from "@prismicio/client";
import { components } from "@/slices";
// Next
import { ResolvingMetadata } from "next";
// Utils
import { getMetaDataInfo } from "@/utils/metadata";

export const revalidate = 60;

export default async function Page() {
  const client = createClient();
  const doc = await client
    .getSingle<Content.TechDocument>("tech")
    .catch(() => null);

  if (!doc) {
    return (
      <main className="p-6 text-white bg-black">Digital Page not published.</main>
    );
  }

  return (
    <main className="bg-black">
      <SliceZone slices={doc.data.slices} components={components} />
    </main>
  );
}

export async function generateMetadata(_context: unknown, parent: ResolvingMetadata) {
  const pathname = "/digital";

  return getMetaDataInfo(pathname, parent);
  }