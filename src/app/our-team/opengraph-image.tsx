import { ImageResponse } from "next/og";
import { createClient } from "../../prismicio";

// Options for the generated Open Graph image
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Fetch data for the Open Graph image
const client = createClient();
const doc = await client.getSingle("our_team_page").catch(() => null);
const title = doc?.data?.meta_title ?? "Our Team";
const backgroundImg = doc?.data?.meta_image;

// Use optional chaining when reading the image alt (meta_image may be null)
export const alt = doc?.data?.meta_image?.alt || "Our Team";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          background: backgroundImg?.url ? `url(${backgroundImg.url}) center/cover no-repeat` : "linear-gradient(black, #0f172a 80%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
          textAlign: "center",
          color: "white",
          fontSize: 110,
        }}
      >
        {/* overlay to reduce background visibility without affecting text */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            background: "black",
            opacity: 0.7,
          }}
        />
        {title}
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    },
  );
}