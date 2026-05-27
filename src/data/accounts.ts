import { ChartAccount, AccountType, BalanceSide } from "@/lib/types";

// Helper to build a leaf (posting) account
function leaf(
  code: string,
  name: string,
  type: AccountType,
  headerAccountId: string,
  balanceSide: BalanceSide,
  amount = 40000
): ChartAccount {
  return {
    id: code,
    code,
    name,
    type,
    hierarchyType: "Posting Account",
    headerAccountId,
    amount,
    balanceSide,
    showGlOnlyForHeadOffice: true,
    notes: "",
  };
}

/**
 * Clean, internally consistent chart of accounts.
 *
 * Root-code mapping follows the spec's recommended scheme (section 7.6):
 *   Asset 100000, Liability 200000, Equity 300000, Income 400000, Expense 500000
 *
 * Codes are unique (the screenshots' duplicate "1001200 Budpay" rows and
 * reused root codes were flagged as sample-data noise and are not reproduced).
 */
export const CHART_OF_ACCOUNTS: ChartAccount[] = [
  // ---------------------------------------------------------------- ASSET
  {
    id: "100000",
    code: "100000",
    name: "ASSET",
    type: "Asset",
    hierarchyType: "Header Account",
    headerAccountId: null,
    amount: 40000,
    balanceSide: "Dr",
    showGlOnlyForHeadOffice: true,
    children: [
      {
        id: "1001000",
        code: "1001000",
        name: "CASH & BANK",
        type: "Asset",
        hierarchyType: "Control Account",
        headerAccountId: "100000",
        amount: 40000,
        balanceSide: "Dr",
        showGlOnlyForHeadOffice: true,
        children: [
          leaf("1001100", "Wema Bank", "Asset", "1001000", "Dr"),
          leaf("1001200", "Budpay", "Asset", "1001000", "Dr"),
          leaf("1001300", "Premium Trust", "Asset", "1001000", "Dr"),
          leaf("1001400", "Petty Cash", "Asset", "1001000", "Dr"),
          leaf("1001500", "Access Bank", "Asset", "1001000", "Dr"),
          leaf("1001600", "Kuda Bank", "Asset", "1001000", "Dr"),
        ],
      },
      {
        id: "1002000",
        code: "1002000",
        name: "NON CURRENT ASSET",
        type: "Asset",
        hierarchyType: "Control Account",
        headerAccountId: "100000",
        amount: 40000,
        balanceSide: "Cr",
        showGlOnlyForHeadOffice: true,
        children: [
          leaf("1002100", "Computer Hardware", "Asset", "1002000", "Cr"),
          leaf("1002200", "Furniture and Fittings", "Asset", "1002000", "Cr"),
        ],
      },
    ],
  },

  // ------------------------------------------------------------ LIABILITY
  {
    id: "200000",
    code: "200000",
    name: "LIABILITIES",
    type: "Liability",
    hierarchyType: "Header Account",
    headerAccountId: null,
    amount: 40000,
    balanceSide: "Dr",
    showGlOnlyForHeadOffice: true,
    children: [
      {
        id: "2001000",
        code: "2001000",
        name: "Payables",
        type: "Liability",
        hierarchyType: "Control Account",
        headerAccountId: "200000",
        amount: 40000,
        balanceSide: "Dr",
        showGlOnlyForHeadOffice: true,
        children: [
          leaf("2001100", "Rent Payable", "Liability", "2001000", "Dr"),
          leaf("2001200", "Budpay", "Liability", "2001000", "Dr"),
          leaf("2001300", "Premium Trust", "Liability", "2001000", "Dr"),
          leaf("2001400", "Petty Cash", "Liability", "2001000", "Dr"),
          leaf("2001500", "Access Bank", "Liability", "2001000", "Dr"),
          leaf("2001600", "Kuda Bank", "Liability", "2001000", "Dr"),
        ],
      },
      {
        id: "2002000",
        code: "2002000",
        name: "Impairment",
        type: "Liability",
        hierarchyType: "Control Account",
        headerAccountId: "200000",
        amount: 40000,
        balanceSide: "Cr",
        showGlOnlyForHeadOffice: true,
        children: [
          leaf("2002100", "Computer Hardware", "Liability", "2002000", "Cr"),
        ],
      },
    ],
  },

  // --------------------------------------------------------------- EQUITY
  {
    id: "300000",
    code: "300000",
    name: "EQUITY",
    type: "Equity",
    hierarchyType: "Header Account",
    headerAccountId: null,
    amount: 40000,
    balanceSide: "Cr",
    showGlOnlyForHeadOffice: true,
    children: [
      {
        id: "3001000",
        code: "3001000",
        name: "Share Capital",
        type: "Equity",
        hierarchyType: "Control Account",
        headerAccountId: "300000",
        amount: 40000,
        balanceSide: "Cr",
        showGlOnlyForHeadOffice: true,
        children: [
          leaf("3001100", "Ordinary Shares", "Equity", "3001000", "Cr"),
          leaf("3001200", "Preference Shares", "Equity", "3001000", "Cr"),
        ],
      },
      {
        id: "3002000",
        code: "3002000",
        name: "Retained Earnings",
        type: "Equity",
        hierarchyType: "Control Account",
        headerAccountId: "300000",
        amount: 40000,
        balanceSide: "Cr",
        showGlOnlyForHeadOffice: true,
        children: [
          leaf("3002100", "Current Year Earnings", "Equity", "3002000", "Cr"),
        ],
      },
    ],
  },

  // --------------------------------------------------------------- INCOME
  {
    id: "400000",
    code: "400000",
    name: "INCOME",
    type: "Income",
    hierarchyType: "Header Account",
    headerAccountId: null,
    amount: 40000,
    balanceSide: "Cr",
    showGlOnlyForHeadOffice: true,
    children: [
      {
        id: "4001000",
        code: "4001000",
        name: "Interest Income",
        type: "Income",
        hierarchyType: "Control Account",
        headerAccountId: "400000",
        amount: 40000,
        balanceSide: "Cr",
        showGlOnlyForHeadOffice: true,
        children: [
          leaf("4001100", "Interest income - myrentease", "Income", "4001000", "Cr"),
          leaf("4001200", "Interest income - ROC", "Income", "4001000", "Cr"),
          leaf("4001300", "Interest income - Harvesters", "Income", "4001000", "Cr"),
          leaf("4001400", "Interest income - CCI", "Income", "4001000", "Cr"),
          leaf("4001500", "Interest income - Redeemed", "Income", "4001000", "Cr"),
          leaf("4001600", "Interest income - Agape", "Income", "4001000", "Cr"),
        ],
      },
      {
        id: "4002000",
        code: "4002000",
        name: "OTHER INCOME",
        type: "Income",
        hierarchyType: "Control Account",
        headerAccountId: "400000",
        amount: 40000,
        balanceSide: "Cr",
        showGlOnlyForHeadOffice: true,
        children: [
          leaf("4002100", "Processing fees", "Income", "4002000", "Cr"),
        ],
      },
    ],
  },

  // -------------------------------------------------------------- EXPENSE
  {
    id: "500000",
    code: "500000",
    name: "EXPENSE",
    type: "Expense",
    hierarchyType: "Header Account",
    headerAccountId: null,
    amount: 40000,
    balanceSide: "Dr",
    showGlOnlyForHeadOffice: true,
    children: [
      {
        id: "5001000",
        code: "5001000",
        name: "Staff Cost",
        type: "Expense",
        hierarchyType: "Control Account",
        headerAccountId: "500000",
        amount: 40000,
        balanceSide: "Dr",
        showGlOnlyForHeadOffice: true,
        children: [
          leaf("5001100", "Salaries", "Expense", "5001000", "Dr"),
          leaf("5001200", "HMO", "Expense", "5001000", "Dr"),
          leaf("5001300", "Staff Transportation", "Expense", "5001000", "Dr"),
          leaf("5001400", "Staff Data", "Expense", "5001000", "Dr"),
          leaf("5001500", "PAYE", "Expense", "5001000", "Dr"),
          leaf("5001600", "Pension", "Expense", "5001000", "Dr"),
          leaf("5001700", "Incentive", "Expense", "5001000", "Dr"),
        ],
      },
      {
        id: "5002000",
        code: "5002000",
        name: "Operational Cost",
        type: "Expense",
        hierarchyType: "Control Account",
        headerAccountId: "500000",
        amount: 40000,
        balanceSide: "Dr",
        showGlOnlyForHeadOffice: true,
        children: [
          leaf("5002100", "Printing & Stationeries", "Expense", "5002000", "Dr"),
        ],
      },
    ],
  },
];

// Flattened list of accounts that can serve as a Header Account in the
// create form's dropdown (header + control accounts).
export function getHeaderAccountOptions(): { id: string; label: string }[] {
  const options: { id: string; label: string }[] = [];
  const walk = (nodes: ChartAccount[]) => {
    for (const n of nodes) {
      if (n.hierarchyType !== "Posting Account") {
        options.push({ id: n.id, label: `${n.code} - ${n.name}` });
      }
      if (n.children) walk(n.children);
    }
  };
  walk(CHART_OF_ACCOUNTS);
  return options;
}

// Find a single account anywhere in the tree by id.
export function findAccountById(id: string): ChartAccount | undefined {
  let found: ChartAccount | undefined;
  const walk = (nodes: ChartAccount[]) => {
    for (const n of nodes) {
      if (n.id === id) {
        found = n;
        return;
      }
      if (n.children) walk(n.children);
    }
  };
  walk(CHART_OF_ACCOUNTS);
  return found;
}

// Resolve the "Code - Name" label for a header account id (for detail view).
export function getHeaderAccountLabel(id?: string | null): string {
  if (!id) return "";
  const acc = findAccountById(id);
  return acc ? `${acc.code} - ${acc.name}` : "";
}
