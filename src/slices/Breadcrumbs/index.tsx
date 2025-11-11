import type { SliceComponentProps } from "@prismicio/react";
import type { Content, LinkField } from "@prismicio/client";
import { createClient } from "@/prismicio";
import BreadcrumbsClient from "./BreadcrumbsClient";

export type BreadcrumbsProps = SliceComponentProps<Content.BreadcrumbsSlice>;

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

/**
 * Server component for the Breadcrumbs slice.
 *
 * This slice does not use any fields from the slice model itself. Instead,
 * it derives its data from the primary navigation document and the current URL
 * (handled inside the BreadcrumbsClient via `usePathname()`).
 */
export default async function Breadcrumbs({}: BreadcrumbsProps) {
  const client = createClient();

  // Fetch the primary navigation singleton (same as in RootLayout)
  const primaryNav = await client
    .getSingle<Content.PrimaryNavigationDocument>("primary_navigation")
    .catch(() => null);

  if (!primaryNav) {
    return null;
  }

  // Find the navigation_menu slice within the primary navigation document
  const navigationMenu = primaryNav.data.slices.find(
    (s) => s.slice_type === "navigation_menu"
  ) as Content.NavigationMenuSlice | undefined;

  if (!navigationMenu) {
    return null;
  }

  // This mirrors the logic used in NavigationMenuServer to resolve sections
  const sectionsGroup = Array.isArray(navigationMenu.primary.sections)
    ? navigationMenu.primary.sections
    : [];

  const ids = sectionsGroup
    .map((row) => row.section_ref)
    .map((ref) =>
      ref && ref.link_type === "Document" && typeof ref.id === "string"
        ? ref.id
        : null
    )
    .filter((id): id is string => !!id);

  let orderedDocs: Content.NavSectionDocument[] = [];

  if (ids.length) {
    try {
      const fetched = await client.getAllByIDs<Content.NavSectionDocument>(ids);
      const byId = new Map(fetched.map((d) => [d.id, d]));
      orderedDocs = ids
        .map((id) => byId.get(id))
        .filter((d): d is Content.NavSectionDocument => !!d);
    } catch {
      orderedDocs = [];
    }
  }

  const sections: Section[] = orderedDocs
    .map((doc) => {
      const data = doc.data;

      const children: ChildLink[] = (
        Array.isArray(data.child_links) ? data.child_links : []
      )
        .map((row, idx) => {
          const label =
            typeof row.child_label === "string" && row.child_label.trim()
              ? row.child_label.trim()
              : `Item ${idx + 1}`;
          const link = isUsableLink(row.child_link) ? row.child_link : null;
          return { label, link: link as LinkField };
        })
        .filter((r): r is ChildLink => !!r.link);

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
  const breadcrumbSettings = await client
    .getSingle<Content.BreadcrumbSettingsDocument>("breadcrumb_settings")
    .catch(() => null);

  const hiddenSegments: string[] =
    breadcrumbSettings?.data?.hidden_segments
      ?.map((row) =>
        typeof row.segment === "string" ? row.segment.trim().toLowerCase() : ""
      )
      .filter((slug): slug is string => slug.length > 0) ?? [];

  // Delegate actual breadcrumb rendering + URL handling to the client component
  return (
    <BreadcrumbsClient
      sections={sections}
      hiddenSegments={hiddenSegments}
    />
  );
}
