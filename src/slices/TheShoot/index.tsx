"use client";

import { useRef, useEffect } from "react";
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

/**
 * Props for `TheShoot`.
 */
export type TheShootProps = SliceComponentProps<Content.TheShootSlice>;

/**
 * Component for "TheShoot" Slices.
 */
const TheShoot = ({ slice }: TheShootProps): JSX.Element => {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const backgroundImage = withImageAlt(slice.primary.background_image, "");

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Parallax background
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

      // Title fade in
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
      });

      // Subtitle fade in
      gsap.from(subtitleRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 65%",
        },
      });

      // Bullet points stagger animation
      if (listRef.current) {
        const bullets = listRef.current.querySelectorAll("li");
        gsap.from(bullets, {
          opacity: 0,
          x: -50,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: listRef.current,
            start: "top 75%",
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const alignmentClass = {
    left: "items-start text-left",
    center: "items-center text-center",
    right: "items-end text-right",
  };

  const textAlign =
    alignmentClass[
      slice.primary.text_alignment as keyof typeof alignmentClass
    ] || alignmentClass.left;

  return (
    <section
      ref={sectionRef}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="relative min-h-screen flex items-center overflow-hidden"
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
            alt=""
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#040a18]/95 via-[#040a18]/80 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className={`flex flex-col ${textAlign} max-w-2xl`}>
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
              className="text-white text-xl md:text-2xl lg:text-3xl font-semibold mb-12"
            >
              {slice.primary.subtitle}
            </p>
          )}

          {/* Bullet Points */}
          {slice.items && slice.items.length > 0 && (
            <ul
              ref={listRef}
              className="space-y-6 list-none"
            >
              {slice.items.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-4 text-white text-lg md:text-xl"
                >
                  {/* Bullet indicator */}
                  <span className="flex-shrink-0 w-2 h-2 mt-2 md:mt-3 rounded-full bg-[#8df6ff] shadow-[0_0_10px_rgba(141,246,255,0.6)]" />
                  <span>{item.bullet_point}</span>
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
