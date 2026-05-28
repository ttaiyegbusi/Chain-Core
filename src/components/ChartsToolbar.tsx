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
          className="cc-control w-[320px] max-w-full pl-[42px] pr-3.5"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="cc-btn-secondary"
        >
          <SlidersHorizontal size={16} aria-hidden />
          Filter
        </button>

        <button
          type="button"
          className="cc-btn-secondary"
        >
          Export
          <Upload size={16} aria-hidden />
        </button>

        <button
          type="button"
          onClick={() => router.push("/accounting/charts-of-account/create")}
          className="cc-btn-primary px-4"
        >
          Create New GL Account
          <Plus size={16} aria-hidden />
        </button>
      </div>
    </div>
  );
}
