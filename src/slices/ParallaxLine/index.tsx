"use client";

import React, { useEffect, useRef } from "react";
import type { SliceComponentProps } from "@prismicio/react";
import { PrismicRichText } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";
import { withImageAlt } from "@/lib/prismicImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export type ParallaxLineProps = SliceComponentProps<any>;

const ParallaxLine = ({ slice }: ParallaxLineProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  const backgroundImage = withImageAlt(slice.primary.background_image, "");
  const brandLogo = withImageAlt(slice.primary.brand_logo, "");

  useEffect(() => {
    if (!sectionRef.current) return;

    // Measure content heights and set connector heights dynamically
    const connectors = sectionRef.current.querySelectorAll<HTMLElement>('.timeline-connector');
    connectors.forEach((connector, idx) => {
      const contentEl = contentRefs.current[idx];
      if (contentEl) {
        const contentHeight = contentEl.offsetHeight;
        connector.style.height = `${contentHeight + 10}px`; // +10px padding
      }
    });

    const ctx = gsap.context(() => {
      // Header fade on scroll-in (before pinning)
      gsap
        .timeline({ scrollTrigger: { trigger: sectionRef.current, start: "top 80%", end: "top 40%", scrub: 0.6 } })
        .from(titleRef.current, { opacity: 0, y: 40, filter: "blur(6px)" })
        .from(subtitleRef.current, { opacity: 0, y: 30, filter: "blur(4px)" }, "-=0.1")
        .from(descriptionRef.current, { opacity: 0, y: 20, filter: "blur(3px)" }, "-=0.1");

      // Pinned scroll sequence - duration matches animation length
      const nodes = sectionRef.current?.querySelectorAll(".timeline-node");
      const nodeCount = nodes?.length || 1;
      const scrollDuration = Math.max(100, nodeCount * 40); // 40% per node, min 100%
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${scrollDuration}%`,
          scrub: 0.9,
          pin: true,
          anticipatePin: 1,
        },
      });

      // Progressive line + nodes + connectors + content all together
      if (lineRef.current) {
        const length = lineRef.current.getTotalLength();
        tl.set(lineRef.current, { strokeDasharray: length, strokeDashoffset: length }, 0);
        
        // Get all nodes
        const nodes = sectionRef.current?.querySelectorAll(".timeline-node");
        const nodeCount = nodes?.length || 1;
        
        // Calculate segment length for each node
        const segmentLength = length / nodeCount;
        
        // Animate everything together node by node
        for (let i = 0; i < nodeCount; i++) {
          const node = nodes?.[i];
          const endOffset = length - (segmentLength * (i + 1));
          const connectors = sectionRef.current?.querySelectorAll(`.connector-${i}`);
          const content = sectionRef.current?.querySelector(`.content-${i}`);
          
          // Everything starts at the same time with "<" position parameter
          const startPosition = i === 0 ? 0 : "<";
          
          // Grow line to this node position
          tl.to(lineRef.current, { 
            strokeDashoffset: endOffset, 
            duration: 0.5, 
            ease: "none" 
          }, i === 0 ? 0 : ">");
          
          // Node appears at the SAME time line grows
          if (node) {
            tl.from(node, {
              scale: 0,
              opacity: 0,
              duration: 0.5,
              ease: "back.out(1.7)",
            }, startPosition);
          }
          
          // Connector line draws at the SAME time
          if (connectors?.length) {
            connectors.forEach((connector) => {
              tl.from(connector, {
                scaleY: 0,
                transformOrigin: "top",
                duration: 0.5,
                ease: "none",
              }, startPosition);
            });
          }
          
          // Content fades in at the SAME time
          if (content) {
            tl.from(content, {
              opacity: 0,
              x: -15,
              duration: 0.5,
              ease: "none",
            }, startPosition);
          }
        }
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const hasRichText = (field: any): boolean => {
    if (!field) return false;
    if (Array.isArray(field)) return field.length > 0;
    return typeof field === "string" ? field.trim().length > 0 : !!field;
  };

  return (
    <section
      ref={sectionRef}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="relative min-h-screen bg-[#00121f] overflow-hidden"
    >
      {/* Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <PrismicNextImage 
            field={backgroundImage as any} 
            fill 
            priority
            className="object-cover" 
            quality={90} 
            alt="" 
          />
          <div className="absolute inset-0 bg-[#00121f]/70" />
        </div>
      )}
      
      <div className="relative z-10 h-screen flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          {slice.primary.title && (
            <div ref={titleRef}>
              <PrismicRichText
                field={slice.primary.title}
                components={{
                  heading2: ({ children }) => (
                    <h2 className="text-[#8df6ff] text-5xl md:text-7xl font-extrabold mb-6">
                      {children}
                    </h2>
                  ),
                }}
              />
            </div>
          )}
          {slice.primary.subtitle && (
            <p
              ref={subtitleRef}
              className="text-white/90 text-xl md:text-2xl max-w-4xl mx-auto"
            >
              {slice.primary.subtitle}
            </p>
          )}
          {slice.primary.description && (
            <div
              ref={descriptionRef}
              className="mt-4 text-white/80 text-lg max-w-4xl mx-auto"
            >
              <PrismicRichText field={slice.primary.description} />
            </div>
          )}
        </div>

        {/* Desktop Timeline - Straight "|" connectors alternating up/down */}
        <div className="hidden md:block relative" style={{ height: "500px" }}>
          {/* Horizontal Line SVG */}
          <svg
            className="absolute left-0 right-0 w-full"
            style={{ top: "50%", transform: "translateY(-50%)", height: "4px" }}
            viewBox="0 0 1000 4"
            preserveAspectRatio="none"
          >
            <path
              ref={lineRef}
              d="M 0 2 L 1000 2"
              stroke="#8df6ff"
              strokeWidth="4"
              fill="none"
            />
          </svg>

          {/* Nodes and Content Container */}
          <div className="relative flex justify-between items-center" style={{ height: "500px" }}>
            {slice.items.map((item: any, idx: number) => {
              const count = slice.items.length;
              const leftPct = count === 1 ? 50 : (idx / (count - 1)) * 100;
              const hasTopContent = item.top_title || hasRichText(item.top_description);
              const hasBottomContent = item.bottom_title || hasRichText(item.bottom_description);
              const isTop = idx % 2 === 0;

              return (
                <div
                  key={idx}
                  className="absolute"
                  style={{
                    left: `${leftPct}%`,
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {/* Node Circle */}
                  <div className="timeline-node relative z-20 w-24 h-24 md:w-28 md:h-28 rounded-full bg-[#001428] border-4 border-[#8df6ff] overflow-hidden shadow-[0_0_40px_rgba(141,246,255,0.7)]">
                    {item.node_image?.url && (
                      <PrismicNextImage 
                        field={withImageAlt(item.node_image, item.top_title || item.bottom_title || "Node") as any}
                        fill 
                        className="object-cover" 
                      />
                    )}
                  </div>

                  {/* Top Content - Straight "|" connector, content on RIGHT */}
                  {hasTopContent && (
                    <>
                      {/* Straight Vertical Connector - height set dynamically */}
                      <div
                        className={`connector-${idx} timeline-connector absolute left-1/2 -translate-x-1/2 w-0.5 bg-[#8df6ff]`}
                        style={{ 
                          bottom: "calc(50% + 18px)", 
                          height: "130px" 
                        }}
                      />
                      {/* Text Content on RIGHT side with gap from node - PUSHED UP */}
                      <div 
                        ref={(el) => { if (el) contentRefs.current[idx] = el; }}
                        className={`content-${idx} absolute text-left`}
                        style={{ 
                          bottom: "calc(50% + 80px)", 
                          left: "calc(50% + 20px)",
                          width: "220px"
                        }}
                      >
                        {item.top_title && (
                          <h3 className="text-white font-bold text-base mb-1">{item.top_title}</h3>
                        )}
                        {hasRichText(item.top_description) && (
                          <div className="text-white/80 text-sm leading-relaxed">
                            <PrismicRichText field={item.top_description} />
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Bottom Content - Straight "|" connector, content on RIGHT */}
                  {hasBottomContent && (
                    <>
                      {/* Straight Vertical Connector - height set dynamically */}
                      <div
                        className={`connector-${idx} timeline-connector absolute left-1/2 -translate-x-1/2 w-0.5 bg-[#8df6ff]`}
                        style={{ 
                          top: "calc(50% + 18px)", 
                          height: "130px" 
                        }}
                      />
                      {/* Text Content on RIGHT side with gap from node - PUSHED DOWN */}
                      <div 
                        ref={(el) => { if (el) contentRefs.current[idx] = el; }}
                        className={`content-${idx} absolute text-left`}
                        style={{ 
                          top: "calc(50% + 80px)", 
                          left: "calc(50% + 20px)",
                          width: "220px"
                        }}
                      >
                        {item.bottom_title && (
                          <h3 className="text-white font-bold text-base mb-1">{item.bottom_title}</h3>
                        )}
                        {hasRichText(item.bottom_description) && (
                          <div className="text-white/80 text-sm leading-relaxed">
                            <PrismicRichText field={item.bottom_description} />
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile: Simple Vertical List */}
        <div className="md:hidden space-y-8">
          {slice.items.map((item: any, idx: number) => (
            <div key={idx} className="flex items-start gap-4">
              {/* Node */}
              <div className="timeline-node flex-shrink-0 w-16 h-16 rounded-full bg-[#001428] border-4 border-[#8df6ff] overflow-hidden shadow-[0_0_30px_rgba(141,246,255,0.7)]">
                {item.node_image?.url && (
                  <PrismicNextImage 
                    field={withImageAlt(item.node_image, item.top_title || item.bottom_title || "Node") as any}
                    fill 
                    className="object-cover" 
                  />
                )}
              </div>
              {/* Content */}
              <div className="timeline-content flex-1 space-y-2">
                {(item.top_title || item.bottom_title) && (
                  <h3 className="text-white font-bold text-base">
                    {item.top_title || item.bottom_title}
                  </h3>
                )}
                {hasRichText(item.top_description || item.bottom_description) && (
                  <div className="text-white/80 text-sm leading-relaxed">
                    <PrismicRichText field={item.top_description || item.bottom_description} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Brand Logo */}
      {brandLogo && (
        <div className="absolute bottom-10 right-10 z-20">
          <div className="relative w-20 h-20 opacity-60 hover:opacity-100 transition-opacity">
            <PrismicNextImage field={brandLogo as any} fill className="object-contain" alt="" />
          </div>
        </div>
      )}
    </section>
  );
};

export default ParallaxLine;
