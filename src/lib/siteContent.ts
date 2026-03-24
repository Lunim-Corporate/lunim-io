import { cache } from "react";
import type { Content } from "@prismicio/client";
import { createClient } from "@/prismicio";

export type SiteKey = "main" | "ai" | "ux" | "video";

type LayoutContent = {
  navigationMenu: Content.NavigationMenuSlice | null;
  navigationSlices: any[];
  footerSlice: Content.FooterSlice | null;
  footerSlices: any[];
};

export const getSingleDocument = cache(async <T>(type: string) => {
  const client = createClient();
  return (await (client as any).getSingle(type).catch(() => null)) as T | null;
});

export const getLayoutContent = cache(
  async (siteKey: SiteKey): Promise<LayoutContent> => {
    const client = createClient();

    if (siteKey === "main") {
      const [primaryNav, footer] = await Promise.all([
        (client as any).getSingle("primary_navigation").catch(() => null),
        (client as any).getSingle("footer").catch(() => null),
      ]);

      const navigationSlices = primaryNav?.data?.slices || [];
      const footerSlices = footer?.data?.slices || [];

      return {
        navigationSlices,
        navigationMenu:
          navigationSlices.find(
            (slice: any) => slice.slice_type === "navigation_menu",
          ) ?? null,
        footerSlices,
        footerSlice:
          footerSlices.find((slice: any) => slice.slice_type === "footer") ??
          null,
      };
    }

    const domainMap: Record<Exclude<SiteKey, "main">, string> = {
      ai: "ai-automation",
      ux: "ux",
      video: "video",
    };

    const domainValue = domainMap[siteKey];

    const [navDocs, footerDocs] = await Promise.all([
      (client as any).getAllByType("primary_navigation_generic").catch(() => []),
      (client as any).getAllByType("footer_generic").catch(() => []),
    ]);

    const navDoc = navDocs.find((doc: any) => doc.data?.domain === domainValue);
    const footerDoc = footerDocs.find(
      (doc: any) => doc.data?.domain === domainValue,
    );

    const navigationSlices = navDoc?.data?.slices || [];
    const footerSlices = footerDoc?.data?.slices || [];

    return {
      navigationSlices,
      navigationMenu:
        navigationSlices.find(
          (slice: any) => slice.slice_type === "navigation_menu",
        ) ?? null,
      footerSlices,
      footerSlice:
        footerSlices.find((slice: any) => slice.slice_type === "footer") ??
        null,
    };
  },
);
