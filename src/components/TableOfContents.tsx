// Prismic
import { PrismicRichText } from "@prismicio/react"
import { RichTextField } from "@prismicio/types"
import { GroupField } from "@prismicio/client";
import { BlogPostDocumentDataIconsItem, Simplify } from "../../prismicio-types";
// Next
import Link from "next/link"
// Utils
import { createID } from "@/utils/createId"

type TableOfContentsProps = {
mainArticleContent: RichTextField; // docData.main_article_content
tableOfContentsHeading: RichTextField; // docData.table_of_contents_heading
shareArticleText: RichTextField; // docData.share_article_text
icons: GroupField<Simplify<BlogPostDocumentDataIconsItem>>; // docData.icons
};

export default function TableOfContents({
    mainArticleContent,
    tableOfContentsHeading,
    shareArticleText,
    icons = [],
} : TableOfContentsProps
) {

    // Get heading type and text from main article content
    const headingLinks = mainArticleContent?.map(item => {
        if (item.type === "heading2"
            || item.type === "heading3"
            || item.type === "heading4"
            || item.type === "heading5"
            || item.type === "heading6") {
            return { type: item.type, text: item.text };
        }
    }).filter(Boolean)
    
    return (
    <aside>
        <div className="sticky top-40">
            {/* Table of contents section */}
            <div className="rounded-2xl p-4 mb-10 border">
                <div>
                    <PrismicRichText
                    field={tableOfContentsHeading}
                    components={{
                        heading4: ({children}) => <h4 className="mt-[0]!">{children}</h4>
                    }}
                    />
                </div>
                <div>
                    <menu>
                        {/* Show heading text and increase indentation for subheadings */}
                        {headingLinks.map((val, idx) => {
                            if (val?.type === "heading2") {
                                return <li key={idx} className="mb-2 text-base"><Link href={`#${createID(val.text)}`}>{val.text}</Link></li>
                            }
                            if (val?.type === "heading3") {
                                return <li key={idx} className="ml-2 text-[0.975rem] mb-2"><Link href={`#${createID(val.text)}`}>{val.text}</Link></li>
                            }
                            if (val?.type === "heading4") {
                                return <li key={idx} className="ml-4 text-[0.95rem] mb-2"><Link href={`#${createID(val.text)}`}>{val.text}</Link></li>
                            }
                            if (val?.type === "heading5") {
                                return <li key={idx} className="ml-6 text-[0.925rem]"><Link href={`#${createID(val.text)}`}>{val.text}</Link></li>
                            }
                            if (val?.type === "heading6") {
                                return <li key={idx} className="ml-8 text-[0.9rem]"><Link href={`#${createID(val.text)}`}>{val.text}</Link></li>
                            }
                        })}
                    </menu>
                </div>
                {/* End Table of contents section */}
            </div>
            {/* Share article section */}
            <div className="flex gap-3">
                <div>
                <PrismicRichText
                    field={shareArticleText}
                    components={{
                    heading4: ({ children }) => <h4 className="m-[0]!">{children}</h4>
                    }}
                /></div>
                <div className="flex gap-4">
                {/* TODO: Some icons from lucide-react are deprecated */}
                {icons?.map((icon, i) => {
                    return (
                    <Link href="/" key={i}>{icon.icon_text}</Link>
                    )
                })}
                </div>
            </div>
        </div>
     </aside>
  )
}
