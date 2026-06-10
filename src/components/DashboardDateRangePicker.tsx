"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";

type QuickRange = "Today" | "This Week" | "This Month" | "Last Month" | "This Quarter" | "This Year" | "Custom";

type DateRange = {
  label: QuickRange;
  startDate: string;
  endDate: string;
};

const QUICK_RANGES: QuickRange[] = [
  "Today",
  "This Week",
  "This Month",
  "Last Month",
  "This Quarter",
  "This Year",
  "Custom",
];

function toInputDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDisplayDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getRange(label: QuickRange): DateRange {
  const today = new Date();
  const start = new Date(today);
  const end = new Date(today);

  if (label === "This Week") {
    const day = today.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    start.setDate(today.getDate() + mondayOffset);
  }

  if (label === "This Month") {
    start.setDate(1);
  }

  if (label === "Last Month") {
    start.setMonth(today.getMonth() - 1, 1);
    end.setDate(0);
  }

  if (label === "This Quarter") {
    const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
    start.setMonth(quarterStartMonth, 1);
  }

  if (label === "This Year") {
    start.setMonth(0, 1);
  }

  if (label === "Custom") {
    start.setDate(today.getDate() - 10);
  }

  return {
    label,
    startDate: toInputDate(start),
    endDate: toInputDate(end),
  };
}

export default function DashboardDateRangePicker({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (range: DateRange) => void;
}) {
  const [quickOpen, setQuickOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [draftStart, setDraftStart] = useState(value.startDate);
  const [draftEnd, setDraftEnd] = useState(value.endDate);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraftStart(value.startDate);
    setDraftEnd(value.endDate);
  }, [value.startDate, value.endDate]);

  useEffect(() => {
    const onDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setQuickOpen(false);
        setCalendarOpen(false);
      }
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  const displayRange = useMemo(
    () => `${formatDisplayDate(value.startDate)} - ${formatDisplayDate(value.endDate)}`,
    [value.startDate, value.endDate]
  );

  const selectQuickRange = (label: QuickRange) => {
    const next = getRange(label);
    onChange(next);
    setQuickOpen(false);
    if (label === "Custom") {
      setCalendarOpen(true);
    }
  };

  const applyCustomRange = () => {
    onChange({ label: "Custom", startDate: draftStart, endDate: draftEnd });
    setCalendarOpen(false);
  };

  return (
    <div ref={rootRef} className="relative flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => {
          setQuickOpen((open) => !open);
          setCalendarOpen(false);
        }}
        className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-border-strong bg-white px-3 text-sm text-text-secondary transition-colors duration-200 hover:bg-surface-muted"
      >
        {value.label}
        <ChevronDown size={15} aria-hidden />
      </button>

      <button
        type="button"
        onClick={() => {
          setCalendarOpen((open) => !open);
          setQuickOpen(false);
        }}
        className="focus-ring inline-flex h-10 min-w-[260px] items-center justify-between gap-3 rounded-md border border-border-strong bg-white px-3 text-sm text-text-secondary transition-colors duration-200 hover:bg-surface-muted"
      >
        <span>{displayRange}</span>
        <ChevronDown size={15} aria-hidden />
      </button>

      {quickOpen && (
        <div className="absolute right-[272px] top-[calc(100%+8px)] z-30 w-44 overflow-hidden rounded-xl border border-border bg-white p-1 ">
          {QUICK_RANGES.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => selectQuickRange(range)}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                value.label === range
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:bg-surface-muted"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      )}

      {calendarOpen && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-[360px] rounded-2xl border border-border bg-white p-4 ">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-primary">
            <CalendarDays size={17} aria-hidden />
            Select reporting period
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5 text-xs text-text-muted">
              Start date
              <input
                type="date"
                value={draftStart}
                onChange={(event) => setDraftStart(event.target.value)}
                className="focus-ring h-10 w-full rounded-md border border-border-strong px-3 text-sm text-text-primary"
              />
            </label>
            <label className="space-y-1.5 text-xs text-text-muted">
              End date
              <input
                type="date"
                value={draftEnd}
                onChange={(event) => setDraftEnd(event.target.value)}
                className="focus-ring h-10 w-full rounded-md border border-border-strong px-3 text-sm text-text-primary"
              />
            </label>
          </div>
          <p className="mt-3 text-xs leading-5 text-text-muted">
            This range will drive the overview cards, tables, and future CBA reports when live data is connected.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCalendarOpen(false)}
              className="focus-ring h-9 rounded-md border border-border-strong bg-white px-4 text-sm text-text-secondary hover:bg-surface-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={applyCustomRange}
              className="focus-ring h-9 rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export type { DateRange, QuickRange };
export { getRange };
