"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Upload } from "lucide-react";
import PrimaryRail from "@/components/PrimaryRail";
import AccountingSidebar from "@/components/AccountingSidebar";
import { Breadcrumbs } from "@/components/Common";
import GlobalHeader from "@/components/GlobalHeader";
import BalanceSheetTable from "@/components/BalanceSheetTable";
import BalanceSheetFilterModal, {
  BSFilters,
} from "@/components/BalanceSheetFilterModal";
import { PaginationBar } from "@/components/Pagination";
import { BALANCE_SHEET, BSRow } from "@/data/balanceSheet";

const DEFAULT_FILTERS: BSFilters = {
  date: "",
  hideZeroBalance: false,
  level: "",
  branch: "",
  showSelectedLevelOnly: false,
  selectedLevel: "",
};

// Collect every expandable id so the report opens fully expanded (matches screenshot).
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

// Recursively drop accounts whose balance is 0 (and that have no surviving children).
function hideZero(nodes: BSRow[]): BSRow[] {
  const out: BSRow[] = [];
  for (const n of nodes) {
    if (n.kind === "total" || n.kind === "section") {
      const kids = n.children ? hideZero(n.children) : undefined;
      out.push({ ...n, children: kids });
      continue;
    }
    const kids = n.children ? hideZero(n.children) : undefined;
    if (n.balance !== 0 || (kids && kids.length)) {
      out.push({ ...n, children: kids });
    }
  }
  return out;
}

// Search filter keeping parent chains.
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

export default function BalanceSheetPage() {
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<BSFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const data = useMemo(() => {
    let d = BALANCE_SHEET;
    if (filters.hideZeroBalance) d = hideZero(d);
    if (search) d = searchTree(d, search);
    return d;
  }, [filters.hideZeroBalance, search]);

  const defaultExpanded = useMemo(() => allExpandableIds(data), [data]);

  const totalItems = 500;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  return (
    <div className="cc-page">
      <PrimaryRail />
      <AccountingSidebar menuLabel="SUB MENU" />

      <main className="cc-main">
        {/* Header */}
        <GlobalHeader
          title="Accounting"
          crumbs={[
                  { label: "Dashboard", href: "/" },
                  { label: "Accounting", href: "/accounting/charts-of-account" },
                  { label: "Balance Sheet" },
                ]}
        />

        <section className="cc-section">
          <h2 className="cc-page-title">
            Balance Sheet
          </h2>

          {/* Toolbar: search + filter + export (no Create button) */}
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
                aria-label="Search balance sheet"
                className="focus-ring h-10 w-[360px] max-w-full rounded-lg border border-border-strong pl-[42px] pr-3.5 text-sm text-text-primary placeholder:text-text-muted"
              />
            </div>

            <div className="flex items-center gap-2">
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
            </div>
          </div>

          <BalanceSheetTable
            key={`${search}-${filters.hideZeroBalance}`}
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

      <BalanceSheetFilterModal
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
