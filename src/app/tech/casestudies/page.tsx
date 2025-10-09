import { createClient } from "@/prismicio";
import Link from "next/link";
import Image from "next/image";
import { asText } from "@prismicio/helpers";

export const revalidate = 60;

export default async function CaseStudiesIndex() {
  const client = createClient();
  const cases = await client.getAllByType("case_study", {
    orderings: [{ field: "document.first_publication_date", direction: "desc" }],
  });

  return (
    <main className="bg-black min-h-screen text-white">
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-8">Case Studies</h1>

        {cases.length === 0 ? (
          <p className="text-gray-400">No case studies yet.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {cases.map((cs) => (
              <li key={cs.id} className="rounded-lg border border-white/10 overflow-hidden hover:border-cyan-400/50 transition">
                <Link href={`/tech/casestudies/${cs.uid}`} className="block">
                  {cs.data.hero_image?.url ? (
                    <div className="relative w-full aspect-[16/9]">
                      <Image
                        src={cs.data.hero_image.url}
                        alt={cs.data.hero_image.alt || cs.uid}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="p-5">
                    <h2 className="text-xl font-semibold mb-2">
                      {asText(cs.data.hero_title) ?? cs.uid}
                    </h2>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}