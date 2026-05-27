"use client";

import { useEffect, useRef } from "react";
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
 * In "modal-attachments" mode an attachments column is appended on the
 * right, widening the floating panel.
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

  if (!isOpen) return null;

  const lastAssistant = [...messages]
    .reverse()
    .find((m): m is AssistantMessage => m.role === "assistant");
  const attachmentsForPanel = lastAssistant?.attachments;
  const showingAttachments =
    mode === "modal-attachments" && !!attachmentsForPanel;

  const hasConversation = messages.length > 0;

  // Width: ~680px standard, ~1060px when attachments column is open.
  // Positioned fixed on the right, below the 70px global header, with
  // a small margin from the right edge and bottom.
  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby="coreai-title"
      className={[
        "fixed right-5 top-[86px] bottom-5 z-40 flex overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(17,24,39,0.18)] ring-1 ring-border",
        showingAttachments ? "w-[1060px]" : "w-[680px]",
        "max-w-[calc(100vw-40px)]",
      ].join(" ")}
    >
      {/* Main conversation column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Internal header */}
        <div className="flex h-[64px] items-center justify-between border-b border-border px-6">
          <h2
            id="coreai-title"
            className="text-base font-semibold text-text-primary"
          >
            Core Ai
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
      className="focus-ring flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-text-secondary hover:bg-border"
    >
      {children}
    </button>
  );
}
