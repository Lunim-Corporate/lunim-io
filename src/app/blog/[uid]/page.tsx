// app/blog/[uid]/page.tsx
// Next
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
// Prismicio
import { createClient } from "@/prismicio";
import { asText, type Content } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";
import { RichTextField, SliceZone } from "@prismicio/types";
import { PrismicNextImage } from "@prismicio/next";
// Icons
import { ChevronDown, Eye } from "lucide-react";
// Types
import { Simplify } from "../../../../prismicio-types";
// Utils
import { createID } from "@/utils/createId";
import { calculateReadingTime } from "@/utils/calcReadingTime";
import { formatDate } from "@/utils/formatDate";
// Components
import TableOfContents from "@/components/TableOfContents";
import ViewCounter from "@/components/ViewCounter";
// Utils
import { pickBaseMetadata } from "@/utils/metadata";

type Params = { uid: string };

export default async function Page({ params }: { params: Promise<Params> }) {
  const { uid } = await params;

  const client = createClient();
  // Pass custom name of linked document type 'author'
  const doc = await client
    .getByUID<Content.BlogPostDocument>("blog_post", uid, {
      fetchLinks: ["author.author_name", "author.author_image", "author.author_bio"],
    })
    .catch(() => null);
  if (!doc) notFound();
  const docData: Simplify<Content.BlogPostDocumentData> = doc.data;
  
  const faqSlice: SliceZone<Content.FaqSlice> = docData.slices
  const faqs: Simplify<Content.FaqSliceDefaultItem>[] | undefined = faqSlice[0]?.items
  const faqHeading: RichTextField | undefined = faqSlice[0]?.primary.title
  const readingTime: number = calculateReadingTime(docData.main_article_content);
  // Author info from linked document
  const author = docData.author_info;

  // Narrow the relationship union with an 'in' type-guard so TypeScript
  // knows `data` exists (EmptyContentRelationshipField doesn't have `data`).
  const authorData = author && "data" in author ? author.data : undefined;

  const authorName = authorData?.author_name;
  const authorBio = authorData?.author_bio;
  const authorImage = authorData?.author_image;

  return (
    <main className="bg-black text-white mb-15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen mt-50">
        <article>
          <div className="container grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Hero text content wrapper */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div>{asText(docData.category)}</div>
                <div className="flex gap-2">
                  <div className="italic">
                    <time dateTime={`${docData.publication_date}`}>{formatDate(docData.publication_date)}</time>
                  </div>
                  <span aria-hidden="true">&#8226;</span>
                  <div>
                    <span>{readingTime >= 10 ? `${readingTime}+` : readingTime} min read</span>
                  </div>
                </div>
              </div>
              <div className="mb-10">
                <PrismicRichText
                  field={docData.blog_article_heading}
                  components={{heading1: ({children}) => <h1 className="text-6xl">{children}</h1>}}/>
              </div>
              <div className="flex gap-10">
                <div className="flex items-center">
                  <PrismicNextImage field={authorImage} className="rounded-full w-[40] aspect-[1] inline-block mr-2" />
                  <span>By {authorName} </span>
                </div>
                <div className="flex items-center">
                  <Eye className="mr-1" />
                  <ViewCounter articleUid={uid} />
                </div>
              </div>
            </div>
            {/* Hero Image Wrapper */}
            <div>
              <PrismicNextImage field={docData.article_main_image} className="rounded-2xl" />
            </div>
          </div>
          {/* Table of Contents and Main content */}
          <div className="container grid grid-cols-1 gap-20 lg:grid-cols-[1fr_1.5fr_5%] lg:gap-10 mt-20">
            {/* Table of Contents and share links */}
            <TableOfContents
              mainArticleContent={docData.main_article_content}
            />
            <div>
              <div className="mb-20">
                <PrismicRichText
                  field={docData.main_article_content}
                  // Add ids to headings for linking from TOC
                  // Define scroll offset for headings
                  components={{
                    heading2: ({ text, children}) => <h2 className="scroll-mt-28" id={createID(text || "")}>{children}</h2>,
                    heading3: ({ text, children}) => <h3 className="scroll-mt-28" id={createID(text || "")}>{children}</h3>,
                    heading4: ({ text, children}) => <h4 className="scroll-mt-28" id={createID(text || "")}>{children}</h4>,
                    heading5: ({ text, children}) => <h5 className="scroll-mt-28" id={createID(text || "")}>{children}</h5>,
                    heading6: ({ text, children}) => <h6 className="scroll-mt-28" id={createID(text || "")}>{children}</h6>,
                    list: ({ children }) => <ul className="ms-8 my-8 list-inside list-disc">{children}</ul>,
                    oList: ({ children }) => <ol className="ms-8 my-8 list-inside list-decimal">{children}</ol>,
                    listItem: ({ children }) => <li className="my-5 first:my-0 last:my-0">{children}</li>,
                    oListItem: ({ children }) => <li className="my-5 first:my-0 last:my-0">{children}</li>,
                  }}/>
              </div>
              {/* FAQs: see `faq/index.ts` */}
              <div className="mb-16">
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
              {/* End FAQs section */}
              {/* Article written by section */}
              <div className="grid grid-cols-1 sm:grid-cols-[3fr_1fr] sm:gap-x-2 p-6 bg-[#1f2937] rounded-lg">
                <div className="order-2 sm:order-1">
                  <h4 className="mb-0!">Article Written by</h4>
                  <h3 className="mt-0! font-bold">{authorName}</h3>
                  <p>{authorBio}</p>
                  {/* TODO: Implement later */}
                  {/* <PrismicNextLink field={docData.more_posts_link_text} className="underline underline-offset-8 font-bold" /> */}
                </div>
                <div className="order-1 sm:order-2">
                  <PrismicNextImage field={authorImage} className="rounded-full w-[150] aspect-[1] sm:ms-auto" />
                </div>
              </div>
               {/* End Article written by section */}
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}

export async function generateMetadata(
  { params }: { params: Promise<Params>;},
  parent: ResolvingMetadata
): Promise<Metadata> {
  // fetch data
  const { uid } = await params;
  const client = createClient();
  const parentMetaData = await pickBaseMetadata(parent);
  const doc = await client
  .getByUID<Content.BlogPostDocument>("blog_post", uid)
  .catch(() => null);
  if (!doc) {
    return {
      title: "Lunim Blog Article",
      description: "Welcome to Lunim's official blog article page."
    };
  }


  // const parentUrl = (await parent).openGraph?.images?.[0]?.url || "";
  // const parentAlt = (await parent).openGraph?.images?.[0]?.alt || "";
  const parentKeywords = parentMetaData.keywords || "";
  const keywords = doc.data?.meta_keywords.filter((val) => Boolean(val.meta_keywords_text)).length >= 1 ? `${doc.data.meta_keywords.map((k) => k.meta_keywords_text?.toLowerCase()).join(", ")}, ${parentKeywords}` : parentKeywords;
  const title = doc.data?.meta_title || parentMetaData.title;
  const description = doc.data?.meta_description || parentMetaData.description;

  const fallBackPageName = doc.uid.replace(/-/g, ' ').replace(/^./, c => c.toUpperCase());

  return {
    ...parentMetaData,
    title: title,
    description: description,
    keywords: keywords, 
    openGraph: {
      ...parentMetaData.openGraph,
      title: typeof title === 'string' ? `${title}` : fallBackPageName,
      description: `${description}`,
      // images: [
      //   {
      //     url: `${doc.data?.meta_image}` || `${parentUrl}`,
      //     alt: `${doc.data?.meta_image_alt_text}` || `${parentAlt}`,
      //   }
      // ]
    },
  }
}

// Static generation for known UIDs (optional)
export async function generateStaticParams() {
  const client = createClient();
  const docs = await client.getAllByType<Content.BlogPostDocument>("blog_post");
  return docs.map((d) => ({ uid: d.uid! }));
}
