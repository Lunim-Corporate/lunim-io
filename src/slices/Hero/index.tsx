"use client";
import { FC, useRef, useState } from "react";
import { Content } from "@prismicio/client";
import { PrismicLink } from "@prismicio/react";
import type { SliceComponentProps } from "@prismicio/react";
import { asText } from "@prismicio/helpers";
import { LunaPortal } from "@/components/Luna";

/**
 * Props for `Hero`.
 */
export type HeroProps = SliceComponentProps<Content.HeroSlice>;

/**
 * Component for "Hero" Slices.
 */
const Hero: FC<HeroProps> = ({ slice }) => {
  const [isLunaOpen, setIsLunaOpen] = useState(false);
  const backgroundImageUrl = slice.primary.background_image.url;
  const sectionRef = useRef<HTMLElement | null>(null);
  const showAskLuna = slice.primary.show_ask_luna ?? true;
  const showMainCta = slice.primary.show_main_cta ?? true;
  const hasMainCta = showMainCta && Boolean(slice.primary.button_link?.url);
  const shouldRenderCtas = hasMainCta || showAskLuna;
  const primaryCtaText = slice.primary.button_link?.text || "Learn more"
  const showDownScroll = slice.primary.show_down_scroll ?? true;

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex items-center relative overflow-hidden bg-black"
      id="mainpage"
      style={{
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black opacity-60"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {asText(slice.primary.hero_main_heading)}
            <span
              className="block bg-gradient-to-r from-[#BBFEFF] to-cyan-500 bg-clip-text text-transparent px-4"
              style={{ lineHeight: 1.2 }}
            >
              {asText(slice.primary.hero_secondary_heading)}
            </span>
          </h1>

          <div className="text-xl text-white mb-8 max-w-3xl mx-auto leading-relaxed">
            {slice.primary.hero_description}
          </div>

          {shouldRenderCtas ? (
            <div className="flex flex-col gap-4 items-center justify-center mb-16 sm:flex-row">
              {hasMainCta ? (
                <PrismicLink
                  field={slice.primary.button_link}
                  className="max-w-xs bg-[#BBFEFF] text-black px-8 py-4 rounded-[0.3rem] font-semibold hover:from-[#a0f5f7] hover:to-cyan-400 transition-colors duration-300 shadow-lg items-center justify-center space-x-2 no-underline"
                >
                  {primaryCtaText}
                </PrismicLink>
              ) : null}
              {showAskLuna ? (
                <button
                  type="button"
                  onClick={() => setIsLunaOpen(true)}
                  className="max-w-xs px-8 py-4 rounded-[0.3rem] border border-white/20 text-white font-semibold bg-white/10 hover:bg-white/20 transition-all duration-300 shadow-lg backdrop-blur-sm cursor-pointer no-underline"
                >
                  Ask Luna
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      {/* Scroll-down chevron (absolute, bottom-centered) */}
      {showDownScroll ? (
        <button
          onClick={() => {
            const current = sectionRef.current;
            if (!current) return;
            // Prefer the next sibling section if present
            const next = current.nextElementSibling as HTMLElement | null;
            if (next) {
              next.scrollIntoView({ behavior: "smooth", block: "start" });
              return;
            }
            // Fallback: scroll one viewport
            window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
          }}
          aria-label="Scroll down"
          className="cursor-pointer absolute bottom-6 left-1/2 -translate-x-1/2 z-20 rounded-full p-3 text-cyan-400 hover:text-cyan-300 ring-1 ring-white/15 bg-black/30 backdrop-blur-md shadow-lg animate-bounce"
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
      ) : null}
      <LunaPortal isOpen={isLunaOpen} onClose={() => setIsLunaOpen(false)} />
    </section>
  );
};

export default Hero;
