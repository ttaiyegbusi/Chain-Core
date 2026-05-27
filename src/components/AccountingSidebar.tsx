"use client";

import Link from "next/link";
import {
  BookOpen,
  Monitor,
  PieChart,
  BarChart3,
  LineChart,
  FolderClosed,
  Euro,
} from "lucide-react";

interface MenuItem {
  label: string;
  icon: React.ElementType;
  href?: string;
  active?: boolean;
}

const MENU: MenuItem[] = [
  {
    label: "Charts of Account",
    icon: BookOpen,
    href: "/accounting/charts-of-account",
    active: true,
  },
  { label: "Balance Sheet", icon: Monitor },
  { label: "Trial Balance", icon: PieChart },
  { label: "Journal", icon: BarChart3 },
  { label: "General Ledger Report", icon: LineChart },
  { label: "Provisional Report", icon: FolderClosed },
];

export default function AccountingSidebar() {
  return (
    <aside
      className="fixed left-[66px] top-0 z-20 flex h-screen w-[250px] min-w-[250px] flex-col border-r border-border bg-white"
      aria-label="Accounting navigation"
    >
      {/* Module pill */}
      <div className="px-4 pt-5">
        <div className="flex items-center gap-2 rounded-md bg-surface-muted px-3 py-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border-strong text-text-secondary">
            <Euro size={14} strokeWidth={2} aria-hidden />
          </span>
          <span className="text-sm font-medium text-text-primary">
            Accounting
          </span>
        </div>
      </div>

      {/* MENU label */}
      <div className="px-5 pb-2 pt-5 text-[11px] font-semibold tracking-wider text-text-subtle">
        MENU
      </div>

      <nav className="flex flex-col gap-0.5 px-3">
        {MENU.map((item) => {
          const Icon = item.icon;
          const content = (
            <span
              className={[
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                item.active
                  ? "bg-surface-muted text-text-primary"
                  : "text-text-secondary hover:bg-surface-muted",
              ].join(" ")}
            >
              <Icon size={18} strokeWidth={1.9} aria-hidden />
              {item.label}
            </span>
          );

          return item.href ? (
            <Link
              key={item.label}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className="focus-ring rounded-md"
            >
              {content}
            </Link>
          ) : (
            <button
              key={item.label}
              type="button"
              className="focus-ring rounded-md text-left"
            >
              {content}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
