"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchReportSummaryApi,
  fetchShiftsReportApi,
  fetchChecklistsReportApi,
  fetchFamilyMembersGrowthApi,
  fetchPatientsGrowthApi,
  fetchSosReportApi,
  fetchCaregiversReportApi,
  fetchSatisfactionReportApi,
  fetchContractsReportApi,
  fetchBillingReportApi,
} from "../services";
import type { DateRange } from "../types";

export function useReportSummary() {
  return useQuery({
    queryKey: ["reports", "summary"],
    queryFn: () => fetchReportSummaryApi(),
  });
}

export function useShiftsReport(dateRange: DateRange) {
  return useQuery({
    queryKey: ["reports", "shifts", dateRange],
    queryFn: () => fetchShiftsReportApi(dateRange),
    enabled: !!dateRange.from && !!dateRange.to,
  });
}

export function useChecklistsReport(dateRange: DateRange) {
  return useQuery({
    queryKey: ["reports", "checklists", dateRange],
    queryFn: () => fetchChecklistsReportApi(dateRange),
    enabled: !!dateRange.from && !!dateRange.to,
  });
}

export function useFamilyMembersGrowthReport(months: number = 6) {
  return useQuery({
    queryKey: ["reports", "family-members-growth", months],
    queryFn: () => fetchFamilyMembersGrowthApi(months),
  });
}

export function usePatientsGrowthReport(months: number = 6) {
  return useQuery({
    queryKey: ["reports", "patients-growth", months],
    queryFn: () => fetchPatientsGrowthApi(months),
  });
}

export function useSosReport(dateRange: DateRange) {
  return useQuery({
    queryKey: ["reports", "sos", dateRange],
    queryFn: () => fetchSosReportApi(dateRange),
    enabled: !!dateRange.from && !!dateRange.to,
  });
}

export function useCaregiversReport(dateRange: DateRange) {
  return useQuery({
    queryKey: ["reports", "caregivers", dateRange],
    queryFn: () => fetchCaregiversReportApi(dateRange),
    enabled: !!dateRange.from && !!dateRange.to,
  });
}

export function useSatisfactionReport(dateRange: DateRange) {
  return useQuery({
    queryKey: ["reports", "satisfaction", dateRange],
    queryFn: () => fetchSatisfactionReportApi(dateRange),
    enabled: !!dateRange.from && !!dateRange.to,
  });
}

export function useContractsReport(months: number = 12) {
  return useQuery({
    queryKey: ["reports", "contracts", months],
    queryFn: () => fetchContractsReportApi(months),
  });
}

export function useBillingReport(months: number = 12) {
  return useQuery({
    queryKey: ["reports", "billing", months],
    queryFn: () => fetchBillingReportApi(months),
  });
}
