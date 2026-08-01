import { apiFetchClient } from "@/lib/api-client";
import type { CostReportData, CostReportFilters } from "../types";

export async function fetchCostReportApi(filters: CostReportFilters): Promise<CostReportData> {
  const qs = new URLSearchParams();
  qs.set("date_from", filters.date_from);
  qs.set("date_to", filters.date_to);
  return apiFetchClient<CostReportData>(`/reports/costs/?${qs.toString()}`);
}
