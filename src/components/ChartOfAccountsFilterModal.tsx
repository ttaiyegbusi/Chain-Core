"use client";

import { useRef, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";

interface FilterOptions {
  type?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

const ACCOUNT_TYPES = [
  { value: "Asset", label: "Asset" },
  { value: "Liability", label: "Liability" },
  { value: "Equity", label: "Equity" },
  { value: "Income", label: "Income" },
  { value: "Expense", label: "Expense" },
];

export default function ChartOfAccountsFilterModal({
  isOpen,
  onClose,
  onApply,
  filters,
  onFiltersChange,
}: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
        aria-hidden
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="filter-modal-in fixed left-1/2 top-1/2 z-40 w-96 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 ring-1 ring-border"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-title"
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="filter-title"
            className="text-lg font-semibold text-text-primary"
          >
            Filter Accounts
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filter"
            className="focus-ring flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-surface-muted"
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          {/* Account Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary">
              Account Type
            </label>
            <select
              value={filters.type || ""}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  type: e.target.value || undefined,
                })
              }
              className="focus-ring w-full rounded-md border border-border-strong bg-white px-3 py-2 text-sm text-text-primary"
            >
              <option value="">All Types</option>
              {ACCOUNT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => {
              onFiltersChange({ type: undefined });
            }}
            className="focus-ring flex-1 rounded-md bg-surface-muted px-4 py-2 text-sm font-medium text-text-primary hover:bg-border transition-colors"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => onApply(filters)}
            className="focus-ring flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}
