"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, User2, Building2, Home, Users } from "lucide-react";
import ClientsSidebar from "@/components/ClientsSidebar";
import GlobalHeader from "@/components/GlobalHeader";
import { Client, ClientType } from "@/data/clients";
import { DetailAccordion, SectionLabel, Field } from "@/components/ClientDetailParts";

const TABS = ["Client Overview", "Loan Account", "Pending", "Failed"] as const;
type Tab = (typeof TABS)[number];

const TYPE_PATH: Record<ClientType, string> = {
  Individual: "/clients/individual",
  Corporate: "/clients/corporate",
  Center: "/clients/center",
  Persons: "/clients/persons",
};

const TYPE_LABEL: Record<ClientType, string> = {
  Individual: "Individual Client",
  Corporate: "Corporate Client",
  Center: "Center",
  Persons: "Person",
};

const PAGE_TITLE: Record<ClientType, string> = {
  Individual: "Individual Clients",
  Corporate: "Corporate Clients",
  Center: "Centers",
  Persons: "Persons",
};

function ProfileAvatar({ type }: { type: ClientType }) {
  const Icon = type === "Corporate" ? Building2 : type === "Center" ? Home : type === "Persons" ? Users : User2;
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
      <Icon size={20} strokeWidth={1.8} aria-hidden />
    </span>
  );
}

function StatusBadge({ status }: { status: Client["status"] }) {
  const cls = status === "Active" ? "bg-emerald-600" : status === "Inactive" ? "bg-amber-500" : "bg-red-500";
  return <span className={`inline-flex items-center rounded-full px-3.5 py-1 text-xs font-medium text-white ${cls}`}>{status}</span>;
}

