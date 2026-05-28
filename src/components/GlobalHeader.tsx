"use client";

import { Search, MessageSquareMore, ChevronDown } from "lucide-react";
import { Breadcrumbs, Crumb } from "./Common";
import { useCoreAI } from "./CoreAI/CoreAIProvider";

export default function GlobalHeader({
  title,
  crumbs,
}: {
  title: string;
  crumbs: Crumb[];
}) {
  const { open } = useCoreAI();

  return (
    <header className="flex h-[72px] items-center justify-between border-b border-border bg-surface px-8">
      {/* Left: title + breadcrumbs (unchanged from the per-page header) */}
      <div>
        <h1 className="font-display text-[18px] font-semibold leading-6 tracking-[-0.015em] text-text-primary">{title}</h1>
        <div className="mt-0.5">
          <Breadcrumbs items={crumbs} />
        </div>
      </div>

      {/* Right: Ask Core AI + plain icons + plain text profile */}
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={open}
          className="cc-btn-primary h-9 px-4"
        >
          <Sparkle />
          Ask Core AI
        </button>

        <button
          type="button"
          aria-label="Search"
          className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-sub hover:text-text-primary"
        >
          <Search size={20} strokeWidth={1.75} aria-hidden />
        </button>

        <button
          type="button"
          aria-label="Messages"
          className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-sub hover:text-text-primary"
        >
          <MessageSquareMore size={20} strokeWidth={1.75} aria-hidden />
        </button>

        <button
          type="button"
          aria-label="User profile"
          className="focus-ring flex h-9 items-center gap-1 rounded-lg px-2 text-sm font-medium text-text-primary transition-colors hover:bg-bg-sub"
        >
          <span className="font-medium">Temitope A.</span>
          <ChevronDown size={16} className="text-text-secondary" aria-hidden />
        </button>
      </div>
    </header>
  );
}

function Sparkle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      {Array.from({ length: 12 }).map((_, i) => (
        <rect
          key={i}
          x="11"
          y="2"
          width="2"
          height="6"
          rx="1"
          fill="white"
          opacity={0.4 + (i / 12) * 0.6}
          transform={`rotate(${(360 / 12) * i} 12 12)`}
        />
      ))}
    </svg>
  );
}
