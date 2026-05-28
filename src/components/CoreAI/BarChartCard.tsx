"use client";

import { ChevronDown } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartBarResponse } from "./types";

export default function BarChartCard({ chart }: { chart: ChartBarResponse }) {
  const data = chart.bars.map((bar) => ({
    name: bar.label,
    value: bar.value,
    display: bar.display,
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

      <div className="h-[238px] rounded-2xl bg-white px-2 pb-2 pt-4 shadow-[0_1px_2px_rgba(17,24,39,0.03)] ring-1 ring-[#EEF1F4]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
            <CartesianGrid horizontal={false} stroke="#EEF1F4" />
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              width={112}
              tick={{ fill: "#4B5563", fontSize: 11 }}
            />
            <Tooltip content={<BarTooltip />} cursor={{ fill: "#F7F8FA" }} />
            <Bar dataKey="value" fill="#3157F6" radius={[6, 6, 6, 6]} barSize={18} animationDuration={520} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  return (
    <div className="rounded-xl border border-border bg-white px-3 py-2 shadow-[0_8px_24px_rgba(17,24,39,0.12)]">
      <div className="text-[11px] font-medium text-text-muted">{label}</div>
      <div className="mt-0.5 text-xs font-semibold text-text-primary">{item?.display}</div>
    </div>
  );
}
