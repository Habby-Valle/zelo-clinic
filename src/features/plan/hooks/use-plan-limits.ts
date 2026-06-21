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
