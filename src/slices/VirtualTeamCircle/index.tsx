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
 * Props for `VirtualTeamCircle`.
 */
export type VirtualTeamCircleProps = SliceComponentProps<any>;

// Position mapping for circular layout (degrees)
const POSITION_ANGLES: Record<string, number> = {
  "top-left": 225,
  "top-center": 270,
  "top-right": 315,
  right: 0,
  "bottom-right": 45,
  "bottom-center": 90,
  "bottom-left": 135,
  left: 180,
};

/**
 * Component for "VirtualTeamCircle" Slices.
 */
const VirtualTeamCircle = ({ slice }: VirtualTeamCircleProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const circleContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Scrubbed reveal for header text
      gsap
        .timeline({ scrollTrigger: { trigger: sectionRef.current, start: "top 85%", end: "top 35%", scrub: 0.6 } })
        .from(titleRef.current, { opacity: 0, y: 32, filter: "blur(6px)" })
        .from(subtitleRef.current, { opacity: 0, y: 24, filter: "blur(4px)" }, "-=0.1")
        .from(descRef.current, { opacity: 0, x: -28, filter: "blur(4px)" }, "-=0.05");

      // Scroll-scrub sequence: center -> lines -> members (clockwise)
      if (circleContainerRef.current) {
        const centerCircle = circleContainerRef.current.querySelector(".center-circle");
        const tl = gsap.timeline({ scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "+=160%", scrub: 0.9, pin: true, anticipatePin: 1 } });

        if (centerCircle) {
          tl.from(centerCircle, { scale: 0.8, autoAlpha: 0, filter: "blur(6px)", duration: 0.3, ease: "none" }, 0);
        }

        if (svgRef.current) {
          const lines = Array.from(svgRef.current.querySelectorAll("line"));
          lines.forEach((line) => {
            const length = Math.hypot(
              parseFloat(line.getAttribute("x2")!) - parseFloat(line.getAttribute("x1")!),
              parseFloat(line.getAttribute("y2")!) - parseFloat(line.getAttribute("y1")!)
            );
            (line as SVGLineElement).style.strokeDasharray = `${length}`;
            (line as SVGLineElement).style.strokeDashoffset = `${length}`;
          });
          tl.to(lines, { strokeDashoffset: 0, duration: 0.4, stagger: 0.03, ease: "none" }, "+=0.05");
        }

        const members = Array.from(circleContainerRef.current.querySelectorAll<HTMLElement>(".team-member"));
        const angleKey = (el: HTMLElement) => ((parseFloat(el.dataset.angle || "0") - 270 + 360) % 360);
        const ordered = members.sort((a, b) => angleKey(a) - angleKey(b));
        if (ordered.length) {
          tl.from(ordered, { scale: 0.85, autoAlpha: 0, filter: "blur(6px)", duration: 0.6, stagger: 0.12, ease: "none" }, "+=0.05");
        }
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Calculate positions for circular layout
  const calculatePosition = (position: string, radius: number) => {
    const angle = POSITION_ANGLES[position] || 0;
    const radian = (angle * Math.PI) / 180;
    return {
      x: radius * Math.cos(radian),
      y: radius * Math.sin(radian),
    };
  };

  const radius = 280; // Base radius for positioning
  const centerX = 0;
  const centerY = 0;

  const bgImage = withImageAlt(slice.primary.background_image, "");

  return (
    <section
      ref={sectionRef}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="relative py-20 md:py-32 overflow-hidden"
      style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 6%, black 94%, transparent)', maskImage: 'linear-gradient(to bottom, transparent, black 6%, black 94%, transparent)' }}
    >
      {/* Optional background image */}
      {bgImage && (
        <div className="absolute inset-0 -z-10">
          <PrismicNextImage field={bgImage} fill className="object-cover" quality={85} alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-transparent" />
        </div>
      )}
      {/* Particle/Stars Background */}
      {slice.primary.background_pattern === "particles" && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(141,246,255,0.03),transparent_70%)]" />
          {/* Small dots for stars effect */}
          <div className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `radial-gradient(1px 1px at 20px 30px, #8df6ff, transparent),
                radial-gradient(1px 1px at 60px 70px, #BBFEFF, transparent),
                radial-gradient(1px 1px at 50px 20px, #8df6ff, transparent),
                radial-gradient(1px 1px at 130px 80px, #BBFEFF, transparent),
                radial-gradient(1px 1px at 90px 30px, #8df6ff, transparent)`,
              backgroundSize: "200px 100px",
              backgroundRepeat: "repeat",
            }}
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-16 items-center">
          {/* Left Column: Text Content */}
          <div className="space-y-6">
            {/* Title */}
            {slice.primary.section_title && (
              <div ref={titleRef}>
                <PrismicRichText
                  field={slice.primary.section_title}
                  components={{
                    heading2: ({ children }) => (
                      <h2 className="text-[#8df6ff] text-3xl md:text-4xl lg:text-5xl font-bold">
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
                className="text-white text-xl md:text-2xl font-semibold"
              >
                {slice.primary.subtitle}
              </p>
            )}

            {/* Description */}
            {slice.primary.description && (
              <div ref={descRef} className="text-white/80 text-base md:text-lg leading-relaxed space-y-4">
                <PrismicRichText field={slice.primary.description} />
              </div>
            )}

            {/* Bullets (3 items recommended) */}
            {Array.isArray(slice.primary.bullets) && slice.primary.bullets.length > 0 && (
              <ul className="mt-4 space-y-2">
                {slice.primary.bullets.slice(0, 8).map((b: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-white/90">
                    <span className="mt-2 w-2 h-2 rounded-full bg-[#8df6ff]" />
                    <span className="text-sm md:text-base">{b.item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right Column: Circular Diagram */}
          <div className="relative min-h-[600px] lg:min-h-[700px] flex items-center justify-center">
            <div ref={circleContainerRef} className="relative mx-auto w-full max-w-[700px] aspect-square">
              {/* SVG for connecting lines (touch profile at 180° side) */}
              <svg
                ref={svgRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="-350 -350 700 700"
                xmlns="http://www.w3.org/2000/svg"
              >
              {slice.items.map((item: any, index: number) => {
                const pos = calculatePosition(item.position || "top-center", radius);
                // Offset end point inward by circle radius so it touches profile edge at side (180° from center)
                const profileR = 56; // approx px for 28*2 (md ~ 112) / viewBox scale; tuned visually
                const angle = Math.atan2(pos.y - centerY, pos.x - centerX);
                const x2 = pos.x - Math.cos(angle) * profileR;
                const y2 = pos.y - Math.sin(angle) * profileR;
                return (
                  <line
                    key={index}
                    x1={centerX}
                    y1={centerY}
                    x2={x2}
                    y2={y2}
                    stroke="rgba(141, 246, 255, 0.4)"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>

            {/* Center Circle with Prismic-controlled image and tinted overlay */}
            <div className="center-circle absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-40 md:h-40 rounded-full ring-4 ring-[#8df6ff] shadow-[0_0_40px_rgba(141,246,255,0.6)] z-10 overflow-hidden bg-[#071327]">
              {slice.primary.center_image?.url && (
                <PrismicNextImage field={withImageAlt(slice.primary.center_image, "") as any} fill className="object-cover" alt="" />
              )}
              {/* Light tint overlay */}
              <div className="absolute inset-0 bg-cyan-300/10 mix-blend-multiply" />
              {/* Centered title */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <span className="text-gray-500 text-center p-4 font-bold text-lg md:text-2xl tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
                  {slice.primary.center_label || "Virtual Team"}
                </span>
              </div>
            </div>

            {/* Team Members */}
            {slice.items.map((item: any, index: number) => {
              const pos = calculatePosition(item.position || "top-center", radius);
              const memberAlt =
                item.primary_role || item.secondary_role || `Team member ${index + 1}`;
              const teamPhotoField = withImageAlt(item.team_photo, memberAlt);
              return (
                <div
                  key={index}
                  className="team-member absolute"
                  data-angle={`${POSITION_ANGLES[item.position || "top-center"] || 0}`}
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
                  }}
                >
                  <div className="flex flex-col items-center">
                    {/* Photo Circle */}
                    {teamPhotoField && (
                      <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-[#8df6ff] shadow-[0_0_20px_rgba(141,246,255,0.4)] mb-2 relative">
                        <PrismicNextImage
                          field={teamPhotoField}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Role Label under the photo */}
                    <div className="px-3 py-2 rounded-xl bg-[#071327]/90 backdrop-blur-sm border border-[#8df6ff]/25 text-center shadow-[0_0_16px_rgba(141,246,255,0.35)] min-w-[150px]">
                      {item.primary_role && (
                        <p className="text-white font-semibold text-xs md:text-sm leading-tight">{item.primary_role}</p>
                      )}
                      {item.secondary_role && (
                        <p className="text-[#8df6ff] text-[11px] leading-tight mt-0.5">{item.secondary_role}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </div>

        {/* Mobile fallback: Stacked grid */}
        <div className="lg:hidden mt-12 grid grid-cols-2 gap-6">
          {slice.items.map((item: any, index: number) => {
            const memberAlt = item.primary_role || item.secondary_role || `Team member ${index + 1}`;
            const teamPhotoField = withImageAlt(item.team_photo, memberAlt);
            return (
              <div key={index} className="flex flex-col items-center text-center">
                {teamPhotoField?.url && (
                  <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-[#8df6ff] mb-3">
                    <PrismicNextImage
                      field={teamPhotoField}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <p className="text-white font-semibold text-sm">{item.primary_role}</p>
                <p className="text-[#8df6ff] text-xs">{item.secondary_role}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default VirtualTeamCircle;
