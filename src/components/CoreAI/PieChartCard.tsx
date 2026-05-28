"use client";

import { ChevronDown } from "lucide-react";
import { ChartPieResponse } from "./types";

export default function PieChartCard({ chart }: { chart: ChartPieResponse }) {
  return (
    <div className="mt-3 rounded-2xl border border-border bg-[#F7F8FA] p-4 shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-[13px] font-medium text-text-secondary">{chart.title}</h3>
          <p className="mt-1 text-xs text-text-muted">Share of total balance</p>
        </div>
        <button
          type="button"
          className="focus-ring flex items-center gap-1.5 rounded-lg border border-border-strong bg-white px-3 py-1.5 text-xs text-text-primary shadow-[0_1px_1px_rgba(17,24,39,0.02)] hover:bg-surface-muted"
        >
          {chart.period}
          <ChevronDown size={14} className="text-text-secondary" aria-hidden />
        </button>
      </div>

      <div className="flex flex-col items-center gap-5 rounded-xl bg-white p-4 ring-1 ring-border/70 sm:flex-row">
        <Donut slices={chart.slices} />
        <ul className="flex-1 space-y-3">
          {chart.slices.map((s, index) => (
            <li key={s.label} className="flex items-start justify-between gap-4 coreai-fade-up" style={{ animationDelay: `${index * 70}ms` }}>
              <div className="flex items-start gap-2.5">
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} aria-hidden />
                <div>
                  <div className="text-[13px] text-text-primary">{s.label}</div>
                  <div className="text-xs text-text-muted">{s.detail}</div>
                </div>
              </div>
              <div className="text-[13px] font-semibold text-text-primary">{s.value}%</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Donut({ slices }: { slices: ChartPieResponse["slices"] }) {
  const size = 164;
  const cx = size / 2;
  const cy = size / 2;
  const r = 66;
  const inner = 43;
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  let cursor = -Math.PI / 2;

  const arcs = slices.map((s) => {
    const angle = (s.value / total) * Math.PI * 2;
    const start = cursor;
    const end = cursor + angle;
    cursor = end;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const x3 = cx + inner * Math.cos(end);
    const y3 = cy + inner * Math.sin(end);
    const x4 = cx + inner * Math.cos(start);
    const y4 = cy + inner * Math.sin(start);
    const largeArc = angle > Math.PI ? 1 : 0;
    const d = [`M ${x1} ${y1}`, `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`, `L ${x3} ${y3}`, `A ${inner} ${inner} 0 ${largeArc} 0 ${x4} ${y4}`, "Z"].join(" ");
    return { d, color: s.color };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label="Donut chart" className="coreai-donut-spin-in">
      <circle cx={cx} cy={cy} r={r} fill="#F0F2F5" />
      {arcs.map((a, i) => (
        <path key={i} d={a.d} fill={a.color} className="coreai-donut-slice" style={{ animationDelay: `${i * 80}ms` }} />
      ))}
      <circle cx={cx} cy={cy} r={inner - 2} fill="white" />
      <text x={cx} y={cy - 4} textAnchor="middle" className="fill-[#111827]" style={{ fontSize: 18, fontWeight: 700 }}>
        100%
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" className="fill-[#8A93A3]" style={{ fontSize: 11 }}>
        Total
      </text>
    </svg>
  );
}
