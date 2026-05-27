"use client";

import Logo from "@/components/Logo";
import { SUGGESTED_PROMPTS } from "./types";

export default function Welcome({
  onPromptClick,
}: {
  onPromptClick: (prompt: string) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Centered greeting */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center">
          <Logo size={56} />
        </div>
        <h2 className="text-2xl font-semibold text-text-primary">
          Hello Temitope!
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          This is Core Ai, how can I help today?
        </p>
      </div>

      {/* Suggested Prompts pinned above composer */}
      <div className="px-6 pb-3">
        <div className="mb-3 text-sm text-text-secondary">
          Suggested Prompts
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPromptClick(p)}
              className="focus-ring inline-flex items-center gap-2 rounded-md bg-surface-muted px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-border"
            >
              <Sparkle />
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Sparkle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => (
        <rect
          key={i}
          x="11"
          y="3"
          width="2"
          height="5"
          rx="1"
          fill="#3157F6"
          opacity={0.35 + (i / 8) * 0.65}
          transform={`rotate(${(360 / 8) * i} 12 12)`}
        />
      ))}
    </svg>
  );
}
