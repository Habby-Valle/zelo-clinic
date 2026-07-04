import { apiFetchClient } from "@/lib/api-client";
import type { ComplianceRecord, ComplianceStats } from "../types";

export async function fetchComplianceListApi(): Promise<ComplianceRecord[]> {
  const data = await apiFetchClient<{ count: number; results: ComplianceRecord[] }>(
    "/quality/compliance/"
  );
  return data.results ?? [];
}

export async function fetchComplianceStatsApi(): Promise<ComplianceStats[]> {
  return apiFetchClient<ComplianceStats[]>("/quality/compliance/stats/");
}
