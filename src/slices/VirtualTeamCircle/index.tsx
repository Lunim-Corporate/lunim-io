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
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Title fade in
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      // Subtitle fade in
      gsap.from(subtitleRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        },
      });

      // Description fade in
      gsap.from(descRef.current, {
        opacity: 0,
        x: -30,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
      });

      // Circle animation
      if (circleContainerRef.current) {
        // Center circle appears first
        const centerCircle = circleContainerRef.current.querySelector(".center-circle");
        gsap.from(centerCircle, {
          scale: 0,
          opacity: 0,
          duration: 0.8,
          ease: "back.out(1.5)",
          scrollTrigger: {
            trigger: circleContainerRef.current,
            start: "top 70%",
          },
        });

        // Team members appear sequentially
        const teamMembers = circleContainerRef.current.querySelectorAll(".team-member");
        gsap.from(teamMembers, {
          scale: 0,
          opacity: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: "back.out(1.5)",
          scrollTrigger: {
            trigger: circleContainerRef.current,
            start: "top 65%",
          },
          delay: 0.5,
        });

        // Animate SVG lines (draw from center)
        if (svgRef.current) {
          const lines = svgRef.current.querySelectorAll("line");
          lines.forEach((line) => {
            const length = Math.hypot(
              parseFloat(line.getAttribute("x2")!) - parseFloat(line.getAttribute("x1")!),
              parseFloat(line.getAttribute("y2")!) - parseFloat(line.getAttribute("y1")!)
            );
            line.style.strokeDasharray = `${length}`;
            line.style.strokeDashoffset = `${length}`;

            gsap.to(line, {
              strokeDashoffset: 0,
              duration: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: circleContainerRef.current,
                start: "top 65%",
              },
              delay: 0.5,
            });
          });
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
      className="relative py-20 md:py-32 bg-gradient-to-b from-[#03070f] via-[#071327] to-[#040a18] overflow-hidden"
    >
      {/* Optional background image */}
      {bgImage && (
        <div className="absolute inset-0 -z-10">
          <PrismicNextImage field={bgImage} fill className="object-cover" quality={85} alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-transparent" />
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
                {slice.primary.bullets.slice(0, 3).map((b: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-white/90">
                    <span className="mt-2 w-2 h-2 rounded-full bg-[#8df6ff]" />
                    <span className="text-sm md:text-base">{b.item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right Column: Radial Diagram with arrows */}
          <div ref={circleContainerRef} className="relative min-h-[620px] lg:min-h-[720px]">
            {/* Arrow canvas */}
            <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 700 700" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <marker id="vtc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#ffffff" />
                </marker>
              </defs>
              {(() => {
                const cx = 440; const cy = 350; const hubR = 96; const nodeR = 44; const r = 220;
                const count = Math.min((slice.items || []).length, 8);
                const degs = count >= 8 ? [140, 20, 0, 330, 270, 210, 180, 110] : [30, 0, 300, 270, 225, 180];
                const list = (slice.items || []).slice(0, count);
                return list.map((_: any, i: number) => {
                  const a = (degs[i] * Math.PI) / 180;
                  const nx = cx + r * Math.cos(a);
                  const ny = cy + r * Math.sin(a);
                  const ux = (cx - nx) / Math.hypot(cx - nx, cy - ny);
                  const uy = (cy - ny) / Math.hypot(cx - nx, cy - ny);
                  const x1 = nx + ux * nodeR;
                  const y1 = ny + uy * nodeR;
                  const x2 = cx - ux * hubR;
                  const y2 = cy - uy * hubR;
                  return <line key={`arr-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffffff" strokeWidth="3" markerEnd="url(#vtc-arrow)" />;
                });
              })()}
            </svg>

            {/* Center hub (photo + glow) positioned middle-right */}
            <div className="absolute" style={{ left: 440, top: 350, transform: "translate(-50%, -50%)" }}>
              <div className="relative rounded-full ring-4 ring-[#8df6ff] shadow-[0_0_40px_rgba(141,246,255,0.6)] overflow-hidden" style={{ width: 192, height: 192 }}>
                {slice.primary.center_image?.url && (
                  <PrismicNextImage field={withImageAlt(slice.primary.center_image, "") as any} fill className="object-cover" alt="" />
                )}
                <div className="absolute inset-0 bg-cyan-300/20 mix-blend-multiply" />
              </div>
            </div>

            {/* Six profile nodes with neon labels */}
            {(() => {
              const cx = 440; const cy = 350; const r = 220; const nodeSize = 88;
              const count = Math.min((slice.items || []).length, 8);
              const degs = count >= 8 ? [140, 20, 0, 330, 270, 210, 180, 110] : [30, 0, 300, 270, 225, 180];
              const list = (slice.items || []).slice(0, count);
              return list.map((item: any, i: number) => {
                const a = (degs[i] * Math.PI) / 180;
                const nx = cx + r * Math.cos(a);
                const ny = cy + r * Math.sin(a);
                return (
                  <div key={`n-${i}`} className="absolute team-member" style={{ left: nx, top: ny, transform: "translate(-50%, -50%)" }}>
                    <div className="relative rounded-full overflow-hidden ring-2 ring-[#8df6ff] shadow-[0_0_18px_rgba(141,246,255,0.5)]" style={{ width: nodeSize, height: nodeSize }}>
                      {item.team_photo?.url && (
                        <PrismicNextImage field={withImageAlt(item.team_photo, item.primary_role || "Member") as any} fill className="object-cover" />
                      )}
                    </div>
                    <div className="mt-2 px-3 py-1 rounded-full bg-[#071327]/80 border border-[#8df6ff]/30 text-center shadow-[0_0_12px_rgba(141,246,255,0.35)] min-w-[140px] mx-auto">
                      <p className="text-white text-xs font-semibold leading-tight">{item.primary_role}</p>
                      {item.secondary_role && (
                        <p className="text-[#8df6ff] text-[11px] leading-tight">{item.secondary_role}</p>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Mobile fallback: Stacked grid */}
        <div className="lg:hidden mt-12 grid grid-cols-2 gap-6">
          {slice.items.map((item: any, index: number) => (
            <div key={index} className="flex flex-col items-center text-center">
              {item.team_photo?.url && (
                <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-[#8df6ff] mb-3">
                  <PrismicNextImage
                    field={item.team_photo}
                    className="w-full h-full object-cover"
                    alt={item.primary_role || "Team member"}
                  />
                </div>
              )}
              <p className="text-white font-semibold text-sm">{item.primary_role}</p>
              <p className="text-[#8df6ff] text-xs">{item.secondary_role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VirtualTeamCircle;
