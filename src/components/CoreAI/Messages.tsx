"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { AssistantMessage, UserMessage } from "./types";
import LineChartCard from "./LineChartCard";
import PieChartCard from "./PieChartCard";

export function UserBubble({ message }: { message: UserMessage }) {
  return (
    <div className="mt-6 flex justify-end">
      <div className="max-w-[80%] rounded-xl bg-surface-muted px-4 py-2.5 text-sm text-text-primary">
        {message.text}
      </div>
    </div>
  );
}

export function AssistantBlock({ message }: { message: AssistantMessage }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard may be unavailable; ignore
    }
  };

  return (
    <div className="mt-4">
      {/* Thinking — collapsed by default since spec shows "Thought for 5 seconds" */}
      <CollapsibleStatus
        kind="thinking"
        collapsedLabel={`Thought for ${message.thinkingSeconds} seconds`}
        expandedLabel="Thinking"
        body={
          <ul className="space-y-1">
            {message.thinking.map((t, i) => (
              <li key={i}>{t}.</li>
            ))}
          </ul>
        }
      />

      {/* Answer */}
      <p className="mt-3 text-[15px] leading-relaxed text-text-primary">
        {message.answer}
      </p>

      {/* Feedback actions */}
      <div className="mt-3 flex items-center gap-2 text-text-muted">
        <IconAction label={copied ? "Copied" : "Copy"} onClick={handleCopy}>
          <Copy size={14} aria-hidden />
        </IconAction>
        <IconAction label="Regenerate">
          <RefreshCw size={14} aria-hidden />
        </IconAction>
        <IconAction label="Good response">
          <ThumbsUp size={14} aria-hidden />
        </IconAction>
        <IconAction label="Bad response">
          <ThumbsDown size={14} aria-hidden />
        </IconAction>
      </div>

      {/* Researching */}
      {message.researching && (
        <div className="mt-5">
          <CollapsibleStatus
            kind="researching"
            collapsedLabel="Researching"
            expandedLabel="Researching"
            body={<p>{message.researching}</p>}
            defaultOpen
          />
        </div>
      )}

      {/* Chart */}
      {message.chart?.kind === "line" && <LineChartCard chart={message.chart} />}
      {message.chart?.kind === "pie" && <PieChartCard chart={message.chart} />}
    </div>
  );
}

function IconAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="focus-ring flex h-7 w-7 items-center justify-center rounded-md hover:bg-surface-muted hover:text-text-secondary"
    >
      {children}
    </button>
  );
}

function CollapsibleStatus({
  kind,
  collapsedLabel,
  expandedLabel,
  body,
  defaultOpen = false,
}: {
  kind: "thinking" | "researching";
  collapsedLabel: string;
  expandedLabel: string;
  body: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="focus-ring flex items-center gap-1.5 rounded-md text-xs text-text-muted hover:text-text-secondary"
      >
        <StatusDot kind={kind} />
        <span>{open ? expandedLabel : collapsedLabel}</span>
        {open ? (
          <ChevronDown size={12} aria-hidden />
        ) : (
          <ChevronRight size={12} aria-hidden />
        )}
      </button>
      {open && (
        <div className="mt-2 border-l-2 border-border-strong pl-3 text-sm text-text-primary">
          {body}
        </div>
      )}
    </div>
  );
}

function StatusDot({ kind }: { kind: "thinking" | "researching" }) {
  // Tiny radial sparkle, same family as the logo mark
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
          fill={kind === "thinking" ? "#3157F6" : "#8A93A3"}
          opacity={0.35 + (i / 8) * 0.65}
          transform={`rotate(${(360 / 8) * i} 12 12)`}
        />
      ))}
    </svg>
  );
}
