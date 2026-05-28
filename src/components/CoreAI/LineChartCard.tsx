"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { ChartLineResponse } from "./types";
import { naira, nairaShort } from "@/data/coreaiData";

/**
 * Revenue / financial trend card.
 *
 * Hand-built SVG area chart (no charting library) so it matches the PDF
 * reference exactly and plots the REAL series the engine computed:
 *  - thin 2px line, soft blue area fill, light horizontal grid
 *  - working range tabs that reslice the real data
 *  - hover tooltip with the exact ₦ value + month
 */

const RANGE_TABS = ["1M", "6M", "YTD", "1YR"] as const;
type Range = (typeof RANGE_TABS)[number];

export default function LineChartCard({ chart }: { chart: ChartLineResponse }) {
  // The engine's series IS the source of truth. Tabs reslice it.
  const fullSeries = chart.series;
  const fullLabels = chart.xLabels;

  const initial: Range = (RANGE_TABS as readonly string[]).includes(chart.activeTab)
    ? (chart.activeTab as Range)
    : "YTD";
  const [range, setRange] = useState<Range>(initial);

  const { series, labels } = useMemo(
    () => sliceByRange(fullSeries, fullLabels, range),
    [fullSeries, fullLabels, range]
  );

  return (
    <div className="mt-4 rounded-[20px] bg-[#F7F8FA] p-4 coreai-fade-up">
      {/* Header: real title + period */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[13px] font-medium tracking-[-0.02em] text-[#15181E]">
          {chart.title || "Revenue"}
        </h3>
        <button
          type="button"
          className="focus-ring flex h-8 items-center gap-1 rounded-lg border border-[#E3E7EC] bg-white px-2.5 text-[11px] font-medium text-[#15181E] shadow-[0_1px_2px_rgba(16,24,40,0.03)]"
        >
          {chart.period || "This year"}
          <ChevronDown size={13} className="text-[#8A93A3]" aria-hidden />
        </button>
      </div>

      {/* Range tabs — actually reslice the real data */}
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

      <div className="rounded-[16px] bg-white pt-2 pr-1 pb-1 pl-1">
        <AreaChart series={series} labels={labels} />
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- the chart */

function AreaChart({ series, labels }: { series: number[]; labels: string[] }) {
  const W = 560;
  const H = 200;
  const padX = 10;
  const padTop = 16;
  const padBottom = 26;

  const [hover, setHover] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const n = series.length;
  const max = Math.max(...series);
  const min = Math.min(...series);
  // Pad the range a little so the line never kisses the top/bottom edge.
  const lo = min - (max - min) * 0.25 || min * 0.95;
  const hi = max + (max - min) * 0.15 || max * 1.05;
  const range = hi - lo || 1;

  const plotW = W - padX * 2;
  const plotH = H - padTop - padBottom;

  const xAt = (i: number) =>
    n <= 1 ? padX + plotW / 2 : padX + (i / (n - 1)) * plotW;
  const yAt = (v: number) => padTop + ((hi - v) / range) * plotH;

  const points = series.map((v, i) => [xAt(i), yAt(v)] as const);
  const linePath = smoothPath(points);
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[n - 1][0]} ${H - padBottom} L ${points[0][0]} ${
          H - padBottom
        } Z`
      : "";

  // 3 soft horizontal grid lines.
  const gridYs = [0, 0.5, 1].map((t) => padTop + t * plotH);

  // Pointer → nearest data index.
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * W;
    let nearest = 0;
    let best = Infinity;
    for (let i = 0; i < n; i++) {
      const d = Math.abs(xAt(i) - relX);
      if (d < best) {
        best = d;
        nearest = i;
      }
    }
    setHover(nearest);
  };

  const hoverX = hover != null ? xAt(hover) : 0;
  const hoverY = hover != null ? yAt(series[hover]) : 0;
  // Tooltip box placement (flip side near the right edge).
  const tipW = 116;
  const tipLeftPct =
    hover != null
      ? Math.min(Math.max((hoverX / W) * 100, 9), 91)
      : 0;

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full"
        role="img"
        aria-label={`Trend chart with ${n} points`}
      >
        <defs>
          <linearGradient id="coreai_area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3157F6" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#3157F6" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* grid */}
        {gridYs.map((y, i) => (
          <line
            key={i}
            x1={padX}
            x2={W - padX}
            y1={y}
            y2={y}
            stroke="#F0F3F6"
            strokeWidth="1"
          />
        ))}

        {/* area + line */}
        {areaPath && <path d={areaPath} fill="url(#coreai_area)" />}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="#3157F6"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            className="coreai-line-draw"
          />
        )}

        {/* hover crosshair + marker */}
        {hover != null && (
          <>
            <line
              x1={hoverX}
              x2={hoverX}
              y1={padTop}
              y2={H - padBottom}
              stroke="#3157F6"
              strokeOpacity="0.18"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle cx={hoverX} cy={hoverY} r="4.5" fill="#3157F6" stroke="#fff" strokeWidth="2" />
          </>
        )}

        {/* x labels */}
        {labels.map((lbl, i) => (
          <text
            key={`${lbl}-${i}`}
            x={xAt(i)}
            y={H - 8}
            textAnchor="middle"
            className="fill-[#9AA3B2]"
            style={{ fontSize: 10, fontWeight: 500 }}
          >
            {lbl}
          </text>
        ))}
      </svg>

      {/* tooltip */}
      {hover != null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border border-[#E6EAF0] bg-white px-2.5 py-1.5 shadow-[0_4px_14px_rgba(16,24,40,0.10)]"
          style={{
            left: `${tipLeftPct}%`,
            top: `${(hoverY / H) * 100}%`,
            transform: "translate(-50%, calc(-100% - 10px))",
            width: tipW,
          }}
        >
          <div className="text-[10px] font-medium uppercase tracking-wide text-[#9AA3B2]">
            {labels[hover]}
          </div>
          <div className="mt-0.5 text-[12px] font-semibold tracking-[-0.02em] text-[#15181E]">
            {naira(series[hover])}
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- helpers */

// Reslice the real series to the chosen range. The full series is up to 12
// monthly points; tabs pick a tail window. (No fabricated data.)
function sliceByRange(
  series: number[],
  labels: string[],
  range: Range
): { series: number[]; labels: string[] } {
  const n = series.length;
  let count: number;
  switch (range) {
    case "1M":
      count = Math.min(2, n); // last month vs prior (need 2 pts to draw a line)
      break;
    case "6M":
      count = Math.min(6, n);
      break;
    case "1YR":
      count = n; // everything available
      break;
    case "YTD":
    default:
      count = n;
  }
  const start = Math.max(0, n - count);
  return { series: series.slice(start), labels: labels.slice(start) };
}

// Catmull-Rom → cubic Bézier for a soft, PDF-like curve.
function smoothPath(pts: ReadonlyArray<readonly [number, number]>): string {
  if (pts.length < 2) {
    return pts.length === 1 ? `M ${pts[0][0]} ${pts[0][1]}` : "";
  }
  const t = 0.18;
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) * t;
    const c1y = p1[1] + (p2[1] - p0[1]) * t;
    const c2x = p2[0] - (p3[0] - p1[0]) * t;
    const c2y = p2[1] - (p3[1] - p1[1]) * t;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}
