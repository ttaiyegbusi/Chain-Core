"use client";

import { Sparkles } from "lucide-react";
import Logo from "@/components/Logo";
import { SUGGESTED_PROMPTS } from "./types";

/**
 * Core AI welcome / empty state.
 *
 * Matches Figma node 967-44800:
 *  - Layered, shadowed brand mark (60px outer wrap → white inset with soft
 *    shadow → #F3F3F3 rounded square → the brand circle)
 *  - Two-line greeting: "Hello Temitope!" (black, Geist Medium 18px) and
 *    "This is Core Ai, how can I help today?" (muted #868C98, same size)
 *  - "Suggested Prompts" label above the chips
 *  - Each chip is its own #F7F7F7 pill, sized to its content, with the
 *    sparkle icon inline; they wrap to a second row naturally.
 *  - Layout uses justify-between so the greeting sits in the top of the
 *    available space and the chips group anchors to the bottom (just above
 *    the composer, which is rendered by the parent).
 */
export default function Welcome({
  onPromptClick,
}: {
  onPromptClick: (prompt: string) => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-between gap-5 px-5 py-5">
      {/* Greeting block — brand mark + two-line greeting, centered. */}
      <div className="flex w-full flex-col items-center gap-1 pt-8">
        <BrandMark />
        <div className="mt-1 text-center leading-tight">
          <p className="font-medium tracking-[-0.02em] text-text-primary" style={{ fontSize: 18 }}>
            Hello Temitope!
          </p>
          <p className="font-medium tracking-[-0.02em] text-[#868C98]" style={{ fontSize: 18 }}>
            This is Core Ai, how can I help today?
          </p>
        </div>
      </div>

      {/* Suggested Prompts — sits just above the composer, anchored to bottom. */}
      <div className="flex w-full flex-col gap-2">
        <p
          className="font-normal tracking-[-0.02em] text-text-primary"
          style={{ fontSize: 12 }}
        >
          Suggested Prompts
        </p>
        <div className="flex flex-wrap gap-1">
          {SUGGESTED_PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPromptClick(p)}
              className="focus-ring inline-flex items-center gap-1 rounded-lg bg-[#F7F7F7] px-2 py-1 text-[#525866] transition-colors hover:bg-[#ECECEC]"
              style={{ fontSize: 12, letterSpacing: "-0.02em" }}
            >
              <Sparkles size={16} className="text-primary" aria-hidden />
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * The layered brand mark from the Figma — outer 60px rounded wrap, white
 * inset card with a soft drop shadow, a #F3F3F3 inner square, and the
 * ChainCore brand circle floating inside.
 */
function BrandMark() {
  return (
    <div
      className="flex items-center justify-center rounded-[36px]"
      style={{ width: 60, height: 60, padding: 4.444 }}
    >
      <div
        className="flex items-center justify-center rounded-[36px] bg-white"
        style={{
          padding: 2.222,
          boxShadow:
            "0px 26.667px 71.111px -17.778px rgba(4,50,56,0.30), 0px 26.667px 35.556px -8.889px rgba(4,50,56,0.10)",
        }}
      >
        <div
          className="flex items-center justify-center rounded-[31.111px] bg-[#F3F3F3]"
          style={{ width: 46.667, height: 46.667 }}
        >
          <Logo size={45.284} />
        </div>
      </div>
    </div>
  );
}
