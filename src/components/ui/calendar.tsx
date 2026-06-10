"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

/**
 * shadcn-style calendar adapted for react-day-picker v9 and themed to the
 * ChainCore design tokens (primary #3157F6). Used inside the date-range
 * popover. Range selection is supported via the `mode="range"` prop.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center h-9",
        caption_label: "text-sm font-medium text-text-primary",
        nav: "flex items-center gap-1 absolute inset-x-0 top-1 justify-between px-1",
        button_previous: cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-md border border-border-strong bg-white text-text-secondary transition-colors hover:bg-surface-muted disabled:opacity-40",
        ),
        button_next: cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-md border border-border-strong bg-white text-text-secondary transition-colors hover:bg-surface-muted disabled:opacity-40",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "text-text-muted rounded-md w-9 h-8 flex items-center justify-center text-[0.72rem] font-normal",
        week: "flex w-full mt-1",
        day: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          "[&:has([aria-selected])]:bg-[#EEF3FF]",
          "[&:has(.range_start)]:rounded-l-md [&:has(.range_end)]:rounded-r-md",
          "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
        ),
        day_button: cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-md p-0 text-sm font-normal text-text-primary transition-colors",
          "hover:bg-surface-muted aria-selected:opacity-100 outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        ),
        range_start:
          "range_start rounded-l-md bg-primary text-white hover:bg-primary [&>button]:bg-primary [&>button]:text-white [&>button:hover]:bg-primary",
        range_end:
          "range_end rounded-r-md bg-primary text-white hover:bg-primary [&>button]:bg-primary [&>button]:text-white [&>button:hover]:bg-primary",
        selected:
          "[&>button]:bg-primary [&>button]:text-white [&>button:hover]:bg-primary [&>button:hover]:text-white",
        range_middle:
          "range_middle bg-[#EEF3FF] [&>button]:bg-transparent [&>button]:text-text-primary [&>button:hover]:bg-[#E1EAFF]",
        today: "[&>button]:font-semibold [&>button]:text-primary",
        outside: "text-text-muted opacity-50",
        disabled: "text-text-muted opacity-40",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...rest }) =>
          orientation === "left" ? (
            <ChevronLeft size={16} aria-hidden {...rest} />
          ) : (
            <ChevronRight size={16} aria-hidden {...rest} />
          ),
      }}
      {...props}
    />
  );
}

export { Calendar };
