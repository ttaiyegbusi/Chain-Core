"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ChartLineResponse } from "./types";

export default function LineChartCard({ chart }: { chart: ChartLineResponse }) {
  const [activeTab, setActiveTab] = useState(chart.activeTab);

  return (
    <div className="mt-3 rounded-[24px] bg-[#F7F7F7] p-3 coreai-chart-reveal">
      {/* Header matches the supplied Revenue reference: quiet title on the left,
          compact year selector on the right. */}
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-[15px] font-medium leading-5 text-[#9AA1AC]">
          {chart.title}
        </h3>
        <button
          type="button"
          className="focus-ring flex h-9 items-center gap-1.5 rounded-lg border border-[#E6E8EC] bg-white px-3 text-xs font-medium text-[#111827] shadow-[0_1px_2px_rgba(17,24,39,0.04)] hover:bg-[#FAFAFA]"
        >
          {chart.period}
          <ChevronDown size={13} className="text-[#6B7280]" aria-hidden />
        </button>
      </div>

      <div className="rounded-[18px] bg-white p-3 shadow-[0_1px_2px_rgba(17,24,39,0.04)] ring-1 ring-[#EEF0F2]">
        {/* Segmented control: no gaps, soft borders, exact order from the PDF. */}
        <div
          role="tablist"
          aria-label="Revenue time range"
          className="mb-5 grid h-12 grid-cols-4 overflow-hidden rounded-xl border border-[#E6E8EC] bg-white text-[13px] font-semibold text-[#4B5563] shadow-[0_1px_2px_rgba(17,24,39,0.04)]"
        >
          {chart.tabs.map((tab, index) => {
            const active = tab === activeTab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab)}
                className={[
                  "focus-ring transition-colors",
                  index !== chart.tabs.length - 1 ? "border-r border-[#E6E8EC]" : "",
                  active
                    ? "bg-[#F8F8F8] text-[#111827] shadow-[inset_0_0_0_1px_rgba(17,24,39,0.02)]"
                    : "bg-white text-[#4B5563] hover:bg-[#FAFAFA]",
                ].join(" ")}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <LineSVG xLabels={chart.xLabels} series={chart.series} />
      </div>
    </div>
  );
}

function LineSVG({ xLabels, series }: { xLabels: string[]; series: number[] }) {
  const W = 430;
  const H = 270;
  const padX = 20;
  const padTop = 14;
  const padBottom = 54;

  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const usableH = H - padTop - padBottom;

  const n = series.length;
  const step = (W - padX * 2) / Math.max(1, n - 1);
  const points = series.map((value, index) => {
    const x = padX + index * step;
    const normalized = (max - value) / range;
    const y = padTop + normalized * usableH;
    return [x, y] as const;
  });

  const linePath = smoothPath(points);
  const baseline = H - padBottom;
  const areaPath = `${linePath} L ${points[points.length - 1][0]} ${baseline} L ${points[0][0]} ${baseline} Z`;
  const gridYs = [0, 0.25, 0.5, 0.75, 1].map((t) => padTop + t * usableH);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block h-auto w-full"
      role="img"
      aria-label="Revenue trend line chart"
    >
      <defs>
        <linearGradient id="coreai_revenue_area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0097FF" stopOpacity="0.16" />
          <stop offset="55%" stopColor="#0097FF" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#0097FF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {gridYs.map((y, index) => (
        <line
          key={index}
          x1={padX}
          x2={W - padX}
          y1={y}
          y2={y}
          stroke="#EEF1F4"
          strokeWidth="1"
        />
      ))}

      <path d={areaPath} fill="url(#coreai_revenue_area)" />
      <path
        d={linePath}
        fill="none"
        stroke="#0097FF"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {xLabels.map((label, index) => {
        const x = padX + index * ((W - padX * 2) / Math.max(1, xLabels.length - 1));
        return (
          <text
            key={label}
            x={x}
            y={H - 10}
            textAnchor="middle"
            className="fill-[#5F6877]"
            style={{ fontSize: 13, fontWeight: 500 }}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

// Catmull-Rom to cubic Bezier path with a slightly loose tension to mimic the
// hand-smoothed curve in the reference PDF.
function smoothPath(points: ReadonlyArray<readonly [number, number]>): string {
  if (points.length < 2) return "";
  const tension = 0.18;
  let d = `M ${points[0][0]} ${points[0][1]}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) * tension;
    const c1y = p1[1] + (p2[1] - p0[1]) * tension;
    const c2x = p2[0] - (p3[0] - p1[0]) * tension;
    const c2y = p2[1] - (p3[1] - p1[1]) * tension;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
  }

  return d;
}
