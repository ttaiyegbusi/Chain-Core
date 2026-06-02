import ClientProfilePage from "@/components/ClientProfilePage";
import { findClient } from "@/data/clients";

export default function CenterDetailPage({ params }: { params: { clientId: string } }) {
  return <ClientProfilePage type="Center" client={findClient("Center", params.clientId)} />;
}
