import { useQuery } from "@tanstack/react-query";
import { fetchPlanLimits } from "@/features/plan/services/plan-limits.service";

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
