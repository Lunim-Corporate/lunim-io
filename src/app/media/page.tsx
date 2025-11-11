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
  const doc = (await (client as any)
    .getSingle("film")
    .catch(() => null)) as Content.FilmDocument | null;

  if (!doc || !Array.isArray(doc.data.slices)) {
    return (
      <main className="p-6 text-white bg-black">Media page not published.</main>
    );
  }

  // console.log(
  //   "✅ Slices:",
  //   doc.data.slices.map((slice) => slice.slice_type)
  // );
  return (
    <main className="bg-black">
      <SliceZone slices={doc.data.slices} components={components} />
    </main>
  );
}


export async function generateMetadata(_context: unknown, parent: ResolvingMetadata) {
  const pathname = "/media";

  return getMetaDataInfo(pathname, parent);
  }