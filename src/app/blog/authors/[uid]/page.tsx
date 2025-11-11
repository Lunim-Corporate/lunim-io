// app/blog/authors/[uid]/page.tsx
// Next
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
// Prismic
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { createClient } from "@/prismicio";
import { asText, isFilled } from "@prismicio/helpers";
import type { Content } from "@prismicio/client";
import type { LinkField } from "@prismicio/types";
import * as prismic from "@prismicio/client";
// Utils
import { calculateReadingTime } from "@/utils/calcReadingTime";
import { formatDate } from "@/utils/formatDate";
import { pickBaseMetadata } from "@/utils/metadata";

type Params = { uid: string };

type PageProps = {
  params: Promise<Params>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type ImageLikeField = {
  url?: string | null;
  alt?: string | null;
};

function withFallbackAlt<T extends ImageLikeField>(
  field: T | null | undefined,
  fallback: string
): T | null | undefined {
  if (!field?.url) return field ?? null;
  const providedAlt =
    typeof field.alt === "string" ? field.alt.trim() : "";
  if (providedAlt) return field;
  const derivedAlt = fallback.trim() || "Image";
  return { ...field, alt: derivedAlt } as T;
}

function getFirstParam(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function normalizeCategory(value: string): string {
  return value.trim().toLowerCase();
}

function extractCategoryText(
  field: Content.BlogPostDocumentData["category"]
): string {
  if (!field) return "";
  return asText(field).trim();
}

function resolveSocialLabel(link: LinkField | null | undefined): string {
  if (!link) return "View profile";
  const rawText =
    typeof (link as { text?: unknown }).text === "string"
      ? ((link as { text?: string }).text ?? "")
      : "";
  if (rawText) {
    const trimmedText = rawText.trim();
    if (trimmedText) return trimmedText;
  }
  if ("url" in link && typeof link.url === "string" && link.url) {
    try {
      const url = new URL(link.url);
      return url.hostname.replace(/^www\./, "");
    } catch {
      return link.url;
    }
  }
  if ("target" in link && link.target) return link.target;
  return "View profile";
}

function BlogCard({ doc }: { doc: Content.BlogPostDocument }) {
  const data = doc.data;
  const title = asText(data.blog_article_heading) || doc.uid || "Untitled";
  const articleImage = withFallbackAlt(
    data.article_main_image,
    `${title} cover`
  );
  const authorInfo = data.author_info;
  const authorData =
    authorInfo && typeof authorInfo === "object" && "data" in authorInfo
      ? (authorInfo.data as Content.AuthorDocumentData | null)
      : null;
  const authorName =
    authorData?.author_name?.trim() ||
    (authorInfo &&
    typeof authorInfo === "object" &&
    "uid" in authorInfo &&
    authorInfo.uid
      ? authorInfo.uid
      : "");
  const authorImage =
    withFallbackAlt(authorData?.author_image ?? null, authorName || title) ??
    null;
  const readingTime = calculateReadingTime(data.main_article_content);

  return (
    <PrismicNextLink
      document={doc}
      className="block rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
    >
      {articleImage?.url ? (
        <PrismicNextImage
          field={articleImage}
          className="w-full h-48 object-cover"
        />
      ) : null}
      <div className="p-5">
        <h3 className="text-white text-xl font-semibold mb-2">{title}</h3>

        <div className="flex flex-wrap gap-3 text-sm text-gray-300 mb-4">
          {data.publication_date ? (
            <time dateTime={data.publication_date}>
              {formatDate(data.publication_date)}
            </time>
          ) : null}
          {data.category ? <span>• {asText(data.category)}</span> : null}
          {readingTime ? (
            <span>
              • {readingTime >= 10 ? `${readingTime}+` : readingTime} min read
            </span>
          ) : null}
        </div>

        {authorName || authorImage?.url ? (
          <div className="flex items-center gap-3 mb-4">
            {authorImage?.url ? (
              <PrismicNextImage
                field={authorImage}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : null}
            {authorName ? (
              <span className="text-white/90 text-sm">{authorName}</span>
            ) : null}
          </div>
        ) : null}
      </div>
    </PrismicNextLink>
  );
}

export default async function Page({ params, searchParams }: PageProps) {
  const { uid } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const client = createClient();

  const authorDoc = (await (client as any)
    .getByUID("author", uid)
    .catch(() => null)) as Content.AuthorDocument | null;
  if (!authorDoc) notFound();

  const authorName =
    authorDoc.data.author_name?.trim() || authorDoc.uid || "Author";
  const authorBio = authorDoc.data.author_bio?.trim() || "";
  const authorImage = withFallbackAlt(
    authorDoc.data.author_image,
    `${authorName} portrait`
  );

  const socialLinks = authorDoc.data.social_media || [];

  const authorPosts = (await (client as any).getAllByType(
    "blog_post",
    {
      // Use runtime filter to avoid TS import issues across CLI versions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filters: [((prismic as any).filter?.at ?? ((f: string, v: unknown) => ({}) ) )("my.blog_post.author_info", authorDoc.id)],
      orderings: [
        { field: "my.blog_post.publication_date", direction: "desc" },
      ],
      fetchLinks: ["author.author_name", "author.author_image"],
    }
  )) as Content.BlogPostDocument[];

  const pageSize = 12;
  const rawPage = getFirstParam(resolvedSearchParams?.page);
  const rawCategory = getFirstParam(resolvedSearchParams?.cat);
  const requestedPageNumber = Number(rawPage ?? "1");
  const currentPage =
    Number.isFinite(requestedPageNumber) && requestedPageNumber > 0
      ? requestedPageNumber
      : 1;

  const categoriesMap = new Map<string, string>();
  for (const post of authorPosts) {
    const rawCategory = extractCategoryText(post.data.category);
    const normalized = normalizeCategory(rawCategory);
    if (normalized && !categoriesMap.has(normalized)) {
      categoriesMap.set(normalized, rawCategory);
    }
  }
  const categories = Array.from(categoriesMap.entries()).sort(([, a], [, b]) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );

  const requestedCategoryRaw = rawCategory ?? "";
  const normalizedRequested = normalizeCategory(requestedCategoryRaw);
  const filterExists = normalizedRequested
    ? categoriesMap.has(normalizedRequested)
    : false;

  const effectiveFilter = filterExists ? normalizedRequested : "";

  const filteredPosts = effectiveFilter
    ? authorPosts.filter((post: Content.BlogPostDocument) =>
        normalizeCategory(extractCategoryText(post.data.category)) ===
        effectiveFilter
      )
    : authorPosts;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPosts.length / pageSize) || 1
  );

  const pageStart = (currentPage - 1) * pageSize;
  const visiblePosts = filteredPosts.slice(pageStart, pageStart + pageSize);

  const buildQueryString = (params: {
    page?: number;
    cat?: string | undefined;
  }): string => {
    const usp = new URLSearchParams();
    if (params.cat) usp.set("cat", params.cat);
    if (typeof params.page === "number") usp.set("page", String(params.page));
    const result = usp.toString();
    return result ? `?${result}` : "";
  };

  const prevHref =
    currentPage > 1
      ? buildQueryString({
          page: currentPage - 1,
          cat: effectiveFilter || undefined,
        })
      : null;

  const nextHref =
    currentPage < totalPages
      ? buildQueryString({
          page: currentPage + 1,
          cat: effectiveFilter || undefined,
        })
      : null;

  return (
    <main className="bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <section className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-16">
          {authorImage?.url ? (
            <PrismicNextImage
              field={authorImage}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border border-white/20"
            />
          ) : null}
          <div>
            <h1 className="text-4xl font-semibold mb-3">{authorName}</h1>
            {authorBio ? (
              <p className="text-white/70 max-w-2xl">{authorBio}</p>
            ) : null}
            {socialLinks.length ? (
              <div className="flex flex-wrap items-center gap-3 mt-5">
                {socialLinks.map((item: { social_link?: LinkField | null }, index: number) => {
                  const link = item?.social_link;
                  if (!isFilled.link(link)) return null;
                  return (
                    <PrismicNextLink
                      key={`social-${index}`}
                      field={link}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-sm text-white/80 hover:text-white hover:border-white/40 transition-colors"
                      target={
                        "target" in link && link.target ? link.target : undefined
                      }
                    >
                      {resolveSocialLabel(link)}
                    </PrismicNextLink>
                  );
                })}
              </div>
            ) : null}
          </div>
        </section>

        <section>
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
            <div>
              <h2 className="text-3xl font-bold">Articles by {authorName}</h2>
              <p className="text-white/60">
                {filteredPosts.length}{" "}
                {filteredPosts.length === 1 ? "article" : "articles"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={buildQueryString({ page: 1 })}
                className={`px-3 py-1 rounded-full text-sm border ${
                  !effectiveFilter
                    ? "bg-cyan-300 text-black border-cyan-300"
                    : "border-white/20 text-white/80 hover:text-white"
                }`}
              >
                All
              </a>
              {categories.map(([slug, label]) => (
                <a
                  key={slug}
                  href={buildQueryString({
                    page: 1,
                    cat: slug,
                  })}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    slug === effectiveFilter
                      ? "bg-cyan-300 text-black border-cyan-300"
                      : "border-white/20 text-white/80 hover:text-white"
                  }`}
                >
                  {label}
                </a>
              ))}
            </div>
          </header>

          {visiblePosts.length ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {visiblePosts.map((doc: Content.BlogPostDocument) => (
                <BlogCard key={doc.id} doc={doc} />
              ))}
            </div>
          ) : (
            <div className="text-white/70 border border-white/10 rounded-xl p-6">
              No posts found for this selection.
            </div>
          )}

          <footer className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-10 text-sm text-white/60">
            <div>
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-3">
              <a
                aria-disabled={!prevHref}
                href={prevHref ?? "#"}
                className={`px-4 py-2 rounded border ${
                  prevHref
                    ? "border-white/20 text-white/90 hover:text-white"
                    : "border-white/10 text-white/30 cursor-not-allowed"
                }`}
              >
                ← Newer
              </a>
              <a
                aria-disabled={!nextHref}
                href={nextHref ?? "#"}
                className={`px-4 py-2 rounded border ${
                  nextHref
                    ? "border-white/20 text-white/90 hover:text-white"
                    : "border-white/10 text-white/30 cursor-not-allowed"
                }`}
              >
                Older →
              </a>
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
}

export async function generateMetadata(
  { params }: { params: Promise<Params>;},
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { uid } = await params;
  const client = createClient();
  const parentMetaData = await pickBaseMetadata(parent);
  const doc = (await (client as any)
  .getByUID("author", uid)
  .catch(() => null)) as Content.AuthorDocument | null;
  if (!doc) {
    return {
      title: "Lunim",
      description: "Welcome to Lunim's official author page."
    };
  }

  const parentKeywords = parentMetaData.keywords || "";
  const keywords = doc.data?.meta_keywords.filter((val: any) => Boolean(val.meta_keywords_text)).length >= 1 ? `${parentKeywords}, ${doc.data.meta_keywords.map((k: any) => k.meta_keywords_text?.toLowerCase()).join(", ")}` : parentKeywords;
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
      },
    }
}

export async function generateStaticParams() {
  const client = createClient();
  const authors = (await (client as any).getAllByType("author")) as Content.AuthorDocument[];
  return authors
    .filter((doc: Content.AuthorDocument) => Boolean(doc.uid))
    .map((doc: Content.AuthorDocument) => ({ uid: doc.uid! }));
}
