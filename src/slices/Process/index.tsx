"use client";
import { useState, useEffect } from "react";
import { PrismicRichText } from "@prismicio/react";
import type { SliceComponentProps } from "@prismicio/react";
import type { Content } from "@prismicio/client";
import { asText } from "@prismicio/helpers";
import { LucideProps, HelpCircle } from "lucide-react";
import Xarrow, { Xwrapper } from "react-xarrows";

/**
 * Props for `Process`.
 */
export type ProcessProps = SliceComponentProps<Content.ProcessSlice>;

// Icon components mapping (add more icons as needed)
const iconComponents: { [key: string]: React.ComponentType<LucideProps> } = {
  // Example: 'Star': StarIcon
};

const Process: React.FC<ProcessProps> = ({ slice }) => {
  const [isMobile, setIsMobile] = useState(false);
  const items = slice.items as Content.ProcessSliceDefaultItem[];

  // Check if the screen size is mobile
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
        {/* Title */}
        <div className="text-3xl font-bold text-white mb-12">
          <PrismicRichText field={slice.primary.title} />
        </div>

        <Xwrapper>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 relative">
            {items.map((item, index) => {
              const iconContent = item.icon_text || "";
              const isNumber = !isNaN(parseInt(iconContent));
              const IconComponent = iconComponents[iconContent] || HelpCircle;

              return (
                <div
                  key={index}
                  className="flex flex-col items-center text-center relative"
                >
                  {/* Circle with icon or number */}
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

                  {/* Item Title */}
                  <h3 className="text-[#BBFEFF] font-semibold text-lg mt-4 mb-1">
                    {asText(item.item_title)}
                  </h3>

                  {/* Weeks */}
                  <p className="text-gray-400 text-base">{item.weeks}</p>

                  {/* Item Description */}
                  <div className="text-gray-200 text-base max-w-xs mt-2">
                    <PrismicRichText field={item.item_description} />
                  </div>
                </div>
              );
            })}

            {/* Draw arrows between circles (desktop only) */}
            {!isMobile &&
              items.map((_, index) =>
                index < items.length - 1 ? (
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

export default Process;
