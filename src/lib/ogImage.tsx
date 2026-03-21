import { ImageResponse } from "next/og";

type Size = { width: number; height: number };

export async function generateOgImageResponse(
  title: string,
  backgroundUrl: string | null | undefined,
  size: Size,
) {
  // Pre-fetch the background image to avoid ImageResponse internally calling
  // .arrayBuffer() on a null response when the URL is missing or unreachable.
  let resolvedBg: string | null = null;
  if (backgroundUrl) {
    try {
      const res = await fetch(backgroundUrl);
      if (res.ok) {
        const buf = await res.arrayBuffer();
        const mime = res.headers.get("content-type") ?? "image/jpeg";
        resolvedBg = `data:${mime};base64,${Buffer.from(buf).toString("base64")}`;
      }
    } catch {
      // Fall through to gradient fallback
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          background: "linear-gradient(black, #0f172a 80%)",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "flex-start",
          boxSizing: "border-box",
          color: "white",
          fontSize: 75,
          textShadow: "2px 2px 4px #000",
        }}
      >
        {resolvedBg && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolvedBg}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
        <div style={{ padding: 50 }}>{title}</div>
      </div>
    ),
    { ...size },
  );
}

export default generateOgImageResponse;
