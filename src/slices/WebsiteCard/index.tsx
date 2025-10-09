import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { PrismicRichText, PrismicLink } from "@prismicio/react";

/**
 * Props for `WebsiteCard`.
 */
export type WebsiteCardProps = SliceComponentProps<Content.WebsiteCardSlice>;

/**
 * Component for "WebsiteCard" Slices.
 */
const WebsiteCard: FC<WebsiteCardProps> = ({ slice }) => {
  return (
    // Structure of the website card section
    <section className="bg-[#0f172a] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {/* End website card structure */}
          {/* Loop over all website cards here */}
        {slice.primary.card.map((cardItem, index) => {
          return (
            // Each card links to the specified website
            <PrismicLink
              field={cardItem.link_to_website}
              key={index}
              className="rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 flex flex-col h-full" 
              >
            <div
              className="bg-gray-800 h-48 flex items-center justify-center"
              style={{
                backgroundImage: `url(${cardItem.background_image.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
              <div className="bg-[#1f2937] p-6 flex-1 flex flex-col"> 
                <div className="flex-1">
                  <h3 className="text-white font-bold text-xl mb-2 text-left">
                    <PrismicRichText field={cardItem.title} />
                  </h3>
                  <div className="text-gray-200 text-base text-left">
                    <p>{cardItem.description}</p>
                  </div>
                </div>
              </div>
            </PrismicLink>
          )
        })}
        </div>
        </div>
    </section>
  );
};

export default WebsiteCard;
