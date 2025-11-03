// Prismic
import { asText, Content } from '@prismicio/client';
import { PrismicNextLink } from '@prismicio/next';
import { PrismicRichText } from '@prismicio/react';
import { RichTextField } from '@prismicio/types';
// React
import { ComponentProps } from 'react';


type CaseStudiesProps = {
    projects: ReadonlyArray<Content.ProjectShowcaseSliceDefaultItem>
    heading: RichTextField,
    caseStudiesPageLink: ComponentProps<typeof PrismicNextLink>['field'],
    category: string
}

export default function CaseStudies({ projects, heading, caseStudiesPageLink, category }: CaseStudiesProps) {
    
    const filteredProjects = projects.filter(project => project.relationship === category);

    if (filteredProjects.length === 0) return null;
    
    return (
    <>
        <div className="mb-10">
            <PrismicRichText field={heading} components={{
                heading2: ({children}) => <h2 className="text-3xl font-bold text-white mb-12 text-center">{children}</h2>
            }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {filteredProjects.map((project, index) => {
                const tagsArray: string[] = project.tags
                ? project.tags.split(",").map((tag) => tag.trim())
                : [];
                const projectImageUrl: string | undefined =
                project.project_image?.url ?? undefined;

            return (
                <PrismicNextLink
                    field={project.project_link}
                    key={index}
                    className="rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 flex flex-col h-full"
                >
                <div
                    className="bg-gray-800 h-48 flex items-center justify-center"
                    style={
                        projectImageUrl
                        ? {
                        backgroundImage: `url(${projectImageUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
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
                    {project.show_cta_button && (
                    <div className="mt-10">
                        <button
                        className="cursor-pointer bg-[#BBFEFF] text-black px-8 py-2 rounded-[0.3rem] font-semibold hover:bg-cyan-300 transition-colors duration-300">
                        {project.button_cta_text || "More"}
                        </button>
                    </div>
                )}
                </div>
                </PrismicNextLink>
            );
            })}
        </div>
        <div className="mt-16 mb-48 text-center text-white">
            <PrismicNextLink 
                field={caseStudiesPageLink}
                className='bg-[#BBFEFF] text-black px-8 py-4 rounded-[0.3rem] font-semibold hover:bg-cyan-300 transition-colors duration-300'
             />
        </div>
    </>
  )
}
