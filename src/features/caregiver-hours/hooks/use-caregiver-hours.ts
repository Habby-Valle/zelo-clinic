"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCaregiverHoursApi, fetchCaregiverHoursSummaryApi } from "../services";
import type { CaregiverHoursFilters } from "../types";

export function useCaregiverHours(filters: CaregiverHoursFilters) {
  return useQuery({
    queryKey: ["caregiver-hours", filters],
    queryFn: () => fetchCaregiverHoursApi(filters),
  });
}

export function useCaregiverHoursSummary(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["caregiver-hours-summary", startDate, endDate],
    queryFn: () => fetchCaregiverHoursSummaryApi(startDate, endDate),
  });
}
