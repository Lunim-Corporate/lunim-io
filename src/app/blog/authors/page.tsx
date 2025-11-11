// app/blog/authors/page.tsx
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import type { Metadata, ResolvingMetadata } from "next";

import { createClient } from "@/prismicio";
import { type Content } from "@prismicio/client";
import { pickBaseMetadata } from "@/utils/metadata";

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

  const authors = (await (client as any).getAllByType("author", {
    orderings: [{ field: "my.author.author_name", direction: "asc" }],
  })) as Content.AuthorDocument[];

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
            {authors.map((author: Content.AuthorDocument) => {
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

export async function generateMetadata(
  _context: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // fetch data
  const client = createClient();
  const parentMetaData = await pickBaseMetadata(parent);
  const doc = await client
  .getSingle<Content.AuthorsDocument>("authors")
  .catch(() => null);
  if (!doc) {
    return {
      title: "Lunim",
      description: "Welcome to Lunim's official authors page."
    };
  }


  // const parentUrl = (await parent).openGraph?.images?.[0]?.url || "";
  // const parentAlt = (await parent).openGraph?.images?.[0]?.alt || "";
  const parentKeywords = parentMetaData.keywords || "";
  // Filter out empty keyword fields
  // Ensure each keyword is separated by a comma and space
  // Join keywords from current page (if any) to parent keywords
  const keywords = doc.data?.meta_keywords.filter((val) => Boolean(val.meta_keywords_text)).length >= 1 ? `${parentKeywords}, ${doc.data.meta_keywords.map((k) => k.meta_keywords_text?.toLowerCase()).join(", ")}` : parentKeywords;
  const title = doc.data?.meta_title || parentMetaData.title;
  const description = doc.data?.meta_description || parentMetaData.description;
  const canonicalUrl = doc.data?.meta_url || "";

  return {
    ...parentMetaData,
    title: title,
    description: description,
    keywords: keywords,
    openGraph: {
      ...parentMetaData.openGraph,
      title: typeof title ===  "object" ? parentMetaData.title?.absolute : `${title}`,
      description: `${description}`,
      url: canonicalUrl,
      // images: [
      //   {
      //     url: `${doc.data?.meta_image}` || `${parentUrl}`,
      //     alt: `${doc.data?.meta_image_alt_text}` || `${parentAlt}`,
      //   }
      // ]
    },
  }
}

// export async function generateMetadata(_context: unknown, parent: ResolvingMetadata) {
//   const pathname = "/blog/authors";

//   return getMetaDataInfo(pathname, parent);
//   }