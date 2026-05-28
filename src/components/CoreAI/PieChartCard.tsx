"use client";

import { ChevronDown } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartPieResponse } from "./types";

export default function PieChartCard({ chart }: { chart: ChartPieResponse }) {
  const data = chart.slices.map((slice) => ({
    name: slice.label,
    value: slice.value,
    detail: slice.detail,
    color: slice.color,
  }));

  return (
    <div className="mt-4 rounded-[20px] bg-[#F7F8FA] p-4 coreai-chart-reveal">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[13px] font-medium text-text-primary">{chart.title}</h3>
        <button
          type="button"
          className="focus-ring flex h-8 items-center gap-1 rounded-lg bg-white px-3 text-xs font-medium text-text-primary shadow-[0_1px_2px_rgba(17,24,39,0.05)] ring-1 ring-border hover:bg-surface-muted"
        >
          {chart.period}
          <ChevronDown size={14} className="text-text-muted" aria-hidden />
        </button>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(17,24,39,0.03)] ring-1 ring-[#EEF1F4]">
        <div className="h-[172px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<DonutTooltip />} />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={74}
                paddingAngle={3}
                stroke="#FFFFFF"
                strokeWidth={3}
                isAnimationActive
                animationDuration={560}
              >
                {data.map((slice) => (
                  <Cell key={slice.name} fill={slice.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="mt-2 space-y-2">
          {chart.slices.map((slice) => (
            <li key={slice.label} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
                <span className="truncate text-xs text-text-secondary">{slice.label}</span>
              </div>
              <div className="shrink-0 text-xs font-semibold text-text-primary">{slice.value}%</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function DonutTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  return (
    <div className="rounded-xl border border-border bg-white px-3 py-2 shadow-[0_8px_24px_rgba(17,24,39,0.12)]">
      <div className="text-[11px] font-medium text-text-muted">{item?.name}</div>
      <div className="mt-0.5 text-xs font-semibold text-text-primary">{item?.detail} • {item?.value}%</div>
    </div>
  );
}
