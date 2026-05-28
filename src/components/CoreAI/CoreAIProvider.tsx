"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import {
  AssistantMessage,
  AssistantPhase,
  ConversationContext,
  CoreAIMessage,
  buildAssistantResponse,
  buildUserMessage,
} from "./types";

type Mode = "modal" | "modal-attachments";

interface CoreAIContextValue {
  isOpen: boolean;
  mode: Mode;
  messages: CoreAIMessage[];
  isStreaming: boolean;
  open: () => void;
  close: () => void;
  toggleMode: () => void;
  send: (text: string) => void;
  showAttachments: () => void;
  hideAttachments: () => void;
  reset: () => void;
}

const CoreAIContext = createContext<CoreAIContextValue | null>(null);

// ----- response timing knobs (ms) -----
// Core banking users need quick answers. Keep the assistant feeling alive,
// but avoid theatrical delays that make reports and charts feel slow.
const THINKING_PREVIEW = 220; // first visible status beat
const RESEARCHING_PREVIEW = 260; // short data lookup beat
const ANSWER_REVEAL = 90; // answer + chart reveal after research beat

export function CoreAIProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("modal");
  const [messages, setMessages] = useState<CoreAIMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  // Conversation context for multi-turn follow-ups.
  const ctxRef = useRef<ConversationContext>({ topic: "none" });
  // Track timers so we can clear them on reset/unmount.
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervals = useRef<ReturnType<typeof setInterval>[]>([]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggleMode = useCallback(
    () => setMode((m) => (m === "modal" ? "modal-attachments" : "modal")),
    []
  );
  const showAttachments = useCallback(() => setMode("modal-attachments"), []);
  const hideAttachments = useCallback(() => setMode("modal"), []);

  // Patch a single assistant message by id.
  const patch = useCallback(
    (id: string, updater: (m: AssistantMessage) => AssistantMessage) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.role === "assistant" && m.id === id ? updater(m) : m
        )
      );
    },
    []
  );

  const setPhase = useCallback(
    (id: string, phase: AssistantPhase) => patch(id, (m) => ({ ...m, phase })),
    [patch]
  );

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const userMsg = buildUserMessage(trimmed);
      const { message: assistantMsg, context } = buildAssistantResponse(
        trimmed,
        ctxRef.current
      );
      ctxRef.current = context;

      // Append user + assistant (assistant starts in "thinking" phase, hidden body).
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      const id = assistantMsg.id;
      const full = assistantMsg.answer.length;

      // 1) Show a short thinking preview, but reveal all curated status lines
      // quickly. This keeps the experience responsive while still explaining
      // what the assistant is doing.
      const tThinking = setTimeout(() => {
        patch(id, (m) => ({ ...m, revealedThinking: m.thinking.length }));
      }, THINKING_PREVIEW);
      timers.current.push(tThinking);

      // 2) Briefly switch to researching when a lookup/status line exists.
      const hasResearch = !!assistantMsg.researching;
      if (hasResearch) {
        const tResearch = setTimeout(() => {
          setPhase(id, "researching");
        }, THINKING_PREVIEW + RESEARCHING_PREVIEW);
        timers.current.push(tResearch);
      }

      // 3) Reveal the full answer and chart almost immediately. Avoid slow
      // typewriter effects for banking/reporting workflows.
      const tDone = setTimeout(() => {
        patch(id, (m) => ({
          ...m,
          phase: "done",
          revealedThinking: m.thinking.length,
          revealedChars: full,
        }));
        setIsStreaming(false);
        if (assistantMsg.attachments) setMode("modal-attachments");
      }, THINKING_PREVIEW + (hasResearch ? RESEARCHING_PREVIEW : 0) + ANSWER_REVEAL);
      timers.current.push(tDone);
    },
    [patch, setPhase]
  );

  const reset = useCallback(() => {
    timers.current.forEach(clearTimeout);
    intervals.current.forEach(clearInterval);
    timers.current = [];
    intervals.current = [];
    ctxRef.current = { topic: "none" };
    setMessages([]);
    setIsStreaming(false);
  }, []);

  const value = useMemo<CoreAIContextValue>(
    () => ({
      isOpen,
      mode,
      messages,
      isStreaming,
      open,
      close,
      toggleMode,
      send,
      showAttachments,
      hideAttachments,
      reset,
    }),
    [isOpen, mode, messages, isStreaming, open, close, toggleMode, send, showAttachments, hideAttachments, reset]
  );

  return (
    <CoreAIContext.Provider value={value}>{children}</CoreAIContext.Provider>
  );
}

export function useCoreAI() {
  const ctx = useContext(CoreAIContext);
  if (!ctx) throw new Error("useCoreAI must be used within a <CoreAIProvider>");
  return ctx;
}
