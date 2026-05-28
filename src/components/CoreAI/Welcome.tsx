"use client";

import { Sparkles } from "lucide-react";
import Logo from "@/components/Logo";
import { SUGGESTED_PROMPTS } from "./types";

export default function Welcome({
  onPromptClick,
}: {
  onPromptClick: (prompt: string) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Greeting: sits near the top, not vertically centered */}
      <div className="flex flex-col items-center px-6 pt-10 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center">
          <Logo size={48} />
        </div>
        <h2 className="text-base font-semibold text-text-primary">
          Hello Temitope!
        </h2>
        <p className="mt-1 text-xs text-text-secondary">
          This is Core Ai, how can I help today?
        </p>
      </div>

      {/* Spacer pushes Suggested Prompts to the bottom */}
      <div className="flex-1" />

      {/* Suggested Prompts pinned just above the composer */}
      <div className="px-6 pb-3">
        <div className="mb-3 text-xs text-text-secondary">
          Suggested Prompts
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPromptClick(p)}
              className="focus-ring inline-flex items-center gap-2 rounded-md bg-[#F7F7F7] px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-[#ECECEC]"
            >
              <Sparkles size={14} className="text-primary" aria-hidden />
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
