import { ResolvingMetadata } from "next";

export async function pickBaseMetadata(parent: ResolvingMetadata) {
  const resolved = await parent;

  const type = resolved.openGraph && "type" in resolved.openGraph ? resolved.openGraph.type : undefined;

  return {
    title: resolved.title,
    description: resolved.description,
    keywords: resolved.keywords,
    openGraph: resolved.openGraph
      ? {
          type: type,
          locale: resolved.openGraph.locale,
          siteName: resolved.openGraph.siteName,
        }
      : undefined,
  };
}
