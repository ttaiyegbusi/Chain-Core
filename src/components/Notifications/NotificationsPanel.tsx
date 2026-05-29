"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useNotifications } from "./NotificationsProvider";
import {
  NOTIFICATIONS,
  NotificationItem,
  UNREAD_COUNT,
} from "@/data/notifications";

/**
 * Notifications floating right-side panel.
 *
 * Matches the Figma spec exactly:
 *  - 392px wide, ~700px tall, floating with soft offset shadows
 *  - "Notifications" header + close button (square, F7F7F7 fill)
 *  - All / Unread [ N ] segmented tabs
 *  - Groups: Today / Yesterday / Last 7 days
 *  - Each row: 24px square initial avatar, name (Medium 12px),
 *    "New Comment · Design Team" meta with a tiny dot separator,
 *    body text, right-aligned timestamp
 *  - Page behind stays visible (no backdrop), same as Core AI panel.
 *  - Smooth ~420ms open/close on opacity + translate-X.
 */
export default function NotificationsPanel() {
  const { isOpen, close } = useNotifications();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState<"all" | "unread">("all");

  // Two-step mount so the open transition animates from off-screen.
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const r = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(r);
    } else if (mounted) {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 240);
      return () => clearTimeout(t);
    }
  }, [isOpen, mounted]);

  // ESC closes.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  if (!mounted) return null;

  const groups = NOTIFICATIONS.map((g) => ({
    ...g,
    items: tab === "unread" ? g.items.filter((i) => i.unread) : g.items,
  })).filter((g) => g.items.length > 0);

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="notif-title"
      style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
      className={[
        "fixed right-5 top-[86px] z-40 flex h-[700px] w-[392px] max-w-[calc(100vw-40px)] flex-col",
        "rounded-[12px] border border-[#EBEBEB] bg-white",
        // The two soft offset shadows from the spec.
        "shadow-[0px_-1.944px_65.139px_0px_rgba(0,0,0,0.07),0px_-0.243px_8.156px_0px_rgba(0,0,0,0.04)]",
        "transition-[opacity,transform] duration-[420ms]",
        visible
          ? "translate-x-0 opacity-100"
          : "translate-x-3 opacity-0 pointer-events-none",
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5">
        <h2
          id="notif-title"
          className="text-[14px] font-normal text-[#171717]"
          style={{ letterSpacing: "0" }}
        >
          Notifications
        </h2>
        <button
          type="button"
          onClick={close}
          aria-label="Close notifications"
          className="focus-ring flex h-8 w-8 items-center justify-center rounded-[3.2px] border border-[#EBEBEB] bg-[#F7F7F7] text-[#5C5C5C] transition-colors hover:bg-[#EFEFEF]"
        >
          <X size={16} aria-hidden />
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-3 flex gap-2 px-5">
        <button
          type="button"
          onClick={() => setTab("all")}
          aria-pressed={tab === "all"}
          className={[
            "focus-ring h-8 rounded-[8px] border border-[#EBEBEB] px-3 text-[12px] leading-[1.4] transition-colors",
            tab === "all"
              ? "bg-[#F7F7F7] text-[#5C5C5C]"
              : "bg-white text-[#5C5C5C] hover:bg-[#FAFAFA]",
          ].join(" ")}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setTab("unread")}
          aria-pressed={tab === "unread"}
          className={[
            "focus-ring h-8 rounded-[8px] border border-[#EBEBEB] px-3 text-[12px] leading-[1.4] transition-colors",
            tab === "unread"
              ? "bg-[#F7F7F7] text-[#5C5C5C]"
              : "bg-white text-[#5C5C5C] hover:bg-[#FAFAFA]",
          ].join(" ")}
        >
          Unread [ {UNREAD_COUNT} ]
        </button>
      </div>

      {/* List */}
      <div className="mt-5 flex-1 overflow-y-auto px-5 pb-5">
        {groups.length === 0 ? (
          <p className="mt-8 text-center text-[12px] text-[#A3A3A3]">
            No notifications.
          </p>
        ) : (
          groups.map((g) => (
            <section key={g.group} className="mb-5">
              <p
                className="mb-3 text-[10px] uppercase text-[#A3A3A3]"
                style={{ letterSpacing: "0.04em" }}
              >
                {g.group}
              </p>
              <ul className="flex flex-col gap-4">
                {g.items.map((item) => (
                  <NotificationRow key={item.id} item={item} />
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

function NotificationRow({ item }: { item: NotificationItem }) {
  return (
    <li className="flex gap-3">
      {/* Square initial avatar (24px) */}
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[3px] border border-[#EBEBEB] bg-[#F7F7F7]">
        <span className="font-mono text-[12px] leading-none text-[#171717]">
          {item.initial}
        </span>
      </div>

      {/* Body column */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p
          className="truncate text-[12px] font-medium text-[#171717]"
          style={{ letterSpacing: "0.04em" }}
        >
          {item.name}
        </p>
        <div className="flex items-center gap-1.5 text-[12px] text-[#7C7C7C]">
          <span className="truncate">{item.category}</span>
          <span
            aria-hidden
            className="h-1 w-1 shrink-0 rounded-full bg-[#A3A3A3]"
          />
          <span className="truncate">{item.source}</span>
        </div>
        <p className="text-[12px] leading-[1.5] text-[#7C7C7C]">{item.body}</p>
      </div>

      {/* Timestamp */}
      <p className="shrink-0 text-right text-[12px] text-[#A3A3A3]">
        {item.timestamp}
      </p>
    </li>
  );
}
