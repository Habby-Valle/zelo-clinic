"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCostReportApi } from "../services";
import type { CostReportFilters } from "../types";

export function useCostReport(filters: CostReportFilters) {
  return useQuery({
    queryKey: ["cost-report", filters],
    queryFn: () => fetchCostReportApi(filters),
    enabled: !!filters.date_from && !!filters.date_to,
  });
}
