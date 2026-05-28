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

// ----- streaming timing knobs (ms) -----
const THINKING_LINE_INTERVAL = 700; // gap between each thinking line appearing
const THINKING_HOLD = 500; // pause after last line before researching
const RESEARCHING_HOLD = 900; // time spent in "researching" before answering
const TYPE_TICK = 14; // ms per character reveal
const TYPE_CHARS_PER_TICK = 3; // characters revealed per tick

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

      // 1) Reveal thinking lines one at a time.
      for (let i = 1; i <= thinkingCount; i++) {
        const t = setTimeout(() => {
          patch(id, (m) => ({ ...m, revealedThinking: i }));
        }, THINKING_LINE_INTERVAL * i);
        timers.current.push(t);
      }

      const afterThinking = THINKING_LINE_INTERVAL * thinkingCount + THINKING_HOLD;

      // 2) Move to researching (or straight to answering if no research line).
      const hasResearch = !!assistantMsg.researching;
      const startAnswerAt = hasResearch
        ? afterThinking + RESEARCHING_HOLD
        : afterThinking;

      if (hasResearch) {
        const t = setTimeout(() => setPhase(id, "researching"), afterThinking);
        timers.current.push(t);
      }

      // 3) Begin answering — type the answer out.
      const tStart = setTimeout(() => {
        setPhase(id, "answering");
        const full = assistantMsg.answer.length;
        const iv = setInterval(() => {
          let finished = false;
          patch(id, (m) => {
            const next = Math.min(m.revealedChars + TYPE_CHARS_PER_TICK, full);
            if (next >= full) finished = true;
            return { ...m, revealedChars: next };
          });
          if (finished) {
            clearInterval(iv);
            // 4) Done — reveal chart/attachments, stop streaming.
            const tDone = setTimeout(() => {
              patch(id, (m) => ({ ...m, phase: "done", revealedChars: full }));
              setIsStreaming(false);
              if (assistantMsg.attachments) setMode("modal-attachments");
            }, 120);
            timers.current.push(tDone);
          }
        }, TYPE_TICK);
        intervals.current.push(iv);
      }, startAnswerAt);
      timers.current.push(tStart);
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
