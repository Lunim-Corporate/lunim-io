import { createID } from "@/utils/createId";
import Link from "next/link";
import { RefObject } from "react";

type HeadingLink = {
  type: string;
  text: string;
};

type TableOfContentsMenuProps = {
  headingLinks: (HeadingLink | undefined)[];
  activeId: string | null;
  activeItemRef: RefObject<HTMLLIElement | null>;
};

export default function TableOfContentsMenu({ headingLinks, activeId, activeItemRef }: TableOfContentsMenuProps) {
  return (
    <nav>
        <menu>
            {/* Show heading text and increase indentation for subheadings */}
            {headingLinks.map((val, idx: number) => {
                if (!val) return null;
                const itemId = createID(val.text || "");
                const isActive = activeId === itemId;
                
                if (val?.type === "heading2") {
                    return <li
                        key={idx}
                        ref={isActive ? activeItemRef : null}
                        className={`${isActive ? "text-cyan-400 before:content-['•'] before:text-current-400 before:absolute before:-left-1" : ""} relative ps-2 mb-2 text-base hover:text-[#1f2937] transition-colours duration-300`}>
                        <Link href={`#${itemId}`}>
                            {val.text}
                        </Link>
                    </li>
                }
                if (val?.type === "heading3") {
                    return <li
                        key={idx}
                        ref={isActive ? activeItemRef : null}
                        className={`${isActive ? "text-cyan-400 before:content-['•'] before:text-current-400 before:absolute before:-left-1" : ""} relative ps-2 mb-2 text-[0.975rem] hover:text-[#1f2937] transition-colours duration-300 ml-2`}>
                        <Link href={`#${itemId}`}>
                            {val.text}
                        </Link>
                    </li>
                }
                if (val?.type === "heading4") {
                    return <li
                        key={idx}
                        ref={isActive ? activeItemRef : null}
                        className={`${isActive ? "text-cyan-400 before:content-['•'] before:text-current-400 before:absolute before:-left-1" : ""} relative ps-2 mb-2 text-[0.95rem] hover:text-[#1f2937] transition-colours duration-300 ml-4`}>
                        <Link href={`#${itemId}`}>
                            {val.text}
                        </Link>
                    </li>
                }
                if (val?.type === "heading5") {
                    return <li
                        key={idx}
                        ref={isActive ? activeItemRef : null}
                        className={`${isActive ? "text-cyan-400 before:content-['•'] before:text-current-400 before:absolute before:-left-1" : ""} relative ps-2 mb-2 text-[0.925rem] hover:text-[#1f2937] transition-colours duration-300 ml-6`}>
                        <Link href={`#${itemId}`}>
                            {val.text}
                        </Link>
                    </li>
                }
                if (val?.type === "heading6") {
                    return <li
                        key={idx}
                        ref={isActive ? activeItemRef : null}
                        className={`${isActive ? "text-cyan-400 before:content-['•'] before:text-current-400 before:absolute before:-left-1" : ""} relative ps-2 mb-2 text-[0.9rem] hover:text-[#1f2937] transition-colours duration-300 ml-8`}>
                        <Link href={`#${itemId}`}>
                            {val.text}
                        </Link>
                    </li>
                }
            })}
        </menu>
    </nav>
  )
}
