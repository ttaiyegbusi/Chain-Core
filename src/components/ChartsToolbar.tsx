"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, Upload, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import ChartOfAccountsFilterModal, { ChartAccountFilterOptions } from "./ChartOfAccountsFilterModal";

export default function ChartsToolbar({
  search,
  onSearch,
  onFilter,
}: {
  search: string;
  onSearch: (v: string) => void;
  onFilter?: (filters: ChartAccountFilterOptions) => void;
}) {
  const router = useRouter();
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<ChartAccountFilterOptions>({});

  const handleApplyFilter = (appliedFilters: ChartAccountFilterOptions) => {
    setFilters(appliedFilters);
    onFilter?.(appliedFilters);
    setFilterOpen(false);
  };

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
            aria-hidden
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search"
            aria-label="Search chart of accounts"
            className="focus-ring h-10 w-[320px] max-w-full rounded-md border border-border-strong pl-[42px] pr-3.5 text-sm text-text-primary placeholder:text-text-muted"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className={[
              "focus-ring inline-flex h-10 items-center gap-2 rounded-md border px-3.5 text-sm transition-colors",
              Object.values(filters).some(Boolean)
                ? "border-primary bg-primary/5 text-primary"
                : "border-border-strong bg-white text-text-secondary hover:bg-surface-muted",
            ].join(" ")}
          >
            <SlidersHorizontal size={16} aria-hidden />
            Filter
            {Object.values(filters).some(Boolean) && (
              <span className="ml-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {Object.values(filters).filter(Boolean).length}
              </span>
            )}
          </button>

          <button
            type="button"
            className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-border-strong bg-white px-3.5 text-sm text-text-secondary transition-colors hover:bg-surface-muted"
          >
            Export
            <Upload size={16} aria-hidden />
          </button>

          <button
            type="button"
            onClick={() => router.push("/accounting/charts-of-account/create")}
            className="focus-ring inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Create New GL Account
            <Plus size={16} aria-hidden />
          </button>
        </div>
      </div>

      {/* Filter Modal */}
      <ChartOfAccountsFilterModal
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={handleApplyFilter}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </>
  );
}
