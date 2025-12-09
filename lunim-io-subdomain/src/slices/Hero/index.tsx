"use client";

import { FC, useRef, useState } from "react";
import { Content } from "@prismicio/client";
import { PrismicLink } from "@prismicio/react";
import type { SliceComponentProps } from "@prismicio/react";
import { asText } from "@prismicio/helpers";
import { LunaPortal } from "@/components/Luna";

/**
 * Props for `Hero` slice.
 */
export type HeroProps = SliceComponentProps<Content.HeroSlice>;

const Hero: FC<HeroProps> = ({ slice }) => {
  const [isLunaOpen, setIsLunaOpen] = useState(false);
  const backgroundImageUrl = slice.primary.background_image.url;
  const sectionRef = useRef<HTMLElement | null>(null);

  const showAskLuna = slice.primary.show_ask_luna ?? true;
  const showMainCta = slice.primary.show_main_cta ?? true;
  const hasMainCta = showMainCta && Boolean(slice.primary.button_link?.url);
  const shouldRenderCtas = hasMainCta || showAskLuna;
  const primaryCtaText = slice.primary.button_link?.text || "Learn more";
  const showDownScroll = slice.primary.show_down_scroll ?? true;

  return (
    <section
      ref={sectionRef}
      id="mainpage"
      className="min-h-screen flex items-center relative overflow-hidden"
      style={{
        backgroundColor: "var(--bg-dark)",
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 text-center">
        <h1
          className="text-4xl md:text-6xl font-bold mb-6"
          style={{ color: "var(--text-title)" }}
        >
          {asText(slice.primary.hero_main_heading)}
          <span
            className="block bg-clip-text text-transparent px-4"
            style={{
              backgroundImage: "linear-gradient(to right, var(--primary), var(--secondary))",
              lineHeight: 1.2,
            }}
          >
            {asText(slice.primary.hero_secondary_heading)}
          </span>
        </h1>

        <div
          className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed"
          style={{ color: "var(--text-body)" }}
        >
          {slice.primary.hero_description}
        </div>

        {/* CTAs */}
        {shouldRenderCtas && (
          <div className="flex flex-col gap-4 items-center justify-center mb-16 sm:flex-row">
            {hasMainCta && (
              <PrismicLink
                field={slice.primary.button_link}
                className="max-w-xs px-8 py-4 rounded-[0.3rem] font-semibold shadow-lg no-underline transition-colors duration-300"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--bg-dark)",
                }}
              >
                {primaryCtaText}
              </PrismicLink>
            )}

            {showAskLuna && (
              <button
                type="button"
                onClick={() => setIsLunaOpen(true)}
                className="max-w-xs px-8 py-4 rounded-[0.3rem] font-semibold shadow-lg cursor-pointer no-underline transition-all duration-300"
                style={{
                  backgroundColor: "var(--bg-mid)",
                  color: "var(--text-title)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  backdropFilter: "blur(4px)",
                }}
              >
                Ask Luna
              </button>
            )}
          </div>
        )}
      </div>

      {/* Scroll down chevron */}
      {showDownScroll && (
        <button
          onClick={() => {
            const current = sectionRef.current;
            if (!current) return;
            const next = current.nextElementSibling as HTMLElement | null;
            if (next) {
              next.scrollIntoView({ behavior: "smooth", block: "start" });
              return;
            }
            window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
          }}
          aria-label="Scroll down"
          className="cursor-pointer absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full p-3 shadow-lg animate-bounce"
          style={{
            color: "var(--primary)",
            backgroundColor: "var(--bg-mid)",
            border: "1px solid rgba(255,255,255,0.15)",
            backdropFilter: "blur(4px)",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-7 h-7"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      <LunaPortal isOpen={isLunaOpen} onClose={() => setIsLunaOpen(false)} />
    </section>
  );
};

export default Hero;
