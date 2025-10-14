"use client";
import { FC } from "react";
import type { Content } from "@prismicio/client";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";
import { asText } from "@prismicio/helpers";
import type { LucideProps } from "lucide-react";
import {
  Telescope as TelescopeIcon,
  Brain as BrainIcon,
  Network as NetworkIcon,
  PersonStanding as PersonStandingIcon,
  HelpCircle,
} from "lucide-react";

/**
 * Props for `Expertiseareas`.
 */
export type ExpertiseareasProps =
  SliceComponentProps<Content.ExpertiseareasSlice>;

/**
 * Map icon_name (text in Prismic) to Lucide components.
 */
const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  Telescope: TelescopeIcon,
  Brain: BrainIcon,
  Network: NetworkIcon,
  PersonStanding: PersonStandingIcon,
};

const Expertiseareas: FC<ExpertiseareasProps> = ({ slice }) => {
  // Defensive: ensure arrays exist
  const items: ReadonlyArray<Content.ExpertiseareasSliceDefaultItem> =
    (slice.items as ReadonlyArray<Content.ExpertiseareasSliceDefaultItem>) ?? [];

  // Heading is RichText (heading1). We render as plain text inside our own <h2> to avoid nested heading issues.
  const headingText: string = asText(slice.primary.heading) ?? "";

  return (
    <section
      className="py-20 bg-black"
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {items.map((item, idx) => {
            const Icon =
              (item.icon_name && ICONS[item.icon_name]) || HelpCircle;

            const itemTitleText: string = asText(item.item_title) ?? "";

            return (
              <div
                key={idx}
                className="rounded-2xl p-6 bg-black/40 border border-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] hover:border-[#BBFEFF]/40 transition-colors"
              >
                <div className="bg-[#BBFEFF] text-black w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-7 h-7" />
                </div>

                {/* Item title rendered as plain text to avoid nested heading conflicts */}
                {itemTitleText && (
                  <h3 className="text-xl font-bold text-[#BBFEFF] mb-2">
                    {itemTitleText}
                  </h3>
                )}

                {/* Description is RichText (paragraph). We control paragraph rendering. */}
                <PrismicRichText
                  field={item.item_description}
                  components={{
                    paragraph: ({ children }) => (
                      <p className="text-gray-300 text-base">{children}</p>
                    ),
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Right column text block */}
        <div>
          {headingText && (
            <h2 className="text-4xl font-bold text-white mb-4">
              {headingText}
            </h2>
          )}

          <PrismicRichText
            field={slice.primary.paragraph}
            components={{
              paragraph: ({ children }) => (
                <p className="text-xl text-gray-300 leading-relaxed mb-6">
                  {children}
                </p>
              ),
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default Expertiseareas;
