import { createClient } from "@/prismicio";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PrismicRichText } from "@prismicio/react";
import { asText } from "@prismicio/helpers";

export const revalidate = 60;

/**
 * Pre-build pages for all case studies (SSG). ISR keeps it fresh.
 */
export async function generateStaticParams() {
  const client = createClient();
  const docs = await client.getAllByType("case_study").catch(() => []);
  return docs.map((d) => ({ uid: d.uid! }));
}

/**
 * (Optional) SEO – pull title from the document
 */
export async function generateMetadata({ params }: { params: { uid: string } }) {
  const client = createClient();
  const doc = await client.getByUID("case_study", params.uid).catch(() => null);
  const title = doc?.data?.hero_title?.[0]?.text || doc?.uid || "Case Study";
  return {
    title: `${title} | Lunim`,
    description: doc?.data?.challenge_content?.[0]?.text ?? "Case study by Lunim",
    openGraph: {
      title,
      description: doc?.data?.challenge_content?.[0]?.text ?? "",
      images: doc?.data?.hero_image?.url ? [{ url: doc.data.hero_image.url }] : undefined,
    },
  };
}

export default async function CaseStudyPage({ params }: { params: { uid: string } }) {
  const client = createClient();
  const doc = await client.getByUID("case_study", params.uid).catch(() => null);
  if (!doc) return notFound();

  const d = doc.data as any;

  return (
    <main className="bg-gradient-to-b from-gray-900 to-black text-white min-h-screen">
      {/* Hero */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-black">
        {d.hero_image?.url && (
          <>
            <Image
              src={d.hero_image.url}
              alt={d.hero_image.alt || ""}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
          </>
        )}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight text-white drop-shadow-lg">
            {asText(d.hero_title) || doc.uid}
          </h1>
        </div>
      </section>

      {/* Challenge */}
      <section className="py-8 bg-gray-900">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-3xl font-bold mb-8 text-[#BBFEFF]">
            {/* Rich text is fine here; it renders its own headings inside a div */}
            <PrismicRichText field={d.challenge_title} />
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 prose prose-invert max-w-none text-gray-300 text-lg leading-relaxed">
            <PrismicRichText field={d.challenge_content} />
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-8 bg-black">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-3xl font-bold mb-8 text-[#BBFEFF]">
            <PrismicRichText field={d.solution_title} />
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 prose prose-invert max-w-none text-gray-300 text-lg leading-relaxed">
            <PrismicRichText field={d.solution_content} />
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-8 bg-gray-900">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-3xl font-bold mb-8 text-[#BBFEFF]">
            <PrismicRichText field={d.impact_title} />
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 prose prose-invert max-w-none text-gray-300 text-lg leading-relaxed">
            <PrismicRichText field={d.impact_content} />
          </div>
        </div>
      </section>
    </main>
  );
}