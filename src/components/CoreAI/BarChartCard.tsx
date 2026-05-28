"use client";

import { ChevronDown } from "lucide-react";
import { ChartBarResponse } from "./types";

export default function BarChartCard({ chart }: { chart: ChartBarResponse }) {
  return (
    <div className="mt-3 rounded-2xl border border-border bg-surface-muted/40 p-5">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-secondary">{chart.title}</h3>
        <button
          type="button"
          className="focus-ring flex items-center gap-1.5 rounded-md border border-border-strong bg-white px-3 py-1.5 text-xs text-text-primary hover:bg-surface-muted"
        >
          {chart.period}
          <ChevronDown size={14} className="text-text-secondary" aria-hidden />
        </button>
      </div>

      <div className="rounded-xl bg-white p-5">
        <BarSVG bars={chart.bars} />
      </div>
    </div>
  );
}

function BarSVG({ bars }: { bars: ChartBarResponse["bars"] }) {
  const W = 600;
  const rowH = 46;
  const labelW = 150;
  const valueW = 96;
  const trackX = labelW;
  const trackW = W - labelW - valueW;
  const H = bars.length * rowH + 8;

  const max = Math.max(...bars.map((b) => b.value)) || 1;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block h-auto w-full"
      role="img"
      aria-label="Bar chart"
    >
      {bars.map((b, i) => {
        const y = i * rowH + 8;
        const barH = 22;
        const w = (b.value / max) * trackW;
        return (
          <g key={b.label} className="coreai-bar-grow" style={{ animationDelay: `${i * 80}ms` }}>
            {/* category label */}
            <text
              x={0}
              y={y + barH / 2}
              dominantBaseline="middle"
              className="fill-[#111827]"
              style={{ fontSize: 12 }}
            >
              {b.label}
            </text>
            {/* track */}
            <rect
              x={trackX}
              y={y}
              width={trackW}
              height={barH}
              rx={6}
              fill="#EEF1F4"
            />
            {/* value bar */}
            <rect
              x={trackX}
              y={y}
              width={w}
              height={barH}
              rx={6}
              fill={b.color ?? "#3157F6"}
            />
            {/* value label */}
            <text
              x={W}
              y={y + barH / 2}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-[#4B5563]"
              style={{ fontSize: 12, fontWeight: 600 }}
            >
              {b.display}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
