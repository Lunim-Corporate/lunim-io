'use client';
// Prismic
import { PrismicLink, PrismicRichText } from "@prismicio/react"
import { RichTextField } from "@prismicio/types"
import { GroupField } from "@prismicio/client";
import { BlogPostDocumentDataIconsItem, Simplify } from "../../prismicio-types";
// Next
import Link from "next/link"
// React
import { useEffect, useRef, useState } from "react";
// Utils
import { createID } from "@/utils/createId"
// Icons
import { ChevronDown } from "lucide-react";

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
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const activeItemRef = useRef<HTMLLIElement>(null);
    // See parent div `[uid]/page.tsx` for breakpoint details
    const changeLayoutBreakpoint = 1024; // Tailwind 'lg' breakpoint

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

    // Observe headings in the document to update active TOC item
    useEffect(() => {
        if (!headingLinks.length) return;

        const headingIds = headingLinks.map(h => createID(h?.text || ""));
        // Find IDS of headings in the document
        const headings = headingIds
            .map(id => document.getElementById(id))
            .filter(Boolean) as HTMLElement[];

        if (!headings.length) return;

        // Local cache to avoid redundant state updates when the active id is unchanged
        let lastActiveId: string | null = null;

        // Watches when headings enter/leave viewport
        const observer = new window.IntersectionObserver(
            (entries) => {
            // Find all visible headings
            const visible = entries
                .filter(e => e.isIntersecting && e.intersectionRatio > 0)
                .map(e => ({
                id: e.target.id,
                top: e.boundingClientRect.top
                }))
                // Ignore headings that are above the viewport
                .filter(e => e.top >= 0);

            // Pick the one closest to the top, if any headings are visible
            if (visible.length > 0) {
                visible.sort((a, b) => a.top - b.top);
                const newActiveId = visible[0].id;
                if (newActiveId !== lastActiveId) {
                lastActiveId = newActiveId;
                setActiveId(newActiveId);
                }
            }
            },
            {
            root: null,
            rootMargin: "0px 0px -80% 0px", // triggers when heading is in top 20% of viewport
            threshold: [0, 1]
            }
        );

        headings.forEach(h => observer.observe(h));

        return () => {
            observer.disconnect();
        };
    }, [headingLinks]);

    // Auto-scroll the active TOC item to the top when it changes
    useEffect(() => {
        if (!activeId || !activeItemRef.current) return;
        
        // Only auto-scroll if the TOC is in desktop/sticky mode
        // Check if screen is large enough (Tailwind lg breakpoint = 1024px)
        const isDesktop = window.innerWidth >= changeLayoutBreakpoint;
        if (!isDesktop) return;
        
        // Scroll the active item into view at the top of the TOC
        activeItemRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
        });
    }, [activeId]);
    
    return (
    <aside>
        <div className="sticky top-40">
            {/* Table of contents section */}
            <div className={`rounded-2xl p-6 mb-10 border shadow-cyan-400 shadow-md/50`}>
                <div className="flex justify-between mb-5">
                    <PrismicRichText
                    field={tableOfContentsHeading}
                    components={{
                        heading4: ({children}) => <h4 className="mt-[0]! text-2xl">{children}</h4>
                    }}
                        />
                    <button 
                        aria-label="Toggle Table of contents" 
                        className="cursor-pointer"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <ChevronDown className={`w-6 h-6 text-white flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2000px]' : 'max-h-[50px]'}`}>
                    <nav>
                        <menu>
                            {/* Show heading text and increase indentation for subheadings */}
                            {headingLinks.map((val, idx) => {
                                if (!val) return null;
                                const itemId = createID(val.text);
                                const isActive = activeId === itemId;
                                
                                if (val?.type === "heading2") {
                                    return <li
                                        key={idx}
                                        ref={isActive ? activeItemRef : null}
                                        className={`${isActive ? "text-cyan-400" : ""} mb-2 text-base hover:text-[#1f2937] transition-colours duration-300`}>
                                        <Link href={`#${itemId}`}>
                                            {val.text}
                                        </Link>
                                    </li>
                                }
                                if (val?.type === "heading3") {
                                    return <li
                                        key={idx}
                                        ref={isActive ? activeItemRef : null}
                                        className={`${isActive ? "text-cyan-400" : ""} mb-2 text-[0.975rem] hover:text-[#1f2937] transition-colours duration-300 ml-2`}>
                                        <Link href={`#${itemId}`}>
                                            {val.text}
                                        </Link>
                                    </li>
                                }
                                if (val?.type === "heading4") {
                                    return <li
                                        key={idx}
                                        ref={isActive ? activeItemRef : null}
                                        className={`${isActive ? "text-cyan-400" : ""} mb-2 text-[0.95rem] hover:text-[#1f2937] transition-colours duration-300 ml-4`}>
                                        <Link href={`#${itemId}`}>
                                            {val.text}
                                        </Link>
                                    </li>
                                }
                                if (val?.type === "heading5") {
                                    return <li
                                        key={idx}
                                        ref={isActive ? activeItemRef : null}
                                        className={`${isActive ? "text-cyan-400" : ""} mb-2 text-[0.925rem] hover:text-[#1f2937] transition-colours duration-300 ml-6`}>
                                        <Link href={`#${itemId}`}>
                                            {val.text}
                                        </Link>
                                    </li>
                                }
                                if (val?.type === "heading6") {
                                    return <li
                                        key={idx}
                                        ref={isActive ? activeItemRef : null}
                                        className={`${isActive ? "text-cyan-400" : ""} mb-2 text-[0.9rem] hover:text-[#1f2937] transition-colours duration-300 ml-8`}>
                                        <Link href={`#${itemId}`}>
                                            {val.text}
                                        </Link>
                                    </li>
                                }
                            })}
                        </menu>
                    </nav>
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
                {icons?.map((icon, idx) => {
                    return <PrismicLink key={idx} field={icon.icon_link}>{icon.icon_text}</PrismicLink>
                })}
                </div>
            </div>
            {/* End Share article section */}
        </div>
     </aside>
  )
}
