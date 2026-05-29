"use client";

import { useState } from "react";
import { X, FileText, Link2, Image as ImageIcon } from "lucide-react";
import { Attachments } from "./types";

type TabKey = "All" | "Documents" | "Links" | "Images";
const TABS: TabKey[] = ["All", "Documents", "Links", "Images"];

export default function AttachmentsPanel({
  attachments,
  onClose,
}: {
  attachments: Attachments;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<TabKey>("All");

  const showDocs = tab === "All" || tab === "Documents";
  const showLinks = tab === "All" || tab === "Links";
  const showImages = tab === "All" || tab === "Images";

  return (
    <aside
      className="coreai-attachments-enter flex h-full w-[380px] shrink-0 flex-col border-l border-border bg-white"
      aria-label="Attachments"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pb-3 pt-5">
        <h2 className="text-base font-semibold text-text-primary">
          Attachments
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close attachments"
          className="focus-ring flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-text-secondary hover:bg-border"
        >
          <X size={14} aria-hidden />
        </button>
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label="Attachment categories" className="flex gap-5 px-5">
        {TABS.map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t)}
              className={[
                "focus-ring py-2 text-sm transition-colors",
                active
                  ? "font-medium text-text-primary"
                  : "text-text-muted hover:text-text-secondary",
              ].join(" ")}
            >
              {t}
            </button>
          );
        })}
      </div>
      <div className="border-b border-border" />

      {/* Body */}
      <div className="flex-1 space-y-7 overflow-y-auto px-5 py-5">
        {showDocs && (
          <Section title="Documents">
            <div className="grid grid-cols-2 gap-3">
              {attachments.documents.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  title={d.name}
                  className="focus-ring flex aspect-square items-center justify-center rounded-lg bg-surface-muted text-text-muted hover:bg-border"
                  aria-label={d.name}
                >
                  <FileText size={32} aria-hidden />
                </button>
              ))}
            </div>
          </Section>
        )}

        {showLinks && (
          <Section title="Links">
            <ul className="space-y-2">
              {attachments.links.map((l) => (
                <li key={l.id}>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="focus-ring flex items-center gap-2 rounded-md text-sm text-text-secondary hover:text-primary"
                  >
                    <Link2 size={14} aria-hidden />
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {showImages && (
          <Section title="Images">
            <div className="grid grid-cols-2 gap-3">
              {attachments.images.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  title={i.name}
                  className="focus-ring flex aspect-square items-center justify-center rounded-lg bg-surface-muted text-text-muted hover:bg-border"
                  aria-label={i.name}
                >
                  <ImageIcon size={32} aria-hidden />
                </button>
              ))}
            </div>
          </Section>
        )}
      </div>
    </aside>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-medium text-text-primary">{title}</h3>
      {children}
    </section>
  );
}
