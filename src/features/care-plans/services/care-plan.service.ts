import { apiFetchClient } from "@/lib/api-client";
import type {
  CaregiverMatchResult,
  CaregiverOption,
  CarePlan,
  CarePlanChecklistItem,
  CarePlanGoal,
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

function mapChecklistItem(item: Record<string, unknown>): CarePlanChecklistItem {
  return {
    id: String(item.id),
    name: String(item.name),
    type: String(item.type),
    required: Boolean(item.required),
    has_observation: Boolean(item.has_observation ?? false),
    unit: String(item.unit ?? ""),
    expected_min: item.expected_min != null ? Number(item.expected_min) : null,
    expected_max: item.expected_max != null ? Number(item.expected_max) : null,
    target_value: item.target_value != null ? Number(item.target_value) : null,
    alert_severity: String(item.alert_severity ?? ""),
    criticality: String(item.criticality ?? "medium"),
    instructions: String(item.instructions ?? ""),
    requires_photo: Boolean(item.requires_photo ?? false),
    frequency: String(item.frequency ?? "per_shift"),
    scheduled_times: Array.isArray(item.scheduled_times) ? item.scheduled_times : [],
  };
}

export async function fetchCarePlanByPatient(patientId: string): Promise<CarePlan | null> {
  const data = await apiFetchClient<{ results: Record<string, unknown>[] }>(
    `/care-plans/?patient_id=${patientId}`
  );
  const plans = data.results ?? [];
  const raw = (
    plans.find((p) => p.status === "active") ??
    plans.find((p) => p.status === "draft") ??
    plans[0] ??
    null
  ) as Record<string, unknown> | null;
  if (!raw) return null;
  return {
    id: String(raw.id),
    patient_id: String(raw.patient_id),
    patient_name: String(raw.patient_name ?? ""),
    patient_health_status: String(raw.patient_health_status ?? ""),
    status: raw.status as CarePlan["status"],
    status_display: String(raw.status_display ?? ""),
    responsible_name: String(raw.responsible_name ?? ""),
    responsible_register: String(raw.responsible_register ?? ""),
    approved_by_name: raw.approved_by_name ? String(raw.approved_by_name) : null,
    approved_at: raw.approved_at ? String(raw.approved_at) : null,
    review_note: String(raw.review_note ?? ""),
    notes: String(raw.notes ?? ""),
    checklists: ((raw.checklists as Record<string, unknown>[]) ?? []).map((cl) => ({
      id: String(cl.id),
      checklist_id: String(cl.checklist_id),
      checklist_name: String(cl.checklist_name ?? ""),
      checklist_category: String(cl.checklist_category ?? ""),
      checklist_items: ((cl.checklist_items as Record<string, unknown>[]) ?? []).map(mapChecklistItem),
      frequency: String(cl.frequency ?? ""),
      order: Number(cl.order ?? 0),
      overrides: ((cl.overrides as Record<string, unknown>[]) ?? []).map((ov) => ({
        item_id: String(ov.item_id ?? ov.item),
        is_active: ov.is_active != null ? Boolean(ov.is_active) : true,
        scheduled_times: Array.isArray(ov.scheduled_times) ? ov.scheduled_times : null,
        expected_min: ov.expected_min != null ? Number(ov.expected_min) : null,
        expected_max: ov.expected_max != null ? Number(ov.expected_max) : null,
      })),
    })),
    goals: mapGoals(raw.goals),
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
  };
}

export async function fetchChecklistOptions(): Promise<ChecklistOption[]> {
  const data = await apiFetchClient<{
    results: {
      id: string;
      name: string;
      category?: string;
      items?: Record<string, unknown>[];
    }[];
  }>(`/checklists/?is_active=true&page_size=100`);
  return (data.results ?? []).map((c) => ({
    id: String(c.id),
    name: String(c.name),
    category: String(c.category ?? "general"),
    items: (c.items ?? []).map(mapChecklistItem),
  }));
}

export async function createCarePlan(input: SaveCarePlanInput): Promise<CarePlan> {
  const raw = await apiFetchClient<Record<string, unknown>>(`/care-plans/`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return mapCarePlan(raw);
}

export async function updateCarePlan(id: string, input: SaveCarePlanInput): Promise<CarePlan> {
  const raw = await apiFetchClient<Record<string, unknown>>(`/care-plans/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return mapCarePlan(raw);
}

function mapGoals(raw: unknown): CarePlanGoal[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((g: Record<string, unknown>) => ({
    id: String(g.id),
    description: String(g.description ?? ""),
    target_metric: String(g.target_metric ?? ""),
    order: Number(g.order ?? 0),
  }));
}

function mapCarePlan(raw: Record<string, unknown>): CarePlan {
  return {
    id: String(raw.id),
    patient_id: String(raw.patient_id),
    patient_name: String(raw.patient_name ?? ""),
    patient_health_status: String(raw.patient_health_status ?? ""),
    status: raw.status as CarePlan["status"],
    status_display: String(raw.status_display ?? ""),
    responsible_name: String(raw.responsible_name ?? ""),
    responsible_register: String(raw.responsible_register ?? ""),
    approved_by_name: raw.approved_by_name ? String(raw.approved_by_name) : null,
    approved_at: raw.approved_at ? String(raw.approved_at) : null,
    review_note: String(raw.review_note ?? ""),
    notes: String(raw.notes ?? ""),
    checklists: ((raw.checklists as Record<string, unknown>[]) ?? []).map((cl) => ({
      id: String(cl.id),
      checklist_id: String(cl.checklist_id),
      checklist_name: String(cl.checklist_name ?? ""),
      checklist_category: String(cl.checklist_category ?? ""),
      checklist_items: ((cl.checklist_items as Record<string, unknown>[]) ?? []).map(mapChecklistItem),
      frequency: String(cl.frequency ?? ""),
      order: Number(cl.order ?? 0),
      overrides: ((cl.overrides as Record<string, unknown>[]) ?? []).map((ov) => ({
        item_id: String(ov.item_id ?? ov.item),
        is_active: ov.is_active != null ? Boolean(ov.is_active) : true,
        scheduled_times: Array.isArray(ov.scheduled_times) ? ov.scheduled_times : null,
        expected_min: ov.expected_min != null ? Number(ov.expected_min) : null,
        expected_max: ov.expected_max != null ? Number(ov.expected_max) : null,
      })),
    })),
    goals: mapGoals(raw.goals),
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
  };
}

export async function fetchCarePlans(params?: {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ plans: CarePlan[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("page_size", String(params.pageSize));
  const qs = query.toString();
  const data = await apiFetchClient<{ count: number; results: Record<string, unknown>[] }>(
    `/care-plans/${qs ? `?${qs}` : ""}`
  );
  return {
    plans: (data.results ?? []).map(mapCarePlan),
    total: data.count ?? 0,
  };
}

export async function fetchCarePlansForReview(): Promise<CarePlan[]> {
  const data = await apiFetchClient<{ results: Record<string, unknown>[] }>(`/care-plans/?status=pending_review`);
  return (data.results ?? []).map(mapCarePlan);
}

export async function fetchActiveCarePlans(): Promise<CarePlan[]> {
  const data = await apiFetchClient<{ results: Record<string, unknown>[] }>(`/care-plans/?status=active`);
  return (data.results ?? []).map(mapCarePlan);
}

export async function submitCarePlan(id: string): Promise<CarePlan> {
  const raw = await apiFetchClient<Record<string, unknown>>(`/care-plans/${id}/submit/`, { method: "POST" });
  return mapCarePlan(raw);
}

export async function updateCarePlanChecklists(
  id: string,
  checklistIds: string[]
): Promise<CarePlan> {
  const raw = await apiFetchClient<Record<string, unknown>>(`/care-plans/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({
      checklists: checklistIds.map((cid) => ({ checklist_id: cid })),
    }),
  });
  return mapCarePlan(raw);
}

export async function fetchChecklistSuggestions(
  patientId: string
): Promise<{ categories: string[]; suggestions: ChecklistOption[] }> {
  const data = await apiFetchClient<{
    categories: string[];
    suggestions: Record<string, unknown>[];
  }>(`/patients/${patientId}/checklist-suggestions/`);
  return {
    categories: data.categories ?? [],
    suggestions: (data.suggestions ?? []).map((cl) => ({
      id: String(cl.id),
      name: String(cl.name),
      category: String(cl.category ?? "general"),
      items: ((cl.items as Record<string, unknown>[]) ?? []).map(mapChecklistItem),
    })),
  };
}

export async function fetchCaregiverMatch(patientId: string): Promise<CaregiverMatchResult[]> {
  return apiFetchClient<CaregiverMatchResult[]>(
    `/api/ai/caregiver-match/?patient_id=${patientId}&use_ai=true`
  );
}

export async function approveCarePlan(id: string): Promise<CarePlan> {
  const raw = await apiFetchClient<Record<string, unknown>>(`/care-plans/${id}/approve/`, { method: "POST" });
  return mapCarePlan(raw);
}

export async function returnCarePlan(id: string, note: string): Promise<CarePlan> {
  const raw = await apiFetchClient<Record<string, unknown>>(`/care-plans/${id}/return/`, {
    method: "POST",
    body: JSON.stringify({ note }),
  });
  return mapCarePlan(raw);
}
