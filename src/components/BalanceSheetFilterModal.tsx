"use client";

import { useEffect, useRef, useState } from "react";
import { X, ChevronDown, Search } from "lucide-react";
import { Checkbox } from "./FormControls";

export interface BSFilters {
  date: string;
  hideZeroBalance: boolean;
  level: string;
  branch: string;
  showSelectedLevelOnly: boolean;
  selectedLevel: string; // radio choice on the right
}

const LEVEL_OPTIONS = ["Head Office", "My Rentease Credit"];

export default function BalanceSheetFilterModal({
  open,
  initial,
  onClose,
  onApply,
}: {
  open: boolean;
  initial: BSFilters;
  onClose: () => void;
  onApply: (f: BSFilters) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [f, setF] = useState<BSFilters>(initial);
  const [levelSearch, setLevelSearch] = useState("");

  useEffect(() => {
    if (open) setF(initial);
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const reset: BSFilters = {
    date: "",
    hideZeroBalance: false,
    level: "",
    branch: "",
    showSelectedLevelOnly: false,
    selectedLevel: "",
  };

  const filteredLevels = LEVEL_OPTIONS.filter((l) =>
    l.toLowerCase().includes(levelSearch.toLowerCase())
  );

  const Dropdown = ({
    label,
    value,
    onChange,
    options,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: string[];
  }) => (
    <div>
      <label className="mb-2 block text-sm text-text-secondary">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="focus-ring h-[46px] w-full appearance-none rounded-md border border-border-strong bg-white px-3.5 pr-10 text-sm text-text-primary"
        >
          <option value="">Select</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
          aria-hidden
        />
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bs-filter-title"
    >
      <div className="absolute inset-0 bg-black/35" onClick={onClose} aria-hidden />

      <div
        ref={cardRef}
        className="relative z-10 flex max-h-[90vh] w-[820px] max-w-[95vw] flex-col rounded-2xl bg-white shadow-[0_20px_60px_rgba(17,24,39,0.25)]"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-8 pt-7">
          <div>
            <h2
              id="bs-filter-title"
              className="text-lg font-semibold text-text-primary"
            >
              Filter by
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              See results in your view based on the filters you select here
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="focus-ring flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-text-secondary hover:bg-border"
          >
            <X size={16} aria-hidden />
          </button>
        </div>

        {/* Body: two columns */}
        <div className="grid flex-1 grid-cols-1 gap-0 overflow-y-auto md:grid-cols-2">
          {/* Left column */}
          <div className="space-y-5 px-8 py-6">
            <Dropdown
              label="Date"
              value={f.date}
              onChange={(v) => setF({ ...f, date: v })}
              options={["Today", "This Month", "This Quarter", "This Year"]}
            />

            <Checkbox
              id="bs-hide-zero"
              label="Hide 0 Balance GL Accounts"
              checked={f.hideZeroBalance}
              onChange={(v) => setF({ ...f, hideZeroBalance: v })}
            />

            <Dropdown
              label="Level"
              value={f.level}
              onChange={(v) => setF({ ...f, level: v })}
              options={["Level 1", "Level 2", "Level 3"]}
            />

            <Dropdown
              label="Branch"
              value={f.branch}
              onChange={(v) => setF({ ...f, branch: v })}
              options={["Head Office", "Lagos", "Abuja"]}
            />

            <Checkbox
              id="bs-selected-level"
              label="Show Balance of Selected Level Only"
              checked={f.showSelectedLevelOnly}
              onChange={(v) => setF({ ...f, showSelectedLevelOnly: v })}
            />
          </div>

          {/* Right column: Level picker */}
          <div className="border-t border-border bg-surface-muted px-8 py-6 md:border-l md:border-t-0">
            <div className="mb-1 text-sm font-medium text-text-primary">Level</div>
            <div className="mb-4 text-sm text-text-secondary">Select Level</div>

            <div className="relative mb-4">
              <Search
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                aria-hidden
              />
              <input
                type="text"
                value={levelSearch}
                onChange={(e) => setLevelSearch(e.target.value)}
                placeholder="Search"
                aria-label="Search level"
                className="focus-ring h-[46px] w-full rounded-md border border-border-strong bg-white pl-[42px] pr-3.5 text-sm text-text-primary placeholder:text-text-muted"
              />
            </div>

            <div className="space-y-1">
              {filteredLevels.map((lvl) => {
                const selected = f.selectedLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setF({ ...f, selectedLevel: lvl })}
                    className="flex w-full items-center justify-between rounded-md px-1 py-3 text-left"
                  >
                    <span className="text-sm text-text-primary">{lvl}</span>
                    <span
                      className={[
                        "flex h-5 w-5 items-center justify-center rounded-full border-2",
                        selected ? "border-primary" : "border-border-strong",
                      ].join(" ")}
                    >
                      {selected && (
                        <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                      )}
                    </span>
                  </button>
                );
              })}
              {filteredLevels.length === 0 && (
                <p className="py-2 text-sm text-text-muted">No levels found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-6 border-t border-border px-8 py-5">
          <button
            type="button"
            onClick={() => setF(reset)}
            className="focus-ring text-sm font-medium text-text-primary"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => onApply(f)}
            className="focus-ring inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
}
