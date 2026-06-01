// Core AI types and response engine for ChainCore.
//
// This is an OFFLINE engine (no backend / no API key) but it is built to FEEL
// real: it parses free-form questions, computes answers and charts from the
// expanded mock dataset in `@/data/coreaiData`, carries multi-turn context so
// follow-ups work, and falls back conversationally instead of dead-ending.
//
// SAFETY: every "thinking" / "researching" line is curated, user-safe status
// text — never raw model chain-of-thought — per the banking-safety guidance.
// Copy stays banking-appropriate (maker-checker, CBN returns, ₦, chaincore.ng).

import {
  MONTHS,
  MONTHLY_INCOME,
  MONTHLY_EXPENSE,
  MONTHS_POSTED,
  ytd,
  EXPENSE_BY_CATEGORY,
  BRANCH_POSITIONS,
  GROUP_CASH,
  BS_HEADLINES,
  ASSET_MIX,
  TOP_ACCOUNTS,
  PENDING_APPROVALS,
  PENDING_TOTAL,
  TRIAL_BALANCE_TOTALS,
  CBN_RETURNS,
  naira,
  nairaShort,
  FISCAL_YEAR,
} from "@/data/coreaiData";

// ----------------------------------------------------------------- Chart types

export interface ChartLineResponse {
  kind: "line";
  title: string;
  period: string;
  tabs: string[];
  activeTab: string;
  xLabels: string[];
  series: number[];
}

export interface PieSlice {
  label: string;
  value: number; // percentage 0-100
  detail: string; // e.g. "₦40,000,000"
  color: string;
}

export interface ChartPieResponse {
  kind: "pie";
  title: string;
  period: string;
  slices: PieSlice[];
}

export interface BarDatum {
  label: string;
  value: number; // raw value used for bar length
  display: string; // formatted value shown at row end
  color?: string;
}

export interface ChartBarResponse {
  kind: "bar";
  title: string;
  period: string;
  bars: BarDatum[];
}

export type ChartResponse =
  | ChartLineResponse
  | ChartPieResponse
  | ChartBarResponse;

// ------------------------------------------------------------- Attachments

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

// ---------------------------------------------------------------- Messages

// Lifecycle phases used by the streaming renderer.
export type AssistantPhase =
  | "thinking"
  | "researching"
  | "answering"
  | "done";

export interface ScreenContext {
  route: string;
  pageTitle: string;
  module: string;
  visibleSummary: string;
  suggestedPrompts: string[];
}

export interface AssistantMessage {
  id: string;
  role: "assistant";
  // curated status lines (NOT raw chain-of-thought)
  thinking: string[];
  thinkingSeconds: number;
  researching: string;
  answer: string;
  chart?: ChartResponse;
  attachments?: Attachments;
  followUps?: string[];
  /** Optional follow-up navigation triggered once the answer streams in.
   *  Used for "open it" style actions where Core AI takes the user somewhere. */
  action?: {
    kind: "navigate";
    href: string;
    label: string; // what to call the destination in the answer
  };
  // streaming state — driven by the provider as the response "plays"
  phase: AssistantPhase;
  // index of thinking lines revealed so far (for the live animation)
  revealedThinking: number;
  // characters of `answer` revealed so far (for the typing effect)
  revealedChars: number;
}

export interface UserMessage {
  id: string;
  role: "user";
  text: string;
}

export type CoreAIMessage = AssistantMessage | UserMessage;

// Topic carried between turns so follow-ups ("break that down by branch",
// "compare to last month") resolve against the right subject.
export type Topic =
  | "cash"
  | "expenses"
  | "income"
  | "revenue"
  | "net"
  | "assets"
  | "trial-balance"
  | "approvals"
  | "top-accounts"
  | "cbn"
  | "clients"
  | "none";

export interface ConversationContext {
  topic: Topic;
  /** The last specific entity Core AI named in its previous answer. Used to
   *  resolve "it" / "that entry" / "open it" across turns. Reset when the
   *  next turn introduces a new entity or switches topic away. */
  lastEntity?: {
    kind: "journal";
    id: string; // e.g. "JV-2037"
  };
}

const DEFAULT_FOLLOW_UPS = [
  "Show revenue trend",
  "Compare assets and liabilities",
  "Open related journal entries",
  "Export this report",
];

// --------------------------------------------------------- sample attachments

const SAMPLE_ATTACHMENTS: Attachments = {
  documents: [
    { id: "d1", name: "Trial-Balance-Q2-2026.pdf" },
    { id: "d2", name: "CBN-Prudential-Returns.pdf" },
    { id: "d3", name: "Branch-Performance-May.pdf" },
    { id: "d4", name: "GL-Reconciliation-Summary.pdf" },
  ],
  links: [
    { id: "l1", label: "ledger.chaincore.ng/reports/balance-sheet" },
    { id: "l2", label: "ledger.chaincore.ng/reports/trial-balance" },
    { id: "l3", label: "ledger.chaincore.ng/approvals/pending" },
    { id: "l4", label: "ledger.chaincore.ng/returns/cbn" },
  ],
  images: [
    { id: "i1", name: "cash-position-snapshot.png" },
    { id: "i2", name: "revenue-trend.png" },
    { id: "i3", name: "branch-heatmap.png" },
    { id: "i4", name: "expense-breakdown.png" },
  ],
};

// ------------------------------------------------------------- ID helpers

let messageCounter = 0;
const nextId = (prefix: string) => `${prefix}-${++messageCounter}`;

