"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, ImagePlus, Plus, Trash2, X } from "lucide-react";
import SuccessModal from "@/components/SuccessModal";

type ClientKind = "Individual" | "Corporate" | "Center";
type StepKey = "basic" | "contact" | "work" | "nextOfKin" | "additional";

type Option = { value: string; label: string };

const commonOptions = {
  gender: ["Male", "Female"],
  salutation: ["Mr", "Mrs", "Ms", "Dr", "Prof"],
  country: ["Nigeria", "Ghana", "Kenya", "South Africa"],
  state: ["Lagos", "Abuja", "Ogun", "Oyo", "Rivers"],
  marital: ["Single", "Married", "Divorced", "Widowed"],
  idType: ["NIN", "BVN", "International Passport", "Driver's License", "Voter's Card"],
  nationality: ["Nigerian", "Ghanaian", "Kenyan", "South African"],
  citizenship: ["Nigeria", "Ghana", "Kenya", "South Africa"],
  employmentType: ["Full Time", "Part Time", "Contract", "Self-employed", "Unemployed"],
  employmentStatus: ["Active", "Inactive", "Retired"],
  incomeSource: ["Salary", "Business", "Investment", "Pension", "Family Support"],
  industry: ["Fintech", "Agriculture", "Retail", "Education", "Healthcare", "Manufacturing"],
  branch: ["Head Office", "Lagos", "Abuja", "Port Harcourt", "Ibadan"],
  center: ["Chain Consults", "Lekki Center", "Ikeja Center", "Abuja Cooperative"],
  officer: ["Temitope Aiyegbusi", "Ayobami Aiyegbusi", "Tolu Martins", "Aisha Bello"],
  bank: ["Wema Bank", "Access Bank", "GTBank", "Zenith Bank", "UBA"],
  corporateType: ["Limited Liability Company", "Partnership", "Cooperative", "NGO", "Sole Proprietorship"],
  centerType: ["Savings Group", "Cooperative Center", "Loan Group", "Community Center"],
};

const toOptions = (items: string[]): Option[] => items.map((label) => ({ value: label, label }));

const individualSteps: { key: StepKey; title: string; description: string }[] = [
  { key: "basic", title: "Basic Information", description: "Client identity and KYC details" },
  { key: "contact", title: "Contact Information", description: "Address and contact channels" },
  { key: "work", title: "Work Information", description: "Employment and business profile" },
  { key: "nextOfKin", title: "Next of Kin", description: "Emergency contact and relatives" },
  { key: "additional", title: "Additional Information", description: "Branch assignment and notes" },
];

const corporateSteps: { key: StepKey; title: string; description: string }[] = [
  { key: "basic", title: "Basic Information", description: "Company identity and registration" },
  { key: "contact", title: "Contact Information", description: "Company addresses and contacts" },
  { key: "work", title: "Business Information", description: "Industry, ownership and revenue" },
  { key: "nextOfKin", title: "Directors", description: "Add directors and signatories" },
  { key: "additional", title: "Additional Information", description: "Branch assignment and notes" },
];

const centerSteps: { key: StepKey; title: string; description: string }[] = [
  { key: "basic", title: "Basic Information", description: "Center profile and group identity" },
  { key: "contact", title: "Contact Information", description: "Center location and contacts" },
  { key: "work", title: "Meeting Information", description: "Meeting schedule and group setup" },
  { key: "nextOfKin", title: "Members", description: "Add center members and leaders" },
  { key: "additional", title: "Additional Information", description: "Branch assignment and notes" },
];

interface Props {
  open: boolean;
  kind: ClientKind;
  onClose: () => void;
}

