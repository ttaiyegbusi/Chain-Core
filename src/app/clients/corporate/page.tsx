"use client";

import ClientsListPage from "@/components/ClientsListPage";
import { CORPORATE_CLIENTS } from "@/data/clients";

export default function CorporateClientsPage() {
  return (
    <ClientsListPage
      title="Corporate Clients"
      overviewTitle="Corporate Clients Overview"
      clients={CORPORATE_CLIENTS}
      detailBasePath="/clients/corporate"
      showPersonalColumns={false}
      crumbLast="Corporate"
    />
  );
}
