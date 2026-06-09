import ClientProfilePage from "@/components/ClientProfilePage";
import { findClient } from "@/data/clients";

export default function CenterClientDetailPage({ params }: { params: { clientId: string } }) {
  const client = findClient("Center", params.clientId);
  return <ClientProfilePage client={client} type="Center" missingId={params.clientId} />;
}
