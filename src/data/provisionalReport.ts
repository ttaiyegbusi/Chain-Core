// Provisional Report data.
//
// A draft balance sheet snapshot at a given date (before period closing).
// Shows GL Code, Account Name, Opening Balance, Debit Total, Credit Total,
// and Closing Balance. Reuses the same hierarchical BSRow model as Balance Sheet
// and Trial Balance for consistency.

import { BSRow } from "./balanceSheet";

function sec(id: string, name: string, balance: number, children: BSRow[]): BSRow {
  return { id, name, balance, level: 0, kind: "section", children };
}

function acc(
  id: string,
  code: string,
  name: string,
  balance: number,
  level: number,
  children?: BSRow[]
): BSRow {
  return {
    id,
    code,
    name,
    balance,
    level,
    kind: "account",
    children,
  };
}

function tot(
  id: string,
  name: string,
  balance: number
): BSRow {
  return {
    id,
    name,
    balance,
    level: 0,
    kind: "total",
  };
}

/**
 * Provisional report snapshot showing assets, liabilities, and equity
 * as of today (Jun 8, 2026) before any month-end closing.
 */
const PROVISIONAL_SNAPSHOT: BSRow[] = [
  sec("assets", "ASSETS", 0, [
    acc(
      "100000",
      "100000",
      "ASSET",
      15150000,
      1,
      [
        acc(
          "100100",
          "100100",
          "Cash at Bank",
          3150000,
          2
        ),
        acc(
          "100200",
          "100200",
          "Loans & Advances",
          7000000,
          2
        ),
        acc(
          "100300",
          "100300",
          "Investment Securities",
          5000000,
          2
        ),
      ]
    ),
  ]),
  sec("liabilities", "LIABILITIES", 0, [
    acc(
      "200000",
      "200000",
      "LIABILITY",
      2500000,
      1,
      [
        acc(
          "200100",
          "200100",
          "Customer Deposits",
          1700000,
          2
        ),
        acc(
          "200200",
          "200200",
          "Borrowings",
          800000,
          2
        ),
      ]
    ),
  ]),
  sec("equity", "EQUITY", 0, [
    acc(
      "300000",
      "300000",
      "EQUITY",
      5000000,
      1,
      [
        acc(
          "300100",
          "300100",
          "Share Capital",
          3000000,
          2
        ),
        acc(
          "300200",
          "300200",
          "Retained Earnings",
          2000000,
          2
        ),
      ]
    ),
  ]),
  tot("total", "TOTAL", 22650000),
];

export const PROVISIONAL_DATA = PROVISIONAL_SNAPSHOT;

export interface ProvisionalsFilterOptions {
  asOf?: string; // e.g., "Jun 8, 2026"
  accountType?: "All" | "Asset" | "Liability" | "Equity";
  branch?: string;
}

export function filterProvisionalData(
  data: BSRow[],
  filters: ProvisionalsFilterOptions
): BSRow[] {
  if (!filters.accountType || filters.accountType === "All") {
    return data;
  }

  // Filter by account type (simplistic: check the section name)
  const typeMap: Record<string, string> = {
    Asset: "ASSET",
    Liability: "LIABILITY",
    Equity: "EQUITY",
  };
  const typeStr = typeMap[filters.accountType];

  return data.filter((row) => {
    if (row.kind === "section") {
      // Keep sections if any child matches
      return row.children?.some((c) => c.name?.includes(typeStr)) ?? false;
    }
    if (row.kind === "total") return true;
    // For accounts, filter by name
    return row.name?.includes(typeStr) ?? false;
  });
}
