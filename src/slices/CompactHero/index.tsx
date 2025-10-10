"use client";

import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { PrismicRichText, PrismicLink } from "@prismicio/react";
import { asText } from "@prismicio/helpers";

/**
 * Props for `CompactHero`.
 */
export type CompactHeroProps = SliceComponentProps<Content.CompactHeroSlice>;

/**
 * Helper to extract metadata (OG image & title) from this slice.
 */
export const pickMetaFromCompactHero = (slice: Content.CompactHeroSlice) => {
  const p: any = slice.primary || {};
  const ogImage =
    p.hero_image?.url || p.background_image?.url || "";

  const titleFromHero =
    (p.hero_title && Array.isArray(p.hero_title) && p.hero_title[0]?.text) ||
    [asText(p.hero_title_part1), asText(p.hero_title_part2)].filter(Boolean).join(" ").trim() ||
    "";

  return { ogImage, titleFromHero };
};

/**
 * Component for "CompactHero" Slice.
 * Works with the current model.json:
 *  - hero_image (Image)
 *  - hero_title (StructuredText)
 * And also accepts older fields:
 *  - background_image, hero_title_part1, hero_title_part2, hero_description, button_1_link, button_1_label
 */
const CompactHero: FC<CompactHeroProps> = ({ slice }) => {
  const p: any = slice.primary || {};

  // Prefer new schema fields
  const bg = p.hero_image?.url || p.background_image?.url;
  const titleNew = p.hero_title; // StructuredText
  const title1Old = p.hero_title_part1;
  const title2Old = p.hero_title_part2;
  const description = p.hero_description;
  const ctaLink = p.button_1_link;
  const ctaLabel = p.button_1_label;

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="relative min-h-[56vh] flex items-center overflow-hidden bg-black"
      style={
        bg
          ? {
              backgroundImage: `url(${bg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      {/* dark overlay to ensure text contrast */}
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center">
          <div role="heading" aria-level={1} className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {/* New single-title field (may already render an <h1>) */}
            {titleNew ? <PrismicRichText field={titleNew} /> : null}

            {/* Old split title fields (kept for backward-compat) */}
            {!titleNew && title1Old ? <PrismicRichText field={title1Old} /> : null}
            {!titleNew && title2Old ? (
              <span className="block bg-gradient-to-r from-[#BBFEFF] to-cyan-500 bg-clip-text text-transparent">
                <PrismicRichText field={title2Old} />
              </span>
            ) : null}
          </div>

          {/* Optional description (legacy) */}
          {description ? (
            <div className="text-lg md:text-xl text-gray-200/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              <PrismicRichText field={description} />
            </div>
          ) : null}

          {/* Optional CTA (legacy) */}
          {ctaLink && ctaLabel ? (
            <div className="flex justify-center">
              <PrismicLink
                field={ctaLink}
                className="inline-flex items-center justify-center px-8 py-4 rounded-md font-semibold shadow-lg transition-colors duration-300 bg-[#BBFEFF] text-black hover:bg-cyan-300"
              >
                {ctaLabel}
              </PrismicLink>
            </div>
          ) : null}
        </div>
      </div>

      {/* subtle decorative glows */}
      <div className="pointer-events-none absolute -top-10 -left-10 w-40 h-40 rounded-full bg-cyan-400/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-cyan-500/10 blur-2xl" />
    </section>
  );
};

export default CompactHero;
