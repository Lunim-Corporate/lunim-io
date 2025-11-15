"use client";

import { useRef, useEffect } from "react";
import type { SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import { withImageAlt } from "@/lib/prismicImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Props for `TransmediaHero`.
 */
export type TransmediaHeroProps = SliceComponentProps<any>;

/**
 * Component for "TransmediaHero" Slices.
 */
const TransmediaHero = ({ slice }: TransmediaHeroProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const backgroundImage = withImageAlt(slice.primary.background_image, "");
  const logoImage = withImageAlt(
    slice.primary.logo,
    slice.primary.subtitle || "Transmedia hero logo"
  );

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Logo fade in with glow
      gsap.from(logoRef.current, {
        opacity: 0,
        y: 30,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.2,
      });

      // Title fade in
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power3.out",
        delay: 0.6,
      });

      // Subtitle fade in
      gsap.from(subtitleRef.current, {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power3.out",
        delay: 0.9,
      });

      // Tagline fade in
      gsap.from(taglineRef.current, {
        opacity: 0,
        y: 20,
        duration: 1,
        ease: "power3.out",
        delay: 1.2,
      });

      // Parallax background on scroll
      if (slice.primary.enable_parallax && bgRef.current) {
        gsap.to(bgRef.current, {
          yPercent: 20,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [slice.primary.enable_parallax]);

  return (
    <section
      ref={sectionRef}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#040a18] isolate"
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
            priority
            quality={90}
            alt=""
          />
        </div>
      )}

      {/* Content */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Logo  */}
        {logoImage && (
          <div
            ref={logoRef}
            className="mb-12 flex justify-center w-full"
          >
            <div className="relative z-30 w-full max-w-[834px] aspect-[834/254] mx-auto px-4">
              <PrismicNextImage
                field={logoImage}
                fill
                sizes="(min-width: 1280px) 834px, (min-width: 1024px) 800px, (min-width: 768px) 700px, 90vw"
                className="object-contain drop-shadow-[0_0_24px_rgba(141,246,255,0.55)]"
                priority
              />
            </div>
          </div>
        )}

        {/* Main Title */}
        {slice.primary.main_title && (
          <div
            ref={titleRef}
            className="mb-8 w-full"
          >
            <PrismicRichText
              field={slice.primary.main_title}
              components={{
                heading1: ({ children }) => (
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-[#FFFBD0] tracking-wider uppercase whitespace-normal lg:whitespace-nowrap">
                    {children}
                  </h1>
                ),
              }}
            />
          </div>
        )}

        {/* Subtitle */}
        {slice.primary.subtitle && (
          <p
            ref={subtitleRef}
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 mb-6 max-w-4xl mx-auto font-light"
          >
            {slice.primary.subtitle}
          </p>
        )}

        {/* Tagline */}
        {slice.primary.tagline && (
          <p
            ref={taglineRef}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#8df6ff] font-medium tracking-wide"
          >
            {slice.primary.tagline}
          </p>
        )}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-[#8df6ff] rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default TransmediaHero;