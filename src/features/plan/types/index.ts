export type PlanStatus = "trial" | "active" | "free" | "expired" | "cancelled";

export type ReportsLevel = "none" | "basic" | "advanced";

export interface PlanBenefitRelation {
  id: string;
  benefit_id: string;
  benefit_key: string;
  benefit_label: string;
  value: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  monthly_price: number;
  yearly_price: number | null;
  is_active: boolean;
  benefits: PlanBenefitRelation[];
}

export interface ClinicPlan {
  id: string;
  plan_id: string;
  status: PlanStatus;
  started_at: string;
  expires_at: string | null;
  trial_ends_at: string | null;
  payment_failed_at: string | null;
}

export interface PlanLimits {
  max_patients: number;
  max_caregivers: number;
  max_family_per_patient: number;
  reports_level: ReportsLevel;
  audit_log_days: number;
  has_custom_branding: boolean;
  has_data_export: boolean;
}

export interface PlanLimitsInfo {
  plan_name: string;
  effective_status: string;
  limits: PlanLimits;
  usage: {
    patients: number;
    caregivers: number;
  };
}
