// Prismic
import { createClient } from "@/prismicio";
import { SliceZone } from "@prismicio/react";
import type { Content } from "@prismicio/client";
import { components } from "@/slices";
// Next
import { Metadata, ResolvingMetadata } from "next";
// Utils
import { pickBaseMetadata } from "@/utils/metadata";
import { generateMetaDataInfo } from "@/utils/generateMetaDataInfo";

export const revalidate = 60;

export default async function Page() {
  const client = createClient();
  const doc = (await (client as any)
    .getSingle("tabb")
    .catch(() => null)) as Content.TabbDocument | null;

  if (!doc || !Array.isArray(doc.data.slices)) {
    return (
      <main className="p-6 text-white bg-black">Tabb page not published.</main>
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

export async function generateMetadata(
  _context: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // fetch data
  const client = createClient();
  const parentMetaData = await pickBaseMetadata(parent);
  const doc = (await (client as any)
  .getSingle("tabb")
  .catch(() => null)) as any;
  if (!doc) {
    return {
      title: "Lunim Home Page",
      description: "Welcome to Lunim's official homepage."
    };
  }

  return generateMetaDataInfo(doc.data, parentMetaData, false, false, ['tabb']);
}

// export async function generateMetadata(_context: unknown, parent: ResolvingMetadata) {
//   const pathname = "/tabb";

//   return getMetaDataInfo(pathname, parent);
//   }