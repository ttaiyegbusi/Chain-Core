"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  Upload,
  ChevronDown,
  UserCircle2,
  Building2,
  Home as HomeIcon,
  Users,
} from "lucide-react";
import PrimaryRail from "@/components/PrimaryRail";
import ClientsSidebar from "@/components/ClientsSidebar";
import GlobalHeader from "@/components/GlobalHeader";
import ClientsTable, { StatusTabs } from "@/components/ClientsTable";
import ClientsOverviewStats from "@/components/ClientsOverviewStats";
import CreateClientWizard from "@/components/CreateClientWizard";
import { PaginationBar } from "@/components/Pagination";
import {
  Client,
  ClientStatus,
  OVERVIEW_STATS,
} from "@/data/clients";

interface Props {
  /** Page title — e.g. "Individual Clients" */
  title: string;
  /** Sub-header above the stats — e.g. "Individual Clients Overview" */
  overviewTitle: string;
  /** Full client list for this type (filtered locally by tab + search). */
  clients: Client[];
  /** Base path each row links to — e.g. "/clients/individual" */
  detailBasePath: string;
  /** Whether to render the Gender + DoB columns (false for Corporate / Center). */
  showPersonalColumns?: boolean;
  /** Optional currently-selected sub-menu item (just affects breadcrumb). */
  crumbLast: string;
}

const CREATE_OPTIONS = [
  { label: "Individual Client", icon: UserCircle2, kind: "Individual" as const },
  { label: "Corporate Client", icon: Building2, kind: "Corporate" as const },
  { label: "Center", icon: HomeIcon, kind: "Center" as const },
  { label: "Persons", icon: Users, kind: "Individual" as const },
];

export default function ClientsListPage({
  title,
  overviewTitle,
  clients,
  detailBasePath,
  showPersonalColumns = true,
  crumbLast,
}: Props) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"All" | ClientStatus>("All");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [wizardKind, setWizardKind] = useState<"Individual" | "Corporate" | "Center" | null>(null);

  // Create-dropdown state.
  const [createOpen, setCreateOpen] = useState(false);
  const createRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!createOpen) return;
    const onDown = (e: MouseEvent) => {
      if (createRef.current && !createRef.current.contains(e.target as Node)) {
        setCreateOpen(false);
      }
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [createOpen]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients.filter((c) => {
      if (tab !== "All" && c.status !== tab) return false;
      if (
        q &&
        !(
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.clientId.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q)
        )
      ) {
        return false;
      }
      return true;
    });
  }, [clients, search, tab]);

  const totalItems = 500; // matches the design's "of 500" label
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  return (
    <div className="min-h-screen bg-white">
      <PrimaryRail />
      <ClientsSidebar menuLabel="SUB MENU" />

      <main className="ml-[316px]">
        <GlobalHeader
          title={title}
          crumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Clients", href: "/clients/individual" },
            { label: crumbLast },
          ]}
        />

        <section className="px-10 pb-10 pt-6">
          {/* Overview header + date range dropdowns */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-text-primary">
              {overviewTitle}
            </h2>
            <div className="flex items-center gap-2">
              <PillDropdown label="This Week" />
              <PillDropdown label="Feb. 10th, 2025 - Feb. 20th, 2025" />
            </div>
          </div>

          {/* Stats row */}
          <ClientsOverviewStats stats={OVERVIEW_STATS} />

          {/* Status tabs */}
          <StatusTabs active={tab} onChange={setTab} />

          {/* Search + filter + export + Create dropdown */}
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
                aria-label="Search clients"
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

              {/* Create New Client — split with chevron */}
              <div ref={createRef} className="relative">
                <button
                  type="button"
                  onClick={() => setCreateOpen((o) => !o)}
                  aria-haspopup="menu"
                  aria-expanded={createOpen}
                  className="focus-ring inline-flex h-10 items-center gap-2 rounded-md bg-primary px-3.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
                >
                  Create New Client
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${createOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>
                {createOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-[calc(100%+6px)] z-20 w-[200px] overflow-hidden rounded-lg border border-border bg-white py-1 shadow-[0_12px_32px_rgba(17,24,39,0.12)]"
                  >
                    {CREATE_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => {
                            setCreateOpen(false);
                            setWizardKind(opt.kind);
                          }}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-text-primary transition-colors hover:bg-surface-muted"
                          role="menuitem"
                        >
                          <Icon size={16} className="text-text-secondary" aria-hidden />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <ClientsTable
            clients={filtered}
            detailBasePath={detailBasePath}
            showPersonalColumns={showPersonalColumns}
          />

          {/* Pagination */}
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

      {wizardKind && (
        <CreateClientWizard
          open={!!wizardKind}
          kind={wizardKind}
          onClose={() => setWizardKind(null)}
        />
      )}
    </div>
  );
}

/** Pill-style dropdown used for the "This Week" and date-range pickers. */
function PillDropdown({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-border-strong bg-white px-3 text-sm text-text-primary transition-colors hover:bg-surface-muted"
    >
      {label}
      <ChevronDown size={15} className="text-text-secondary" aria-hidden />
    </button>
  );
}
