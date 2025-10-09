import { createClient } from "@/prismicio";
import { SliceZone } from "@prismicio/react";
import type { Content } from "@prismicio/client";
import { components } from "@/slices";

export const revalidate = 60;

export default async function Page() {
  const client = createClient();
  const doc = await client
    .getSingle<Content.MainpageDocument>("mainpage")
    .catch(() => null);
  console.log("✅ Document:", doc);
  if (!doc || !Array.isArray(doc.data.slices)) {
    return (
      <main className="p-6 text-white bg-black">Homepage not published.</main>
    );
  }

  console.log(
    "✅ Slices:",
    doc.data.slices.map((slice) => slice.slice_type)
  );
  return (
    <main className="bg-black">
      <SliceZone slices={doc.data.slices} components={components} />
    </main>
  );
}
