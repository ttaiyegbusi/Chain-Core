"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Upload } from "lucide-react";
import PrimaryRail from "@/components/PrimaryRail";
import AccountingSidebar from "@/components/AccountingSidebar";
import GlobalHeader from "@/components/GlobalHeader";
import BalanceSheetTable from "@/components/BalanceSheetTable";
import { PaginationBar } from "@/components/Pagination";
import { BSRow } from "@/data/balanceSheet";
import { INCOME_EXPENSES } from "@/data/incomeExpenses";

/**
 * Income & Expenses
 *
 * Reuses BalanceSheetTable + BSRow (consistent hierarchical layout across
 * the accounting module). Currency is USD ($) per the design reference.
 * Filter and Export are styled but inert by design.
 */

// Initial expansion mirrors the screenshot: the high-level groups
// (Income → 300000 → Interest Income, Expenses → 400000) are open,
// but Processing Fees / Penalty stay collapsed.
const INITIAL_EXPANDED = new Set<string>([
  "income",
  "300000",
  "300100",
  "300200",
  "expenses",
  "400000",
]);

// Search keeping parent chains visible (same behaviour as Balance Sheet).
function searchTree(nodes: BSRow[], term: string): BSRow[] {
  if (!term) return nodes;
  const t = term.toLowerCase();
  const out: BSRow[] = [];
  for (const n of nodes) {
    if (n.kind === "total") continue;
    const selfMatch =
      n.name.toLowerCase().includes(t) ||
      (n.code ?? "").toLowerCase().includes(t);
    const kids = n.children ? searchTree(n.children, term) : [];
    if (selfMatch || kids.length) {
      out.push({ ...n, children: kids.length ? kids : n.children });
    }
  }
  return out;
}

// When the user searches, open the whole resulting tree so matches are visible.
function allExpandableIds(nodes: BSRow[]): Set<string> {
  const set = new Set<string>();
  const walk = (ns: BSRow[]) => {
    for (const n of ns) {
      if (n.children?.length) {
        set.add(n.id);
        walk(n.children);
      }
    }
  };
  walk(nodes);
  return set;
}

export default function IncomeExpensesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const data = useMemo(
    () => (search ? searchTree(INCOME_EXPENSES, search) : INCOME_EXPENSES),
    [search]
  );

  const defaultExpanded = useMemo(
    () => (search ? allExpandableIds(data) : INITIAL_EXPANDED),
    [data, search]
  );

  const totalItems = 500;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  return (
    <div className="min-h-screen bg-white">
      <PrimaryRail />
      <AccountingSidebar menuLabel="SUB MENU" />

      <main className="ml-[316px]">
        <GlobalHeader
          title="Accounting"
          crumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Accounting", href: "/accounting/charts-of-account" },
            { label: "Income & Expenses" },
          ]}
        />

        <section className="px-10 pb-10 pt-6">
          <h2 className="text-xl font-semibold text-text-primary">
            Income &amp; Expenses
          </h2>

          {/* Toolbar: search + filter + export */}
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
                aria-label="Search income and expenses"
                className="focus-ring h-10 w-[360px] max-w-full rounded-md border border-border-strong pl-[42px] pr-3.5 text-sm text-text-primary placeholder:text-text-muted"
              />
            </div>

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
            </div>
          </div>

          <BalanceSheetTable
            key={search}
            data={data}
            defaultExpanded={defaultExpanded}
          />

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
    </div>
  );
}
