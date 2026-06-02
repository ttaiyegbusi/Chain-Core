"use client";

import { useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Edit3,
  Info,
  Trash2,
  X,
} from "lucide-react";
import SuccessModal from "@/components/SuccessModal";

type StepId = 1 | 2 | 3 | 4 | 5;

type CreateMode = "employer" | "business" | "nextOfKin" | null;

interface Props {
  open: boolean;
  onClose: () => void;
}

const steps: Array<{ id: StepId; label: string }> = [
  { id: 1, label: "Basic Information" },
  { id: 2, label: "Contact Information" },
  { id: 3, label: "Work Information" },
  { id: 4, label: "Next of Kin" },
  { id: 5, label: "Additional Information" },
];

export default function CreateClientModal({ open, onClose }: Props) {
  const [step, setStep] = useState<StepId>(1);
  const [createMode, setCreateMode] = useState<CreateMode>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const [businesses, setBusinesses] = useState<string[]>([]);
  const [kins, setKins] = useState<string[]>([]);

  if (!open) return null;

  const isLast = step === 5;

  const closeAll = () => {
    setSuccessOpen(false);
    setStep(1);
    setPrefilled(false);
    setBusinesses([]);
    setKins([]);
    onClose();
  };

  const continueFlow = () => {
    if (isLast) {
      setSuccessOpen(true);
      return;
    }
    setStep((prev) => Math.min(5, prev + 1) as StepId);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6 py-6 backdrop-blur-[1px]">
        <div className="flex h-[calc(100vh-48px)] max-h-[900px] w-[1040px] max-w-[calc(100vw-48px)] overflow-hidden rounded-xl bg-white shadow-[0_24px_80px_rgba(17,24,39,0.24)]">
          <aside className="w-[280px] shrink-0 border-r border-border bg-[#F6F8FA]">
            <div className="flex h-[72px] items-center border-b border-border px-6">
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-text-primary">
                Create New Client
              </h2>
            </div>
            <div className="px-6 pt-7">
              <p className="mb-6 text-xs font-medium text-text-secondary">
                Client Creation Process
              </p>
              <nav className="space-y-2" aria-label="Client creation steps">
                {steps.map((s) => {
                  const active = step === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStep(s.id)}
                      className={`focus-ring flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm transition-colors ${
                        active
                          ? "bg-white font-medium text-text-primary shadow-[0_1px_2px_rgba(17,24,39,0.04)]"
                          : "text-text-secondary hover:bg-white/70 hover:text-text-primary"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${
                          active
                            ? "bg-primary text-white"
                            : "bg-white text-text-secondary shadow-[0_1px_3px_rgba(17,24,39,0.08)]"
                        }`}
                      >
                        {s.id}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{s.label}</span>
                      {active && <ChevronRight size={16} className="text-text-secondary" />}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          <section className="flex min-w-0 flex-1 flex-col bg-white">
            <header className="flex h-[72px] items-center justify-between border-b border-border px-6">
              <div className="flex items-center gap-3">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.max(1, s - 1) as StepId)}
                    className="focus-ring flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                    aria-label="Go back"
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}
                <h3 className="text-base font-semibold text-text-primary">
                  {step === 1 ? "Basic Information" : `Create New ${steps[step - 1].label.replace("Information", "").trim()}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="focus-ring flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                aria-label="Close create client"
              >
                <X size={18} />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              {step === 1 && <BasicInformationStep prefilled={prefilled} />}
              {step === 2 && <ContactInformationStep />}
              {step === 3 && (
                <WorkInformationStep
                  prefilled={prefilled}
                  businesses={businesses}
                  onCreateEmployer={() => setCreateMode("employer")}
                  onCreateBusiness={() => setCreateMode("business")}
                  onRemoveBusiness={(idx) => setBusinesses((b) => b.filter((_, i) => i !== idx))}
                />
              )}
              {step === 4 && (
                <NextOfKinStep
                  kins={kins}
                  onCreateKin={() => setCreateMode("nextOfKin")}
                  onRemoveKin={(idx) => setKins((items) => items.filter((_, i) => i !== idx))}
                />
              )}
              {step === 5 && <AdditionalInformationStep prefilled={prefilled} />}
            </div>

            <footer className="flex h-[80px] items-center justify-end gap-4 border-t border-border bg-white px-6">
              <button
                type="button"
                onClick={onClose}
                className="focus-ring h-10 w-[240px] rounded-md border border-border-strong bg-white text-sm font-medium text-text-secondary hover:bg-surface-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={continueFlow}
                className="focus-ring h-10 w-[240px] rounded-md bg-primary text-sm font-medium text-white shadow-[0_4px_10px_rgba(49,87,246,0.18)] hover:bg-primary-hover"
              >
                {isLast ? "Done" : "Continue"}
              </button>
            </footer>
          </section>
        </div>
      </div>

      {createMode && (
        <NestedEntityModal
          mode={createMode}
          onClose={() => setCreateMode(null)}
          onDone={() => {
            if (createMode === "business") setBusinesses((b) => [...b, "Newbii Africa"]);
            if (createMode === "nextOfKin") setKins((k) => [...k, "Ayobami Aiyegbusi"]);
            if (createMode === "employer") setPrefilled(true);
            setCreateMode(null);
          }}
        />
      )}

      <SuccessModal
        open={successOpen}
        onClose={closeAll}
        onOkay={closeAll}
        title="New Individual Client Added"
        body="Your new individual client has been added successfully, go to user section to see your new user."
      />
    </>
  );
}

function BasicInformationStep({ prefilled }: { prefilled: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-3.5 pb-6">
      <UploadField label="Client Image" value={prefilled ? "Temitope Aiyegbusi.png" : undefined} />
      <UploadField label="Client Signature" value={prefilled ? "Temitope Aiyegbusi Signature..." : undefined} />
      <TextField label="First Name" value={prefilled ? "Temitope" : undefined} />
      <TextField label="Middle Name" value={prefilled ? "Ayokunle" : undefined} />
      <TextField label="Last Name" value={prefilled ? "Aiyegbusi" : undefined} />
      <TextField label="Father's Name" value={prefilled ? "Olusegun" : undefined} />
      <TextField label="Email Address" value={prefilled ? "aiyegbusitope@gmail.com" : undefined} />
      <PhoneField value={prefilled ? "902 647 3823" : "0"} />
      <SelectField label="Gender" value={prefilled ? "Male" : undefined} />
      <TextField label="Client ID" value={prefilled ? "12349032BS" : undefined} />
      <DateField label="Date of Birth" value={prefilled ? "12 January, 2024" : undefined} />
      <SelectField label="Salutation" value={prefilled ? "Sir" : undefined} />
      <SelectField label="Nationality" value={prefilled ? "Nigerian" : undefined} />
      <SelectField label="Citizenship" value={prefilled ? "Nigerian" : undefined} />
      <SelectField label="Marital Status" value={prefilled ? "Single" : undefined} />
      <SelectField label="Primary Identification Type" value={prefilled ? "Passport" : undefined} />
      <DateField label="Primary Identification Expiration Date" value={prefilled ? "12 January, 2024" : undefined} />
      <SelectField label="Alternative Identification Type" value={prefilled ? "Passport" : undefined} />
      <DateField label="Alternative Identification Expiration Date" />
    </div>
  );
}

function ContactInformationStep() {
  return (
    <div className="space-y-4 pb-6">
      <AddressBlock title="First Address" />
      <AddressBlock title="Second Address" />
      <div className="grid grid-cols-2 gap-x-5 gap-y-3.5">
        <TextField label="Email Address" />
        <TextField label="Additional Email Address" />
        <PhoneField />
        <PhoneField label="Additional Phone Number" />
        <SelectField label="Location" />
      </div>
    </div>
  );
}

function WorkInformationStep({
  prefilled,
  businesses,
  onCreateEmployer,
  onCreateBusiness,
  onRemoveBusiness,
}: {
  prefilled: boolean;
  businesses: string[];
  onCreateEmployer: () => void;
  onCreateBusiness: () => void;
  onRemoveBusiness: (idx: number) => void;
}) {
  const hasBusinesses = businesses.length > 0 || prefilled;
  const visibleBusinesses = hasBusinesses ? (businesses.length ? businesses : ["Newbii Africa", "The Warehouse Company"]) : [];
  return (
    <div className="space-y-5 pb-6">
      <div className="grid grid-cols-2 gap-x-5 gap-y-3.5">
        <div className="col-span-2 flex items-end gap-3">
          <div className="flex-1">
            <SelectField label="Company Name" placeholder="Search" />
          </div>
          <button type="button" onClick={onCreateEmployer} className="mb-[11px] shrink-0 text-sm font-medium text-primary hover:underline">
            Create New Employer +
          </button>
        </div>
        <SelectField label="Industry / Sector" value={prefilled ? "Fintech" : undefined} />
        <TextField label="Position" value={prefilled ? "Product Designer" : undefined} />
        <SelectField label="Employment Type" value={prefilled ? "Full Time" : undefined} />
        <SelectField label="Employment Status" value={prefilled ? "Active" : undefined} />
        <SelectField label="Source of Income" value={prefilled ? "Salary" : undefined} />
        <TextField label="Monthly Income" value={prefilled ? "$40,000" : undefined} />
      </div>
      <div className="border-t border-border pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-medium text-text-primary">Owned Businesses</h4>
          <button type="button" onClick={onCreateBusiness} className="text-sm font-medium text-primary hover:underline">
            Create New Owned Business +
          </button>
        </div>
        <div className="space-y-2">
          {visibleBusinesses.length === 0 ? (
            <SelectField label="Business Name" />
          ) : (
            visibleBusinesses.map((name, index) => (
              <div key={`${name}-${index}`} className="flex gap-2">
                <div className="flex h-11 flex-1 items-center justify-between rounded-md border border-border-strong px-3 text-sm text-text-primary">
                  {name}
                  <ChevronDown size={16} className="text-text-secondary" />
                </div>
                <button type="button" onClick={() => onRemoveBusiness(index)} className="focus-ring flex h-11 w-11 items-center justify-center rounded-md bg-surface-muted text-text-secondary hover:text-red-600">
                  <Trash2 size={17} />
                </button>
              </div>
            ))
          )}
        </div>
        <button type="button" onClick={onCreateBusiness} className="mt-3 text-sm font-medium text-primary hover:underline">
          Add Another Owned Business
        </button>
      </div>
    </div>
  );
}

function NextOfKinStep({ kins, onCreateKin, onRemoveKin }: { kins: string[]; onCreateKin: () => void; onRemoveKin: (idx: number) => void }) {
  const visible = kins.length ? kins : [];
  return (
    <div className="pb-6">
      <div className="mb-3 flex items-center justify-between">
        <label className="text-sm text-text-secondary">Next of Kin</label>
        <button type="button" onClick={onCreateKin} className="text-sm font-medium text-primary hover:underline">
          Create New Next of Kin +
        </button>
      </div>
      {visible.length === 0 ? (
        <SelectBox placeholder="Select" />
      ) : (
        <div className="space-y-2">
          {visible.map((name, index) => (
            <div key={`${name}-${index}`} className="flex gap-2">
              <div className="flex h-11 flex-1 items-center gap-3 rounded-md border border-border-strong px-3 text-sm text-text-primary">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-muted text-[10px] text-text-secondary">{index === 0 ? "👤" : "OA"}</span>
                <span className="flex-1">{name}</span>
                <ChevronDown size={16} className="text-text-secondary" />
              </div>
              <button type="button" className="focus-ring flex h-11 w-11 items-center justify-center rounded-md bg-surface-muted text-text-secondary hover:text-primary"><Edit3 size={16} /></button>
              <button type="button" onClick={() => onRemoveKin(index)} className="focus-ring flex h-11 w-11 items-center justify-center rounded-md bg-surface-muted text-text-secondary hover:text-red-600"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      )}
      <button type="button" onClick={onCreateKin} className="mt-3 text-sm font-medium text-primary hover:underline">
        Add Another Next of Kin
      </button>
    </div>
  );
}

function AdditionalInformationStep({ prefilled }: { prefilled: boolean }) {
  return (
    <div className="space-y-5 pb-6">
      <section>
        <h4 className="mb-3 text-base font-medium text-text-primary">Assign to</h4>
        <div className="grid grid-cols-2 gap-x-5 gap-y-3.5">
          <SelectField label="Branch" value={prefilled ? "Lagos" : undefined} />
          <SelectField label="Credit Officer" value={prefilled ? "Helen Paul" : undefined} />
          <SelectField label="Center" value={prefilled ? "Lagos" : undefined} />
        </div>
      </section>
      <section className="border-t border-border pt-4">
        <h4 className="mb-3 text-base font-medium text-text-primary">Other Information</h4>
        <div className="grid grid-cols-2 gap-x-5 gap-y-3.5">
          <SelectField label="Created on" value={prefilled ? "Lagos" : undefined} />
          <TextField label="Bank Account Number" value={prefilled ? "1234567890" : undefined} />
          <SelectField label="Bank" value={prefilled ? "Access" : undefined} />
        </div>
      </section>
      <section className="border-t border-border pt-4">
        <label className="mb-2 block text-base font-medium text-text-primary">Notes</label>
        <textarea className="focus-ring h-36 w-full resize-none rounded-md border border-border-strong px-3 py-2 text-sm text-text-primary placeholder:text-text-muted" />
      </section>
    </div>
  );
}

function NestedEntityModal({ mode, onClose, onDone }: { mode: Exclude<CreateMode, null>; onClose: () => void; onDone: () => void }) {
  const title = mode === "employer" ? "Create New Employer" : mode === "business" ? "Create New Owned Business" : "Create New Next of Kin";
  const primary = mode === "business" ? "Create New Business" : "Done";
  const isKin = mode === "nextOfKin";
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 px-6 py-6">
      <div className={`max-h-[calc(100vh-48px)] overflow-hidden rounded-xl bg-white shadow-[0_24px_80px_rgba(17,24,39,0.24)] ${isKin ? "w-[560px]" : "w-[760px]"}`}>
        <header className="flex h-[72px] items-center justify-between border-b border-border px-6">
          <div className="flex items-center gap-3">
            {mode !== "nextOfKin" && <ChevronLeft size={18} className="text-text-secondary" />}
            <h3 className="text-base font-semibold text-text-primary">{title}</h3>
          </div>
          <button onClick={onClose} className="focus-ring flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-surface-muted"><X size={18} /></button>
        </header>
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-6 py-5">
          {isKin ? (
            <BasicInformationStep prefilled />
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-3.5">
              <TextField label={mode === "employer" ? "Employer Name" : "Business Name"} value={mode === "business" ? "Fintech" : undefined} />
              <PhoneField label={mode === "employer" ? "Employer Phone Number" : "Business Phone Number"} />
              <div className="col-span-2"><AddressBlock title={mode === "employer" ? "First Address" : "Business Address"} /></div>
            </div>
          )}
        </div>
        <footer className="flex h-[80px] items-center justify-end gap-4 border-t border-border bg-white px-6">
          <button onClick={onClose} className="focus-ring h-10 w-[240px] rounded-md border border-border-strong bg-white text-sm font-medium text-text-secondary hover:bg-surface-muted">Cancel</button>
          <button onClick={onDone} className="focus-ring h-10 w-[240px] rounded-md bg-primary text-sm font-medium text-white hover:bg-primary-hover">{primary}</button>
        </footer>
      </div>
    </div>
  );
}

function AddressBlock({ title }: { title: string }) {
  return (
    <div>
      <p className="mb-2 text-sm text-text-secondary">{title}</p>
      <div className="grid grid-cols-6 gap-2.5">
        <div className="col-span-3"><SelectBox placeholder="Country" /></div>
        <div className="col-span-3"><InputBox placeholder="Street" /></div>
        <div className="col-span-2"><SelectBox placeholder="State" /></div>
        <div className="col-span-2"><SelectBox placeholder="City" /></div>
        <div className="col-span-2"><InputBox placeholder="Postal Code" /></div>
      </div>
    </div>
  );
}

function UploadField({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <label className="mb-2 block text-sm text-text-secondary">{label}</label>
      <div className="flex h-10 items-center justify-between rounded-md border border-dashed border-border-strong px-3 text-sm text-text-secondary">
        <span className="truncate">{value ?? "Click or Drop to upload image"}</span>
        {value && <Trash2 size={16} className="text-text-secondary" />}
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-700"><Info size={13} fill="currentColor" className="text-amber-600" />3MB Image or less</p>
    </div>
  );
}

function TextField({ label, value }: { label: string; value?: string }) {
  return <Field label={label}><InputBox value={value} /></Field>;
}
function SelectField({ label, value, placeholder }: { label: string; value?: string; placeholder?: string }) {
  return <Field label={label}><SelectBox value={value} placeholder={placeholder} /></Field>;
}
function DateField({ label, value }: { label: string; value?: string }) {
  return <Field label={label}><div className="relative"><InputBox value={value} /><CalendarDays size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" /></div></Field>;
}
function PhoneField({ label = "Phone Number", value = "0" }: { label?: string; value?: string }) {
  return (
    <Field label={label}>
      <div className="flex h-11 overflow-hidden rounded-md border border-border-strong bg-white">
        <button type="button" className="flex w-[72px] items-center justify-center gap-1 border-r border-border-strong text-sm text-text-primary">234 <ChevronDown size={14} /></button>
        <input defaultValue={value} className="min-w-0 flex-1 px-3 text-sm text-text-primary outline-none placeholder:text-text-muted" placeholder="0" />
      </div>
    </Field>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-2 block text-sm text-text-secondary">{label}</label>{children}</div>;
}
function InputBox({ value, placeholder }: { value?: string; placeholder?: string }) {
  return <input defaultValue={value} placeholder={placeholder} className="focus-ring h-11 w-full rounded-md border border-border-strong bg-white px-3 text-sm text-text-primary placeholder:text-text-muted" />;
}
function SelectBox({ value, placeholder = "" }: { value?: string; placeholder?: string }) {
  return (
    <button type="button" className="focus-ring flex h-11 w-full items-center justify-between rounded-md border border-border-strong bg-white px-3 text-left text-sm text-text-primary">
      <span className={value ? "" : "text-text-muted"}>{value ?? placeholder}</span>
      <ChevronDown size={16} className="text-text-secondary" />
    </button>
  );
}
