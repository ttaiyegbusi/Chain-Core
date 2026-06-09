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
  const itemStep = expanded ? 52 : 58;

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

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 flex shrink-0 flex-col border-r border-border bg-white overflow-visible transition-[width] duration-200 ease-out"
      style={{ width, minWidth: width, maxWidth: width }}
      aria-label="Primary navigation"
      data-expanded={expanded ? "true" : "false"}
    >
      <div className="flex h-[72px] w-full items-center justify-center px-0">
        <button
          type="button"
          aria-label={expanded ? "ChainCore" : "Expand navigation"}
          onClick={() => !expanded && setExpanded(true)}
          className={[
            "focus-ring flex h-11 min-w-0 items-center rounded-xl text-left",
            expanded ? "w-[calc(100%-32px)] justify-start gap-3 px-2" : "w-11 justify-center p-0",
          ].join(" ")}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center">
            <Logo size={36} />
          </span>
          {expanded ? (
            <span className="min-w-0 truncate text-sm font-semibold text-primary">ChainCore</span>
          ) : null}
        </button>

        {expanded ? (
          <button
            type="button"
            aria-label="Collapse navigation"
            onClick={() => setExpanded(false)}
            className="focus-ring absolute right-3 top-5 flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
          >
            <PanelLeftClose size={18} strokeWidth={1.9} aria-hidden />
          </button>
        ) : null}
      </div>

      <nav className={["relative flex flex-1 flex-col gap-2 py-3", expanded ? "px-3" : "items-center px-0"].join(" ")}>
        <span
          aria-hidden
          className={[
            "pointer-events-none absolute z-0 bg-primary will-change-transform",
            "transition-[transform,width,height,border-radius] duration-300",
            "ease-[cubic-bezier(0.22,1,0.36,1)]",
            expanded ? "left-3 top-3 h-11 w-[calc(100%-24px)] rounded-[14px]" : "left-1/2 top-3 h-[52px] w-[52px] -translate-x-1/2 rounded-[20px]",
          ].join(" ")}
          style={{
            transform: expanded
              ? `translate3d(0, ${activeIndex * itemStep}px, 0)`
              : `translate3d(-50%, ${activeIndex * itemStep}px, 0)`,
          }}
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
              className={[
                "focus-ring group relative z-10 flex rounded-[14px] no-underline",
                expanded ? "h-11 w-full" : "h-[52px] w-[52px] items-center justify-center",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-full min-w-0 items-center rounded-[14px] transition-colors duration-200 ease-out",
                  expanded ? "w-full justify-start gap-3 px-3" : "w-[52px] justify-center p-0",
                  active ? "text-white" : "text-text-secondary hover:bg-surface-muted hover:text-text-primary",
                ].join(" ")}
              >
                <Icon
                  size={20}
                  strokeWidth={1.9}
                  aria-hidden
                  className={[
                    "shrink-0 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    active ? "scale-[1.04]" : "scale-100",
                  ].join(" ")}
                />
                {expanded ? <span className="min-w-0 truncate text-sm font-medium transition-opacity duration-200">{item.label}</span> : null}
              </span>

              {!expanded ? (
                <span className="pointer-events-none absolute left-[56px] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-text-primary opacity-0 shadow-sm transition-opacity duration-100 group-hover:opacity-100">
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
