"use client";

import { useState, Fragment, useEffect, useRef } from "react";
import { ChevronDown, ChevronRight, Check, MoreVertical } from "lucide-react";
import { JournalEntry, money } from "@/data/journal";

function StatusPill({ status }: { status: JournalEntry["status"] }) {
  const styles =
    status === "Approved"
      ? "text-emerald-600"
      : status === "Pending"
      ? "text-amber-600"
      : "text-red-600";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-white px-2.5 py-1 text-xs font-medium">
      <span
        className={[
          "flex h-4 w-4 items-center justify-center rounded-full",
          status === "Approved" ? "bg-emerald-500" : "bg-amber-500",
        ].join(" ")}
      >
        <Check size={11} strokeWidth={3} className="text-white" aria-hidden />
      </span>
      <span className={styles}>{status}</span>
    </span>
  );
}

function DetailPanel({ entry }: { entry: JournalEntry }) {
  const d = entry.detail;
  const info: [string, string][] = [
    ["Level", d.level],
    ["Branch", d.branch],
    ["Notes", d.notes],
    ["Transaction ID", d.transactionId],
    ["Account ID", d.accountId],
  ];

  return (
    <div className="bg-surface-muted/60 px-6 pb-2 pt-5">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Linked To */}
        <div>
          <div className="mb-3 text-sm font-medium text-text-primary">
            Linked To:
          </div>
          <dl className="space-y-3">
            {info.map(([k, v]) => (
              <div key={k} className="flex gap-6 text-sm">
                <dt className="w-28 shrink-0 text-text-muted">{k}</dt>
                <dd className="text-text-primary">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Debit */}
        <div>
          <div className="mb-3 text-sm font-medium text-text-primary">Debit</div>
          {d.debit.map((l) => (
            <div key={l.glCode} className="mb-2 text-sm text-text-secondary">
              {l.glCode} - {l.glName}
            </div>
          ))}
          {d.debit.map((l) => (
            <div key={`amt-${l.glCode}`} className="text-sm text-text-primary">
              {money(l.amount)}
            </div>
          ))}
        </div>

        {/* Credit */}
        <div>
          <div className="mb-3 text-sm font-medium text-text-primary">Credit</div>
          {d.credit.map((l) => (
            <div key={l.glCode} className="mb-2 text-sm text-text-secondary">
              {l.glCode} - {l.glName}
            </div>
          ))}
          {d.credit.map((l) => (
            <div key={`amt-${l.glCode}`} className="text-sm text-text-primary">
              {money(l.amount)}
            </div>
          ))}
        </div>
      </div>

      {/* Total transferred */}
      <div className="mt-5 grid grid-cols-1 gap-8 border-t border-border pt-4 lg:grid-cols-3">
        <div />
        <div className="text-sm font-medium text-text-primary">
          Total amount transferred
        </div>
        <div className="text-sm font-semibold text-text-primary">
          {money(entry.totalAmount)}
        </div>
      </div>
    </div>
  );
}

export default function JournalTable({
  data,
  focusId,
}: {
  data: JournalEntry[];
  focusId?: string;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => (focusId ? new Set([focusId]) : new Set())
  );
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const focusRowRef = useRef<HTMLTableRowElement | null>(null);
  const [flashId, setFlashId] = useState<string | null>(focusId ?? null);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // Scroll the focused row into view and flash a highlight ring briefly.
  useEffect(() => {
    if (!focusId) return;
    setExpanded((prev) => {
      const next = new Set(prev);
      next.add(focusId);
      return next;
    });
    setFlashId(focusId);
    // wait a frame so the row is rendered before scrolling
    const r = requestAnimationFrame(() => {
      focusRowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    const t = setTimeout(() => setFlashId(null), 2400);
    return () => {
      cancelAnimationFrame(r);
      clearTimeout(t);
    };
  }, [focusId]);

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[1100px] border-collapse">
        <thead>
          <tr className="bg-surface-muted text-left">
            <th className="px-6 py-3 text-[13px] font-medium text-text-primary">ID</th>
            <th className="px-4 py-3 text-[13px] font-medium text-text-primary">Entry Time</th>
            <th className="px-4 py-3 text-[13px] font-medium text-text-primary">Total Amount</th>
            <th className="px-4 py-3 text-[13px] font-medium text-text-primary">Transaction Date</th>
            <th className="px-4 py-3 text-[13px] font-medium text-text-primary">User</th>
            <th className="px-4 py-3 text-[13px] font-medium text-text-primary">Category</th>
            <th className="px-4 py-3 text-center text-[13px] font-medium text-text-primary">Status</th>
            <th className="w-12 px-4 py-3" aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {data.map((e) => {
            const isExpanded = expanded.has(e.id);
            const isFocused = e.id === focusId;
            const isFlashing = e.id === flashId;
            return (
              <Fragment key={e.id}>
                <tr
                  ref={isFocused ? focusRowRef : null}
                  className={[
                    "border-b border-border transition-colors",
                    isExpanded ? "bg-surface-muted/40" : "hover:bg-surface-muted/30",
                    isFlashing ? "coreai-row-flash" : "",
                  ].join(" ")}
                >
                  <td className="py-4 pl-6 pr-4 align-middle">
                    <button
                      type="button"
                      onClick={() => toggle(e.id)}
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                      aria-expanded={isExpanded}
                      className="focus-ring flex items-center gap-2 text-sm text-text-primary"
                    >
                      {isExpanded ? (
                        <ChevronDown size={16} className="text-text-secondary" aria-hidden />
                      ) : (
                        <ChevronRight size={16} className="text-text-secondary" aria-hidden />
                      )}
                      {e.id}
                    </button>
                  </td>
                  <td className="px-4 py-4 align-middle text-sm text-text-primary">{e.entryTime}</td>
                  <td className="px-4 py-4 align-middle text-sm text-text-primary">{money(e.totalAmount)}</td>
                  <td className="px-4 py-4 align-middle text-sm text-text-primary">{e.transactionDate}</td>
                  <td className="px-4 py-4 align-middle text-sm text-text-primary">{e.user}</td>
                  <td className="px-4 py-4 align-middle text-sm text-text-primary">{e.category}</td>
                  <td className="px-4 py-4 text-center align-middle">
                    <StatusPill status={e.status} />
                  </td>
                  <td className="relative px-4 py-4 text-right align-middle">
                    <button
                      type="button"
                      aria-label={`Actions for ${e.id}`}
                      onClick={() => setOpenMenu(openMenu === e.id ? null : e.id)}
                      className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-surface-muted"
                    >
                      <MoreVertical size={18} aria-hidden />
                    </button>
                    {openMenu === e.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} aria-hidden />
                        <div role="menu" className="absolute right-4 top-12 z-20 w-44 overflow-hidden rounded-md border border-border bg-white py-1 text-left shadow-[0_8px_24px_rgba(17,24,39,0.12)]">
                          {["View entry", "Edit entry", "Reverse entry", "View transaction"].map((label) => (
                            <button key={label} type="button" role="menuitem" onClick={() => setOpenMenu(null)} className="block w-full px-4 py-2 text-left text-sm text-text-secondary hover:bg-surface-muted">
                              {label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="border-b border-border">
                    <td colSpan={8} className="p-0">
                      <DetailPanel entry={e} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
