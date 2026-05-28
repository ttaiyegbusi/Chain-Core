"use client";

import { useMemo, useState } from "react";
import { ChevronDown, TrendingUp } from "lucide-react";
import { ChartLineResponse } from "./types";
import { nairaShort } from "@/data/coreaiData";

export default function LineChartCard({ chart }: { chart: ChartLineResponse }) {
  const [activeTab, setActiveTab] = useState(chart.activeTab);
  const stats = useMemo(() => {
    const first = chart.series[0] ?? 0;
    const last = chart.series[chart.series.length - 1] ?? 0;
    const total = chart.series.reduce((sum, value) => sum + value, 0);
    const delta = first ? ((last - first) / first) * 100 : 0;
    return { total, last, delta };
  }, [chart.series]);

  return (
    <div className="mt-3 rounded-2xl border border-border bg-[#F7F8FA] p-4 shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[13px] font-medium text-text-secondary">{chart.title}</h3>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-lg font-semibold text-text-primary">{nairaShort(stats.total)}</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-primary ring-1 ring-border">
              <TrendingUp size={12} aria-hidden />
              {stats.delta >= 0 ? "+" : ""}{stats.delta.toFixed(1)}%
            </span>
          </div>
        </div>
        <button
          type="button"
          className="focus-ring flex items-center gap-1.5 rounded-lg border border-border-strong bg-white px-3 py-1.5 text-xs text-text-primary shadow-[0_1px_1px_rgba(17,24,39,0.02)] hover:bg-surface-muted"
        >
          {chart.period}
          <ChevronDown size={14} className="text-text-secondary" aria-hidden />
        </button>
      </div>

      <div
        role="tablist"
        aria-label="Time range"
        className="mb-4 flex gap-1 rounded-lg border border-border-strong bg-white p-1"
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
                "focus-ring flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                active ? "bg-[#F0F3FF] text-primary" : "text-text-muted hover:bg-surface-muted",
              ].join(" ")}
            >
              {t}
            </button>
          );
        })}
      </div>

      <LineSVG xLabels={chart.xLabels} series={chart.series} />
    </div>
  );
}

function LineSVG({ xLabels, series }: { xLabels: string[]; series: number[] }) {
  const W = 600;
  const H = 230;
  const padX = 34;
  const padTop = 18;
  const padBottom = 34;
  const padRight = 18;

  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const safeMin = min - range * 0.08;
  const safeMax = max + range * 0.08;
  const safeRange = safeMax - safeMin || 1;

  const n = series.length;
  const step = (W - padX - padRight) / Math.max(1, n - 1);
  const points = series.map((v, i) => {
    const x = padX + i * step;
    const y = padTop + ((safeMax - v) / safeRange) * (H - padTop - padBottom);
    return [x, y] as const;
  });

  const linePath = smoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1][0]} ${H - padBottom} L ${points[0][0]} ${H - padBottom} Z`;
  const grid = [0, 0.33, 0.66, 1].map((t) => padTop + t * (H - padTop - padBottom));
  const labels = [safeMax, safeMin + safeRange * 0.66, safeMin + safeRange * 0.33, safeMin];
  const gradientId = `lc_grad_${series.length}_${Math.round(series[0] ?? 0)}`;

  return (
    <div className="rounded-xl bg-white p-2 ring-1 ring-border/70">
      <svg viewBox={`0 0 ${W} ${H + 18}`} className="block h-auto w-full" role="img" aria-label="Line chart">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3157F6" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#3157F6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {grid.map((y, i) => (
          <g key={i}>
            <line x1={padX} x2={W - padRight} y1={y} y2={y} stroke="#EEF1F4" strokeWidth="1" />
            <text x={0} y={y + 4} className="fill-[#A0A7B4]" style={{ fontSize: 10 }}>
              {nairaShort(labels[i])}
            </text>
          </g>
        ))}

        <path d={areaPath} fill={`url(#${gradientId})`} className="coreai-area-reveal" />
        <path d={linePath} fill="none" stroke="#3157F6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" className="coreai-line-draw" />

        {points.map(([x, y], i) => {
          const show = i === 0 || i === points.length - 1 || i === Math.floor(points.length / 2);
          if (!show) return null;
          return <circle key={i} cx={x} cy={y} r="3" fill="#3157F6" stroke="white" strokeWidth="2" className="coreai-point-pop" />;
        })}

        {xLabels.map((lbl, i) => {
          const x = padX + i * ((W - padX - padRight) / Math.max(1, xLabels.length - 1));
          return (
            <text key={`${lbl}-${i}`} x={x} y={H + 2} textAnchor="middle" className="fill-[#8A93A3]" style={{ fontSize: 11 }}>
              {lbl}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

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
