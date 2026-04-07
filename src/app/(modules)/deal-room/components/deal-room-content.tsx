"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import RequestAccessButton from "./request-access-button";

interface VaultDocument {
  id: number;
  name: string;
  extension: string;
  url?: string;
  expiresAt?: string;
}

interface VaultCategory {
  id: number;
  label: string;
  position: number;
  accessible: boolean;
  requiredTier: string | null;
  documents: VaultDocument[];
}

interface VaultFilesResponse {
  success: boolean;
  data: {
    userTier: string | null;
    categories: VaultCategory[];
  };
}

function getFileIcon(ext: string): string {
  const map: Record<string, string> = {
    pdf: "📄", doc: "📝", docx: "📝",
    xls: "📊", xlsx: "📊", csv: "📊",
    ppt: "📊", pptx: "📊",
    png: "🖼", jpg: "🖼", jpeg: "🖼",
    mp4: "🎬", zip: "📦",
  };
  return map[ext?.toLowerCase()] ?? "📎";
}

function slugify(label: string): string {
  return label.toLowerCase().replace(/[^\w\s]/gi, "").replace(/\s+/g, "-");
}

function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

export default function DealRoomContent({
  hasAccess,
  hasRequestedAccess,
  backendUrl,
}: {
  hasAccess: boolean;
  hasRequestedAccess: boolean;
  backendUrl: string;
}) {
  const [categories, setCategories] = useState<VaultCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tocOpen, setTocOpen] = useState(true);
  const activeItemRef = useRef<HTMLLIElement>(null);
  const isMobile = useIsMobile();
  const { data: session, status } = useSession();

  // ── Fetch vault files ───────────────────────────────────────────────────────
  useEffect(() => {
    const token = (session?.user as any)?.token;
    if (status !== "authenticated" || !token) return;

    async function fetchVaultFiles() {
      try {
        const res = await fetch(`${backendUrl}/api/documents/vault-files`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const text = await res.text();
          setError(text || "Failed to load documents.");
          return;
        }

        const json: VaultFilesResponse = await res.json();
        setCategories(json?.data?.categories ?? []);
      } catch {
        setError("Failed to load documents.");
      } finally {
        setLoading(false);
      }
    }

    fetchVaultFiles();
  }, [status, session, backendUrl]);

  // ── TOC active section tracking ─────────────────────────────────────────────
  useEffect(() => {
    if (!categories.length) return;

    const headings = categories
      .map((c) => document.getElementById(slugify(c.label)))
      .filter(Boolean) as HTMLElement[];

    if (!headings.length) return;

    let lastId: string | null = null;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting && e.boundingClientRect.top >= 0)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length && visible[0].target.id !== lastId) {
          lastId = visible[0].target.id;
          setActiveId(lastId);
        }
      },
      { rootMargin: "0px 0px -80% 0px", threshold: [0, 1] }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [categories]);

  useEffect(() => {
    if (activeId && activeItemRef.current && !isMobile) {
      activeItemRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeId, isMobile]);

  // ── States ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="dr-spinner inline-block w-7 h-7 border-2 rounded-full animate-spin" />
        <p className="mt-3 text-sm dr-text-muted">Loading deal room…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (!categories.length) {
    return (
      <div className="py-16 text-center">
        <p className="dr-text-muted text-sm">Documents are being prepared. Please check back soon.</p>
      </div>
    );
  }

  const hasRestricted = categories.some((c) => !c.accessible);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 mt-8">

      {/* ── Left — TOC ─────────────────────────────────────────────────────── */}
      <aside>
        <div className="sticky top-24">
          <div className="dr-card rounded-lg p-5 border dr-border">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold uppercase tracking-wide dr-text-muted">
                Categories
              </span>
              <button
                aria-label="Toggle category list"
                onClick={() => setTocOpen(!tocOpen)}
                className="lg:hidden p-1 dr-text-muted"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${tocOpen ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <nav className={`overflow-hidden transition-all duration-300 ${tocOpen ? "max-h-[2000px]" : "max-h-0 lg:max-h-[2000px]"}`}>
              <ul className="space-y-1 list-none p-0 m-0">
                {categories.map((cat) => {
                  const id = slugify(cat.label);
                  const isActive = activeId === id;

                  if (!cat.accessible) {
                    return (
                      <li
                        key={cat.id}
                        className="flex items-center gap-1.5 px-2 py-1 text-sm dr-text-disabled cursor-not-allowed select-none"
                        title={cat.requiredTier ? `Requires ${cat.requiredTier} tier` : "Restricted"}
                      >
                        <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        {cat.label}
                      </li>
                    );
                  }

                  return (
                    <li
                      key={cat.id}
                      ref={isActive ? activeItemRef : null}
                      className={`text-sm px-2 py-1 rounded transition-colors ${isActive ? "dr-toc-active font-medium" : "dr-text-muted"}`}
                    >
                      <a
                        href={`#${id}`}
                        className="no-underline text-inherit block"
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        {cat.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      </aside>

      {/* ── Right — Documents ───────────────────────────────────────────────── */}
      <div>
        {/* Request access banner */}
        {hasRestricted && !hasAccess && (
          <div className="mb-8 dr-card rounded-lg border dr-border p-5">
            {!hasRequestedAccess ? (
              <>
                <p className="text-sm dr-text-muted mb-4">
                  Some categories require elevated access. Request access below and an
                  administrator will review your request.
                </p>
                <RequestAccessButton />
              </>
            ) : (
              <p className="text-sm dr-text-muted text-center">
                Your access request is under review. You will be notified once approved.
              </p>
            )}
          </div>
        )}

        {/* Category sections */}
        {categories.map((cat) => {
          const id = slugify(cat.label);
          return (
            <section key={cat.id} className="mb-10">
              <h3
                id={id}
                className={`scroll-mt-28 text-lg font-semibold mb-4 pb-2 border-b dr-border ${!cat.accessible ? "dr-text-disabled" : ""}`}
              >
                {cat.label}
                {!cat.accessible && cat.requiredTier && (
                  <span className="ml-2 text-xs font-normal dr-text-disabled align-middle">
                    — {cat.requiredTier} tier
                  </span>
                )}
              </h3>

              <div className="space-y-2">
                {cat.documents.map((doc) => {
                  const display = `${doc.name}${doc.extension ? `.${doc.extension}` : ""}`;

                  if (!cat.accessible || !doc.url) {
                    return (
                      <div
                        key={doc.id}
                        className="flex items-center gap-3 px-4 py-3 rounded dr-doc-locked cursor-not-allowed select-none"
                      >
                        <span className="text-base leading-none">{getFileIcon(doc.extension)}</span>
                        <span className="text-sm dr-text-disabled">{display}</span>
                        <svg className="w-4 h-4 ml-auto dr-text-disabled flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    );
                  }

                  return (
                    <a
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 rounded dr-doc-row hover:dr-doc-row-hover transition-colors no-underline group"
                    >
                      <span className="text-base leading-none">{getFileIcon(doc.extension)}</span>
                      <span className="text-sm dr-text group-hover:dr-link-text transition-colors">
                        {display}
                      </span>
                      <svg
                        className="w-4 h-4 ml-auto dr-text-muted group-hover:dr-link-text transition-colors flex-shrink-0"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
