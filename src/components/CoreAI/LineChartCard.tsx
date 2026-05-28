"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ChartLineResponse } from "./types";

export default function LineChartCard({ chart }: { chart: ChartLineResponse }) {
  const [activeTab, setActiveTab] = useState(chart.activeTab);

  return (
    <div className="mt-3 rounded-2xl border border-border bg-surface-muted/40 p-5">
      {/* Card header */}
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-secondary">
          {chart.title}
        </h3>
        <button
          type="button"
          className="focus-ring flex items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-3 py-1.5 text-xs text-text-primary hover:bg-bg-sub"
        >
          {chart.period}
          <ChevronDown size={14} className="text-text-secondary" aria-hidden />
        </button>
      </div>

      {/* Range tabs */}
      <div
        role="tablist"
        aria-label="Time range"
        className="mb-5 flex gap-1 rounded-lg border border-border-strong bg-surface p-1"
      >
        {chart.tabs.map((t) => {
          const active = t === activeTab;
          return (
            <button
              key={t}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(t)}
              className={[
                "focus-ring flex-1 rounded-[6px] px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "bg-surface-muted text-text-primary"
                  : "text-text-muted hover:bg-bg-sub",
              ].join(" ")}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* SVG chart */}
      <LineSVG xLabels={chart.xLabels} series={chart.series} />
    </div>
  );
}

function LineSVG({ xLabels, series }: { xLabels: string[]; series: number[] }) {
  const W = 600;
  const H = 240;
  const padX = 24;
  const padTop = 16;
  const padBottom = 28;

  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;

  // Map values to coordinates
  const n = series.length;
  const step = (W - padX * 2) / Math.max(1, n - 1);
  const points = series.map((v, i) => {
    const x = padX + i * step;
    const y = padTop + ((max - v) / range) * (H - padTop - padBottom);
    return [x, y] as const;
  });

  // Build a smoothed Catmull-Rom -> Bezier path for a soft wave look
  const linePath = smoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1][0]} ${
    H - padBottom
  } L ${points[0][0]} ${H - padBottom} Z`;

  // Grid lines (3 horizontal)
  const gridYs = [0, 0.5, 1].map((t) => padTop + t * (H - padTop - padBottom));

  return (
    <div className="rounded-xl bg-surface p-2">
      <svg
        viewBox={`0 0 ${W} ${H + 20}`}
        className="block h-auto w-full"
        role="img"
        aria-label="Revenue trend line chart"
      >
        <defs>
          <linearGradient id="lc_grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3157F6" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#3157F6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridYs.map((y, i) => (
          <line
            key={i}
            x1={padX}
            x2={W - padX}
            y1={y}
            y2={y}
            stroke="#EEF1F4"
            strokeWidth="1"
          />
        ))}

        <path d={areaPath} fill="url(#lc_grad)" />
        <path
          d={linePath}
          fill="none"
          stroke="#3157F6"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* X-axis labels — render up to 8 evenly along the chart width */}
        {xLabels.map((lbl, i) => {
          const x = padX + i * ((W - padX * 2) / Math.max(1, xLabels.length - 1));
          return (
            <text
              key={lbl}
              x={x}
              y={H + 6}
              textAnchor="middle"
              className="fill-[#8A93A3]"
              style={{ fontSize: 11 }}
            >
              {lbl}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// Catmull-Rom to cubic Bezier path
function smoothPath(pts: ReadonlyArray<readonly [number, number]>): string {
  if (pts.length < 2) return "";
  const t = 0.2;
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
