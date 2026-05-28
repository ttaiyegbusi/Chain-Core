"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, Upload, Plus } from "lucide-react";
import PrimaryRail from "@/components/PrimaryRail";
import AccountingSidebar from "@/components/AccountingSidebar";
import { Breadcrumbs } from "@/components/Common";
import GlobalHeader from "@/components/GlobalHeader";
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
    <div className="cc-page">
      <PrimaryRail />
      <AccountingSidebar menuLabel="SUB MENU" />

      <main className="cc-main">
        <GlobalHeader
          title="Accounting"
          crumbs={[
                  { label: "Dashboard", href: "/" },
                  { label: "Accounting", href: "/accounting/charts-of-account" },
                  { label: "Journal Entries" },
                ]}
        />

        <section className="cc-section">
          <h2 className="cc-page-title">
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
                className="cc-control w-[320px] max-w-full pl-[42px] pr-3.5"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterOpen(true)}
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
                onClick={() => router.push("/accounting/journal/create")}
                className="cc-btn-outline-primary px-4"
              >
                Manual Journal
                <Plus size={16} aria-hidden />
              </button>
              <button
                type="button"
                className="cc-btn-primary px-4"
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
