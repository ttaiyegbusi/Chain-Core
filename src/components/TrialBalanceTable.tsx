"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react";
import { TBRow, fmt } from "@/data/trialBalance";

export default function TrialBalanceTable({
  data,
  defaultExpanded,
}: {
  data: TBRow[];
  defaultExpanded: Set<string>;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(defaultExpanded);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const rows: TBRow[] = [];
  const walk = (nodes: TBRow[]) => {
    for (const n of nodes) {
      rows.push(n);
      if (n.children && expanded.has(n.id)) walk(n.children);
    }
  };
  walk(data);

  const numCell = (v: string, bold = false) => (
    <td
      className={[
        "px-4 py-3.5 text-right align-middle text-sm",
        bold ? "font-semibold text-text-primary" : "text-text-secondary",
      ].join(" ")}
    >
      {v}
    </td>
  );

  return (
    <div className="cc-table-wrap overflow-x-auto">
      <table className="cc-table min-w-[1100px]">
        <thead>
          <tr className="text-left">
            <th className="cc-th px-6">
              Code
            </th>
            <th className="cc-th">
              Account Name
            </th>
            <th className="cc-th text-right">
              Opening Balance
            </th>
            <th className="cc-th text-right">
              Debit
            </th>
            <th className="cc-th text-right">
              Credit
            </th>
            <th className="cc-th text-right">
              Net Change
            </th>
            <th className="cc-th px-6 text-right">
              Closing Balance
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const hasChildren = !!row.children?.length;
            const isExpanded = expanded.has(row.id);

            // Grand total: gray band, only Debit + Credit shown, bold.
            if (row.kind === "total") {
              return (
                <tr key={row.id} className="bg-surface-muted">
                  <td
                    className="px-6 py-4 text-sm font-semibold text-text-primary"
                    colSpan={3}
                  >
                    {row.name}
                  </td>
                  {numCell(fmt(row.debit), true)}
                  {numCell(fmt(row.credit), true)}
                  <td colSpan={2} />
                </tr>
              );
            }

            const isSection = row.kind === "section";

            return (
              <tr
                key={row.id}
                className={[
                  "transition-colors",
                  isSection ? "bg-surface-muted/60" : "hover:bg-bg-sub/40",
                ].join(" ")}
              >
                {/* Code cell */}
                <td className="py-3.5 pr-4 align-middle">
                  <div
                    className="flex items-center gap-2"
                    style={{ paddingLeft: `${12 + row.level * 32}px` }}
                  >
                    {hasChildren ? (
                      <button
                        type="button"
                        onClick={() => toggle(row.id)}
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                        aria-expanded={isExpanded}
                        className="focus-ring flex h-5 w-5 items-center justify-center rounded text-text-secondary"
                      >
                        {isExpanded ? (
                          <ChevronDown size={16} aria-hidden />
                        ) : (
                          <ChevronRight size={16} aria-hidden />
                        )}
                      </button>
                    ) : (
                      <span className="h-5 w-5" />
                    )}

                    {!isSection &&
                      (hasChildren && isExpanded ? (
                        <FolderOpen
                          size={16}
                          className="text-text-secondary"
                          aria-hidden
                        />
                      ) : (
                        <Folder
                          size={16}
                          className="text-text-secondary"
                          aria-hidden
                        />
                      ))}

                    <span
                      className={[
                        "text-sm",
                        isSection
                          ? "font-semibold text-text-primary"
                          : "text-text-primary",
                      ].join(" ")}
                    >
                      {isSection ? row.name : row.code}
                    </span>
                  </div>
                </td>

                {/* Account name (blank for section rows) */}
                <td className="px-4 py-3.5 align-middle">
                  {!isSection && (
                    <span className="text-sm text-text-primary">{row.name}</span>
                  )}
                </td>

                {numCell(fmt(row.opening))}
                {numCell(fmt(row.debit))}
                {numCell(fmt(row.credit))}
                {numCell(fmt(row.netChange))}
                {numCell(fmt(row.closing))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
