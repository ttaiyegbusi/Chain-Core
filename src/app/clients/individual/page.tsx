"use client";

import ClientsListPage from "@/components/ClientsListPage";
import { INDIVIDUAL_CLIENTS } from "@/data/clients";

export default function IndividualClientsPage() {
  return (
    <ClientsListPage
      title="Individual Clients"
      overviewTitle="Individual Clients Overview"
      clients={INDIVIDUAL_CLIENTS}
      detailBasePath="/clients/individual"
      crumbLast="Individual"
    />
  );
}
