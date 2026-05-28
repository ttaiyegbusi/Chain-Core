"use client";

import { X, Check } from "lucide-react";
import { useEffect, useRef } from "react";

export default function SuccessModal({
  open,
  onClose,
  onOkay,
  title = "New General Ledger Created",
  body = "You have successfully created a new general ledger. Go to the Charts of Account section to see your new ledger.",
}: {
  open: boolean;
  onClose: () => void;
  onOkay: () => void;
  title?: string;
  body?: string;
}) {
  const okayRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    okayRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        // simple focus trap within the modal card
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
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-[#0E121B]/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />

      {/* Card */}
      <div
        ref={cardRef}
        className="relative z-10 w-[420px] max-w-[92vw] cc-modal-panel px-8 pb-8 pt-7"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="focus-ring absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-bg-sub text-text-secondary hover:bg-border"
        >
          <X size={16} aria-hidden />
        </button>

        <div className="flex flex-col items-center pt-8 text-center">
          <div className="mb-6 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-primary">
            <Check size={28} strokeWidth={3} className="text-white" aria-hidden />
          </div>

          <h2
            id="success-title"
            className="text-2xl font-bold text-text-primary"
          >
            {title}
          </h2>

          <p className="mt-3 px-2 text-sm leading-relaxed text-text-secondary">
            {body}
          </p>

          <button
            ref={okayRef}
            type="button"
            onClick={onOkay}
            className="cc-btn-primary mt-7 h-[46px] w-full"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
}
