import { apiFetchClient } from "@/lib/api-client";
import type {
  ShiftItem,
  ShiftTemplateItem,
  PatientOption,
  CaregiverOption,
  ShiftFilters,
} from "../types";

interface ListResult<T> {
  count: number;
  results: T[];
}

export async function fetchShiftsApi(
  params: ShiftFilters
): Promise<{ shifts: ShiftItem[]; total: number }> {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.status) qs.set("status", params.status);
  qs.set("page", String(params.page ?? 1));
  qs.set("page_size", String(params.page_size ?? 20));
  const data = await apiFetchClient<ListResult<ShiftItem>>(`/shifts/?${qs}`);
  return { shifts: data.results, total: data.count };
}

export async function fetchShiftApi(id: string): Promise<ShiftItem> {
  return apiFetchClient<ShiftItem>(`/shifts/${id}/`);
}

export async function fetchShiftTemplatesApi(): Promise<ShiftTemplateItem[]> {
  const data = await apiFetchClient<ListResult<ShiftTemplateItem>>(
    "/shift-templates/?page_size=100"
  );
  return data.results;
}

export async function fetchClinicPatientsApi(): Promise<PatientOption[]> {
  const data = await apiFetchClient<ListResult<Record<string, unknown>>>(
    "/patients/?page_size=100"
  );
  return data.results.map((p) => ({
    id: p.id as string,
    name: p.name as string,
    caregiver_ids:
      (p.caregiver_assignments as Array<Record<string, unknown>>)?.map(
        (a) => a.caregiver_id as string
      ) ?? [],
  }));
}

export async function fetchClinicCaregiversApi(): Promise<CaregiverOption[]> {
  const data = await apiFetchClient<ListResult<CaregiverOption>>(
    "/users/?role=caregiver&page_size=100"
  );
  return data.results;
}

export async function fetchChecklistOptionsApi(): Promise<{ id: string; name: string }[]> {
  const data = await apiFetchClient<ListResult<{ id: string; name: string }>>(
    "/checklists/?page_size=100"
  );
  return data.results;
}
