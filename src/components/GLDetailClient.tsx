"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, MoreVertical } from "lucide-react";
import PrimaryRail from "@/components/PrimaryRail";
import { Breadcrumbs } from "@/components/Common";
import {
  TextInput,
  SelectInput,
  Checkbox,
  Textarea,
  SectionAccordion,
} from "@/components/FormControls";
import { HIERARCHY_TYPES, ChartAccount } from "@/lib/types";
import {
  findAccountById,
  getHeaderAccountOptions,
  getHeaderAccountLabel,
} from "@/data/accounts";

export default function GLDetailClient({ accountId }: { accountId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const account = findAccountById(accountId);
  const headerOptions = getHeaderAccountOptions();

  const [editing, setEditing] = useState(searchParams.get("edit") === "1");

  // Editable copy of the account fields.
  const [name, setName] = useState(account?.name ?? "");
  const [code, setCode] = useState(account?.code ?? "");
  const [hierarchyType, setHierarchyType] = useState(
    account?.hierarchyType ?? ""
  );
  const [headerAccount, setHeaderAccount] = useState(
    account?.headerAccountId ?? ""
  );
  const [headOffice, setHeadOffice] = useState(
    account?.showGlOnlyForHeadOffice ?? true
  );
  const [notes, setNotes] = useState(account?.notes ?? "");

  if (!account) {
    return (
      <div className="cc-page">
        <PrimaryRail />
        <main className="ml-[66px] p-10">
          <p className="text-sm text-text-muted">Account not found.</p>
          <button
            onClick={() => router.push("/accounting/charts-of-account")}
            className="mt-4 text-sm text-primary"
          >
            Back to Charts of Account
          </button>
        </main>
      </div>
    );
  }

  const title = `${account.code} - ${account.name}`;

  return (
    <div className="cc-page">
      <PrimaryRail />

      <main className="ml-[66px] pb-[90px]">
        {/* Top title bar */}
        <header className="flex h-[70px] items-center px-10">
          <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
        </header>

        {/* Breadcrumb / action row */}
        <div className="flex items-center justify-between border-b border-border px-10 pb-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="focus-ring flex items-center gap-1 text-sm text-text-primary"
            >
              <ChevronLeft size={18} aria-hidden />
              Back
            </button>
            <span className="h-5 w-px bg-border" aria-hidden />
            <Breadcrumbs
              items={[
                { label: "Dashboard", href: "/" },
                { label: "Accounting", href: "/accounting/charts-of-account" },
                {
                  label: "Charts of Account",
                  href: "/accounting/charts-of-account",
                },
                { label: title },
              ]}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setEditing((e) => !e)}
              className="focus-ring inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              {editing ? "Save GL" : "Edit GL"}
            </button>
            <button
              type="button"
              aria-label="More options"
              className="focus-ring flex h-10 w-10 items-center justify-center rounded-lg border border-border-strong text-text-secondary hover:bg-bg-sub"
            >
              <MoreVertical size={18} aria-hidden />
            </button>
          </div>
        </div>

        {/* Form body */}
        <div className="px-10 pt-6">
          <SectionAccordion title="Basic Information">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <TextInput
                id="gl-name"
                label="Name"
                value={name}
                onChange={setName}
                readOnly={!editing}
              />
              <TextInput
                id="gl-code"
                label="Code"
                value={code}
                onChange={setCode}
                readOnly={!editing}
              />
              {editing ? (
                <SelectInput
                  id="gl-hierarchy"
                  label="Hierarchy Type"
                  value={hierarchyType}
                  onChange={(v) => setHierarchyType(v as ChartAccount["hierarchyType"])}
                  options={HIERARCHY_TYPES.map((h) => ({ value: h, label: h }))}
                />
              ) : (
                <TextInput
                  id="gl-hierarchy"
                  label="Hierarchy Type"
                  value={hierarchyType}
                  readOnly
                />
              )}
              {editing ? (
                <SelectInput
                  id="gl-header"
                  label="Header Account"
                  value={headerAccount ?? ""}
                  onChange={setHeaderAccount}
                  options={headerOptions.map((o) => ({
                    value: o.id,
                    label: o.label,
                  }))}
                />
              ) : (
                <TextInput
                  id="gl-header"
                  label="Header Account"
                  value={getHeaderAccountLabel(account.headerAccountId)}
                  readOnly
                />
              )}
            </div>

            <div className="mt-4">
              <Checkbox
                id="gl-headoffice"
                label="Show GL only for Head Office"
                checked={headOffice}
                onChange={setHeadOffice}
                disabled={!editing}
              />
            </div>
          </SectionAccordion>

          <SectionAccordion title="Additional Information">
            <Textarea
              id="gl-notes"
              label="Notes"
              value={notes}
              onChange={setNotes}
              placeholder="Write a note"
              readOnly={!editing}
            />
          </SectionAccordion>
        </div>
      </main>

      {/* Sticky footer only while editing */}
      {editing && (
        <div className="fixed bottom-0 left-[66px] right-0 z-20 flex h-[72px] items-center justify-end gap-6 border-t border-border bg-surface px-11">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="focus-ring text-sm font-medium text-text-primary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="focus-ring inline-flex h-10 w-[180px] items-center justify-center rounded-lg bg-primary text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
