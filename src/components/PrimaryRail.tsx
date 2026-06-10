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
import { useMemo, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Logo from "./Logo";

/* ─── Layout constants ────────────────────────────────────────────────────── */
const COLLAPSED_W = 72;
const EXPANDED_W  = 280;

/**
 * SECTION_H and ITEM_H are IDENTICAL in both expanded and collapsed states.
 * Section headers swap their content (text ↔ line) but keep the same height.
 * This means every item's Y position is the same regardless of rail state —
 * so the indicator never jumps or needs to re-calculate on toggle.
 */
const SECTION_H   = 28;   // section header row height (both states)
const ITEM_H      = 48;   // nav item height (both states)
const NAV_PAD_TOP = 6;    // top padding in nav body

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
  /** Show a divider line in collapsed state (false for first section) */
  showDivider: boolean;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    key: "menu",
    label: "Menu",
    showDivider: false, // no line before first group in collapsed
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
      { key: "accounts",       label: "Accounts",       icon: CreditCard, href: "/accounts" },
      { key: "reports",        label: "Reports",        icon: FileText,   href: "/reports" },
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

/* ─── Pre-compute item Y positions ───────────────────────────────────────── */
/**
 * Since SECTION_H and ITEM_H are fixed and equal in both rail states,
 * these Y offsets are static constants — no DOM measurement needed,
 * no recalculation on toggle, no risk of layout shift.
 */
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

/* ─── Helper ──────────────────────────────────────────────────────────────── */
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
  const width     = expanded ? EXPANDED_W : COLLAPSED_W;
  const activeKey = useMemo(() => findActiveKey(pathname), [pathname]);

  // Restore persisted state and sync CSS variable
  useEffect(() => {
    const saved  = localStorage.getItem("chaincore-primary-nav-expanded");
    const should = saved === "true";
    setExpanded(should);
    document.documentElement.style.setProperty(
      "--rail-width",
      `${should ? EXPANDED_W : COLLAPSED_W}px`,
    );
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--rail-width", `${width}px`);
    localStorage.setItem("chaincore-primary-nav-expanded", String(expanded));
  }, [expanded, width]);

  const indicatorTop = ITEM_TOP[activeKey] ?? NAV_PAD_TOP;

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 flex shrink-0 flex-col border-r border-border bg-white"
      style={{
        width,
        minWidth: width,
        maxWidth: width,
        transition: `width 450ms ${EASE_OUT}`,
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

        {/* Brand name — fades in when expanded */}
        <span
          aria-hidden
          className="truncate text-sm font-semibold text-primary"
          style={{
            opacity:     expanded ? 1 : 0,
            maxWidth:    expanded ? "150px" : "0px",
            overflow:    "hidden",
            whiteSpace:  "nowrap",
            pointerEvents: "none",
            transition:  `opacity ${expanded ? "200ms 160ms" : "100ms 0ms"}, max-width 450ms ${EASE_OUT}`,
          }}
        >
          ChainCore
        </span>

        {/* Collapse button — fades in when expanded */}
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

      {/* ── Nav Body ────────────────────────────────────────────────────── */}
      <nav
        className="relative flex-1 overflow-hidden"
        style={{ paddingTop: NAV_PAD_TOP }}
        aria-label="Main navigation"
      >
        {/*
          Sliding indicator.
          - top is pre-computed from the static ITEM_TOP map
          - position is IDENTICAL in both expanded and collapsed states
            because SECTION_H and ITEM_H never change
          - Only border-radius animates with the rail width
        */}
        <span
          aria-hidden
          className="pointer-events-none absolute z-0 bg-primary"
          style={{
            top:          indicatorTop,
            height:       ITEM_H,
            left:         "10px",
            right:        "10px",
            borderRadius: expanded ? "14px" : "18px",
            transition:   `top 400ms ${EASE_INOUT}, border-radius 450ms ${EASE_OUT}`,
          }}
        />

        {/* Sections */}
        {SECTIONS.map((section) => (
          <div key={section.key}>
            {/*
              Section header row.
              Always SECTION_H (28px) tall — no height change between states.
              Content swaps: text (expanded) ↔ divider line (collapsed).
              First section (Menu) has showDivider: false so it shows
              empty space in collapsed mode, matching the design.
            */}
            <div
              className="relative"
              style={{ height: SECTION_H, padding: "0 10px" }}
            >
              {/* Label — visible when expanded */}
              <span
                className="absolute inset-y-0 left-3 flex items-center text-[10px] font-medium uppercase tracking-widest text-text-secondary"
                style={{
                  opacity:       expanded ? 1 : 0,
                  pointerEvents: "none",
                  whiteSpace:    "nowrap",
                  transition:    `opacity ${expanded ? "160ms 130ms" : "100ms 0ms"}`,
                }}
              >
                {section.label}
              </span>

              {/* Divider line — visible when collapsed, only for Functions & Settings */}
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
                    strokeWidth={1.9}
                    aria-hidden
                    className={`shrink-0 transition-colors duration-200 ${
                      active
                        ? "text-white"
                        : "text-text-secondary group-hover:text-text-primary"
                    }`}
                  />

                  {/* Label — fades in when expanded */}
                  <span
                    className={`truncate text-sm font-medium transition-colors duration-200 ${
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

                  {/* Tooltip — only rendered in collapsed state */}
                  {!expanded && (
                    <span className="pointer-events-none absolute left-[58px] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-text-primary opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
