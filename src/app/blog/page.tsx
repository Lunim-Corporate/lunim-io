// src/app/blog/page.tsx
import { notFound } from "next/navigation";
import { SliceZone } from "@prismicio/react";
import type { Metadata } from "next";

import { createClient } from "@/prismicio";
import { components } from "@/slices";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
  const client = createClient();

  const doc = await client.getSingle("blog_home_page").catch(() => null);
  if (!doc) return notFound();

  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return (
    <main className="bg-black min-h-screen">
      <SliceZone
        slices={doc.data.slices}
        components={components}
        context={{ searchParams: resolvedSearchParams }}
      />
    </main>
  );
}
 
export async function generateMetadata(): Promise<Metadata> {
  const client = createClient();
  const doc = await client.getSingle("blog_home_page").catch(() => null);
  if (!doc) return {};

  const title =
    (doc.data as { meta_title?: string }).meta_title || "Blog | Lunim";
  const description =
    (doc.data as { meta_description?: string }).meta_description ||
    "Articles from Lunim.";

  return { title, description };
}
