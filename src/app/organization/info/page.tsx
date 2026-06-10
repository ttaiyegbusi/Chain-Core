"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import OrganizationSidebar from "@/components/Organization/OrganizationSidebar";
import GlobalHeader from "@/components/GlobalHeader";
import { Checkbox, SelectInput, TextInput } from "@/components/FormControls";
import { FormPageSkeleton, PageTransition } from "@/components/LoadingStates";

type InfoTab =
  | "details"
  | "operational-days"
  | "loan-approval"
  | "main-deposit-account"
  | "currency"
  | "organisation-structure"
  | "security";

type Holiday = {
  id: string;
  name: string;
  date: string;
  levelType: string;
  level: string;
};

const tabs: { id: InfoTab; label: string }[] = [
  { id: "details", label: "Organization Details" },
  { id: "operational-days", label: "Operational Days" },
  { id: "loan-approval", label: "Loan Approval" },
  { id: "main-deposit-account", label: "Main Deposit Account" },
  { id: "currency", label: "Currency" },
  { id: "organisation-structure", label: "Organisation Structure" },
  { id: "security", label: "Security" },
];

const countryOptions = ["Nigeria", "Ghana", "Kenya", "South Africa"].map((value) => ({ value, label: value }));
const cityOptions = ["Lagos", "Abuja", "Ibadan", "Port Harcourt"].map((value) => ({ value, label: value }));
const levelTypeOptions = ["Head Office", "Region", "Branch", "Center"].map((value) => ({ value, label: value }));
const levelOptions = ["Headquarters", "South West", "Lagos", "Ikeja Center"].map((value) => ({ value, label: value }));
const rescheduleOptions = ["Next working day", "Previous working day", "Skip instalment", "Manual review"].map((value) => ({ value, label: value }));

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-b border-border-strong pb-5">
      <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
      <p className="mt-1 text-sm leading-5 text-text-secondary">{description}</p>
    </div>
  );
}

function FormShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-[650px] pt-9">{children}</div>;
}

function DateInput({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-text-secondary">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="focus-ring h-[46px] w-full rounded-md border border-border-strong bg-white px-3.5 pr-10 text-sm text-text-primary placeholder:text-text-muted"
        />
        <CalendarDays size={18} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
      </div>
    </div>
  );
}

