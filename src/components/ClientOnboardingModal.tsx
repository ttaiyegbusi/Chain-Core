"use client";

import { useMemo, useState } from "react";
import { X, Trash2, ChevronDown } from "lucide-react";
import SuccessModal from "@/components/SuccessModal";
import { ClientType } from "@/data/clients";

type ClientKind = ClientType;

type Step = {
  id: number;
  title: string;
};

const STEP_LABELS: Record<ClientKind, Step[]> = {
  Individual: [
    { id: 1, title: "Basic Information" },
    { id: 2, title: "Contact Information" },
    { id: 3, title: "Work Information" },
    { id: 4, title: "Next of Kin" },
    { id: 5, title: "Additional Information" },
  ],
  Persons: [
    { id: 1, title: "Basic Information" },
    { id: 2, title: "Contact Information" },
    { id: 3, title: "Work Information" },
    { id: 4, title: "Next of Kin" },
    { id: 5, title: "Additional Information" },
  ],
  Corporate: [
    { id: 1, title: "Corporate Information" },
    { id: 2, title: "Contact Information" },
    { id: 3, title: "Directors & Signatories" },
    { id: 4, title: "Business Information" },
    { id: 5, title: "Additional Information" },
  ],
  Center: [
    { id: 1, title: "Center Information" },
    { id: 2, title: "Contact Information" },
    { id: 3, title: "Members" },
    { id: 4, title: "Meeting Information" },
    { id: 5, title: "Additional Information" },
  ],
};

const TYPE_LABEL: Record<ClientKind, string> = {
  Individual: "Individual Client",
  Corporate: "Corporate Client",
  Center: "Center",
  Persons: "Person",
};

interface Props {
  type: ClientKind;
  onClose: () => void;
}

function TextInput({ label, placeholder = "", value, type = "text" }: { label: string; placeholder?: string; value?: string; type?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs text-text-secondary">{label}</span>
      <input
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        className="focus-ring h-11 w-full rounded-md border border-border-strong bg-white px-3 text-sm text-text-primary placeholder:text-text-muted"
      />
    </label>
  );
}

function SelectInput({ label, placeholder = "Select", value }: { label: string; placeholder?: string; value?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs text-text-secondary">{label}</span>
      <span className="focus-within:ring-2 focus-within:ring-primary/20 flex h-11 items-center rounded-md border border-border-strong bg-white">
        <select
          defaultValue={value ?? ""}
          className="h-full min-w-0 flex-1 appearance-none rounded-md bg-transparent px-3 text-sm text-text-primary outline-none"
        >
          <option value="" disabled>{placeholder}</option>
          <option value="nigeria">Nigeria</option>
          <option value="lagos">Lagos</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="active">Active</option>
          <option value="full-time">Full Time</option>
          <option value="salary">Salary</option>
          <option value="passport">Passport</option>
          <option value="single">Single</option>
        </select>
        <ChevronDown size={16} className="mr-3 text-text-secondary" aria-hidden />
      </span>
    </label>
  );
}

function PhoneInput({ label, value }: { label: string; value?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs text-text-secondary">{label}</span>
      <div className="focus-within:ring-2 focus-within:ring-primary/20 flex h-11 overflow-hidden rounded-md border border-border-strong bg-white">
        <select className="w-20 border-r border-border bg-white px-3 text-sm outline-none" defaultValue="234">
          <option value="234">234</option>
          <option value="1">1</option>
          <option value="44">44</option>
        </select>
        <input
          defaultValue={value}
          placeholder="0"
          className="min-w-0 flex-1 px-3 text-sm outline-none placeholder:text-text-muted"
        />
      </div>
    </label>
  );
}

