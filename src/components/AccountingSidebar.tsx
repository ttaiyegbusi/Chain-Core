"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Monitor,
  PieChart,
  BarChart3,
  LineChart,
  FolderClosed,
  Euro,
  ChevronDown,
} from "lucide-react";

interface MenuItem {
  label: string;
  icon: React.ElementType;
  href: string;
}

const MENU: MenuItem[] = [
  { label: "Charts of Account", icon: BookOpen, href: "/accounting/charts-of-account" },
  { label: "Balance Sheet", icon: Monitor, href: "/accounting/balance-sheet" },
  { label: "Trial Balance", icon: PieChart, href: "/accounting/trial-balance" },
  { label: "Journal", icon: BarChart3, href: "/accounting/journal" },
  { label: "General Ledger Report", icon: LineChart, href: "/accounting/general-ledger-report" },
  { label: "Provisional Report", icon: FolderClosed, href: "/accounting/provisional-report" },
];

export default function AccountingSidebar({
  menuLabel = "MENU",
}: {
  menuLabel?: string;
}) {
  const pathname = usePathname() || "";

  return (
    <aside
      className="fixed left-[66px] top-0 z-20 flex h-screen w-[250px] min-w-[250px] flex-col border-r border-border bg-white"
      aria-label="Accounting navigation"
    >
      {/* Module pill (dropdown style) */}
      <div className="px-4 pt-5">
        <button
          type="button"
          className="focus-ring flex w-full items-center justify-between rounded-md bg-surface-muted px-3 py-2.5"
        >
          <span className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border-strong text-text-secondary">
              <Euro size={14} strokeWidth={2} aria-hidden />
            </span>
            <span className="text-sm font-medium text-text-primary">
              Accounting
            </span>
          </span>
          <ChevronDown size={16} className="text-text-secondary" aria-hidden />
        </button>
      </div>

      {/* Menu label */}
      <div className="px-5 pb-2 pt-5 text-[11px] font-semibold tracking-wider text-text-subtle">
        {menuLabel}
      </div>

      <nav className="flex flex-col gap-0.5 px-3">
        {MENU.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="focus-ring rounded-md"
            >
              <span
                className={[
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-surface-muted text-text-primary"
                    : "text-text-secondary hover:bg-surface-muted",
                ].join(" ")}
              >
                <Icon size={18} strokeWidth={1.9} aria-hidden />
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
