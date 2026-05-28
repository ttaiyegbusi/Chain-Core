"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import SuccessModal from "@/components/SuccessModal";
import { HIERARCHY_TYPES } from "@/lib/types";
import { getHeaderAccountOptions } from "@/data/accounts";

export default function CreateGLPage() {
  const router = useRouter();
  const headerOptions = getHeaderAccountOptions();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [hierarchyType, setHierarchyType] = useState("");
  const [headerAccount, setHeaderAccount] = useState("");
  const [headOffice, setHeadOffice] = useState(true);
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Header Account required unless hierarchy type is "Header Account" (spec 13)
  const headerRequired = hierarchyType !== "" && hierarchyType !== "Header Account";

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required.";
    if (!code.trim()) e.code = "Code is required.";
    else if (!/^\d{3,7}$/.test(code.trim()))
      e.code = "Code should be 3–7 digits.";
    if (!hierarchyType) e.hierarchyType = "Hierarchy Type is required.";
    if (headerRequired && !headerAccount)
      e.headerAccount = "Header Account is required for this hierarchy type.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = () => {
    if (validate()) setShowSuccess(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <PrimaryRail />

      {/* Content offset: just the 66px rail (sidebar hidden on create) */}
      <main className="ml-[66px] pb-[90px]">
        {/* Top title bar */}
        <header className="flex h-[70px] items-center border-b border-border px-10">
          <h1 className="text-lg font-semibold text-text-primary">
            Create New General Ledger
          </h1>
        </header>

        {/* Breadcrumb / action row */}
        <div className="flex items-center justify-between px-10 pt-6">
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
                { label: "Charts of Account", href: "/accounting/charts-of-account" },
                { label: "Create New General Ledger" },
              ]}
            />
          </div>

          <button
            type="button"
            aria-label="More options"
            className="focus-ring flex h-10 w-10 items-center justify-center rounded-md border border-border-strong text-text-secondary hover:bg-surface-muted"
          >
            <MoreVertical size={18} aria-hidden />
          </button>
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
                error={errors.name}
              />
              <TextInput
                id="gl-code"
                label="Code"
                value={code}
                onChange={setCode}
                error={errors.code}
              />
              <SelectInput
                id="gl-hierarchy"
                label="Hierarchy Type"
                value={hierarchyType}
                onChange={setHierarchyType}
                options={HIERARCHY_TYPES.map((h) => ({ value: h, label: h }))}
                error={errors.hierarchyType}
              />
              <SelectInput
                id="gl-header"
                label="Header Account"
                value={headerAccount}
                onChange={setHeaderAccount}
                options={headerOptions.map((o) => ({
                  value: o.id,
                  label: o.label,
                }))}
                error={errors.headerAccount}
              />
            </div>

            <div className="mt-4">
              <Checkbox
                id="gl-headoffice"
                label="Show GL only for Head Office"
                checked={headOffice}
                onChange={setHeadOffice}
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
            />
          </SectionAccordion>
        </div>
      </main>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-[66px] right-0 z-20 flex h-[72px] items-center justify-end gap-6 border-t border-border bg-white px-11">
        <button
          type="button"
          onClick={() => router.push("/accounting/charts-of-account")}
          className="focus-ring text-sm font-medium text-text-primary"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleCreate}
          className="focus-ring inline-flex h-10 w-[250px] items-center justify-center rounded-md bg-primary text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          Create New General Ledger
        </button>
      </div>

      <SuccessModal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        onOkay={() => {
          setShowSuccess(false);
          router.push("/accounting/charts-of-account");
        }}
      />
    </div>
  );
}
