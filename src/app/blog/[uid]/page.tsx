// app/blog/[uid]/page.tsx
// Next
import { notFound } from "next/navigation";
import type { Metadata } from "next";
// Prismicio
import { createClient } from "@/prismicio";
import { asText, type Content } from "@prismicio/client";
import { PrismicImage, PrismicRichText } from "@prismicio/react";
// Icons
import { ChevronDown, Eye } from "lucide-react";
// Types
import { Simplify } from "../../../../prismicio-types";
import Link from "next/link";
import { RichTextField, SliceZone } from "@prismicio/types";

type Params = { uid: string };

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  // Display as "Month Day, Year" format
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { uid } = await params;

  const client = createClient();
  const doc = await client
    .getByUID<Content.BlogPostDocument>("blog_post", uid)
    .catch(() => null);
  if (!doc) notFound();
  const docData: Simplify<Content.BlogPostDocumentData> = doc.data;
  
  const faqSlice: SliceZone<Content.FaqSlice> = docData.slices
  const faqs: Simplify<Content.FaqSliceDefaultItem>[] | undefined = faqSlice[0]?.items
  const faqHeading: RichTextField | undefined = faqSlice[0]?.primary.title

  return (
    <main className="bg-black text-white mb-15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen mt-50">
        <article>
          <div className="container grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Hero text content wrapper */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div>{asText(docData.category)}</div>
                <div className="flex gap-2">
                  <div>
                    <time dateTime={`${docData.publication_date}`}>{formatDate(docData.publication_date)}</time>
                  </div>
                  &#8226;
                  <div>
                    <span>{asText(docData.article_length)}</span>
                  </div>
                </div>
              </div>
              <div>
                <PrismicRichText field={docData.blog_article_heading} />
              </div>
              <div className="flex gap-10">
                <div className="flex items-center">
                  <PrismicImage field={docData.author_image} className="rounded-full w-[40] aspect-[1] inline-block mr-2" />
                  <span>By {asText(docData.author_name)}</span>
                </div>
                <div className="flex items-center">
                  <Eye className="mr-1" />
                  <span>{docData.article_views}</span>
                </div>
              </div>
            </div>
            {/* Hero Image Wrapper */}
            <div>
              <PrismicImage field={docData.article_main_image} className="rounded-2xl" />
            </div>
          </div>
          {/* Table of Contents and Main content */}
          <div className="container grid grid-cols-1 md:grid-cols-2 gap-26 md:gap-10 mt-20">
            {/* Table of Contents and share links */}
            <aside>
              <div className="sticky top-40">
                <div>
                  <PrismicRichText field={docData.table_of_contents_heading} />
                </div>
                <div className="flex gap-3">
                  <div>
                    <PrismicRichText
                      field={docData.share_article_text}
                      components={{
                        heading4: ({ children }) => <h4 className="m-[0]!">{children}</h4>
                      }}
                    /></div>
                  <div className="flex gap-4">
                    {/* TODO: Some icons from lucide-react are deprecated */}
                    {docData.icons.map((icon, i) => {
                      return (
                        <Link href="/" key={i}>{icon.icon_text}</Link>
                      )
                    })}
                  </div>
                </div>
              </div>
            </aside>
            <div>
              <div className="mb-20">
                <PrismicRichText field={docData.main_article_content} />
              </div>
              {/* FAQs: see `faq/index.ts` */}
              <div>
                <div className="mx-auto">
                  <div className="text-3xl font-bold text-white mb-12">
                    <PrismicRichText field={faqHeading} />
                  </div>

                  <div className="space-y-4">
                    {faqs?.map((item, index) => (
                      <div
                        key={index}
                        className="bg-[#1f2937] rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
                      >
                        <details className="group">
                          <summary className="w-full flex justify-between items-center p-6 text-left cursor-pointer focus:outline-none list-none">
                            <h3 className="text-lg font-semibold text-white pr-4">
                              {item.question}
                            </h3>
                            <ChevronDown className="w-6 h-6 text-white flex-shrink-0 transition-transform duration-300 group-open:rotate-180" />
                          </summary>
                          <div className="p-6 pt-0 text-gray-300 prose prose-invert max-w-none">
                            <PrismicRichText field={item.answer} />
                          </div>
                        </details>
                      </div>
                  ))}
                </div>
              </div>
              </div>
            </div>
          </div>
        </article>
      </div>
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
