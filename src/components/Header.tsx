"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PrismicNextLink } from "@prismicio/next";
import type { Content } from "@prismicio/client";
import { Menu, X } from "lucide-react";
import { asLink } from "@prismicio/helpers";
import { useLayoutData } from "../contexts/LayoutContext";
import logoFallback from "../assets/lunim-logo.png";

const Header: React.FC = () => {
  const layout = useLayoutData();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  /**
   * Smooth-scroll to hash targets when the link resolves to the current page.
   * Falls back to normal navigation otherwise.
   */
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string | null | undefined,
    after?: () => void
  ) => {
    if (!href) return;

    try {
      // Support plain hash (e.g. "#case-studies") and full paths (e.g. "/tech#case-studies")
      const isHashOnly = href.startsWith("#");
      const base =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://lunim.io";
      const full = isHashOnly ? `${pathname || "/"}${href}` : href;
      const url = new URL(full, base);

      const targetPath = url.pathname.replace(/\/+$/, "") || "/";
      const currentPath = (pathname || "/").replace(/\/+$/, "") || "/";
      const hash = url.hash.replace(/^#/, "");

      // If we're already on the same page and there is a hash target, smooth-scroll
      if (hash && targetPath === currentPath) {
        e.preventDefault();
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          // Optionally update the hash in the URL without jumping
          if (typeof window !== "undefined") {
            window.history.replaceState({}, "", `#${hash}`);
          }
        }
        if (after) after();
      }
    } catch {
      // no-op: fall through to default behavior
    }
  };

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

  const layoutData = layout?.data;
  const menuItems =
    layoutData?.header_navigation ??
    ([] as Content.LayoutDocumentDataHeaderNavigationItem[]);

  const isActive = (href?: string) => {
    if (!href) return false;
    try {
      const base =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://lunim.io";
      const url = new URL(href, base);
      const path = url.pathname.replace(/\/+$/, "") || "/";
      const current = (pathname || "/").replace(/\/+$/, "") || "/";
      return current === path || current.startsWith(path + "/");
    } catch {
      return false;
    }
  };

  if (!layout) {
    // Render nothing (Header will appear once LayoutProvider receives data)
    return null;
  }

  const headerLogo = layoutData?.header_logo;
  const headerCtaLink = layoutData?.header_cta_link;
  const headerCtaLabel = layoutData?.header_cta_label ?? "";

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
            {headerLogo?.url ? (
              <Image
                src={headerLogo.url}
                alt={headerLogo.alt || "Lunim Logo"}
                width={160}
                height={48}
                className="h-12 w-auto"
                priority
              />
            ) : (
              <Image
                src={logoFallback}
                alt="Lunim Logo"
                width={160}
                height={48}
                className="h-12 w-auto"
                priority
              />
            )}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex relative" ref={navRef}>
            <div className="flex space-x-1">
              {menuItems.map((item, index) => {
                const field = item.link_object;
                const label = item.link_label ?? "";
                const href = asLink(field) || undefined;
                const active = isActive(href);
                return (
                  <PrismicNextLink
                    key={index}
                    field={field}
                    onClick={(e) => handleNavClick(e, href)}
                    className={`relative z-10 px-6 py-3 font-medium text-lg transition-all duration-300 ${
                      active
                        ? "text-cyan-300"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    <span className="relative z-10">{label}</span>
                    {active && (
                      <span className="absolute bottom-1 left-1/2 w-4 h-1 bg-cyan-400 rounded-full -translate-x-1/2 animate-pulse" />
                    )}
                    <span className="absolute inset-0 bg-cyan-500/10 rounded-full scale-90 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  </PrismicNextLink>
                );
              })}
            </div>
          </nav>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center">
            {headerCtaLink ? (
              <PrismicNextLink
                field={headerCtaLink}
                onClick={(e) =>
                  handleNavClick(e, asLink(headerCtaLink) || "#contact")
                }
                className="hidden md:block relative overflow-hidden group px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all duration-500 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/40"
              >
                <span className="relative z-10 font-bold text-black">
                  {headerCtaLabel}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -skew-x-12" />
              </PrismicNextLink>
            ) : null}

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
        {headerCtaLink ? (
          <PrismicNextLink
            field={headerCtaLink}
            className="w-full max-w-xs mb-8 text-center px-6 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-black"
            onClick={() => setIsMenuOpen(false)}
          >
            {headerCtaLabel}
          </PrismicNextLink>
        ) : null}

        <div className="w-full max-w-xs space-y-2 relative z-10">
          {menuItems.map((item, index) => {
            const href = asLink(item.link_object) || undefined;
            return (
              <PrismicNextLink
                key={index}
                field={item.link_object}
                className="block px-6 py-5 text-xl text-white/90 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10"
                onClick={(e) =>
                  handleNavClick(e, href, () => setIsMenuOpen(false))
                }
              >
                <div className="flex items-center">
                  <span>{item.link_label}</span>
                </div>
              </PrismicNextLink>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Header;
