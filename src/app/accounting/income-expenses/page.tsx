"use client";

import PrimaryRail from "@/components/PrimaryRail";
import AccountingSidebar from "@/components/AccountingSidebar";
import { Breadcrumbs } from "@/components/Common";
import GlobalHeader from "@/components/GlobalHeader";

export default function IncomeExpensesPage() {
  return (
    <div className="cc-page">
      <PrimaryRail />
      <AccountingSidebar menuLabel="SUB MENU" />
      <main className="cc-main">
        <GlobalHeader
          title="Accounting"
          crumbs={[
                  { label: "Dashboard", href: "/" },
                  { label: "Accounting", href: "/accounting/charts-of-account" },
                  { label: "Income & Expenses" },
                ]}
        />
        <section className="px-10 pt-6">
          <h2 className="cc-page-title">
            Income &amp; Expenses
          </h2>
          <p className="mt-4 text-sm text-text-muted">
            This screen hasn&apos;t been designed yet.
          </p>
        </section>
      </main>
    </div>
  );
}
