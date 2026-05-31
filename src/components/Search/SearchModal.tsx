"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search as SearchIcon,
  X,
  FileText,
  Paperclip,
  ExternalLink,
} from "lucide-react";
import { useSearch } from "./SearchProvider";
import {
  CONTACTS,
  DOCUMENTS,
  LINKS,
  BRANCHES,
  SEARCH_QUERY,
  type ContactResult,
  type DocumentResult,
  type LinkResult,
  type BranchResult,
} from "@/data/searchResults";

/**
 * Global Search modal.
 *
 * Faithful to Figma node 971-46925, with banking-context content:
 *  - 600×~750 floating panel, centered, no backdrop (per project convention)
 *  - Smooth ~420ms open/close on opacity + translate-Y
 *  - Search input at top with magnifying-glass icon
 *  - Four filter chips (Contact / Documents / Links / Branches) — clicking
 *    one filters the visible sections; clicking again restores all
 *  - Result sections: Contact, Documents, Links, Branches — each with the
 *    [ N ] count, the row icon, two-line content, right-side × close action
 *  - Live filtering: as the user types, every result re-filters
 *  - Footer: "Open Search Page"
 *  - Esc closes
 */

const ALL_FILTERS = ["Contact", "Documents", "Links", "Branches"] as const;
type Filter = (typeof ALL_FILTERS)[number];

