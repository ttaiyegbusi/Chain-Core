"use client";

import PrimaryRail from "@/components/PrimaryRail";
import AccountingSidebar from "@/components/AccountingSidebar";
import { Breadcrumbs } from "@/components/Common";

export default function IncomeExpensesPage() {
  return (
    <div className="min-h-screen bg-white">
      <PrimaryRail />
      <AccountingSidebar menuLabel="SUB MENU" />
      <main className="ml-[316px]">
        <header className="flex h-[70px] items-center border-b border-border pl-10 pr-11">
          <div>
            <h1 className="text-lg font-semibold text-text-primary">Accounting</h1>
            <div className="mt-0.5">
              <Breadcrumbs
                items={[
                  { label: "Dashboard", href: "/" },
                  { label: "Accounting", href: "/accounting/charts-of-account" },
                  { label: "Income & Expenses" },
                ]}
              />
            </div>
          </div>
        </header>
        <section className="px-10 pt-6">
          <h2 className="text-xl font-semibold text-text-primary">
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
