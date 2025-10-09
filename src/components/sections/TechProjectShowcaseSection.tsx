"use client";

import React from "react";
import { PrismicRichText } from "@prismicio/react";
import type { SliceComponentProps } from "@prismicio/react";
import type { HomepageDocumentDataBodyProjectShowcaseSlice } from "../../../prismicio-types";
import Link from "next/link";
import { asText } from "@prismicio/helpers";
import { motion, type Variants } from "framer-motion";

type TechProjectShowcaseSectionProps = SliceComponentProps<HomepageDocumentDataBodyProjectShowcaseSlice>;

const TechProjectShowcaseSection: React.FC<TechProjectShowcaseSectionProps> = ({
  slice,
}) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section id="case-studies" className="bg-black py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Technology
            <span className="block bg-gradient-to-r from-[#BBFEFF] to-cyan-500 bg-clip-text text-transparent">
              Case Studies
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Discover how we&apos;ve transformed businesses with cutting-edge
            technology solutions and innovative approaches.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {slice.items.map((project, index) => {
            // Split the comma-separated tags string into an array
            const tagsArray = project.tags
              ? project.tags.split(",").map((tag) => tag.trim())
              : [];

            // Create the tech case study URL
            const projectSlug = asText(project.project_title)
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "");

            return (
              <motion.div key={index} variants={cardVariants} className="group">
                <Link
                  href={`/tech/case-studies/${projectSlug}`}
                  className="block bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden border border-gray-700/50 hover:border-[#BBFEFF]/50 transition-all duration-300 shadow-2xl group-hover:scale-105"
                >
                  <div
                    className="h-48 md:h-56 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 flex items-center justify-center relative overflow-hidden"
                    style={
                      project.project_image.url
                        ? {
                            backgroundImage: `url(${project.project_image.url})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : {}
                    }
                  >
                    {/* Overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                    {/* Tech icon overlay */}
                    {!project.project_image.url && (
                      <div className="text-6xl opacity-20">💻</div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-white font-bold text-xl mb-3 group-hover:text-[#BBFEFF] transition-colors duration-300">
                      {asText(project.project_title)}
                    </h3>
                    <div className="text-gray-300 text-base mb-4 group-hover:text-gray-200 transition-colors duration-300">
                      <PrismicRichText field={project.project_description} />
                    </div>

                    {tagsArray.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tagsArray.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="bg-[#BBFEFF]/10 text-[#BBFEFF] text-xs font-semibold px-3 py-1 rounded-full border border-[#BBFEFF]/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Arrow indicator */}
                    <div className="flex justify-end mt-4">
                      <div className="w-8 h-8 rounded-full bg-[#BBFEFF]/10 flex items-center justify-center group-hover:bg-[#BBFEFF]/20 transition-colors duration-300">
                        <svg
                          className="w-4 h-4 text-[#BBFEFF]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 17L17 7M17 7H7M17 7V17"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default TechProjectShowcaseSection;