export function buildUserMessage(text: string): UserMessage {
  return { id: nextId("u"), role: "user", text };
}

// Build a fresh assistant message in its initial (pre-stream) state.
function assistant(
  partial: Omit<
    AssistantMessage,
    "id" | "role" | "phase" | "revealedThinking" | "revealedChars"
  >
): AssistantMessage {
  return {
    id: nextId("a"),
    role: "assistant",
    phase: "thinking",
    revealedThinking: 0,
    revealedChars: 0,
    followUps: partial.followUps ?? DEFAULT_FOLLOW_UPS,
    ...partial,
  };
}

// ---------------------------------------------------------- intent parsing

function clean(s: string): string {
  return s.trim().toLowerCase();
}

function hasAny(p: string, words: string[]): boolean {
  return words.some((w) => p.includes(w));
}

// Detect a time window mentioned in the prompt.
function detectPeriod(p: string): { label: string; count: number } {
  if (hasAny(p, ["this month", "current month", "mtd"]))
    return { label: `${MONTHS[MONTHS_POSTED - 1]} ${FISCAL_YEAR}`, count: MONTHS_POSTED };
  if (hasAny(p, ["last month", "previous month"]))
    return { label: `${MONTHS[MONTHS_POSTED - 2]} ${FISCAL_YEAR}`, count: MONTHS_POSTED - 1 };
  if (hasAny(p, ["q1", "first quarter"]))
    return { label: `Q1 ${FISCAL_YEAR}`, count: 3 };
  if (hasAny(p, ["q2", "second quarter"]))
    return { label: `Q2 ${FISCAL_YEAR}`, count: 6 };
  if (hasAny(p, ["6 month", "six month", "half year", "h1"]))
    return { label: `H1 ${FISCAL_YEAR}`, count: 6 };
  if (hasAny(p, ["year", "ytd", "annual", "12 month", "full year"]))
    return { label: `${FISCAL_YEAR} YTD`, count: 12 };
  return { label: `${FISCAL_YEAR} YTD`, count: MONTHS_POSTED };
}

function pctSlices(items: { label: string; amount: number; color: string }[]): PieSlice[] {
  const total = items.reduce((s, x) => s + x.amount, 0) || 1;
  return items.map((x) => ({
    label: x.label,
    value: Math.round((x.amount / total) * 100),
    detail: naira(x.amount),
    color: x.color,
  }));
}

// ----------------------------------------------------------- the engine

// Contextual follow-up chips per topic. These replace the old generic four
// so the suggestions always relate to the answer the user just received.
const FOLLOW_UPS_BY_TOPIC: Record<Topic, string[]> = {
  cash: ["Compare to last month", "Show idle cash by branch", "Export cash position"],
  expenses: ["Show expense trend", "Compare to income", "Which branch spent most?"],
  income: ["Compare to expenses", "Break down by source", "Export income report"],
  revenue: ["Compare to last year", "Break down by branch", "Export revenue report"],
  net: ["Show revenue trend", "Show expense breakdown", "Export P&L summary"],
  assets: ["Show liabilities", "View loan book", "Export balance sheet"],
  "trial-balance": ["View pending approvals", "Open the journal", "Export trial balance"],
  approvals: ["Approve all pending", "Filter by branch", "Open the journal"],
  "top-accounts": ["Show account trend", "View GL hierarchy", "Export account list"],
  cbn: ["View capital adequacy", "List outstanding items", "Export CBN return"],
  clients: ["Top depositors", "New accounts this month", "Export client list"],
  none: ["Show revenue trend", "View pending approvals", "Summarize this page"],
};

export function buildAssistantResponse(
  prompt: string,
  ctx: ConversationContext,
  screen?: ScreenContext
): { message: AssistantMessage; context: ConversationContext } {
  const result = buildResponseInner(prompt, ctx, screen);
  // If a branch didn't supply its own follow-ups (i.e. it fell back to the
  // default), replace them with topic-contextual ones.
  const m = result.message;
  const usedDefault =
    !m.followUps ||
    m.followUps === DEFAULT_FOLLOW_UPS ||
    sameArray(m.followUps, DEFAULT_FOLLOW_UPS);
  if (usedDefault) {
    m.followUps = FOLLOW_UPS_BY_TOPIC[result.context.topic] ?? FOLLOW_UPS_BY_TOPIC.none;
  }
  return result;
}

