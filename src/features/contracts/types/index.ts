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
  billing_mode: "per_shift" | "per_hour" | "fixed";
  price_per_hour: string | null;
  price_per_shift: string | null;
  fixed_monthly_amount: string | null;
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

export interface PricingSuggestion {
  price_per_hour_suggested: string;
  price_per_shift_suggested: string;
  night_surcharge_suggested: string;
  confidence: string;
  factors: {
    complexity: string;
    complexity_multiplier: string;
    specialty_premium: string;
    distance_km: number | null;
    distance_multiplier: string;
    frequency_discount: string;
    night_surcharge: string;
    market_avg_per_hour: string | null;
    region: string;
  };
  explanation: string;
}
