"use client";

import ClientsListPage from "@/components/ClientsListPage";
import { PERSONS_CLIENTS } from "@/data/clients";

export default function PersonsClientsPage() {
  return (
    <ClientsListPage
      title="Persons"
      overviewTitle="Persons Overview"
      clients={PERSONS_CLIENTS}
      detailBasePath="/clients/persons"
      crumbLast="Persons"
    />
  );
}
