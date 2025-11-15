"use client";

import { useRef, useEffect } from "react";
import type { SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import { withImageAlt } from "@/lib/prismicImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Props for `TheShoot`.
 */
export type TheShootProps = SliceComponentProps<any>;

/**
 * Component for "TheShoot" Slices.
 */
const TheShoot = ({ slice }: TheShootProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const backgroundImage = withImageAlt(slice.primary.background_image, "");

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax background
      if (bgRef.current) {
        gsap.to(bgRef.current, {
          yPercent: 18,
          scale: 1.05,
          transformOrigin: "center",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      }

      // Scrubbed reveal for title/subtitle and bullets
      const tl = gsap.timeline({ scrollTrigger: { trigger: sectionRef.current, start: "top 80%", end: "top 30%", scrub: 0.6 } });
      tl.from(titleRef.current, { opacity: 0, y: 48, filter: "blur(6px)" })
        .from(subtitleRef.current, { opacity: 0, y: 28, filter: "blur(4px)" }, "-=0.1");
      if (listRef.current) {
        const bullets = listRef.current.querySelectorAll("li");
        gsap.timeline({ scrollTrigger: { trigger: listRef.current, start: "top 90%", end: "top 40%", scrub: 0.5 } })
          .from(bullets, { opacity: 0, x: -36, filter: "blur(4px)", stagger: 0.12, ease: "none" });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

   return (
    <section
      ref={sectionRef}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="relative min-h-screen flex items-start justify-start overflow-hidden"
    >
      {/* Background Image with Parallax */}
      {backgroundImage && (
        <div
          ref={bgRef}
          className="absolute inset-0 z-0 will-change-transform"
          style={{ transform: "translate3d(0, 0, 0)" }}
        >
          <PrismicNextImage
            field={backgroundImage}
            fill
            className="object-cover"
            quality={90}
            fallbackAlt=""
          />
          {/* Lighter overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#040a18]/70 via-[#040a18]/75 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className={`flex flex-col items-start text-left max-w-2xl`}>
          {/* Title */}
          {slice.primary.title && (
            <div ref={titleRef}>
              <PrismicRichText
                field={slice.primary.title}
                components={{
                  heading2: ({ children }) => (
                    <h2 className="text-[#8df6ff] text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                      {children}
                    </h2>
                  ),
                }}
              />
            </div>
          )}

          {/* Subtitle */}
          {slice.primary.subtitle && (
            <p
              ref={subtitleRef}
              className="text-white text-xl md:text-2xl lg:text-3xl font-semibold mb-8 leading-tight"
            >
              {slice.primary.subtitle}
            </p>
          )}

          {/* Bullet Points */}
          {slice.items && slice.items.length > 0 && (
            <ul
              ref={listRef}
              className="space-y-4 list-none"
            >
              {slice.items.map((item: any, index: number) => (
                <li
                  key={index}
                  className="flex items-start gap-4 text-white text-lg md:text-xl"
                >
                  {/* Bullet indicator */}
                  <span className="flex-shrink-0 w-2 h-2 mt-2 md:mt-2 rounded-full bg-[#8df6ff] shadow-[0_0_10px_rgba(141,246,255,0.6)]" />
                  <span className="leading-snug">{item.bullet_point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default TheShoot;
