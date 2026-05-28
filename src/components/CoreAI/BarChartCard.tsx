"use client";

import { ChevronDown } from "lucide-react";
import { ChartBarResponse } from "./types";

export default function BarChartCard({ chart }: { chart: ChartBarResponse }) {
  return (
    <div className="mt-3 rounded-2xl border border-border bg-[#F7F8FA] p-4 shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-[13px] font-medium text-text-secondary">{chart.title}</h3>
          <p className="mt-1 text-xs text-text-muted">Ranked by posted value</p>
        </div>
        <button
          type="button"
          className="focus-ring flex items-center gap-1.5 rounded-lg border border-border-strong bg-white px-3 py-1.5 text-xs text-text-primary shadow-[0_1px_1px_rgba(17,24,39,0.02)] hover:bg-surface-muted"
        >
          {chart.period}
          <ChevronDown size={14} className="text-text-secondary" aria-hidden />
        </button>
      </div>

      <div className="rounded-xl bg-white p-4 ring-1 ring-border/70">
        <BarSVG bars={chart.bars} />
      </div>
    </div>
  );
}

function BarSVG({ bars }: { bars: ChartBarResponse["bars"] }) {
  const W = 600;
  const rowH = 42;
  const labelW = 150;
  const valueW = 90;
  const trackX = labelW;
  const trackW = W - labelW - valueW;
  const H = bars.length * rowH + 10;
  const max = Math.max(...bars.map((b) => b.value)) || 1;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Horizontal bar chart">
      {bars.map((b, i) => {
        const y = i * rowH + 8;
        const barH = 18;
        const w = Math.max(8, (b.value / max) * trackW);
        return (
          <g key={b.label} className="coreai-bar-grow" style={{ animationDelay: `${i * 80}ms` }}>
            <text x={0} y={y + barH / 2} dominantBaseline="middle" className="fill-[#111827]" style={{ fontSize: 12 }}>
              {b.label}
            </text>
            <rect x={trackX} y={y} width={trackW} height={barH} rx={7} fill="#F0F2F5" />
            <rect x={trackX} y={y} width={w} height={barH} rx={7} fill={b.color ?? "#3157F6"} />
            <text x={W} y={y + barH / 2} textAnchor="end" dominantBaseline="middle" className="fill-[#4B5563]" style={{ fontSize: 12, fontWeight: 600 }}>
              {b.display}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
