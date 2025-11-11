"use client";

import { useRef, useEffect } from "react";
import type { SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Props for `GlobalCommunity`.
 */
export type GlobalCommunityProps = SliceComponentProps<any>;

/**
 * Component for "GlobalCommunity" Slices.
 */
const GlobalCommunity = ({ slice }: GlobalCommunityProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Eyebrow text fade in
      gsap.from(eyebrowRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      // Heading slide in
      gsap.from(headingRef.current, {
        opacity: 0,
        x: -30,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        },
      });

      // Body text fade in
      gsap.from(bodyRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
      });

      // Logo parallax
      gsap.to(logoRef.current, {
        y: -30,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });

      // Face grid stagger animation
      if (gridRef.current) {
        const faces = gridRef.current.querySelectorAll(".face-item");
        gsap.from(faces, {
          opacity: 0,
          scale: 0.8,
          duration: 0.6,
          stagger: {
            amount: 1.5,
            from: "random",
          },
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 80%",
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const bgClasses = {
    "dark-blue": "bg-[#071327]",
    black: "bg-black",
    "gradient-dark":
      "bg-gradient-to-b from-[#040a18] via-[#071327] to-[#03070f]",
  };

  const bgClass =
    bgClasses[
      slice.primary.background_color as keyof typeof bgClasses
    ] || bgClasses["dark-blue"];

  return (
    <section
      ref={sectionRef}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={`relative py-20 md:py-32 ${bgClass} overflow-hidden`}
    >
      {/* Particle effect overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(141,246,255,0.1),transparent_50%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Text Content */}
          <div className="space-y-6">
            {/* Eyebrow */}
            {slice.primary.eyebrow_text && (
              <p
                ref={eyebrowRef}
                className="text-[#8df6ff] text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-wide"
              >
                {slice.primary.eyebrow_text}
              </p>
            )}

            {/* Heading */}
            {slice.primary.heading && (
              <div ref={headingRef}>
                <PrismicRichText
                  field={slice.primary.heading}
                  components={{
                    heading2: ({ children }) => (
                      <h2 className="text-white text-3xl md:text-4xl lg:text-5xl font-semibold">
                        {children}
                      </h2>
                    ),
                  }}
                />
              </div>
            )}

            {/* Body Text */}
            {slice.primary.body_text && (
              <div ref={bodyRef} className="text-white/80 text-lg leading-relaxed space-y-4">
                <PrismicRichText field={slice.primary.body_text} />
              </div>
            )}

            {/* Tabb Logo */}
            {slice.primary.tabb_logo?.url && (
              <div ref={logoRef} className="pt-8 will-change-transform">
                <PrismicNextImage
                  field={slice.primary.tabb_logo}
                  className="w-32 md:w-40 h-auto object-contain"
                />
              </div>
            )}
          </div>

          {/* Right Column: Face Grid */}
          {slice.items && slice.items.length > 0 && (
            <div ref={gridRef} className="relative">
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-9 gap-1 md:gap-2">
                {slice.items.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="face-item aspect-square overflow-hidden rounded-sm bg-[#8df6ff]/5"
                  >
                    {item.face_image?.url && (
                      <PrismicNextImage
                        field={item.face_image}
                        className="w-full h-full object-cover"
                        alt={item.person_name || "Team member"}
                      />
                    )}
                  </div>
                ))}
              </div>
              {/* Cyan overlay glow */}
              <div className="absolute inset-0 bg-[#8df6ff]/5 pointer-events-none mix-blend-soft-light" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default GlobalCommunity;
