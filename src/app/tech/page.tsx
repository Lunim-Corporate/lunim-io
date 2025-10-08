import { createClient } from "@/prismicio";
import { SliceZone } from "@prismicio/react";
import { components } from "@/slices";

export const revalidate = 60;

export default async function Page() {
  const client = createClient();
  const doc = await client.getSingle("homepage").catch(() => null);

  if (!doc || !Array.isArray(doc.data.body)) {
    return (
      <main className="p-6 text-white bg-black">Tech Page not published.</main>
    );
  }

  console.log(
    "✅ Slices:",
    doc.data.body.map((s: any) => s.slice_type)
  );
  return (
    <main className="bg-black">
      <SliceZone slices={doc.data.body} components={components} />
    </main>
  );
}
