import { Suspense } from "react";
import { ContractDetailClient } from "@/features/contracts";

export const metadata = { title: "Detalhes do Contrato — Zelo Clinic" };

export default function ContractDetailPage() {
  return (
    <Suspense>
      <ContractDetailClient />
    </Suspense>
  );
}
