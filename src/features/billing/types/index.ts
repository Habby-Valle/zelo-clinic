export type InvoiceStatus = "pending" | "paid" | "cancelled";

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  pending: "Pendente",
  paid: "Pago",
  cancelled: "Cancelado",
};

export interface Invoice {
  id: string;
  invoice_number: string;
  contract: string;
  contract_number: string;
  patient_name: string;
  payer_name: string;
  clinic: string;
  clinic_name: string;
  period_start: string;
  period_end: string;
  due_date: string | null;
  total_amount: string;
  status: InvoiceStatus;
  status_display?: string;
  paid_at: string | null;
  notes: string;
  items: InvoiceLineItem[];
  created_at: string;
  updated_at: string;
}

export interface InvoiceLineItem {
  id: string;
  date: string;
  description: string;
  hours: string;
  hourly_rate: string;
  night_surcharge: string;
  amount: string;
}

export interface InvoicesPage {
  invoices: Invoice[];
  total: number;
}

export interface InvoiceStats {
  total_pending: string;
  total_paid: string;
  pending_count: number;
  paid_count: number;
  total_overdue: string;
  overdue_count: number;
}
