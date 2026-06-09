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

const COLLAPSED_ITEM_SIZE = 52;
const COLLAPSED_ITEM_GAP = 20;
const COLLAPSED_STEP = COLLAPSED_ITEM_SIZE + COLLAPSED_ITEM_GAP;

const EXPANDED_ITEM_HEIGHT = 44;
const EXPANDED_ITEM_GAP = 8;
const EXPANDED_STEP = EXPANDED_ITEM_HEIGHT + EXPANDED_ITEM_GAP;

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

  const indicatorTransform = expanded
    ? `translate3d(0, ${activeIndex * EXPANDED_STEP}px, 0)`
    : `translate3d(0, ${activeIndex * COLLAPSED_STEP}px, 0)`;

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 flex shrink-0 flex-col border-r border-border bg-white transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ width, minWidth: width, maxWidth: width }}
      aria-label="Primary navigation"
      data-expanded={expanded ? "true" : "false"}
    >
      <div className="relative flex h-[88px] w-full items-center justify-center">
        <button
          type="button"
          aria-label={expanded ? "ChainCore" : "Expand navigation"}
          onClick={() => !expanded && setExpanded(true)}
          className={[
            "focus-ring flex min-w-0 items-center rounded-2xl text-left transition-colors duration-200",
            expanded ? "h-12 w-[calc(100%-32px)] justify-start gap-3 px-2 hover:bg-surface-muted" : "h-12 w-12 justify-center p-0",
          ].join(" ")}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center">
            <Logo size={40} />
          </span>
          {expanded ? (
            <span className="min-w-0 truncate text-sm font-semibold text-primary opacity-100 transition-opacity duration-200">
              ChainCore
            </span>
          ) : null}
        </button>

        {expanded ? (
          <button
            type="button"
            aria-label="Collapse navigation"
            onClick={() => setExpanded(false)}
            className="focus-ring absolute right-3 top-7 flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors duration-150 hover:bg-surface-muted hover:text-text-primary"
          >
            <PanelLeftClose size={18} strokeWidth={1.9} aria-hidden />
          </button>
        ) : null}
      </div>

      <nav
        className={[
          "relative flex flex-1 flex-col",
          expanded ? "gap-2 px-3 pt-2" : "items-center gap-5 px-0 pt-4",
        ].join(" ")}
      >
        <span
          aria-hidden
          className={[
            "pointer-events-none absolute z-0 bg-primary",
            "transition-transform duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform",
            expanded ? "left-3 top-2 h-11 w-[calc(100%-24px)] rounded-[14px]" : "left-[10px] top-4 h-[52px] w-[52px] rounded-[18px]",
          ].join(" ")}
          style={{ transform: indicatorTransform }}
        />

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
                "focus-ring group relative z-10 flex no-underline",
                expanded
                  ? "h-11 w-full rounded-[14px]"
                  : "h-[52px] w-[52px] items-center justify-center rounded-[18px]",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-full min-w-0 items-center rounded-[inherit] transition-colors duration-200 ease-out",
                  expanded ? "w-full justify-start gap-3 px-3" : "w-full justify-center p-0",
                  active ? "text-white" : "text-text-secondary hover:text-text-primary",
                ].join(" ")}
              >
                <Icon
                  size={21}
                  strokeWidth={1.9}
                  aria-hidden
                  className="shrink-0 transition-colors duration-200 ease-out"
                />
                {expanded ? (
                  <span className="min-w-0 truncate text-sm font-medium opacity-100 transition-[opacity,transform] duration-200 ease-out">
                    {item.label}
                  </span>
                ) : null}
              </span>

              {!expanded ? (
                <span className="pointer-events-none absolute left-[62px] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-text-primary opacity-0 shadow-sm transition-opacity duration-100 group-hover:opacity-100">
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
