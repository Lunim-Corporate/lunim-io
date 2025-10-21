// app/blog/[uid]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
// import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
// import { components } from "@/slices";
import type { Content } from "@prismicio/client";

type Params = { uid: string };

export default async function Page({ params }: { params: Promise<Params> }) {
  const { uid } = await params;

  const client = createClient();
  const doc = await client
    .getByUID<Content.BlogPostDocument>("blog_post", uid)
    .catch(() => null);
  if (!doc) notFound();

  const slices = doc.data.slices;

  return (
    <main className="bg-black text-white min-h-screen">
    </main>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { uid } = await params;
  const client = createClient();
  const doc = await client
    .getByUID<Content.BlogPostDocument>("blog_post", uid)
    .catch(() => null);
  if (!doc) {
    return { title: "Blog Post | Lunim" };
  }
  return {
    title: doc.data.meta_title || `${doc.uid} | Blog`,
    description: doc.data.meta_description || "Blog post by Lunim.",
  };
}

// Static generation for known UIDs (optional)
export async function generateStaticParams() {
  const client = createClient();
  const docs = await client.getAllByType<Content.BlogPostDocument>("blog_post");
  return docs.map((d) => ({ uid: d.uid! }));
}
