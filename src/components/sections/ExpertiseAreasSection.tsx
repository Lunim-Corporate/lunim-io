import React from "react";
import { Content } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";
import { asText } from "@prismicio/helpers";

// Import the icons
import {
  Telescope as TelescopeIcon,
  Brain as BrainIcon,
  Network as NetworkIcon,
  PersonStanding,
  LucideProps,
  HelpCircle, // A fallback icon
} from "lucide-react";

// This is icon mapping
const iconComponents: { [key: string]: React.ComponentType<LucideProps> } = {
  Telescope: TelescopeIcon,
  PersonStanding: PersonStanding,
  Brain: BrainIcon,
  Network: NetworkIcon,
};

interface ExpertiseAreasSectionProps {
  slice: Content.ExpertiseareasSlice;
}

const ExpertiseAreasSection: React.FC<ExpertiseAreasSectionProps> = ({
  slice,
}) => {
  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {slice.items.map((item, index) => {
            const Icon = iconComponents[item.icon_name || ""] || HelpCircle;

            return (
              <div
                key={index}
                className="bg-black rounded-2xl p-6 border border-white border-opacity-20"
              >
                <div className="bg-[#BBFEFF] text-black w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[#BBFEFF] mb-2">
                  {asText(item.item_title)}
                </h3>
                <div className="text-gray-300 text-base">
                  <PrismicRichText field={item.item_description} />
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <h2 className="text-4xl font-bold text-white mb-4">
            {asText(slice.primary.heading)}
          </h2>
          <PrismicRichText
            field={slice.primary.paragraph}
            components={{
              paragraph: ({ children }) => (
                <p className="text-xl text-gray-300 leading-relaxed mb-6">
                  {children}
                </p>
              ),
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default ExpertiseAreasSection;
