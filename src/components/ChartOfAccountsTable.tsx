"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  MoreVertical,
} from "lucide-react";
import { ChartAccount, formatAmount } from "@/lib/types";

interface Props {
  data: ChartAccount[];
  showType: boolean; // true on the "All" tab
  // ids that should start expanded
  defaultExpanded?: Set<string>;
}

export default function ChartOfAccountsTable({
  data,
  showType,
  defaultExpanded,
}: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(
    defaultExpanded ?? new Set()
  );
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const router = useRouter();

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Flatten the tree into visible rows based on expanded state.
  const rows: { account: ChartAccount; level: number }[] = [];
  const walk = (nodes: ChartAccount[], level: number) => {
    for (const account of nodes) {
      rows.push({ account, level });
      if (account.children && expanded.has(account.id)) {
        walk(account.children, level + 1);
      }
    }
  };
  walk(data, 0);

  return (
    <div className="cc-table-wrap overflow-x-auto">
      <table className="cc-table min-w-[760px]">
        <thead>
          <tr className="text-left">
            <th className="cc-th px-6">
              Code
            </th>
            <th className="cc-th">
              Name
            </th>
            {showType && (
              <th className="cc-th">
                Type
              </th>
            )}
            <th className="cc-th text-right">
              Amount
            </th>
            <th className="cc-th w-12" aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {rows.map(({ account, level }) => {
            const hasChildren = !!account.children?.length;
            const isExpanded = expanded.has(account.id);
            const isRoot = level === 0;

            return (
              <tr
                key={account.id}
                className="transition-colors hover:bg-bg-sub/50"
              >
                {/* Code cell with hierarchy */}
                <td className="py-4 pr-4 align-middle">
                  <div
                    className="flex items-center gap-2"
                    style={{ paddingLeft: `${12 + level * 32}px` }}
                  >
                    {hasChildren ? (
                      <button
                        type="button"
                        onClick={() => toggle(account.id)}
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
                    {hasChildren && isExpanded ? (
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
                    )}
                    <span className="text-sm text-text-primary">
                      {account.code}
                    </span>
                  </div>
                </td>

                {/* Name */}
                <td className="px-4 py-4 align-middle">
                  <span
                    className={[
                      "text-sm",
                      isRoot
                        ? "font-semibold uppercase tracking-wide text-text-primary"
                        : "text-text-primary",
                    ].join(" ")}
                  >
                    {account.name}
                  </span>
                </td>

                {/* Type (All tab only) */}
                {showType && (
                  <td className="px-4 py-4 align-middle">
                    <span className="text-sm text-text-secondary">
                      {account.type}
                    </span>
                  </td>
                )}

                {/* Amount */}
                <td className="px-4 py-4 text-right align-middle">
                  <span className="text-sm text-text-primary">
                    {formatAmount(account)}
                  </span>
                </td>

                {/* Actions */}
                <td className="cc-td relative text-right">
                  <button
                    type="button"
                    aria-label={`Actions for ${account.name}`}
                    onClick={() =>
                      setOpenMenu(openMenu === account.id ? null : account.id)
                    }
                    className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-sub"
                  >
                    <MoreVertical size={18} aria-hidden />
                  </button>

                  {openMenu === account.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenu(null)}
                        aria-hidden
                      />
                      <div
                        role="menu"
                        className="absolute right-4 top-12 z-20 w-44 overflow-hidden rounded-lg border border-border bg-surface py-1 text-left shadow-md"
                      >
                        {[
                          { label: "View GL", action: () => router.push(`/accounting/charts-of-account/${account.id}`) },
                          { label: "Edit GL", action: () => router.push(`/accounting/charts-of-account/${account.id}?edit=1`) },
                          { label: "Add child account", action: () => router.push(`/accounting/charts-of-account/create`) },
                          { label: "View transactions", action: () => {} },
                          { label: "Disable GL", action: () => {} },
                        ].map(({ label, action }) => (
                            <button
                              key={label}
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setOpenMenu(null);
                                action();
                              }}
                              className="block w-full px-4 py-2 text-left text-sm text-text-secondary hover:bg-bg-sub"
                            >
                              {label}
                            </button>
                          )
                        )}
                      </div>
                    </>
                  )}
                </td>
              </tr>
            );
          })}

          {rows.length === 0 && (
            <tr>
              <td
                colSpan={showType ? 5 : 4}
                className="px-6 py-16 text-center text-sm text-text-muted"
              >
                No accounts found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
