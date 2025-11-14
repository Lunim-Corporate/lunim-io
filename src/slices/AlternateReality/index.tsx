"use client";

import { useEffect, useRef } from "react";
import type { SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { withImageAlt } from "@/lib/prismicImage";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export type AlternateRealityProps = SliceComponentProps<any>;

const AlternateReality = ({ slice }: AlternateRealityProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const backgroundImage = withImageAlt(slice.primary.background_image, "");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      if (bgRef.current) {
        gsap.to(bgRef.current, {
          yPercent: 15,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      }

      gsap.from([eyebrowRef.current, titleRef.current, bodyRef.current], {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="relative min-h-[90svh] flex items-start overflow-hidden bg-black"
    >
      {/* Background */}
      {backgroundImage && (
        <div ref={bgRef} className="absolute inset-0 -z-10 will-change-transform">
          <PrismicNextImage
            field={backgroundImage}
            fill
            priority={false}
            quality={90}
            className="object-cover"
            fallbackAlt=""
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-transparent" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl space-y-6">
          {slice.primary.title && (
            <div ref={eyebrowRef}>
              <PrismicRichText
                field={slice.primary.title}
                components={{
                  heading2: ({ children }) => (
                    <h2 className="text-[#8df6ff] text-3xl md:text-5xl font-extrabold">
                      {children}
                    </h2>
                  ),
                }}
              />
            </div>
          )}

          {slice.primary.subtitle && (
            <p
              ref={titleRef}
              className="text-white text-2xl md:text-3xl font-semibold"
            >
              {slice.primary.subtitle}
            </p>
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

export default AlternateReality;
