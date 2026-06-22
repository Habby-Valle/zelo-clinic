import { apiFetchClient } from "@/lib/api-client";
import type {
  Checklist,
  ChecklistDetail,
  ChecklistItemType,
  ChecklistFilters,
} from "@/features/checklists/types";

interface ApiChecklist {
  id: string;
  name: string;
  icon: string | null;
  order: number;
  is_active: boolean;
  clinic_id: string | null;
  clinic_name: string | null;
  created_by_name: string | null;
  items_count: number;
  created_at: string;
}

interface ApiChecklistDetail extends Omit<ApiChecklist, "items_count"> {
  items: {
    id: string;
    name: string;
    type: string;
    required: boolean;
    has_observation: boolean;
    order: number;
    options: { id: string; label: string; value: string }[];
  }[];
}

interface PaginatedResponse<T> {
  count: number;
  results: T[];
}

function mapChecklist(api: ApiChecklist): Checklist {
  return {
    id: api.id,
    name: api.name,
    icon: api.icon,
    order: api.order,
    is_active: api.is_active,
    clinic_id: api.clinic_id,
    clinic_name: api.clinic_name,
    created_by_name: api.created_by_name,
    items_count: api.items_count,
    created_at: api.created_at,
  };
}

function mapChecklistDetail(api: ApiChecklistDetail): ChecklistDetail {
  return {
    id: api.id,
    name: api.name,
    icon: api.icon,
    order: api.order,
    is_active: api.is_active,
    clinic_id: api.clinic_id,
    clinic_name: api.clinic_name,
    created_by_name: api.created_by_name,
    created_at: api.created_at,
    items: (api.items ?? []).map((item) => ({
      id: String(item.id),
      name: item.name,
      type: item.type as ChecklistItemType,
      required: item.required,
      has_observation: item.has_observation,
      order: item.order,
      options: (item.options ?? []).map((opt) => ({
        id: String(opt.id),
        label: opt.label,
        value: opt.value,
      })),
    })),
  };
}

export async function fetchChecklists(
  params?: ChecklistFilters
): Promise<{ checklists: Checklist[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.isActive) searchParams.set("is_active", params.isActive);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.pageSize) searchParams.set("page_size", String(params.pageSize));
  const query = searchParams.toString();
  const data = await apiFetchClient<PaginatedResponse<ApiChecklist>>(
    `/checklists/${query ? `?${query}` : ""}`
  );
  return { checklists: data.results.map(mapChecklist), total: data.count };
}

export async function fetchChecklist(id: string): Promise<ChecklistDetail> {
  const data = await apiFetchClient<ApiChecklistDetail>(`/checklists/${id}/`);
  return mapChecklistDetail(data);
}

export async function createChecklistFetch(
  data: Record<string, unknown>
): Promise<ChecklistDetail> {
  const result = await apiFetchClient<ApiChecklistDetail>("/checklists/", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return mapChecklistDetail(result);
}

export async function updateChecklistFetch(
  id: string,
  data: Record<string, unknown>
): Promise<ChecklistDetail> {
  const result = await apiFetchClient<ApiChecklistDetail>(`/checklists/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return mapChecklistDetail(result);
}

export async function deleteChecklistFetch(id: string): Promise<void> {
  await apiFetchClient<void>(`/checklists/${id}/`, { method: "DELETE" });
}

export async function duplicateChecklistFetch(id: string): Promise<ChecklistDetail> {
  const result = await apiFetchClient<ApiChecklistDetail>(`/checklists/${id}/duplicate/`, {
    method: "POST",
  });
  return mapChecklistDetail(result);
}
