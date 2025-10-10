import { FC } from "react";
import { PrismicRichText } from "@prismicio/react";
import { SliceComponentProps } from "@prismicio/react";
import { Content } from "@prismicio/client";

export type CaseStudyTextPanelProps =
  SliceComponentProps<Content.CaseStudyTextPanelSlice>;

const CaseStudyTextPanel: FC<CaseStudyTextPanelProps> = ({ slice }) => {
  const v = slice.variation;

  // Determine background based on variation
  const bgColor =
    v === "default"
      ? "bg-gray-900"
      : v === "solutionTextPanel"
        ? "bg-black"
        : "bg-gray-900";

  // Map which fields to render depending on variation
  const headingField =
    v === "default"
      ? (slice as any).primary?.challenge_title
      : v === "solutionTextPanel"
        ? (slice as any).primary?.solution_title
        : (slice as any).primary?.impact_title;

  const contentField =
    v === "default"
      ? (slice as any).primary?.challenge_content
      : v === "solutionTextPanel"
        ? (slice as any).primary?.solution_content
        : (slice as any).primary?.impact_content;

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={v}
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
