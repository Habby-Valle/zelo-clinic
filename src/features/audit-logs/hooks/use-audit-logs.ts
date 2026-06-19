"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAuditLogsApi, fetchAuditLogApi } from "../services";
import type { AuditLogFilters } from "../types";

export function useAuditLogs(params: AuditLogFilters) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () => fetchAuditLogsApi(params),
  });
}

export function useAuditLog(id: string) {
  return useQuery({
    queryKey: ["audit-logs", id],
    queryFn: () => fetchAuditLogApi(id),
    enabled: !!id,
  });
}
