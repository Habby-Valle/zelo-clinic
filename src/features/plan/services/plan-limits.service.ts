import { apiFetchClient } from "@/lib/api-client";
import type { PlanLimitsInfo } from "@/features/plan/types";

export async function fetchPlanLimits(): Promise<PlanLimitsInfo> {
  return apiFetchClient<PlanLimitsInfo>("/subscriptions/me/limits/");
}
