import React from 'react';
import { Content } from '@prismicio/client';
import { PrismicRichText } from '@prismicio/react';
import { asText } from '@prismicio/helpers';

interface ImageTextSectionProps {
  slice: Content.ImageAndTextSlice; 
}

const ImageTextSection: React.FC<ImageTextSectionProps> = ({ slice }) => (
  <section className="bg-black py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center md:items-start gap-10">
      
      {/* Image is sourced from Prismic */}
      <div className="bg-[#1e293b] rounded-lg w-full md:w-1/2 flex justify-center items-center h-64 overflow-hidden">
        <img
          src={slice.primary.image.url}
          alt={slice.primary.image.alt || 'Content image'}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>

      <div className="w-full md:w-1/2 text-white">
        {/* Title, Subtitle, and Description are from Prismic */}
        <h2 className="text-3xl font-bold mb-4">
            {asText(slice.primary.title)}
        </h2>
        <p className="text-xl font-medium mb-4">
            {asText(slice.primary.subtitle)}
        </p>
        <div className="text-gray-200">
            <PrismicRichText field={slice.primary.description} />
        </div>
      </div>

    </div>
  </section>
);

export default ImageTextSection;