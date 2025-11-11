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
 * Props for `VirtualProduction`.
 */
export type VirtualProductionProps = SliceComponentProps<any>;

/**
 * Component for "VirtualProduction" Slices.
 */
const VirtualProduction = ({ slice }: VirtualProductionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const backgroundImage = withImageAlt(slice.primary.background_image, "");

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Zoom effect on background
      if (bgRef.current && slice.primary.enable_zoom_effect) {
        gsap.fromTo(
          bgRef.current,
          {
            scale: 1.2,
          },
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
      } else if (bgRef.current) {
        // Fallback parallax
        gsap.to(bgRef.current, {
          yPercent: 20,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      }

      // Content slide in from left
      gsap.from(contentRef.current, {
        opacity: 0,
        x: -80,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
      });

      // Title fade in
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 75%",
        },
      });

      // Subtitle fade in
      gsap.from(subtitleRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 70%",
        },
      });

      // Description fade in
      gsap.from(descRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.4,
        ease: "power3.out",
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 65%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [slice.primary.enable_zoom_effect]);

  const positionClass = {
    left: "justify-start",
    center: "justify-center text-center",
    right: "justify-end text-right",
  };

  const contentPosition =
    positionClass[
      slice.primary.content_position as keyof typeof positionClass
    ] || positionClass.left;

  return (
    <section
      ref={sectionRef}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background Image with Zoom/Parallax */}
      {backgroundImage && (
        <div
          ref={bgRef}
          className="absolute inset-0 z-0 will-change-transform origin-center"
          style={{ transform: "translate3d(0, 0, 0)" }}
        >
          <PrismicNextImage
            field={backgroundImage}
            fill
            className="object-cover"
            quality={90}
            alt=""
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#040a18]/90 via-[#040a18]/60 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className={`flex ${contentPosition}`}>
          <div ref={contentRef} className="max-w-2xl space-y-6">
            {/* Title */}
            {slice.primary.title && (
              <div ref={titleRef}>
                <PrismicRichText
                  field={slice.primary.title}
                  components={{
                    heading2: ({ children }) => (
                      <h2 className="text-[#8df6ff] text-4xl md:text-5xl lg:text-6xl font-bold">
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
                className="text-white text-xl md:text-2xl lg:text-3xl font-semibold"
              >
                {slice.primary.subtitle}
              </p>
            )}

            {/* Description */}
            {slice.primary.description && (
              <div
                ref={descRef}
                className="text-white/80 text-lg md:text-xl leading-relaxed space-y-4"
              >
                <PrismicRichText field={slice.primary.description} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#040a18] to-transparent pointer-events-none" />
    </section>
  );
};

export default VirtualProduction;
