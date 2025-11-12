import { createClient } from "../../../prismicio";
import { generateOgImageResponse } from "@/lib/ogImage";

// Options for the generated Open Graph image
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Fetch data for the Open Graph image
const client = createClient();
const doc = await client.getSingle("authors").catch(() => null);
const title = doc?.data?.meta_title ?? "Lunim Blog Authors";
const backgroundImg = doc?.data?.meta_image?.url;

// Use optional chaining when reading the image alt (meta_image may be null)
export const alt = doc?.data?.meta_image?.alt || "Lunim Blog Authors";

export default async function Image() {
   return generateOgImageResponse(title, backgroundImg, size as { width: number; height: number });
}