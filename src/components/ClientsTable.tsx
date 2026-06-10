"use client";

import Link from "next/link";
import { useState } from "react";
import { MoreVertical, User2 } from "lucide-react";
import { Client, ClientStatus, ClientType } from "@/data/clients";

interface Props {
  clients: Client[];
  /** Where to link each row's name → e.g. "/clients/individual" */
  detailBasePath: string;
  /** Show the Gender + DoB columns? Hidden for Corporate / Center. */
  showPersonalColumns?: boolean;
}

function StatusPill({ status }: { status: ClientStatus }) {
  const config =
    status === "Active"
      ? { dot: "bg-emerald-500", text: "text-emerald-700" }
      : status === "Inactive"
      ? { dot: "bg-amber-500", text: "text-amber-700" }
      : { dot: "bg-red-500", text: "text-red-600" };

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-white px-2.5 py-1 text-xs font-medium">
      <span className={`h-2 w-2 rounded-full ${config.dot}`} aria-hidden />
      <span className={config.text}>{status}</span>
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  // Round avatar with the user icon as a neutral placeholder.
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-text-secondary">
      <User2 size={18} strokeWidth={1.8} aria-hidden />
    </span>
  );
}

export default function ClientsTable({
  clients,
  detailBasePath,
  showPersonalColumns = true,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const allSelected = clients.length > 0 && selected.size === clients.length;

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(clients.map((c) => c.id)));

  return (
    <div className="mt-5 overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-muted/50 text-xs font-medium text-text-secondary">
            <th className="w-10 py-3.5 pl-5">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                aria-label="Select all clients"
                className="focus-ring h-4 w-4 cursor-pointer rounded border-border-strong"
              />
            </th>
            <th className="py-3.5 pr-4 font-medium">Client Name</th>
            {showPersonalColumns && (
              <>
                <th className="py-3.5 pr-4 font-medium">Gender</th>
                <th className="py-3.5 pr-4 font-medium">Date of Birth</th>
              </>
            )}
            <th className="py-3.5 pr-4 font-medium">Phone Number</th>
            <th className="py-3.5 pr-4 font-medium">Client ID</th>
            <th className="py-3.5 pr-4 font-medium">Status</th>
            <th className="w-10 py-3.5 pr-5" />
          </tr>
        </thead>

        <tbody>
          {clients.map((c) => {
            const isSelected = selected.has(c.id);
            return (
              <tr
                key={c.id}
                className="border-b border-border last:border-b-0 transition-colors hover:bg-surface-muted/30"
              >
                <td className="py-3.5 pl-5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleOne(c.id)}
                    aria-label={`Select ${c.name}`}
                    className="focus-ring h-4 w-4 cursor-pointer rounded border-border-strong"
                  />
                </td>
                <td className="py-3.5 pr-4">
                  <Link
                    href={`${detailBasePath}/${c.id}`}
                    className="focus-ring -m-1 flex items-center gap-3 rounded-md p-1 hover:underline"
                  >
                    <Avatar name={c.name} />
                    <span className="flex min-w-0 flex-col">
                      <span className="text-sm font-medium text-text-primary">
                        {c.name}
                      </span>
                      <span className="text-xs text-text-muted">{c.email}</span>
                    </span>
                  </Link>
                </td>
                {showPersonalColumns && (
                  <>
                    <td className="py-3.5 pr-4 text-text-primary">
                      {c.gender}
                    </td>
                    <td className="py-3.5 pr-4 text-text-primary">
                      {c.dateOfBirth}
                    </td>
                  </>
                )}
                <td className="py-3.5 pr-4 text-text-primary">{c.phone}</td>
                <td className="py-3.5 pr-4 text-text-primary">{c.clientId}</td>
                <td className="py-3.5 pr-4">
                  <StatusPill status={c.status} />
                </td>
                <td className="relative py-3.5 pr-5 text-right">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenu((m) => (m === c.id ? null : c.id))
                    }
                    aria-label={`Open actions for ${c.name}`}
                    className="focus-ring inline-flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-surface-muted hover:text-text-primary"
                  >
                    <MoreVertical size={16} aria-hidden />
                  </button>
                  {openMenu === c.id && (
                    <div className="absolute right-5 top-full z-10 mt-1 w-40 rounded-lg border border-border bg-white py-1 ">
                      <Link
                        href={`${detailBasePath}/${c.id}`}
                        onClick={() => setOpenMenu(null)}
                        className="block px-3 py-2 text-sm text-text-primary hover:bg-surface-muted"
                      >
                        View Details
                      </Link>
                      <button
                        type="button"
                        onClick={() => setOpenMenu(null)}
                        className="block w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-muted"
                      >
                        Edit Client
                      </button>
                      <button
                        type="button"
                        onClick={() => setOpenMenu(null)}
                        className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        Suspend
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Reusable type filter tabs (All / Active / Inactive / Suspended). */
export function StatusTabs({
  active,
  onChange,
}: {
  active: "All" | ClientStatus;
  onChange: (next: "All" | ClientStatus) => void;
}) {
  const tabs: Array<"All" | ClientStatus> = [
    "All",
    "Active",
    "Inactive",
    "Suspended",
  ];
  return (
    <div className="mt-2 flex items-center gap-7 border-b border-border">
      {tabs.map((t) => {
        const isActive = active === t;
        return (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={[
              "focus-ring -mb-px border-b-2 pb-3 pt-2 text-sm transition-colors",
              isActive
                ? "border-primary font-medium text-text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary",
            ].join(" ")}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}
