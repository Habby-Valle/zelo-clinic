import { apiFetchClient } from "@/lib/api-client";
import type { SosAlert, SosFilters, SosSummary } from "../types";

interface SosAlertsListResult {
  count: number;
  results: SosAlert[];
}

export async function fetchSosAlertsApi(
  params: SosFilters
): Promise<{ alerts: SosAlert[]; total: number }> {
  const qs = new URLSearchParams();
  if (params.status && params.status !== "all") qs.set("status", params.status);
  qs.set("page", String(params.page ?? 1));
  qs.set("page_size", String(params.page_size ?? 20));
  const data = await apiFetchClient<SosAlertsListResult>(`/alerts/?${qs}`);
  return { alerts: data.results, total: data.count };
}

export async function fetchSosSummaryApi(): Promise<SosSummary> {
  const data = await apiFetchClient<SosAlertsListResult>(`/alerts/?page_size=10000`);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  return {
    active: data.results.filter((a) => a.status === "active").length,
    acknowledged: data.results.filter((a) => a.status === "acknowledged").length,
    resolvedToday: data.results.filter(
      (a) => a.status === "resolved" && a.resolved_at && a.resolved_at >= todayStart
    ).length,
  };
}

export async function acknowledgeSosAlertApi(id: string): Promise<void> {
  await apiFetchClient<void>(`/alerts/${id}/acknowledge/`, {
    method: "PATCH",
  });
}

export async function resolveSosAlertApi(id: string, resolution_reason?: string): Promise<void> {
  await apiFetchClient<void>(`/alerts/${id}/resolve/`, {
    method: "PATCH",
    body: JSON.stringify({ resolution_reason: resolution_reason ?? "" }),
  });
}
