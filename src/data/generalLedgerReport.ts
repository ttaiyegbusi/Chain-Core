// General Ledger Report data.
//
// Detailed transaction log by GL account, showing date, description, account,
// debit, credit, and running balance. Supports filtering by date range, account,
// transaction type, and branch/level.

export interface GLTransaction {
  id: string;
  date: string; // "Jun 3, 2026"
  description: string;
  glCode: string;
  glName: string;
  debit: number;
  credit: number;
  runningBalance: number;
  transactionType: string; // "Journal Entry", "Manual Entry", "System", etc.
  branch: string; // "Lagos", "Abuja", etc.
  referenceId?: string; // e.g., "JE-2026-00142"
}

const TRANSACTIONS: GLTransaction[] = [
  // 100000 ASSET account transactions
  {
    id: "tx-001",
    date: "Jun 3, 2026",
    description: "Opening Balance Transfer",
    glCode: "100000",
    glName: "ASSET",
    debit: 5000000,
    credit: 0,
    runningBalance: 5000000,
    transactionType: "System",
    branch: "Lagos",
    referenceId: "SYS-2026-00001",
  },
  {
    id: "tx-002",
    date: "Jun 3, 2026",
    description: "Customer Deposit - Aiyegbusi Temitope",
    glCode: "100100",
    glName: "Cash at Bank",
    debit: 250000,
    credit: 0,
    runningBalance: 5250000,
    transactionType: "Journal Entry",
    branch: "Lagos",
    referenceId: "JE-2026-00001",
  },
  {
    id: "tx-003",
    date: "Jun 3, 2026",
    description: "Loan Disbursement - APX1242352",
    glCode: "100200",
    glName: "Loans & Advances",
    debit: 1000000,
    credit: 0,
    runningBalance: 6250000,
    transactionType: "Journal Entry",
    branch: "Lagos",
    referenceId: "JE-2026-00002",
  },
  {
    id: "tx-004",
    date: "Jun 4, 2026",
    description: "Customer Withdrawal",
    glCode: "100100",
    glName: "Cash at Bank",
    debit: 0,
    credit: 100000,
    runningBalance: 5150000,
    transactionType: "Journal Entry",
    branch: "Lagos",
    referenceId: "JE-2026-00003",
  },
  {
    id: "tx-005",
    date: "Jun 4, 2026",
    description: "Interest Income Posting",
    glCode: "300100",
    glName: "Interest Income",
    debit: 50000,
    credit: 0,
    runningBalance: 50000,
    transactionType: "System",
    branch: "Lagos",
    referenceId: "SYS-2026-00002",
  },
  // More transactions across different accounts
  {
    id: "tx-006",
    date: "Jun 5, 2026",
    description: "Staff Salary Accrual",
    glCode: "400100",
    glName: "Staff Cost",
    debit: 0,
    credit: 500000,
    runningBalance: -500000,
    transactionType: "Manual Entry",
    branch: "Abuja",
    referenceId: "MAN-2026-00001",
  },
  {
    id: "tx-007",
    date: "Jun 5, 2026",
    description: "Utilities Payment",
    glCode: "400200",
    glName: "Operational Cost",
    debit: 0,
    credit: 75000,
    runningBalance: -575000,
    transactionType: "Journal Entry",
    branch: "Lagos",
    referenceId: "JE-2026-00004",
  },
  {
    id: "tx-008",
    date: "Jun 6, 2026",
    description: "Loan Repayment - APX1242352",
    glCode: "100200",
    glName: "Loans & Advances",
    debit: 0,
    credit: 50000,
    runningBalance: 6200000,
    transactionType: "Journal Entry",
    branch: "Lagos",
    referenceId: "JE-2026-00005",
  },
  {
    id: "tx-009",
    date: "Jun 6, 2026",
    description: "Interest Income - Loan Portfolio",
    glCode: "300100",
    glName: "Interest Income",
    debit: 35000,
    credit: 0,
    runningBalance: 85000,
    transactionType: "System",
    branch: "Abuja",
    referenceId: "SYS-2026-00003",
  },
  {
    id: "tx-010",
    date: "Jun 7, 2026",
    description: "Processing Fee Income",
    glCode: "300200",
    glName: "Processing Fees",
    debit: 15000,
    credit: 0,
    runningBalance: 15000,
    transactionType: "Journal Entry",
    branch: "Lagos",
    referenceId: "JE-2026-00006",
  },
  // Add more mock transactions to reach pagination territory
  ...Array.from({ length: 40 }, (_, i) => ({
    id: `tx-${String(i + 11).padStart(3, "0")}`,
    date: `Jun ${(i % 20) + 8}, 2026`,
    description: `Transaction ${i + 11}`,
    glCode: ["100100", "100200", "200100", "300100", "400100"][i % 5],
    glName: [
      "Cash at Bank",
      "Loans & Advances",
      "Liabilities",
      "Interest Income",
      "Staff Cost",
    ][i % 5],
    debit: i % 3 === 0 ? Math.floor(Math.random() * 500000) : 0,
    credit: i % 3 !== 0 ? Math.floor(Math.random() * 300000) : 0,
    runningBalance: 5000000 + (i + 1) * 10000,
    transactionType: [
      "Journal Entry",
      "Manual Entry",
      "System",
    ][i % 3],
    branch: ["Lagos", "Abuja", "Port Harcourt"][i % 3],
    referenceId: `REF-${String(i + 11).padStart(3, "0")}`,
  })),
];

export const GENERAL_LEDGER_TRANSACTIONS = TRANSACTIONS;

export interface GLReportFilters {
  dateFrom?: string;
  dateTo?: string;
  glCode?: string;
  transactionType?: string;
  branch?: string;
}

export function filterTransactions(
  transactions: GLTransaction[],
  filters: GLReportFilters
): GLTransaction[] {
  return transactions.filter((tx) => {
    if (filters.dateFrom && new Date(tx.date) < new Date(filters.dateFrom))
      return false;
    if (filters.dateTo && new Date(tx.date) > new Date(filters.dateTo))
      return false;
    if (filters.glCode && !tx.glCode.includes(filters.glCode)) return false;
    if (
      filters.transactionType &&
      tx.transactionType !== filters.transactionType
    )
      return false;
    if (filters.branch && tx.branch !== filters.branch) return false;
    return true;
  });
}
