"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Upload } from "lucide-react";
import PrimaryRail from "@/components/PrimaryRail";
import AccountingSidebar from "@/components/AccountingSidebar";
import { Breadcrumbs } from "@/components/Common";
import GlobalHeader from "@/components/GlobalHeader";
import TrialBalanceTable from "@/components/TrialBalanceTable";
import BalanceSheetFilterModal, {
  BSFilters,
} from "@/components/BalanceSheetFilterModal";
import { PaginationBar } from "@/components/Pagination";
import { TRIAL_BALANCE, TBRow } from "@/data/trialBalance";

const DEFAULT_FILTERS: BSFilters = {
  date: "",
  hideZeroBalance: false,
  level: "",
  branch: "",
  showSelectedLevelOnly: false,
  selectedLevel: "",
};

function allExpandableIds(nodes: TBRow[]): Set<string> {
  const set = new Set<string>();
  const walk = (ns: TBRow[]) => {
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

function searchTree(nodes: TBRow[], term: string): TBRow[] {
  if (!term) return nodes;
  const t = term.toLowerCase();
  const out: TBRow[] = [];
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

export default function TrialBalancePage() {
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<BSFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const data = useMemo(
    () => (search ? searchTree(TRIAL_BALANCE, search) : TRIAL_BALANCE),
    [search]
  );
  const defaultExpanded = useMemo(() => allExpandableIds(data), [data]);

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
                  { label: "TrialBalance Sheet" },
                ]}
        />

        <section className="cc-section">
          <h2 className="cc-page-title">
            Trial Balance Sheet
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
                aria-label="Search trial balance"
                className="focus-ring h-10 w-[460px] max-w-full rounded-lg border border-border-strong pl-[42px] pr-3.5 text-sm text-text-primary placeholder:text-text-muted"
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

          <TrialBalanceTable
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
