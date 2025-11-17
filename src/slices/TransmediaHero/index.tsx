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
  const sweepRef = useRef<HTMLDivElement>(null);
  const backgroundImage = withImageAlt(slice.primary.background_image, "");
  const logoImage = withImageAlt(
    slice.primary.logo,
    slice.primary.subtitle || "Transmedia hero logo"
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      // WOW pinned sequence: pin section, animate bg, sweep, logo, and text
      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=140%",
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
        },
      });

      if (bgRef.current) {
        heroTl.fromTo(
          bgRef.current,
          { scale: 1.12, yPercent: -6 },
          { scale: 1, yPercent: 0, ease: "none" },
          0
        );
      }

      if (sweepRef.current) {
        heroTl.fromTo(
          sweepRef.current,
          { xPercent: -120, opacity: 0 },
          { xPercent: 120, opacity: 1, ease: "none" },
          0.1
        );
      }

      heroTl.fromTo(logoRef.current, 
              { opacity: 0, y: 80, scale: 0.92, filter: "blur(10px)" },
              { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", ease: "none" },
              0.15)
            .to(logoRef.current, { filter: "drop-shadow(0 0 24px rgba(141,246,255,0.75))", duration: 0.2 }, ">-0.05");

      heroTl.fromTo(titleRef.current,
              { opacity: 0, y: 90, filter: "blur(12px)", letterSpacing: "0.15em" },
              { opacity: 1, y: 0, filter: "blur(0px)", letterSpacing: "0.15em", ease: "none" },
              0.25)
            .to(titleRef.current, { letterSpacing: "0em", ease: "none" }, ">");

      heroTl.fromTo(subtitleRef.current,
              { opacity: 0, y: 60, filter: "blur(6px)" },
              { opacity: 1, y: 0, filter: "blur(0px)", ease: "none" },
              ">-0.05")
            .fromTo(taglineRef.current,
              { opacity: 0, y: 40, filter: "blur(4px)" },
              { opacity: 1, y: 0, filter: "blur(0px)", ease: "none" },
              ">-0.03");

      // Background subtle parallax while pinned
      if (slice.primary.enable_parallax && bgRef.current) {
        gsap.to(bgRef.current, {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=140%",
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
      style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 6%, black 94%, transparent)', maskImage: 'linear-gradient(to bottom, transparent, black 6%, black 94%, transparent)' }}
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

      {/* Content - Hidden initially, revealed by GSAP */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Logo  */}
        {logoImage && (
          <div
            ref={logoRef}
            className="mb-12 flex justify-center w-full opacity-0"
          >
            <div className="relative z-30 w-full max-w-[834px] aspect-[834/254] mx-auto px-4" style={{ transform: "translate(-5px, -10px)" }}>
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
            className="mb-8 w-full opacity-0"
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
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 mb-6 max-w-4xl mx-auto font-light opacity-0"
          >
            {slice.primary.subtitle}
          </p>
        )}

        {/* Tagline */}
        {slice.primary.tagline && (
          <p
            ref={taglineRef}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#8df6ff] font-medium tracking-wide opacity-0"
          >
            {slice.primary.tagline}
          </p>
        )}
      </div>

      {/* Sweep light effect */}
      <div ref={sweepRef} className="pointer-events-none absolute inset-y-0 left-[-20%] w-[40%] bg-[linear-gradient(90deg,transparent,rgba(141,246,255,0.35),transparent)] mix-blend-screen blur-md" />

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