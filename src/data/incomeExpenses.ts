// Income & Expenses data model.
//
// Reuses the BSRow tree from balanceSheet.ts (same hierarchy semantics:
// section / account / total + indentation level + children) so the table
// component is consistent with Balance Sheet and Trial Balance.
//
// Currency: USD ($) on this screen specifically (per design reference).
// Codes and labels match the supplied screenshot.

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
  return { id, code, name, balance, level, kind: "account", children };
}

/**
 * Income tree.
 *
 * 300000 Income
 *   300100 Interest Income
 *     300110 Interest Income – MYRENTEASE
 *     300120 Interest Income – MyRentEase Credit
 *     300130 Interest Income – ROC
 *   300200 Other Income
 *     300210 Processing Fees (collapsed children)
 *     300220 Penalty           (collapsed children)
 */
const INCOME: BSRow = sec("income", "Income", 0, [
  acc("300000", "300000", "Income", 0, 1, [
    acc("300100", "300100", "Interest Income", 7515.0, 2, [
      acc("300110", "300110", "Interest Income - MYRENTEASE", 148765.0, 3),
      acc("300120", "300120", "Interest Income - MyRentEase Credit", 148765.0, 3),
      acc("300130", "300130", "Interest Income - ROC", 148765.0, 3),
    ]),
    acc("300200", "300200", "Other Income", 0, 2, [
      acc("300210", "300210", "Processing Fees", 0, 3, [
        acc("300210-01", "300211", "Late Processing Fee", 0, 4),
        acc("300210-02", "300212", "Document Processing Fee", 0, 4),
      ]),
      acc("300220", "300220", "Penalty", 0, 3, [
        acc("300220-01", "300221", "Late Repayment Penalty", 0, 4),
        acc("300220-02", "300222", "Default Penalty", 0, 4),
      ]),
    ]),
  ]),
]);

/**
 * Expenses tree.
 *
 * 400000 EXPENSES
 *   400100 STAFF COST
 *   400200 Operational Cost
 *   400300 Regulatory & Compliance
 *   400400 IT & Infrastructure
 *   400500 Marketing
 */
const EXPENSES: BSRow = sec("expenses", "Expenses", 8_666_730.06, [
  acc("400000", "400000", "EXPENSES", 14_946_651.68, 1, [
    acc("400100", "400100", "STAFF COST", 14_946_651.68, 2, [
      acc("400100-01", "400110", "Salaries & Wages", 11_200_000.0, 3),
      acc("400100-02", "400120", "Pension Contributions", 1_840_000.0, 3),
      acc("400100-03", "400130", "Staff Training", 1_906_651.68, 3),
    ]),
    acc("400200", "400200", "Operational Cost", 14_946_651.68, 2, [
      acc("400200-01", "400210", "Rent & Utilities", 5_420_000.0, 3),
      acc("400200-02", "400220", "Office Supplies", 1_240_000.0, 3),
      acc("400200-03", "400230", "Travel & Transport", 2_186_651.68, 3),
      acc("400200-04", "400240", "Communications", 6_100_000.0, 3),
    ]),
    acc("400300", "400300", "Regulatory & Compliance", 1_960_000.0, 2),
    acc("400400", "400400", "IT & Infrastructure", 3_880_000.0, 2),
    acc("400500", "400500", "Marketing", 1_170_000.0, 2),
  ]),
]);

export const INCOME_EXPENSES: BSRow[] = [INCOME, EXPENSES];

// Convenience totals for Core AI screen-context summaries.
export const IE_TOTALS = {
  totalIncome: 7515.0 + 0, // matches the visible $7,515.00 + $0 Other Income
  totalExpenses: 8_666_730.06,
  net: 7515.0 - 8_666_730.06,
};
