"use client";

import { useEffect, useRef } from "react";
import type { JSX } from "react";
import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import { withImageAlt } from "@/lib/prismicImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export type EducationWorldProps =
  SliceComponentProps<Content.EducationWorldSlice>;

const EducationWorld = ({ slice }: EducationWorldProps): JSX.Element => {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const backgroundImage = withImageAlt(slice.primary.background_image, "");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      if (bgRef.current) {
        gsap.to(bgRef.current, {
          scale: 1.05,
          ease: "none",
          scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: 1 },
        });
      }

      gsap.from([titleRef.current, subtitleRef.current, bodyRef.current], {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="relative min-h-[90svh] flex items-center overflow-hidden bg-[#071327]"
    >
      {backgroundImage && (
        <div ref={bgRef} className="absolute inset-0 -z-10">
          <PrismicNextImage field={backgroundImage} fill className="object-cover" quality={90} alt="" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071327]/95 via-[#071327]/70 to-transparent" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl space-y-6">
          {slice.primary.title && (
            <div ref={titleRef}>
              <PrismicRichText
                field={slice.primary.title}
                components={{ heading2: ({ children }) => (
                  <h2 className="text-[#8df6ff] text-3xl md:text-5xl font-extrabold">{children}</h2>
                ) }}
              />
            </div>
          )}

          {slice.primary.subtitle && (
            <div ref={subtitleRef} className="text-white text-2xl md:text-3xl font-semibold">
              {slice.primary.subtitle}
            </div>
          )}

          {slice.primary.description && (
            <div ref={bodyRef} className="text-white/85 text-lg leading-relaxed">
              <PrismicRichText field={slice.primary.description} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default EducationWorld;
