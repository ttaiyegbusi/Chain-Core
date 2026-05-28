"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react";
import { BSRow, formatBalance } from "@/data/balanceSheet";

export default function BalanceSheetTable({
  data,
  defaultExpanded,
}: {
  data: BSRow[];
  defaultExpanded: Set<string>;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(defaultExpanded);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // Flatten visible rows by expansion state.
  const rows: BSRow[] = [];
  const walk = (nodes: BSRow[]) => {
    for (const n of nodes) {
      rows.push(n);
      if (n.children && expanded.has(n.id)) walk(n.children);
    }
  };
  walk(data);

  return (
    <div className="cc-table-wrap overflow-x-auto">
      <table className="cc-table min-w-[760px]">
        <thead>
          <tr className="text-left">
            <th className="cc-th px-6">
              Code
            </th>
            <th className="cc-th">
              Account Name
            </th>
            <th className="cc-th px-6 text-right">
              Balance
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const hasChildren = !!row.children?.length;
            const isExpanded = expanded.has(row.id);

            // Total summary row: full-width gray band, bold.
            if (row.kind === "total") {
              return (
                <tr key={row.id} className="bg-surface-muted">
                  <td
                    className="px-6 py-3.5 text-sm font-semibold text-text-primary"
                    colSpan={2}
                  >
                    {row.name}
                  </td>
                  <td className="px-6 py-3.5 text-right text-sm font-semibold text-text-primary">
                    {formatBalance(row.balance)}
                  </td>
                </tr>
              );
            }

            const isSection = row.kind === "section";

            return (
              <tr
                key={row.id}
                className="transition-colors hover:bg-bg-sub/40"
              >
                {/* Code cell with chevron + folder + indentation */}
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

                    {/* Section rows have no folder icon, just bold label */}
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

                {/* Account name (blank for section rows, which show name in code col) */}
                <td className="px-4 py-3.5 align-middle">
                  {!isSection && (
                    <span className="text-sm text-text-primary">{row.name}</span>
                  )}
                </td>

                {/* Balance */}
                <td className="px-6 py-3.5 text-right align-middle">
                  <span className="text-sm text-text-primary">
                    {formatBalance(row.balance)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
