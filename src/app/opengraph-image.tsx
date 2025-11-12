import generateOgImageResponse from "../lib/ogImage";
import { createClient } from "../prismicio";

// Options for the generated Open Graph image
const size = { width: 1200, height: 630 };

// Fetch data for the Open Graph image
const client = createClient();
const doc = await client.getSingle("homepage").catch(() => null);
const title = doc?.data?.meta_title ? doc.data.meta_title : "Lunim";
const backgroundImg = doc?.data?.meta_image?.url ?? null;

export const alt = doc?.data?.meta_image?.alt || "Lunim";

export default async function Image() {
  return generateOgImageResponse(title, backgroundImg, size);
}