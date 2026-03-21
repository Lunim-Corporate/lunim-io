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
import { cache } from "react";

export const revalidate = 60;

const getAcademy = cache(async () => {
  const client = createClient();
  return (await (client as any)
    .getSingle("academy")
    .catch(() => null)) as Content.AcademyDocument | null;
});

export default async function Page() {
  const doc = await getAcademy();

  if (!doc || !Array.isArray(doc.data.slices)) {
    return (
      <main className="p-6 text-white bg-black">Academy page not published.</main>
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
  const parentMetaData = await pickBaseMetadata(parent);
  const doc = await getAcademy();
  if (!doc) {
    return {
      title: "Lunim",
      description: "Welcome to Lunim's official academy page."
    };
  }

  return generateMetaDataInfo(doc.data, parentMetaData, false, false, ['academy']);
}

// export async function generateMetadata(_context: unknown, parent: ResolvingMetadata) {
//   const pathname = "/academy";

//   return getMetaDataInfo(pathname, parent);
//   }