function OrganizationDetailsTab() {
  const [form, setForm] = useState({
    organizationName: "",
    phoneCountryCode: "",
    faxNumber: "",
    emailAddress: "",
    organizationAddress1: "",
    organizationAddress2: "",
    organizationAddress3: "",
    country: "",
    state: "",
    city: "",
    postCode: "",
  });

  const update = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <FormShell>
      <SectionHeader title="Organization Details" description="Update password for enhanced account security." />
      <div className="mt-5 space-y-4">
        <TextInput id="organizationName" label="Organization Name" value={form.organizationName} onChange={(value) => update("organizationName", value)} />
        <div className="grid grid-cols-2 gap-3">
          <SelectInput id="phoneNumber" label="Phone Number" value={form.phoneCountryCode} onChange={(value) => update("phoneCountryCode", value)} options={[{ value: "+234", label: "+234" }, { value: "+233", label: "+233" }, { value: "+254", label: "+254" }]} />
          <TextInput id="faxNumber" label="Fax Number" value={form.faxNumber} onChange={(value) => update("faxNumber", value)} />
        </div>
        <TextInput id="emailAddress" label="Email Address" value={form.emailAddress} onChange={(value) => update("emailAddress", value)} />
        <TextInput id="organizationAddress1" label="Organization Address 1" value={form.organizationAddress1} onChange={(value) => update("organizationAddress1", value)} />
        <TextInput id="organizationAddress2" label="Organization Address 2" value={form.organizationAddress2} onChange={(value) => update("organizationAddress2", value)} />
        <TextInput id="organizationAddress3" label="Organization Address 3" value={form.organizationAddress3} onChange={(value) => update("organizationAddress3", value)} />
        <div className="grid grid-cols-2 gap-3">
          <SelectInput id="country" label="Country" value={form.country} onChange={(value) => update("country", value)} options={countryOptions} />
          <TextInput id="state" label="State / Province" value={form.state} onChange={(value) => update("state", value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <SelectInput id="city" label="City" value={form.city} onChange={(value) => update("city", value)} options={cityOptions} />
          <TextInput id="postCode" label="Post Code" value={form.postCode} onChange={(value) => update("postCode", value)} />
        </div>
      </div>
    </FormShell>
  );
}

function OperationalDaysTab() {
  const [workingDays, setWorkingDays] = useState<Record<string, boolean>>({
    Monday: true,
    Tuesday: true,
    Wednesday: true,
    Thursday: true,
    Friday: true,
    Saturday: true,
    Sunday: true,
  });
  const [reschedule, setReschedule] = useState("");
  const [holidays, setHolidays] = useState<Holiday[]>([{ id: "holiday-1", name: "", date: "", levelType: "", level: "" }]);

  const days = useMemo(() => Object.keys(workingDays), [workingDays]);

  const updateHoliday = (id: string, key: keyof Omit<Holiday, "id">, value: string) => {
    setHolidays((prev) => prev.map((holiday) => (holiday.id === id ? { ...holiday, [key]: value } : holiday)));
  };

  const addHoliday = () => {
    setHolidays((prev) => [...prev, { id: `holiday-${Date.now()}`, name: "", date: "", levelType: "", level: "" }]);
  };

  const removeHoliday = (id: string) => {
    setHolidays((prev) => (prev.length === 1 ? prev : prev.filter((holiday) => holiday.id !== id)));
  };

  return (
    <FormShell>
      <SectionHeader title="Working Days" description="Update password for enhanced account security." />
      <div className="mt-4 space-y-5">
        <div className="space-y-5 border-b border-border-strong pb-5">
          {days.map((day) => (
            <div key={day} className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">{day}</span>
              <Checkbox id={`working-${day}`} label="" checked={workingDays[day]} onChange={(checked) => setWorkingDays((prev) => ({ ...prev, [day]: checked }))} />
            </div>
          ))}
        </div>

        <div className="space-y-4 border-b border-border-strong pb-5">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Operational Days</h2>
            <p className="mt-1 text-sm text-text-secondary">Update password for enhanced account security.</p>
          </div>
          <SelectInput id="rescheduleInstalments" label="Reschedule Instalments:" value={reschedule} onChange={setReschedule} options={rescheduleOptions} />
        </div>

        <div className="space-y-4">
          <div className="border-b border-border-strong pb-4">
            <h2 className="text-lg font-semibold text-text-primary">Holidays</h2>
            <p className="mt-1 max-w-[560px] text-sm leading-5 text-text-secondary">
              Newly added holidays will only become active after midnight today, for both existing and new accounts.
            </p>
          </div>

          {holidays.map((holiday, index) => (
            <div key={holiday.id} className="space-y-4 border-b border-border pb-5 last:border-b-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-text-primary">Holiday</h3>
                <button
                  type="button"
                  onClick={() => removeHoliday(holiday.id)}
                  className="focus-ring inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                  Delete Holiday
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TextInput id={`holidayName-${index}`} label="Name of Holiday" value={holiday.name} onChange={(value) => updateHoliday(holiday.id, "name", value)} />
                <DateInput id={`holidayDate-${index}`} label="Date" value={holiday.date} onChange={(value) => updateHoliday(holiday.id, "date", value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <SelectInput id={`levelType-${index}`} label="Level Type" value={holiday.levelType} onChange={(value) => updateHoliday(holiday.id, "levelType", value)} options={levelTypeOptions} />
                <SelectInput id={`level-${index}`} label="Level" value={holiday.level} onChange={(value) => updateHoliday(holiday.id, "level", value)} options={levelOptions} />
              </div>
            </div>
          ))}

          <button type="button" onClick={addHoliday} className="focus-ring inline-flex items-center gap-1 rounded-md text-sm font-medium text-primary hover:text-primary-hover">
            <Plus size={16} />
            Add New Holiday
          </button>
        </div>
      </div>
    </FormShell>
  );
}

function PlaceholderTab({ title }: { title: string }) {
  return (
    <FormShell>
      <SectionHeader title={title} description="This configuration area is prepared for the next ChainCore organization setup flow." />
      <div className="mt-5 rounded-lg border border-dashed border-border-strong bg-surface-muted px-5 py-8 text-center text-sm text-text-secondary">
        {title} settings will be added here using the same organization information layout.
      </div>
    </FormShell>
  );
}

export default function OrganizationInfoPage() {
  const [activeTab, setActiveTab] = useState<InfoTab>("details");

  const renderActiveTab = () => {
    if (activeTab === "details") return <OrganizationDetailsTab />;
    if (activeTab === "operational-days") return <OperationalDaysTab />;
    const title = tabs.find((tab) => tab.id === activeTab)?.label || "Organization Info";
    return <PlaceholderTab title={title} />;
  };

  return (
    <div className="min-h-screen bg-white">
      <OrganizationSidebar />
      <main className="ml-[calc(var(--rail-width)+250px)]">
        <GlobalHeader title="Organization" crumbs={[{ label: "Organization" }, { label: "Organization Information" }]} />

        <div className="border-b border-border bg-white px-10">
          <nav className="flex h-[46px] items-end gap-7 overflow-x-auto" aria-label="Organization information tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={[
                  "focus-ring h-full whitespace-nowrap border-b-2 px-0.5 text-sm transition-colors",
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary",
                ].join(" ")}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <section className="min-h-[calc(100vh-116px)] bg-white px-10 pb-16"><PageTransition skeleton={<FormPageSkeleton />} delay={300}>{renderActiveTab()}</PageTransition></section>
      </main>
    </div>
  );
}
