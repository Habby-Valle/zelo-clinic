import { apiFetchClient } from "@/lib/api-client";
import type {
  CaregiverOption,
  CarePlan,
  ChecklistOption,
  SaveCarePlanInput,
} from "../types";

export async function fetchCaregiverOptions(): Promise<CaregiverOption[]> {
  const data = await apiFetchClient<{
    results: { id: string; name: string; professional_register?: string | null }[];
  }>(`/users/?role=caregiver&page_size=100`);
  return (data.results ?? []).map((c) => ({
    id: String(c.id),
    name: String(c.name),
    register: c.professional_register ? String(c.professional_register) : "",
  }));
}

export async function fetchCarePlanByPatient(
  patientId: string
): Promise<CarePlan | null> {
  const data = await apiFetchClient<{ results: CarePlan[] }>(
    `/care-plans/?patient_id=${patientId}`
  );
  const plans = data.results ?? [];
  return (
    plans.find((p) => p.status === "active") ??
    plans.find((p) => p.status === "draft") ??
    plans[0] ??
    null
  );
}

export async function fetchChecklistOptions(): Promise<ChecklistOption[]> {
  const data = await apiFetchClient<{
    results: { id: string; name: string; category?: string }[];
  }>(`/checklists/?is_active=true&page_size=100`);
  return (data.results ?? []).map((c) => ({
    id: String(c.id),
    name: String(c.name),
    category: String(c.category ?? "general"),
  }));
}

export async function createCarePlan(input: SaveCarePlanInput): Promise<CarePlan> {
  return apiFetchClient<CarePlan>(`/care-plans/`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCarePlan(
  id: string,
  input: SaveCarePlanInput
): Promise<CarePlan> {
  return apiFetchClient<CarePlan>(`/care-plans/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function activateCarePlan(id: string): Promise<CarePlan> {
  return apiFetchClient<CarePlan>(`/care-plans/${id}/activate/`, {
    method: "POST",
  });
}
