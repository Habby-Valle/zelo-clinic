import { apiFetchClient } from "@/lib/api-client";
import type { ClinicOnboardingStats } from "../types";

export async function fetchOnboardingStatsApi(): Promise<ClinicOnboardingStats> {
  return apiFetchClient<ClinicOnboardingStats>("/onboarding/clinic-stats/");
}
