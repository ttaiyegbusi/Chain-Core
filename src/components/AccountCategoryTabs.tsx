"use client";

import { TABS, TabKey } from "@/lib/types";
import { useState } from "react";

export default function AccountCategoryTabs({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
}) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleTabChange = (t: TabKey) => {
    setIsTransitioning(true);
    onChange(t);
    // Reset transition flag after animation completes
    setTimeout(() => setIsTransitioning(false), 150);
  };

  return (
    <div
      role="tablist"
      aria-label="Account categories"
      className="flex h-[46px] items-center gap-7 border-b border-border px-10"
    >
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => handleTabChange(t.key)}
            className={[
              "focus-ring relative flex h-full items-center text-sm transition-colors duration-150",
              isActive
                ? "font-medium text-primary"
                : "text-text-secondary hover:text-text-primary",
            ].join(" ")}
          >
            {t.label}
            {isActive && (
              <span className="tab-indicator absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}
