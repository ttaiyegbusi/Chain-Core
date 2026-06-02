"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import PrimaryRail from "@/components/PrimaryRail";
import ClientsSidebar from "@/components/ClientsSidebar";
import GlobalHeader from "@/components/GlobalHeader";
import { findClient } from "@/data/clients";

export default function PersonsDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = use(params);
  const client = findClient("Persons", clientId);

  return (
    <div className="min-h-screen bg-white">
      <PrimaryRail />
      <ClientsSidebar menuLabel="SUB MENU" />
      <main className="ml-[316px]">
        <GlobalHeader title="Persons" />
        <section className="px-10 pb-10 pt-6">
          <Link
            href="/clients/persons"
            className="focus-ring inline-flex items-center gap-1 rounded-md text-sm text-text-secondary hover:text-text-primary"
          >
            <ChevronLeft size={16} aria-hidden />
            Go Back
          </Link>
          <div className="mt-2 text-xs text-text-muted">
            <Link href="/clients/persons">Clients</Link>
            <span className="mx-1.5">/</span>
            <Link href="/clients/persons">Persons</Link>
            <span className="mx-1.5">/</span>
            <span className="text-primary">{client?.name ?? clientId}</span>
          </div>
          <div className="mt-10 rounded-lg border border-dashed border-border bg-surface-muted/30 p-12 text-center">
            <h2 className="text-base font-semibold text-text-primary">
              {client?.name ?? "Person"}
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Persons detail page is not yet built.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
