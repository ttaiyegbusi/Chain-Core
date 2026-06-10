"use client";

import {
  Home,
  Layers,
  Info,
  Contact,
  CreditCard,
  FileText,
  Euro,
  Settings,
  PanelLeftClose,
} from "lucide-react";
import { useMemo, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Logo from "./Logo";

/* ─── Layout constants ────────────────────────────────────────────────────── */
const COLLAPSED_W = 72;
const EXPANDED_W  = 280;

/**
 * SECTION_H and ITEM_H are identical in both expanded and collapsed states.
 * Section headers swap their content (text ↔ line) but never change height.
 * This means every item's Y position is a static constant — the indicator
 * never needs to recalculate or move when the rail is toggled.
 */
const SECTION_H   = 28;
const ITEM_H      = 48;
const NAV_PAD_TOP = 6;

const EASE_OUT   = "cubic-bezier(0.3, 0.8, 0.4, 1)";
const EASE_INOUT = "cubic-bezier(0.4, 0, 0.2, 1)";

/* ─── Nav structure ───────────────────────────────────────────────────────── */
interface NavItem {
  key: string;
  label: string;
  icon: React.ElementType;
  href: string;
  match?: (path: string) => boolean;
}

interface NavSection {
  key: string;
  label: string;
  /** Show a divider line in collapsed state. False for the first section. */
  showDivider: boolean;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    key: "menu",
    label: "Menu",
    showDivider: false,
    items: [
      { key: "dashboard",    label: "Dashboard",    icon: Home,   href: "/" },
      { key: "transactions", label: "Transactions", icon: Layers, href: "/transactions" },
      { key: "task",         label: "Task",         icon: Info,   href: "/task" },
    ],
  },
  {
    key: "functions",
    label: "Functions",
    showDivider: true,
    items: [
      {
        key: "clients",
        label: "Clients",
        icon: Contact,
        href: "/clients/individual",
        match: (p) => p.startsWith("/clients"),
      },
      { key: "accounts",   label: "Accounts",   icon: CreditCard, href: "/accounts" },
      { key: "reports",    label: "Reports",    icon: FileText,   href: "/reports" },
      {
        key: "accounting",
        label: "Accounting",
        icon: Euro,
        href: "/accounting/charts-of-account",
        match: (p) => p.startsWith("/accounting"),
      },
      {
        key: "administration",
        label: "Administration",
        icon: Settings,
        href: "/organization/structure",
        match: (p) => p.startsWith("/organization"),
      },
    ],
  },
  {
    key: "settings",
    label: "Settings",
    showDivider: true,
    items: [
      { key: "settings-reports", label: "Reports",        icon: FileText, href: "/settings/reports" },
      { key: "settings-admin",   label: "Administration", icon: Settings, href: "/settings/administration" },
    ],
  },
];

/* ─── Pre-computed Y positions (static — same in both rail states) ────────── */
const ITEM_TOP: Record<string, number> = (() => {
  const map: Record<string, number> = {};
  let y = NAV_PAD_TOP;
  SECTIONS.forEach((section) => {
    y += SECTION_H;
    section.items.forEach((item) => {
      map[item.key] = y;
      y += ITEM_H;
    });
  });
  return map;
})();

