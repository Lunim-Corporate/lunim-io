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

export type CollectiblesProps = SliceComponentProps<any>;

const Collectibles = ({ slice }: CollectiblesProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const backgroundImage = slice.primary.background_image?.url ? slice.primary.background_image : null;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll(".collectible-card");
        gsap.from(cards, {
          opacity: 0,
          y: 30,
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: gridRef.current, start: "top 85%" },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} data-slice-type={slice.slice_type} data-slice-variation={slice.variation} className="relative py-20 md:py-28 overflow-hidden bg-[#03070f]">
      {backgroundImage && (
        <div className="absolute inset-0 -z-10">
          <PrismicNextImage field={backgroundImage as any} fill className="object-cover" quality={85} fallbackAlt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {slice.primary.title && (
          <div className="mb-10">
            <PrismicRichText field={slice.primary.title} components={{ heading2: ({ children }) => (
              <h2 className="text-[#8df6ff] text-3xl md:text-5xl font-extrabold text-center">{children}</h2>
            ) }} />
          </div>
        )}

        <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {slice.items.map((item: any, idx: number) => (
            <article key={idx} className="collectible-card rounded-xl overflow-hidden bg-[#0b1222] border border-white/5 shadow-[0_0_20px_rgba(141,246,255,0.1)]">
              <div className="aspect-[4/3] relative">
                {item.image?.url && (
                  <PrismicNextImage field={{ ...(item.image as any), alt: ((item.title as string) || "Collectible") }} fill className="object-cover" />
                )}
              </div>
              <div className="p-3">
                <h3 className="text-white text-sm font-semibold uppercase tracking-tight line-clamp-2">{item.title}</h3>
                <div className="mt-2 flex items-center justify-between text-xs text-white/70">
                  <span>{item.price_label}</span>
                  {item.cta_label && (
                    <span className="px-2 py-1 rounded-md bg-[#8df6ff]/15 text-[#8df6ff] border border-[#8df6ff]/30">{item.cta_label}</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Collectibles;
