"use client";
import {
  PrismicRichText,
  type SliceComponentProps,
} from "@prismicio/react";
import { asText, Content } from "@prismicio/client";
// React
import { FC } from "react";
import { PrismicNextLink } from "@prismicio/next";

type ProjectShowcaseProps = SliceComponentProps<Content.ProjectShowcaseSlice>;

const ProjectShowcase: FC<ProjectShowcaseProps> = ({ slice }) => {
  return (
    <section
      id="case-studies"
      className="bg-[#0f172a] py-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#0f172a]">
        {/* Only show title for this slice */}
        {slice.variation === "projectShowcaseHero" && (
          <div className="mb-22">
            <PrismicRichText
              field={slice.primary.title}
              components={{
                heading2: ({ children }) => <h2 className="text-3xl font-bold text-white text-center ">{children}</h2>
              }}
              />
          </div>
        )}
        {/* Heading (for example, UX, Web3, AI) */}
        <div className="text-3xl font-bold text-white mb-18 text-center">
          <PrismicRichText field={slice.primary.heading} />
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {slice.primary.case_study && slice.primary.case_study.length > 0 && (
          slice.primary.case_study.map((item, index) => {
            const tagsArray: string[] = item.tags
                  ? item.tags.split(",").map((tag) => tag.trim())
                  : [];

            return (
              <PrismicNextLink
                field={item.project_link}
                key={index}
                className="rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 flex flex-col h-full"
            >
            <div
                className="bg-gray-800 h-48 flex items-center justify-center"
                style={
                    item.project_image
                    ? {
                    backgroundImage: `url(${item.project_image.url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    }
                    : {}
                }
            />

            <div className="bg-[#1f2937] p-6 flex-1 flex flex-col">
                <div className="flex-1">
                    {item.show_cta_button ? (
                    <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] pt-4 pb-8">
                        <div>
                            <h3 className="text-white font-bold text-xl m-0! text-left">
                            {asText(item.project_title)}
                            </h3>
                        </div>
                        <div className='mt-2 sm:mt-0 text-start sm:text-end'>
                            
                        </div>
                    </div>
                    ) : (
                        <div className="grid grid-cols-1 pt-4 pb-8">
                          <h3 className="text-white font-bold text-xl m-0! text-left">
                          {asText(item.project_title)}
                          </h3>
                        </div>
                      )}
                    <div className="text-gray-200 text-base text-left">
                        <p>{asText(item.project_description)}&nbsp; <button className="after:content-['_>'] cursor-pointer rounded-[0.3rem] text-base text-[#BBFEFF] hover:text-cyan-300">{item.button_cta_text}</button></p>
                    </div>
                </div>

                {tagsArray.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                    {tagsArray.map((tag, tagIndex) => (
                      <span
                      key={tagIndex}
                      className="bg-white/10 text-white px-3 py-1 rounded-full"
                      >
                          {tag}
                      </span>
                    ))}
                </div>
                )}
            </div>
            </PrismicNextLink>
            )
          })
        )}
      </div>
      {/* Case Study Link */}
      {slice.primary.show_case_study_page_link && (
      <div className="mt-16 text-center text-white">
        <PrismicNextLink
            field={slice.primary.case_study_page_link}
            className='bg-[#BBFEFF] text-black px-8 py-4 rounded-[0.3rem] font-semibold hover:bg-cyan-300 transition-colors duration-300'
          />
        </div>
        )}
      </div>
    </section>
  );
};

export default ProjectShowcase;
