"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Upload, ChevronDown } from "lucide-react";
import AccountingSidebar from "@/components/AccountingSidebar";
import GlobalHeader from "@/components/GlobalHeader";
import BalanceSheetTable from "@/components/BalanceSheetTable";
import { PaginationBar } from "@/components/Pagination";
import DashboardDateRangePicker, {
  getRange,
  DateRange,
} from "@/components/DashboardDateRangePicker";
import { PROVISIONAL_DATA, filterProvisionalData } from "@/data/provisionalReport";
import { BSRow } from "@/data/balanceSheet";

const ACCOUNT_TYPES = [
  { value: "All", label: "All Accounts" },
  { value: "Asset", label: "Assets" },
  { value: "Liability", label: "Liabilities" },
  { value: "Equity", label: "Equity" },
];

const BRANCHES = [
  { value: "", label: "All Branches" },
  { value: "Lagos", label: "Lagos" },
  { value: "Abuja", label: "Abuja" },
  { value: "Port Harcourt", label: "Port Harcourt" },
];

export default function ProvisionalsReportPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [dateRange, setDateRange] = useState<DateRange>(() =>
    getRange("Today")
  );
  const [selectedAccountType, setSelectedAccountType] =
    useState<"All" | "Asset" | "Liability" | "Equity">("All");
  const [selectedBranch, setSelectedBranch] = useState("");

  // Filter by account type and branch
  const filtered = useMemo(() => {
    let result = filterProvisionalData(PROVISIONAL_DATA, {
      accountType: selectedAccountType,
      branch: selectedBranch,
    });

    // Apply search (simple text match)
    const q = search.trim().toLowerCase();
    if (q) {
      const searchInTree = (nodes: BSRow[]): BSRow[] => {
        return nodes
          .map((node) => {
            const matches =
              node.name?.toLowerCase().includes(q) ||
              node.code?.toLowerCase().includes(q);
            const childResults = node.children
              ? searchInTree(node.children)
              : undefined;
            // Include node if it matches or has matching children
            if (matches || (childResults && childResults.length > 0)) {
              return {
                ...node,
                children: childResults || node.children,
              } as BSRow;
            }
            return null;
          })
          .filter((n): n is BSRow => n !== null);
      };
      result = searchInTree(result);
    }

    return result;
  }, [search, selectedAccountType, selectedBranch]);

  // BalanceSheetTable doesn't use expand/collapse in this context
  // so we can simplify by removing the unused toggleExpand

  return (
    <div className="min-h-screen bg-white">
      <AccountingSidebar />

      <main className="ml-[calc(var(--rail-width)+250px)]">
        <GlobalHeader
          title="Accounting"
          crumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Accounting", href: "/accounting/charts-of-account" },
            { label: "Provisional Report" },
          ]}
        />

        <section className="border-b border-border bg-white px-10 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Provisional Report
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Pre-closing balance snapshot as of{" "}
                {dateRange.endDate
                  ? new Date(dateRange.endDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "today"}
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
                placeholder="Search accounts..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="focus-ring h-9 w-full rounded-md border border-border bg-white pl-9 pr-3 text-sm placeholder:text-text-muted"
              />
            </div>

            {/* Filter button */}
            <button
              type="button"
              className="focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm text-text-secondary hover:bg-surface-muted"
            >
              <SlidersHorizontal size={16} aria-hidden />
              Filter
              <ChevronDown size={14} aria-hidden />
            </button>
          </div>

          {/* Quick filters */}
          <div className="mb-6 flex items-center gap-3 flex-wrap">
            <div>
              <label className="text-xs font-semibold text-text-secondary mr-2">
                Account Type:
              </label>
              <select
                value={selectedAccountType}
                onChange={(e) => {
                  setSelectedAccountType(
                    e.target.value as
                      | "All"
                      | "Asset"
                      | "Liability"
                      | "Equity"
                  );
                  setPage(1);
                }}
                className="focus-ring rounded-md border border-border bg-white px-3 py-2 text-sm"
              >
                {ACCOUNT_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary mr-2">
                Branch:
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => {
                  setSelectedBranch(e.target.value);
                  setPage(1);
                }}
                className="focus-ring rounded-md border border-border bg-white px-3 py-2 text-sm"
              >
                {BRANCHES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <BalanceSheetTable
            data={filtered}
            defaultExpanded={new Set()}
          />

          {/* Pagination */}
          <div className="mt-6">
            <PaginationBar
              page={page}
              totalPages={1}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={setRowsPerPage}
              onPageChange={setPage}
              totalItems={filtered.length}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
