'use client';
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { PrismicRichText } from '@prismicio/react';
import type { SliceComponentProps } from '@prismicio/react';
import type { HomepageDocumentDataBodyFaqSlice } from '../../../prismicio-types';

type FAQSectionProps = SliceComponentProps<HomepageDocumentDataBodyFaqSlice>;

const FAQSection: React.FC<FAQSectionProps> = ({ slice }) => (
  <section className="bg-[#0f172a] py-20">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-3xl font-bold text-white mb-12 text-center">
        <PrismicRichText field={slice.primary.title} />
      </div>

      <div className="space-y-4">
        {slice.items.map((item, index) => (
          <div 
            key={index} 
            className="bg-[#1f2937] rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
          >
            <details className="group">
              <summary className="w-full flex justify-between items-center p-6 text-left cursor-pointer focus:outline-none list-none">
                <h3 className="text-lg font-semibold text-white pr-4">
                  {/* Use the Key Text field directly for the question */}
                  {item.question}
                </h3>
                <ChevronDown className="w-6 h-6 text-white flex-shrink-0 transition-transform duration-300 group-open:rotate-180" />
              </summary>
              {/* Use PrismicRichText for the answer, which handles paragraphs automatically */}
              <div className="p-6 pt-0 text-gray-300 prose prose-invert max-w-none">
                <PrismicRichText field={item.answer} />
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FAQSection;
