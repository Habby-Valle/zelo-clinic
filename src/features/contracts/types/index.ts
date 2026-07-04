export type ContractStatus =
  | "requested"
  | "proposal_sent"
  | "draft"
  | "active"
  | "suspended"
  | "cancelled"
  | "expired";

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  requested: "Solicitado",
  proposal_sent: "Proposta enviada",
  draft: "Rascunho",
  active: "Ativo",
  suspended: "Suspenso",
  cancelled: "Cancelado",
  expired: "Expirado",
};

export type PatientHealthStatus = "pending" | "declared" | "validated";

export const PATIENT_HEALTH_STATUS_LABELS: Record<PatientHealthStatus, string> = {
  pending: "Aguardando declaração",
  declared: "Declarado pela família",
  validated: "Validado",
};

export interface ServiceContract {
  id: string;
  contract_number: string;
  payer: string;
  payer_name: string;
  requested_by: string | null;
  requested_by_name: string | null;
  patient: string;
  patient_name: string;
  patient_health_status: PatientHealthStatus;
  clinic: string;
  clinic_name: string;
  status: ContractStatus;
  start_date: string;
  end_date: string | null;
  price_per_hour: string | null;
  price_per_shift: string | null;
  night_surcharge: string;
  night_surcharge_type: "percentage" | "fixed_amount";
  weekly_hours: string;
  notes: string;
  cancellation_reason: string;
  cancelled_by_name: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
  status_display?: string;
}

export interface ContractsPage {
  contracts: ServiceContract[];
  total: number;
}