export default function CreateClientWizard({ open, kind, onClose }: Props) {
  const [activeStep, setActiveStep] = useState<StepKey>("basic");
  const [successOpen, setSuccessOpen] = useState(false);
  const [subModal, setSubModal] = useState<null | "employer" | "business" | "person">(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [relatedPeople, setRelatedPeople] = useState<string[]>([]);
  const [ownedBusinesses, setOwnedBusinesses] = useState<string[]>([]);

  const steps = useMemo(() => {
    if (kind === "Corporate") return corporateSteps;
    if (kind === "Center") return centerSteps;
    return individualSteps;
  }, [kind]);

  if (!open && !successOpen) return null;

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  const index = steps.findIndex((step) => step.key === activeStep);
  const isLast = index === steps.length - 1;

  const goNext = () => {
    if (!isLast) {
      setActiveStep(steps[index + 1].key);
      return;
    }
    // Important: close the wizard sheet first, then show only the centered success modal.
    onClose();
    setSuccessOpen(true);
  };

  const successTitle = `New ${kind} Client Added`;
  const successBody = `Your new ${kind.toLowerCase()} client has been added successfully.`;

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={`Create ${kind} Client`}>
          <button className="absolute inset-0 bg-black/35" aria-label="Close create client modal" onClick={onClose} />

          <aside className="absolute bottom-6 right-8 top-6 flex w-[1040px] max-w-[calc(100vw-360px)] overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(17,24,39,0.28)] animate-client-sheet-in">
            <div className="w-[286px] shrink-0 border-r border-border bg-[#F8F9FB] px-5 py-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted">Create New Client</p>
                  <h2 className="mt-1 text-lg font-semibold text-text-primary">{kind} Client</h2>
                </div>
                <button type="button" onClick={onClose} className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg bg-white text-text-secondary hover:bg-border" aria-label="Close">
                  <X size={16} />
                </button>
              </div>

              <nav className="mt-8 space-y-2">
                {steps.map((step, stepIndex) => {
                  const active = step.key === activeStep;
                  const complete = stepIndex < index;
                  return (
                    <button key={step.key} type="button" onClick={() => setActiveStep(step.key)} className={["flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors", active ? "bg-white shadow-[0_8px_22px_rgba(17,24,39,0.06)]" : "hover:bg-white/70"].join(" ")}>
                      <span className={["mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold", complete ? "bg-primary text-white" : active ? "bg-primary/10 text-primary" : "bg-[#E9EDF3] text-text-secondary"].join(" ")}>
                        {complete ? <Check size={14} /> : stepIndex + 1}
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-text-primary">{step.title}</span>
                        <span className="mt-0.5 block text-xs leading-4 text-text-muted">{step.description}</span>
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <header className="flex h-[72px] items-center justify-between border-b border-border px-8">
                <div>
                  <h3 className="text-base font-semibold text-text-primary">{steps[index].title}</h3>
                  <p className="mt-0.5 text-xs text-text-muted">Fill in the details below to continue the onboarding process.</p>
                </div>
                <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-text-secondary">Step {index + 1} of {steps.length}</span>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6">
                {activeStep === "basic" && <BasicStep kind={kind} form={form} update={update} />}
                {activeStep === "contact" && <ContactStep form={form} update={update} />}
                {activeStep === "work" && (
                  <WorkStep kind={kind} form={form} update={update} onCreateEmployer={() => setSubModal("employer")} onCreateBusiness={() => setSubModal("business")} businesses={ownedBusinesses} removeBusiness={(name) => setOwnedBusinesses((prev) => prev.filter((item) => item !== name))} />
                )}
                {activeStep === "nextOfKin" && (
                  <RelatedPeopleStep kind={kind} people={relatedPeople} onCreate={() => setSubModal("person")} onRemove={(name) => setRelatedPeople((prev) => prev.filter((p) => p !== name))} />
                )}
                {activeStep === "additional" && <AdditionalStep kind={kind} form={form} update={update} />}
              </div>

              <footer className="flex h-[76px] items-center justify-between border-t border-border bg-white px-8">
                <button type="button" onClick={() => (index > 0 ? setActiveStep(steps[index - 1].key) : onClose())} className="focus-ring h-10 rounded-md border border-border-strong px-5 text-sm font-medium text-text-secondary hover:bg-surface-muted">
                  {index > 0 ? "Back" : "Cancel"}
                </button>
                <button type="button" onClick={goNext} className="focus-ring h-10 rounded-md bg-primary px-6 text-sm font-medium text-white hover:bg-primary-hover">
                  {isLast ? `Create ${kind} Client` : "Next"}
                </button>
              </footer>
            </div>
          </aside>

          {subModal && (
            <NestedCreateSheet
              type={subModal}
              onClose={() => setSubModal(null)}
              onDone={(name) => {
                if (subModal === "business") setOwnedBusinesses((prev) => [...prev, name || "New Owned Business"]);
                if (subModal === "person") setRelatedPeople((prev) => [...prev, name || (kind === "Corporate" ? "New Director" : kind === "Center" ? "New Member" : "New Next of Kin")]);
                if (subModal === "employer") update("employer", name || "New Employer");
                setSubModal(null);
              }}
            />
          )}
        </div>
      )}

      <SuccessModal
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        onOkay={() => setSuccessOpen(false)}
        title={successTitle}
        body={successBody}
      />
    </>
  );
}

function UploadBox({ label }: { label: string }) {
  return (
    <div>
      <label className="mb-2 block text-sm text-text-secondary">{label}</label>
      <button type="button" className="focus-ring flex h-[118px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-[#FAFBFC] text-center hover:bg-surface-muted">
        <ImagePlus size={22} className="text-text-muted" />
        <span className="mt-2 text-sm font-medium text-primary">Click or Drop to upload image</span>
        <span className="mt-1 text-xs text-text-muted">3MB image or less</span>
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-2 block text-sm text-text-secondary">{label}</label>{children}</div>;
}

function Input({ value, onChange, placeholder = "Type here" }: { value?: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="focus-ring h-[46px] w-full rounded-md border border-border-strong bg-white px-3.5 text-sm text-text-primary placeholder:text-text-muted" />;
}

function Select({ value, onChange, options, placeholder = "Select" }: { value?: string; onChange: (v: string) => void; options: Option[]; placeholder?: string }) {
  return (
    <div className="relative">
      <select value={value || ""} onChange={(e) => onChange(e.target.value)} className={["focus-ring h-[46px] w-full appearance-none rounded-md border border-border-strong bg-white px-3.5 pr-10 text-sm", value ? "text-text-primary" : "text-text-muted"].join(" ")}>
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <ChevronDown size={17} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mb-8"><div className="mb-5 flex h-9 items-center rounded-md bg-surface-muted px-4 text-sm font-medium text-text-primary">{title}</div>{children}</section>;
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-5 gap-y-5">{children}</div>;
}

function BasicStep({ kind, form, update }: { kind: ClientKind; form: Record<string, string>; update: (key: string, value: string) => void }) {
  if (kind === "Corporate") {
    return (
      <>
        <Section title="Company Identity"><Grid>
          <Field label="Company Name"><Input value={form.companyName} onChange={(v) => update("companyName", v)} /></Field>
          <Field label="Trading Name"><Input value={form.tradingName} onChange={(v) => update("tradingName", v)} /></Field>
          <Field label="Registration Number"><Input value={form.registrationNumber} onChange={(v) => update("registrationNumber", v)} /></Field>
          <Field label="Corporate Client ID"><Input value={form.clientId} onChange={(v) => update("clientId", v)} /></Field>
          <Field label="Corporate Type"><Select value={form.corporateType} onChange={(v) => update("corporateType", v)} options={toOptions(commonOptions.corporateType)} /></Field>
          <Field label="Registration Date"><Input value={form.registrationDate} onChange={(v) => update("registrationDate", v)} placeholder="DD/MM/YYYY" /></Field>
          <Field label="Tax Identification Number"><Input value={form.tin} onChange={(v) => update("tin", v)} /></Field>
          <Field label="Sector"><Select value={form.industry} onChange={(v) => update("industry", v)} options={toOptions(commonOptions.industry)} /></Field>
        </Grid></Section>
        <Section title="Documents"><Grid><UploadBox label="Company Logo" /><UploadBox label="Company Seal / Signature" /></Grid></Section>
      </>
    );
  }
  if (kind === "Center") {
    return <Section title="Center Identity"><Grid>
      <Field label="Center Name"><Input value={form.centerName} onChange={(v) => update("centerName", v)} /></Field>
      <Field label="Center ID"><Input value={form.clientId} onChange={(v) => update("clientId", v)} /></Field>
      <Field label="Center Type"><Select value={form.centerType} onChange={(v) => update("centerType", v)} options={toOptions(commonOptions.centerType)} /></Field>
      <Field label="Formation Date"><Input value={form.formationDate} onChange={(v) => update("formationDate", v)} placeholder="DD/MM/YYYY" /></Field>
      <Field label="Group Leader"><Input value={form.groupLeader} onChange={(v) => update("groupLeader", v)} /></Field>
      <Field label="Expected Members"><Input value={form.memberCount} onChange={(v) => update("memberCount", v)} /></Field>
      <UploadBox label="Center Image" />
      <UploadBox label="Center Signature" />
    </Grid></Section>;
  }
  return (
    <>
      <Section title="Uploads"><Grid><UploadBox label="Client Image" /><UploadBox label="Client Signature" /></Grid></Section>
      <Section title="Personal Information"><Grid>
        <Field label="First Name"><Input value={form.firstName} onChange={(v) => update("firstName", v)} /></Field>
        <Field label="Middle Name"><Input value={form.middleName} onChange={(v) => update("middleName", v)} /></Field>
        <Field label="Last Name"><Input value={form.lastName} onChange={(v) => update("lastName", v)} /></Field>
        <Field label="Father's Name"><Input value={form.fatherName} onChange={(v) => update("fatherName", v)} /></Field>
        <Field label="Email Address"><Input value={form.email} onChange={(v) => update("email", v)} /></Field>
        <Field label="Phone Number"><Input value={form.phone} onChange={(v) => update("phone", v)} /></Field>
        <Field label="Gender"><Select value={form.gender} onChange={(v) => update("gender", v)} options={toOptions(commonOptions.gender)} /></Field>
        <Field label="Client ID"><Input value={form.clientId} onChange={(v) => update("clientId", v)} /></Field>
        <Field label="Date of Birth"><Input value={form.dob} onChange={(v) => update("dob", v)} placeholder="DD/MM/YYYY" /></Field>
        <Field label="Salutation"><Select value={form.salutation} onChange={(v) => update("salutation", v)} options={toOptions(commonOptions.salutation)} /></Field>
        <Field label="Nationality"><Select value={form.nationality} onChange={(v) => update("nationality", v)} options={toOptions(commonOptions.nationality)} /></Field>
        <Field label="Citizenship"><Select value={form.citizenship} onChange={(v) => update("citizenship", v)} options={toOptions(commonOptions.citizenship)} /></Field>
        <Field label="Marital Status"><Select value={form.maritalStatus} onChange={(v) => update("maritalStatus", v)} options={toOptions(commonOptions.marital)} /></Field>
        <Field label="Primary Identification Type"><Select value={form.primaryId} onChange={(v) => update("primaryId", v)} options={toOptions(commonOptions.idType)} /></Field>
        <Field label="Primary Identification Expiration Date"><Input value={form.primaryIdExpiry} onChange={(v) => update("primaryIdExpiry", v)} placeholder="DD/MM/YYYY" /></Field>
        <Field label="Alternative Identification Type"><Select value={form.altId} onChange={(v) => update("altId", v)} options={toOptions(commonOptions.idType)} /></Field>
        <Field label="Alternative Identification Expiration Date"><Input value={form.altIdExpiry} onChange={(v) => update("altIdExpiry", v)} placeholder="DD/MM/YYYY" /></Field>
      </Grid></Section>
    </>
  );
}

function ContactStep({ form, update }: { form: Record<string, string>; update: (key: string, value: string) => void }) {
  return <>
    <Section title="First Address"><Grid>
      <Field label="Country"><Select value={form.country1} onChange={(v) => update("country1", v)} options={toOptions(commonOptions.country)} /></Field>
      <Field label="Street"><Input value={form.street1} onChange={(v) => update("street1", v)} /></Field>
      <Field label="State"><Select value={form.state1} onChange={(v) => update("state1", v)} options={toOptions(commonOptions.state)} /></Field>
      <Field label="City"><Input value={form.city1} onChange={(v) => update("city1", v)} /></Field>
      <Field label="Postal Code"><Input value={form.postal1} onChange={(v) => update("postal1", v)} /></Field>
    </Grid></Section>
    <Section title="Second Address"><Grid>
      <Field label="Country"><Select value={form.country2} onChange={(v) => update("country2", v)} options={toOptions(commonOptions.country)} /></Field>
      <Field label="Street"><Input value={form.street2} onChange={(v) => update("street2", v)} /></Field>
      <Field label="State"><Select value={form.state2} onChange={(v) => update("state2", v)} options={toOptions(commonOptions.state)} /></Field>
      <Field label="City"><Input value={form.city2} onChange={(v) => update("city2", v)} /></Field>
      <Field label="Postal Code"><Input value={form.postal2} onChange={(v) => update("postal2", v)} /></Field>
    </Grid></Section>
    <Section title="Contact"><Grid>
      <Field label="Email Address"><Input value={form.contactEmail} onChange={(v) => update("contactEmail", v)} /></Field>
      <Field label="Additional Email Address"><Input value={form.additionalEmail} onChange={(v) => update("additionalEmail", v)} /></Field>
      <Field label="Phone Number"><Input value={form.contactPhone} onChange={(v) => update("contactPhone", v)} /></Field>
      <Field label="Additional Phone Number"><Input value={form.additionalPhone} onChange={(v) => update("additionalPhone", v)} /></Field>
      <Field label="Location"><Input value={form.location} onChange={(v) => update("location", v)} /></Field>
    </Grid></Section>
  </>;
}

function WorkStep({ kind, form, update, onCreateEmployer, onCreateBusiness, businesses, removeBusiness }: { kind: ClientKind; form: Record<string, string>; update: (key: string, value: string) => void; onCreateEmployer: () => void; onCreateBusiness: () => void; businesses: string[]; removeBusiness: (name: string) => void }) {
  if (kind === "Center") {
    return <><Section title="Meeting Setup"><Grid>
      <Field label="Meeting Day"><Select value={form.meetingDay} onChange={(v) => update("meetingDay", v)} options={toOptions(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"])} /></Field>
      <Field label="Meeting Time"><Input value={form.meetingTime} onChange={(v) => update("meetingTime", v)} placeholder="12:45pm" /></Field>
      <Field label="Contribution Frequency"><Select value={form.frequency} onChange={(v) => update("frequency", v)} options={toOptions(["Daily", "Weekly", "Monthly"])} /></Field>
      <Field label="Minimum Savings"><Input value={form.minimumSavings} onChange={(v) => update("minimumSavings", v)} placeholder="₦0.00" /></Field>
    </Grid></Section></>;
  }
  return <>
    {kind === "Individual" && <Section title="Employer"><div className="grid grid-cols-[1fr_auto] items-end gap-3">
      <Field label="Company Name"><Select value={form.employer} onChange={(v) => update("employer", v)} options={toOptions(["Chain Consults", "Corebank Finance", "Lagos Tech Hub", form.employer].filter(Boolean))} /></Field>
      <button type="button" onClick={onCreateEmployer} className="focus-ring h-[46px] rounded-md border border-border-strong px-4 text-sm font-medium text-primary hover:bg-surface-muted">Create New Employer +</button>
    </div></Section>}
    <Section title={kind === "Corporate" ? "Business Information" : "Employment"}><Grid>
      <Field label="Industry / Sector"><Select value={form.industry} onChange={(v) => update("industry", v)} options={toOptions(commonOptions.industry)} /></Field>
      <Field label={kind === "Corporate" ? "Business Segment" : "Position"}><Input value={form.position} onChange={(v) => update("position", v)} /></Field>
      <Field label={kind === "Corporate" ? "Ownership Type" : "Employment Type"}><Select value={form.employmentType} onChange={(v) => update("employmentType", v)} options={toOptions(kind === "Corporate" ? ["Private", "Public", "Government", "Foreign-owned"] : commonOptions.employmentType)} /></Field>
      <Field label="Status"><Select value={form.employmentStatus} onChange={(v) => update("employmentStatus", v)} options={toOptions(commonOptions.employmentStatus)} /></Field>
      <Field label={kind === "Corporate" ? "Revenue Source" : "Source of Income"}><Select value={form.incomeSource} onChange={(v) => update("incomeSource", v)} options={toOptions(commonOptions.incomeSource)} /></Field>
      <Field label={kind === "Corporate" ? "Monthly Turnover" : "Monthly Income"}><Input value={form.monthlyIncome} onChange={(v) => update("monthlyIncome", v)} placeholder="₦0.00" /></Field>
    </Grid></Section>
    <Section title="Owned Businesses"><div className="space-y-3">
      {businesses.length === 0 ? <p className="rounded-lg border border-dashed border-border-strong bg-[#FAFBFC] px-4 py-4 text-sm text-text-muted">No owned business has been added yet.</p> : businesses.map((name) => <div key={name} className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm text-text-primary"><span>{name}</span><button type="button" onClick={() => removeBusiness(name)} className="text-text-muted hover:text-red-500"><Trash2 size={15} /></button></div>)}
      <button type="button" onClick={onCreateBusiness} className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-border-strong px-4 text-sm font-medium text-primary hover:bg-surface-muted"><Plus size={15} /> Add Another Owned Business</button>
    </div></Section>
  </>;
}

function RelatedPeopleStep({ kind, people, onCreate, onRemove }: { kind: ClientKind; people: string[]; onCreate: () => void; onRemove: (name: string) => void }) {
  const label = kind === "Corporate" ? "Directors / Signatories" : kind === "Center" ? "Members" : "Next of Kin";
  return <Section title={label}><div className="space-y-3">
    {people.length === 0 ? <div className="rounded-xl border border-dashed border-border-strong bg-[#FAFBFC] px-5 py-8 text-center"><p className="text-sm font-medium text-text-primary">No {label.toLowerCase()} added yet</p><p className="mt-1 text-xs text-text-muted">Create or attach a record to continue.</p></div> : people.map((name) => <div key={name} className="flex items-center justify-between rounded-lg border border-border bg-white px-4 py-3"><span className="text-sm font-medium text-text-primary">{name}</span><div className="flex items-center gap-4 text-sm"><button type="button" className="text-primary">Edit</button><button type="button" onClick={() => onRemove(name)} className="text-red-500">Delete</button></div></div>)}
    <button type="button" onClick={onCreate} className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-border-strong px-4 text-sm font-medium text-primary hover:bg-surface-muted"><Plus size={15} /> Create New {kind === "Corporate" ? "Director" : kind === "Center" ? "Member" : "Next of Kin"}</button>
  </div></Section>;
}

function AdditionalStep({ kind, form, update }: { kind: ClientKind; form: Record<string, string>; update: (key: string, value: string) => void }) {
  return <>
    <Section title="Assignment"><Grid>
      <Field label="Branch"><Select value={form.branch} onChange={(v) => update("branch", v)} options={toOptions(commonOptions.branch)} /></Field>
      <Field label="Center"><Select value={form.center} onChange={(v) => update("center", v)} options={toOptions(commonOptions.center)} /></Field>
      <Field label="Credit Officer"><Select value={form.officer} onChange={(v) => update("officer", v)} options={toOptions(commonOptions.officer)} /></Field>
    </Grid></Section>
    <Section title="Other Information"><Grid>
      <Field label="Created On"><Input value={form.createdOn} onChange={(v) => update("createdOn", v)} placeholder="DD/MM/YYYY" /></Field>
      <Field label="Bank"><Select value={form.bank} onChange={(v) => update("bank", v)} options={toOptions(commonOptions.bank)} /></Field>
      <Field label="Bank Account Number"><Input value={form.accountNumber} onChange={(v) => update("accountNumber", v)} /></Field>
      <div className="col-span-2"><Field label="Notes"><textarea value={form.notes || ""} onChange={(e) => update("notes", e.target.value)} rows={5} className="focus-ring w-full rounded-md border border-border-strong px-3.5 py-3 text-sm text-text-primary placeholder:text-text-muted" placeholder={`Add notes about this ${kind.toLowerCase()} client`} /></Field></div>
    </Grid></Section>
  </>;
}

function NestedCreateSheet({ type, onClose, onDone }: { type: "employer" | "business" | "person"; onClose: () => void; onDone: (name: string) => void }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const update = (key: string, value: string) => setValues((prev) => ({ ...prev, [key]: value }));
  const title = type === "employer" ? "Create New Employer" : type === "business" ? "Create New Owned Business" : "Create New Person";
  const primaryLabel = type === "business" ? "Create New Business" : "Done";
  const name = values.name || [values.firstName, values.lastName].filter(Boolean).join(" ");

  return <div className="absolute inset-0 z-[80]">
    <button className="absolute inset-0 bg-black/10" onClick={onClose} aria-label="Close nested modal" />
    <aside className="absolute bottom-6 right-8 top-6 w-[720px] max-w-[calc(100vw-420px)] overflow-y-auto rounded-2xl bg-white shadow-[0_24px_80px_rgba(17,24,39,0.24)] animate-client-sheet-in">
      <header className="flex h-[72px] items-center justify-between border-b border-border px-8"><div><h3 className="text-base font-semibold text-text-primary">{title}</h3><p className="mt-0.5 text-xs text-text-muted">Add the information below and continue.</p></div><button type="button" onClick={onClose} className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-text-secondary"><X size={16} /></button></header>
      <div className="px-8 py-6">
        {type === "person" ? <><Section title="Uploads"><Grid><UploadBox label="Client Image" /><UploadBox label="Client Signature" /></Grid></Section><Section title="Personal Information"><Grid>
          <Field label="First Name"><Input value={values.firstName} onChange={(v) => update("firstName", v)} /></Field>
          <Field label="Middle Name"><Input value={values.middleName} onChange={(v) => update("middleName", v)} /></Field>
          <Field label="Last Name"><Input value={values.lastName} onChange={(v) => update("lastName", v)} /></Field>
          <Field label="Email Address"><Input value={values.email} onChange={(v) => update("email", v)} /></Field>
          <Field label="Phone Number"><Input value={values.phone} onChange={(v) => update("phone", v)} /></Field>
          <Field label="Gender"><Select value={values.gender} onChange={(v) => update("gender", v)} options={toOptions(commonOptions.gender)} /></Field>
          <Field label="Relationship / Role"><Select value={values.role} onChange={(v) => update("role", v)} options={toOptions(["Spouse", "Sibling", "Parent", "Director", "Signatory", "Member", "Leader"])} /></Field>
          <Field label="Primary Identification Type"><Select value={values.primaryId} onChange={(v) => update("primaryId", v)} options={toOptions(commonOptions.idType)} /></Field>
        </Grid></Section></> : <><Section title={type === "employer" ? "Employer" : "Business"}><Grid>
          <Field label={type === "employer" ? "Employer Name" : "Business Name"}><Input value={values.name} onChange={(v) => update("name", v)} /></Field>
          <Field label={type === "employer" ? "Employer Phone Number" : "Business Phone Number"}><Input value={values.phone} onChange={(v) => update("phone", v)} /></Field>
        </Grid></Section><Section title="Address"><Grid>
          <Field label="Country"><Select value={values.country} onChange={(v) => update("country", v)} options={toOptions(commonOptions.country)} /></Field>
          <Field label="Street"><Input value={values.street} onChange={(v) => update("street", v)} /></Field>
          <Field label="State"><Select value={values.state} onChange={(v) => update("state", v)} options={toOptions(commonOptions.state)} /></Field>
          <Field label="City"><Input value={values.city} onChange={(v) => update("city", v)} /></Field>
          <Field label="Postal Code"><Input value={values.postal} onChange={(v) => update("postal", v)} /></Field>
        </Grid></Section></>}
      </div>
      <footer className="sticky bottom-0 flex h-[76px] items-center justify-end gap-3 border-t border-border bg-white px-8"><button type="button" onClick={onClose} className="focus-ring h-10 rounded-md border border-border-strong px-5 text-sm font-medium text-text-secondary hover:bg-surface-muted">Cancel</button><button type="button" onClick={() => onDone(name)} className="focus-ring h-10 rounded-md bg-primary px-6 text-sm font-medium text-white hover:bg-primary-hover">{primaryLabel}</button></footer>
    </aside>
  </div>;
}
