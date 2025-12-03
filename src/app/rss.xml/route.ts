import { createClient } from "@/prismicio";
import { asText } from "@prismicio/helpers";
import type { BlogPostDocument } from "../../../prismicio-types";

const DEFAULT_HOST = "https://lunim.io";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || DEFAULT_HOST;

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  const client = createClient();

  // Fetch all blog posts sorted by publication date
  const blogPosts = (await (client as any)
    .getAllByType("blog_post", {
      orderings: [
        { field: "my.blog_post.publication_date", direction: "desc" },
      ],
      fetchLinks: ["author.author_name"],
    })
    .catch(() => [])) as BlogPostDocument[];

  const rssItems = await Promise.all(
    blogPosts.map(async (post) => {
      const uid = post.uid;
      if (!uid) return null;

      const title = asText(post.data.blog_article_heading || []) || uid;
      const description =
        post.data.meta_description ||
        asText(post.data.main_article_content).slice(0, 320) ||
        "";
      const link = `${SITE_URL}/blog/${encodeURIComponent(uid)}`;

      // Use first_publication_date if publication_date is in the future or missing
      const publicationDate = post.data.publication_date
        ? new Date(post.data.publication_date)
        : new Date(post.first_publication_date);

      const now = new Date();
      const pubDate = publicationDate > now
        ? new Date(post.first_publication_date).toUTCString()
        : publicationDate.toUTCString();

      // Get author name
      const authorInfo = post.data.author_info;
      const authorData =
        authorInfo && "data" in authorInfo ? authorInfo.data : undefined;
      const authorName =
        (typeof authorData?.author_name === "string"
          ? authorData.author_name.trim()
          : "") || "Lunim";

      // Get image URL and fetch content length for enclosure
      const imageUrl = post.data.article_main_image?.url || "";
      let imageLength = 0;
      let imageType = "image/jpeg";

      if (imageUrl) {
        try {
          const response = await fetch(imageUrl, { method: "HEAD" });
          const contentLength = response.headers.get("content-length");
          const contentType = response.headers.get("content-type");
          if (contentLength) imageLength = parseInt(contentLength, 10);
          if (contentType) imageType = contentType;
        } catch {
          // Fallback to estimate if HEAD request fails
          imageLength = 0;
        }
      }

      const categoryText = asText(post.data.category || []);

      return `
    <item>
      <title><![CDATA[${escapeXml(title)}]]></title>
      <description><![CDATA[${escapeXml(description)}]]></description>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <dc:creator><![CDATA[${escapeXml(authorName)}]]></dc:creator>${imageUrl && imageLength > 0 ? `
      <enclosure url="${escapeXml(imageUrl)}" length="${imageLength}" type="${imageType}" />` : ""}${categoryText ? `
      <category><![CDATA[${escapeXml(categoryText)}]]></category>` : ""}
    </item>`;
    })
  );

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Lunim Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Latest articles from Lunim - Insights on technology, digital transformation, and innovation</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    ${rssItems.filter(Boolean).join("")}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
    },
  });
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