function UploadBox({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <span className="mb-2 block text-xs text-text-secondary">{label}</span>
      <div className="flex h-10 items-center justify-between rounded-md border border-dashed border-border-strong px-3 text-sm text-text-secondary">
        <span className="truncate">{value ?? "Click or Drop to upload image"}</span>
        {value && <Trash2 size={16} className="text-text-muted" aria-hidden />}
      </div>
      <p className="mt-2 flex items-center gap-1 text-xs text-amber-700">
        <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-600 text-[9px] text-white">i</span>
        3MB image or less
      </p>
    </div>
  );
}

function NestedSheet({ title, onClose, kind }: { title: string; onClose: () => void; kind: "employer" | "business" | "kin" }) {
  return (
    <div className="fixed inset-0 z-[70] bg-black/30">
      <div className="absolute right-8 top-4 flex h-[calc(100vh-32px)] w-[860px] flex-col overflow-hidden rounded-lg bg-white ">
        <header className="flex h-[68px] items-center justify-between border-b border-border px-7">
          <h3 className="text-base font-semibold text-text-primary">{title}</h3>
          <button onClick={onClose} className="focus-ring rounded-md p-1 text-text-secondary hover:bg-surface-muted" aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-7 py-6">
          {kind === "kin" ? (
            <BasicPersonFields />
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <TextInput label={kind === "employer" ? "Employer Name" : "Business Name"} placeholder="Enter name" />
              <PhoneInput label={kind === "employer" ? "Employer Phone Number" : "Business Phone Number"} />
              <div className="col-span-2 mt-1 grid grid-cols-2 gap-4">
                <SelectInput label={kind === "employer" ? "First Address" : "Business Address"} placeholder="Country" />
                <TextInput label="\u00a0" placeholder="Street" />
                <SelectInput label="\u00a0" placeholder="State" />
                <SelectInput label="\u00a0" placeholder="City" />
                <TextInput label="\u00a0" placeholder="Postal Code" />
              </div>
            </div>
          )}
        </div>
        <footer className="flex justify-end gap-4 border-t border-border px-7 py-5">
          <button onClick={onClose} className="focus-ring h-10 w-[200px] rounded-md border border-border-strong text-sm text-text-secondary">Cancel</button>
          <button onClick={onClose} className="focus-ring h-10 w-[220px] rounded-md bg-primary text-sm font-medium text-white hover:bg-primary-hover">
            {kind === "business" ? "Create New Business" : "Done"}
          </button>
        </footer>
      </div>
    </div>
  );
}

function BasicPersonFields() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-4">
      <UploadBox label="Client Image" value="Temitope Aiyegbusi.png" />
      <UploadBox label="Client Signature" value="Temitope Aiyegbusi Signature..." />
      <TextInput label="First Name" value="Temitope" />
      <TextInput label="Middle Name" value="Ayokunle" />
      <TextInput label="Last Name" value="Aiyegbusi" />
      <TextInput label="Father’s Name" value="Olusegun" />
      <TextInput label="Email Address" value="aiyegbusitope@gmail.com" type="email" />
      <PhoneInput label="Phone Number" value="902 647 3823" />
      <SelectInput label="Gender" value="male" />
      <TextInput label="Client ID" value="12349032BS" />
      <TextInput label="Date of Birth" value="12 January, 2024" />
      <SelectInput label="Salutation" value="single" />
      <SelectInput label="Nationality" value="nigeria" />
      <SelectInput label="Citizenship" value="nigeria" />
      <SelectInput label="Marital Status" value="single" />
      <SelectInput label="Primary Identification Type" value="passport" />
      <TextInput label="Primary Identification Expiration Date" value="12 January, 2024" />
      <SelectInput label="Alternative Identification Type" value="passport" />
      <TextInput label="Alternative Identification Expiration Date" />
    </div>
  );
}

