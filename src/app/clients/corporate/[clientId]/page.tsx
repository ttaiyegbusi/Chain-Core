import ClientProfilePage from "@/components/ClientProfilePage";
import { findClient } from "@/data/clients";

export default function CorporateClientDetailPage({ params }: { params: { clientId: string } }) {
  return <ClientProfilePage type="Corporate" client={findClient("Corporate", params.clientId)} />;
}
