"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useCarePlansForReview } from "../hooks/use-care-plans";
import { CarePlansListClient } from "./care-plans-list-client";
import { CarePlansReviewClient } from "./care-plans-review-client";

/**
 * Ponto de entrada do enfermeiro em /care-plans: havendo plano pendente de
 * revisão, abre direto a tela de curadoria; caso contrário, a listagem.
 */
export function CarePlansEntryClient() {
  const { data: pending = [], isLoading } = useCarePlansForReview();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return pending.length > 0 ? <CarePlansReviewClient /> : <CarePlansListClient />;
}
