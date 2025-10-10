import { FC } from "react";
import { PrismicRichText } from "@prismicio/react";
import { SliceComponentProps } from "@prismicio/react";
import type { Content, RichTextField } from "@prismicio/client";

export type CaseStudyTextPanelProps =
  SliceComponentProps<Content.CaseStudyTextPanelSlice>;

const CaseStudyTextPanel: FC<CaseStudyTextPanelProps> = ({ slice }) => {
  const variation = slice.variation;

  // Determine background based on variation
  const bgColor =
    variation === "default"
      ? "bg-gray-900"
      : variation === "solutionTextPanel"
        ? "bg-black"
        : "bg-gray-900";

  let headingField: RichTextField | null = null;
  let contentField: RichTextField | null = null;

  switch (variation) {
    case "default":
      headingField = slice.primary.challenge_title;
      contentField = slice.primary.challenge_content;
      break;
    case "solutionTextPanel":
      headingField = slice.primary.solution_title;
      contentField = slice.primary.solution_content;
      break;
    case "impactTextPanel":
      headingField = slice.primary.impact_title;
      contentField = slice.primary.impact_content;
      break;
  }

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={variation}
      className={`py-8 ${bgColor}`}
    >
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-3xl font-bold mb-8 text-[#BBFEFF]">
          <PrismicRichText field={headingField} />
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 prose prose-invert max-w-none text-gray-300 text-lg leading-relaxed">
          <PrismicRichText field={contentField} />
        </div>
      </div>
    </section>
  );
};

export default CaseStudyTextPanel;
