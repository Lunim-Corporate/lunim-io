"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { PrismicNextLink } from "@prismicio/next";
import type { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";

/**
 * Props for `NavigationMenu`.
 */
export type NavigationMenuProps = SliceComponentProps<Content.NavigationMenuSlice>;

/**
 * Component for "NavigationMenu".
 */
const NavigationMenu: React.FC<NavigationMenuProps> = ({ slice }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  const { logo, cta_label, menu } = slice.primary;

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="relative z-10 block h-12">
            {logo?.url ? (
              <Image
                src={logo.url}
                alt={logo.alt || "Logo"}
                width={160}
                height={48}
                className="h-12 w-auto"
                priority
              />
            ) : (
              <span className="text-white text-lg font-bold">Logo</span>
            )}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex relative">
            <div className="flex space-x-1">
              {menu.map((item, index) => (
                <PrismicNextLink
                  key={index}
                  field={item.link_label}
                  className="relative z-10 px-6 py-3 font-medium text-lg transition-all duration-300 text-white/80 hover:text-white"
                >
                  <span className="relative z-10">
                    {item.link_label.text || "Menu Item"}
                  </span>
                  <span className="absolute inset-0 bg-cyan-500/10 rounded-full scale-90 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </PrismicNextLink>
              ))}
            </div>
          </nav>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center">
            {cta_label && (
              <Link
                href="#"
                className="hidden md:block relative overflow-hidden group px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all duration-500 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/40"
              >
                <span className="relative z-10 font-bold text-black">
                  {cta_label}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -skew-x-12" />
              </Link>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden ml-4 relative z-50 p-3 rounded-full bg-black/30 backdrop-blur border border-cyan-500/30"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-cyan-400" />
              ) : (
                <Menu className="w-6 h-6 text-cyan-400" />
              )}
            </button>
          </div>
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
        <div className="w-full max-w-xs space-y-2 relative z-10">
          {menu.map((item, index) => (
            <PrismicNextLink
              key={index}
              field={item.link_label}
              className="block px-6 py-5 text-xl text-white/90 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center">
                <span>{item.link_label.text || "Menu Item"}</span>
              </div>
            </PrismicNextLink>
          ))}
        </div>
      </div>
    </header>
  );
};

export default NavigationMenu;
