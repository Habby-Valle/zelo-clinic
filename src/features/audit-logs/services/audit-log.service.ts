import { apiFetchClient } from "@/lib/api-client";
import type { AuditLog, AuditLogDetail, AuditLogFilters } from "../types";

interface AuditLogsListResult {
  count: number;
  results: AuditLog[];
}

export async function fetchAuditLogsApi(
  params: AuditLogFilters
): Promise<{ logs: AuditLog[]; total: number }> {
  const qs = new URLSearchParams();
  if (params.action) qs.set("action", params.action);
  if (params.content_type) qs.set("content_type", params.content_type);
  if (params.search) qs.set("search", params.search);
  if (params.date_from) qs.set("date_from", params.date_from);
  if (params.date_to) qs.set("date_to", params.date_to);
  qs.set("page", String(params.page ?? 1));
  qs.set("page_size", String(params.page_size ?? 20));
  const data = await apiFetchClient<AuditLogsListResult>(`/audit-logs/?${qs}`);
  return { logs: data.results, total: data.count };
}

export async function fetchAuditLogApi(id: string): Promise<AuditLogDetail> {
  return apiFetchClient<AuditLogDetail>(`/audit-logs/${id}/`);
}
