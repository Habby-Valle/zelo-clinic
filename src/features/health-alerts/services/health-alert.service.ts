import { apiFetchClient } from "@/lib/api-client";
import type { HealthAlert, HealthAlertFilters } from "../types";

export async function fetchHealthAlertsApi(
  filters: HealthAlertFilters
): Promise<HealthAlert[]> {
  const qs = new URLSearchParams();
  if (filters.patient_id) qs.set("patient_id", filters.patient_id);
  if (filters.severity) qs.set("severity", filters.severity);
  if (filters.status) qs.set("status", filters.status);
  if (filters.alert_type) qs.set("alert_type", filters.alert_type);
  if (filters.days) qs.set("days", String(filters.days));

  return apiFetchClient<HealthAlert[]>(
    `/api/ai/health-alerts/?${qs.toString()}`
  );
}

export async function acknowledgeHealthAlertApi(id: string): Promise<void> {
  await apiFetchClient<void>(
    `/api/ai/health-alerts/${id}/acknowledge/`,
    { method: "POST" }
  );
}

export async function resolveHealthAlertApi(id: string): Promise<void> {
  await apiFetchClient<void>(
    `/api/ai/health-alerts/${id}/resolve/`,
    { method: "POST" }
  );
}
