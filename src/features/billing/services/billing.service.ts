import { apiFetchClient } from "@/lib/api-client";
import type { Invoice, InvoicesPage, InvoiceStats, InvoiceStatus } from "../types";

function mapInvoice(r: Record<string, unknown>): Invoice {
  return {
    id: String(r.id ?? ""),
    invoice_number: String(r.invoice_number ?? ""),
    contract: String(r.contract ?? ""),
    contract_number: String(r.contract_number ?? ""),
    patient_name: String(r.patient_name ?? ""),
    payer_name: String(r.payer_name ?? ""),
    clinic: String(r.clinic ?? ""),
    clinic_name: String(r.clinic_name ?? ""),
    period_start: String(r.period_start ?? ""),
    period_end: String(r.period_end ?? ""),
    total_amount: String(r.total_amount ?? "0"),
    status: (r.status as InvoiceStatus) ?? "pending",
    status_display: r.status_display != null ? String(r.status_display) : undefined,
    paid_at: r.paid_at != null ? String(r.paid_at) : null,
    notes: String(r.notes ?? ""),
    items: Array.isArray(r.items) ? r.items.map(mapLineItem) : [],
    created_at: String(r.created_at ?? ""),
    updated_at: String(r.updated_at ?? ""),
  };
}

function mapLineItem(r: Record<string, unknown>): Invoice["items"][number] {
  return {
    id: String(r.id ?? ""),
    date: String(r.date ?? ""),
    description: String(r.description ?? ""),
    hours: String(r.hours ?? "0"),
    hourly_rate: String(r.hourly_rate ?? "0"),
    night_surcharge: String(r.night_surcharge ?? "0"),
    amount: String(r.amount ?? "0"),
  };
}

export async function fetchInvoices(params: {
  status: string;
  page: number;
  pageSize: number;
}): Promise<InvoicesPage> {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  qs.set("page", String(params.page));
  qs.set("page_size", String(params.pageSize));

  const data = await apiFetchClient<{
    count: number;
    results: Array<Record<string, unknown>>;
  }>(`/billing/invoices/?${qs}`);

  return {
    invoices: (data.results ?? []).map(mapInvoice),
    total: data.count ?? 0,
  };
}

export async function fetchInvoiceById(id: string): Promise<Invoice | null> {
  try {
    const r = await apiFetchClient<Record<string, unknown>>(`/billing/invoices/${id}/`);
    return mapInvoice(r);
  } catch {
    return null;
  }
}

export async function updateInvoiceStatus(id: string, status: "paid" | "cancelled"): Promise<void> {
  await apiFetchClient(`/billing/invoices/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function generateInvoiceApi(data: {
  contract_id: string;
  period_start: string;
  period_end: string;
}): Promise<Record<string, unknown>> {
  return apiFetchClient<Record<string, unknown>>("/billing/invoices/generate/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function fetchInvoiceStats(): Promise<InvoiceStats> {
  const data = await apiFetchClient<Record<string, unknown>>("/billing/stats/");
  return {
    total_pending: String(data.total_pending ?? "0"),
    total_paid: String(data.total_paid ?? "0"),
    pending_count: Number(data.pending_count ?? 0),
    paid_count: Number(data.paid_count ?? 0),
  };
}
