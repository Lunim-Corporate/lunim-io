'use client';

import React from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { navigationCardsData } from "../../utils/navigationCardsData";

const NavigationCardsSection: React.FC = () => {
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

  const hoverVariants: Variants = {
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section id="services" className="bg-black py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Explore Our
            <span className="block bg-gradient-to-r from-[#BBFEFF] to-cyan-500 bg-clip-text text-transparent">
              Services
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Discover our comprehensive range of services designed to elevate
            your business to new heights
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {navigationCardsData.map((card) => (
            <motion.div
              key={card.path}
              variants={cardVariants}
              whileHover="hover"
              className="relative group"
            >
              <Link href={card.path}>
                <motion.div
                  variants={hoverVariants}
                  className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 h-72 flex flex-col justify-between overflow-hidden border border-gray-700/50 shadow-2xl"
                >
                  {/* Gradient overlay that becomes visible on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  ></div>

                  {/* Subtle glow effect */}
                  <div
                    className={`absolute -inset-1 bg-gradient-to-r ${card.gradient} rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500`}
                  ></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-center mb-6">
                      <div className="text-5xl mb-2 group-hover:scale-110 transition-transform duration-300">
                        {card.icon}
                      </div>
                    </div>

                    <div className="text-center">
                      <h3
                        className={`text-2xl font-bold text-white mb-4 group-hover:${card.hoverColor} transition-colors duration-300`}
                      >
                        {card.title}
                      </h3>
                      <p className="text-gray-400 text-base leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom accent line */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}
                  ></div>

                  {/* Hover arrow indicator */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg
                      className="w-6 h-6 text-[#BBFEFF]"
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
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default NavigationCardsSection;
