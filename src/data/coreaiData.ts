// Expanded, banking-realistic dataset that powers Core AI's answers and charts.
//
// Everything here is in ₦ (Nigerian Naira) and is internally consistent so that
// generated figures and graphs reconcile with one another (e.g. branch cash
// positions sum to the group total, monthly income minus expense ≈ net income).
//
// This is still mock data — but it is structured so the Core AI engine can do
// REAL computation against it (sums, groupings, trends, debit/credit checks)
// rather than returning hard-coded strings.

export const FISCAL_YEAR = 2026;
export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

// ---------------------------------------------------------------- Formatting

/** Format a Naira amount with thousands separators, no decimals. */
export function naira(n: number): string {
  return `₦${Math.round(n).toLocaleString("en-NG")}`;
}

/** Compact Naira for axis labels / tight spaces, e.g. ₦1.2bn, ₦450m, ₦12k. */
export function nairaShort(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}bn`;
  if (abs >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}m`;
  if (abs >= 1_000) return `₦${(n / 1_000).toFixed(0)}k`;
  return `₦${Math.round(n)}`;
}

// ---------------------------------------------------------------- Monthly P&L

// Monthly income (interest income, fees & commissions, FX) — trending up.
export const MONTHLY_INCOME: number[] = [
  412_000_000, 438_000_000, 421_000_000, 467_000_000, 489_000_000, 512_000_000,
  498_000_000, 534_000_000, 556_000_000, 571_000_000, 603_000_000, 628_000_000,
];

// Monthly operating expenses — generally lower than income, with some spikes.
export const MONTHLY_EXPENSE: number[] = [
  298_000_000, 311_000_000, 305_000_000, 332_000_000, 341_000_000, 356_000_000,
  349_000_000, 372_000_000, 381_000_000, 388_000_000, 402_000_000, 419_000_000,
];

/** Net income per month (income − expense). */
export const MONTHLY_NET: number[] = MONTHLY_INCOME.map(
  (v, i) => v - MONTHLY_EXPENSE[i]
);

// How many months have "actuals" posted so far this fiscal year.
export const MONTHS_POSTED = 5; // Jan–May 2026 (current date: 28 May 2026)

export function ytd(series: number[]): number {
  return series.slice(0, MONTHS_POSTED).reduce((s, x) => s + x, 0);
}

// ---------------------------------------------------- Expense by category

export interface CategorySlice {
  label: string;
  amount: number; // ₦, YTD
  color: string;
}

// Palette in the ChainCore blue family (matches the donut card convention).
export const EXPENSE_BY_CATEGORY: CategorySlice[] = [
  { label: "Staff Costs", amount: 612_000_000, color: "#1E2A78" },
  { label: "IT & Infrastructure", amount: 388_000_000, color: "#3157F6" },
  { label: "Branch Operations", amount: 274_000_000, color: "#5B79FF" },
  { label: "Regulatory & Compliance", amount: 196_000_000, color: "#7B96FF" },
  { label: "Marketing", amount: 117_000_000, color: "#A9BCFF" },
];

// --------------------------------------------------- Branch cash positions

export interface BranchPosition {
  branch: string;
  cash: number; // ₦ available cash
  color: string;
}

// Cash held across branches (sums to GROUP_CASH below).
export const BRANCH_POSITIONS: BranchPosition[] = [
  { branch: "Lagos (HQ)", cash: 4_820_000_000, color: "#1E2A78" },
  { branch: "Abuja", cash: 2_140_000_000, color: "#3157F6" },
  { branch: "Port Harcourt", cash: 1_460_000_000, color: "#5B79FF" },
  { branch: "Kano", cash: 980_000_000, color: "#7B96FF" },
  { branch: "Ibadan", cash: 740_000_000, color: "#A9BCFF" },
];

export const GROUP_CASH = BRANCH_POSITIONS.reduce((s, b) => s + b.cash, 0);

// ------------------------------------------------- Balance-sheet headlines

export const BS_HEADLINES = {
  totalAssets: 30_120_000_000,
  totalLiabilities: 18_400_000_000,
  totalEquity: 11_720_000_000, // assets − liabilities
  loansAndAdvances: 16_540_000_000,
  customerDeposits: 17_900_000_000,
};

// Asset mix for the allocation donut (share of total assets).
export const ASSET_MIX: CategorySlice[] = [
  { label: "Loans & Advances", amount: 16_540_000_000, color: "#1E2A78" },
  { label: "Cash & Balances", amount: 7_300_000_000, color: "#3157F6" },
  { label: "Investments", amount: 4_180_000_000, color: "#5B79FF" },
  { label: "Fixed Assets", amount: 2_100_000_000, color: "#7B96FF" },
];

// -------------------------------------------------------- Top GL accounts

export interface TopAccount {
  code: string;
  name: string;
  balance: number;
}

export const TOP_ACCOUNTS: TopAccount[] = [
  { code: "100600", name: "Loans & Advances – Retail", balance: 9_240_000_000 },
  { code: "100610", name: "Loans & Advances – Corporate", balance: 7_300_000_000 },
  { code: "200100", name: "Customer Deposits – Savings", balance: 6_870_000_000 },
  { code: "200110", name: "Customer Deposits – Current", balance: 5_120_000_000 },
  { code: "100200", name: "Treasury Bills", balance: 3_460_000_000 },
];

// ----------------------------------------------- Pending approvals (maker-checker)

export interface PendingApproval {
  id: string;
  description: string;
  amount: number;
  maker: string;
  submitted: string;
  /** If set, this entry is the cause of a known variance — used by Core AI
   *  to investigate trial-balance imbalances and name the responsible entry. */
  causesVariance?: boolean;
  /** Plain-language explanation of what went wrong, surfaced by Core AI. */
  rootCause?: string;
  /** GL account involved in the root cause (referenced by Core AI). */
  rootAccount?: string;
}

export const PENDING_APPROVALS: PendingApproval[] = [
  { id: "JV-2031", description: "Inter-branch funds transfer – Lagos → Abuja", amount: 250_000_000, maker: "A. Okafor", submitted: "Today, 9:14am" },
  { id: "JV-2034", description: "Provision for loan impairment – Q2", amount: 88_500_000, maker: "B. Adeyemi", submitted: "Today, 10:02am" },
  {
    id: "JV-2037",
    description: "Reclassification – fixed asset disposal",
    amount: 240_000,
    maker: "C. Nwosu",
    submitted: "Yesterday, 4:48pm",
    causesVariance: true,
    rootCause:
      "Debit posted but the matching credit didn't go through — the disposal account was missing its period mapping for May 2026.",
    rootAccount: "160500",
  },
];

export const PENDING_TOTAL = PENDING_APPROVALS.reduce((s, p) => s + p.amount, 0);

// --------------------------------------------------- Trial balance check

// Group debit/credit totals — used to answer "is my trial balance balanced?"
// Currently out by ₦240,000 — caused by JV-2037 (a one-sided posting).
export const TRIAL_BALANCE_TOTALS = {
  debit: 41_660_240_000,
  credit: 41_660_000_000,
};

// --------------------------------------------------------- CBN returns

export const CBN_RETURNS = {
  nextDue: "15 Jun 2026",
  capitalAdequacyRatio: 17.4, // % (regulatory min 15%)
  liquidityRatio: 42.1, // % (regulatory min 30%)
  outstandingItems: 2,
};
