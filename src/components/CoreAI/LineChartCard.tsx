"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartLineResponse } from "./types";
import { naira, nairaShort } from "@/data/coreaiData";

export default function LineChartCard({ chart }: { chart: ChartLineResponse }) {
  const [activeTab, setActiveTab] = useState(chart.activeTab);
  const activeData = chart.datasets?.[activeTab] ?? {
    xLabels: chart.xLabels,
    series: chart.series,
  };

  const data = useMemo(
    () =>
      activeData.xLabels.map((month, index) => ({
        month,
        value: activeData.series[index] ?? 0,
      })),
    [activeData]
  );

  return (
    <div className="mt-4 rounded-[20px] bg-[#F7F8FA] p-4 coreai-chart-reveal">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[13px] font-medium text-text-primary">{chart.title}</h3>
        <button
          type="button"
          className="focus-ring flex h-8 items-center gap-1 rounded-lg bg-white px-3 text-xs font-medium text-text-primary shadow-[0_1px_2px_rgba(17,24,39,0.05)] ring-1 ring-border hover:bg-surface-muted"
        >
          2024
          <ChevronDown size={14} className="text-text-muted" aria-hidden />
        </button>
      </div>

      <div className="mb-3 inline-flex rounded-xl bg-white p-1 shadow-[0_1px_2px_rgba(17,24,39,0.04)] ring-1 ring-border">
        {chart.tabs.map((tab) => {
          const active = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={[
                "focus-ring h-7 rounded-lg px-3 text-[11px] font-medium transition-colors",
                active
                  ? "bg-[#EEF2FF] text-[#3157F6]"
                  : "text-text-muted hover:bg-surface-muted hover:text-text-primary",
              ].join(" ")}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div className="h-[206px] rounded-2xl bg-white px-2 pb-2 pt-3 shadow-[0_1px_2px_rgba(17,24,39,0.03)] ring-1 ring-[#EEF1F4]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 2, left: -16 }}>
            <defs>
              <linearGradient id="coreaiRevenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3157F6" stopOpacity={0.22} />
                <stop offset="85%" stopColor="#3157F6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#EEF1F4" strokeDasharray="0" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8A93A3", fontSize: 11 }}
              interval={0}
              dy={8}
            />
            <YAxis
              hide
              domain={["dataMin - 20000000", "dataMax + 30000000"]}
              tickFormatter={(v) => nairaShort(Number(v))}
            />
            <Tooltip content={<RevenueTooltip />} cursor={{ stroke: "#DDE3EA", strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3157F6"
              strokeWidth={2.5}
              fill="url(#coreaiRevenueFill)"
              dot={false}
              activeDot={{ r: 4, stroke: "#FFFFFF", strokeWidth: 2, fill: "#3157F6" }}
              isAnimationActive
              animationDuration={520}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value ?? 0;
  return (
    <div className="rounded-xl border border-border bg-white px-3 py-2 shadow-[0_8px_24px_rgba(17,24,39,0.12)]">
      <div className="text-[11px] font-medium text-text-muted">{label}</div>
      <div className="mt-0.5 text-xs font-semibold text-text-primary">{naira(Number(value))}</div>
    </div>
  );
}
