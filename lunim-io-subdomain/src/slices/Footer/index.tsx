"use client";

import { FC, useEffect, useState } from "react";
import { PrismicNextLink } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import { Mail, Phone, MapPin, ArrowUp, ExternalLink } from "lucide-react";
import { SliceComponentProps } from "@prismicio/react";
import { Content } from "@prismicio/client";
import Link from "next/link";

type Bubble = {
  id: number;
  size: number;
  duration: number;
  delay: number;
  x: number;
};

const genBubbles = (n: number): Bubble[] =>
  Array.from({ length: n }, (_, i) => ({
    id: i,
    size: Math.random() * 40 + 10,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 5,
    x: Math.random() * 100,
  }));

export type FooterProps = SliceComponentProps<Content.FooterSlice>;

const Footer: FC<FooterProps> = ({ slice }) => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const {
    company_name,
    tagline,
    contact_information_title,
    company_email,
    company_phone_number,
    company_address,
    copyright_text,
    privacy_policy,
    back_to_top_text,
  } = slice.primary;

  useEffect(() => {
    setBubbles(genBubbles(15));
  }, []);

  return (
    <footer
      className="relative overflow-hidden pt-16 pb-8"
      style={{ backgroundColor: "var(--bg-dark)", color: "var(--text-body)" }}
    >
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-0 w-full h-1/3"
          style={{ background: "linear-gradient(to bottom, var(--primary)/5, transparent)" }}
        ></div>
        <div
          className="absolute bottom-0 right-0 w-1/2 h-1/2"
          style={{ background: "linear-gradient(to top, var(--secondary)/5, transparent)" }}
        ></div>
        {bubbles.map((b) => (
          <div
            key={b.id}
            className="absolute rounded-full animate-float"
            style={{
              width: `${b.size}px`,
              height: `${b.size}px`,
              left: `${b.x}%`,
              animationDuration: `${b.duration}s`,
              animationDelay: `${b.delay}s`,
              bottom: "-30px",
              background: "linear-gradient(to bottom right, var(--primary)/10, var(--secondary)/5)",
            }}
          />
        ))}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(rgba(6,182,212,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.1) 1px,transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">
          {/* Company info */}
          <div className="lg:col-span-1">
            <div
              className="text-2xl font-bold mb-4 bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(to right, var(--primary), var(--secondary))" }}
            >
              <PrismicRichText field={company_name} />
            </div>
            <div className="mb-6 max-w-xs" style={{ color: "var(--text-body)" }}>
              {tagline}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <div
              className="text-lg font-semibold mb-4"
              style={{ color: "var(--primary)" }}
            >
              <PrismicRichText field={contact_information_title} />
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <Mail className="w-5 h-5 mt-1 mr-3 flex-shrink-0" style={{ color: "var(--primary)" }} />
                <Link
                  href={`mailto:${company_email}`}
                  className="hover:underline"
                  style={{ color: "var(--text-body)" }}
                >
                  {company_email}
                </Link>
              </div>
              <div className="flex items-start">
                <Phone className="w-5 h-5 mt-1 mr-3 flex-shrink-0" style={{ color: "var(--primary)" }} />
                <Link
                  href={`tel:${company_phone_number}`}
                  className="hover:underline"
                  style={{ color: "var(--text-body)" }}
                >
                  {company_phone_number}
                </Link>
              </div>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 mt-1 mr-3 flex-shrink-0" style={{ color: "var(--primary)" }} />
                <span style={{ color: "var(--text-body)" }}>{company_address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center" style={{ borderColor: "var(--bg-mid)" }}>
          <div className="text-sm mb-4 md:mb-0" style={{ color: "var(--text-body)" }}>
            &copy; {new Date().getFullYear()} {copyright_text}
          </div>
          <div className="flex items-center space-x-6">
            <PrismicNextLink
              field={privacy_policy}
              className="text-sm flex items-center no-underline"
              style={{ color: "var(--text-body)" }}
            >
              {privacy_policy.text} <ExternalLink className="w-3 h-3 ml-1" />
            </PrismicNextLink>
            <button
              onClick={scrollToTop}
              className="flex items-center group"
              aria-label="Scroll to top"
              style={{ color: "var(--text-body)", cursor: "pointer" }}
            >
              {back_to_top_text || "Back to top"}
              <ArrowUp className="w-4 h-4 ml-2 group-hover:animate-bounce" style={{ color: "var(--primary)" }} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.7; }
          50% { transform: translateY(-20px) rotate(10deg); opacity: 0.9; }
        }
        .animate-float { animation: float 15s ease-in-out infinite; }
      `}</style>
    </footer>
  );
};

export default Footer;
