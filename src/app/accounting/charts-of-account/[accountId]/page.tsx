import { Suspense } from "react";
import GLDetailClient from "@/components/GLDetailClient";

export default function GLDetailPage({
  params,
}: {
  params: { accountId: string };
}) {
  return (
    <Suspense
      fallback={
        <div className="ml-[66px] p-10 text-sm text-text-muted">Loading…</div>
      }
    >
      <GLDetailClient accountId={params.accountId} />
    </Suspense>
  );
}
