'use client';
import React, { FC } from 'react';
import { PrismicRichText, PrismicLink, type SliceComponentProps } from '@prismicio/react';
import { Content } from '@prismicio/client';
import { asText } from '@prismicio/helpers';

type ProjectShowcaseProps = SliceComponentProps<Content.ProjectShowcaseSlice>;

const ProjectShowcase: FC<ProjectShowcaseProps> = ({ slice }) => {
  const projects = slice.items as ReadonlyArray<Content.ProjectShowcaseSliceDefaultItem>;

  return (
    <section
      id={slice.primary.section_id || undefined}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="bg-[#0f172a] py-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {slice.primary.title && (
          <div className="text-3xl font-bold text-white mb-12 text-center">
            <PrismicRichText field={slice.primary.title} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {projects.map((project, index) => {
            const tagsArray: string[] = project.tags
              ? project.tags.split(',').map(tag => tag.trim())
              : [];
            const projectImageUrl: string | undefined = project.project_image?.url ?? undefined;

            return (
              <PrismicLink
                field={project.project_link}
                key={index}
                className="block rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 flex flex-col h-full"
              >
                <div
                  className="bg-gray-800 h-48 flex items-center justify-center"
                  style={
                    projectImageUrl
                      ? {
                          backgroundImage: `url(${projectImageUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }
                      : {}
                  }
                />

                <div className="bg-[#1f2937] p-6 flex-1 flex flex-col">
                  <div className="flex-1">
                    {project.project_title && (
                      <h3 className="text-white font-bold text-xl mb-2 text-left">
                        {asText(project.project_title)}
                      </h3>
                    )}
                    <div className="text-gray-200 text-base text-left">
                      <PrismicRichText field={project.project_description} />
                    </div>
                  </div>

                  {tagsArray.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {tagsArray.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="bg-white/10 text-white text-xs font-semibold px-3 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </PrismicLink>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProjectShowcase;
