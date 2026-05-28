"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-sm text-text-secondary"
    >
      {children}
    </label>
  );
}

export function TextInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  readOnly,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  error?: string;
}) {
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        id={id}
        type="text"
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={[
          "focus-ring h-[46px] w-full rounded-md border px-3.5 text-sm text-text-primary placeholder:text-text-muted",
          readOnly
            ? "border-border-strong bg-surface-muted2 text-text-secondary"
            : "border-border-strong bg-white",
          error ? "border-red-400" : "",
        ].join(" ")}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

export function SelectInput({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Select",
  readOnly,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange?: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  readOnly?: boolean;
  error?: string;
}) {
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <select
          id={id}
          value={value}
          disabled={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={[
            "focus-ring h-[46px] w-full appearance-none rounded-md border px-3.5 pr-10 text-sm",
            value ? "text-text-primary" : "text-text-muted",
            readOnly
              ? "border-border-strong bg-surface-muted2 text-text-secondary"
              : "border-border-strong bg-white",
            error ? "border-red-400" : "",
          ].join(" ")}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value} className="text-text-primary">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
          aria-hidden
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

export function Checkbox({
  id,
  label,
  checked,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className="inline-flex cursor-pointer items-center gap-2.5 select-none"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="peer sr-only"
      />
      <span
        className={[
          "flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border transition-colors",
          checked ? "border-primary bg-primary" : "border-border-strong bg-white",
          "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary",
        ].join(" ")}
      >
        {checked && (
          <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden>
            <path
              d="M2 6.2 4.6 8.8 10 3.2"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span className="text-sm text-text-secondary">{label}</span>
    </label>
  );
}

export function Textarea({
  id,
  label,
  value,
  onChange,
  placeholder,
  readOnly,
  maxLength = 1000,
}: {
  id: string;
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  maxLength?: number;
}) {
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <textarea
        id={id}
        value={value}
        readOnly={readOnly}
        maxLength={maxLength}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={[
          "focus-ring w-full max-w-[650px] rounded-md border px-3.5 pt-4 text-sm text-text-primary placeholder:text-text-muted",
          readOnly
            ? "border-border-strong bg-surface-muted2 text-text-secondary"
            : "border-border-strong bg-white",
        ].join(" ")}
        rows={6}
        style={{ minHeight: 160 }}
      />
    </div>
  );
}

export function SectionAccordion({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="mb-6">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="focus-ring flex h-9 w-full items-center justify-between rounded-md bg-surface-muted px-4 text-sm font-medium text-text-primary"
      >
        {title}
        <ChevronDown
          size={18}
          className={[
            "text-text-secondary transition-transform",
            open ? "" : "-rotate-90",
          ].join(" ")}
          aria-hidden
        />
      </button>
      {open && <div className="pt-5">{children}</div>}
    </section>
  );
}
