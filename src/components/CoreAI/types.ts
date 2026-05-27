// Core AI types and mock response engine.
// Banking-context responses for ChainCore.

export interface ChartLineResponse {
  kind: "line";
  title: string; // e.g. "Revenue"
  period: string; // e.g. "2024"
  tabs: string[]; // ["1M","6M","YTD","1YR"]
  activeTab: string;
  xLabels: string[]; // ["Jan","Feb",...]
  series: number[]; // values aligned to xLabels
}

export interface PieSlice {
  label: string;
  value: number; // percentage 0-100
  detail: string; // e.g. "₦40,000,000"
  color: string;
}

export interface ChartPieResponse {
  kind: "pie";
  title: string; // e.g. "Asset Allocation"
  period: string; // e.g. "This Quarter"
  slices: PieSlice[];
}

export type ChartResponse = ChartLineResponse | ChartPieResponse;

export interface AttachmentDoc {
  id: string;
  name: string;
}
export interface AttachmentLink {
  id: string;
  label: string;
}
export interface AttachmentImage {
  id: string;
  name: string;
}

export interface Attachments {
  documents: AttachmentDoc[];
  links: AttachmentLink[];
  images: AttachmentImage[];
}

export interface AssistantMessage {
  id: string;
  role: "assistant";
  // safer, banking-appropriate "thinking" lines (curated status text, not raw CoT)
  thinking: string[];
  // duration shown in collapsed header e.g. "Thought for 5 seconds"
  thinkingSeconds: number;
  researching: string;
  answer: string; // plain-text summary
  chart?: ChartResponse;
  attachments?: Attachments;
}

export interface UserMessage {
  id: string;
  role: "user";
  text: string;
}

export type CoreAIMessage = AssistantMessage | UserMessage;

// ---------------------------------------------------------------- Mock data

const REVENUE_SERIES = [
  // upward-trending with small fluctuations
  120, 132, 128, 145, 152, 160, 175, 168, 182, 190, 205, 218, 228, 235, 244, 252,
];

const REVENUE_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

// Banking-appropriate substitute for the screenshot's "Work Mode" pie.
// Asset Allocation across major balance-sheet categories.
const ASSET_ALLOCATION: PieSlice[] = [
  { label: "Loans & Advances", value: 45, detail: "₦18,000,000,000", color: "#1E2A78" },
  { label: "Cash & Investments", value: 30, detail: "₦12,000,000,000", color: "#3157F6" },
  { label: "Fixed Assets", value: 15, detail: "₦6,000,000,000", color: "#7B96FF" },
  { label: "Other Assets", value: 10, detail: "₦4,000,000,000", color: "#BFCEFF" },
];

const SAMPLE_ATTACHMENTS: Attachments = {
  documents: [
    { id: "d1", name: "Trial-Balance-Q2-2026.pdf" },
    { id: "d2", name: "CBN-Prudential-Returns.pdf" },
    { id: "d3", name: "Branch-Performance-March.pdf" },
    { id: "d4", name: "GL-Reconciliation-Summary.pdf" },
  ],
  links: [
    { id: "l1", label: "ledger.chaincore.ng/reports" },
    { id: "l2", label: "ledger.chaincore.ng/reports" },
    { id: "l3", label: "ledger.chaincore.ng/reports" },
    { id: "l4", label: "ledger.chaincore.ng/reports" },
  ],
  images: [
    { id: "i1", name: "balance-snapshot.png" },
    { id: "i2", name: "revenue-trend.png" },
    { id: "i3", name: "branch-heatmap.png" },
    { id: "i4", name: "fx-exposure.png" },
  ],
};

// ----------------------------------------------------- Mock response engine

let messageCounter = 0;
const nextId = (prefix: string) => `${prefix}-${++messageCounter}`;

function clean(s: string): string {
  return s.trim().toLowerCase().replace(/[?!.]+$/, "");
}

/**
 * Map a user prompt to a banking-flavored assistant response.
 * All "thinking" lines are curated, user-safe status messages (not raw model
 * chain-of-thought) per the banking-safety guidance in the spec.
 */
