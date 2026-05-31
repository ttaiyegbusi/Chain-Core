// Search modal mock results for ChainCore.
//
// All content is banking-appropriate — real GL/customer/document/link
// shapes that match a typed query of "Loan". When the user types "Loan",
// these are what plausibly come back.

export interface ContactResult {
  id: string;
  initial: string;
  name: string;
  accountNumber: string;
  loanType: string;
}

export interface DocumentResult {
  id: string;
  filename: string;
  module: string; // e.g. "Reports", "Compliance"
  edited: string; // e.g. "5mins ago"
}

export interface LinkResult {
  id: string;
  url: string;
}

export interface BranchResult {
  id: string;
  initial: string;
  name: string;
  city: string;
  staff: number;
}

export const SEARCH_QUERY = "Loan";

export const CONTACTS: ContactResult[] = [
  { id: "c1", initial: "A", name: "Adebayo Adekunle", accountNumber: "ACC-0042197", loanType: "Personal Loan" },
  { id: "c2", initial: "O", name: "Olamide Okafor",  accountNumber: "ACC-0091834", loanType: "SME Loan" },
  { id: "c3", initial: "C", name: "Chinwe Eze",      accountNumber: "ACC-0073421", loanType: "Mortgage Loan" },
];

export const DOCUMENTS: DocumentResult[] = [
  { id: "d1", filename: "Loan_Portfolio_Summary_Q2.pdf",  module: "Reports",     edited: "Updated 5mins ago" },
  { id: "d2", filename: "Loan_Provisioning_Policy.docx",  module: "Compliance",  edited: "Updated 4w ago" },
  { id: "d3", filename: "Loan_Disbursements_May.xlsx",    module: "Accounting",  edited: "Updated 1w ago" },
  { id: "d4", filename: "Loan_Application_Workflow.pdf",  module: "Operations",  edited: "Updated 4w ago" },
];

export const LINKS: LinkResult[] = [
  { id: "l1", url: "ledger.chaincore.ng/loans/portfolio" },
  { id: "l2", url: "ledger.chaincore.ng/loans/disbursements" },
  { id: "l3", url: "ledger.chaincore.ng/loans/provisioning" },
  { id: "l4", url: "ledger.chaincore.ng/loans/applications" },
  { id: "l5", url: "ledger.chaincore.ng/reports/loan-performance" },
];

export const BRANCHES: BranchResult[] = [
  { id: "b1", initial: "L", name: "Lagos (HQ) — Loans Desk",  city: "Lagos",   staff: 42 },
  { id: "b2", initial: "A", name: "Abuja — Loans Desk",       city: "Abuja",   staff: 18 },
];
