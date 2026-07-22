import { Suspense } from "react";
import { BillingListClient } from "@/features/billing";

export const metadata = { title: "Faturas — Zelo Clinic" };

export default function BillingPage() {
  return (
    <Suspense>
      <BillingListClient />
    </Suspense>
  );
}
