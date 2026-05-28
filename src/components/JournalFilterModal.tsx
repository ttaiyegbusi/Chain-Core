"use client";

import { useEffect, useRef, useState } from "react";
import { X, ChevronDown, Search } from "lucide-react";

export interface JournalFilters {
  glAccount: string;
  cashRelevant: string;
  from: string;
  to: string;
  levelType: string;
  level: string;
  actionType: string;
  transactionType: string;
}

const GL_OPTIONS = [
  "1001100 - WEMA BANK",
  "1001200 - BUDPAY",
  "1001300 - PREMIUM TRUST",
  "1001400 - PETTY CASH",
  "1002100 - COMPUTER HARDWARES",
];

export const DEFAULT_JOURNAL_FILTERS: JournalFilters = {
  glAccount: "1001100 - WEMA BANK",
  cashRelevant: "All",
  from: "",
  to: "",
  levelType: "",
  level: "",
  actionType: "",
  transactionType: "",
};

export default function JournalFilterModal({
  open,
  initial,
  onClose,
  onApply,
}: {
  open: boolean;
  initial: JournalFilters;
  onClose: () => void;
  onApply: (f: JournalFilters) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [f, setF] = useState<JournalFilters>(initial);
  const [nameSearch, setNameSearch] = useState("");

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

  const filtered = GL_OPTIONS.filter((g) =>
    g.toLowerCase().includes(nameSearch.toLowerCase())
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
      <label className="mb-2 block text-sm font-medium text-text-secondary">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={[
            "cc-control-lg w-full appearance-none pr-10",
            value ? "text-text-primary" : "text-text-muted",
          ].join(" ")}
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
      aria-labelledby="jf-title"
    >
      <div className="absolute inset-0 bg-[#0E121B]/45 backdrop-blur-[2px]" onClick={onClose} aria-hidden />

      <div
        ref={cardRef}
        className="relative z-10 flex max-h-[90vh] w-[880px] max-w-[95vw] flex-col cc-modal-panel"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-8 pt-7">
          <div>
            <h2 id="jf-title" className="font-display text-xl font-semibold text-text-primary">
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
            className="focus-ring flex h-8 w-8 items-center justify-center rounded-full bg-bg-sub text-text-secondary hover:bg-border"
          >
            <X size={16} aria-hidden />
          </button>
        </div>

        {/* Body */}
        <div className="grid flex-1 grid-cols-1 gap-0 overflow-y-auto md:grid-cols-2">
          {/* Left: filter dropdowns */}
          <div className="space-y-5 px-8 py-6">
            <Dropdown label="GL Account" value={f.glAccount} onChange={(v) => setF({ ...f, glAccount: v })} options={GL_OPTIONS} />
            <Dropdown label="Cash Relevant" value={f.cashRelevant} onChange={(v) => setF({ ...f, cashRelevant: v })} options={["All", "Cash", "Non-Cash"]} />
            <Dropdown label="From" value={f.from} onChange={(v) => setF({ ...f, from: v })} options={["Today", "This Month", "This Year"]} />
            <Dropdown label="To" value={f.to} onChange={(v) => setF({ ...f, to: v })} options={["Today", "This Month", "This Year"]} />
            <Dropdown label="Level Type" value={f.levelType} onChange={(v) => setF({ ...f, levelType: v })} options={["Head Office", "Branch"]} />
            <Dropdown label="Level" value={f.level} onChange={(v) => setF({ ...f, level: v })} options={["Level 1", "Level 2", "Level 3"]} />
            <Dropdown label="Action Type" value={f.actionType} onChange={(v) => setF({ ...f, actionType: v })} options={["Debit", "Credit"]} />
            <Dropdown label="Transaction Type" value={f.transactionType} onChange={(v) => setF({ ...f, transactionType: v })} options={["Standard Booking", "Manual Entry"]} />
          </div>

          {/* Right: GL name picker */}
          <div className="border-t border-border bg-bg-sub px-8 py-6 md:border-l md:border-t-0">
            <div className="mb-1 text-sm font-medium text-text-primary">Name</div>
            <div className="mb-4 text-sm text-text-secondary">
              Select your preferred name
            </div>

            <div className="relative mb-4">
              <Search
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                aria-hidden
              />
              <input
                type="text"
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
                placeholder="Search"
                aria-label="Search GL account"
                className="cc-control-lg w-full pl-[42px] pr-3.5"
              />
            </div>

            <div className="space-y-1">
              {filtered.map((g) => {
                const selected = f.glAccount === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setF({ ...f, glAccount: g })}
                    className="flex w-full items-center justify-between rounded-lg px-1 py-3 text-left"
                  >
                    <span className="text-sm text-text-primary">{g}</span>
                    <span
                      className={[
                        "flex h-5 w-5 items-center justify-center rounded-full border-2",
                        selected ? "border-primary" : "border-border-strong",
                      ].join(" ")}
                    >
                      {selected && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                    </span>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="py-2 text-sm text-text-muted">No accounts found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-6 border-t border-border px-8 py-5">
          <button
            type="button"
            onClick={() => setF(DEFAULT_JOURNAL_FILTERS)}
            className="focus-ring text-sm font-medium text-text-primary"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => onApply(f)}
            className="cc-btn-primary px-6"
          >
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
}
