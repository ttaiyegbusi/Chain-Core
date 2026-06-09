import ClientProfilePage from "@/components/ClientProfilePage";
import { findClient } from "@/data/clients";

export default function IndividualClientDetailPage({ params }: { params: { clientId: string } }) {
  const client = findClient("Individual", params.clientId);
  return <ClientProfilePage client={client} type="Individual" missingId={params.clientId} />;
}
