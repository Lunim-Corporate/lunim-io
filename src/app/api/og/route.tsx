// app/api/og/route.tsx
import { createClient } from "@/prismicio";
import generateOgImageResponse from "../../../lib/ogImage";

export const runtime = "edge";
const size = { width: 1200, height: 630 };
export const dynamic = "force-dynamic";

async function fetchDocForSegments(client: ReturnType<typeof createClient>, uid?: string[] | null) {
  if (!uid || uid.length === 0) {
    return await client.getSingle("tech").catch(() => null);
  }

  if (uid.length === 1) {
    return await client.getByUID("digital_page", uid[0]).catch(() => null);
  }

  if (uid.length === 2) {
    if (uid[1] !== "case-studies") return null;
    return await client.getSingle("case_studies").catch(() => null);
  }

  if (uid.length === 3) {
    if (uid[1] !== "case-studies") return null;
    const doc = await client.getByUID("case_study_sm", uid[2]).catch(() => null);
    if (doc) {
      const caseStudyCategory = String(doc.data?.digital_category || "").trim().toLowerCase();
      const requestedCategory = String(uid[0] || "").trim().toLowerCase();
      if (caseStudyCategory !== requestedCategory) return null;
    }
    return doc;
  }

  return null;
}

/** Named GET handler required for route.tsx */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const uidParam = url.searchParams.get("uid") ?? "";
    const segments = uidParam ? uidParam.split("/").filter(Boolean) : [];

    const client = createClient();
    // Create a client that does NOT use aggressive caching for OG generation.
    // This ensures the image generator always reads fresh Prismic data in prod.
    // const client = createClient({
    //   fetchOptions: { next: { revalidate: 0 }, cache: "no-store" },
    // });
    const doc = await fetchDocForSegments(client, segments);
    const title = doc?.data?.meta_title ?? "Lunim";
    const backgroundImg = doc?.data?.meta_image?.url ?? null;

    return generateOgImageResponse(title, backgroundImg, size as { width: number; height: number });
  } catch (err) {
    // ImageResponse must return something valid; here we return a very small fallback.
    return new Response(`Image generation failed: ${err}`, { status: 500 });
  }
}

/* Notes:

An Edge route handler (e.g., app/api/og/route.tsx) that accepts `?uid=`, generates the image with ImageResponse and returns it

Next will try to statically optimise/cache them and routing around optional catch-all segments is ambiguous (and can error)

*/