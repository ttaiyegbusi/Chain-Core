"use client";

import { useEffect, useRef } from "react";
import { MoreVertical, Maximize2, Minimize2, X } from "lucide-react";
import { useCoreAI } from "./CoreAIProvider";
import Welcome from "./Welcome";
import Composer from "./Composer";
import AttachmentsPanel from "./AttachmentsPanel";
import { AssistantBlock, UserBubble } from "./Messages";
import { AssistantMessage } from "./types";

export default function CoreAIModal() {
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

  // Escape closes; focus traps within modal while open.
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const focusables = cardRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);

    // prevent background scroll while modal is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, close]);

  // Auto-scroll the conversation to bottom on new messages
  useEffect(() => {
    if (!isOpen) return;
    const el = conversationRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isOpen]);

  if (!isOpen) return null;

  // The most recent assistant message determines whether the attachments
  // panel has content to show.
  const lastAssistant = [...messages]
    .reverse()
    .find((m): m is AssistantMessage => m.role === "assistant");
  const attachmentsForPanel = lastAssistant?.attachments;
  const showingAttachments =
    mode === "modal-attachments" && !!attachmentsForPanel;

  const hasConversation = messages.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="coreai-title"
    >
      <div
        className="absolute inset-0 bg-black/35"
        onClick={close}
        aria-hidden
      />

      <div
        ref={cardRef}
        className={[
          "relative z-10 flex h-[90vh] max-h-[950px] w-full overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(17,24,39,0.25)]",
          showingAttachments ? "max-w-[1200px]" : "max-w-[900px]",
        ].join(" ")}
      >
        {/* Main conversation column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
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

        {/* Attachments panel (only when active and we have one to show) */}
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
      className="focus-ring flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-text-secondary hover:bg-border"
    >
      {children}
    </button>
  );
}
