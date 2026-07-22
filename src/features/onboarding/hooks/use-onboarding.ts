"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchOnboardingStatsApi } from "../services";

export function useOnboardingStats() {
  return useQuery({
    queryKey: ["onboarding-stats"],
    queryFn: fetchOnboardingStatsApi,
  });
}
