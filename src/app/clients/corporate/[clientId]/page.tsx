"use client";

import { use } from "react";
import ClientProfilePage from "@/components/ClientProfilePage";
import { findClient } from "@/data/clients";

export default function CorporateClientDetailPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params);
  return <ClientProfilePage type="Corporate" client={findClient("Corporate", clientId)} />;
}
