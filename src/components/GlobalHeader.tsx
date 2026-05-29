"use client";

import { Search, MessageSquareMore, ChevronDown } from "lucide-react";
import { Breadcrumbs, Crumb } from "./Common";
import { useCoreAI } from "./CoreAI/CoreAIProvider";
import { useNotifications } from "./Notifications/NotificationsProvider";

export default function GlobalHeader({
  title,
  crumbs,
}: {
  title: string;
  crumbs: Crumb[];
}) {
  const { open } = useCoreAI();
  const { open: openNotifications } = useNotifications();

  return (
    <header className="flex h-[70px] items-center justify-between border-b border-border bg-white pl-10 pr-10">
      {/* Left: title + breadcrumbs (unchanged from the per-page header) */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
        <div className="mt-0.5">
          <Breadcrumbs items={crumbs} />
        </div>
      </div>

      {/* Right: Ask Core AI + plain icons + plain text profile */}
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={open}
          className="focus-ring inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          <Sparkle />
          Ask Core AI
        </button>

        <button
          type="button"
          aria-label="Search"
          className="focus-ring text-text-secondary transition-colors hover:text-text-primary"
        >
          <Search size={20} strokeWidth={1.8} aria-hidden />
        </button>

        <button
          type="button"
          onClick={openNotifications}
          aria-label="Messages"
          className="focus-ring text-text-secondary transition-colors hover:text-text-primary"
        >
          <MessageSquareMore size={20} strokeWidth={1.8} aria-hidden />
        </button>

        <button
          type="button"
          aria-label="User profile"
          className="focus-ring flex items-center gap-1 text-sm text-text-primary transition-colors hover:text-text-secondary"
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
