"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchComplianceListApi, fetchComplianceStatsApi } from "../services";

export function useComplianceList() {
  return useQuery({
    queryKey: ["compliance-list"],
    queryFn: fetchComplianceListApi,
  });
}

export function useComplianceStats() {
  return useQuery({
    queryKey: ["compliance-stats"],
    queryFn: fetchComplianceStatsApi,
  });
}
