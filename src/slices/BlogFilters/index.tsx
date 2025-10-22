"use client";
import { FC } from "react";
import type { SliceComponentProps } from "@prismicio/react";
import type { Content } from "@prismicio/client";
import Link from "next/link";

type Props = SliceComponentProps<Content.BlogFiltersSlice>;

const categories: string[] = ["All", "AI", "Design", "Engineering", "Product"];

const BlogFilters: FC<Props> = ({ slice }) => {
  return (
    <section className="bg-[#0f172a] py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-3 text-white/80 font-semibold">
          {slice.primary.heading ?? "Browse"}
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link
              key={c}
              href={`/blog${c === "All" ? "" : `?cat=${encodeURIComponent(c)}`}`}
              className="px-3 py-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 text-sm"
            >
              {c}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogFilters;
