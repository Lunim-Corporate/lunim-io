import { FC } from "react";
import { Content } from "@prismicio/client";
import { PrismicLink } from '@prismicio/react';
import type { SliceComponentProps } from '@prismicio/react';
import { asText } from '@prismicio/helpers';

/**
 * Props for `Hero`.
 */
export type HeroProps = SliceComponentProps<Content.HeroSlice>;

/**
 * Component for "Hero" Slices.
 */
const Hero: FC<HeroProps> = ({ slice }) => {
    const backgroundImageUrl = slice.primary.background_image.url;
    return (
      <section
        className="min-h-screen flex items-center relative overflow-hidden bg-black"
        style={{
          backgroundImage: `url(${backgroundImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {asText(slice.primary.hero_main_heading)}
              <span className="block bg-gradient-to-r from-[#BBFEFF] to-cyan-500 bg-clip-text text-transparent px-4" style={{ lineHeight: 1.2 }}>
                {asText(slice.primary.hero_secondary_heading)}
              </span>
            </h1>
  
            <div className="text-xl text-white mb-8 max-w-3xl mx-auto leading-relaxed">
              {slice.primary.hero_description}
            </div>
  
            <div className="flex flex-col gap-4 items-center justify-center mb-16">
              <PrismicLink
                field={slice.primary.button_link}
                className="max-w-xs bg-gradient-to-r bg-[#BBFEFF] text-black px-8 py-4 rounded-[0.3rem] font-semibold hover:bg-cyan-300 transition-colors duration-300 shadow-lg items-center justify-center space-x-2"
              >
              </PrismicLink>
            </div>
          </div>
        </div>
      </section>
    );
};

export default Hero;
