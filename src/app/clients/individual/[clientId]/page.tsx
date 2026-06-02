"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ChevronLeft, User2, Info } from "lucide-react";
import PrimaryRail from "@/components/PrimaryRail";
import ClientsSidebar from "@/components/ClientsSidebar";
import GlobalHeader from "@/components/GlobalHeader";
import { findClient } from "@/data/clients";
import {
  DetailAccordion,
  SectionLabel,
  Field,
} from "@/components/ClientDetailParts";

const TABS = ["Client Overview", "Loan Account", "Pending", "Failed"] as const;
type Tab = (typeof TABS)[number];

export default function IndividualClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = use(params);
  const client = findClient("Individual", clientId);
  const [tab, setTab] = useState<Tab>("Client Overview");

  return (
    <div className="min-h-screen bg-white">
      <PrimaryRail />
      <ClientsSidebar menuLabel="SUB MENU" />

      <main className="ml-[316px]">
        <GlobalHeader title="Individual Clients" />

        <section className="px-10 pb-10 pt-6">
          {/* Breadcrumb + Go Back */}
          <Link
            href="/clients/individual"
            className="focus-ring inline-flex items-center gap-1 rounded-md text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            <ChevronLeft size={16} aria-hidden />
            Go Back
          </Link>
          <div className="mt-2 text-xs text-text-muted">
            <Link href="/clients/individual" className="hover:text-text-primary">
              Clients
            </Link>
            <span className="mx-1.5 text-text-muted/60">/</span>
            <Link href="/clients/individual" className="hover:text-text-primary">
              Individual
            </Link>
            <span className="mx-1.5 text-text-muted/60">/</span>
            <span className="text-primary">{client?.name ?? clientId}</span>
          </div>

          {!client ? (
            <p className="mt-8 rounded-md border border-border bg-surface-muted p-6 text-sm text-text-secondary">
              Client not found.
            </p>
          ) : (
            <>
              {/* Detail tabs */}
              <div className="mt-5 flex items-center gap-7 border-b border-border">
                {TABS.map((t) => {
                  const active = tab === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTab(t)}
                      className={[
                        "focus-ring -mb-px border-b-2 pb-3 pt-2 text-sm transition-colors",
                        active
                          ? "border-primary font-medium text-text-primary"
                          : "border-transparent text-text-secondary hover:text-text-primary",
                      ].join(" ")}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>

              {/* Tab content */}
              {tab === "Client Overview" && (
                <>
                  {/* Identity header card */}
                  <div className="mt-6 flex items-center justify-between rounded-md bg-surface-muted px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-text-secondary">
                        <User2 size={18} strokeWidth={1.8} aria-hidden />
                      </span>
                      <span className="text-base font-medium text-text-primary">
                        {client.name}
                      </span>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium text-white">
                      {client.status}
                    </span>
                  </div>

                  {/* Center / Short Name */}
                  <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <Field label="Center Name" value={client.detail.centerName} />
                    <Field label="Short Name" value={client.detail.shortName} />
                  </div>

                  {/* Contact Information */}
                  <DetailAccordion title="Contact Information">
                    <SectionLabel>FIRST ADDRESS</SectionLabel>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      <Field
                        label="Country"
                        value={client.detail.contact.firstAddress.country}
                      />
                      <Field
                        label="Street"
                        value={client.detail.contact.firstAddress.street}
                      />
                      <Field
                        label="State"
                        value={client.detail.contact.firstAddress.state}
                      />
                      <Field
                        label="City"
                        value={client.detail.contact.firstAddress.city}
                      />
                    </div>
                    <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      <Field
                        label="Postal code"
                        value={client.detail.contact.firstAddress.postalCode}
                      />
                    </div>
                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      <Field
                        label="Email Address"
                        value={client.detail.contact.emailAddress}
                      />
                      <Field
                        label="Additional Email Address"
                        value={client.detail.contact.additionalEmailAddress}
                      />
                      <Field
                        label="Phone Number"
                        value={client.detail.contact.phoneNumber}
                      />
                      <Field
                        label="Additional Phone Number"
                        value={client.detail.contact.additionalPhoneNumber}
                      />
                    </div>
                  </DetailAccordion>

                  {/* Meeting Information */}
                  <DetailAccordion title="Meeting Information">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      <Field
                        label="Meeting Day"
                        value={client.detail.meeting.day}
                      />
                      <Field
                        label="Meeting Time"
                        value={client.detail.meeting.time}
                      />
                    </div>
                  </DetailAccordion>

                  {/* Additional Information */}
                  <DetailAccordion title="Additional Information">
                    <SectionLabel>ASSIGN TO</SectionLabel>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      <Field label="Branch" value={client.detail.additional.branch} />
                      <Field
                        label="Credit Officer"
                        value={client.detail.additional.creditOfficer}
                      />
                    </div>
                    <div className="mt-6">
                      <div className="flex items-center gap-1 text-xs text-text-secondary">
                        Notes
                        <Info
                          size={11}
                          className="text-text-muted opacity-60"
                          aria-hidden
                        />
                      </div>
                      <p className="mt-2 max-w-4xl text-sm leading-relaxed text-text-primary">
                        {client.detail.additional.notes}
                      </p>
                    </div>
                  </DetailAccordion>
                </>
              )}

              {tab !== "Client Overview" && (
                <div className="mt-10 rounded-lg border border-dashed border-border bg-surface-muted/30 p-12 text-center">
                  <p className="text-sm text-text-secondary">
                    {tab} view is not yet implemented for this client.
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
