// Balance Sheet data model and mock data.

export interface BSRow {
  id: string;
  code?: string; // omitted for section header rows like "Assets"
  name: string;
  balance: number;
  level: number; // indentation level
  kind: "section" | "account" | "total";
  children?: BSRow[];
}

// A node in the collapsible balance-sheet tree.
function acc(
  id: string,
  code: string,
  name: string,
  balance: number,
  level: number,
  children?: BSRow[]
): BSRow {
  return { id, code, name, balance, level, kind: "account", children };
}

/**
 * Mirrors the screenshot's structure: section group rows, nested account
 * folders, and "Total" summary rows. Balances are sample figures.
 */
export const BALANCE_SHEET: BSRow[] = [
  // ---- ASSETS section ----
  {
    id: "sec-assets",
    name: "Assets",
    balance: 148765,
    level: 0,
    kind: "section",
    children: [
      acc("100000", "100000", "ASSETS", 0, 1, [
        acc("100100", "100100", "Furniture and Fittings", 7515, 2, [
          acc("100110", "100110", "Chairs", 148765, 3),
        ]),
        acc("100200", "100200", "Land and Building", 0, 2, [
          acc("100210", "100210", "Plots", 0, 3),
        ]),
        acc("100300", "100300", "Motor Vehicle", 0, 2, [
          acc("100310", "100310", "Fleet", 0, 3),
        ]),
      ]),
      acc("100200b", "100200", "NON CURRENT ASSETS", 0, 1, [
        acc("100100p", "100100", "Prepayments", 7515, 2, [
          acc("100111", "100111", "Rent Prepaid", 7515, 3),
        ]),
        acc("100400", "100400", "Receivables", 0, 2, [
          acc("100410", "100410", "Trade Receivables", 0, 3),
        ]),
      ]),
    ],
  },
  { id: "total-assets", name: "Total Assets", balance: 8666730.06, level: 0, kind: "total" },

  // ---- LIABILITY ----
  acc("200000", "200000", "LIABILITY", 148765, 0, [
    acc("200100", "200100", "Wema Bank", 148765, 1, [
      acc("200110", "200110", "Petty Cash", 14946651.68, 2),
    ]),
    acc("200200", "200200", "Wema Bank", 0, 1, [
      acc("200210", "200210", "Current", 0, 2),
    ]),
    acc("200300", "200300", "Petty Cash", 0, 1, [
      acc("200310", "200310", "Float", 0, 2),
    ]),
    acc("200400", "200400", "Wema Bank", 0, 1, [
      acc("200410", "200410", "Savings", 0, 2),
    ]),
  ]),
  { id: "total-balance-1", name: "Total Balance", balance: 8666730.06, level: 0, kind: "total" },

  // ---- EQUITY ----
  acc("300000", "300000", "EQUITY", 14946651.68, 0, [
    acc("300100", "300100 - Furniture and Fittings", "Wema Bank", 0, 1, [
      acc("300110", "300110 - Chairs", "Petty Cash", 0, 2),
    ]),
    acc("300200", "300200 - Land and Building", "BudPay", 148765, 1, [
      acc("300210", "300210 - Plots", "BudPay", 148765, 2),
    ]),
    acc("300300", "300300 - Motor Vehicle", "Petty Cash", 0, 1, [
      acc("300310", "300310 - Fleet", "Petty Cash", 0, 2),
    ]),
    acc("300400", "300400 - Motor Vehicle", "Wema Bank", 148765, 1, [
      acc("300410", "300410 - Trucks", "Wema Bank", 148765, 2),
    ]),
  ]),
  { id: "total-balance-2", name: "Total Balance", balance: 8666730.06, level: 0, kind: "total" },

  // ---- EXPENSE / INCOME ----
  acc("400000", "400000", "EXPENSE", 14946651.68, 0, [
    acc("400100", "400100", "Staff Cost", 14946651.68, 1, [
      acc("400110", "400110", "Salaries", 14946651.68, 2),
    ]),
  ]),
  acc("500000", "500000", "INCOME", 14946651.68, 0, [
    acc("500100", "500100", "Interest Income", 14946651.68, 1, [
      acc("500110", "500110", "Interest - Loans", 14946651.68, 2),
    ]),
  ]),
];

export function formatBalance(n: number): string {
  return `$${n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
