"use client";

import { TABS, TabKey } from "@/lib/types";

export default function AccountCategoryTabs({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Account categories"
      className="flex h-12 items-center gap-7 border-b border-border bg-surface px-8"
    >
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(t.key)}
            className={[
              "focus-ring relative flex h-full items-center text-sm font-medium transition-colors",
              isActive
                ? "font-medium text-primary"
                : "text-text-secondary hover:text-text-primary",
            ].join(" ")}
          >
            {t.label}
            {isActive && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}
