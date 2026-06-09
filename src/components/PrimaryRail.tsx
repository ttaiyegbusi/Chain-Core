"use client";

import { Home, Layers, Contact, Euro, Network, PanelLeftClose } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Logo from "./Logo";

interface RailIcon {
  key: string;
  label: string;
  icon: React.ElementType;
  href: string;
  match?: (path: string) => boolean;
}

const COLLAPSED_WIDTH = 72;
const EXPANDED_WIDTH = 280;

// Consistent sizing: icons stay same size in both states
const ITEM_HEIGHT = 52;
const ITEM_GAP = 8;
const ITEM_STEP = ITEM_HEIGHT + ITEM_GAP;

// Premium easing: smooth, no overshoot
const EASE_OUT = "cubic-bezier(0.3, 0.8, 0.4, 1)";
const EASE_INOUT = "cubic-bezier(0.4, 0, 0.2, 1)";

const ICONS: RailIcon[] = [
  { key: "home", label: "Dashboard", icon: Home, href: "/" },
  {
    key: "organization",
    label: "Organization",
    icon: Network,
    href: "/organization/structure",
    match: (p) => p.startsWith("/organization"),
  },
  {
    key: "products",
    label: "Products",
    icon: Layers,
    href: "/products",
    match: (p) => p.startsWith("/products"),
  },
  {
    key: "clients",
    label: "Clients",
    icon: Contact,
    href: "/clients/individual",
    match: (p) => p.startsWith("/clients"),
  },
  {
    key: "accounting",
    label: "Accounting",
    icon: Euro,
    href: "/accounting/charts-of-account",
    match: (p) => p.startsWith("/accounting"),
  },
];

export default function PrimaryRail() {
  const pathname = usePathname() || "/";
  const [expanded, setExpanded] = useState(false);
  const width = expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  const activeIndex = useMemo(() => {
    const index = ICONS.findIndex((item) => (item.match ? item.match(pathname) : item.href === pathname));
    return index >= 0 ? index : 0;
  }, [pathname]);

  useEffect(() => {
    const saved = window.localStorage.getItem("chaincore-primary-nav-expanded");
    const shouldExpand = saved === "true";
    setExpanded(shouldExpand);
    document.documentElement.style.setProperty(
      "--rail-width",
      `${shouldExpand ? EXPANDED_WIDTH : COLLAPSED_WIDTH}px`,
    );
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--rail-width", `${width}px`);
    window.localStorage.setItem("chaincore-primary-nav-expanded", String(expanded));
  }, [expanded, width]);

  // Indicator position: consistent step size regardless of state
  const indicatorY = activeIndex * ITEM_STEP;
  const indicatorWidth = expanded ? "calc(100% - 24px)" : "52px";
  const indicatorRadius = expanded ? "14px" : "18px";
  const indicatorLeft = expanded ? "12px" : "10px";

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
      data-expanded={expanded ? "true" : "false"}
    >
      {/* Header: Logo + Brand */}
      <div className="relative flex h-[88px] w-full items-center justify-center">
        <button
          type="button"
          aria-label={expanded ? "ChainCore" : "Expand navigation"}
          onClick={() => !expanded && setExpanded(true)}
          className={[
            "focus-ring flex min-w-0 items-center rounded-2xl text-left transition-colors duration-300",
            expanded ? "h-12 w-[calc(100%-32px)] justify-start gap-3 px-2 hover:bg-surface-muted" : "h-12 w-12 justify-center p-0",
          ].join(" ")}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center">
            <Logo size={40} />
          </span>
          {expanded ? (
            <span
              className="min-w-0 truncate text-sm font-semibold text-primary transition-opacity duration-300"
              style={{ opacity: expanded ? 1 : 0 }}
            >
              ChainCore
            </span>
          ) : null}
        </button>

        {expanded ? (
          <button
            type="button"
            aria-label="Collapse navigation"
            onClick={() => setExpanded(false)}
            className="focus-ring absolute right-3 top-7 flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors duration-300 hover:bg-surface-muted hover:text-text-primary"
          >
            <PanelLeftClose size={18} strokeWidth={1.9} aria-hidden />
          </button>
        ) : null}
      </div>

      {/* Navigation Items */}
      <nav
        className={[
          "relative flex flex-1 flex-col",
          expanded ? "gap-2 px-3 pt-2" : "items-center gap-2 px-0 pt-2",
        ].join(" ")}
      >
        {/* Active Indicator: Smooth, consistent */}
        <span
          aria-hidden
          className="pointer-events-none absolute z-0 bg-primary"
          style={{
            left: indicatorLeft,
            top: `${8 + indicatorY}px`,
            width: indicatorWidth,
            height: ITEM_HEIGHT,
            borderRadius: indicatorRadius,
            transition: `all 400ms ${EASE_INOUT}`,
          }}
        />

        {/* Navigation Links */}
        {ICONS.map((item) => {
          const active = item.match ? item.match(pathname) : item.href === pathname;
          const Icon = item.icon;

          return (
            <Link
              key={item.key}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              prefetch
              className={[
                "focus-ring group relative z-10 flex transition-colors duration-300",
                expanded
                  ? "h-[52px] w-full rounded-[14px]"
                  : "h-[52px] w-[52px] items-center justify-center rounded-[18px]",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-full min-w-0 items-center rounded-[inherit] transition-colors duration-300",
                  expanded ? "w-full justify-start gap-3 px-3" : "w-full justify-center",
                  active ? "text-white" : "text-text-secondary group-hover:text-text-primary",
                ].join(" ")}
              >
                {/* Icon: Consistent size */}
                <Icon
                  size={21}
                  strokeWidth={1.9}
                  aria-hidden
                  className="shrink-0 transition-colors duration-300"
                />
                
                {/* Label: Smooth fade */}
                {expanded ? (
                  <span
                    className="min-w-0 truncate text-sm font-medium transition-opacity duration-300"
                    style={{ opacity: expanded ? 1 : 0 }}
                  >
                    {item.label}
                  </span>
                ) : null}
              </span>

              {/* Tooltip: Appears on hover when collapsed */}
              {!expanded ? (
                <span className="pointer-events-none absolute left-[62px] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-text-primary opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100">
                  {item.label}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
