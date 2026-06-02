"use client";

import { useState, ReactNode } from "react";
import { ChevronDown, Info } from "lucide-react";

/**
 * Soft-banded accordion section used on client detail pages.
 * Defaults to open. Click the header to collapse.
 */
export function DetailAccordion({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="mt-6 first:mt-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="focus-ring flex w-full items-center justify-between rounded-md bg-surface-muted px-5 py-3 text-left text-sm font-medium text-text-primary"
      >
        {title}
        <ChevronDown
          size={16}
          className={`text-text-secondary transition-transform ${open ? "rotate-0" : "-rotate-90"}`}
          aria-hidden
        />
      </button>
      {open && <div className="px-5 pt-4">{children}</div>}
    </section>
  );
}

/** Tiny uppercase section label like "FIRST ADDRESS". */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-semibold tracking-wider text-text-subtle">
      {children}
    </p>
  );
}

/** Label + value pair shown across a field row. */
export function Field({
  label,
  value,
  hint = true,
}: {
  label: string;
  value: ReactNode;
  hint?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1 text-xs text-text-secondary">
        {label}
        {hint && (
          <Info
            size={11}
            className="text-text-muted opacity-60"
            aria-hidden
          />
        )}
      </div>
      <p className="text-sm text-text-primary">{value}</p>
    </div>
  );
}
