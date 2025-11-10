"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { asLink } from "@prismicio/helpers";
import type { LinkField } from "@prismicio/client";

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

type BreadcrumbsClientProps = {
  sections: Section[];
};

const resolveLinkField = (link: LinkField | null | undefined): string | null => {
  if (!link) return null;
  try {
    const url = asLink(link);
    if (!url) return null;
    const clean = url.split("#")[0]?.split("?")[0] ?? url;
    if (!clean) return "/";
    if (clean === "/") return "/";
    return clean.replace(/\/+$/, "");
  } catch {
    return null;
  }
};

const normalizePath = (value: string | null): string | null => {
  if (!value) return null;
  if (value === "/") return "/";
  return value.replace(/\/+$/, "");
};

// Optional nice labels for known segments
const SEGMENT_LABEL_OVERRIDES: Record<string, string> = {
  digital: "Digital",
  ai: "AI",
  "case-studies": "Case Studies",
};

const labelFromSegment = (segment: string): string => {
  const decoded = decodeURIComponent(segment);
  const override = SEGMENT_LABEL_OVERRIDES[decoded.toLowerCase()];
  if (override) return override;

  return decoded
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export default function BreadcrumbsClient({ sections }: BreadcrumbsClientProps) {
  const pathname = usePathname();
  const currentPath = normalizePath(pathname) ?? "/";

  const segments = useMemo(() => {
    if (currentPath === "/") {
      return [];
    }
    return currentPath.split("/").filter(Boolean);
  }, [currentPath]);

  // Build a path -> label map from navigation
  const pathLabelMap = useMemo(() => {
    const map = new Map<string, string>();

    sections.forEach((section) => {
      const sectionPath = normalizePath(resolveLinkField(section.link));
      if (sectionPath) {
        map.set(sectionPath, section.label);
      }

      section.children.forEach((child) => {
        const childPath = normalizePath(resolveLinkField(child.link));
        if (childPath) {
          map.set(childPath, child.label);
        }
      });
    });

    return map;
  }, [sections]);

  const crumbs = useMemo(() => {
    const items: { href: string; label: string }[] = [];

    // Home
    items.push({ href: "/", label: "Home" });

    // For each path prefix: /digital, /digital/ai, /digital/ai/case-studies, ...
    let acc = "";
    segments.forEach((seg) => {
      acc += `/${seg}`;
      const href = acc;
      const label =
        pathLabelMap.get(href) ??
        labelFromSegment(seg); // fallback to prettified segment
      items.push({ href, label });
    });

    return items;
  }, [segments, pathLabelMap]);

  if (segments.length < 3) {
    return null;
  }

  const lastIndex = crumbs.length - 1;

  return (
    <nav
      aria-label="Breadcrumb"
      className="w-full bg-black/40 border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <ol className="flex flex-wrap items-center gap-1 text-xs sm:text-sm text-white/60">
          {crumbs.map((crumb, index) => {
            const isLast = index === lastIndex;
            return (
              <li key={crumb.href} className="flex items-center min-w-0">
                {index > 0 && (
                  <ChevronRight
                    className="w-3 h-3 sm:w-4 sm:h-4 mx-1 text-white/40"
                    aria-hidden="true"
                  />
                )}
                {isLast ? (
                  <span className="font-medium text-white/90 truncate max-w-[200px] sm:max-w-none">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="hover:text-white transition-colors truncate max-w-[140px] sm:max-w-none"
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
