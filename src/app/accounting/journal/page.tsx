"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, Upload, Plus } from "lucide-react";
import PrimaryRail from "@/components/PrimaryRail";
import AccountingSidebar from "@/components/AccountingSidebar";
import { Breadcrumbs } from "@/components/Common";
import JournalTable from "@/components/JournalTable";
import JournalFilterModal, {
  JournalFilters,
  DEFAULT_JOURNAL_FILTERS,
} from "@/components/JournalFilterModal";
import {
  HorizontalScrollControls,
  PaginationBar,
} from "@/components/Pagination";
import { JOURNAL_ENTRIES } from "@/data/journal";

export default function JournalPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<JournalFilters>(DEFAULT_JOURNAL_FILTERS);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const data = useMemo(() => {
    if (!search) return JOURNAL_ENTRIES;
    const t = search.toLowerCase();
    return JOURNAL_ENTRIES.filter(
      (e) =>
        e.id.toLowerCase().includes(t) ||
        e.user.toLowerCase().includes(t) ||
        e.category.toLowerCase().includes(t) ||
        e.detail.notes.toLowerCase().includes(t)
    );
  }, [search]);

  const totalItems = 500;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  return (
    <div className="min-h-screen bg-white">
      <PrimaryRail />
      <AccountingSidebar menuLabel="SUB MENU" />

      <main className="ml-[316px]">
        <header className="flex h-[70px] items-center justify-between border-b border-border pl-10 pr-11">
          <div>
            <h1 className="text-lg font-semibold text-text-primary">Accounting</h1>
            <div className="mt-0.5">
              <Breadcrumbs
                items={[
                  { label: "Dashboard", href: "/" },
                  { label: "Accounting", href: "/accounting/charts-of-account" },
                  { label: "Journal Entries" },
                ]}
              />
            </div>
          </div>
        </header>

        <section className="px-10 pb-10 pt-6">
          <h2 className="text-xl font-semibold text-text-primary">
            Journal Entries
          </h2>

          {/* Toolbar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                aria-hidden
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                aria-label="Search journal entries"
                className="focus-ring h-10 w-[320px] max-w-full rounded-md border border-border-strong pl-[42px] pr-3.5 text-sm text-text-primary placeholder:text-text-muted"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterOpen(true)}
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
                onClick={() => router.push("/accounting/journal/create")}
                className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-primary bg-white px-4 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
              >
                Manual Journal
                <Plus size={16} aria-hidden />
              </button>
              <button
                type="button"
                className="focus-ring inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
              >
                View Standard Booking
              </button>
            </div>
          </div>

          <JournalTable data={data} />

          <HorizontalScrollControls />

          <PaginationBar
            page={page}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            totalItems={totalItems}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
          />
        </section>
      </main>

      <JournalFilterModal
        open={filterOpen}
        initial={filters}
        onClose={() => setFilterOpen(false)}
        onApply={(f) => {
          setFilters(f);
          setFilterOpen(false);
          setPage(1);
        }}
      />
    </div>
  );
}