function IndividualStep({ step, openNested }: { step: number; openNested: (kind: "employer" | "business" | "kin") => void }) {
  if (step === 1) return <BasicPersonFields />;
  if (step === 2) return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-4">
      <div className="col-span-2 grid grid-cols-2 gap-4">
        <SelectInput label="First Address" placeholder="Country" />
        <TextInput label="\u00a0" placeholder="Street" />
        <SelectInput label="\u00a0" placeholder="State" />
        <SelectInput label="\u00a0" placeholder="City" />
        <TextInput label="\u00a0" placeholder="Postal Code" />
      </div>
      <div className="col-span-2 mt-2 grid grid-cols-2 gap-4">
        <SelectInput label="Second Address" placeholder="Country" />
        <TextInput label="\u00a0" placeholder="Street" />
        <SelectInput label="\u00a0" placeholder="State" />
        <SelectInput label="\u00a0" placeholder="City" />
        <TextInput label="\u00a0" placeholder="Postal Code" />
      </div>
      <TextInput label="Email Address" />
      <TextInput label="Additional Email Address" />
      <PhoneInput label="Phone Number" />
      <PhoneInput label="Additional Phone Number" />
      <SelectInput label="Location" />
    </div>
  );
  if (step === 3) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 flex items-end justify-between">
          <SelectInput label="Company Name" placeholder="Search" />
          <button type="button" onClick={() => openNested("employer")} className="mb-3 ml-4 whitespace-nowrap text-sm text-primary">Create New Employer +</button>
        </div>
        <SelectInput label="Industry / Sector" value="nigeria" />
        <TextInput label="Position" value="Product Designer" />
        <SelectInput label="Employment Type" value="full-time" />
        <SelectInput label="Employment Status" value="active" />
        <SelectInput label="Source of Income" value="salary" />
        <TextInput label="Monthly Income" value="$40,000" />
      </div>
      <div className="border-t border-border pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-medium text-text-primary">Owned Businesses</h4>
          <button type="button" onClick={() => openNested("business")} className="text-sm text-primary">Create New Owned Business +</button>
        </div>
        <SelectInput label="Business Name" value="nigeria" />
        <button type="button" className="mt-3 text-sm text-primary">Add Another Owned Business</button>
      </div>
    </div>
  );
  if (step === 4) return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-text-secondary">Next of Kin</span>
        <button type="button" onClick={() => openNested("kin")} className="text-sm text-primary">Create New Next of Kin +</button>
      </div>
      <SelectInput label="" placeholder="Select" />
      <button type="button" className="mt-3 text-sm text-primary">Add Another Next of Kin</button>
    </div>
  );
  return <AdditionalFields />;
}

function AdditionalFields() {
  return (
    <div className="space-y-5">
      <div>
        <h4 className="mb-4 text-sm font-medium text-text-primary">Assign to</h4>
        <div className="grid grid-cols-2 gap-4">
          <SelectInput label="Branch" />
          <SelectInput label="Credit Officer" />
          <SelectInput label="Center" />
        </div>
      </div>
      <div className="border-t border-border pt-5">
        <h4 className="mb-4 text-sm font-medium text-text-primary">Other Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <SelectInput label="Created on" />
          <SelectInput label="Bank Account Number" />
          <SelectInput label="Bank" />
        </div>
      </div>
      <label className="block border-t border-border pt-5">
        <span className="mb-2 block text-sm font-medium text-text-primary">Notes</span>
        <textarea className="focus-ring h-36 w-full resize-none rounded-md border border-border-strong p-3 text-sm" />
      </label>
    </div>
  );
}

