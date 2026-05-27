"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import {
  CoreAIMessage,
  buildAssistantResponse,
  buildUserMessage,
} from "./types";

type Mode = "modal" | "modal-attachments";

interface CoreAIContextValue {
  isOpen: boolean;
  mode: Mode;
  messages: CoreAIMessage[];
  open: () => void;
  close: () => void;
  toggleMode: () => void;
  send: (text: string) => void;
  showAttachments: () => void;
  hideAttachments: () => void;
  reset: () => void;
}

const CoreAIContext = createContext<CoreAIContextValue | null>(null);

export function CoreAIProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("modal");
  const [messages, setMessages] = useState<CoreAIMessage[]>([]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggleMode = useCallback(
    () =>
      setMode((m) => (m === "modal" ? "modal-attachments" : "modal")),
    []
  );
  const showAttachments = useCallback(() => setMode("modal-attachments"), []);
  const hideAttachments = useCallback(() => setMode("modal"), []);

  const send = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg = buildUserMessage(trimmed);
    const assistantMsg = buildAssistantResponse(trimmed);
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    // If the assistant response includes attachments, auto-show the panel
    if ("attachments" in assistantMsg && assistantMsg.attachments) {
      setMode("modal-attachments");
    }
  }, []);

  const reset = useCallback(() => setMessages([]), []);

  const value = useMemo<CoreAIContextValue>(
    () => ({
      isOpen,
      mode,
      messages,
      open,
      close,
      toggleMode,
      send,
      showAttachments,
      hideAttachments,
      reset,
    }),
    [isOpen, mode, messages, open, close, toggleMode, send, showAttachments, hideAttachments, reset]
  );

  return (
    <CoreAIContext.Provider value={value}>{children}</CoreAIContext.Provider>
  );
}

export function useCoreAI() {
  const ctx = useContext(CoreAIContext);
  if (!ctx)
    throw new Error("useCoreAI must be used within a <CoreAIProvider>");
  return ctx;
}