function sameArray(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

function buildResponseInner(
  prompt: string,
  ctx: ConversationContext,
  screen?: ScreenContext
): { message: AssistantMessage; context: ConversationContext } {
  const p = clean(prompt);

  const wantsScreenSummary = hasAny(p, [
    "this screen",
    "this page",
    "this view",
    "what am i looking at",
    "what is this",
    "what's this",
    "what is on this page",
    "what is on this screen",
    "what's on this page",
    "what's on this screen",
    "summarize page",
    "summarise page",
    "summarize this",
    "summarise this",
    "summary of this page",
    "summary of this",
    "explain this page",
    "explain this screen",
    "explain this",
    "describe this page",
    "what can i do here",
    "what can i do on this page",
    "based on this page",
    "visible data",
    "tell me about this",
    "walk me through this",
    "give me a summary",
  ]);

  if (screen && wantsScreenSummary) {
    return {
      context: { topic: ctx.topic },
      message: assistant({
        thinking: [
          "Reading the active ChainCore workspace",
          "Checking the visible module and screen state",
        ],
        thinkingSeconds: 2,
        researching: `Using the current ${screen.pageTitle} page context.`,
        answer: `You are currently on ${screen.pageTitle} in the ${screen.module} module. ${screen.visibleSummary}`,
        followUps: screen.suggestedPrompts,
      }),
    };
  }

  const wantsBranchBreakdown = hasAny(p, ["by branch", "per branch", "each branch", "branches"]);
  const wantsCategoryBreakdown = hasAny(p, ["by category", "per category", "breakdown", "break down", "break it down"]);
  const isBareFollowup =
    p.length < 40 &&
    hasAny(p, ["that", "those", "it", "this", "them", "more", "instead", "again"]) &&
    !hasAny(p, ["balance", "cash", "expense", "revenue", "income", "asset", "client", "approval", "trial", "cbn"]);
  // An income-vs-expense comparison must win over the plain expenses block,
  // even though the text contains the word "expense".
  const wantsComparison =
    hasAny(p, ["income", "revenue", "profit", "net income", "earnings"]) &&
    hasAny(p, ["expense", "expenses", "cost", "costs", "vs", "versus", "against", "compare", "comparison", "v ", "stack up"]);

  // -------------------------------------------------------- CASH POSITION
  // Outflow-direction phrases like "where is the money going" should fall
  // through to expenses, not cash.
  const moneyOutflow =
    hasAny(p, ["money"]) &&
    hasAny(p, ["going", "spent on", "spend on", "spend it", "outflow", "leaving", "leaks", "leaving us"]);
  if (
    !moneyOutflow &&
    (hasAny(p, [
      "cash position", "cash across", "how much cash", "total cash", "liquidity",
      "cash do we have", "money", "funds", "available funds", "what do we have",
      "how much money", "how much do we have", "treasury position", "cash on hand",
      "money in the bank", "available cash", "group cash", "vault", "float",
      "cash balance", "liquid", "any money",
    ]) ||
    (hasAny(p, ["cash"]) && hasAny(p, ["branch", "total", "position", "have", "much", "available"])) ||
    (ctx.topic === "cash" && (wantsBranchBreakdown || isBareFollowup)))
  ) {
    const bars: BarDatum[] = BRANCH_POSITIONS.map((b) => ({
      label: b.branch,
      value: b.cash,
      display: nairaShort(b.cash),
      color: b.color,
    }));
    return {
      context: { topic: "cash" },
      message: assistant({
        thinking: [
          "Checking your branch-level access permissions",
          "Reading available cash balances across all branches",
          "Aggregating the group cash position",
        ],
        thinkingSeconds: 4,
        researching: "Reading cash & balances GL as of close of business yesterday.",
        answer: `Your total group cash position is ${naira(GROUP_CASH)} across ${BRANCH_POSITIONS.length} branches. Lagos (HQ) holds the largest share at ${naira(BRANCH_POSITIONS[0].cash)} (${Math.round((BRANCH_POSITIONS[0].cash / GROUP_CASH) * 100)}% of the total). Here's the breakdown by branch:`,
        chart: { kind: "bar", title: "Cash by Branch", period: "As of yesterday", bars },
        attachments: SAMPLE_ATTACHMENTS,
      }),
    };
  }

  // ------------------------------------------------------ EXPENSES (category)
  if (
    !wantsComparison &&
    (hasAny(p, [
      "expense", "expenses", "spend", "spent", "spending", "cost", "costs", "opex",
      "operating cost", "operating costs", "outflow", "outgoing", "overhead",
      "overheads", "where is the money going", "where does the money go",
      "where did we spend", "burn", "what are we paying for", "money going",
    ]) ||
      (ctx.topic === "expenses" && (wantsCategoryBreakdown || isBareFollowup)))
  ) {
    const period = detectPeriod(p);
    if (hasAny(p, ["trend", "over time", "monthly", "month by month", "chart over", "history", "historical", "track", "tracking", "movement"])) {
      const series = MONTHLY_EXPENSE.slice(0, period.count);
      return {
        context: { topic: "expenses" },
        message: assistant({
          thinking: [
            "Identifying the requested expense period",
            "Reading posted expense GL entries month by month",
            "Building the trend chart",
          ],
          thinkingSeconds: 4,
          researching: "Aggregating expense GL postings by month.",
          answer: `Here's your operating-expense trend for ${period.label}. Spend has grown steadily, ending at ${naira(series[series.length - 1])} in the latest posted month.`,
          chart: {
            kind: "line",
            title: "Operating Expenses",
            period: period.label,
            tabs: ["1M", "6M", "YTD", "1YR"],
            activeTab: "YTD",
            xLabels: MONTHS.slice(0, period.count) as unknown as string[],
            series,
          },
        }),
      };
    }
    const bars: BarDatum[] = EXPENSE_BY_CATEGORY.map((c) => ({
      label: c.label,
      value: c.amount,
      display: nairaShort(c.amount),
      color: c.color,
    }));
    const total = EXPENSE_BY_CATEGORY.reduce((s, c) => s + c.amount, 0);
    return {
      context: { topic: "expenses" },
      message: assistant({
        thinking: [
          "Confirming your reporting permissions",
          "Reading expense GL postings for the period",
          "Grouping spend by expense category",
        ],
        thinkingSeconds: 5,
        researching: "Grouping posted expenses by category.",
        answer: `Total operating expenses for ${period.label} are ${naira(total)}. Staff Costs are the largest line at ${naira(EXPENSE_BY_CATEGORY[0].amount)} (${Math.round((EXPENSE_BY_CATEGORY[0].amount / total) * 100)}%). Here's the breakdown by category:`,
        chart: { kind: "bar", title: "Expenses by Category", period: period.label, bars },
        attachments: SAMPLE_ATTACHMENTS,
      }),
    };
  }

  // ------------------------------------------- INCOME vs EXPENSE comparison
  if (
    (hasAny(p, ["income"]) && hasAny(p, ["expense", "expenses", "cost", "costs", "vs", "versus", "against", "compare"])) ||
    hasAny(p, ["profit", "net income", "bottom line", "income vs", "are we profitable", "making money", "margin", "p&l", "p and l", "profit and loss"])
  ) {
    const period = detectPeriod(p);
    const inc = ytd(MONTHLY_INCOME);
    const exp = ytd(MONTHLY_EXPENSE);
    const net = inc - exp;
    const bars: BarDatum[] = [
      { label: "Income", value: inc, display: nairaShort(inc), color: "#3157F6" },
      { label: "Expenses", value: exp, display: nairaShort(exp), color: "#1E2A78" },
      { label: "Net", value: net, display: nairaShort(net), color: "#5B79FF" },
    ];
    return {
      context: { topic: "net" },
      message: assistant({
        thinking: [
          "Reading income and expense GL totals",
          "Computing net income for the period",
        ],
        thinkingSeconds: 4,
        researching: "Reconciling income vs expense postings.",
        answer: `For ${period.label}, income is ${naira(inc)} against expenses of ${naira(exp)}, giving a net income of ${naira(net)} — a margin of ${Math.round((net / inc) * 100)}%.`,
        chart: { kind: "bar", title: "Income vs Expenses", period: period.label, bars },
      }),
    };
  }

  // -------------------------------------------------- REVENUE / INCOME trend
  if (hasAny(p, ["revenue", "income", "earnings", "turnover", "top line", "interest income", "fee income", "what came in", "money coming in", "inflow", "inflows"])) {
    const period = detectPeriod(p);
    const series = MONTHLY_INCOME.slice(0, period.count);
    const total = series.reduce((s, x) => s + x, 0);
    return {
      context: { topic: "revenue" },
      message: assistant({
        thinking: [
          "Identifying the requested revenue period",
          "Reading posted income GL entries for the range",
          "Preparing the trend chart",
        ],
        thinkingSeconds: 5,
        researching: "Looking across interest income, fees and FX lines.",
        answer: `Here's your revenue trend for ${period.label}. Total income over the period is ${naira(total)}, driven mainly by interest income on loans, and rising month-on-month.`,
        chart: {
          kind: "line",
          title: "Revenue",
          period: "2024",
          tabs: ["1M", "6M", "YTD", "1YR"],
          activeTab: "YTD",
          xLabels: MONTHS.slice(0, period.count) as unknown as string[],
          series,
        },
      }),
    };
  }

  // ---------------------------------------------------------- ASSET MIX
  if (
    hasAny(p, [
      "asset allocation", "asset mix", "allocation", "portfolio", "balance sheet",
      "view balance", "financial position", "assets", "loan book", "loan portfolio",
      "what do we own", "what we own", "exposures", "exposure", "holdings",
      "what are we holding", "statement of financial position", "where the money sits",
    ]) ||
    (ctx.topic === "assets" && isBareFollowup)
  ) {
    if (hasAny(p, ["allocation", "mix", "portfolio", "breakdown", "by category"])) {
      return {
        context: { topic: "assets" },
        message: assistant({
          thinking: [
            "Reading the latest balance-sheet snapshot",
            "Grouping balances by asset class",
            "Building the allocation breakdown",
          ],
          thinkingSeconds: 4,
          researching: "Computing share of total assets by class.",
          answer: `Here's the asset allocation across the major balance-sheet classes. Loans & Advances remain the largest exposure at ${naira(ASSET_MIX[0].amount)}.`,
          chart: { kind: "pie", title: "Asset Allocation", period: "This Quarter", slices: pctSlices(ASSET_MIX) },
        }),
      };
    }
    return {
      context: { topic: "assets" },
      message: assistant({
        thinking: [
          "Checking your access to balance-sheet reporting",
          "Pulling the latest General Ledger totals",
          "Summarising Assets, Liabilities and Equity",
        ],
        thinkingSeconds: 5,
        researching: "Reading the balance sheet as of close of business yesterday.",
        answer: `Total assets stand at ${naira(BS_HEADLINES.totalAssets)}, against liabilities of ${naira(BS_HEADLINES.totalLiabilities)}, leaving equity of ${naira(BS_HEADLINES.totalEquity)}. Loans & advances are ${naira(BS_HEADLINES.loansAndAdvances)} and customer deposits are ${naira(BS_HEADLINES.customerDeposits)}.`,
        chart: { kind: "pie", title: "Asset Allocation", period: "This Quarter", slices: pctSlices(ASSET_MIX) },
        attachments: SAMPLE_ATTACHMENTS,
      }),
    };
  }

  // ------------------------------------------------------- TRIAL BALANCE
  if (hasAny(p, [
    "trial balance", "balanced", "debit", "credit", "out of balance", "off by",
    "off by 240", "variance", "books balanced", "books are balanced",
    "the books", "books", "ledger position", "ledger balance", "ledger balanced",
    "are we square", "square", "reconcile", "reconciled", "reconciles",
    "do the totals tie", "totals tie", "do the totals reconcile", "tie out",
    "tied out", "in balance", "ledger off", "control totals",
    "tb", "tb balanced", "out by", "doesn't balance", "doesn't tie",
    "won't balance", "what's wrong with the trial",
  ])) {
    const { debit, credit } = TRIAL_BALANCE_TOTALS;
    const diff = debit - credit;
    const variance = Math.abs(diff);
    const balanced = diff === 0;

    if (balanced) {
      return {
        context: { topic: "trial-balance" },
        message: assistant({
          thinking: [
            "Reading total debit and credit postings",
            "Comparing the two control totals",
          ],
          thinkingSeconds: 3,
          researching: "Summing all posted debits and credits.",
          answer: `Your trial balance is in balance. Total debits and total credits both equal ${naira(debit)}, so the difference is ₦0. You're clear to proceed to reporting.`,
        }),
      };
    }

    // There's a variance — investigate. Look in the pending queue for an
    // entry whose amount matches the variance, or one already flagged as
    // the cause. This is the cross-data step that turns retrieval into
    // analysis.
    const culprit = PENDING_APPROVALS.find(
      (a) => a.causesVariance || a.amount === variance
    );
    const side = diff > 0 ? "debit" : "credit";

    if (culprit) {
      // Carry the entry into the conversation context so the next turn can
      // resolve "open it" / "that entry" to this specific JV.
      return {
        context: {
          topic: "trial-balance",
          lastEntity: { kind: "journal", id: culprit.id },
        },
        message: assistant({
          thinking: [
            "Reading total debit and credit postings",
            "Confirming the variance is real and not a rounding artefact",
            "Searching the pending journal queue for entries that could explain it",
            "Matching the variance amount against open entries",
          ],
          thinkingSeconds: 5,
          researching: `Cross-checking the variance against the maker-checker queue.`,
          answer:
            `Your trial balance is out by ${naira(variance)}. ` +
            `Debits total ${naira(debit)} against credits of ${naira(credit)}, so you're carrying ${naira(variance)} more on the ${side} side.\n\n` +
            `The most common cause is a one-sided journal. I checked your queue and there's one entry that fits: ${culprit.id}, raised by ${culprit.maker} (${culprit.submitted.toLowerCase()}) — ${culprit.description.toLowerCase()} for exactly ${naira(culprit.amount)}.` +
            (culprit.rootCause
              ? ` ${culprit.rootCause}${culprit.rootAccount ? ` The mapping gap is on account ${culprit.rootAccount}.` : ""}`
              : "") +
            `\n\nWant me to open ${culprit.id} so you can correct it?`,
          followUps: [
            `Open ${culprit.id}`,
            `Who is the duty checker tonight?`,
            `Show all pending approvals`,
          ],
          action: {
            kind: "navigate",
            href: `/accounting/journal?focus=${encodeURIComponent(culprit.id)}`,
            label: culprit.id,
          },
        }),
      };
    }

    // Variance but no matching entry found — answer honestly, no false claims.
    return {
      context: { topic: "trial-balance" },
      message: assistant({
        thinking: [
          "Reading total debit and credit postings",
          "Searching the pending queue for matching amounts",
        ],
        thinkingSeconds: 3,
        researching: "Looking across the queue.",
        answer: `Your trial balance is out by ${naira(variance)}. Debits total ${naira(debit)} against credits of ${naira(credit)}. I checked your pending queue but didn't find an entry matching the variance — it may be sitting in an earlier period, or split across two entries. I'd start by reviewing recent postings.`,
      }),
    };
  }

  // -------------------------------------- OPEN <journal> / OPEN IT / etc.
  // Resolves "open it", "open that entry", "show me", or an explicit JV id.
  {
    // Try to find an explicit JV id in the prompt (handles "open JV-2037",
    // "show JV2037", etc.).
    const explicitId = (() => {
      const m = p.match(/\bjv[-\s]?(\d{3,5})\b/i);
      return m ? `JV-${m[1]}` : null;
    })();

    const wantsToOpen =
      hasAny(p, [
        "open it",
        "open that",
        "open the entry",
        "open the journal",
        "show it",
        "show that entry",
        "show the entry",
        "take me to it",
        "go to it",
        "let's correct",
        "let me see it",
        "view it",
      ]) ||
      !!explicitId ||
      (ctx.lastEntity && hasAny(p, ["open", "show", "view", "correct"]) && p.length < 30);

    if (wantsToOpen) {
      const targetId = explicitId ?? ctx.lastEntity?.id;
      if (targetId) {
        const entry = PENDING_APPROVALS.find((a) => a.id === targetId);
        if (entry) {
          return {
            context: {
              topic: "approvals",
              lastEntity: { kind: "journal", id: entry.id },
            },
            message: assistant({
              thinking: [
                `Locating ${entry.id} in the journal`,
                "Preparing the correction view",
              ],
              thinkingSeconds: 2,
              researching: `Opening ${entry.id} for review.`,
              answer:
                `Opening ${entry.id} now. ` +
                (entry.rootAccount
                  ? `I've highlighted the unbalanced line — the credit side is blank where it should reference account ${entry.rootAccount}. `
                  : "") +
                `Once you save the correction it goes back into the maker-checker queue. You can't auto-approve your own correction; an authorised checker will need to sign it off.`,
              followUps: [
                "Who is the duty checker tonight?",
                "Show all pending approvals",
                "What does period mapping mean?",
              ],
              action: {
                kind: "navigate",
                href: `/accounting/journal?focus=${encodeURIComponent(entry.id)}`,
                label: entry.id,
              },
            }),
          };
        }
      }
      // Fall through to other handlers if we can't resolve a target.
    }
  }

  // -------------------- Who is the duty checker tonight? (follow-on Q) --
  if (hasAny(p, ["duty checker", "who is the checker", "who approves", "approver tonight", "duty officer"])) {
    return {
      context: { topic: ctx.topic, lastEntity: ctx.lastEntity },
      message: assistant({
        thinking: ["Reading the duty roster"],
        thinkingSeconds: 2,
        researching: "Checking tonight's roster.",
        answer:
          "B. Adeyemi is on duty tonight as authorised checker. Her queue is usually cleared by 6pm. " +
          "If the correction is urgent and she's away, the escalation path is the Finance Manager for your branch.",
      }),
    };
  }

  // ------------------------------ Glossary: what does period mapping mean? --
  if (hasAny(p, ["period mapping", "what does period mapping", "what is period mapping"])) {
    return {
      context: { topic: ctx.topic, lastEntity: ctx.lastEntity },
      message: assistant({
        thinking: ["Pulling the glossary entry"],
        thinkingSeconds: 1,
        researching: "",
        answer:
          "Every GL account needs to be mapped to the accounting periods it can post to. If an account is missing the mapping for the current period, the system accepts one side of a journal (usually the debit) but silently drops the matching credit — leaving the trial balance out. It's a setup gap, not a posting error, so the fix is in the account configuration rather than the journal itself.",
      }),
    };
  }

  // ---------------------------------------------------- PENDING APPROVALS
  if (
    hasAny(p, [
      "pending", "awaiting approval", "approve", "approval", "approvals", "maker",
      "checker", "to approve", "sign off", "sign-off", "need approving",
      "waiting for me", "in my queue", "my queue", "queue", "to sign",
      "needs signing", "what needs my attention", "what needs attention",
      "what's waiting", "outstanding entries", "waiting on me", "anything for me to approve",
    ])
  ) {
    const lines = PENDING_APPROVALS.map(
      (a) => `• ${a.id} — ${a.description}: ${naira(a.amount)} (raised by ${a.maker}, ${a.submitted})`
    ).join("\n");
    return {
      context: { topic: "approvals" },
      message: assistant({
        thinking: [
          "Checking your approver role and limits",
          "Reading the maker-checker queue",
          "Listing entries awaiting your sign-off",
        ],
        thinkingSeconds: 4,
        researching: "Reading the pending maker-checker queue.",
        answer: `You have ${PENDING_APPROVALS.length} journal entries awaiting approval, totalling ${naira(PENDING_TOTAL)}:\n\n${lines}\n\nThese remain uncommitted to the ledger until an authorised checker approves them.`,
        attachments: SAMPLE_ATTACHMENTS,
      }),
    };
  }

  // ----------------------------------------------------- TOP ACCOUNTS
  if (hasAny(p, [
    "top account", "highest balance", "largest account", "biggest account",
    "top gl", "largest balance", "biggest balance", "biggest exposures",
    "largest exposures", "where is the most money", "ranking", "rank accounts",
    "top 5 accounts", "top five accounts", "largest gl",
  ])) {
    const bars: BarDatum[] = TOP_ACCOUNTS.map((a) => ({
      label: a.code,
      value: a.balance,
      display: nairaShort(a.balance),
      color: "#3157F6",
    }));
    const list = TOP_ACCOUNTS.map((a) => `• ${a.code} ${a.name} — ${naira(a.balance)}`).join("\n");
    return {
      context: { topic: "top-accounts" },
      message: assistant({
        thinking: [
          "Reading GL account balances",
          "Ranking accounts by closing balance",
        ],
        thinkingSeconds: 3,
        researching: "Sorting the General Ledger by balance.",
        answer: `Your five largest GL accounts by balance are:\n\n${list}`,
        chart: { kind: "bar", title: "Top Accounts by Balance", period: "Current", bars },
      }),
    };
  }

  // ---------------------------------------------------------------- CBN
  if (hasAny(p, [
    "cbn", "prudential", "regulatory return", "regulatory returns", "returns",
    "capital adequacy", "compliance", "are we ready", "ready for cbn",
    "regulator", "regulators", "submission", "liquidity ratio", "car",
    "regulatory", "exception report", "supervisory", "supervision",
    "any breaches", "in breach", "breaching", "any issues with cbn",
  ])) {
    return {
      context: { topic: "cbn" },
      message: assistant({
        thinking: [
          "Checking compliance-module access",
          "Reading regulatory ratios and outstanding items",
        ],
        thinkingSeconds: 4,
        researching: "Reading CBN Prudential Returns status.",
        answer: `Your next CBN Prudential Return is due ${CBN_RETURNS.nextDue}. Capital Adequacy Ratio is ${CBN_RETURNS.capitalAdequacyRatio}% (regulatory minimum 15%) and Liquidity Ratio is ${CBN_RETURNS.liquidityRatio}% (minimum 30%) — both comfortably above threshold. There ${CBN_RETURNS.outstandingItems === 1 ? "is" : "are"} ${CBN_RETURNS.outstandingItems} outstanding reconciliation item${CBN_RETURNS.outstandingItems === 1 ? "" : "s"} to clear before submission.`,
        attachments: SAMPLE_ATTACHMENTS,
      }),
    };
  }

  // ------------------------------------------------------------ CLIENTS
  if (hasAny(p, [
    "client", "clients", "customer", "customers", "depositor", "depositors",
    "account holder", "account holders", "view clients", "show clients",
    "how many customers", "customer base", "kyc",
  ])) {
    return {
      context: { topic: "clients" },
      message: assistant({
        thinking: [
          "Checking customer-access permissions for your role",
          "Reading the customer directory for your branch",
        ],
        thinkingSeconds: 4,
        researching: "Retrieving customer summary.",
        answer: `Your branch currently has 1,284 active customers. The top five by deposit balance hold ${naira(4_200_000_000)} between them, about 14% of total deposits.`,
      }),
    };
  }

  // ------------------------------------------------------- ACTION: journal
  if (hasAny(p, ["add journal", "add journal entry", "journal entry", "post entry", "manual journal", "new entry"])) {
    return {
      context: { topic: "none" },
      message: assistant({
        thinking: [
          "Confirming your posting permissions",
          "Preparing the Manual Journal Entry form",
        ],
        thinkingSeconds: 3,
        researching: "Setting up a draft entry.",
        answer: "I can take you to the Manual Journal Entry form to post a new entry. Note that posted entries still go through maker-checker approval before they're committed to the ledger.",
      }),
    };
  }

  // ------------------------------------------------------- ACTION: product
  if (hasAny(p, ["create product", "create new product", "new product", "set up product", "product setup"])) {
    return {
      context: { topic: "none" },
      message: assistant({
        thinking: [
          "Verifying product-management permissions",
          "Loading the product configuration template",
        ],
        thinkingSeconds: 3,
        researching: "Preparing product setup.",
        answer: "I can help draft a new savings or loan product, but final activation requires maker-checker approval and a product-config review before it can accept transactions.",
      }),
    };
  }

  // ----------------------------------------------------- ACTION: user role
  if (hasAny(p, ["user role", "update user role", "update role", "permission", "access right", "change role"])) {
    return {
      context: { topic: "none" },
      message: assistant({
        thinking: [
          "Verifying admin permissions",
          "Loading the user-role matrix",
        ],
        thinkingSeconds: 4,
        researching: "Preparing role update.",
        answer: "Role changes are sensitive and need an approving officer. I can prepare the change for review, but it won't take effect until it's approved in the user-management workflow.",
      }),
    };
  }

  // ------------------------------------------------- Greeting / smalltalk
  if (hasAny(p, ["hello", "hi ", "hey", "good morning", "good afternoon", "good evening", "morning", "afternoon", "evening", "yo", "hiya", "howdy", "what's up", "whats up"]) && p.length < 30) {
    return {
      context: { topic: "none" },
      message: assistant({
        thinking: ["Getting your workspace context ready"],
        thinkingSeconds: 1,
        researching: "",
        answer: "Hello! I'm Core AI. I can help you with your cash position, revenue and expenses, the balance sheet, trial balance, pending approvals, CBN returns, and more. What would you like to look at?",
      }),
    };
  }

  // ---------------------------------------------------- Smart fallback
  //
  // The engine didn't match a specific intent. Rather than dumping a menu,
  // we try two graceful paths:
  //   1. If the user is on a real banking page, fall through to summarising
  //      that page — most "unmatched" questions on a page are actually
  //      questions about that page.
  //   2. Otherwise, respond like a colleague who didn't quite hear the
  //      question — short, references the current topic, suggests just two
  //      likely guesses based on the words actually used.

  // Path 1: screen-aware fallback. Re-use the same screen-summary response
  // shape, but with copy that acknowledges the engine wasn't certain.
  if (screen) {
    return {
      context: { topic: ctx.topic },
      message: assistant({
        thinking: [
          "Looking at the active ChainCore screen",
          "Summarising what's visible",
        ],
        thinkingSeconds: 2,
        researching: `Using the ${screen.pageTitle} page as context.`,
        answer:
          `I'm not sure I caught the specific question, so let me start from what's in front of you. You're on ${screen.pageTitle} in the ${screen.module} module. ${screen.visibleSummary}\n\nIf this wasn't what you meant, the chips below cover the most common things asked from here.`,
        followUps: screen.suggestedPrompts,
      }),
    };
  }

  // Path 2: no page context. Best-guess short reply based on word hints.
  const guess = guessIntent(p, ctx);
  return {
    context: { topic: ctx.topic },
    message: assistant({
      thinking: ["Listening more carefully to the question"],
      thinkingSeconds: 1,
      researching: "",
      answer: guess.answer,
      followUps: guess.followUps,
    }),
  };
}

/**
 * Best-effort guess at what the user might have meant when no specific
 * intent matched and there's no page to fall back on. Looks for soft
 * hints in the words and the current topic.
 */
function guessIntent(
  p: string,
  ctx: ConversationContext
): { answer: string; followUps: string[] } {
  // If we're already mid-topic, lean into that topic.
  if (ctx.topic !== "none") {
    const topicReadable: Record<Topic, string> = {
      cash: "your cash position",
      expenses: "expenses",
      income: "income",
      revenue: "revenue",
      net: "income vs expenses",
      assets: "the balance sheet",
      "trial-balance": "the trial balance",
      approvals: "pending approvals",
      "top-accounts": "your top GL accounts",
      cbn: "CBN returns",
      clients: "customers",
      none: "your last question",
    };
    return {
      answer: `I'm not sure I followed — we were just on ${topicReadable[ctx.topic]}. Did you want to dig deeper into that, or move on to something else?`,
      followUps: FOLLOW_UPS_BY_TOPIC[ctx.topic] ?? FOLLOW_UPS_BY_TOPIC.none,
    };
  }

  // Soft word hints — pick the two most likely things they might have meant.
  const hints: Array<{ key: string; chip: string }> = [];
  if (hasAny(p, ["money", "fund", "cash", "liquid", "have"])) hints.push({ key: "cash", chip: "Show cash position by branch" });
  if (hasAny(p, ["balance", "asset", "liabili", "equity", "sheet", "own"])) hints.push({ key: "assets", chip: "Show the balance sheet" });
  if (hasAny(p, ["tie", "square", "match", "book", "ledger", "debit", "credit", "off", "balanc"])) hints.push({ key: "tb", chip: "Is my trial balance balanced?" });
  if (hasAny(p, ["pending", "approve", "queue", "sign", "wait", "outstanding"])) hints.push({ key: "approvals", chip: "What's pending approval?" });
  if (hasAny(p, ["spend", "cost", "expens", "outflow", "burn"])) hints.push({ key: "expenses", chip: "Break expenses down by category" });
  if (hasAny(p, ["earn", "revenue", "income", "profit", "margin"])) hints.push({ key: "revenue", chip: "Show me revenue trend" });
  if (hasAny(p, ["cbn", "regul", "compliance", "submit", "ratio"])) hints.push({ key: "cbn", chip: "Are we ready for CBN returns?" });
  if (hasAny(p, ["who", "customer", "client", "depositor"])) hints.push({ key: "clients", chip: "Show me customer summary" });

  if (hints.length > 0) {
    const top = hints.slice(0, 2);
    return {
      answer: `I'm not sure I caught that. Did you mean one of these?`,
      followUps: top.map((h) => h.chip),
    };
  }

  // Genuine novel question — short, honest.
  return {
    answer:
      "I'm not sure I followed that. I'm best with questions about your cash, balance sheet, trial balance, journal approvals, or CBN returns. Try rephrasing, or pick one of these:",
    followUps: ["Show me my cash position", "What's pending approval?"],
  };
}

// --------------------------------------------------------- suggested prompts

export const SUGGESTED_PROMPTS: string[] = [
  "Add Journal Entry",
  "View Balance",
  "Create New Product",
  "View Clients",
  "Update user role",
];


export function getScreenContext(pathname: string): ScreenContext {
  if (pathname.includes("/accounting/journal/create")) {
    return {
      route: pathname,
      pageTitle: "Create Manual Journal Entry",
      module: "Accounting",
      visibleSummary: "This screen is used to prepare debit and credit line items, select organisation level details, set the transaction date, add notes, and submit the journal for maker-checker approval.",
      suggestedPrompts: ["Explain this journal form", "Check if debits and credits balance", "What approval happens after create?", "Show related GL accounts"],
    };
  }
  if (pathname.includes("/accounting/journal")) {
    return {
      route: pathname,
      pageTitle: "Journal Entries",
      module: "Accounting",
      visibleSummary: "This page lists journal entries with entry time, total amount, transaction date, user, category, approval status, and expandable debit/credit details.",
      suggestedPrompts: ["Summarize visible entries", "Explain approved status", "Show manual entries", "Find unusual journal activity"],
    };
  }
  if (pathname.includes("/accounting/charts-of-account/create")) {
    return {
      route: pathname,
      pageTitle: "Create New General Ledger",
      module: "Accounting",
      visibleSummary: "This form creates a new GL account with account name, code, hierarchy type, header account, head-office visibility, and notes.",
      suggestedPrompts: ["Explain GL hierarchy", "What code should I use?", "What is a posting account?", "What approval is required?"],
    };
  }
  if (pathname.includes("/accounting/charts-of-account")) {
    return {
      route: pathname,
      pageTitle: "Charts of Account",
      module: "Accounting",
      visibleSummary: "This screen shows the account hierarchy across All, Asset, Liability, Equity, Income, and Expense tabs, with search, filters, export, and GL account creation.",
      suggestedPrompts: ["Explain this GL hierarchy", "Show asset accounts", "Find income accounts", "Help create a new GL"],
    };
  }
  if (pathname.includes("/accounting/balance-sheet")) {
    return {
      route: pathname,
      pageTitle: "Balance Sheet",
      module: "Accounting",
      visibleSummary: "This report summarises assets, liabilities, and equity with expandable GL lines, filters, pagination, and export controls.",
      suggestedPrompts: ["Summarize this balance sheet", "Compare assets and liabilities", "Explain equity position", "Show asset allocation"],
    };
  }
  if (pathname.includes("/accounting/trial-balance")) {
    return {
      route: pathname,
      pageTitle: "Trial Balance",
      module: "Accounting",
      visibleSummary: "This report compares opening balances, debits, credits, net changes, and closing balances across the GL structure, including a total debit and credit row.",
      suggestedPrompts: ["Is this trial balance balanced?", "Explain debit and credit totals", "Show accounts with large movement", "Prepare export"],
    };
  }
  if (pathname.includes("/accounting/income-expenses")) {
    return {
      route: pathname,
      pageTitle: "Income & Expenses",
      module: "Accounting",
      visibleSummary: "This page lists income and expense accounts in a collapsible GL hierarchy with Code, Account Name, and Balance columns. The Income section groups Interest Income (MYRENTEASE, MyRentEase Credit, ROC) and Other Income (Processing Fees, Penalty). The Expenses section totals $8,666,730.06 across Staff Cost, Operational Cost, Regulatory & Compliance, IT & Infrastructure, and Marketing.",
      suggestedPrompts: ["Summarize income and expenses", "Show top expense categories", "Compare income and expenses", "What is the net position?"],
    };
  }
  return {
    route: pathname,
    pageTitle: "ChainCore Workspace",
    module: "Core Banking",
    visibleSummary: "I can use your current ChainCore screen, active accounting data, and available mock reporting data to answer page-aware questions.",
    suggestedPrompts: DEFAULT_FOLLOW_UPS,
  };
}
