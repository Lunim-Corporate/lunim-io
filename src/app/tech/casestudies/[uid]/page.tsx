import { createClient } from "@/prismicio";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PrismicRichText } from "@prismicio/react";
import { asText } from "@prismicio/helpers";
import type { Content } from "@prismicio/client";

export const revalidate = 60;

/**
 * Pre-build pages for all case studies (SSG). ISR keeps it fresh.
 */
export async function generateStaticParams() {
  const client = createClient();
  const docs = await client
    .getAllByType<Content.CaseStudyDocument>("case_study")
    .catch(() => [] as Content.CaseStudyDocument[]);
  return docs.map((d) => ({ uid: d.uid! }));
}

/**
 * (Optional) SEO – pull title from the document
 */
export async function generateMetadata({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  const client = createClient();
  const doc = await client
    .getByUID<Content.CaseStudyDocument>("case_study", uid)
    .catch(() => null);
  const title = asText(doc?.data?.hero_title) || doc?.uid || "Case Study";
  return {
    title: `${title} | Lunim`,
    description: asText(doc?.data?.challenge_content) ?? "Case study by Lunim",
    openGraph: {
      title,
      description: asText(doc?.data?.challenge_content) ?? "",
      images: doc?.data?.hero_image?.url ? [{ url: doc.data.hero_image.url }] : undefined,
    },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ uid: string }> }) {
  const client = createClient();
  const { uid } = await params;
  const doc = await client
    .getByUID<Content.CaseStudyDocument>("case_study", uid)
    .catch(() => null);
  if (!doc) return notFound();

  const data = doc.data;

  return (
    <main className="bg-gradient-to-b from-gray-900 to-black text-white min-h-screen">
      {/* Hero */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-black">
        {data.hero_image?.url && (
          <>
            <Image
              src={data.hero_image.url}
              alt={data.hero_image.alt || ""}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
          </>
        )}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight text-white drop-shadow-lg">
            {asText(data.hero_title) || doc.uid}
          </h1>
        </div>
      </section>

      {/* Challenge */}
      <section className="py-8 bg-gray-900">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-3xl font-bold mb-8 text-[#BBFEFF]">
            {/* Rich text is fine here; it renders its own headings inside a div */}
            <PrismicRichText field={data.challenge_title} />
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 prose prose-invert max-w-none text-gray-300 text-lg leading-relaxed">
            <PrismicRichText field={data.challenge_content} />
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-8 bg-black">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-3xl font-bold mb-8 text-[#BBFEFF]">
            <PrismicRichText field={data.solution_title} />
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 prose prose-invert max-w-none text-gray-300 text-lg leading-relaxed">
            <PrismicRichText field={data.solution_content} />
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-8 bg-gray-900">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-3xl font-bold mb-8 text-[#BBFEFF]">
            <PrismicRichText field={data.impact_title} />
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 prose prose-invert max-w-none text-gray-300 text-lg leading-relaxed">
            <PrismicRichText field={data.impact_content} />
          </div>
        </div>
      </section>
    </main>
  );
}
