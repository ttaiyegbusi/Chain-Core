import ClientProfilePage from "@/components/ClientProfilePage";
import { findClient } from "@/data/clients";

export default function PersonClientDetailPage({ params }: { params: { clientId: string } }) {
  const client = findClient("Persons", params.clientId);
  return <ClientProfilePage client={client} type="Persons" missingId={params.clientId} />;
}
