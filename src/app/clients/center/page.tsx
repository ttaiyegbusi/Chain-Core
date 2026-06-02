"use client";

import ClientsListPage from "@/components/ClientsListPage";
import { CENTER_CLIENTS } from "@/data/clients";

export default function CenterClientsPage() {
  return (
    <ClientsListPage
      title="Centers"
      overviewTitle="Centers Overview"
      clients={CENTER_CLIENTS}
      detailBasePath="/clients/center"
      showPersonalColumns={false}
      crumbLast="Center"
    />
  );
}
