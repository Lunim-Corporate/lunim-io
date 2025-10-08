"use client";

import React, { useState, useEffect } from "react";
import { Content } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";
import { asText } from "@prismicio/helpers";
import { LucideProps, HelpCircle } from "lucide-react";
import Xarrow, { Xwrapper } from "react-xarrows";

// You can add icon names here if you ever need to use this section with icons
const iconComponents: { [key: string]: React.ComponentType<LucideProps> } = {
  // Example: 'Star': StarIcon
};

interface ProcessSectionProps {
  slice: Content.ProcessSlice;
}

const ProcessSection: React.FC<ProcessSectionProps> = ({ slice }) => {
  const [isMobile, setIsMobile] = useState(false);

  // This hook checks the screen size to decide whether to show the arrows
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return (
    <section className="bg-[#0f172a] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="text-3xl font-bold text-white mb-12">
          <PrismicRichText field={slice.primary.title} />
        </div>

        <Xwrapper>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 relative">
            {slice.items.map((item, index) => {
              const iconContent = item.icon_text || "";
              const isNumber = !isNaN(parseInt(iconContent));
              const IconComponent = iconComponents[iconContent] || HelpCircle;

              return (
                <div
                  key={index}
                  className="flex flex-col items-center text-center relative"
                >
                  {/* Each circle needs a unique ID for the arrows to connect to */}
                  <div
                    id={`process-circle-${index}`}
                    className="bg-[#BBFEFF] w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-xl"
                  >
                    {isNumber ? (
                      <span className="text-black text-xl md:text-2xl font-bold">
                        {iconContent}
                      </span>
                    ) : (
                      <IconComponent className="w-6 h-6 md:w-8 md:h-8 text-black" />
                    )}
                  </div>

                  <h3 className="text-[#BBFEFF] font-semibold text-lg mt-4 mb-1">
                    {asText(item.item_title)}
                  </h3>
                  <p className="text-gray-400 text-base">{item.weeks}</p>
                  <div className="text-gray-200 text-base max-w-xs mt-2">
                    <PrismicRichText field={item.item_description} />
                  </div>
                </div>
              );
            })}

            {/* This code maps over your Prismic items to draw the arrows, but only on desktop */}
            {!isMobile &&
              slice.items.map((_, index) =>
                index < slice.items.length - 1 ? (
                  <Xarrow
                    key={index}
                    start={`process-circle-${index}`}
                    end={`process-circle-${index + 1}`}
                    strokeWidth={2.5}
                    color="#BBFEFF"
                    headSize={6}
                    curveness={0.4}
                    path="smooth"
                    animateDrawing={1.5}
                  />
                ) : null
              )}
          </div>
        </Xwrapper>
      </div>
    </section>
  );
};

export default ProcessSection;
