import { apiFetchClient } from "@/lib/api-client";
import type { CaregiverHoursSummary, CaregiverHoursFilters, CaregiverHoursPage } from "../types";

export async function fetchCaregiverHoursApi(
  filters: CaregiverHoursFilters
): Promise<CaregiverHoursPage> {
  const qs = new URLSearchParams();
  if (filters.start_date) qs.set("start_date", filters.start_date);
  if (filters.end_date) qs.set("end_date", filters.end_date);
  if (filters.caregiver_id) qs.set("caregiver_id", filters.caregiver_id);
  if (filters.page) qs.set("page", String(filters.page));
  qs.set("page_size", "365");

  return apiFetchClient<CaregiverHoursPage>(`/shifts/caregiver-hours/?${qs.toString()}`);
}

export async function fetchCaregiverHoursSummaryApi(
  startDate?: string,
  endDate?: string
): Promise<CaregiverHoursSummary | null> {
  const qs = new URLSearchParams();
  if (startDate) qs.set("start_date", startDate);
  if (endDate) qs.set("end_date", endDate);

  return apiFetchClient<CaregiverHoursSummary>(`/shifts/caregiver-hours/summary/?${qs.toString()}`);
}
