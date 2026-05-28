"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px]">
      {items.map((c, i) => {
        const last = i === items.length - 1;
        return (
          <span key={c.label} className="flex items-center gap-1.5">
            {c.href && !last ? (
              <Link
                href={c.href}
                className="text-text-subtle transition-colors hover:text-text-secondary"
              >
                {c.label}
              </Link>
            ) : (
              <span
                className={last ? "text-text-secondary" : "text-text-subtle"}
                aria-current={last ? "page" : undefined}
              >
                {c.label}
              </span>
            )}
            {!last && (
              <ChevronRight size={14} className="text-text-subtle" aria-hidden />
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function AskCoreAIButton() {
  return (
    <button
      type="button"
      className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
    >
      <span className="flex h-4 w-4 items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => (
            <rect
              key={i}
              x="11"
              y="2"
              width="2"
              height="6"
              rx="1"
              fill="white"
              opacity={0.4 + (i / 12) * 0.6}
              transform={`rotate(${(360 / 12) * i} 12 12)`}
            />
          ))}
        </svg>
      </span>
      Ask Core AI
    </button>
  );
}
