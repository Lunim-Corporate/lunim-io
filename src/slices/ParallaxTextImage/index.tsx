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
      if (textEls?.length) {
        gsap.from(textEls, {
          opacity: 0,
          y: 24,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current!, start: "top 80%" },
        });
      }

      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll("[data-pt-card]");
        if (cards.length) {
          gsap.from(cards, {
            opacity: 0,
            y: 20,
            duration: 0.6,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: gridRef.current, start: "top 85%" },
          });
        }
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [slice.primary.enable_parallax, slice.primary.enable_zoom_effect]);

  const bgField = slice.primary.background_image as ImageLike | null;
  const bgDecorative = bgField?.url ? bgField : null;

  const variation = slice.variation || "default";
  const align = (slice.primary.text_alignment as string) || "left";
  const textAlignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";

  return (
    <section
      ref={sectionRef}
      data-slice-type={slice.slice_type}
      data-slice-variation={variation}
      className="relative py-20 md:py-28 overflow-hidden bg-black"
    >
      {bgDecorative?.url && (
        <div ref={bgRef} className="absolute inset-0 -z-10 will-change-transform">
          <PrismicNextImage field={bgDecorative as any} fill className="object-cover" quality={90} fallbackAlt="" />
          {slice.primary.overlay_style === "gradient_dark" && (
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          )}
          {slice.primary.overlay_style === "gradient_light" && (
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-transparent" />
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={variation === "faceGrid" ? "grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center" : "max-w-2xl mx-auto"}>
          {/* Left/Text column (or centered) */}
          <div className={textAlignClass}>
            {hasRT(slice.primary.eyebrow_text) && (
              <p data-pt-text className="text-[#8df6ff] text-2xl md:text-3xl font-bold uppercase tracking-wide">
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
                  <span className="mt-2 w-2 h-2 rounded-full bg-[#8df6ff]" />
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
