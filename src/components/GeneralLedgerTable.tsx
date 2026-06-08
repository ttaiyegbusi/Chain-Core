"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, MoreVertical } from "lucide-react";
import { GLTransaction } from "@/data/generalLedgerReport";

interface Props {
  transactions: GLTransaction[];
  onExport?: () => void;
}

export default function GeneralLedgerTable({ transactions }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatAmount = (amt: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amt);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-muted">
              <th className="px-5 py-3 text-left text-xs font-semibold text-text-secondary">
                Date
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-text-secondary">
                Description
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-text-secondary">
                GL Code
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-text-secondary">
                Account Name
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-text-secondary">
                Debit
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-text-secondary">
                Credit
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-text-secondary">
                Running Balance
              </th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-text-secondary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                className="hover:bg-surface-muted transition-colors"
              >
                <td className="px-5 py-3 text-sm text-text-primary">
                  {tx.date}
                </td>
                <td className="px-5 py-3 text-sm text-text-primary">
                  {tx.description}
                </td>
                <td className="px-5 py-3 text-sm font-medium text-text-primary">
                  {tx.glCode}
                </td>
                <td className="px-5 py-3 text-sm text-text-secondary">
                  {tx.glName}
                </td>
                <td className="px-5 py-3 text-right text-sm text-text-primary">
                  {tx.debit > 0 ? formatAmount(tx.debit) : "—"}
                </td>
                <td className="px-5 py-3 text-right text-sm text-text-primary">
                  {tx.credit > 0 ? formatAmount(tx.credit) : "—"}
                </td>
                <td className="px-5 py-3 text-right text-sm font-medium text-text-primary">
                  {formatAmount(tx.runningBalance)}
                </td>
                <td className="px-5 py-3 text-center">
                  <button
                    type="button"
                    aria-label="More actions"
                    className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-border text-text-secondary"
                  >
                    <MoreVertical size={16} aria-hidden />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
