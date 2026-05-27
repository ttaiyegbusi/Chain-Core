"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export function HorizontalScrollControls() {
  const Btn = ({
    children,
    label,
  }: {
    children: React.ReactNode;
    label: string;
  }) => (
    <button
      type="button"
      aria-label={label}
      className="focus-ring flex h-8 w-8 items-center justify-center rounded-md border border-border-strong bg-white text-text-secondary hover:bg-surface-muted"
    >
      {children}
    </button>
  );

  return (
    <div className="mt-5 flex items-center gap-2">
      <Btn label="Scroll to start">
        <ChevronsLeft size={16} aria-hidden />
      </Btn>
      <Btn label="Scroll left">
        <ChevronLeft size={16} aria-hidden />
      </Btn>
      <div className="h-6 flex-1 rounded-md bg-[#ECEEF2]" aria-hidden />
      <Btn label="Scroll right">
        <ChevronRight size={16} aria-hidden />
      </Btn>
      <Btn label="Scroll to end">
        <ChevronsRight size={16} aria-hidden />
      </Btn>
    </div>
  );
}

interface PaginationProps {
  page: number;
  totalPages: number;
  rowsPerPage: number;
  totalItems: number;
  onPageChange: (p: number) => void;
  onRowsPerPageChange: (n: number) => void;
}

export function PaginationBar({
  page,
  totalPages,
  rowsPerPage,
  totalItems,
  onPageChange,
  onRowsPerPageChange,
}: PaginationProps) {
  const start = totalItems === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const end = Math.min(page * rowsPerPage, totalItems);

  // Build page list: 1, 2, 3, ..., last
  const pages: (number | "...")[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1, 2, 3, "...", totalPages);
  }

  const PageBtn = ({ p }: { p: number }) => (
    <button
      type="button"
      onClick={() => onPageChange(p)}
      aria-current={p === page ? "page" : undefined}
      className={[
        "flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-[13px] transition-colors",
        p === page
          ? "bg-surface-muted font-medium text-text-primary"
          : "text-text-secondary hover:bg-surface-muted",
      ].join(" ")}
    >
      {p}
    </button>
  );

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-4 py-4 text-[13px] text-text-secondary">
      {/* Rows per page */}
      <div className="flex items-center gap-2">
        <span>Rows per Page</span>
        <select
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
          aria-label="Rows per page"
          className="focus-ring h-8 rounded-md border border-border-strong bg-white px-2 text-[13px] text-text-primary"
        >
          {[8, 16, 24, 50].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {/* Page controls */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="focus-ring flex h-8 items-center gap-1 rounded-md border border-border-strong bg-white px-2.5 text-text-secondary hover:bg-surface-muted disabled:opacity-40"
        >
          <ChevronLeft size={14} aria-hidden /> Prev
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`e${i}`} className="px-1 text-text-muted">
              …
            </span>
          ) : (
            <PageBtn key={p} p={p} />
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="focus-ring flex h-8 items-center gap-1 rounded-md border border-border-strong bg-white px-2.5 text-text-secondary hover:bg-surface-muted disabled:opacity-40"
        >
          Next <ChevronRight size={14} aria-hidden />
        </button>
      </div>

      {/* Go to page */}
      <div className="flex items-center gap-2">
        <span className="text-text-muted">/</span>
        <span>Go to Page</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          defaultValue={page}
          aria-label="Go to page number"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const v = Number((e.target as HTMLInputElement).value);
              if (v >= 1 && v <= totalPages) onPageChange(v);
            }
          }}
          className="focus-ring h-8 w-14 rounded-md border border-border-strong px-2 text-center text-[13px] text-text-primary"
          id="go-to-page"
        />
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById(
              "go-to-page"
            ) as HTMLInputElement | null;
            const v = Number(el?.value);
            if (v >= 1 && v <= totalPages) onPageChange(v);
          }}
          className="focus-ring flex h-8 items-center gap-1 rounded-md border border-border-strong bg-white px-3 text-text-secondary hover:bg-surface-muted"
        >
          Go <ChevronRight size={14} aria-hidden />
        </button>
      </div>

      {/* Result count */}
      <div className="text-text-secondary">
        Showing {start} - {end} of {totalItems}
      </div>
    </div>
  );
}
