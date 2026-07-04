import { apiFetchClient } from "@/lib/api-client";
import type {
  CaregiverMatchResult,
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

export async function fetchCarePlanByPatient(patientId: string): Promise<CarePlan | null> {
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
    results: {
      id: string;
      name: string;
      category?: string;
      items?: { id: string; name: string; type: string; required: boolean }[];
    }[];
  }>(`/checklists/?is_active=true&page_size=100`);
  return (data.results ?? []).map((c) => ({
    id: String(c.id),
    name: String(c.name),
    category: String(c.category ?? "general"),
    items: (c.items ?? []).map((it) => ({
      id: String(it.id),
      name: String(it.name),
      type: String(it.type),
      required: Boolean(it.required),
    })),
  }));
}

export async function createCarePlan(input: SaveCarePlanInput): Promise<CarePlan> {
  return apiFetchClient<CarePlan>(`/care-plans/`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCarePlan(id: string, input: SaveCarePlanInput): Promise<CarePlan> {
  return apiFetchClient<CarePlan>(`/care-plans/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function fetchCarePlansForReview(): Promise<CarePlan[]> {
  const data = await apiFetchClient<{ results: CarePlan[] }>(`/care-plans/?status=pending_review`);
  return data.results ?? [];
}

export async function fetchActiveCarePlans(): Promise<CarePlan[]> {
  const data = await apiFetchClient<{ results: CarePlan[] }>(`/care-plans/?status=active`);
  return data.results ?? [];
}

export async function submitCarePlan(id: string): Promise<CarePlan> {
  return apiFetchClient<CarePlan>(`/care-plans/${id}/submit/`, { method: "POST" });
}

export async function updateCarePlanChecklists(
  id: string,
  checklistIds: string[]
): Promise<CarePlan> {
  return apiFetchClient<CarePlan>(`/care-plans/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({
      checklists: checklistIds.map((cid) => ({ checklist_id: cid })),
    }),
  });
}

export async function fetchCaregiverMatch(patientId: string): Promise<CaregiverMatchResult[]> {
  return apiFetchClient<CaregiverMatchResult[]>(
    `/api/ai/caregiver-match/?patient_id=${patientId}&use_ai=true`
  );
}

export async function approveCarePlan(id: string): Promise<CarePlan> {
  return apiFetchClient<CarePlan>(`/care-plans/${id}/approve/`, { method: "POST" });
}

export async function returnCarePlan(id: string, note: string): Promise<CarePlan> {
  return apiFetchClient<CarePlan>(`/care-plans/${id}/return/`, {
    method: "POST",
    body: JSON.stringify({ note }),
  });
}
