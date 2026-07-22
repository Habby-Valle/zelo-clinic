import { Suspense } from "react";
import { BillingDetailClient } from "@/features/billing";

export const metadata = { title: "Detalhes da Fatura — Zelo Clinic" };

export default function BillingDetailPage() {
  return (
    <Suspense>
      <BillingDetailClient />
    </Suspense>
  );
}
