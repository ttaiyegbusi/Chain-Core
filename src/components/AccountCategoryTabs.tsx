"use client";

import { TABS, TabKey } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

export default function AccountCategoryTabs({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const updateIndicator = () => {
      const list = listRef.current;
      const tab = tabRefs.current[active];
      if (!list || !tab) return;
      const listRect = list.getBoundingClientRect();
      const tabRect = tab.getBoundingClientRect();
      setIndicator({ left: tabRect.left - listRect.left, width: tabRect.width });
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [active]);

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Account categories"
      className="relative flex h-[46px] items-center gap-7 border-b border-border px-10"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-[-1px] h-0.5 rounded-full bg-primary transition-[left,width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ left: indicator.left, width: indicator.width }}
      />

      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            ref={(node) => {
              tabRefs.current[t.key] = node;
            }}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(t.key)}
            className={[
              "focus-ring relative flex h-full items-center text-sm transition-[color,transform] duration-250 ease-out",
              isActive
                ? "font-medium text-primary"
                : "text-text-secondary hover:text-text-primary",
            ].join(" ")}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