export default function SearchModal() {
  const { isOpen, close } = useSearch();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  const [query, setQuery] = useState(SEARCH_QUERY);
  // Active filters — empty means "show all groups".
  const [activeFilters, setActiveFilters] = useState<Set<Filter>>(new Set());
  // Dismissed result ids (per session) so the × actually removes a row.
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  // Two-step mount so the open transition animates.
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const r = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(r);
    } else if (mounted) {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 240);
      return () => clearTimeout(t);
    }
  }, [isOpen, mounted]);

  // Reset transient state when closed.
  useEffect(() => {
    if (!isOpen) {
      setQuery(SEARCH_QUERY);
      setActiveFilters(new Set());
      setDismissed(new Set());
    }
  }, [isOpen]);

  // Esc closes.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  // Filtering helpers.
  const q = query.trim().toLowerCase();
  const matches = (text: string) => !q || text.toLowerCase().includes(q);
  const isVisibleGroup = (f: Filter) =>
    activeFilters.size === 0 || activeFilters.has(f);

  const contacts = useMemo(
    () =>
      CONTACTS.filter(
        (c) =>
          !dismissed.has(c.id) &&
          (matches(c.name) ||
            matches(c.accountNumber) ||
            matches(c.loanType))
      ),
    [q, dismissed]
  );
  const documents = useMemo(
    () =>
      DOCUMENTS.filter(
        (d) => !dismissed.has(d.id) && (matches(d.filename) || matches(d.module))
      ),
    [q, dismissed]
  );
  const links = useMemo(
    () => LINKS.filter((l) => !dismissed.has(l.id) && matches(l.url)),
    [q, dismissed]
  );
  const branches = useMemo(
    () =>
      BRANCHES.filter(
        (b) => !dismissed.has(b.id) && (matches(b.name) || matches(b.city))
      ),
    [q, dismissed]
  );

  const dismiss = (id: string) =>
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

  const toggleFilter = (f: Filter) =>
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });

  if (!mounted) return null;

  const totalVisible =
    (isVisibleGroup("Contact") ? contacts.length : 0) +
    (isVisibleGroup("Documents") ? documents.length : 0) +
    (isVisibleGroup("Links") ? links.length : 0) +
    (isVisibleGroup("Branches") ? branches.length : 0);

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="search-title"
      style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
      className={[
        "fixed left-1/2 top-[85px] z-40 -translate-x-1/2",
        "flex w-[600px] max-w-[calc(100vw-40px)] flex-col rounded-2xl bg-white",
        "shadow-[0px_24px_56px_rgba(17,24,39,0.18),0px_2px_8px_rgba(17,24,39,0.05)] ring-1 ring-[#EBEBEB]",
        "transition-[opacity,transform] duration-[420ms]",
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-2 opacity-0 pointer-events-none",
      ].join(" ")}
    >
      <h2 id="search-title" className="sr-only">
        Search ChainCore
      </h2>

      {/* Search input */}
      <div className="px-3 pt-3">
        <div className="flex h-12 items-center gap-3 rounded-xl px-3">
          <SearchIcon size={18} className="text-[#5C5C5C]" aria-hidden />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            placeholder="Search customers, documents, links and branches"
            aria-label="Search"
            className="flex-1 bg-transparent text-[14px] tracking-[-0.02em] text-[#171717] placeholder:text-[#A3A3A3] focus:outline-none"
          />
          <button
            type="button"
            onClick={close}
            aria-label="Close search"
            className="focus-ring flex h-8 w-8 items-center justify-center rounded-md border border-[#EBEBEB] bg-[#F7F7F7] text-[#5C5C5C] transition-colors hover:bg-[#EFEFEF]"
          >
            <X size={14} aria-hidden />
          </button>
        </div>

        {/* Filter chips */}
        <div className="mt-2 flex flex-wrap gap-2 px-3 pb-3">
          {ALL_FILTERS.map((f) => {
            const active = activeFilters.has(f);
            return (
              <button
                key={f}
                type="button"
                onClick={() => toggleFilter(f)}
                aria-pressed={active}
                className={[
                  "focus-ring inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-[12px] transition-colors",
                  active
                    ? "border-[#3157F6] bg-[#EEF2FF] text-[#3157F6]"
                    : "border-[#EBEBEB] bg-white text-[#525866] hover:bg-[#FAFAFA]",
                ].join(" ")}
              >
                {f}
                <X size={12} aria-hidden className="opacity-60" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Results — scrollable body */}
      <div className="max-h-[560px] flex-1 overflow-y-auto border-t border-[#F0F0F0] px-6 py-4">
        {totalVisible === 0 ? (
          <p className="py-12 text-center text-[13px] text-[#A3A3A3]">
            No results for &ldquo;{query}&rdquo;.
          </p>
        ) : (
          <>
            {isVisibleGroup("Contact") && contacts.length > 0 && (
              <ResultSection title="Contact" count={contacts.length}>
                {contacts.map((c) => (
                  <ContactRow key={c.id} item={c} onDismiss={() => dismiss(c.id)} />
                ))}
              </ResultSection>
            )}
            {isVisibleGroup("Documents") && documents.length > 0 && (
              <ResultSection title="Documents" count={documents.length}>
                {documents.map((d) => (
                  <DocumentRow key={d.id} item={d} onDismiss={() => dismiss(d.id)} />
                ))}
              </ResultSection>
            )}
            {isVisibleGroup("Links") && links.length > 0 && (
              <ResultSection title="Links" count={links.length}>
                {links.map((l) => (
                  <LinkRow key={l.id} item={l} onDismiss={() => dismiss(l.id)} />
                ))}
              </ResultSection>
            )}
            {isVisibleGroup("Branches") && branches.length > 0 && (
              <ResultSection title="Branches" count={branches.length}>
                {branches.map((b) => (
                  <BranchRow key={b.id} item={b} onDismiss={() => dismiss(b.id)} />
                ))}
              </ResultSection>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <button
        type="button"
        className="focus-ring flex h-[44px] items-center gap-2 border-t border-[#F0F0F0] px-6 text-[14px] text-[#171717] transition-colors hover:bg-[#FAFAFA]"
      >
        <ExternalLink size={16} className="text-[#3157F6]" aria-hidden />
        Open Search Page
      </button>
    </div>
  );
}

/* ----------------------------------------------------------- result section */

function ResultSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-5 last:mb-0">
      <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.06em] text-[#A3A3A3]">
        {title} [ {count} ]
      </p>
      <ul className="flex flex-col gap-3">{children}</ul>
    </section>
  );
}

/* ---------------------------------------------------------------- row types */

function RowShell({
  iconNode,
  primary,
  secondary,
  onDismiss,
}: {
  iconNode: React.ReactNode;
  primary: React.ReactNode;
  secondary: React.ReactNode;
  onDismiss: () => void;
}) {
  return (
    <li className="flex items-center gap-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[3px] border border-[#EBEBEB] bg-[#F7F7F7]">
        {iconNode}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="truncate text-[13px] font-medium tracking-[-0.02em] text-[#171717]">
          {primary}
        </div>
        <div className="truncate text-[12px] text-[#7C7C7C]">{secondary}</div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="focus-ring flex h-6 w-6 shrink-0 items-center justify-center rounded text-[#A3A3A3] transition-colors hover:bg-[#F7F7F7] hover:text-[#525866]"
      >
        <X size={12} aria-hidden />
      </button>
    </li>
  );
}

function ContactRow({
  item,
  onDismiss,
}: {
  item: ContactResult;
  onDismiss: () => void;
}) {
  return (
    <RowShell
      iconNode={
        <span className="font-mono text-[11px] leading-none text-[#171717]">
          {item.initial}
        </span>
      }
      primary={item.name}
      secondary={
        <>
          {item.accountNumber}
          <span className="mx-1.5 text-[#D1D5DB]">·</span>
          {item.loanType}
        </>
      }
      onDismiss={onDismiss}
    />
  );
}

function DocumentRow({
  item,
  onDismiss,
}: {
  item: DocumentResult;
  onDismiss: () => void;
}) {
  return (
    <RowShell
      iconNode={<FileText size={14} className="text-[#5C5C5C]" aria-hidden />}
      primary={item.filename}
      secondary={
        <>
          in {item.module}
          <span className="mx-1.5 inline-block h-1 w-1 rounded-full bg-[#A3A3A3] align-middle" />
          {item.edited}
        </>
      }
      onDismiss={onDismiss}
    />
  );
}

function LinkRow({
  item,
  onDismiss,
}: {
  item: LinkResult;
  onDismiss: () => void;
}) {
  return (
    <li className="flex items-center gap-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[3px] border border-[#EBEBEB] bg-[#F7F7F7]">
        <Paperclip size={14} className="text-[#5C5C5C]" aria-hidden />
      </div>
      <div className="min-w-0 flex-1 truncate text-[13px] text-[#171717]">
        https://{item.url}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="focus-ring flex h-6 w-6 shrink-0 items-center justify-center rounded text-[#A3A3A3] transition-colors hover:bg-[#F7F7F7] hover:text-[#525866]"
      >
        <X size={12} aria-hidden />
      </button>
    </li>
  );
}

function BranchRow({
  item,
  onDismiss,
}: {
  item: BranchResult;
  onDismiss: () => void;
}) {
  return (
    <RowShell
      iconNode={
        <span className="font-mono text-[11px] leading-none text-[#171717]">
          {item.initial}
        </span>
      }
      primary={item.name}
      secondary={
        <>
          {item.city}
          <span className="mx-1.5 text-[#D1D5DB]">·</span>
          {item.staff} staff
        </>
      }
      onDismiss={onDismiss}
    />
  );
}
