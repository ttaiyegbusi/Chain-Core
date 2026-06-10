"use client";

import { useMemo, useRef, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Upload,
  ChevronDown,
} from "lucide-react";
import AccountingSidebar from "@/components/AccountingSidebar";
import GlobalHeader from "@/components/GlobalHeader";
import GeneralLedgerTable from "@/components/GeneralLedgerTable";
import { PaginationBar } from "@/components/Pagination";
import DashboardDateRangePicker, {
  getRange,
  DateRange,
} from "@/components/DashboardDateRangePicker";
import {
  GENERAL_LEDGER_TRANSACTIONS,
  GLTransaction,
  filterTransactions,
} from "@/data/generalLedgerReport";

const GL_CODES = [
  { value: "100000", label: "100000 — ASSET" },
  { value: "100100", label: "100100 — Cash at Bank" },
  { value: "100200", label: "100200 — Loans & Advances" },
  { value: "200000", label: "200000 — LIABILITY" },
  { value: "300000", label: "300000 — EQUITY" },
  { value: "300100", label: "300100 — Interest Income" },
  { value: "400000", label: "400000 — Expense" },
];

const TRANSACTION_TYPES = [
  { value: "Journal Entry", label: "Journal Entry" },
  { value: "Manual Entry", label: "Manual Entry" },
  { value: "System", label: "System" },
];

const BRANCHES = [
  { value: "Lagos", label: "Lagos" },
  { value: "Abuja", label: "Abuja" },
  { value: "Port Harcourt", label: "Port Harcourt" },
];

export default function GeneralLedgerReportPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState<DateRange>(() =>
    getRange("This Month")
  );
  const [selectedGLCode, setSelectedGLCode] = useState("");
  const [selectedTxType, setSelectedTxType] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    let result = GENERAL_LEDGER_TRANSACTIONS;

    // Apply date range filter
    const dateFrom = dateRange.startDate
      ? new Date(dateRange.startDate).toISOString().split("T")[0]
      : undefined;
    const dateTo = dateRange.endDate
      ? new Date(dateRange.endDate).toISOString().split("T")[0]
      : undefined;

    result = filterTransactions(result, {
      dateFrom,
      dateTo,
      glCode: selectedGLCode,
      transactionType: selectedTxType,
      branch: selectedBranch,
    });

    // Apply search
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (tx) =>
          tx.description.toLowerCase().includes(q) ||
          tx.glCode.includes(q) ||
          tx.glName.toLowerCase().includes(q) ||
          tx.referenceId?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [search, selectedGLCode, selectedTxType, selectedBranch, dateRange]);

  const paginated = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filtered.slice(start, end);
  }, [filtered, page, rowsPerPage]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  return (
    <div className="min-h-screen bg-white">
      <AccountingSidebar />

      <main className="ml-[calc(var(--rail-width)+250px)]">
        <GlobalHeader
          title="Accounting"
          crumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Accounting", href: "/accounting/charts-of-account" },
            { label: "General Ledger Report" },
          ]}
        />

        <section className="border-b border-border bg-white px-10 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                General Ledger Report
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Detailed transaction history by GL account
              </p>
            </div>
            <div className="flex items-center gap-3">
              <DashboardDateRangePicker
                value={dateRange}
                onChange={setDateRange}
              />
              <button
                type="button"
                aria-label="Export"
                className="focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm text-text-secondary hover:bg-surface-muted"
              >
                <Upload size={16} aria-hidden />
                Export
              </button>
            </div>
          </div>
        </section>

        <section className="px-10 pb-10 pt-6">
          {/* Toolbar */}
          <div className="mb-6 flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                aria-hidden
              />
              <input
                type="text"
                placeholder="Search by description, code, or reference..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="focus-ring h-9 w-full rounded-md border border-border bg-white pl-9 pr-3 text-sm placeholder:text-text-muted"
              />
            </div>

            {/* Filter dropdown */}
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => setFilterOpen((o) => !o)}
                className="focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm text-text-secondary hover:bg-surface-muted"
              >
                <SlidersHorizontal size={16} aria-hidden />
                Filter
                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    filterOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden
                />
              </button>

              {filterOpen && (
                <div className="absolute right-0 top-full z-40 mt-2 w-80 rounded-lg border border-border bg-white p-4 ">
                  <div className="space-y-4">
                    {/* GL Code filter */}
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-text-secondary">
                        GL Code
                      </label>
                      <select
                        value={selectedGLCode}
                        onChange={(e) => {
                          setSelectedGLCode(e.target.value);
                          setPage(1);
                        }}
                        className="focus-ring w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                      >
                        <option value="">All GL Codes</option>
                        {GL_CODES.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Transaction Type filter */}
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-text-secondary">
                        Transaction Type
                      </label>
                      <select
                        value={selectedTxType}
                        onChange={(e) => {
                          setSelectedTxType(e.target.value);
                          setPage(1);
                        }}
                        className="focus-ring w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                      >
                        <option value="">All Types</option>
                        {TRANSACTION_TYPES.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Branch filter */}
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-text-secondary">
                        Branch
                      </label>
                      <select
                        value={selectedBranch}
                        onChange={(e) => {
                          setSelectedBranch(e.target.value);
                          setPage(1);
                        }}
                        className="focus-ring w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                      >
                        <option value="">All Branches</option>
                        {BRANCHES.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Clear filters button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGLCode("");
                        setSelectedTxType("");
                        setSelectedBranch("");
                        setPage(1);
                      }}
                      className="focus-ring w-full rounded-md bg-surface-muted px-3 py-2 text-sm text-text-primary hover:bg-border"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <GeneralLedgerTable transactions={paginated} />

          {/* Pagination */}
          <div className="mt-6">
            <PaginationBar
              page={page}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(n) => {
                setRowsPerPage(n);
                setPage(1);
              }}
              onPageChange={setPage}
              totalItems={filtered.length}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
