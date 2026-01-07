import type { SliceComponentProps } from "@prismicio/react";
import type { Content } from "@prismicio/client";
import type { LinkField } from "@prismicio/types";
import { createClient } from "@/prismicio";
import { headers } from "next/headers";
import BreadcrumbsClient from "./BreadcrumbsClient";

export type BreadcrumbsProps = SliceComponentProps<any>;

type ChildLink = {
  label: string;
  link: LinkField;
};

type Section = {
  id: string;
  label: string;
  link: LinkField;
  children: ChildLink[];
};

function isUsableLink(link: LinkField | null | undefined): link is LinkField {
  return !!link && link.link_type !== "Any";
}

// Helper function to determine site key from hostname
function getSiteKey(hostname: string): "main" | "ai" | "ux" | "video" {
  const subdomain = hostname.split(".")[0];
  if (subdomain === "ai" && !hostname.startsWith("www")) {
    return "ai";
  }
  if (subdomain === "ux" && !hostname.startsWith("www")) {
    return "ux";
  }
  if (subdomain === "video-next" && !hostname.startsWith("www")) {
    return "video";
  }
  return "main";
}

/**
 * Server component for the Breadcrumbs slice.
 *
 * This slice does not use any fields from the slice model itself. Instead,
 * it derives its data from the primary navigation document and the current URL
 * (handled inside the BreadcrumbsClient via `usePathname()`).
 */
export default async function Breadcrumbs({}: BreadcrumbsProps) {
  const client = createClient();
  const headersList = await headers();
  const hostname = headersList.get("host") || "lunim.io";
  const siteKey = getSiteKey(hostname);

  let primaryNav: any = null;

  if (siteKey === "main") {
    // Fetch the primary navigation singleton (same as in RootLayout)
    primaryNav = (await (client as any)
      .getSingle("primary_navigation")
      .catch(() => null)) as any;
  } else {
    // Fetch subdomain-specific navigation
    const domainMap: Record<string, string> = {
      "ai": "ai-automation",
      "ux": "ux",
      "video": "video",
    };
    const domainValue = domainMap[siteKey];

    const navDocs = await (client as any)
      .getAllByType("primary_navigation_generic")
      .catch(() => []);

    primaryNav = navDocs.find(
      (doc: any) => doc.data?.domain === domainValue
    );
  }

  if (!primaryNav) {
    return null;
  }

  // Find the navigation_menu slice within the primary navigation document
  const navigationMenu = primaryNav.data.slices.find(
    (s: any) => s.slice_type === "navigation_menu"
  ) as Content.NavigationMenuSlice | undefined;

  if (!navigationMenu) {
    return null;
  }

  // This mirrors the logic used in NavigationMenuServer to resolve sections
  const sectionsGroup = Array.isArray(navigationMenu.primary.sections)
    ? navigationMenu.primary.sections
    : [];

  const ids = sectionsGroup
    .map((row: any) => row.section_ref)
    .map((ref: any) =>
      ref && ref.link_type === "Document" && typeof ref.id === "string"
        ? ref.id
        : null
    )
    .filter((id: any): id is string => !!id);

  let orderedDocs: Content.NavSectionDocument[] = [];

  if (ids.length) {
    try {
      const fetched = (await (client as any).getAllByIDs(ids as any)) as any[];
      const byId = new Map(fetched.map((d: any) => [d.id, d]));
      orderedDocs = ids
        .map((id: string) => byId.get(id))
        .filter((d: any): d is Content.NavSectionDocument => !!d);
    } catch {
      orderedDocs = [];
    }
  }

  const sections: Section[] = orderedDocs
    .map((doc: any) => {
      const data = doc.data;

      const children: ChildLink[] = (
        Array.isArray(data.child_links) ? data.child_links : []
      )
        .map((row: any, idx: number) => {
          const label =
            typeof row.child_label === "string" && row.child_label.trim()
              ? row.child_label.trim()
              : `Item ${idx + 1}`;
          const link = isUsableLink(row.child_link) ? row.child_link : null;
          return { label, link: link as LinkField };
        })
        .filter((r: any): r is ChildLink => !!r.link);

      const resolvedLink: LinkField | undefined = children[0]?.link;

      if (!resolvedLink) return null;

      return {
        id: doc.id,
        label:
          typeof data.section_label === "string" ? data.section_label : "",
        link: resolvedLink,
        children,
      } as Section;
    })
    .filter((s): s is Section => !!s);

  if (!sections.length) {
    return null;
  }

  // Optionally fetch breadcrumb settings from Prismic to control hidden segments.
  const breadcrumbSettings = (await (client as any)
    .getSingle("breadcrumb_settings")
    .catch(() => null)) as any;

  const hiddenSegments: string[] =
    breadcrumbSettings?.data?.hidden_segments
      ?.map((row: any) =>
        typeof row.segment === "string" ? row.segment.trim().toLowerCase() : ""
      )
      .filter((slug: any): slug is string => slug.length > 0) ?? [];

  // For subdomain pages, always hide the routing prefix (e.g., "ai-automation", "video")
  if (siteKey !== "main") {
    const domainMap: Record<string, string> = {
      "ai": "ai-automation",
      "ux": "ux",
      "video": "video",
    };
    const routingPrefix = domainMap[siteKey];
    if (routingPrefix && !hiddenSegments.includes(routingPrefix)) {
      hiddenSegments.push(routingPrefix);
    }
  }

  // Delegate actual breadcrumb rendering + URL handling to the client component
  return (
    <BreadcrumbsClient
      sections={sections}
      hiddenSegments={hiddenSegments}
      siteKey={siteKey}
    />
  );
}
