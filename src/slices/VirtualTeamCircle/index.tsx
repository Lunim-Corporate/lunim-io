"use client";

import { useRef, useEffect, useState } from "react";
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

// Default positions for 7 team members as shown in the design
const DEFAULT_POSITIONS = [
  "top-center", // Character Designer Animator
  "top-right", // Art Director World Builder
  "right", // Technical Artist Pipeline TD
  "bottom-right", // Screenwriter Narrative Designer
  "bottom-center", // Cinematographer Previs Artist
  "bottom-left", // Sound Designer Composer
  "left", // Director Possibly IRL Also
];

/**
 * Component for "VirtualTeamCircle" Slices.
 */
const VirtualTeamCircle = ({ slice }: VirtualTeamCircleProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const bulletsRef = useRef<HTMLUListElement>(null);
  const circleContainerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [radius, setRadius] = useState(260);
  const [containerMaxWidth, setContainerMaxWidth] = useState("600px");
  const [isMobile, setIsMobile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Combined radius and container max-width calculation
  useEffect(() => {
    const updateResponsiveValues = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);

      if (width < 480) {
        setRadius(175);
        setContainerMaxWidth("180px");
      } else if (width < 768) {
        setRadius(200);
        setContainerMaxWidth("260px");
      } else if (width < 1024) {
        setRadius(160);
        setContainerMaxWidth("420px");
      } else if (width < 1440) {
        setRadius(230);
        setContainerMaxWidth("540px");
      } else {
        setRadius(280);
        setContainerMaxWidth("640px");
      }
      
      setIsInitialized(true);
    };

    updateResponsiveValues();
    window.addEventListener("resize", updateResponsiveValues);
    return () => window.removeEventListener("resize", updateResponsiveValues);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    
    const ctx = gsap.context(() => {
      // Scrubbed reveal for header text, including bullets
      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "top 35%",
            scrub: 0.6,
          },
        })
        .from(titleRef.current, { opacity: 0, y: 32, filter: "blur(6px)" })
        .from(
          subtitleRef.current,
          { opacity: 0, y: 24, filter: "blur(4px)" },
          "-=0.1"
        )
        .from(
          descRef.current,
          { opacity: 0, x: -28, filter: "blur(4px)" },
          "-=0.05"
        )
        .from(
          bulletsRef.current,
          { opacity: 0, y: 20, filter: "blur(4px)" },
          "-=0.05"
        );

      // Scroll sequence: center -> lines -> members (clockwise)
      if (circleContainerRef.current) {
        const centerCircle =
          circleContainerRef.current.querySelector(".center-circle");
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: circleContainerRef.current,
            start: isMobile ? "top bottom" : "bottom bottom",
            end: isMobile ? "top 70%" : "top 25%",
            scrub: 0.5,
          },
        });

        if (centerCircle) {
          tl.from(
            centerCircle,
            { scale: 0.9, autoAlpha: 0, duration: 0.22, ease: "power2.out" },
            0
          );
        }

        if (svgRef.current) {
          const lines = Array.from(svgRef.current.querySelectorAll("line"));
          lines.forEach((line) => {
            const length = Math.hypot(
              parseFloat(line.getAttribute("x2")!) -
                parseFloat(line.getAttribute("x1")!),
              parseFloat(line.getAttribute("y2")!) -
                parseFloat(line.getAttribute("y1")!)
            );
            (line as SVGLineElement).style.strokeDasharray = `${length}`;
            (line as SVGLineElement).style.strokeDashoffset = `${length}`;
          });
          tl.to(
            lines,
            {
              strokeDashoffset: 0,
              duration: 0.24,
              stagger: 0.02,
              ease: "none",
            },
            "+=0.03"
          );
        }

        const members = Array.from(
          circleContainerRef.current.querySelectorAll<HTMLElement>(
            ".team-member"
          )
        );
        const angleKey = (el: HTMLElement) =>
          ((parseFloat(el.dataset.angle || "0") - 270 + 360) % 360);
        const ordered = members.sort((a, b) => angleKey(a) - angleKey(b));
        if (ordered.length) {
          tl.from(
            ordered,
            {
              scale: 0.94,
              autoAlpha: 0,
              duration: 0.32,
              stagger: 0.06,
              ease: "power2.out",
            },
            "+=0.04"
          );
        }
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [radius, containerMaxWidth, isMobile, isInitialized]);

  useEffect(() => {
    const orbitEl = orbitRef.current;
    if (!orbitEl) return;

    if (!isMobile) {
      gsap.killTweensOf(orbitEl);
      gsap.set(orbitEl, { rotation: 0 });
      orbitEl.style.setProperty("--orbit-counter-rotation", "0deg");
      return;
    }

    orbitEl.style.setProperty("--orbit-counter-rotation", "0deg");
    const tween = gsap.to(orbitEl, {
      rotation: 360,
      duration: 36,
      repeat: -1,
      ease: "none",
      transformOrigin: "50% 50%",
      onUpdate: () => {
        const currentRotate =
          (gsap.getProperty(orbitEl, "rotation") as number) || 0;
        orbitEl.style.setProperty(
          "--orbit-counter-rotation",
          `${-currentRotate}deg`
        );
      },
    });

    return () => {
      tween.kill();
    };
  }, [isMobile]);

  // Calculate positions for circular layout
  const calculatePosition = (position: string, radius: number) => {
    const angle = POSITION_ANGLES[position] || 0;
    const radian = (angle * Math.PI) / 180;
    return {
      x: radius * Math.cos(radian),
      y: radius * Math.sin(radian),
    };
  };

  const centerX = 0;
  const centerY = 0;

  const bgImage = withImageAlt(slice.primary.background_image, "");

  // Get team members with proper position assignment
  const getTeamMembers = () => {
    if (!slice.items || !Array.isArray(slice.items)) return [];

    return slice.items.map((item: any, index: number) => {
      const position = item.position || DEFAULT_POSITIONS[index] || "top-center";
      return {
        ...item,
        position,
        calculatedPosition: calculatePosition(position, radius),
      };
    });
  };

  const teamMembers = getTeamMembers();
  const centerImageField = withImageAlt(
    slice.primary.center_image,
    ""
  ) as any;
  const mobileHelperText =
    slice.primary?.mobile_helper_text ||
    "Your virtual squad now orbits on autopilot—watch each role glide into view.";

  const renderCenterCircle = () => (
    <div className="center-circle absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full ring-2 sm:ring-3 md:ring-4 ring-[#8df6ff] shadow-[0_0_20px_rgba(141,246,255,0.4)] sm:shadow-[0_0_30px_rgba(141,246,255,0.5)] md:shadow-[0_0_40px_rgba(141,246,255,0.6)] z-20 overflow-hidden bg-[#071327]">
      {slice.primary.center_image?.url && (
        <PrismicNextImage
          field={centerImageField}
          fill
          className="object-cover"
          alt=""
        />
      )}
      <div className="absolute inset-0 bg-cyan-300/10 mix-blend-multiply" />
      <div className="absolute inset-0 flex items-center justify-center z-10 p-2">
        <span className="text-gray-300 text-center font-bold text-sm md:text-base lg:text-lg leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
          {slice.primary.center_label || "Virtual Producer Team Lead"}
        </span>
      </div>
    </div>
  );

  const renderOrbit = () => (
    <div
      ref={orbitRef}
      className="absolute inset-0 z-10"
      style={{ transformOrigin: "50% 50%" }}
    >
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        viewBox="-400 -400 800 800"
        xmlns="http://www.w3.org/2000/svg"
      >
        {teamMembers.map((member: any, index: number) => {
          const pos = member.calculatedPosition;
          const profileR = 44;
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

      {teamMembers.map((member: any, index: number) => {
        const pos = member.calculatedPosition;
        const teamPhotoField = withImageAlt(member.team_photo, "");

        return (
          <div
            key={index}
            className="team-member absolute max-[480px]:scale-90 will-change-transform"
            data-angle={`${POSITION_ANGLES[member.position] || 0}`}
            style={{
              left: "50%",
              top: "50%",
              transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
            }}
          >
            <div
              className="flex flex-col items-center"
              style={{
                transform: "rotate(var(--orbit-counter-rotation, 0deg))",
              }}
            >
              {teamPhotoField && (
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#8df6ff] shadow-[0_0_12px_rgba(141,246,255,0.3)] mb-0 relative z-10">
                  <PrismicNextImage
                    field={teamPhotoField}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div
                className="px-3 py-2 rounded-lg bg-[#071327]/95 backdrop-blur-sm border border-[#8df6ff]/30 
                        text-center shadow-[0_0_12px_rgba(141,246,255,0.35)] min-w-[100px] max-w-[220px] -mt-3 
                        relative z-20 max-[480px]:scale-90"
              >
                {member.primary_role && (
                  <p className="text-white font-semibold text-sm leading-tight mb-0">
                    {member.primary_role}
                  </p>
                )}
                {member.secondary_role && (
                  <p className="text-[#8df6ff] text-xs leading-tight mt-1">
                    {member.secondary_role}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderDesktopCircle = () => (
    <div className="relative w-full flex items-center justify-center mt-40 mb-64 md:mt-8 md:mb-0 lg:mt-0">
      <div
        ref={circleContainerRef}
        className="relative w-full aspect-square overflow-visible mx-auto"
        style={{
          maxWidth: containerMaxWidth,
        }}
      >
        {renderOrbit()}
        {renderCenterCircle()}
      </div>
    </div>
  );

  const renderMobileCircle = () => (
    <div className="w-full flex flex-col items-center gap-8 mt-16 mb-16 md:mt-0 md:mb-0">
      <div
        ref={circleContainerRef}
        className="relative w-full aspect-square overflow-visible mx-auto"
        style={{
          maxWidth: containerMaxWidth,
        }}
      >
        {renderOrbit()}
        {renderCenterCircle()}
        <div className="absolute inset-6 rounded-full border border-[#8df6ff]/20 pointer-events-none animate-pulse z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(141,246,255,0.08),transparent_70%)] pointer-events-none z-0" />
      </div>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="relative py-20 md:py-32 overflow-hidden"
      style={{
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent, black 6%, black 94%, transparent)",
        maskImage:
          "linear-gradient(to bottom, transparent, black 6%, black 94%, transparent)",
      }}
      data-device={isMobile ? "mobile" : "desktop"}
    >
      {/* Optional background image */}
      {bgImage && (
        <div className="absolute inset-0 -z-10">
          <PrismicNextImage
            field={bgImage}
            fill
            className="object-cover"
            quality={85}
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-transparent" />
        </div>
      )}

      {/* Particle/Stars Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(141,246,255,0.03),transparent_70%)]" />
        <div
          className="absolute inset-0 opacity-40"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Equal grid columns applied to both sides */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 md:gap-12 lg:gap-16 items-center">
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
              <div
                ref={descRef}
                className="text-white/80 text-base md:text-lg leading-relaxed space-y-4"
              >
                <PrismicRichText field={slice.primary.description} />
              </div>
            )}

            {/* Bullets */}
            {Array.isArray(slice.primary.bullets) &&
              slice.primary.bullets.length > 0 && (
                <ul ref={bulletsRef} className="mt-4 space-y-2">
                  {slice.primary.bullets
                    .slice(0, 8)
                    .map((b: any, idx: number) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-white/90"
                      >
                        <span className="mt-2 w-2 h-2 rounded-full bg-[#8df6ff]" />
                        <span className="text-md">{b.item}</span>
                      </li>
                    ))}
                </ul>
              )}
          </div>

          {/* Right Column: Diagram / Mobile Orbit */}
          <div className="relative w-full flex items-center justify-center">
            {isMobile ? renderMobileCircle() : renderDesktopCircle()}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VirtualTeamCircle;
