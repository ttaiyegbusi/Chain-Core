"use client";

import PrimaryRail from "@/components/PrimaryRail";
import OrganizationSidebar from "@/components/Organization/OrganizationSidebar";
import GlobalHeader from "@/components/GlobalHeader";

export default function OrganizationInfoPage() {
  return (
    <div className="min-h-screen bg-white">
      <PrimaryRail />
      <OrganizationSidebar />
      <main className="ml-[316px]">
        <GlobalHeader title="Organization" crumbs={[{ label: "Organization" }, { label: "Organization Info" }]} />
        <section className="px-10 py-8">
          <div className="max-w-3xl rounded-xl border border-border bg-white p-6 shadow-[0_8px_24px_rgba(17,24,39,0.04)]">
            <h2 className="text-lg font-semibold text-text-primary">Organization Info</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">This area will hold tenant profile, registration details, operating currency, default branch rules, approval settings and organization-wide banking configuration.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
