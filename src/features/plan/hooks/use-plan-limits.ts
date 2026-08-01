import { useQuery } from "@tanstack/react-query";
import { fetchPlanLimits } from "@/features/plan/services/plan-limits.service";
import type { PlanLimits } from "@/features/plan/types";

export function usePlanLimits() {
  return useQuery({
    queryKey: ["plan", "limits"],
    queryFn: fetchPlanLimits,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

/** True quando a clínica está sem plano ativo (modo somente leitura). */
export function usePlanBlocked() {
  const { data } = usePlanLimits();
  const effective = data?.effective_status;
  return effective === "expired";
}

/**
 * Retorna true quando a clínica tem o recurso de plano habilitado.
 * Flags ausentes (undefined) são tratadas como bloqueadas (fail-closed).
 */
export function usePlanFeature(feature: keyof PlanLimits) {
  const { data } = usePlanLimits();
  const value = data?.limits?.[feature];
  return value === true;
}