function OverviewFields({ client }: { client: Client }) {
  if (client.type === "Corporate") {
    return (
      <div className="grid grid-cols-1 gap-x-12 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Organization Name" value={client.name} />
        <Field label="Registration Number" value="RC-129034" />
        <Field label="Industry / Sector" value="Fintech" />
        <Field label="Client ID" value={client.clientId} />
        <Field label="Email Address" value={client.email} />
        <Field label="Phone Number" value={client.phone} />
        <Field label="Tax Identification Number" value="TIN-938483" />
        <Field label="Status" value={client.status} />
      </div>
    );
  }
  if (client.type === "Center") {
    return (
      <div className="grid grid-cols-1 gap-x-12 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Center Name" value={client.name} />
        <Field label="Short Name" value={client.detail.shortName} />
        <Field label="Branch" value={client.detail.additional.branch} />
        <Field label="Client ID" value={client.clientId} />
        <Field label="Email Address" value={client.email} />
        <Field label="Phone Number" value={client.phone} />
        <Field label="Meeting Day" value={client.detail.meeting.day} />
        <Field label="Meeting Time" value={client.detail.meeting.time} />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-x-12 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="First Name" value={client.name.split(" ")[1] ?? "Tope"} />
      <Field label="Middle Name" value="Ayokunle" />
      <Field label="Last Name" value={client.name.split(" ")[0] ?? "Aiyegbusi"} />
      <Field label="Father’s Name" value="Segun" />
      <Field label="Email Address" value={client.email} />
      <Field label="Phone Number" value={client.phone} />
      <Field label="Gender" value={client.gender} />
      <Field label="Client ID" value={client.clientId} />
      <Field label="Date of Birth" value="6 April, 1998" />
      <Field label="Salutation" value="MR" />
      <Field label="Nationality" value="Nigerian" />
      <Field label="Citizenship" value="Nigerian" />
      <Field label="Marital Status" value="Single" />
      <Field label="Primary Identification Type" value="ID Card" />
      <Field label="Primary Identification Exp Date" value="6 April, 2025" />
      <Field label="Alternative Identification Type" value="International Passport" />
      <Field label="Alternative Identification Exp Date" value="6 April, 2025" />
      <Field label="Client Image" value={<span>Temitope.jpg <span className="text-primary">⌄</span></span>} />
      <Field label="Client Signature" value={<span>Temitope.jpg <span className="text-primary">⌄</span></span>} />
    </div>
  );
}

export default function ClientProfilePage({ client, type, missingId }: { client?: Client; type: ClientType; missingId?: string }) {
  const [tab, setTab] = useState<Tab>("Client Overview");
  const backHref = TYPE_PATH[type];

  return (
    <div className="min-h-screen bg-white">
      <ClientsSidebar menuLabel="SUB MENU" />
      <main className="ml-[calc(var(--rail-width)+250px)]">
        <GlobalHeader title={PAGE_TITLE[type]} />
        <section className="px-10 pb-10 pt-6">
          <Link href={backHref} className="focus-ring inline-flex items-center gap-1 rounded-md text-sm text-text-secondary transition-colors hover:text-text-primary">
            <ChevronLeft size={16} aria-hidden />
            Go Back
          </Link>
          <div className="mt-2 text-xs text-text-muted">
            <Link href={backHref} className="hover:text-text-primary">Clients</Link>
            <span className="mx-1.5 text-text-muted/60">/</span>
            <Link href={backHref} className="hover:text-text-primary">{TYPE_LABEL[type]}</Link>
            <span className="mx-1.5 text-text-muted/60">/</span>
            <span className="text-primary">{client?.name ?? missingId}</span>
          </div>

          {!client ? (
            <p className="mt-8 rounded-md border border-border bg-surface-muted p-6 text-sm text-text-secondary">Client not found.</p>
          ) : (
            <>
              <div className="mt-5 flex items-center gap-7 border-b border-border">
                {TABS.map((t) => {
                  const active = tab === t;
                  return (
                    <button key={t} type="button" onClick={() => setTab(t)} className={["focus-ring -mb-px border-b-2 pb-3 pt-2 text-sm transition-colors", active ? "border-primary font-medium text-text-primary" : "border-transparent text-text-secondary hover:text-text-primary"].join(" ")}>
                      {t}
                    </button>
                  );
                })}
              </div>

              {tab === "Client Overview" ? (
                <>
                  <div className="mt-6 flex items-center justify-between rounded-md bg-surface-muted px-5 py-5">
                    <div className="flex items-center gap-3">
                      <ProfileAvatar type={type} />
                      <span>
                        <span className="block text-base font-medium text-text-primary">{client.name}</span>
                        <span className="block text-sm text-text-secondary">{client.email}</span>
                      </span>
                    </div>
                    <StatusBadge status={client.status} />
                  </div>

                  <div className="mt-5 px-5"><OverviewFields client={client} /></div>

                  <DetailAccordion title="Contact Information" defaultOpen={false}>
                    <SectionLabel>FIRST ADDRESS</SectionLabel>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      <Field label="Country" value={client.detail.contact.firstAddress.country} />
                      <Field label="Street" value={client.detail.contact.firstAddress.street} />
                      <Field label="State" value={client.detail.contact.firstAddress.state} />
                      <Field label="City" value={client.detail.contact.firstAddress.city} />
                      <Field label="Postal code" value={client.detail.contact.firstAddress.postalCode} />
                    </div>
                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      <Field label="Email Address" value={client.detail.contact.emailAddress} />
                      <Field label="Additional Email Address" value={client.detail.contact.additionalEmailAddress} />
                      <Field label="Phone Number" value={client.detail.contact.phoneNumber} />
                      <Field label="Additional Phone Number" value={client.detail.contact.additionalPhoneNumber} />
                    </div>
                  </DetailAccordion>

                  <DetailAccordion title={type === "Corporate" ? "Directors & Signatories" : type === "Center" ? "Members" : "Work Information"} defaultOpen={false}>
                    <SectionLabel>{type === "Corporate" ? "DIRECTOR INFORMATION" : type === "Center" ? "CENTER INFORMATION" : "EMPLOYER INFORMATION"}</SectionLabel>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      <Field label={type === "Center" ? "Center Manager" : "Name of Employer"} value="ChainConsults" />
                      <Field label="Employer Phone Number" value="+234 902 893 9012" />
                      <Field label="Street" value="45 Aiyetoro" />
                      <Field label="State" value="Lagos" />
                      <Field label="City" value="Surulere" />
                      <Field label="Postal code" value="10021" />
                      <Field label="Country" value="Nigeria" />
                    </div>
                  </DetailAccordion>

                  {(type === "Individual" || type === "Persons") && (
                    <DetailAccordion title="Next of Kin" defaultOpen={false}>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <Field label="First Name" value="Tope" />
                        <Field label="Middle Name" value="Ayokunle" />
                        <Field label="Last Name" value="Aiyegbusi" />
                        <Field label="Phone Number" value="+234 902 893 9012" />
                        <Field label="Relationship" value="Sibling" />
                      </div>
                    </DetailAccordion>
                  )}

                  <DetailAccordion title="Additional Information" defaultOpen={false}>
                    <SectionLabel>ASSIGN TO</SectionLabel>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      <Field label="Branch" value={client.detail.additional.branch} />
                      <Field label="Credit Officer" value={client.detail.additional.creditOfficer} />
                      <Field label="Center" value={client.detail.centerName} />
                    </div>
                    <div className="mt-6 max-w-4xl">
                      <Field label="Notes" value={<span className="leading-relaxed">{client.detail.additional.notes}</span>} />
                    </div>
                  </DetailAccordion>
                </>
              ) : (
                <div className="mt-10 rounded-lg border border-dashed border-border bg-surface-muted/30 p-12 text-center">
                  <p className="text-sm text-text-secondary">{tab} view is not yet implemented for this client.</p>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
