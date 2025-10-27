"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { PrismicNextLink } from "@prismicio/next";
import { Menu, X, ChevronDown, Circle } from "lucide-react";
import type { LinkField } from "@prismicio/client";

type ChildLink = { label: string; link: LinkField };
type Section = {
  id: string;
  label: string;
  link: LinkField | null;
  children: ChildLink[];
};

export function NavigationMenuClient({
  data,
}: {
  data: {
    logoUrl: string | null;
    logoAlt: string;
    ctaLabel: string | null;
    ctaLink: LinkField | null;
    sections: Section[];
  };
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  const [openMobileSections, setOpenMobileSections] = useState<Record<string, boolean>>({});
  const toggleMobileSection = (id: string) => setOpenMobileSections((prev) => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => {
    const handleScroll = () => setIsAtTop(window.scrollY < 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isAtTop
          ? "bg-transparent py-2"
          : "bg-[#0a0a1a]/95 py-2 shadow-2xl shadow-cyan-500/20"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
        {/* Logo */}
        <Link
          href="/"
          className="relative z-10 block h-12"
          aria-label="Go to homepage"
        >
          {data.logoUrl ? (
            <Image
              src={data.logoUrl}
              alt={data.logoAlt}
              width={160}
              height={48}
              className="h-12 w-auto"
              priority
            />
          ) : (
            <span className="text-white text-lg font-bold">Logo</span>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          {data.sections.map((section) => {
            const children = section.children.filter((c) => {
              const hasLabel =
                typeof c.label === "string" && c.label.trim().length > 0;
              // some Prismic groups may include an empty row; treat missing/empty link as falsy
              const hasLink =
                (c.link as unknown) !== null &&
                (c.link as unknown) !== undefined;
              return hasLabel && hasLink;
            });
            const hasRealChildren = children.length > 0;
            return (
              <div key={section.id} className="relative group">
                <div className="flex items-center">
                  {section.link ? (
                    <PrismicNextLink
                      field={section.link}
                      className="px-4 py-3 text-white/80 hover:text-white transition-colors"
                    >
                      {section.label}
                    </PrismicNextLink>
                  ) : (
                    <span className="px-4 py-3 text-white/80">
                      {section.label}
                    </span>
                  )}
                  {hasRealChildren && (
                    <ChevronDown className="w-4 h-4 ml-1 text-white/70 group-hover:text-white transition-colors" />
                  )}
                </div>
                {hasRealChildren && (
                  <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-0 top-full mt-2 w-64 rounded-xl border border-white/10 bg-[#0a0a1a] shadow-xl transition-all duration-200">
                    <ul className="py-2 list-none m-0">
                      {children.map((child, idx) => (
                        <li key={`${section.id}-${idx}`}>
                          <PrismicNextLink
                            field={child.link}
                            className="flex items-center gap-2 px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors pl-6"
                          >
                            <Circle className="w-2 h-2 text-white/40" />
                            {child.label}
                          </PrismicNextLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* CTA + Mobile toggle */}
        <div className="flex items-center">
          {data.ctaLink && data.ctaLabel && (
            <PrismicNextLink
              field={data.ctaLink}
              className="hidden md:block px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-black shadow-lg"
            >
              {data.ctaLabel}
            </PrismicNextLink>
          )}
          <button
            onClick={() => setIsMenuOpen((v) => !v)}
            className="md:hidden ml-4 p-3 rounded-full bg-black/30 border border-cyan-500/30"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-cyan-400" />
            ) : (
              <Menu className="w-6 h-6 text-cyan-400" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        ref={menuRef}
        className={`md:hidden fixed inset-0 bg-[#0a0a1a]/90 backdrop-blur-lg pt-24 pb-12 z-40 flex flex-col items-center transition-all duration-500 ${
          isMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-full pointer-events-none"
        }`}
      >
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setIsMenuOpen(false)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white border border-white/20 backdrop-blur hover:bg-white/15"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
            <span className="text-sm">Close</span>
          </button>
        </div>
        <div className="w-full max-w-xs space-y-2">
          {data.sections.map((section) => {
            const children = section.children.filter((c) => {
              const hasLabel =
                typeof c.label === "string" && c.label.trim().length > 0;
              const hasLink =
                (c.link as unknown) !== null &&
                (c.link as unknown) !== undefined;
              return hasLabel && hasLink;
            });
            const hasRealChildren = children.length > 0;
            return (
              <div
                key={section.id}
                className="bg-white/5 rounded-xl border border-white/10 overflow-hidden"
              >
                <div className="px-2">
                  <button
                    type="button"
                    onClick={() => (hasRealChildren ? toggleMobileSection(section.id) : undefined)}
                    className="w-full flex items-center justify-between px-4 py-4 rounded-lg hover:bg-white/10 transition-colors"
                    aria-expanded={hasRealChildren ? !!openMobileSections[section.id] : undefined}
                  >
                    {section.link && !hasRealChildren ? (
                      <PrismicNextLink
                        field={section.link}
                        className="text-white/90 hover:text-white font-medium w-full text-left"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {section.label}
                      </PrismicNextLink>
                    ) : (
                      <span className="text-white/90 font-medium">{section.label}</span>
                    )}
                    {hasRealChildren && (
                      <ChevronDown
                        className={`w-5 h-5 text-white/70 transition-transform ${
                          openMobileSections[section.id] ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>
                </div>
                {hasRealChildren && openMobileSections[section.id] && (
                  <ul className="list-none m-0 px-3 pb-4 space-y-1">
                    {children.map((child, idx) => (
                      <li key={`${section.id}-m-${idx}`}>
                        <PrismicNextLink
                          field={child.link}
                          className="flex items-center gap-3 px-4 py-3 text-white/85 hover:text-white hover:bg-white/10 rounded-lg ml-3"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/50" />
                          <span className="text-sm">{child.label}</span>
                        </PrismicNextLink>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}
