// src/slices/BlogList/index.tsx
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import type { SliceComponentProps } from "@prismicio/react";
import type { Content, KeyTextField, RichTextField } from "@prismicio/client";
import { asText } from "@prismicio/helpers";

import { createClient } from "@/prismicio";

/** Slice context passed from the page (we read search params here). */
type BlogListSliceContext = {
  searchParams?: Record<string, string | string[] | undefined>;
};

type Props = SliceComponentProps<Content.BlogListSlice, BlogListSliceContext>;

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
  field: RichTextField | KeyTextField | null | undefined
): string {
  if (!field) return "";
  // If it's StructuredText (RichTextField), convert to plain text.
  if (Array.isArray(field)) return asText(field);
  // Otherwise it's a KeyText string already.
  return field;
}

function BlogCard({ doc }: { doc: Content.BlogPostDocument }) {
  const d = doc.data;
  const title = asText(d.blog_article_heading) || doc.uid || "Untitled";
  const img = d.article_main_image;
  const articleImageField =
    img && !img.alt ? { ...img, alt: title } : img ?? null;
  const authorImageField =
    d.author_image && !d.author_image.alt
      ? { ...d.author_image, alt: asText(d.author_name) || "Author" }
      : d.author_image ?? null;

  return (
    <PrismicNextLink document={doc} className="block rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
      {articleImageField?.url ? (
        <PrismicNextImage
          field={articleImageField}
          className="w-full h-48 object-cover"
        />
      ) : null}

      <div className="p-5">
        <h3 className="text-white text-xl font-semibold mb-2">{title}</h3>

        <div className="flex flex-wrap gap-3 text-sm text-gray-300 mb-4">
          {d.publication_date ? (
            <time dateTime={d.publication_date}>
              {new Date(d.publication_date).toLocaleDateString()}
            </time>
          ) : null}
          {d.category ? <span>• {asText(d.category)}</span> : null}
          {d.article_length ? <span>• {asText(d.article_length)}</span> : null}
        </div>

        {(d.author_name?.length || d.author_image?.url) ? (
          <div className="flex items-center gap-3 mb-4">
            {authorImageField?.url ? (
              <PrismicNextImage
                field={authorImageField}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : null}
            {d.author_name?.length ? (
              <span className="text-white/90 text-sm">{asText(d.author_name)}</span>
            ) : null}
          </div>
        ) : null}
      </div>
    </PrismicNextLink>
  );
}

export default async function BlogList({ slice, context }: Props) {
  const client = createClient();

  // ----- Settings controlled by Slice fields -----
  const pageSize =
    typeof slice.primary.page_size === "number" && slice.primary.page_size > 0
      ? slice.primary.page_size
      : 12;

  const defaultCategory =
    typeof slice.primary.category_filter === "string"
      ? slice.primary.category_filter.trim()
      : "";

  // ----- Read query params from context -----
  const rawPage = getFirstParam(context?.searchParams?.page);
  const rawCategory = getFirstParam(context?.searchParams?.cat);

  // current page
  const pageRawNumber = Number(rawPage ?? "1");
  const currentPage =
    Number.isFinite(pageRawNumber) && pageRawNumber > 0 ? pageRawNumber : 1;

  // user-requested category (falls back to the slice default)
  const selectedCategoryRaw = rawCategory ?? defaultCategory;

  // ----- Fetch a single page of posts (newest first) -----
  const response = await client.getByType("blog_post", {
    pageSize,
    page: currentPage,
    orderings: [{ field: "my.blog_post.publication_date", direction: "desc" }],
  });

  const posts = response.results;
  const totalPages = response.total_pages || 1;

  // ----- Build category set from the fetched posts -----
  const categoriesSet = new Set<string>();
  for (const p of posts) {
    const cat = normalizeCategory(extractCategoryText(p.data.category));
    if (cat) categoriesSet.add(cat);
  }
  const categories = Array.from(categoriesSet).sort();

  // ----- Decide the effective filter (only if it exists on this page) -----
  const normalizedRequested = normalizeCategory(selectedCategoryRaw || "");
  const filterExistsOnPage = normalizedRequested
    ? categories.includes(normalizedRequested)
    : false;

  // Only apply filter if it is valid for this page; else show all.
  const effectiveFilter = filterExistsOnPage ? normalizedRequested : "";

  // ----- Visible posts -----
  const visiblePosts = effectiveFilter
    ? posts.filter(
        (doc) =>
          normalizeCategory(extractCategoryText(doc.data.category)) ===
          effectiveFilter
      )
    : posts;

  // ----- Helper to build query strings for pagination & filters -----
  const withParams = (params: {
    page?: number;
    cat?: string | undefined;
  }): string => {
    const usp = new URLSearchParams();
    if (params.cat) usp.set("cat", normalizeCategory(params.cat));
    if (typeof params.page === "number") usp.set("page", String(params.page));
    const qs = usp.toString();
    return qs ? `?${qs}` : "";
  };

  const prevHref =
    currentPage > 1
      ? withParams({ page: currentPage - 1, cat: effectiveFilter || undefined })
      : null;

  const nextHref =
    currentPage < totalPages
      ? withParams({ page: currentPage + 1, cat: effectiveFilter || undefined })
      : null;

  return (
    <section className="py-16 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        {slice.primary.heading?.length ? (
          <h2 className="text-3xl font-bold text-white mb-3">
            <PrismicRichText field={slice.primary.heading} />
          </h2>
        ) : null}

        {slice.primary.intro?.length ? (
          <div className="text-gray-300 mb-6">
            <PrismicRichText field={slice.primary.intro} />
          </div>
        ) : null}

        {/* Category chips */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <a
            href={withParams({ page: 1 })}
            className={`px-3 py-1 rounded-full text-sm border ${
              !effectiveFilter
                ? "bg-cyan-300 text-black border-cyan-300"
                : "border-white/20 text-white/80 hover:text-white"
            }`}
          >
            All
          </a>
          {categories.map((cat) => (
            <a
              key={cat}
              href={withParams({ page: 1, cat })}
              className={`px-3 py-1 rounded-full text-sm border ${
                cat === effectiveFilter
                  ? "bg-cyan-300 text-black border-cyan-300"
                  : "border-white/20 text-white/80 hover:text-white"
              }`}
            >
              {cat}
            </a>
          ))}
        </div>

        {/* Grid / empty state */}
        {visiblePosts.length ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {visiblePosts.map((doc) => (
              <BlogCard key={doc.id} doc={doc} />
            ))}
          </div>
        ) : (
          <div className="text-white/70 border border-white/10 rounded-xl p-6">
            No posts found for this filter.
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between mt-10">
          <div className="text-white/60 text-sm">
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
        </div>
      </div>
    </section>
  );
}
