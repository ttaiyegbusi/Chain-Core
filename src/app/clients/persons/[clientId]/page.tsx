import ClientProfilePage from "@/components/ClientProfilePage";
import { findClient } from "@/data/clients";

export default function PersonsDetailPage({ params }: { params: { clientId: string } }) {
  return <ClientProfilePage type="Persons" client={findClient("Persons", params.clientId)} />;
}
