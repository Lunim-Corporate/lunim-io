import { createClient } from "@/prismicio";
import { SliceZone } from "@prismicio/react";
import type { Content } from "@prismicio/client";
import { components } from "@/slices";
import { Metadata } from "next";

export const revalidate = 60;

export default async function Page() {
  const client = createClient();
  const doc = await client
    .getSingle<Content.FilmDocument>("film")
    .catch(() => null);

  if (!doc || !Array.isArray(doc.data.slices)) {
    return (
      <main className="p-6 text-white bg-black">Film page not published.</main>
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


export async function generateMetadata(): Promise<Metadata> {
  // fetch data
  const client = createClient();
  const doc = await client
  .getSingle<Content.FilmDocument>("film")
  .catch(() => null);
  if (!doc) {
    return {
      title: "Lunim Home Page",
      description: "Welcome to Lunim's official homepage."
    };
  }
  return {
    title: doc.data.meta_title,
    description: doc.data.meta_description,
    // openGraph: {},
  }
}