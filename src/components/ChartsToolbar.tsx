"use client";

import { Search, SlidersHorizontal, Upload, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ChartsToolbar({
  search,
  onSearch,
}: {
  search: string;
  onSearch: (v: string) => void;
}) {
  const router = useRouter();

  return (
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
          className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-border-strong bg-white px-3.5 text-sm text-text-secondary transition-colors hover:bg-surface-muted"
        >
          <SlidersHorizontal size={16} aria-hidden />
          Filter
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
  );
}
