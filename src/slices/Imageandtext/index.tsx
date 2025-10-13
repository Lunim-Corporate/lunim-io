import Image from "next/image";
import { PrismicRichText } from "@prismicio/react";
import type { SliceComponentProps } from "@prismicio/react";
import type { Content } from "@prismicio/client";
import { asText } from "@prismicio/helpers";

/**
 * Props for `Imageandtext`.
 */
export type ImageandtextProps = SliceComponentProps<Content.ImageandtextSlice>;

/**
 * Component for "Imageandtext" Slices.
 */
const Imageandtext: React.FC<ImageandtextProps> = ({ slice }) => (
  <section className="bg-black py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center md:items-start gap-10">
      
      <div className="bg-[#1e293b] rounded-lg w-full md:w-1/2 flex justify-center items-center h-64 overflow-hidden relative">
        {slice.primary.image?.url ? (
          <Image
            src={slice.primary.image.url}
            alt={slice.primary.image.alt || "Content image"}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover rounded-lg"
            unoptimized
          />
        ) : null}
      </div>

      <div className="w-full md:w-1/2 text-white">
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

export default Imageandtext;
