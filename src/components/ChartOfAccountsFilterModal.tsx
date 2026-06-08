"use client";

import { useRef, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";

export interface ChartAccountFilterOptions {
  type?: string;
  hierarchyType?: string;
  balanceSide?: string;
  showHeadOfficeOnly?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: ChartAccountFilterOptions) => void;
  filters: ChartAccountFilterOptions;
  onFiltersChange: (filters: ChartAccountFilterOptions) => void;
}

const ACCOUNT_TYPES = [
  { value: "Asset", label: "Asset" },
  { value: "Liability", label: "Liability" },
  { value: "Equity", label: "Equity" },
  { value: "Income", label: "Income" },
  { value: "Expense", label: "Expense" },
];

const HIERARCHY_TYPES = [
  { value: "Header Account", label: "Header Account" },
  { value: "Control Account", label: "Control Account" },
  { value: "Posting Account", label: "Posting Account" },
];

const BALANCE_SIDES = [
  { value: "Dr", label: "Debit" },
  { value: "Cr", label: "Credit" },
];

function SelectField({
  label,
  value,
  options,
  placeholder = "All",
  onChange,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  onChange: (value?: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-text-primary">{label}</span>
      <div className="relative">
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value || undefined)}
          className="focus-ring h-11 w-full appearance-none rounded-md border border-border-strong bg-white px-3 pr-9 text-sm text-text-primary transition-colors hover:border-[#C8D0DC]"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
          aria-hidden
        />
      </div>
    </label>
  );
}

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
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
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

  const clearFilters = () => {
    const cleared: ChartAccountFilterOptions = {};
    onFiltersChange(cleared);
    onApply(cleared);
  };

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px]" aria-hidden />

      <div
        ref={modalRef}
        className="filter-modal-in fixed right-8 top-[132px] z-40 w-[390px] overflow-hidden rounded-xl bg-white shadow-[0_20px_60px_rgba(17,24,39,0.16)] ring-1 ring-border"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-title"
      >
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 id="filter-title" className="text-base font-semibold text-text-primary">
              Filter chart accounts
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close filter"
              className="focus-ring flex h-8 w-8 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-muted"
            >
              <X size={18} aria-hidden />
            </button>
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            Narrow the account list by type, hierarchy and balance side.
          </p>
        </div>

        <div className="space-y-4 px-5 py-5">
          <SelectField
            label="Account Type"
            value={filters.type}
            options={ACCOUNT_TYPES}
            placeholder="All account types"
            onChange={(type) => onFiltersChange({ ...filters, type })}
          />
          <SelectField
            label="Hierarchy Type"
            value={filters.hierarchyType}
            options={HIERARCHY_TYPES}
            placeholder="All hierarchy types"
            onChange={(hierarchyType) => onFiltersChange({ ...filters, hierarchyType })}
          />
          <SelectField
            label="Balance Side"
            value={filters.balanceSide}
            options={BALANCE_SIDES}
            placeholder="Debit and credit"
            onChange={(balanceSide) => onFiltersChange({ ...filters, balanceSide })}
          />
          <SelectField
            label="Head Office Visibility"
            value={filters.showHeadOfficeOnly}
            options={[
              { value: "true", label: "Show GL only for Head Office" },
              { value: "false", label: "Available outside Head Office" },
            ]}
            placeholder="All visibility settings"
            onChange={(showHeadOfficeOnly) =>
              onFiltersChange({ ...filters, showHeadOfficeOnly })
            }
          />
        </div>

        <div className="flex gap-3 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={clearFilters}
            className="focus-ring flex-1 rounded-md border border-border-strong bg-white px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-muted"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => onApply(filters)}
            className="focus-ring flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Apply Now
          </button>
        </div>
      </div>
    </>
  );
}
