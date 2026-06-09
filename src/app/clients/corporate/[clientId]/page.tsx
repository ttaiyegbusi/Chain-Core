import ClientProfilePage from "@/components/ClientProfilePage";
import { findClient } from "@/data/clients";

export default function CorporateClientDetailPage({ params }: { params: { clientId: string } }) {
  const client = findClient("Corporate", params.clientId);
  return <ClientProfilePage client={client} type="Corporate" missingId={params.clientId} />;
}
