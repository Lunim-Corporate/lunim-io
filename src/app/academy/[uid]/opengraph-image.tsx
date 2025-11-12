import { ImageResponse } from "next/og";
import { createClient } from "../../../prismicio";

// Options for the generated Open Graph image
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function alt({params}: {params: { uid: string }}) {
  const client = createClient();
  // Fetch the specific doc for this page:
  const doc = await client
    .getByUID("academy_course", params.uid)
    .catch(() => null);

  return doc?.data?.meta_image.alt || "Academy Course";
}

export default async function Image({
  params,
}: {
  params: { uid: string };
}) {
  const client = createClient();
  const doc = await client.getByUID("academy_course", params.uid).catch(() => null);

  const title = doc?.data?.meta_title ?? "Academy Course";
  const backgroundImg = doc?.data?.meta_image;

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