"use client";

import { useEffect, useRef } from "react";
import type { SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export type MediaFinaleProps = SliceComponentProps<any>;

const MediaFinale = ({ slice }: MediaFinaleProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    if (slice.primary.enable_parallax && bgRef.current) {
      const ctx = gsap.context(() => {
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
      }, sectionRef);
      return () => ctx.revert();
    }
  }, [slice.primary.enable_parallax]);

  return (
    <section
      ref={sectionRef}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="relative min-h-[90svh] flex items-center justify-center overflow-hidden bg-[#03070f]"
    >
      {slice.primary.background_image?.url && (
        <div ref={bgRef} className="absolute inset-0 -z-10 will-change-transform">
          <PrismicNextImage field={slice.primary.background_image} fill className="object-cover" quality={90} fallbackAlt="" />
        </div>
      )}

      <div className="relative z-10 text-center px-4">
        {slice.primary.logo?.url && (
          <div className="mb-8 flex justify-center">
            <PrismicNextImage field={slice.primary.logo} className="h-20 w-auto object-contain" />
          </div>
        )}

        {slice.primary.main_title && (
          <PrismicRichText
            field={slice.primary.main_title}
            components={{ heading2: ({ children }) => (
              <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-wide">{children}</h2>
            ) }}
          />
        )}

        {slice.primary.subtitle && (
          <p className="mt-4 text-xl md:text-2xl text-white/90">{slice.primary.subtitle}</p>
        )}

        {slice.primary.cta_text && (
          <p className="mt-10 text-2xl md:text-3xl font-bold text-white bg-[#071327]/70 inline-block px-6 py-3 rounded-full border border-white/10">
            {slice.primary.cta_text}
          </p>
        )}
      </div>
    </section>
  );
};

export default MediaFinale;