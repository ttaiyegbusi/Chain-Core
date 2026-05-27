"use client";

import {
  Home,
  Layers,
  Info,
  Contact,
  Wallet,
  Newspaper,
  Euro,
  PanelsTopLeft,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface RailIcon {
  key: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  // which route prefixes mark this icon active
  match?: (path: string) => boolean;
}

const ICONS: RailIcon[] = [
  { key: "home", label: "Home", icon: Home, href: "/" },
  { key: "layers", label: "Products", icon: Layers },
  { key: "info", label: "Information", icon: Info },
  { key: "contacts", label: "Customers", icon: Contact },
  { key: "wallet", label: "Wallets", icon: Wallet },
  { key: "reports", label: "Reports", icon: Newspaper },
  {
    key: "accounting",
    label: "Accounting",
    icon: Euro,
    href: "/accounting/charts-of-account",
    match: (p) =>
      p.startsWith("/accounting") && !p.includes("/create") && !p.match(/\/[0-9]+/) ,
  },
  {
    key: "gl",
    label: "General Ledger",
    icon: PanelsTopLeft,
    match: (p) => p.includes("/create") || /\/accounting\/.*\/[0-9]+/.test(p),
  },
];

export default function PrimaryRail() {
  const pathname = usePathname() || "/";

  return (
    <aside
      className="fixed left-0 top-0 z-30 flex h-screen w-[66px] min-w-[66px] flex-col items-center border-r border-border bg-white"
      aria-label="Primary navigation"
    >
      {/* Logo */}
      <div className="mt-5 mb-4 flex h-[30px] w-[30px] items-center justify-center">
        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-primary">
          <Spinner />
        </div>
      </div>

      <nav className="flex flex-1 flex-col items-center gap-2">
        {ICONS.map((item) => {
          const active = item.match
            ? item.match(pathname)
            : item.href === pathname;
          const Icon = item.icon;

          const button = (
            <span
              className={[
                "group relative flex h-9 w-9 items-center justify-center rounded-[10px] transition-colors",
                active
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:bg-surface-muted",
              ].join(" ")}
            >
              <Icon size={20} strokeWidth={1.9} aria-hidden />
              {/* Tooltip */}
              <span className="pointer-events-none absolute left-[46px] z-40 whitespace-nowrap rounded-md bg-white px-2.5 py-1 text-xs font-medium text-text-primary opacity-0 shadow-[0_2px_10px_rgba(17,24,39,0.12)] ring-1 ring-border transition-opacity group-hover:opacity-100">
                {item.label}
              </span>
            </span>
          );

          return item.href ? (
            <Link
              key={item.key}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className="focus-ring rounded-[10px]"
            >
              {button}
            </Link>
          ) : (
            <button
              key={item.key}
              type="button"
              aria-label={item.label}
              className="focus-ring rounded-[10px]"
            >
              {button}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

// Simple radial "loading spinner"-style logo mark to echo the screenshot glyph.
function Spinner() {
  const bars = Array.from({ length: 12 });
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      {bars.map((_, i) => (
        <rect
          key={i}
          x="11"
          y="2"
          width="2"
          height="6"
          rx="1"
          fill="white"
          opacity={0.35 + (i / bars.length) * 0.65}
          transform={`rotate(${(360 / bars.length) * i} 12 12)`}
        />
      ))}
    </svg>
  );
}
