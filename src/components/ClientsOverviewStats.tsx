"use client";

import { Receipt } from "lucide-react";
import { OverviewStat } from "@/data/clients";

export default function ClientsOverviewStats({
  stats,
}: {
  stats: OverviewStat[];
}) {
  return (
    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s, i) => (
        <StatCard key={i} stat={s} />
      ))}
    </div>
  );
}

function StatCard({ stat }: { stat: OverviewStat }) {
  const dirText =
    stat.direction === "increase"
      ? "text-emerald-600"
      : "text-red-600";
  const arrow = stat.direction === "increase" ? "▲" : "▼";

  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <div className="flex items-center justify-between text-xs">
        <span className={`font-medium ${dirText}`}>
          {arrow} {stat.percent}% {stat.direction === "increase" ? "Increase" : "Decrease"}
        </span>
        <span className="text-text-muted">{stat.period}</span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-text-secondary">{stat.label}</p>
          <p className="text-2xl font-semibold tracking-tight text-text-primary">
            {stat.value}
          </p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-muted text-text-secondary">
          <Receipt size={18} strokeWidth={1.8} aria-hidden />
        </span>
      </div>
    </div>
  );
}
