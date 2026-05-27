"use client";

import { useRef, useState } from "react";
import { Plus, ArrowUp } from "lucide-react";

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
      <div className="rounded-2xl bg-surface-muted p-3">
        {/* Label row */}
        <div className="mb-2 flex items-center gap-1.5 px-2 text-xs text-text-secondary">
          <Sparkle />
          <span>Ask about anything</span>
        </div>

        {/* Input row */}
        <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 ring-1 ring-border">
          <button
            type="button"
            aria-label="Attach file"
            className="focus-ring flex h-7 w-7 items-center justify-center rounded-md text-text-secondary hover:bg-surface-muted"
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

          <button
            type="button"
            onClick={submit}
            aria-label="Send message"
            disabled={!value.trim()}
            className="focus-ring flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-hover disabled:bg-border-strong disabled:text-text-muted"
          >
            <ArrowUp size={16} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

function Sparkle() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden>
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
