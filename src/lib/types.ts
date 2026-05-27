export type AccountType =
  | "Asset"
  | "Liability"
  | "Equity"
  | "Income"
  | "Expense";

export type HierarchyType =
  | "Header Account"
  | "Control Account"
  | "Posting Account";

export type BalanceSide = "Dr" | "Cr";

export interface ChartAccount {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  hierarchyType: HierarchyType;
  headerAccountId?: string | null;
  amount: number;
  balanceSide: BalanceSide;
  showGlOnlyForHeadOffice: boolean;
  notes?: string;
  children?: ChartAccount[];
}

export const ACCOUNT_TYPES: AccountType[] = [
  "Asset",
  "Liability",
  "Equity",
  "Income",
  "Expense",
];

export const HIERARCHY_TYPES: HierarchyType[] = [
  "Header Account",
  "Control Account",
  "Posting Account",
];

// Tab keys used in the URL (?tab=asset). "all" is the default view.
export type TabKey =
  | "all"
  | "asset"
  | "liability"
  | "equity"
  | "income"
  | "expense";

export const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "asset", label: "Asset" },
  { key: "liability", label: "Liability" },
  { key: "equity", label: "Equity" },
  { key: "income", label: "Income" },
  { key: "expense", label: "Expense" },
];

// Maps a tab key to the AccountType it filters by (null = All).
export const TAB_TO_TYPE: Record<TabKey, AccountType | null> = {
  all: null,
  asset: "Asset",
  liability: "Liability",
  equity: "Equity",
  income: "Income",
  expense: "Expense",
};

export function formatAmount(account: Pick<ChartAccount, "amount" | "balanceSide">) {
  return `$${account.amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${account.balanceSide}`;
}
