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
import { useMemo, useLayoutEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Logo from "./Logo";

/* ─── Layout constants ────────────────────────────────────────────────────── */
const COLLAPSED_W = 72;
const EXPANDED_W = 248;
const SECTION_H = 28;
const ITEM_H = 48;
const NAV_PAD_TOP = 6;
const HEADER_H = 72; // height of the header + 1px divider

const EASE_OUT = "cubic-bezier(0.3, 0.8, 0.4, 1)";
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
  showDivider: boolean;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    key: "menu",
    label: "Menu",
    showDivider: false,
    items: [
      { key: "dashboard", label: "Dashboard", icon: Home, href: "/" },
      { key: "transactions", label: "Transactions", icon: Layers, href: "/transactions" },
      { key: "task", label: "Task", icon: Info, href: "/task" },
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
      { key: "accounts", label: "Accounts", icon: CreditCard, href: "/accounts" },
      { key: "reports", label: "Reports", icon: FileText, href: "/reports" },
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
      { key: "settings-reports", label: "Reports", icon: FileText, href: "/settings/reports" },
      { key: "settings-admin", label: "Administration", icon: Settings, href: "/settings/administration" },
    ],
  },
];

const ALL_ITEMS = SECTIONS.flatMap((s) => s.items);

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

function findActiveKey(pathname: string): string | null {
  for (const section of SECTIONS) {
    for (const item of section.items) {
      if (item.match ? item.match(pathname) : item.href === pathname) {
        return item.key;
      }
    }
  }
  return null;
}

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function PrimaryRail() {
  const pathname = usePathname() || "/";

  /**
   * null = not yet hydrated (SSR / initial client render before useLayoutEffect).
   * This prevents any mismatch between the SSR state and the localStorage state.
   * useLayoutEffect runs synchronously before the browser paints, so the user
   * never sees the null placeholder — they only ever see the correct state.
   */
  const [expanded, setExpanded] = useState<boolean | null>(null);

  /**
   * Tooltip: rendered at aside level with position:fixed so it escapes the
   * overflow:hidden nav body. We track which item is hovered and its
   * viewport Y coordinate from the mouse event.
   */
  const [tooltip, setTooltip] = useState<{ label: string; y: number } | null>(null);

  const activeKey = useMemo(() => findActiveKey(pathname), [pathname]);

  /**
   * When the route matches a nav item, the indicator sits on it. When it does
   * not (e.g. an undeveloped route showing the not-found page), keep the
   * indicator at its LAST position and fade it out — so it never jumps up to a
   * fallback item. lastTopRef remembers where it last was.
   */
  const hasActive = activeKey !== null;
  const lastTopRef = useRef<number>(NAV_PAD_TOP);
  if (hasActive) {
    lastTopRef.current = ITEM_TOP[activeKey as string] ?? NAV_PAD_TOP;
  }

  useLayoutEffect(() => {
    const saved = localStorage.getItem("chaincore-primary-nav-expanded") === "true";
    setExpanded(saved);
    document.documentElement.style.setProperty(
      "--rail-width",
      `${saved ? EXPANDED_W : COLLAPSED_W}px`,
    );
  }, []);

  // Keep CSS variable and localStorage in sync on every toggle
  useLayoutEffect(() => {
    if (expanded === null) return;
    const w = expanded ? EXPANDED_W : COLLAPSED_W;
    document.documentElement.style.setProperty("--rail-width", `${w}px`);
    localStorage.setItem("chaincore-primary-nav-expanded", String(expanded));
    // Clear any stale tooltip when expanding
    if (expanded) setTooltip(null);
  }, [expanded]);

  const width = expanded ? EXPANDED_W : COLLAPSED_W;
  const indicatorTop = lastTopRef.current;

  /**
   * Placeholder: rendered during SSR and the brief pre-paint client tick.
   * Uses the CSS variable width (set by the inline script in layout.tsx)
   * so the page layout is correct even before React hydrates.
   * This is NEVER visually seen — useLayoutEffect replaces it before paint.
   */
  if (expanded === null) {
    return (
      <aside
        className="fixed inset-y-0 left-0 z-40 shrink-0 border-r border-border bg-white"
        style={{ width: "var(--rail-width)" }}
        aria-hidden
      />
    );
  }

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
        <button
          type="button"
          aria-label={expanded ? "ChainCore" : "Expand navigation"}
          onClick={() => !expanded && setExpanded(true)}
          className="focus-ring flex h-10 w-10 shrink-0 items-center justify-center"
        >
          <Logo size={40} />
        </button>

        <span
          aria-hidden
          className="truncate text-sm font-normal text-primary"
          style={{
            opacity: expanded ? 1 : 0,
            maxWidth: expanded ? "150px" : "0px",
            overflow: "hidden",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            transition: `opacity ${expanded ? "200ms 160ms" : "100ms 0ms"}, max-width 450ms ${EASE_OUT}`,
          }}
        >
          ChainCore
        </span>

        <button
          type="button"
          aria-label="Collapse navigation"
          onClick={() => setExpanded(false)}
          className="focus-ring absolute right-3 flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-muted hover:text-text-primary"
          style={{
            opacity: expanded ? 1 : 0,
            pointerEvents: expanded ? "auto" : "none",
            transition: `opacity ${expanded ? "200ms 220ms" : "100ms 0ms"}`,
          }}
        >
          <PanelLeftClose size={18} strokeWidth={1.9} aria-hidden />
        </button>
      </div>

      {/* Divider */}
      <div className="mx-3 h-px shrink-0 bg-border" />

      {/* ── Nav body — overflow:hidden contains text label transitions ───── */}
      <nav
        className="relative flex-1 overflow-hidden"
        style={{ paddingTop: NAV_PAD_TOP }}
        aria-label="Main navigation"
      >
        {/* Sliding indicator */}
        <span
          aria-hidden
          className="pointer-events-none absolute z-0 bg-primary"
          style={{
            top: indicatorTop,
            height: ITEM_H,
            left: "10px",
            right: "10px",
            opacity: hasActive ? 1 : 0,
            borderRadius: expanded ? "14px" : "18px",
            transition: `top 380ms ${EASE_INOUT}, opacity 200ms ${EASE_OUT}, border-radius 450ms ${EASE_OUT}`,
          }}
        />

        {SECTIONS.map((section) => (
          <div key={section.key}>
            {/* Section header — fixed height in both states */}
            <div
              className="relative"
              style={{ height: SECTION_H, padding: "0 10px" }}
            >
              <span
                className="absolute inset-y-0 left-3 flex items-center text-[10px] font-normal uppercase tracking-widest text-text-secondary"
                style={{
                  opacity: expanded ? 1 : 0,
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                  transition: `opacity ${expanded ? "160ms 130ms" : "100ms 0ms"}`,
                }}
              >
                {section.label}
              </span>

              {section.showDivider && (
                <div
                  className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border"
                  style={{
                    opacity: expanded ? 0 : 1,
                    transition: `opacity ${expanded ? "100ms 0ms" : "160ms 130ms"}`,
                  }}
                />
              )}
            </div>

            {/* Nav items — no tooltip here; tooltip is at aside level */}
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
                    height: ITEM_H,
                    margin: "0 10px",
                    padding: expanded ? "0 10px" : "0",
                    justifyContent: expanded ? "flex-start" : "center",
                    gap: expanded ? "12px" : "0",
                    borderRadius: expanded ? "14px" : "18px",
                    transition: [
                      `padding 450ms ${EASE_OUT}`,
                      `gap 450ms ${EASE_OUT}`,
                      `border-radius 450ms ${EASE_OUT}`,
                    ].join(", "),
                  }}
                  onMouseEnter={(e) => {
                    if (!expanded) {
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      setTooltip({ label: item.label, y: rect.top + rect.height / 2 });
                    }
                  }}
                  onMouseLeave={() => setTooltip(null)}
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

                  <span
                    className={`truncate text-sm font-normal transition-colors duration-200 ${
                      active ? "text-white" : "text-text-secondary group-hover:text-text-primary"
                    }`}
                    style={{
                      opacity: expanded ? 1 : 0,
                      maxWidth: expanded ? "160px" : "0px",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      transition: `opacity ${expanded ? "200ms 100ms" : "100ms 0ms"}, max-width 450ms ${EASE_OUT}`,
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

      {/*
        Tooltip rendered HERE at aside level — outside the overflow:hidden nav.
        position:fixed so it's relative to the viewport, not clipped by anything.
        Only visible when collapsed and an item is hovered.
      */}
      {!expanded && tooltip && (
        <span
          className="pointer-events-none fixed z-50 whitespace-nowrap rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-normal text-text-primary "
          style={{
            left: COLLAPSED_W + 8,
            top: tooltip.y,
            transform: "translateY(-50%)",
          }}
        >
          {tooltip.label}
        </span>
      )}
    </aside>
  );
}
