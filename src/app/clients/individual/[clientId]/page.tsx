import ClientProfilePage from "@/components/ClientProfilePage";
import { findClient } from "@/data/clients";

export default function IndividualClientDetailPage({ params }: { params: { clientId: string } }) {
  return <ClientProfilePage type="Individual" client={findClient("Individual", params.clientId)} />;
}
