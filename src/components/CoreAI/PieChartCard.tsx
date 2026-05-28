"use client";

import { ChevronDown } from "lucide-react";
import { ChartPieResponse } from "./types";

export default function PieChartCard({ chart }: { chart: ChartPieResponse }) {
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

      <div className="flex flex-col items-center gap-6 rounded-xl bg-white p-5 sm:flex-row">
        <Donut slices={chart.slices} />

        <ul className="flex-1 space-y-3">
          {chart.slices.map((s) => (
            <li key={s.label} className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-2.5">
                <span
                  className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: s.color }}
                  aria-hidden
                />
                <div>
                  <div className="text-sm text-text-primary">{s.label}</div>
                  <div className="text-xs text-text-muted">{s.detail}</div>
                </div>
              </div>
              <div className="text-sm font-medium text-text-primary">
                {s.value}%
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Donut({ slices }: { slices: ChartPieResponse["slices"] }) {
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = 70;
  const inner = 44; // donut thickness

  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  let cursor = -Math.PI / 2; // start at top

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

    // Label position at mid-angle, between inner and outer radius
    const mid = (start + end) / 2;
    const labelR = (r + inner) / 2;
    const lx = cx + labelR * Math.cos(mid);
    const ly = cy + labelR * Math.sin(mid);

    const d = [
      `M ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${inner} ${inner} 0 ${largeArc} 0 ${x4} ${y4}`,
      "Z",
    ].join(" ");

    return { d, color: s.color, label: `${s.value}%`, lx, ly };
  });

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      role="img"
      aria-label="Asset allocation donut chart"
    >
      {arcs.map((a, i) => (
        <g key={i}>
          <path d={a.d} fill={a.color} />
          <text
            x={a.lx}
            y={a.ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            style={{ fontSize: 11, fontWeight: 600 }}
          >
            {a.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