export function buildAssistantResponse(prompt: string): AssistantMessage {
  const p = clean(prompt);

  // -- Balance summary ----------------------------------------------------
  if (
    p.includes("balance") &&
    (p.includes("view") || p.includes("show") || p.includes("asset"))
  ) {
    return {
      id: nextId("a"),
      role: "assistant",
      thinking: [
        "Checking your branch permissions for balance access",
        "Pulling the latest General Ledger totals",
        "Aggregating Assets, Liabilities, Equity and Income",
      ],
      thinkingSeconds: 5,
      researching: "Reading General Ledger as of close of business yesterday.",
      answer:
        "Asset Balance for 2026 is ₦30,000,000,000. Liabilities total ₦20,000,000, Equity is ₦10,000,000,000, and Income year-to-date is ₦5,000,000,000.",
      attachments: SAMPLE_ATTACHMENTS,
    };
  }

  // -- Revenue chart -------------------------------------------------------
  if (p.includes("revenue") || p.includes("income chart")) {
    return {
      id: nextId("a"),
      role: "assistant",
      thinking: [
        "Identifying the requested revenue period",
        "Reading posted Income GL entries for the year",
        "Preparing the trend chart for the selected range",
      ],
      thinkingSeconds: 5,
      researching: "Looking for relevant data.",
      answer:
        "Here's your revenue trend for 2024. Year-to-date revenue is up roughly 21% versus the same period last year, driven mainly by interest income on loans.",
      chart: {
        kind: "line",
        title: "Revenue",
        period: "2024",
        tabs: ["1M", "6M", "YTD", "1YR"],
        activeTab: "1YR",
        xLabels: REVENUE_LABELS,
        series: REVENUE_SERIES.slice(0, 8),
      },
    };
  }

  // -- Asset allocation / "price chart" substitute ------------------------
  if (
    p.includes("allocation") ||
    p.includes("price chart") ||
    p.includes("asset mix") ||
    p.includes("portfolio")
  ) {
    return {
      id: nextId("a"),
      role: "assistant",
      thinking: [
        "Reading the latest balance-sheet snapshot",
        "Grouping balances by asset category",
        "Building the allocation breakdown",
      ],
      thinkingSeconds: 4,
      researching: "Computing share of total assets by category.",
      answer:
        "Here's the asset allocation across the major balance-sheet categories. Loans & Advances remain the largest exposure at 45% of total assets.",
      chart: {
        kind: "pie",
        title: "Asset Allocation",
        period: "This Quarter",
        slices: ASSET_ALLOCATION,
      },
    };
  }

  // -- Add journal entry --------------------------------------------------
  if (p.includes("add journal") || p.includes("journal entry")) {
    return {
      id: nextId("a"),
      role: "assistant",
      thinking: [
        "Confirming your posting permissions",
        "Opening the Manual Journal Entry form",
      ],
      thinkingSeconds: 3,
      researching: "Preparing a draft.",
      answer:
        "I can take you to the Manual Journal Entry form so you can post a new entry. Sensitive posting actions still require your approval before they're committed to the ledger.",
    };
  }

  // -- View clients --------------------------------------------------------
  if (p.includes("client") || p.includes("customer")) {
    return {
      id: nextId("a"),
      role: "assistant",
      thinking: [
        "Checking customer access permissions for your role",
        "Pulling the customer directory for your branch",
      ],
      thinkingSeconds: 4,
      researching: "Retrieving customer summary.",
      answer:
        "Your branch currently has 1,284 active customers. The top-five customers by deposit balance account for ₦4.2bn (≈14% of total deposits).",
    };
  }

  // -- Create new product --------------------------------------------------
  if (p.includes("create") && p.includes("product")) {
    return {
      id: nextId("a"),
      role: "assistant",
      thinking: [
        "Verifying product-management permissions",
        "Loading the product configuration template",
      ],
      thinkingSeconds: 3,
      researching: "Preparing product setup.",
      answer:
        "I can help draft a new product (e.g. a savings or loan product), but final activation requires maker-checker approval and a product-config review before it can accept transactions.",
    };
  }

  // -- Update user role ----------------------------------------------------
  if (p.includes("user role") || p.includes("update role")) {
    return {
      id: nextId("a"),
      role: "assistant",
      thinking: [
        "Verifying admin permissions",
        "Loading the user-role matrix",
      ],
      thinkingSeconds: 4,
      researching: "Preparing role update.",
      answer:
        "Role changes are sensitive and require an approving officer. I can prepare the change for review, but it won't take effect until it's approved in the user-management workflow.",
    };
  }

  // -- Fallback ------------------------------------------------------------
  return {
    id: nextId("a"),
    role: "assistant",
    thinking: [
      "Checking what data is available for your request",
      "Looking across accounting, customer, and product modules",
    ],
    thinkingSeconds: 3,
    researching: "Searching ChainCore.",
    answer:
      "I'm not sure I have a precise match for that yet. Try asking about your balance sheet, revenue trend, asset allocation, journal entries, customers, or product setup.",
  };
}

export function buildUserMessage(text: string): UserMessage {
  return { id: nextId("u"), role: "user", text };
}

export const SUGGESTED_PROMPTS: string[] = [
  "Add Journal Entry",
  "View Balance",
  "Create New Product",
  "View Clients",
  "Update user role",
];
