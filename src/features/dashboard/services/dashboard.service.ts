import { apiFetchServer } from "@/lib/api";
import type { DashboardResponse, RecentShift, ShiftsListResponse } from "../types";

export async function fetchDashboard(): Promise<DashboardResponse> {
  return apiFetchServer<DashboardResponse>("/dashboard/");
}

export async function fetchRecentShifts(): Promise<RecentShift[]> {
  try {
    const data = await apiFetchServer<ShiftsListResponse>("/shifts/?ordering=-start&page_size=5");
    return (data.results ?? []).map((s) => ({
      id: s.id,
      caregiver_name: s.caregiver_name,
      started_at: s.start,
      ended_at: s.end,
      status: s.status,
      patient_name: s.shift_patients?.[0]?.patient_name ?? null,
    }));
  } catch {
    return [];
  }
}
