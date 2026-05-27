// Trial Balance data model and mock data.

export interface TBRow {
  id: string;
  code?: string; // omitted for section header rows
  name: string;
  opening: number;
  debit: number;
  credit: number;
  netChange: number;
  closing: number;
  level: number;
  kind: "section" | "account" | "total";
  children?: TBRow[];
}

// Shared sample figures matching the screenshot's repeated values.
const O = 8666730.06; // opening / closing
const D = 7450000; // debit

function acc(
  id: string,
  code: string,
  name: string,
  credit: number,
  level: number,
  children?: TBRow[]
): TBRow {
  return {
    id,
    code,
    name,
    opening: O,
    debit: D,
    credit,
    netChange: 0,
    closing: O,
    level,
    kind: "account",
    children,
  };
}

function section(
  id: string,
  name: string,
  children: TBRow[]
): TBRow {
  return {
    id,
    name,
    opening: O,
    debit: D,
    credit: 0,
    netChange: 0,
    closing: O,
    level: 0,
    kind: "section",
    children,
  };
}

export const TRIAL_BALANCE: TBRow[] = [
  section("sec-assets", "Assets", [
    acc("100000", "100000", "Assets", 0, 1, [
      acc("100100", "100100", "Furniture and Fittings", 7515, 2, [
        acc("100110", "100110", "Chairs", 148765, 3),
      ]),
      acc("100200", "100200", "Land and Building", 0, 2, [
        acc("100210", "100210", "Plots", 0, 3),
      ]),
      acc("100300", "100300", "Motor Vehicle", 0, 2, [
        acc("100310", "100310", "Fleet", 0, 3),
      ]),
      acc("100400mv", "100400", "Motor Van", 0, 2, [
        acc("100410", "100410", "Van A", 0, 3),
      ]),
      acc("100400lp", "100400", "Laptop", 0, 2, [
        acc("100411", "100411", "MacBook", 0, 3),
      ]),
    ]),
  ]),

  section("sec-liabilities", "Liabilities", [
    acc("200000", "200000", "Payables", 0, 1, [
      acc("200010", "200010", "Trade Payables", 0, 2),
    ]),
    acc("200100", "200100", "Payables", 0, 1, [
      acc("200110", "200110", "Accrued", 0, 2),
    ]),
    acc("200200", "200200", "Accumulated Depreciation", 0, 1, [
      acc("200210", "200210", "Equipment Dep.", 0, 2),
    ]),
    acc("200300", "200300", "Contributions", 0, 1, [
      acc("200310", "200310", "Pension", 0, 2),
    ]),
  ]),

  section("sec-equity", "Equity", [
    acc("30000", "30000", "Contributions", 0, 1, [
      acc("30010", "30010", "Owner Capital", 0, 2),
    ]),
    acc("300100", "300100", "Share Capital", 0, 1, [
      acc("300110", "300110", "Ordinary Shares", 0, 2),
    ]),
  ]),

  section("sec-expense", "Expense", [
    acc("400000", "400000", "Share Capital", 0, 1, [
      acc("400010", "400010", "Staff Cost", 0, 2),
    ]),
    acc("400100", "400100", "Share Capital", 0, 1, [
      acc("400110", "400110", "Salaries", 0, 2),
    ]),
  ]),

  section("sec-income", "Income", [
    acc("500000", "500000", "Income", 0, 1, [
      acc("500010", "500010", "Interest", 0, 2),
    ]),
    acc("500100", "500100", "Interest Income", 0, 1, [
      acc("500110", "500110", "Loan Interest", 0, 2),
    ]),
  ]),

  // Grand total row: only Debit and Credit populated.
  {
    id: "grand-total",
    name: "Total",
    opening: 0,
    debit: 7450000,
    credit: 7450000,
    netChange: 0,
    closing: 0,
    level: 0,
    kind: "total",
  },
];

export function fmt(n: number): string {
  return `$ ${n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