function findActiveKey(pathname: string): string {
  for (const section of SECTIONS) {
    for (const item of section.items) {
      if (item.match ? item.match(pathname) : item.href === pathname) {
        return item.key;
      }
    }
  }
  return "dashboard";
}

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function PrimaryRail() {
  const pathname  = usePathname() || "/";
  const [expanded, setExpanded] = useState(false);
  /**
   * hydrated: false on SSR/first render, true after useLayoutEffect runs.
   * While false, width transition is suppressed so restoring the saved
   * rail state from localStorage is instant with no animation.
   */
  const [hydrated, setHydrated] = useState(false);

  const width     = expanded ? EXPANDED_W : COLLAPSED_W;
  const activeKey = useMemo(() => findActiveKey(pathname), [pathname]);

  /**
   * useLayoutEffect runs synchronously after DOM mutations, before the
   * browser paints. Combined with the inline <script> in layout.tsx that
   * sets --rail-width from localStorage, this means:
   * - The CSS variable is correct before first paint (no layout flash)
   * - The React state matches on the very first painted frame
   * - Width transition is suppressed for this initial restore only
   */
  useLayoutEffect(() => {
    const saved = localStorage.getItem("chaincore-primary-nav-expanded") === "true";
    setExpanded(saved);
    document.documentElement.style.setProperty(
      "--rail-width",
      `${saved ? EXPANDED_W : COLLAPSED_W}px`,
    );
    setHydrated(true);
  }, []);

  // Keep CSS variable in sync on every toggle
  useLayoutEffect(() => {
    if (!hydrated) return;
    document.documentElement.style.setProperty("--rail-width", `${width}px`);
    localStorage.setItem("chaincore-primary-nav-expanded", String(expanded));
  }, [expanded, width, hydrated]);

  const indicatorTop = ITEM_TOP[activeKey] ?? NAV_PAD_TOP;

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 flex shrink-0 flex-col border-r border-border bg-white"
      style={{
        width,
        minWidth: width,
        maxWidth: width,
        // Suppress transition until hydrated so the localStorage restore is instant
        transition: hydrated ? `width 450ms ${EASE_OUT}` : "none",
      }}
      aria-label="Primary navigation"
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="relative flex h-[72px] shrink-0 items-center gap-3 px-4">
        {/* Logo — clicks to expand when collapsed */}
        <button
          type="button"
          aria-label={expanded ? "ChainCore" : "Expand navigation"}
          onClick={() => !expanded && setExpanded(true)}
          className="focus-ring flex h-10 w-10 shrink-0 items-center justify-center"
        >
          <Logo size={40} />
        </button>

        {/* Brand name */}
        <span
          aria-hidden
          className="truncate text-sm font-normal text-primary"
          style={{
            opacity:       expanded ? 1 : 0,
            maxWidth:      expanded ? "150px" : "0px",
            overflow:      "hidden",
            whiteSpace:    "nowrap",
            pointerEvents: "none",
            transition:    `opacity ${expanded ? "200ms 160ms" : "100ms 0ms"}, max-width 450ms ${EASE_OUT}`,
          }}
        >
          ChainCore
        </span>

        {/* Collapse button */}
        <button
          type="button"
          aria-label="Collapse navigation"
          onClick={() => setExpanded(false)}
          className="focus-ring absolute right-3 flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-muted hover:text-text-primary"
          style={{
            opacity:       expanded ? 1 : 0,
            pointerEvents: expanded ? "auto" : "none",
            transition:    `opacity ${expanded ? "200ms 220ms" : "100ms 0ms"}`,
          }}
        >
          <PanelLeftClose size={18} strokeWidth={1.9} aria-hidden />
        </button>
      </div>

      {/* Divider under header */}
      <div className="mx-3 h-px shrink-0 bg-border" />

      {/* ── Nav body ────────────────────────────────────────────────────── */}
      {/*
        No overflow:hidden here — text labels control their own overflow
        via maxWidth+overflow on the span. Removing it from the nav allows
        the collapsed-state tooltips to render outside the rail boundary.
      */}
      <nav
        className="relative flex-1"
        style={{ paddingTop: NAV_PAD_TOP }}
        aria-label="Main navigation"
      >
        {/* Sliding indicator */}
        <span
          aria-hidden
          className="pointer-events-none absolute z-0 bg-primary"
          style={{
            top:          indicatorTop,
            height:       ITEM_H,
            left:         "10px",
            right:        "10px",
            borderRadius: expanded ? "14px" : "18px",
            transition:   `top 380ms ${EASE_INOUT}, border-radius 450ms ${EASE_OUT}`,
          }}
        />

        {/* Sections */}
        {SECTIONS.map((section) => (
          <div key={section.key}>
            {/* Section header — fixed SECTION_H height in both states */}
            <div
              className="relative"
              style={{ height: SECTION_H, padding: "0 10px" }}
            >
              {/* Label: visible when expanded */}
              <span
                className="absolute inset-y-0 left-3 flex items-center text-[10px] font-normal uppercase tracking-widest text-text-secondary"
                style={{
                  opacity:       expanded ? 1 : 0,
                  pointerEvents: "none",
                  whiteSpace:    "nowrap",
                  transition:    `opacity ${expanded ? "160ms 130ms" : "100ms 0ms"}`,
                }}
              >
                {section.label}
              </span>

              {/* Divider line: visible when collapsed, not for first section */}
              {section.showDivider && (
                <div
                  className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border"
                  style={{
                    opacity:    expanded ? 0 : 1,
                    transition: `opacity ${expanded ? "100ms 0ms" : "160ms 130ms"}`,
                  }}
                />
              )}
            </div>

            {/* Nav items */}
            {section.items.map((item) => {
              const active = item.match
                ? item.match(pathname)
                : item.href === pathname;
              const Icon = item.icon;

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                  prefetch
                  className="focus-ring group relative z-10 flex items-center"
                  style={{
                    height:         ITEM_H,
                    margin:         "0 10px",
                    padding:        expanded ? "0 10px" : "0",
                    justifyContent: expanded ? "flex-start" : "center",
                    gap:            expanded ? "12px" : "0",
                    borderRadius:   expanded ? "14px" : "18px",
                    transition:     [
                      `padding 450ms ${EASE_OUT}`,
                      `gap 450ms ${EASE_OUT}`,
                      `border-radius 450ms ${EASE_OUT}`,
                    ].join(", "),
                  }}
                >
                  <Icon
                    size={20}
                    strokeWidth={1.8}
                    aria-hidden
                    className={`shrink-0 transition-colors duration-200 ${
                      active
                        ? "text-white"
                        : "text-text-secondary group-hover:text-text-primary"
                    }`}
                  />

                  {/* Label */}
                  <span
                    className={`truncate text-sm font-normal transition-colors duration-200 ${
                      active
                        ? "text-white"
                        : "text-text-secondary group-hover:text-text-primary"
                    }`}
                    style={{
                      opacity:    expanded ? 1 : 0,
                      maxWidth:   expanded ? "160px" : "0px",
                      overflow:   "hidden",
                      whiteSpace: "nowrap",
                      transition: `opacity ${expanded ? "200ms 100ms" : "100ms 0ms"}, max-width 450ms ${EASE_OUT}`,
                    }}
                  >
                    {item.label}
                  </span>

                  {/* Tooltip — shown on hover when collapsed */}
                  <span
                    className="pointer-events-none absolute left-[58px] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-normal text-text-primary opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100"
                    style={{
                      // Only render/interact with tooltip when collapsed
                      visibility: expanded ? "hidden" : "visible",
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
