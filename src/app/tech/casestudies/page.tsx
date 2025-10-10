import { createClient } from "@/prismicio";
import Link from "next/link";
import Image from "next/image";
import { asText } from "@prismicio/helpers";

export const revalidate = 60;

// Try to find a hero-like slice and return its image + title
function extractHeroFromSlices(slices: any[] | undefined) {
  if (!Array.isArray(slices)) return { img: undefined, title: undefined };
  const hero =
    slices.find((s) => s.slice_type === "compact_hero") ||
    slices.find((s) => s.slice_type === "case_study_hero") ||
    slices.find((s) => s.slice_type === "herosection");

  const p = hero?.primary ?? {};
  const img =
    p?.hero_image?.url ||
    p?.background_image?.url ||
    undefined;

  const title =
    p?.hero_title ||
    p?.hero_title_part1 ||
    undefined;

  return { img, title };
}

export default async function CaseStudiesIndex() {
  const client = createClient();
  const cases = await client.getAllByType("case_study_sm", {
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
            {cases.map((cs) => {
              const slices = (cs.data as any)?.slices;
              // Prefer top-level hero_image (if present), else look inside hero-like slices
              const fromSlices = extractHeroFromSlices(slices);
              const imageUrl =
                (cs.data as any)?.hero_image?.url || fromSlices.img;

              const titleText =
                asText((cs.data as any)?.hero_title) ||
                asText(fromSlices.title) ||
                cs.uid;

              return (
                <li
                  key={cs.id}
                  className="rounded-lg border border-white/10 overflow-hidden hover:border-cyan-400/50 transition"
                >
                  <Link href={`/tech/casestudies/${cs.uid}`} className="block">
                    {imageUrl ? (
                      <div className="relative w-full aspect-[16/9]">
                        <Image
                          src={imageUrl}
                          alt={cs.uid}
                          fill
                          className="object-cover"
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          priority={false}
                        />
                      </div>
                    ) : null}
                    <div className="p-5">
                      <h2 className="text-xl font-semibold mb-2">{titleText}</h2>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}