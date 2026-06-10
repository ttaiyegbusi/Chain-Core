"use client";

import {
  Ban,
  Building2,
  CheckCircle2,
  Clock3,
  Home,
  UserCircle2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { OverviewStat } from "@/data/clients";

const iconMap: Record<OverviewStat["icon"], LucideIcon> = {
  user: UserCircle2,
  building: Building2,
  center: Home,
  persons: Users,
  check: CheckCircle2,
  clock: Clock3,
  ban: Ban,
  users: Users,
};

export default function ClientsOverviewStats({
  stats,
}: {
  stats: OverviewStat[];
}) {
  return (
    <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s, i) => (
        <StatCard key={`${s.label}-${i}`} stat={s} />
      ))}
    </div>
  );
}

function StatCard({ stat }: { stat: OverviewStat }) {
  const isIncrease = stat.direction === "increase";
  const toneClass = isIncrease ? "text-emerald-600" : "text-red-600";
  const arrow = isIncrease ? "▲" : "▼";
  const label = isIncrease ? "Increase" : "Decrease";
  const Icon = iconMap[stat.icon];

  return (
    <article className="min-h-[148px] rounded-[20px] border border-border-strong bg-white px-6 py-5 transition-all duration-300 hover:-translate-y-0.5 ">
      <div className="flex items-start justify-between gap-4">
        <p className={`text-sm font-semibold leading-5 ${toneClass}`}>
          {arrow} {stat.percent}% {label}
        </p>
        <p className="whitespace-nowrap text-sm leading-5 text-text-muted">
          {stat.period}
        </p>
      </div>

      <div className="mt-7 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm leading-5 text-text-secondary">{stat.label}</p>
          <p className="mt-3 text-[34px] font-semibold leading-none tracking-[-0.03em] text-text-primary">
            {stat.value}
          </p>
        </div>

        <span className="mb-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-text-secondary">
          <Icon size={24} strokeWidth={1.8} aria-hidden />
        </span>
      </div>
    </article>
  );
}