function GenericClientStep({ type, step }: { type: ClientKind; step: number }) {
  if (step === 1) {
    if (type === "Corporate") return (
      <div className="grid grid-cols-2 gap-4">
        <TextInput label="Company Name" value="New Corporate Client" />
        <TextInput label="Registration Number" value="RC-102938" />
        <SelectInput label="Industry / Sector" value="nigeria" />
        <TextInput label="Tax Identification Number" />
        <TextInput label="Email Address" />
        <PhoneInput label="Phone Number" />
      </div>
    );
    if (type === "Center") return (
      <div className="grid grid-cols-2 gap-4">
        <TextInput label="Center Name" value="New Center" />
        <TextInput label="Center Code" />
        <SelectInput label="Branch" />
        <SelectInput label="Center Manager" />
        <SelectInput label="Status" value="active" />
      </div>
    );
  }
  if (step === 2) return <IndividualStep step={2} openNested={() => {}} />;
  if (step === 5) return <AdditionalFields />;
  return (
    <div className="grid grid-cols-2 gap-4">
      <SelectInput label={type === "Center" ? "Member" : "Related Person"} />
      <SelectInput label="Role" />
      <TextInput label="Notes" />
      <button type="button" className="col-span-2 text-left text-sm text-primary">+ Add Another</button>
    </div>
  );
}

export default function ClientOnboardingModal({ type, onClose }: Props) {
  const steps = STEP_LABELS[type];
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [nested, setNested] = useState<"employer" | "business" | "kin" | null>(null);
  const title = useMemo(() => `Create New ${type === "Persons" ? "Person" : type === "Individual" ? "Client" : TYPE_LABEL[type]}`, [type]);

  if (success) {
    return (
      <SuccessModal
        open={true}
        title={`New ${TYPE_LABEL[type]} Added`}
        body={`Your new ${TYPE_LABEL[type].toLowerCase()} has been added successfully, go to user section to see your new user.`}
        onClose={onClose}
        onOkay={onClose}
      />
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/35">
        <div className="absolute right-8 top-4 flex h-[calc(100vh-32px)] w-[980px] max-w-[calc(100vw-64px)] overflow-hidden rounded-lg bg-white animate-[modalIn_180ms_ease-out]">
          <aside className="w-[300px] shrink-0 bg-surface-muted/70">
            <div className="flex h-[68px] items-center border-b border-border px-7">
              <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            </div>
            <div className="px-6 py-6">
              <p className="mb-5 text-xs text-text-secondary">Client Creation Process</p>
              <div className="space-y-2">
                {steps.map((s) => {
                  const active = s.id === step;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStep(s.id)}
                      className={`focus-ring flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm transition-colors ${active ? "bg-white text-text-primary " : "text-text-secondary hover:bg-white/70"}`}
                    >
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${active ? "bg-primary text-white" : "bg-white text-text-secondary"}`}>{s.id}</span>
                      <span className="flex-1">{s.title}</span>
                      {active && <ChevronDown size={15} className="-rotate-90 text-text-secondary" aria-hidden />}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <section className="flex min-w-0 flex-1 flex-col">
            <header className="flex h-[68px] items-center justify-end border-b border-border px-7">
              <button onClick={onClose} className="focus-ring rounded-md p-1 text-text-secondary hover:bg-surface-muted" aria-label="Close">
                <X size={18} />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-7 py-6">
              <div className="transition-all duration-200 ease-out">
                {type === "Individual" || type === "Persons" ? (
                  <IndividualStep step={step} openNested={setNested} />
                ) : (
                  <GenericClientStep type={type} step={step} />
                )}
              </div>
            </div>
            <footer className="flex justify-end gap-4 border-t border-border px-7 py-5">
              <button type="button" onClick={onClose} className="focus-ring h-10 w-[220px] rounded-md border border-border-strong text-sm text-text-secondary">Cancel</button>
              <button
                type="button"
                onClick={() => (step < steps.length ? setStep((s) => s + 1) : setSuccess(true))}
                className="focus-ring h-10 w-[220px] rounded-md bg-primary text-sm font-medium text-white transition-colors hover:bg-primary-hover"
              >
                {step < steps.length ? "Continue" : "Done"}
              </button>
            </footer>
          </section>
        </div>
      </div>

      {nested && (
        <NestedSheet
          kind={nested}
          title={nested === "employer" ? "Create New Employer" : nested === "business" ? "Create New Owned Business" : "Create New Next of Kin"}
          onClose={() => setNested(null)}
        />
      )}
    </>
  );
}
