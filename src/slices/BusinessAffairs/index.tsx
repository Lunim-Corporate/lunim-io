"use client";

import { useEffect, useRef } from "react";
import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { PrismicRichText } from "@prismicio/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export type BusinessAffairsProps = SliceComponentProps<Content.BusinessAffairsSlice>;

const BusinessAffairs = ({ slice }: BusinessAffairsProps): JSX.Element => {
  const sectionRef = useRef<HTMLElement>(null);
  const svgRefH = useRef<SVGSVGElement>(null);
  const svgRefV = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const tl = gsap.timeline({
      scrollTrigger: { trigger: sectionRef.current, start: "top 70%" }
    });

    // Animate line draw horizontal
    if (svgRefH.current) {
      const path = svgRefH.current.querySelector("path");
      if (path) {
        const length = (path as SVGPathElement).getTotalLength();
        (path as SVGPathElement).style.strokeDasharray = `${length}`;
        (path as SVGPathElement).style.strokeDashoffset = `${length}`;
        tl.to(path, { strokeDashoffset: 0, duration: 1.2, ease: "power2.out" }, 0);
      }
    }
    // Animate line draw vertical (mobile)
    if (svgRefV.current) {
      const path = svgRefV.current.querySelector("path");
      if (path) {
        const length = (path as SVGPathElement).getTotalLength();
        (path as SVGPathElement).style.strokeDasharray = `${length}`;
        (path as SVGPathElement).style.strokeDashoffset = `${length}`;
        tl.to(path, { strokeDashoffset: 0, duration: 1.2, ease: "power2.out" }, 0);
      }
    }

    // Stagger steps
    const stepEls = sectionRef.current?.querySelectorAll(".ba-step");
    if (stepEls?.length) {
      gsap.from(stepEls, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current!, start: "top 75%" },
      });
    }
  }, []);

  // SVG helper
  const HorizontalLine = () => (
    <svg ref={svgRefH} className="hidden md:block w-full h-16" viewBox="0 0 1000 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 32 H984" stroke="rgba(141,246,255,0.6)" strokeWidth="3" fill="none" />
    </svg>
  );

  const NodeOverlay = () => {
    const count = Math.max(1, slice.items.length);
    return (
      <div className="relative hidden md:block" aria-hidden>
        {/* absolute container over the line height */}
        <div className="absolute inset-0 h-16">
          {slice.items.map((item, idx) => {
            const left = (idx / (count - 1)) * 100;
            return (
              <div key={idx} className="absolute top-1/2 -translate-y-1/2" style={{ left: `${left}%`, transform: 'translate(-50%, -50%)' }}>
                <div className="relative w-16 h-16 rounded-full bg-[#0b1222] border-2 border-[#8df6ff]/60 overflow-hidden shadow-[0_0_20px_rgba(141,246,255,0.3)]">
                  {item.node_image?.url && (
                    <PrismicNextImage field={item.node_image} fill className="object-cover" />
                  )}
                </div>
                {/* Top connector + text */}
                {item.top_title || (item.top_description as any)?.length ? (
                  <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-56 text-center">
                    <div className="mx-auto mb-2 h-14 w-px bg-[#8df6ff]/40" />
                    {item.top_title && <p className="text-white font-semibold text-sm">{item.top_title}</p>}
                    {item.top_description && (
                      <div className="text-white/80 text-xs leading-snug mt-1">
                        <PrismicRichText field={item.top_description as any} />
                      </div>
                    )}
                  </div>
                ) : null}
                {/* Bottom connector + text */}
                {item.bottom_title || (item.bottom_description as any)?.length ? (
                  <div className="absolute -bottom-36 left-1/2 -translate-x-1/2 w-56 text-center">
                    <div className="mx-auto mb-2 h-14 w-px bg-[#8df6ff]/40" />
                    {item.bottom_title && <p className="text-white font-semibold text-sm">{item.bottom_title}</p>}
                    {item.bottom_description && (
                      <div className="text-white/80 text-xs leading-snug mt-1">
                        <PrismicRichText field={item.bottom_description as any} />
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  const VerticalLine = () => (
    <svg ref={svgRefV} className="md:hidden w-16 h-[520px] mx-auto" viewBox="0 0 64 1000" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 16 V984" stroke="rgba(141,246,255,0.6)" strokeWidth="3" fill="none" />
    </svg>
  );

  return (
    <section ref={sectionRef} data-slice-type={slice.slice_type} data-slice-variation={slice.variation} className="relative py-20 md:py-28 bg-[#040a18] overflow-hidden">
      {/* Background Image */}
      {slice.primary.background_image?.url && (
        <div className="absolute inset-0 -z-10">
          <PrismicNextImage field={slice.primary.background_image} fill className="object-cover" quality={85} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {slice.primary.title && (
          <div className="text-center mb-10">
            <PrismicRichText field={slice.primary.title} components={{ heading2: ({ children }) => (
              <h2 className="text-[#8df6ff] text-3xl md:text-5xl font-extrabold">{children}</h2>
            ) }} />
            {slice.primary.subtitle && (
              <p className="text-white text-lg md:text-xl mt-2">{slice.primary.subtitle}</p>
            )}
          </div>
        )}

        {/* Horizontal line on md+ */}
        <div className="relative hidden md:block">
          <HorizontalLine />
          <NodeOverlay />
        </div>
        {/* Vertical line on mobile */}
        <VerticalLine />

        {/* Steps (mobile textual list) */}
        <div className="mt-6 grid grid-cols-1 md:hidden gap-6">
          {slice.items.map((item, idx) => (
            <div key={idx} className="ba-step flex md:flex-col items-center md:items-start gap-3 md:gap-2">
              <div className="relative w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-[#0b1222] border-2 border-[#8df6ff]/40 shrink-0 overflow-hidden">
                {item.node_image?.url ? (
                  <PrismicNextImage field={item.node_image} fill className="object-cover" />
                ) : (
                  <span className="text-[#8df6ff] font-bold text-sm">{idx + 1}</span>
                )}
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm md:text-base">{item.step_title}</h3>
                {item.step_description && (
                  <p className="text-white/70 text-xs md:text-sm mt-1">{item.step_description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BusinessAffairs;