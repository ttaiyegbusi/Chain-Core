"use client";

import { useState, Fragment } from "react";
import { ChevronDown, ChevronRight, Check, MoreVertical } from "lucide-react";
import { JournalEntry, money } from "@/data/journal";

function StatusPill({ status }: { status: JournalEntry["status"] }) {
  const styles =
    status === "Approved"
      ? "text-success"
      : status === "Pending"
      ? "text-warning"
      : "text-danger";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-success-soft px-2.5 py-1 text-xs font-semibold">
      <span
        className={[
          "flex h-4 w-4 items-center justify-center rounded-full",
          status === "Approved" ? "bg-success" : "bg-warning",
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
    <div className="bg-bg-sub px-6 pb-2 pt-5">
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

export default function JournalTable({ data }: { data: JournalEntry[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div className="cc-table-wrap overflow-x-auto">
      <table className="cc-table min-w-[1100px]">
        <thead>
          <tr className="text-left">
            <th className="cc-th px-6">ID</th>
            <th className="cc-th">Entry Time</th>
            <th className="cc-th">Total Amount</th>
            <th className="cc-th">Transaction Date</th>
            <th className="cc-th">User</th>
            <th className="cc-th">Category</th>
            <th className="cc-th text-center">Status</th>
            <th className="cc-th w-12" aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {data.map((e) => {
            const isExpanded = expanded.has(e.id);
            return (
              <Fragment key={e.id}>
                <tr
                  className={[
                    "transition-colors",
                    isExpanded ? "bg-surface-muted/40" : "hover:bg-bg-sub/30",
                  ].join(" ")}
                >
                  <td className="cc-td pl-6 pr-4">
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
                  <td className="cc-td">{e.entryTime}</td>
                  <td className="cc-td">{money(e.totalAmount)}</td>
                  <td className="cc-td">{e.transactionDate}</td>
                  <td className="cc-td">{e.user}</td>
                  <td className="cc-td">{e.category}</td>
                  <td className="cc-td text-center">
                    <StatusPill status={e.status} />
                  </td>
                  <td className="cc-td relative text-right">
                    <button
                      type="button"
                      aria-label={`Actions for ${e.id}`}
                      onClick={() => setOpenMenu(openMenu === e.id ? null : e.id)}
                      className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-sub"
                    >
                      <MoreVertical size={18} aria-hidden />
                    </button>
                    {openMenu === e.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} aria-hidden />
                        <div role="menu" className="absolute right-4 top-12 z-20 w-44 overflow-hidden rounded-lg border border-border bg-surface py-1 text-left shadow-md">
                          {["View entry", "Edit entry", "Reverse entry", "View transaction"].map((label) => (
                            <button key={label} type="button" role="menuitem" onClick={() => setOpenMenu(null)} className="block w-full px-4 py-2 text-left text-sm text-text-secondary hover:bg-bg-sub">
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
