"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronDown,
  MoreVertical,
  Calendar,
  Info,
} from "lucide-react";
import PrimaryRail from "@/components/PrimaryRail";
import AccountingSidebar from "@/components/AccountingSidebar";
import { Breadcrumbs } from "@/components/Common";
import { SectionAccordion } from "@/components/FormControls";
import SuccessModal from "@/components/SuccessModal";

interface JournalRow {
  id: number;
  account: string;
  debit: number | null;
  credit: number | null;
}

const ACCOUNT_OPTIONS = [
  "1110 - Cash - M",
  "2110 - Payroll Payable",
  "1001100 - WEMA BANK",
  "1001200 - BUDPAY",
  "100600 - Building at Lekki",
  "201400 - Wema",
];

function money(n: number): string {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

let nextId = 3;

export default function CreateManualJournalPage() {
  const router = useRouter();
  const [rows, setRows] = useState<JournalRow[]>([
    { id: 1, account: "", debit: null, credit: null },
    { id: 2, account: "", debit: null, credit: null },
  ]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [branch, setBranch] = useState("");
  const [level, setLevel] = useState("");
  const [txnDate, setTxnDate] = useState("");
  const [notes, setNotes] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const totalDebit = rows.reduce((s, r) => s + (r.debit ?? 0), 0);
  const totalCredit = rows.reduce((s, r) => s + (r.credit ?? 0), 0);
  const hasValues = rows.some((r) => r.debit || r.credit);

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { id: nextId++, account: "", debit: null, credit: null },
    ]);

  const updateRow = (id: number, patch: Partial<JournalRow>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const removeRow = (id: number) =>
    setRows((prev) => prev.filter((r) => r.id !== id));

  const toggleSelect = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const allSelected = rows.length > 0 && selected.size === rows.length;

  return (
    <div className="cc-page">
      <PrimaryRail />
      <AccountingSidebar menuLabel="SUB MENU" />

      <main className="ml-[316px] pb-16">
        {/* Title bar */}
        <header className="flex h-[70px] items-center justify-between border-b border-border pl-10 pr-11">
          <h1 className="text-lg font-semibold text-text-primary">
            Create Manual Journal Entry
          </h1>
        </header>

        {/* Breadcrumb + Create */}
        <div className="flex items-center justify-between px-10 pt-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="focus-ring flex items-center gap-1 text-sm text-text-primary"
            >
              <ChevronLeft size={18} aria-hidden />
              Back
            </button>
            <span className="h-5 w-px bg-border" aria-hidden />
            <Breadcrumbs
              items={[
                { label: "Dashboard", href: "/" },
                { label: "Accounting", href: "/accounting/charts-of-account" },
                { label: "Manual Journal Entry", href: "/accounting/journal" },
                { label: "Create Manual Journal Entry" },
              ]}
            />
          </div>

          <button
            type="button"
            onClick={() => setShowSuccess(true)}
            className="focus-ring inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Create
          </button>
        </div>

        <div className="px-10 pt-6">
          {/* Accounting Entries */}
          <SectionAccordion title="Accounting Entries">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse">
                <thead>
                  <tr className="bg-surface-muted text-left">
                    <th className="w-12 px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label="Select all rows"
                        checked={allSelected}
                        onChange={() =>
                          setSelected(
                            allSelected
                              ? new Set()
                              : new Set(rows.map((r) => r.id))
                          )
                        }
                        className="h-[18px] w-[18px] accent-primary"
                      />
                    </th>
                    <th className="w-16 px-2 py-3 text-[13px] font-medium text-text-primary">
                      No
                    </th>
                    <th className="px-4 py-3 text-[13px] font-medium text-text-primary">
                      Account
                    </th>
                    <th className="px-4 py-3 text-right text-[13px] font-medium text-text-primary">
                      Debit
                    </th>
                    <th className="px-4 py-3 text-right text-[13px] font-medium text-text-primary">
                      Credit
                    </th>
                    <th className="w-12 px-4 py-3" aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={row.id} className="border-b border-border">
                      <td className="px-4 py-3 align-middle">
                        <input
                          type="checkbox"
                          aria-label={`Select row ${idx + 1}`}
                          checked={selected.has(row.id)}
                          onChange={() => toggleSelect(row.id)}
                          className="h-[18px] w-[18px] accent-primary"
                        />
                      </td>
                      <td className="px-2 py-3 align-middle text-sm text-text-muted">
                        {row.account || row.debit || row.credit ? idx + 1 : "-"}
                      </td>

                      {/* Account dropdown */}
                      <td className="px-4 py-3 align-middle">
                        <div className="relative">
                          <select
                            value={row.account}
                            onChange={(e) =>
                              updateRow(row.id, { account: e.target.value })
                            }
                            aria-label={`Account for row ${idx + 1}`}
                            className={[
                              "focus-ring h-10 w-full appearance-none rounded-lg border border-transparent bg-transparent pr-8 text-sm hover:border-border-strong",
                              row.account ? "text-text-primary" : "text-text-muted",
                            ].join(" ")}
                          >
                            <option value="">Select</option>
                            {ACCOUNT_OPTIONS.map((a) => (
                              <option key={a} value={a}>
                                {a}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={16}
                            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary"
                            aria-hidden
                          />
                        </div>
                      </td>

                      {/* Debit */}
                      <td className="px-4 py-3 text-right align-middle">
                        <input
                          type="number"
                          value={row.debit ?? ""}
                          onChange={(e) =>
                            updateRow(row.id, {
                              debit: e.target.value ? Number(e.target.value) : null,
                            })
                          }
                          placeholder="-"
                          aria-label={`Debit for row ${idx + 1}`}
                          className="focus-ring h-10 w-full rounded-lg border border-transparent bg-transparent px-2 text-right text-sm text-text-primary placeholder:text-text-muted hover:border-border-strong"
                        />
                      </td>

                      {/* Credit */}
                      <td className="px-4 py-3 text-right align-middle">
                        <input
                          type="number"
                          value={row.credit ?? ""}
                          onChange={(e) =>
                            updateRow(row.id, {
                              credit: e.target.value ? Number(e.target.value) : null,
                            })
                          }
                          placeholder="-"
                          aria-label={`Credit for row ${idx + 1}`}
                          className="focus-ring h-10 w-full rounded-lg border border-transparent bg-transparent px-2 text-right text-sm text-text-primary placeholder:text-text-muted hover:border-border-strong"
                        />
                      </td>

                      {/* Row actions */}
                      <td className="relative px-4 py-3 text-right align-middle">
                        <button
                          type="button"
                          aria-label={`Actions for row ${idx + 1}`}
                          onClick={() =>
                            setOpenMenu(openMenu === row.id ? null : row.id)
                          }
                          className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-sub"
                        >
                          <MoreVertical size={18} aria-hidden />
                        </button>
                        {openMenu === row.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenMenu(null)}
                              aria-hidden
                            />
                            <div
                              role="menu"
                              className="absolute right-4 top-11 z-20 w-40 overflow-hidden rounded-lg border border-border bg-surface py-1 text-left shadow-md"
                            >
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                  removeRow(row.id);
                                  setOpenMenu(null);
                                }}
                                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-bg-sub"
                              >
                                Delete row
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={addRow}
              className="focus-ring mt-3 text-sm font-medium text-primary"
            >
              Add Row+
            </button>

            {/* Totals */}
            <div className="mt-6 flex justify-end">
              <div className="w-[300px] space-y-4">
                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-sm text-text-secondary">
                    Total Debit
                    <Info size={14} className="text-text-muted" aria-hidden />
                  </label>
                  <input
                    readOnly
                    value={hasValues ? money(totalDebit) : "-"}
                    className="h-[46px] w-full rounded-lg border border-border-strong bg-surface px-3.5 text-sm text-text-primary"
                  />
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-sm text-text-secondary">
                    Total Credit
                    <Info size={14} className="text-text-muted" aria-hidden />
                  </label>
                  <input
                    readOnly
                    value={hasValues ? money(totalCredit) : "-"}
                    className="h-[46px] w-full rounded-lg border border-border-strong bg-surface px-3.5 text-sm text-text-primary"
                  />
                </div>
              </div>
            </div>
          </SectionAccordion>

          {/* In Organisation Level Transfer */}
          <SectionAccordion title="In Organisation Level Transfer">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-text-secondary">
                  Branch
                </label>
                <div className="relative">
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className={[
                      "focus-ring h-[46px] w-full appearance-none rounded-lg border border-border-strong bg-surface px-3.5 pr-10 text-sm",
                      branch ? "text-text-primary" : "text-text-muted",
                    ].join(" ")}
                  >
                    <option value="">Country</option>
                    <option>Head Office</option>
                    <option>Lagos</option>
                    <option>Abuja</option>
                  </select>
                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
                    aria-hidden
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm text-text-secondary">
                  Level
                </label>
                <div className="relative">
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className={[
                      "focus-ring h-[46px] w-full appearance-none rounded-lg border border-border-strong bg-surface px-3.5 pr-10 text-sm",
                      level ? "text-text-primary" : "text-text-muted",
                    ].join(" ")}
                  >
                    <option value="">Country</option>
                    <option>Level 1</option>
                    <option>Level 2</option>
                  </select>
                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
                    aria-hidden
                  />
                </div>
              </div>
            </div>
          </SectionAccordion>

          {/* Transaction Information */}
          <SectionAccordion title="Transaction Information">
            <div className="max-w-[640px]">
              <div className="relative">
                <input
                  type="text"
                  value={txnDate}
                  onChange={(e) => setTxnDate(e.target.value)}
                  placeholder="11-12-2025"
                  aria-label="Transaction date"
                  className="focus-ring h-[46px] w-full rounded-lg border border-border-strong bg-surface px-3.5 pr-11 text-sm text-text-primary placeholder:text-text-muted"
                />
                <Calendar
                  size={18}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
                  aria-hidden
                />
              </div>
            </div>
          </SectionAccordion>

          {/* Additional Information */}
          <SectionAccordion title="Additional Information">
            <div>
              <label className="mb-2 block text-sm text-text-secondary">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write a note"
                rows={5}
                className="focus-ring w-full max-w-[640px] rounded-lg border border-border-strong bg-surface px-3.5 pt-3 text-sm text-text-primary placeholder:text-text-muted"
                style={{ minHeight: 150 }}
              />
            </div>
          </SectionAccordion>
        </div>
      </main>

      <SuccessModal
        open={showSuccess}
        title="New Manual Journal Created"
        body="You have successfully created a Manual Journal. Go to the journal entries section to see your new journal."
        onClose={() => setShowSuccess(false)}
        onOkay={() => {
          setShowSuccess(false);
          router.push("/accounting/journal");
        }}
      />
    </div>
  );
}
