"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, Maximize2, Minimize2, X, Paperclip, Copy, Trash2, Settings as SettingsIcon } from "lucide-react";
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
    showAttachments,
    hideAttachments,
    reset,
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

  // More-menu (⋮) state.
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the menu on outside click or Esc.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Menu action: copy the full transcript to clipboard.
  const copyTranscript = async () => {
    const lines: string[] = [];
    for (const m of messages) {
      if (m.role === "user") {
        lines.push(`You: ${m.text}`);
      } else {
        lines.push(`Core AI: ${m.answer}`);
      }
    }
    try {
      await navigator.clipboard.writeText(lines.join("\n\n"));
    } catch {
      // clipboard may be unavailable; ignore silently
    }
  };

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
        "fixed z-40 flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(17,24,39,0.18)] ring-1 ring-border",
        // animate size + position changes smoothly
        "transition-[width,height,top,bottom,left,right,transform,opacity] duration-[420ms]",
        expanded
          ? // Centered, larger floating panel (backdrop-free) — like image 3.
            "left-1/2 top-1/2 h-[86vh] w-[min(1100px,92vw)] -translate-x-1/2 -translate-y-1/2"
          : // Right-side docked panel — widens when attachments are visible.
            showingAttachments
              ? "right-5 top-[86px] bottom-5 w-[830px] max-w-[calc(100vw-40px)]"
              : "right-5 top-[86px] bottom-5 w-[450px] max-w-[calc(100vw-40px)]",
        // open/close fade (layout transition handles size/position)
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      {/* Internal header */}
      <div className="flex h-[64px] shrink-0 items-center justify-between border-b border-border px-6">
        <h2 id="coreai-title" className="text-sm font-semibold text-text-primary">
          Core Ai
        </h2>
        <div className="flex items-center gap-2">
          <div ref={menuRef} className="relative">
            <HeaderIcon
              label="Open Core AI options"
              onClick={() => setMenuOpen((v) => !v)}
              active={menuOpen}
            >
              <MoreVertical size={16} aria-hidden />
            </HeaderIcon>
            {menuOpen && (
              <MoreMenu
                hasMessages={messages.length > 0}
                showingAttachments={showingAttachments}
                onAttachments={() => {
                  setMenuOpen(false);
                  if (showingAttachments) hideAttachments();
                  else showAttachments();
                }}
                onCopyTranscript={() => {
                  setMenuOpen(false);
                  copyTranscript();
                }}
                onClearConversation={() => {
                  setMenuOpen(false);
                  reset();
                }}
                onSettings={() => setMenuOpen(false)}
              />
            )}
          </div>
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
        <div className="flex min-w-0 flex-1 flex-col">
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
  active = false,
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active || undefined}
      className={[
        "focus-ring flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
        active
          ? "bg-[#E2E5E9] text-text-primary"
          : "bg-[#EEF0F2] text-text-secondary hover:bg-[#E2E5E9]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/**
 * Small dropdown menu anchored to the ⋮ (more) icon in the Core AI header.
 * Items: Attachments, Copy transcript, Clear conversation, Settings.
 *
 * Disabled states:
 *  - "Copy transcript" and "Clear conversation" only enabled when there's
 *    an active conversation (hasMessages).
 */
function MoreMenu({
  hasMessages,
  showingAttachments,
  onAttachments,
  onCopyTranscript,
  onClearConversation,
  onSettings,
}: {
  hasMessages: boolean;
  showingAttachments: boolean;
  onAttachments: () => void;
  onCopyTranscript: () => void;
  onClearConversation: () => void;
  onSettings: () => void;
}) {
  return (
    <div
      role="menu"
      className="absolute right-0 top-[calc(100%+6px)] z-50 w-[208px] origin-top-right overflow-hidden rounded-xl border border-[#EBEBEB] bg-white py-1 shadow-[0_12px_32px_rgba(17,24,39,0.12),0_2px_6px_rgba(17,24,39,0.05)] coreai-menu-in"
    >
      <MenuItem
        icon={<Paperclip size={14} aria-hidden />}
        label={showingAttachments ? "Hide attachments" : "Attachments"}
        onClick={onAttachments}
      />
      <MenuItem
        icon={<Copy size={14} aria-hidden />}
        label="Copy transcript"
        onClick={onCopyTranscript}
        disabled={!hasMessages}
      />
      <MenuItem
        icon={<Trash2 size={14} aria-hidden />}
        label="Clear conversation"
        onClick={onClearConversation}
        disabled={!hasMessages}
        danger
      />
      <MenuSeparator />
      <MenuItem
        icon={<SettingsIcon size={14} aria-hidden />}
        label="Settings"
        onClick={onSettings}
      />
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  disabled = false,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className={[
        "focus-ring flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] tracking-[-0.02em] transition-colors",
        disabled
          ? "cursor-not-allowed text-[#C2C7CF]"
          : danger
          ? "text-[#B42318] hover:bg-[#FEF3F2]"
          : "text-[#171717] hover:bg-[#F7F7F7]",
      ].join(" ")}
    >
      <span className={disabled ? "text-[#C2C7CF]" : danger ? "text-[#B42318]" : "text-[#5C5C5C]"}>
        {icon}
      </span>
      {label}
    </button>
  );
}

function MenuSeparator() {
  return <div className="my-1 h-px bg-[#F0F0F0]" aria-hidden />;
}
