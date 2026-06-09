"use client";

import {
  Home,
  Layers,
  Contact,
  Euro,
  Network,
  PanelLeftClose,
} from "lucide-react";
import { useEffect, useState } from "react";
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

const ICONS: RailIcon[] = [
  { key: "home", label: "Dashboard", icon: Home, href: "/" },
  {
    key: "organization",
    label: "Organization",
    icon: Network,
    href: "/organization/structure",
    match: (p) => p.startsWith("/organization"),
  },
  { key: "products", label: "Products", icon: Layers, href: "/products", match: (p) => p.startsWith("/products") },
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

  useEffect(() => {
    const saved = window.localStorage.getItem("chaincore-primary-nav-expanded");
    const shouldExpand = saved === "true";
    setExpanded(shouldExpand);
    document.documentElement.style.setProperty("--rail-width", shouldExpand ? "260px" : "66px");
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--rail-width", expanded ? "260px" : "66px");
    window.localStorage.setItem("chaincore-primary-nav-expanded", String(expanded));
  }, [expanded]);

  return (
    <aside
      className="fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-border bg-white transition-[width] duration-300 ease-out"
      style={{ width: expanded ? 260 : 66, minWidth: expanded ? 260 : 66 }}
      aria-label="Primary navigation"
      data-expanded={expanded ? "true" : "false"}
    >
      <div className="flex h-[70px] items-center justify-between px-4">
        <button
          type="button"
          aria-label={expanded ? "ChainCore" : "Expand navigation"}
          onClick={() => !expanded && setExpanded(true)}
          className="focus-ring flex items-center gap-3 rounded-xl"
        >
          <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center">
            <Logo size={34} />
          </span>
          <span
            className={[
              "whitespace-nowrap text-sm font-semibold text-primary transition-all duration-200 ease-out",
              expanded ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-1 opacity-0",
            ].join(" ")}
          >
            ChainCore
          </span>
        </button>

        {expanded ? (
          <button
            type="button"
            aria-label="Collapse navigation"
            onClick={() => setExpanded(false)}
            className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
          >
            <PanelLeftClose size={18} strokeWidth={1.9} aria-hidden />
          </button>
        ) : null}
      </div>

      <nav className="flex flex-1 flex-col gap-2 px-3 py-2">
        {ICONS.map((item) => {
          const active = item.match ? item.match(pathname) : item.href === pathname;
          const Icon = item.icon;

          return (
            <Link
              key={item.key}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className="focus-ring rounded-[12px]"
            >
              <span
                className={[
                  "group relative flex h-10 items-center rounded-[12px] transition-all duration-200 ease-out",
                  expanded ? "w-full justify-start gap-3 px-3" : "w-10 justify-center px-0",
                  active
                    ? "bg-primary text-white shadow-[0_8px_16px_rgba(53,88,255,0.18)]"
                    : "text-text-secondary hover:bg-surface-muted hover:text-text-primary",
                ].join(" ")}
              >
                <Icon size={20} strokeWidth={1.9} aria-hidden className="shrink-0" />
                <span
                  className={[
                    "whitespace-nowrap text-sm font-medium transition-all duration-200 ease-out",
                    expanded ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-1 opacity-0",
                  ].join(" ")}
                >
                  {item.label}
                </span>

                {!expanded ? (
                  <span className="pointer-events-none absolute left-[46px] z-40 whitespace-nowrap rounded-md bg-white px-2.5 py-1 text-xs font-medium text-text-primary opacity-0 shadow-[0_2px_10px_rgba(17,24,39,0.12)] ring-1 ring-border transition-opacity group-hover:opacity-100">
                    {item.label}
                  </span>
                ) : null}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
