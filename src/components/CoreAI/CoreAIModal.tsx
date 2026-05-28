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
    messages,
    close,
    toggleMode,
    send,
    hideAttachments,
  } = useCoreAI();

  // Keep the panel mounted while the exit animation is playing.
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<"enter" | "exit">("enter");

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setPhase("enter");
    } else if (mounted) {
      setPhase("exit");
      const t = setTimeout(() => setMounted(false), 200);
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
      className={[
        "fixed right-5 top-[86px] bottom-5 z-40 flex overflow-hidden rounded-2xl border border-border bg-surface shadow-overlay",
        showingAttachments ? "w-[830px]" : "w-[450px]",
        "max-w-[calc(100vw-40px)]",
        phase === "enter" ? "coreai-panel-enter" : "coreai-panel-exit",
      ].join(" ")}
    >
      {/* Main conversation column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Internal header */}
        <div className="flex h-[64px] items-center justify-between border-b border-border px-6">
          <h2
            id="coreai-title"
            className="text-sm font-semibold text-text-primary"
          >
            Core AI
          </h2>
          <div className="flex items-center gap-2">
            <HeaderIcon label="Open Core AI options">
              <MoreVertical size={16} aria-hidden />
            </HeaderIcon>
            <HeaderIcon
              label={
                showingAttachments
                  ? "Hide attachments"
                  : "Show attachments"
              }
              onClick={toggleMode}
            >
              {showingAttachments ? (
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

        {/* Body */}
        {hasConversation ? (
          <>
            <div
              ref={conversationRef}
              className="flex-1 overflow-y-auto px-6"
            >
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
      className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg bg-bg-sub text-text-secondary hover:bg-border"
    >
      {children}
    </button>
  );
}
