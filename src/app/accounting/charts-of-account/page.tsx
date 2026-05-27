"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PrimaryRail from "@/components/PrimaryRail";
import AccountingSidebar from "@/components/AccountingSidebar";
import { Breadcrumbs } from "@/components/Common";
import GlobalHeader from "@/components/GlobalHeader";
import AccountCategoryTabs from "@/components/AccountCategoryTabs";
import ChartsToolbar from "@/components/ChartsToolbar";
import ChartOfAccountsTable from "@/components/ChartOfAccountsTable";
import {
  HorizontalScrollControls,
  PaginationBar,
} from "@/components/Pagination";
import { CHART_OF_ACCOUNTS } from "@/data/accounts";
import { ChartAccount, TabKey, TAB_TO_TYPE, TABS } from "@/lib/types";

function isTabKey(v: string | null): v is TabKey {
  return !!v && TABS.some((t) => t.key === v);
}

// Recursively filter the tree by search term, keeping parent chains of matches.
function filterTree(nodes: ChartAccount[], term: string): ChartAccount[] {
  if (!term) return nodes;
  const t = term.toLowerCase();
  const result: ChartAccount[] = [];
  for (const node of nodes) {
    const selfMatch =
      node.code.toLowerCase().includes(t) ||
      node.name.toLowerCase().includes(t) ||
      node.type.toLowerCase().includes(t);
    const kids = node.children ? filterTree(node.children, term) : [];
    if (selfMatch || kids.length) {
      result.push({ ...node, children: kids.length ? kids : node.children });
    }
  }
  return result;
}

// Collect all expandable ids (so search results / category tabs show expanded).
function allExpandableIds(nodes: ChartAccount[]): Set<string> {
  const set = new Set<string>();
  const walk = (ns: ChartAccount[]) => {
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

function ChartsOfAccountInner() {
  const router = useRouter();
  const params = useSearchParams();
  const tabParam = params.get("tab");
  const activeTab: TabKey = isTabKey(tabParam) ? tabParam : "all";

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  // Reset to page 1 whenever tab/search/rows change (spec 16.1)
  useEffect(() => {
    setPage(1);
  }, [activeTab, search, rowsPerPage]);

  const setTab = (t: TabKey) => {
    router.push(
      t === "all"
        ? "/accounting/charts-of-account"
        : `/accounting/charts-of-account?tab=${t}`
    );
  };

  const showType = activeTab === "all";

  // Base data filtered by the active category tab.
  const typeFiltered = useMemo(() => {
    const type = TAB_TO_TYPE[activeTab];
    if (!type) return CHART_OF_ACCOUNTS;
    return CHART_OF_ACCOUNTS.filter((a) => a.type === type);
  }, [activeTab]);

  // On "All" tab show only roots (collapsed). On category tabs show full tree.
  const baseData = useMemo(() => {
    if (showType) {
      // strip children so All tab shows collapsed roots only,
      // but keep the children available for expansion
      return typeFiltered;
    }
    return typeFiltered;
  }, [typeFiltered, showType]);

  const searched = useMemo(
    () => filterTree(baseData, search),
    [baseData, search]
  );

  // Expansion defaults: All tab = collapsed; category tabs = expanded;
  // when searching, expand everything to reveal matches.
  const defaultExpanded = useMemo(() => {
    if (search) return allExpandableIds(searched);
    if (showType) return new Set<string>();
    return allExpandableIds(searched);
  }, [search, showType, searched]);

  // Pagination operates on the top-level (root) rows of the current view.
  const totalItems = 500; // matches the screenshot's "of 500"
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  // The "All" tab keeps children for expansion; remount table when the
  // expansion baseline changes so defaults apply.
  const tableKey = `${activeTab}-${search}`;

  return (
    <div className="min-h-screen bg-white">
      <PrimaryRail />
      <AccountingSidebar />

      {/* Content offset: 66px rail + 250px sidebar */}
      <main className="ml-[316px]">
        {/* Header */}
        <GlobalHeader
          title="Accounting"
          crumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Accounting", href: "/accounting/charts-of-account" },
            { label: "Charts of Account" },
          ]}
        />

        {/* Tabs */}
        <AccountCategoryTabs active={activeTab} onChange={setTab} />

        {/* Section */}
        <section className="px-10 pb-10 pt-6">
          <h2 className="text-xl font-semibold text-text-primary">
            Charts of Account
          </h2>

          <ChartsToolbar search={search} onSearch={setSearch} />

          <ChartOfAccountsTable
            key={tableKey}
            data={searched}
            showType={showType}
            defaultExpanded={defaultExpanded}
          />

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
    </div>
  );
}

export default function ChartsOfAccountPage() {
  return (
    <Suspense fallback={<div className="ml-[316px] p-10 text-sm text-text-muted">Loading…</div>}>
      <ChartsOfAccountInner />
    </Suspense>
  );
}
