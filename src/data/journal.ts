// Journal Entries data model and mock data.

export type JournalCategory = "Standard Booking" | "Manual Entry";
export type JournalStatus = "Approved" | "Pending" | "Rejected";

export interface JournalLine {
  glCode: string;
  glName: string;
  amount: number;
}

export interface JournalEntry {
  id: string;
  entryTime: string;
  totalAmount: number;
  transactionDate: string;
  user: string;
  category: JournalCategory;
  status: JournalStatus;
  // expandable detail
  detail: {
    level: string;
    branch: string;
    notes: string;
    transactionId: string;
    accountId: string;
    debit: JournalLine[];
    credit: JournalLine[];
  };
}

const ENTRY_TIME = "5th Mar, 2025 at 6:23pm";
const TXN_DATE = "5th Mar, 2025";
const USER = "Temitope Aiyegbusi";
const AMOUNT = 10930;

function entry(
  id: string,
  category: JournalCategory,
  notes = "Purchase of Building"
): JournalEntry {
  return {
    id,
    entryTime: ENTRY_TIME,
    totalAmount: AMOUNT,
    transactionDate: TXN_DATE,
    user: USER,
    category,
    status: "Approved",
    detail: {
      level: "Head Office",
      branch: "-",
      notes,
      transactionId: "--",
      accountId: "--",
      debit: [{ glCode: "100600", glName: "Building at Lekki", amount: AMOUNT }],
      credit: [{ glCode: "201400", glName: "Wema", amount: AMOUNT }],
    },
  };
}

export const JOURNAL_ENTRIES: JournalEntry[] = [
  entry("2012", "Standard Booking"),
  entry("2013", "Manual Entry"),
  entry("2014", "Manual Entry"),
  entry("2015", "Manual Entry"),
  entry("2016", "Manual Entry"),
  entry("2017", "Manual Entry"),
  entry("2018", "Standard Booking"),
  entry("2019", "Standard Booking"),
  entry("2020", "Standard Booking"),
  entry("2021", "Manual Entry"),
  entry("2022", "Manual Entry"),
];

export function money(n: number): string {
  return `$${n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
