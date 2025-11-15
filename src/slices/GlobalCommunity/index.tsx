"use client";

import { useRef, useEffect } from "react";
import type { SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import { withImageAlt } from "@/lib/prismicImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SphereImageGrid from "@/components/ui/img-sphere";

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
  const tabbLogoImage = withImageAlt(
    slice.primary.tabb_logo,
    slice.primary.eyebrow_text || "Community logo"
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Scrubbed reveal for eyebrow, heading, body
      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: "top 85%", end: "top 35%", scrub: 0.6 },
      });
      tl.from(eyebrowRef.current, { opacity: 0, y: 24, filter: "blur(4px)" })
        .from(headingRef.current, { opacity: 0, x: -40, filter: "blur(6px)" }, "-=0.2")
        .from(bodyRef.current, { opacity: 0, y: 28, filter: "blur(6px)" }, "-=0.1");

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

  const backgroundImage = withImageAlt(slice.primary.background_image, "");

  return (
    <section
      ref={sectionRef}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={`relative py-20 md:py-32 overflow-hidden`}
    >
      {backgroundImage && (
        <div className="absolute inset-0 -z-10">
          <PrismicNextImage field={backgroundImage} fill className="object-cover" quality={85} alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-transparent" />
        </div>
      )}
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
            {tabbLogoImage && (
              <div ref={logoRef} className="pt-8 will-change-transform">
                <PrismicNextImage
                  field={slice.primary.tabb_logo}
                  className="w-32 md:w-40 h-auto object-contain"
                />
              </div>
            )}
          </div>

          {/* Right Column: Face Grid */}
          {((slice.primary as any).sphere_images?.length || slice.items?.length) && (
            <div ref={gridRef} className="relative flex items-center justify-center">
              <SphereImageGrid
                images={((slice.primary as any).sphere_images?.length
                  ? (slice.primary as any).sphere_images
                      .filter((it: any) => it.image?.url)
                      .map((it: any, i: number) => ({ id: String(i + 1), src: it.image.url as string, alt: it.alt || "Community member" }))
                  : slice.items
                      .filter((it: any) => it.face_image?.url)
                      .map((it: any, i: number) => ({ id: String(i + 1), src: it.face_image.url as string, alt: it.person_name || "Community member" })))}
                containerSize={(() => { const s = (slice.primary as any).sphere_size || "medium"; return s==="small"?420:s==="large"?600:520 })()}
                sphereRadius={(() => { const s = (slice.primary as any).sphere_size || "medium"; return s==="small"?150:s==="large"?220:180 })()}
                autoRotate={(slice.primary as any).sphere_auto_rotate !== false}
                className="w-full max-w-[560px]"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default GlobalCommunity;
