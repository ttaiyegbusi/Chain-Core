"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, Maximize2, Minimize2, X } from "lucide-react";
import { useCoreAI } from "./CoreAIProvider";
import Welcome from "./Welcome";
import Composer from "./Composer";
import AttachmentsPanel from "./AttachmentsPanel";
import { AssistantBlock, UserBubble } from "./Messages";
import { AssistantMessage } from "./types";

/**
 * Core AI floating panel.
 *
 * Sits on the right side of the viewport, floating over the underlying
 * ChainCore page. The page remains visible and interactive on the left —
 * no dim, no backdrop. Top of the panel sits below the global header.
 *
 * Open/close uses an Apple-style spring animation: subtle scale + opacity
 * + slight slide-in from the right.
 */
export default function CoreAIPanel() {
  const {
    isOpen,
    mode,
    expanded,
    messages,
    close,
    toggleExpanded,
    send,
    hideAttachments,
  } = useCoreAI();

  // Keep the panel mounted while the exit animation is playing.
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Flip to visible on the next frame so the CSS transition runs.
      const r = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(r);
    } else if (mounted) {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 240);
      return () => clearTimeout(t);
    }
  }, [isOpen, mounted]);

  const cardRef = useRef<HTMLDivElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);

  // Escape closes. Background stays interactive; we don't trap focus or
  // lock body scroll — this panel floats, it doesn't take over.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen) return;
    const el = conversationRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isOpen]);

  if (!mounted) return null;

  const lastAssistant = [...messages]
    .reverse()
    .find((m): m is AssistantMessage => m.role === "assistant");
  const attachmentsForPanel = lastAssistant?.attachments;
  const showingAttachments =
    mode === "modal-attachments" && !!attachmentsForPanel;

  const hasConversation = messages.length > 0;

  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby="coreai-title"
      style={{
        // Smooth, spring-like easing for the expand/collapse + open/close.
        transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
      }}
      className={[
        "fixed z-40 flex origin-top-right transform-gpu flex-col overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(17,24,39,0.18)] ring-1 ring-border",
        // Animate open/close, and let expand/collapse grow from the right edge toward the left.
        "transition-[width,height,top,bottom,left,right,transform,opacity] duration-[320ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
        expanded
          ? // Expanded panel stays anchored to the right and grows leftward.
            "right-5 top-[86px] bottom-5 w-[min(1000px,calc(100vw-40px))]"
          : // Right-side docked panel.
            "right-5 top-[86px] bottom-5 w-[450px] max-w-[calc(100vw-40px)]",
        // Apple-style open/close: soft fade + slight scale + slide from the button side.
        visible ? "translate-x-0 scale-100 opacity-100" : "translate-x-3 scale-[0.97] opacity-0",
      ].join(" ")}
    >
      {/* Internal header */}
      <div className="flex h-[64px] shrink-0 items-center justify-between border-b border-border px-6">
        <h2 id="coreai-title" className="text-sm font-semibold text-text-primary">
          Core Ai
        </h2>
        <div className="flex items-center gap-2">
          <HeaderIcon label="Open Core AI options">
            <MoreVertical size={16} aria-hidden />
          </HeaderIcon>
          <HeaderIcon
            label={expanded ? "Collapse Core AI" : "Expand Core AI"}
            onClick={toggleExpanded}
          >
            {expanded ? (
              <Minimize2 size={14} aria-hidden />
            ) : (
              <Maximize2 size={14} aria-hidden />
            )}
          </HeaderIcon>
          <HeaderIcon label="Close Core AI" onClick={close}>
            <X size={16} aria-hidden />
          </HeaderIcon>
        </div>
      </div>

      {/* Body row: conversation (+ optional attachments column) */}
      <div className="flex min-h-0 flex-1">
        <div
          className={[
            "flex min-w-0 flex-1 flex-col transition-[max-width,transform,opacity] duration-[320ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
            expanded ? "coreai-content-settle mx-auto w-full max-w-[500px]" : "",
          ].join(" ")}
        >
          {hasConversation ? (
            <>
              <div ref={conversationRef} className="flex-1 overflow-y-auto px-6">
                {messages.map((m) =>
                  m.role === "user" ? (
                    <UserBubble key={m.id} message={m} />
                  ) : (
                    <AssistantBlock key={m.id} message={m} />
                  )
                )}
                <div className="h-6" />
              </div>
              <Composer onSend={send} />
            </>
          ) : (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <Welcome onPromptClick={send} />
              </div>
              <Composer onSend={send} />
            </div>
          )}
        </div>

        {showingAttachments && attachmentsForPanel && (
          <AttachmentsPanel
            attachments={attachmentsForPanel}
            onClose={hideAttachments}
          />
        )}
      </div>
    </div>
  );
}

function HeaderIcon({
  label,
  children,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF0F2] text-text-secondary hover:bg-[#E2E5E9]"
    >
      {children}
    </button>
  );
}
