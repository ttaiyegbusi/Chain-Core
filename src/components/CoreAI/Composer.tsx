"use client";

import { useRef, useState } from "react";
import { Plus, ArrowUp, ChevronDown } from "lucide-react";
import Logo from "@/components/Logo";

export default function Composer({
  onSend,
}: {
  onSend: (text: string) => void;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const text = value.trim();
    if (!text) return;
    onSend(text);
    setValue("");
    inputRef.current?.focus();
  };

  return (
    <div className="px-6 pb-5">
      {/* Outer container: bg F7F7F7, padding L4 R4 T8 B4 */}
      <div
        className="rounded-2xl border border-border bg-bg-sub shadow-xs"
        style={{ paddingLeft: 4, paddingRight: 4, paddingTop: 8, paddingBottom: 4 }}
      >
        {/* Label row */}
        <div className="mb-2 flex items-center gap-1.5 px-2 text-xs text-text-secondary">
          <Logo size={14} />
          <span>Ask about anything</span>
        </div>

        {/* Inner input row: white container, no stroke */}
        <div className="flex items-center gap-2 rounded-xl bg-surface px-2 py-2">
          <button
            type="button"
            aria-label="Attach file"
            className="focus-ring flex h-7 w-7 items-center justify-center rounded-lg text-text-secondary hover:bg-border-soft"
          >
            <Plus size={16} aria-hidden />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Type in here..."
            aria-label="Type a message"
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />

          {/* Think mode pill */}
          <button
            type="button"
            aria-label="Reasoning mode"
            className="focus-ring flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-text-secondary hover:bg-border-soft"
          >
            Think
            <ChevronDown size={12} aria-hidden />
          </button>

          <button
            type="button"
            onClick={submit}
            aria-label="Send message"
            disabled={!value.trim()}
            className="focus-ring flex h-7 w-7 items-center justify-center rounded-full bg-surface text-text-secondary ring-1 ring-border-strong transition-colors hover:bg-bg-sub disabled:opacity-60"
          >
            <ArrowUp size={14} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
