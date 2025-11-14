"use client";

import { useEffect, useRef } from "react";
import type { SliceComponentProps } from "@prismicio/react";
import { PrismicRichText } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";
import { withImageAlt } from "@/lib/prismicImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export type ParallaxTextImageProps = SliceComponentProps<any>;

type ImageLike = { url?: string | null; alt?: string | null };

const hasRT = (field: any): boolean => {
  if (!field) return false;
  if (Array.isArray(field)) return field.length > 0;
  if (typeof field === "string") return field.trim().length > 0;
  return !!field;
};

export default function ParallaxTextImage({ slice }: ParallaxTextImageProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const preset = (slice.primary.animation_preset as string) || "fade-up";

    const ctx = gsap.context(() => {
      if (bgRef.current) {
        if (slice.primary.enable_zoom_effect) {
          gsap.fromTo(
            bgRef.current,
            { scale: 1.12 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top bottom",
                end: "center center",
                scrub: 1,
              },
            }
          );
        } else if (slice.primary.enable_parallax) {
          gsap.to(bgRef.current, {
            yPercent: 12,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          });
        }
      }

      const textEls = sectionRef.current?.querySelectorAll("[data-pt-text]");
      if (textEls?.length && preset !== "none") {
        const base = {
          opacity: 0,
          duration: 0.8,
          stagger: preset === "stagger-strong" ? 0.18 : 0.12,
          ease: preset === "stagger-strong" ? "back.out(1.4)" : "power3.out",
          scrollTrigger: { trigger: sectionRef.current!, start: "top 80%" },
        } as any;

        if (preset === "slide-left") {
          gsap.from(textEls, { ...base, x: -30 });
        } else {
          gsap.from(textEls, { ...base, y: 24 });
        }
      }

      if (gridRef.current && preset !== "none") {
        const cards = gridRef.current.querySelectorAll("[data-pt-card]");
        if (cards.length) {
          gsap.from(cards, {
            opacity: 0,
            y: preset === "slide-left" ? 0 : 20,
            x: preset === "slide-left" ? -20 : 0,
            duration: 0.6,
            stagger: preset === "stagger-strong" ? 0.12 : 0.08,
            ease: preset === "stagger-strong" ? "back.out(1.4)" : "power3.out",
            scrollTrigger: { trigger: gridRef.current, start: "top 85%" },
          });
        }
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [slice.primary.enable_parallax, slice.primary.enable_zoom_effect, slice.primary.animation_preset]);

  const bgField = slice.primary.background_image as ImageLike | null;
  const bgDecorative = bgField?.url ? bgField : null;

  const variation = slice.variation || "default";
  const align = (slice.primary.text_alignment as string) || "left";
  const textAlignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
  const contentPos = (slice.primary.content_position as string) || "top-left";
  const wrapperClass = variation === "faceGrid"
    ? "grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
    : contentPos === "top-left" ? "max-w-2xl" : "max-w-2xl mx-auto";

  // Colors and spacing
  const accent = (slice.primary.accent_color as string) || "#8df6ff";
  const textColor = (slice.primary.text_color as string) || "#ffffff";
  const spacingTop = slice.primary.spacing_top as string;
  const spacingBottom = slice.primary.spacing_bottom as string;
  const ptClass = spacingTop === "tight" ? "pt-16 md:pt-20" : spacingTop === "relaxed" ? "pt-28 md:pt-36" : "pt-20 md:pt-28";
  const pbClass = spacingBottom === "tight" ? "pb-16 md:pb-20" : spacingBottom === "relaxed" ? "pb-28 md:pb-36" : "pb-20 md:pb-28";

  const stylePreset = (slice.primary.style_preset as string) || "default";
  const overlayStrength = (slice.primary.overlay_strength as string) || "medium";

  const cyanGlow = stylePreset === "cyanGlow";

  return (
    <section
      ref={sectionRef}
      data-slice-type={slice.slice_type}
      data-slice-variation={variation}
      className={`relative ${ptClass} ${pbClass} overflow-hidden ${stylePreset === "noir" ? "bg-black" : "bg-black"}`}
    >
      {bgDecorative?.url && (
        <div ref={bgRef} className="absolute inset-0 -z-10 will-change-transform">
          <PrismicNextImage field={bgDecorative as any} fill className="object-cover" quality={90} fallbackAlt="" />
          {slice.primary.overlay_style === "gradient_dark" && (
            <div className={`absolute inset-0 bg-gradient-to-r ${overlayStrength === "subtle" ? "from-black/60 via-black/35" : overlayStrength === "strong" ? "from-black/90 via-black/70" : "from-black/80 via-black/50"} to-transparent`} />
          )}
          {slice.primary.overlay_style === "gradient_light" && (
            <div className={`absolute inset-0 bg-gradient-to-b ${overlayStrength === "subtle" ? "from-black/25 via-black/15" : overlayStrength === "strong" ? "from-black/55 via-black/35" : "from-black/40 via-black/25"} to-transparent`} />
          )}
          {cyanGlow && <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(141,246,255,0.12),transparent_60%)]" />}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ color: textColor }}>
        <div className={wrapperClass}>
          {/* Left/Text column (or centered) */}
          <div className={textAlignClass}>
            {hasRT(slice.primary.eyebrow_text) && (
              <p data-pt-text className="text-2xl md:text-3xl font-bold uppercase tracking-wide" style={{ color: accent }}>
                {slice.primary.eyebrow_text}
              </p>
            )}

            {hasRT(slice.primary.heading) && (
              <div data-pt-text className="mt-3">
                <PrismicRichText
                  field={slice.primary.heading}
                  components={{
                    heading1: ({ children }) => <h1 className="text-white text-4xl md:text-5xl font-extrabold">{children}</h1>,
                    heading2: ({ children }) => <h2 className="text-white text-3xl md:text-4xl font-extrabold">{children}</h2>,
                  }}
                />
              </div>
            )}

            {hasRT(slice.primary.subtitle) && (
              <p data-pt-text className="text-white/90 text-xl md:text-2xl mt-3">
                {slice.primary.subtitle}
              </p>
            )}

            {hasRT(slice.primary.body_text) && (
              <div data-pt-text className="text-white/85 text-lg leading-relaxed mt-4">
                <PrismicRichText field={slice.primary.body_text} />
              </div>
            )}

            {/* Optional logo (shown for any variation if provided) */}
            {slice.primary.logo?.url ? (
              <div data-pt-text className="mt-8">
                <PrismicNextImage
                  field={withImageAlt(slice.primary.logo, "Logo") as any}
                  className="max-w-full h-auto max-h-16 md:max-h-20 lg:max-h-24 object-contain"
                />
              </div>
            ) : null}
          </div>

          {/* Right column for faceGrid */}
          {variation === "faceGrid" && slice.items?.length ? (
            <div ref={gridRef} className="relative">
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-9 gap-1 md:gap-2">
                {slice.items.map((item: any, index: number) => (
                  <div key={index} data-pt-card className="aspect-square overflow-hidden rounded-sm bg-[#8df6ff]/5">
                    {item.face_image?.url && (
                      <PrismicNextImage
                        field={withImageAlt(item.face_image, item.person_name || "Team member") as any}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Bullets variation */}
          {variation === "bullets" && slice.items?.length ? (
            <div className="mt-8 space-y-4 max-w-2xl">
              {slice.items.map((item: any, i: number) => (
                <div key={i} data-pt-text className="flex items-start gap-3">
                  <span className="mt-2 w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
                  <span className="text-white/90 text-base md:text-lg">{item.bullet_point}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
