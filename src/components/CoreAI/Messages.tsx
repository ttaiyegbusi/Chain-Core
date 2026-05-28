"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Check,
} from "lucide-react";
import { AssistantMessage, UserMessage } from "./types";
import LineChartCard from "./LineChartCard";
import PieChartCard from "./PieChartCard";
import BarChartCard from "./BarChartCard";

export function UserBubble({ message }: { message: UserMessage }) {
  return (
    <div className="mt-6 flex justify-end coreai-fade-up">
      <div className="max-w-[80%] rounded-xl bg-surface-muted px-4 py-2.5 text-sm text-text-primary">
        {message.text}
      </div>
    </div>
  );
}

export function AssistantBlock({ message }: { message: AssistantMessage }) {
  const [copied, setCopied] = useState(false);

  const streaming =
    message.phase === "thinking" ||
    message.phase === "researching" ||
    message.phase === "answering";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard may be unavailable; ignore
    }
  };

  // Answer text shown so far (typing effect while answering; full when done).
  const shownAnswer =
    message.phase === "done"
      ? message.answer
      : message.answer.slice(0, message.revealedChars);

  const showAnswer =
    message.phase === "answering" || message.phase === "done";
  const showChart = message.phase === "done" && !!message.chart;
  const showFeedback = message.phase === "done";

  return (
    <div className="mt-4">
      {/* ---- Thinking ---- */}
      {message.phase === "thinking" ? (
        <LiveThinking message={message} />
      ) : (
        <CollapsibleStatus
          kind="thinking"
          collapsedLabel={`Thought for ${message.thinkingSeconds} second${
            message.thinkingSeconds === 1 ? "" : "s"
          }`}
          expandedLabel="Thinking"
          body={
            <ul className="space-y-1">
              {message.thinking.map((t, i) => (
                <li key={i}>{t}.</li>
              ))}
            </ul>
          }
        />
      )}

      {/* ---- Researching (live) ---- */}
      {message.phase === "researching" && message.researching && (
        <div className="mt-4">
          <LiveResearching text={message.researching} />
        </div>
      )}

      {/* ---- Answer ---- */}
      {showAnswer && (
        <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-text-primary">
          {shownAnswer}
          {message.phase === "answering" && (
            <span className="coreai-caret" aria-hidden>
              ▍
            </span>
          )}
        </p>
      )}

      {/* ---- Feedback actions ---- */}
      {showFeedback && (
        <div className="mt-3 flex items-center gap-2 text-text-muted coreai-fade-up">
          <IconAction label={copied ? "Copied" : "Copy"} onClick={handleCopy}>
            {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
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
      )}

      {/* ---- Researching (collapsed, after done) ---- */}
      {message.phase === "done" && message.researching && (
        <div className="mt-5">
          <CollapsibleStatus
            kind="researching"
            collapsedLabel="Researching"
            expandedLabel="Researching"
            body={<p>{message.researching}</p>}
          />
        </div>
      )}

      {/* ---- Chart ---- */}
      {showChart && (
        <div className="coreai-fade-up">
          {message.chart?.kind === "line" && <LineChartCard chart={message.chart} />}
          {message.chart?.kind === "pie" && <PieChartCard chart={message.chart} />}
          {message.chart?.kind === "bar" && <BarChartCard chart={message.chart} />}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Live states */

function LiveThinking({ message }: { message: AssistantMessage }) {
  const lines = message.thinking.slice(0, message.revealedThinking);
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
        <Sparkle spinning />
        <span className="coreai-shimmer-text">Thinking</span>
      </div>
      <ul className="mt-2 space-y-1.5 border-l-2 border-border-strong pl-3 text-sm text-text-secondary">
        {lines.map((t, i) => (
          <li key={i} className="coreai-fade-up flex items-center gap-2">
            <span className="text-text-muted">{t}.</span>
          </li>
        ))}
        {message.revealedThinking < message.thinking.length && (
          <li className="flex items-center gap-1 pl-0.5">
            <ThinkingDots />
          </li>
        )}
      </ul>
    </div>
  );
}

function LiveResearching({ text }: { text: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
        <Sparkle spinning muted />
        <span className="coreai-shimmer-text">Researching</span>
      </div>
      <div className="mt-2 flex items-center gap-2 border-l-2 border-border-strong pl-3 text-sm text-text-muted">
        <span>{text}</span>
        <ThinkingDots />
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <span className="coreai-dots inline-flex items-center gap-1" aria-hidden>
      <span className="coreai-dot" />
      <span className="coreai-dot" />
      <span className="coreai-dot" />
    </span>
  );
}

/* ------------------------------------------------------------------- Helpers */

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
        <Sparkle muted={kind === "researching"} />
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

function Sparkle({
  muted = false,
  spinning = false,
}: {
  muted?: boolean;
  spinning?: boolean;
}) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      aria-hidden
      className={spinning ? "coreai-spin" : undefined}
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <rect
          key={i}
          x="11"
          y="3"
          width="2"
          height="5"
          rx="1"
          fill={muted ? "#8A93A3" : "#3157F6"}
          opacity={0.35 + (i / 8) * 0.65}
          transform={`rotate(${(360 / 8) * i} 12 12)`}
        />
      ))}
    </svg>
  );
}
