import { apiFetchClient } from "@/lib/api-client";
import type {
  BillingReportData,
  ClinicReportSummary,
  ContractsReportData,
  FamilyMembersGrowthData,
  ShiftsReportData,
  ChecklistsReportData,
  PatientsGrowthData,
  SosReportData,
  CaregiverReportData,
  SatisfactionReportData,
  DateRange,
} from "../types";

export async function fetchReportSummaryApi(): Promise<ClinicReportSummary> {
  return apiFetchClient<ClinicReportSummary>("/reports/summary/");
}

export async function fetchShiftsReportApi(dateRange: DateRange): Promise<ShiftsReportData[]> {
  const qs = new URLSearchParams();
  qs.set("date_from", dateRange.from);
  qs.set("date_to", dateRange.to);
  return apiFetchClient<ShiftsReportData[]>(`/reports/shifts/?${qs}`);
}

export async function fetchChecklistsReportApi(
  dateRange: DateRange
): Promise<ChecklistsReportData[]> {
  const qs = new URLSearchParams();
  qs.set("date_from", dateRange.from);
  qs.set("date_to", dateRange.to);
  return apiFetchClient<ChecklistsReportData[]>(`/reports/checklists/?${qs}`);
}

export async function fetchFamilyMembersGrowthApi(
  months: number = 6
): Promise<FamilyMembersGrowthData[]> {
  const qs = new URLSearchParams();
  qs.set("months", String(months));
  return apiFetchClient<FamilyMembersGrowthData[]>(`/reports/family-members-growth/?${qs}`);
}

export async function fetchPatientsGrowthApi(months: number = 6): Promise<PatientsGrowthData[]> {
  const qs = new URLSearchParams();
  qs.set("months", String(months));
  return apiFetchClient<PatientsGrowthData[]>(`/reports/patients-growth/?${qs}`);
}

export async function fetchSosReportApi(dateRange: DateRange): Promise<SosReportData> {
  const qs = new URLSearchParams();
  qs.set("date_from", dateRange.from);
  qs.set("date_to", dateRange.to);
  return apiFetchClient<SosReportData>(`/reports/sos/?${qs}`);
}

export async function fetchCaregiversReportApi(
  dateRange: DateRange
): Promise<CaregiverReportData[]> {
  const qs = new URLSearchParams();
  qs.set("date_from", dateRange.from);
  qs.set("date_to", dateRange.to);
  return apiFetchClient<CaregiverReportData[]>(`/reports/caregivers/?${qs}`);
}

export async function fetchSatisfactionReportApi(
  dateRange: DateRange
): Promise<SatisfactionReportData> {
  const qs = new URLSearchParams();
  qs.set("date_from", dateRange.from);
  qs.set("date_to", dateRange.to);
  return apiFetchClient<SatisfactionReportData>(`/reports/satisfaction/?${qs}`);
}

export async function fetchContractsReportApi(
  months: number = 12
): Promise<ContractsReportData> {
  const qs = new URLSearchParams();
  qs.set("months", String(months));
  return apiFetchClient<ContractsReportData>(`/reports/contracts/?${qs}`);
}

export async function fetchBillingReportApi(
  months: number = 12
): Promise<BillingReportData> {
  const qs = new URLSearchParams();
  qs.set("months", String(months));
  return apiFetchClient<BillingReportData>(`/reports/billing/?${qs}`);
}
