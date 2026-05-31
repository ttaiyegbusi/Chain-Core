"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Liveline, type LivelinePoint } from "liveline";
import { ChartLineResponse } from "./types";
import { naira, nairaShort } from "@/data/coreaiData";

/**
 * Revenue / Expense trend card — Liveline edition.
 *
 * The 11 prior months are committed history (fixed). The rightmost month is
 * "live" — it ticks every 1s with a small random-walk drift around the
 * engine's posted value. Liveline lerps between updates so the right edge
 * breathes while the rest of the chart stays stable, like a real banking
 * dashboard where closed periods are settled but the current period is
 * still accumulating.
 *
 * Outer card + range tabs + ₦ formatting are preserved so this still
 * matches the PDF reference and the rest of the project.
 */

const RANGE_TABS = ["1M", "6M", "YTD", "1YR"] as const;
type Range = (typeof RANGE_TABS)[number];

// One month between points, in seconds (Liveline uses unix seconds).
const MONTH_SECS = 30 * 24 * 60 * 60;

// Small drift: ±₦2–5m per tick.
const TICK_MS = 1000;
const DRIFT_MIN = 2_000_000;
const DRIFT_MAX = 5_000_000;

export default function LineChartCard({ chart }: { chart: ChartLineResponse }) {
  const fullSeries = chart.series;
  const fullLabels = chart.xLabels;

  const initial: Range = (RANGE_TABS as readonly string[]).includes(chart.activeTab)
    ? (chart.activeTab as Range)
    : "YTD";
  const [range, setRange] = useState<Range>(initial);

  // Anchor the time axis so month indices map to stable timestamps
  // regardless of render time. Use a fixed epoch so re-mounts stay aligned.
  const anchorRef = useRef<number>(1_700_000_000); // arbitrary fixed epoch
  const anchor = anchorRef.current;

  // Slice the historical series + labels for the chosen range.
  const sliced = useMemo(
    () => sliceByRange(fullSeries, fullLabels, range),
    [fullSeries, fullLabels, range]
  );

  // Build committed points (all but the rightmost — that one is "live").
  const baseLive = sliced.series[sliced.series.length - 1];

  // Live value state — starts at baseLive, drifts each tick.
  const [liveValue, setLiveValue] = useState<number>(baseLive);

  // Reset live value when range changes.
  useEffect(() => {
    setLiveValue(baseLive);
  }, [baseLive]);

  // Tick the live value with a small bounded random walk every 1s.
  useEffect(() => {
    const id = setInterval(() => {
      setLiveValue((prev) => {
        const sign = Math.random() < 0.5 ? -1 : 1;
        const mag = DRIFT_MIN + Math.random() * (DRIFT_MAX - DRIFT_MIN);
        const next = prev + sign * mag;
        // Soft band: stay within ±15% of the posted value so it doesn't drift away.
        const lo = baseLive * 0.85;
        const hi = baseLive * 1.15;
        return Math.min(Math.max(next, lo), hi);
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [baseLive]);

  // Build the data array Liveline expects.
  // First (n-1) entries are committed history; the last entry is the live tick.
  const data: LivelinePoint[] = useMemo(() => {
    const n = sliced.series.length;
    return sliced.series.map((v, i) => ({
      time: anchor + i * MONTH_SECS,
      value: i === n - 1 ? liveValue : v,
    }));
  }, [sliced.series, liveValue, anchor]);

  // Custom time formatter — map timestamps back to month labels.
  const formatTime = (t: number) => {
    const idx = Math.round((t - anchor) / MONTH_SECS);
    return sliced.labels[idx] ?? "";
  };

  return (
    <div className="mt-4 rounded-[20px] bg-[#F7F8FA] p-4 coreai-fade-up">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[13px] font-medium tracking-[-0.02em] text-[#15181E]">
          {chart.title || "Revenue"}
          <LivePill />
        </h3>
        <button
          type="button"
          className="focus-ring flex h-8 items-center gap-1 rounded-lg border border-[#E3E7EC] bg-white px-2.5 text-[11px] font-medium text-[#15181E] shadow-[0_1px_2px_rgba(16,24,40,0.03)]"
        >
          {chart.period || "This year"}
          <ChevronDown size={13} className="text-[#8A93A3]" aria-hidden />
        </button>
      </div>

      {/* Range tabs — reslice the historical data */}
      <div className="mb-3 inline-flex rounded-lg border border-[#E6EAF0] bg-white p-1 shadow-[0_1px_2px_rgba(16,24,40,0.02)]">
        {RANGE_TABS.map((r) => {
          const active = range === r;
          return (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              aria-pressed={active}
              className={[
                "focus-ring h-7 rounded-md px-3 text-[11px] font-medium tracking-[-0.02em] transition-colors",
                active
                  ? "bg-[#F2F4F7] text-[#15181E] shadow-[0_1px_1px_rgba(16,24,40,0.03)]"
                  : "text-[#8A93A3] hover:bg-[#F7F8FA] hover:text-[#4B5563]",
              ].join(" ")}
            >
              {r}
            </button>
          );
        })}
      </div>

      {/* Liveline plot */}
      <div className="rounded-[16px] bg-white pt-2 pr-1 pb-1 pl-1">
        <div style={{ height: 200 }}>
          <Liveline
            data={data}
            value={liveValue}
            theme="light"
            color="#3157F6"
            grid
            badge
            badgeVariant="minimal"
            scrub
            formatValue={(v) => naira(v)}
            formatTime={formatTime}
            // Match the PDF feel: thin line, soft fill, no degen mode.
            lineWidth={2}
            fill
            pulse
            momentum
          />
        </div>
        {/* Footer summary: tiny range hint + last-posted figure for context */}
        <div className="mt-1 flex items-center justify-between px-3 pb-1 text-[10px] text-[#9AA3B2]">
          <span>
            {sliced.labels[0]} – {sliced.labels[sliced.labels.length - 1]}
          </span>
          <span>
            Posted close: <span className="font-medium text-[#4B5563]">{nairaShort(baseLive)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/** Tiny "Live" indicator next to the title — matches the dashboard idiom. */
function LivePill() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF2FF] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-[#3157F6]">
      <span className="relative inline-flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3157F6] opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#3157F6]" />
      </span>
      Live
    </span>
  );
}

/* ----------------------------------------------------------------- helpers */

function sliceByRange(
  series: number[],
  labels: string[],
  range: Range
): { series: number[]; labels: string[] } {
  const n = series.length;
  let count: number;
  switch (range) {
    case "1M":
      count = Math.min(2, n);
      break;
    case "6M":
      count = Math.min(6, n);
      break;
    case "1YR":
      count = n;
      break;
    case "YTD":
    default:
      count = n;
  }
  const start = Math.max(0, n - count);
  return { series: series.slice(start), labels: labels.slice(start) };
}
