"use client";

import { Search, MessageSquare, ChevronDown } from "lucide-react";
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
    <header className="flex h-[70px] items-center justify-between border-b border-border pl-10 pr-6">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
        <div className="mt-0.5">
          <Breadcrumbs items={crumbs} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <AskCoreAIButton onClick={open} />

        <button
          type="button"
          aria-label="Search"
          className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted text-text-secondary transition-colors hover:bg-border"
        >
          <Search size={18} aria-hidden />
        </button>

        <button
          type="button"
          aria-label="Messages"
          className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted text-text-secondary transition-colors hover:bg-border"
        >
          <MessageSquare size={18} aria-hidden />
        </button>

        <button
          type="button"
          aria-label="User profile"
          className="focus-ring flex h-9 items-center gap-2 rounded-full bg-surface-muted px-3 text-sm text-text-primary transition-colors hover:bg-border"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-medium text-white">
            T
          </span>
          <span className="font-medium">Temitope A.</span>
          <ChevronDown size={14} className="text-text-secondary" aria-hidden />
        </button>
      </div>
    </header>
  );
}

function AskCoreAIButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
    >
      <Sparkle />
      Ask Core AI
    </button>
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
