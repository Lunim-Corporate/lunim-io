/**
 * (modules) Route Group Layout
 *
 * Next.js 15: route group layouts must NOT repeat <html>/<body> — the root
 * layout already owns those. This layout only injects the deal-room CSS
 * variables and utility classes via a <style> tag inside a fragment.
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Investor Portal | Lunim",
  description: "Lunim investor deal room — access investor materials and documents.",
};

export default function ModulesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`
        /* ── Deal Room CSS Variables ─────────────────────────────────────────
         * Scoped via .dr-module so they never bleed into lunim's main pages.
         * ─────────────────────────────────────────────────────────────────── */
        .dr-module {
          --dr-accent:           #06b6d4;
          --dr-accent-hover:     #0891b2;
          --dr-accent-fg:        #000000;

          --dr-bg-page:          #0a0a0a;
          --dr-bg-card:          #141414;
          --dr-bg-nav:           rgba(10,10,10,0.88);
          --dr-bg-doc-row:       rgba(255,255,255,0.03);
          --dr-bg-doc-row-hover: rgba(255,255,255,0.07);
          --dr-bg-doc-locked:    rgba(255,255,255,0.015);

          --dr-text:             #f1f5f9;
          --dr-text-muted:       #64748b;
          --dr-text-disabled:    #334155;
          --dr-link-text:        var(--dr-accent);

          --dr-border:           rgba(255,255,255,0.08);

          --dr-success-icon-bg:  rgba(34,197,94,0.15);
          --dr-success-icon-fg:  #22c55e;
          --dr-error-icon-bg:    rgba(239,68,68,0.15);
          --dr-error-icon-fg:    #ef4444;
          --dr-warning-bg:       rgba(234,179,8,0.12);
          --dr-warning-border:   rgba(234,179,8,0.25);
          --dr-warning-fg:       #fde047;

          --dr-padding-top:      5rem;
          --dr-max-width:        1200px;

          --dr-input-bg:         #0d0d0d;
          --dr-input-border:     rgba(255,255,255,0.12);
          --dr-input-text:       var(--dr-text);
          --dr-input-focus:      var(--dr-accent);
        }

        /* ── Utility classes — all scoped under .dr-module ────────────────── */
        .dr-module { display: contents; }

        .dr-module .dr-page-bg        { background-color: var(--dr-bg-page) !important; }
        .dr-module .dr-card           { background-color: var(--dr-bg-card) !important; color: var(--dr-text); }
        .dr-module .dr-border         { border-color: var(--dr-border) !important; }

        .dr-module .dr-text           { color: var(--dr-text); }
        .dr-module .dr-text-muted     { color: var(--dr-text-muted); }
        .dr-module .dr-text-disabled  { color: var(--dr-text-disabled); }
        .dr-module .dr-link           { color: var(--dr-accent); }
        .dr-module .dr-link-text      { color: var(--dr-accent) !important; }

        .dr-module .dr-btn-primary {
          background-color: var(--dr-accent) !important;
          color: var(--dr-accent-fg) !important;
          cursor: pointer;
        }
        .dr-module .dr-btn-primary:hover:not(:disabled) {
          background-color: var(--dr-accent-hover) !important;
        }

        .dr-module .dr-btn-secondary {
          background-color: transparent;
          color: var(--dr-text-muted);
          border: 1px solid var(--dr-border);
          cursor: pointer;
        }
        .dr-module .dr-btn-secondary:hover:not(:disabled) {
          border-color: var(--dr-accent) !important;
          color: var(--dr-accent);
        }

        .dr-module .dr-tab-active   { background-color: var(--dr-accent) !important; color: var(--dr-accent-fg) !important; }
        .dr-module .dr-tab-inactive { background-color: transparent !important; color: var(--dr-text-muted); border: 1px solid var(--dr-border); }
        .dr-module .dr-tab-inactive:hover { border-color: var(--dr-accent); color: var(--dr-accent); }

        .dr-module .dr-input {
          background-color: var(--dr-input-bg) !important;
          border-color: var(--dr-input-border) !important;
          color: var(--dr-input-text) !important;
        }
        .dr-module .dr-input:focus {
          outline: none;
          border-color: var(--dr-input-focus) !important;
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--dr-input-focus) 20%, transparent);
        }

        .dr-module .dr-alert-warning { background-color: var(--dr-warning-bg); border-color: var(--dr-warning-border); color: var(--dr-warning-fg); }

        .dr-module .dr-doc-row        { background-color: var(--dr-bg-doc-row); }
        .dr-module .dr-doc-row-hover  { background-color: var(--dr-bg-doc-row-hover); }
        .dr-module .dr-doc-locked     { background-color: var(--dr-bg-doc-locked); }
        .dr-module .dr-toc-active     { color: var(--dr-accent); }

        .dr-module .dr-spinner {
          border-color: color-mix(in srgb, var(--dr-accent) 20%, transparent);
          border-top-color: var(--dr-accent);
        }
        .dr-module .dr-icon-success { background-color: var(--dr-success-icon-bg); color: var(--dr-success-icon-fg); }
        .dr-module .dr-icon-error   { background-color: var(--dr-error-icon-bg);   color: var(--dr-error-icon-fg); }
        .dr-module .dr-icon-warning { background-color: var(--dr-warning-bg);      color: var(--dr-warning-fg); }

        /* Reset lunim globals.css link underline/colour inside deal-room */
        .dr-module a { color: inherit; text-decoration: none; }
        .dr-module a:hover { text-decoration: none; }
      `}</style>
      <div className="dr-module">
        {children}
      </div>
    </>
  );
}
