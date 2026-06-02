"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, User2, Building2, Home, Users, Info, Download } from "lucide-react";
import PrimaryRail from "@/components/PrimaryRail";
import ClientsSidebar from "@/components/ClientsSidebar";
import GlobalHeader from "@/components/GlobalHeader";
import { Client, ClientType } from "@/data/clients";
import { DetailAccordion, SectionLabel, Field } from "@/components/ClientDetailParts";

const TABS = ["Client Overview", "Loan Account", "Pending", "Failed"] as const;
type Tab = (typeof TABS)[number];

type ProfileKind = "individual" | "corporate" | "center" | "persons";

type ProfileConfig = {
  kind: ProfileKind;
  title: string;
  listHref: string;
  crumbLabel: string;
  entityLabel: string;
};

const profileMap: Record<ClientType, ProfileConfig> = {
  Individual: {
    kind: "individual",
    title: "Individual Clients",
    listHref: "/clients/individual",
    crumbLabel: "Individual Client",
    entityLabel: "Client",
  },
  Corporate: {
    kind: "corporate",
    title: "Corporate Clients",
    listHref: "/clients/corporate",
    crumbLabel: "Corporate Client",
    entityLabel: "Corporate",
  },
  Center: {
    kind: "center",
    title: "Centers",
    listHref: "/clients/center",
    crumbLabel: "Center",
    entityLabel: "Center",
  },
  Persons: {
    kind: "persons",
    title: "Persons",
    listHref: "/clients/persons",
    crumbLabel: "Person",
    entityLabel: "Person",
  },
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function StatusBadge({ status }: { status: Client["status"] }) {
  const styles =
    status === "Active"
      ? "bg-emerald-600 text-white"
      : status === "Inactive"
      ? "bg-orange-50 text-orange-700 ring-1 ring-orange-200"
      : "bg-rose-50 text-rose-700 ring-1 ring-rose-200";

  return (
    <span className={`inline-flex min-w-[70px] items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${styles}`}>
      {status}
    </span>
  );
}

function EmptyTab({ label }: { label: string }) {
  return (
    <div className="mt-10 rounded-lg border border-dashed border-border bg-surface-muted/30 p-12 text-center">
      <p className="text-sm text-text-secondary">{label} view is not yet implemented for this profile.</p>
    </div>
  );
}

function ProfileHero({ client, config }: { client: Client; config: ProfileConfig }) {
  const Icon = config.kind === "corporate" ? Building2 : config.kind === "center" ? Home : config.kind === "persons" ? Users : User2;
  return (
    <div className="mt-6 flex items-center justify-between rounded-md bg-surface-muted px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCE6FF] text-primary">
          {config.kind === "individual" || config.kind === "persons" ? (
            <span className="text-xs font-semibold">{initials(client.name) || <User2 size={18} />}</span>
          ) : (
            <Icon size={18} strokeWidth={1.8} aria-hidden />
          )}
        </span>
        <div>
          <h2 className="text-base font-medium text-text-primary">{client.name}</h2>
          <p className="mt-0.5 text-sm text-text-secondary">{client.email}</p>
        </div>
      </div>
      <StatusBadge status={client.status} />
    </div>
  );
}

function FileValue({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {value}
      <Download size={12} className="text-primary" aria-hidden />
    </span>
  );
}

function IndividualOrPersonOverview({ client, isPerson = false }: { client: Client; isPerson?: boolean }) {
  return (
    <>
      <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
        <Field label="First Name" value="Tope" />
        <Field label="Middle Name" value="Ayokunle" />
        <Field label="Last Name" value="Aiyegbusi" />
        <Field label="Father’s Name" value="Segun" />
        <Field label="Email Address" value={client.email} />
        <Field label="Phone Number" value={client.phone} />
        <Field label="Gender" value={client.gender} />
        <Field label={isPerson ? "Person ID" : "Client ID"} value="12348901" />
        <Field label="Date of Birth" value="6 April, 1998" />
        <Field label="Salutation" value="MR" />
        <Field label="Nationality" value="Nigerian" />
        <Field label="Citizenship" value="Nigerian" />
        <Field label="Marital Status" value="Single" />
        <Field label="Primary Identification Type" value="ID Card" />
        <Field label="Primary Identification Exp Date" value="6 April, 2025" />
        <Field label="Alternative Identification Type" value="International Passport" />
        <Field label="Alternative Identification Exp Date" value="6 April, 2025" />
        <Field label={isPerson ? "Person Image" : "Client Image"} value={<FileValue value="Temitope.jpg" />} />
        <Field label={isPerson ? "Person Signature" : "Client Signature"} value={<FileValue value="Temitope.jpg" />} />
      </div>

      <DetailAccordion title="Contact Information" defaultOpen={false}>
        <SectionLabel>FIRST ADDRESS</SectionLabel>
        <div className="grid grid-cols-1 gap-x-12 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Country" value="Nigeria" />
          <Field label="Street" value="45 Aiyetoro" />
          <Field label="State" value="Lagos" />
          <Field label="City" value="Surulere" />
          <Field label="Postal code" value="10021" />
        </div>
        <div className="my-6 border-t border-border" />
        <SectionLabel>SECOND ADDRESS</SectionLabel>
        <div className="grid grid-cols-1 gap-x-12 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Country" value="Nigeria" />
          <Field label="Street" value="45 Aiyetoro" />
          <Field label="State" value="Lagos" />
          <Field label="City" value="Surulere" />
          <Field label="Postal code" value="10021" />
        </div>
        <div className="my-6 border-t border-border" />
        <div className="grid grid-cols-1 gap-x-12 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Email Address" value={client.email} />
          <Field label="Additional Email Address" value="aiyegbusitope@gmail.com" />
          <Field label="Phone Number" value={client.phone} />
          <Field label="Additional Phone Number" value="+234 902 893 9012" />
        </div>
      </DetailAccordion>

      <DetailAccordion title="Work Information" defaultOpen={false}>
        <SectionLabel>EMPLOYER INFORMATION</SectionLabel>
        <div className="grid grid-cols-1 gap-x-12 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Name of Employer" value="ChainConsults" />
          <Field label="Employer Phone Number" value="+234 902 893 9012" />
          <Field label="Street" value="45 Aiyetoro" />
          <Field label="State" value="Lagos" />
          <Field label="City" value="Surulere" />
          <Field label="Postal code" value="10021" />
          <Field label="Country" value="Nigeria" />
        </div>
        <div className="my-6 border-t border-border" />
        <SectionLabel>PERSONAL WORK INFORMATION</SectionLabel>
        <div className="grid grid-cols-1 gap-x-12 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Industry / Sector" value="Fintech" />
          <Field label="Position" value="Product Design" />
          <Field label="Employment Type" value="Full Time" />
          <Field label="Employment Status" value="Active" />
          <Field label="Monthly Income" value="$50,000" />
        </div>
        <div className="my-6 border-t border-border" />
        <SectionLabel>OWNED BUSINESS</SectionLabel>
        <div className="grid grid-cols-1 gap-x-12 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Name" value="ChainConsults" />
          <Field label="Street" value="45 Aiyetoro" />
          <Field label="State" value="Lagos" />
          <Field label="City" value="Surulere" />
          <Field label="Postal code" value="10021" />
          <Field label="Country" value="Nigeria" />
          <Field label="Email Address" value="aiyegbusitope@gmail.com" />
          <Field label="Additional Email Address" value="aiyegbusitope@gmail.com" />
          <Field label="Phone Number" value="+234 902 893 9012" />
          <Field label="Additional Phone Number" value="+234 902 893 9012" />
        </div>
      </DetailAccordion>

      <DetailAccordion title="Next of Kin" defaultOpen={false}>
        <SectionLabel>NEXT OF KIN PERSONAL INFORMATION</SectionLabel>
        <div className="grid grid-cols-1 gap-x-12 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="First Name" value="Tope" />
          <Field label="Middle Name" value="Ayokunle" />
          <Field label="Last Name" value="Aiyegbusi" />
          <Field label="Father’s Name" value="Segun" />
          <Field label="Email Address" value="aiyegbusitope@gmail.com" />
          <Field label="Phone Number" value="+234 902 893 9012" />
          <Field label="Gender" value="Male" />
          <Field label="Client ID" value="12348901" />
          <Field label="Date of Birth" value="6 April, 1998" />
          <Field label="Salutation" value="MR" />
          <Field label="Nationality" value="Nigerian" />
          <Field label="Citizenship" value="Nigerian" />
          <Field label="Marital Status" value="Single" />
          <Field label="Primary Identification Type" value="ID Card" />
          <Field label="Primary Identification Exp Date" value="6 April, 2025" />
          <Field label="Alternative Identification Type" value="International Passport" />
          <Field label="Alternative Identification Exp Date" value="6 April, 2025" />
          <Field label="Client Image" value={<FileValue value="Temitope.jpg" />} />
          <Field label="Client Signature" value={<FileValue value="Temitope.jpg" />} />
        </div>
        <div className="my-6 border-t border-border" />
        <SectionLabel>FIRST ADDRESS</SectionLabel>
        <div className="grid grid-cols-1 gap-x-12 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Country" value="Nigeria" />
          <Field label="Street" value="45 Aiyetoro" />
          <Field label="State" value="Lagos" />
          <Field label="City" value="Surulere" />
          <Field label="Postal code" value="10021" />
        </div>
      </DetailAccordion>

      <DetailAccordion title="Additional Information" defaultOpen={false}>
        <SectionLabel>ASSIGN TO</SectionLabel>
        <div className="grid grid-cols-1 gap-x-12 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Branch" value="Lagos" />
          <Field label="Credit Officer" value="Temitope Aiyegbusi" />
          <Field label="Center" value="Lagos" />
        </div>
        <div className="my-6 border-t border-border" />
        <SectionLabel>OTHER INFORMATION</SectionLabel>
        <div className="grid grid-cols-1 gap-x-12 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Created on" value="6 April, 2025" />
          <Field label="Bank Account Number" value="1234567890" />
          <Field label="Bank" value="Access Bank" />
        </div>
        <div className="mt-6">
          <Field label="Notes" value={<span className="block max-w-xl leading-relaxed">Downtime is inevitable during the transition between Core Banking Applications (CBAs), primarily because older CBAs are often built on outdated technologies. Modern technology stacks used by banks today significantly differ from legacy systems.</span>} />
        </div>
      </DetailAccordion>
    </>
  );
}

function CorporateOverview({ client }: { client: Client }) {
  return (
    <>
      <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
        <Field label="Corporate Name" value={client.name} />
        <Field label="Short Name" value="ACME" />
        <Field label="Corporate Email" value={client.email} />
        <Field label="Phone Number" value={client.phone} />
        <Field label="Corporate ID" value="CORP-234901" />
        <Field label="Registration Number" value="RC-1203984" />
        <Field label="Tax Identification Number" value="TIN-92837465" />
        <Field label="Industry / Sector" value="Manufacturing" />
        <Field label="Date Incorporated" value="12 January, 2020" />
        <Field label="Ownership Type" value="Limited Liability Company" />
        <Field label="Operating Status" value="Active" />
        <Field label="Primary Contact" value="Temitope Aiyegbusi" />
      </div>
      <DetailAccordion title="Contact Information" defaultOpen={false}>
        <SectionLabel>REGISTERED ADDRESS</SectionLabel>
        <div className="grid grid-cols-1 gap-x-12 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Country" value="Nigeria" />
          <Field label="Street" value="45 Aiyetoro" />
          <Field label="State" value="Lagos" />
          <Field label="City" value="Surulere" />
          <Field label="Postal code" value="10021" />
          <Field label="Email Address" value={client.email} />
          <Field label="Phone Number" value={client.phone} />
        </div>
      </DetailAccordion>
      <DetailAccordion title="Directors & Signatories" defaultOpen={false}>
        <div className="grid grid-cols-1 gap-x-12 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Director Name" value="Ayobami Aiyegbusi" />
          <Field label="Director Role" value="Managing Director" />
          <Field label="Phone Number" value="+234 902 893 9012" />
          <Field label="Email Address" value="ayobami@acme.ng" />
          <Field label="Signatory Name" value="Omolola Aiyegbusi" />
          <Field label="Signing Mandate" value="Any one to sign" />
        </div>
      </DetailAccordion>
      <DetailAccordion title="Additional Information" defaultOpen={false}>
        <div className="grid grid-cols-1 gap-x-12 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Branch" value="Lagos" />
          <Field label="Credit Officer" value="Temitope Aiyegbusi" />
          <Field label="Bank" value="Access Bank" />
          <Field label="Bank Account Number" value="1234567890" />
        </div>
      </DetailAccordion>
    </>
  );
}

function CenterOverview({ client }: { client: Client }) {
  return (
    <>
      <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
        <Field label="Center Name" value={client.name} />
        <Field label="Short Name" value={client.detail.shortName} />
        <Field label="Center ID" value="CTR-123489" />
        <Field label="Branch" value="Lagos" />
        <Field label="Center Leader" value="Aiyegbusi Temitope" />
        <Field label="Meeting Day" value="Monday" />
        <Field label="Meeting Time" value="12:45pm" />
        <Field label="Total Members" value="48" />
      </div>
      <DetailAccordion title="Contact Information" defaultOpen={false}>
        <SectionLabel>CENTER ADDRESS</SectionLabel>
        <div className="grid grid-cols-1 gap-x-12 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Country" value="Nigeria" />
          <Field label="Street" value="45 Aiyetoro" />
          <Field label="State" value="Lagos" />
          <Field label="City" value="Surulere" />
          <Field label="Postal code" value="10021" />
          <Field label="Phone Number" value={client.phone} />
          <Field label="Email Address" value={client.email} />
        </div>
      </DetailAccordion>
      <DetailAccordion title="Members" defaultOpen={false}>
        <div className="grid grid-cols-1 gap-x-12 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Member Name" value="Aiyegbusi Temitope" />
          <Field label="Member ID" value="12348901" />
          <Field label="Role" value="Center Leader" />
          <Field label="Status" value="Active" />
          <Field label="Member Name" value="Ayobami Aiyegbusi" />
          <Field label="Member ID" value="12348902" />
          <Field label="Role" value="Treasurer" />
          <Field label="Status" value="Active" />
        </div>
      </DetailAccordion>
      <DetailAccordion title="Additional Information" defaultOpen={false}>
        <div className="grid grid-cols-1 gap-x-12 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Credit Officer" value="Temitope Aiyegbusi" />
          <Field label="Created on" value="6 April, 2025" />
          <Field label="Bank" value="Access Bank" />
          <Field label="Bank Account Number" value="1234567890" />
        </div>
      </DetailAccordion>
    </>
  );
}

export default function ClientProfilePage({ client, type }: { client?: Client; type: ClientType }) {
  const config = profileMap[type];
  const [tab, setTab] = useState<Tab>("Client Overview");

  return (
    <div className="min-h-screen bg-white">
      <PrimaryRail />
      <ClientsSidebar menuLabel="SUB MENU" />
      <main className="ml-[316px]">
        <GlobalHeader title={config.title} />
        <section className="px-10 pb-10 pt-6">
          <div className="flex items-center gap-3 text-sm">
            <Link href={config.listHref} className="focus-ring inline-flex items-center gap-1 rounded-md text-text-primary transition-colors hover:text-primary">
              <ChevronLeft size={16} aria-hidden />
              Go Back
            </Link>
            <span className="text-text-muted">Clients</span>
            <span className="text-text-muted/60">/</span>
            <Link href={config.listHref} className="text-text-muted transition-colors hover:text-text-primary">
              {config.crumbLabel}
            </Link>
            <span className="text-text-muted/60">/</span>
            <span className="text-primary">{client?.name ?? "Unknown"}</span>
          </div>

          {!client ? (
            <p className="mt-8 rounded-md border border-border bg-surface-muted p-6 text-sm text-text-secondary">
              {config.entityLabel} not found.
            </p>
          ) : (
            <>
              <div className="mt-6 flex items-center gap-7 border-b border-border">
                {TABS.map((item) => {
                  const active = tab === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setTab(item)}
                      className={`focus-ring -mb-px border-b-2 pb-3 text-sm transition-colors ${
                        active ? "border-primary font-medium text-text-primary" : "border-transparent text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              {tab === "Client Overview" ? (
                <>
                  <ProfileHero client={client} config={config} />
                  {type === "Corporate" ? (
                    <CorporateOverview client={client} />
                  ) : type === "Center" ? (
                    <CenterOverview client={client} />
                  ) : (
                    <IndividualOrPersonOverview client={client} isPerson={type === "Persons"} />
                  )}
                </>
              ) : (
                <EmptyTab label={tab} />
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
