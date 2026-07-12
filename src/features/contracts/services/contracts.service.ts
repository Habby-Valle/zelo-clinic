import { apiFetchClient } from "@/lib/api-client";
import type { ServiceContract, ContractsPage, ContractStatus, PricingSuggestion } from "../types";

function mapContract(r: Record<string, unknown>): ServiceContract {
  return {
    id: String(r.id ?? ""),
    contract_number: String(r.contract_number ?? ""),
    payer: String(r.payer ?? ""),
    payer_name: String(r.payer_name ?? ""),
    requested_by: r.requested_by != null ? String(r.requested_by) : null,
    requested_by_name: r.requested_by_name != null ? String(r.requested_by_name) : null,
    patient: String(r.patient ?? ""),
    patient_name: String(r.patient_name ?? ""),
    patient_health_status:
      (r.patient_health_status as ServiceContract["patient_health_status"]) ?? "pending",
    clinic: String(r.clinic ?? ""),
    clinic_name: String(r.clinic_name ?? ""),
    status: (r.status as ContractStatus) ?? "draft",
    start_date: String(r.start_date ?? ""),
    end_date: r.end_date != null ? String(r.end_date) : null,
    billing_mode: (r.billing_mode as ServiceContract["billing_mode"]) ?? "per_shift",
    price_per_hour: r.price_per_hour != null ? String(r.price_per_hour) : null,
    price_per_shift: r.price_per_shift != null ? String(r.price_per_shift) : null,
    fixed_monthly_amount:
      r.fixed_monthly_amount != null ? String(r.fixed_monthly_amount) : null,
    night_surcharge: String(r.night_surcharge ?? "0"),
    night_surcharge_type: (r.night_surcharge_type as "percentage" | "fixed_amount") ?? "percentage",
    weekly_hours: String(r.weekly_hours ?? "0"),
    notes: String(r.notes ?? ""),
    cancellation_reason: String(r.cancellation_reason ?? ""),
    cancelled_by_name: r.cancelled_by_name != null ? String(r.cancelled_by_name) : null,
    ended_at: r.ended_at != null ? String(r.ended_at) : null,
    created_at: String(r.created_at ?? ""),
    updated_at: String(r.updated_at ?? ""),
    status_display: r.status_display != null ? String(r.status_display) : undefined,
  };
}

export async function fetchContracts(params: {
  status: string;
  search: string;
  page: number;
  pageSize: number;
}): Promise<ContractsPage> {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.search) qs.set("search", params.search);
  qs.set("page", String(params.page));
  qs.set("page_size", String(params.pageSize));

  const data = await apiFetchClient<{
    count: number;
    results: Array<Record<string, unknown>>;
  }>(`/contracts/?${qs}`);

  return {
    contracts: (data.results ?? []).map(mapContract),
    total: data.count ?? 0,
  };
}

export async function fetchContractById(id: string): Promise<ServiceContract | null> {
  try {
    const r = await apiFetchClient<Record<string, unknown>>(`/contracts/${id}/`);
    return mapContract(r);
  } catch {
    return null;
  }
}

export async function sendProposalApi(
  id: string,
  data: {
    billing_mode?: "per_shift" | "per_hour" | "fixed";
    price_per_hour?: number;
    price_per_shift?: number;
    fixed_monthly_amount?: number;
    night_surcharge?: number;
    night_surcharge_type?: string;
  }
): Promise<void> {
  await apiFetchClient(`/contracts/${id}/proposal/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function rejectContractApi(id: string): Promise<void> {
  await apiFetchClient(`/contracts/${id}/transition/`, {
    method: "POST",
    body: JSON.stringify({ status: "cancelled" }),
  });
}

/** Transição de ciclo de vida (suspender/reativar/encerrar) pela clínica. */
export async function transitionContractApi(
  id: string,
  status: "suspended" | "active" | "cancelled" | "expired",
  reason = ""
): Promise<void> {
  await apiFetchClient(`/contracts/${id}/transition/`, {
    method: "POST",
    body: JSON.stringify({ status, reason }),
  });
}

export async function validateHealthApi(id: string): Promise<void> {
  await apiFetchClient(`/contracts/${id}/health/validate/`, {
    method: "POST",
  });
}

export async function fetchPricingSuggestion(contractId: string): Promise<PricingSuggestion> {
  return apiFetchClient<PricingSuggestion>(`/api/ai/pricing-suggestion/?contract_id=${contractId}`);
}

export async function updateContractApi(
  id: string,
  data: Partial<{
    price_per_hour: number;
    price_per_shift: number;
    night_surcharge: number;
    night_surcharge_type: string;
    weekly_hours: number;
    start_date: string;
    end_date: string;
    notes: string;
  }>
): Promise<void> {
  await apiFetchClient(`/contracts/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
