// app/blog/authors/page.tsx
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import type { ResolvingMetadata } from "next";

import { createClient } from "@/prismicio";
import { type Content } from "@prismicio/client";
import { getMetaDataInfo } from "@/utils/metadata";

type ImageLikeField = {
  url?: string | null;
  alt?: string | null;
};

export const dynamic = "force-static";

function withFallbackAlt<T extends ImageLikeField>(
  field: T | null | undefined,
  fallback: string
): T | null | undefined {
  if (!field?.url) return field ?? null;
  const providedAlt =
    typeof field.alt === "string" ? field.alt.trim() : "";
  if (providedAlt) return field;
  const derivedAlt = fallback.trim() || "Author portrait";
  return { ...field, alt: derivedAlt } as T;
}

export default async function Page() {
  const client = createClient();

  const authors = await client.getAllByType<Content.AuthorDocument>("author", {
    orderings: [{ field: "my.author.author_name", direction: "asc" }],
  });

  return (
    <main className="bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <header className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-semibold mb-4">
            Meet Our Authors
          </h1>
          <p className="text-white/70">
            Explore articles written by our expert contributors. Browse their
            profiles to learn more and discover their latest posts.
          </p>
        </header>

        {authors.length ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {authors.map((author) => {
              const name =
                author.data.author_name?.trim() || author.uid || "Author";
              const bio = author.data.author_bio?.trim() || "";
              const imageField = withFallbackAlt(
                author.data.author_image,
                name
              );
              const placeholderInitial =
                name && name.length > 0 ? name.charAt(0).toUpperCase() : "A";

              return (
                <article
                  key={author.id}
                  className="flex flex-col border border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors overflow-hidden"
                >
                  {imageField?.url ? (
                    <PrismicNextImage
                      field={imageField}
                      className="w-full h-56 object-cover"
                    />
                  ) : (
                    <div className="w-full h-56 bg-white/10 flex items-center justify-center text-white/40 text-xl">
                      {placeholderInitial}
                    </div>
                  )}

                  <div className="flex flex-col flex-1 p-6 gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold mb-2">{name}</h2>
                      {bio ? (
                        <p className="text-white/70 line-clamp-4">{bio}</p>
                      ) : null}
                    </div>

                    <div className="mt-auto">
                      <PrismicNextLink
                        document={author}
                        className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-cyan-300 text-black font-semibold hover:bg-cyan-200 transition-colors"
                      >
                        View profile
                      </PrismicNextLink>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="border border-white/10 rounded-2xl p-10 text-center text-white/70">
            No authors found. Check back soon for new contributors.
          </div>
        )}
      </div>
    </main>
  );
}

export async function generateMetadata(_context: unknown, parent: ResolvingMetadata) {
  const pathname = "/blog/authors";

  return getMetaDataInfo(pathname, parent);
  }