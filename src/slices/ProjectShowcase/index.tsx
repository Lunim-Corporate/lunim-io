"use client";
import {
  PrismicRichText,
  type SliceComponentProps,
} from "@prismicio/react";
import { Content } from "@prismicio/client";
import CaseStudies from "@/components/CaseStudies";
import { FC } from "react";

type ProjectShowcaseProps = SliceComponentProps<Content.ProjectShowcaseSlice>;

const ProjectShowcase: FC<ProjectShowcaseProps> = ({ slice }) => {
  const projects =
    slice.items as ReadonlyArray<Content.ProjectShowcaseSliceDefaultItem>;
  
  const categories: string[] = ["ai", "ux", "web3"];

  return (
    <section
      id={slice.primary.section_id || "case-studies"}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="bg-[#0f172a] py-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {slice.primary.title && (
          <div className="text-3xl font-bold text-white mb-24 text-center">
            <PrismicRichText field={slice.primary.title} />
          </div>
        )}
        <CaseStudies projects={projects} heading={slice.primary.heading_ai} caseStudiesPageLink={slice.primary.ai_link} category={categories[0]} />
        <CaseStudies projects={projects} heading={slice.primary.heading_ux} caseStudiesPageLink={slice.primary.ux_link} category={categories[1]} />
        <CaseStudies projects={projects} heading={slice.primary.heading_web3} caseStudiesPageLink={slice.primary.web3_link} category={categories[2]} />
      </div>
    </section>
  );
};

export default ProjectShowcase;
