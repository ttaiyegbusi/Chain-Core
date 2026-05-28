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

// ----- response pacing knobs (ms) -----
// Balanced for banking: enough status feedback to feel intelligent, but no long theatrical waits.
const THINKING_LINE_INTERVAL = 260;
const THINKING_HOLD = 180;
const RESEARCHING_HOLD = 420;
const CHART_REVEAL_DELAY = 260;
const FOLLOW_UP_REVEAL_DELAY = 220;

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
      const thinkingCount = assistantMsg.thinking.length;

      // 1) Reveal thinking lines quickly, one at a time.
      for (let i = 1; i <= thinkingCount; i++) {
        const t = setTimeout(() => {
          patch(id, (m) => ({ ...m, revealedThinking: i }));
        }, THINKING_LINE_INTERVAL * i);
        timers.current.push(t);
      }

      const afterThinking = THINKING_LINE_INTERVAL * thinkingCount + THINKING_HOLD;
      const hasResearch = !!assistantMsg.researching;
      const startAnswerAt = hasResearch
        ? afterThinking + RESEARCHING_HOLD
        : afterThinking;

      if (hasResearch) {
        const t = setTimeout(() => setPhase(id, "researching"), afterThinking);
        timers.current.push(t);
      }

      // 2) Reveal the answer in one clean fade, not character-by-character.
      // This keeps the flow natural without making reports/charts feel slow.
      const tAnswer = setTimeout(() => {
        patch(id, (m) => ({
          ...m,
          phase: "answering",
          revealedChars: assistantMsg.answer.length,
        }));
      }, startAnswerAt);
      timers.current.push(tAnswer);

      // 3) Mark done and reveal the chart shortly after the answer.
      const tChart = setTimeout(() => {
        patch(id, (m) => ({ ...m, phase: "done", showChart: !!assistantMsg.chart }));
        if (assistantMsg.attachments) setMode("modal-attachments");
      }, startAnswerAt + CHART_REVEAL_DELAY);
      timers.current.push(tChart);

      // 4) Reveal contextual follow-ups last, but still quickly.
      const tFollowUps = setTimeout(() => {
        patch(id, (m) => ({ ...m, showFollowUps: !!assistantMsg.followUps?.length }));
        setIsStreaming(false);
      }, startAnswerAt + CHART_REVEAL_DELAY + FOLLOW_UP_REVEAL_DELAY);
      timers.current.push(tFollowUps);
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
