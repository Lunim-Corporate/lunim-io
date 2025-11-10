// Next
import { notFound } from "next/navigation";
import type { ResolvingMetadata } from "next";
// Prismic
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";
// Utils
import { getMetaDataInfo } from "@/utils/metadata";

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

export async function generateMetadata(_context: unknown, parent: ResolvingMetadata) {
  const pathname = "/blog";

  return getMetaDataInfo(pathname, parent);
  }