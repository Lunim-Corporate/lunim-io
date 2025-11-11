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

  return (
    <section
      ref={sectionRef}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="relative py-20 md:py-32 bg-gradient-to-b from-[#03070f] via-[#071327] to-[#040a18] overflow-hidden"
    >
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
          </div>

          {/* Right Column: Circular Diagram */}
          <div ref={circleContainerRef} className="relative min-h-[600px] lg:min-h-[700px] flex items-center justify-center">
            {/* SVG for connecting lines */}
            <svg
              ref={svgRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="-350 -350 700 700"
              xmlns="http://www.w3.org/2000/svg"
            >
              {slice.items.map((item: any, index: number) => {
                const pos = calculatePosition(item.position || "top-center", radius);
                return (
                  <line
                    key={index}
                    x1={centerX}
                    y1={centerY}
                    x2={pos.x}
                    y2={pos.y}
                    stroke="rgba(141, 246, 255, 0.4)"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>

            {/* Center Circle */}
            <div className="center-circle absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-[#8df6ff] to-[#BBFEFF] flex items-center justify-center shadow-[0_0_40px_rgba(141,246,255,0.6)] z-10">
              <span className="text-[#040a18] font-bold text-sm md:text-base text-center px-4">
                {slice.primary.center_label || "Virtual Team"}
              </span>
            </div>

            {/* Team Members */}
            {slice.items.map((item: any, index: number) => {
              const pos = calculatePosition(item.position || "top-center", radius);
              return (
                <div
                  key={index}
                  className="team-member absolute"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
                  }}
                >
                  <div className="flex flex-col items-center">
                    {/* Photo Circle */}
                    {item.team_photo?.url && (
                      <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-[#8df6ff] shadow-[0_0_20px_rgba(141,246,255,0.4)] mb-3">
                        <PrismicNextImage
                          field={item.team_photo}
                          className="w-full h-full object-cover"
                          alt={item.primary_role || "Team member"}
                        />
                      </div>
                    )}

                    {/* Role Label */}
                    <div className="text-center bg-[#071327]/90 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[140px] border border-[#8df6ff]/20">
                      {item.primary_role && (
                        <p className="text-white font-semibold text-xs md:text-sm leading-tight">
                          {item.primary_role}
                        </p>
                      )}
                      {item.secondary_role && (
                        <p className="text-[#8df6ff] text-xs leading-tight mt-1">
                          {item.secondary_role}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
