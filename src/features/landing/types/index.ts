import type { ReportsLevel, PlanBenefitRelation } from "@/features/plan/types";

export interface PublicPlan {
  id: string;
  name: string;
  description: string;
  monthly_price: number;
  yearly_price: number | null;
  max_patients: number;
  max_caregivers: number;
  max_family_per_patient: number;
  reports_level: ReportsLevel;
  has_custom_branding: boolean;
  has_data_export: boolean;
  is_trial: boolean;
  benefits: PlanBenefitRelation[];
}

export interface LeadInput {
  name: string;
  email: string;
  phone?: string;
  clinic_name?: string;
  city?: string;
  message?: string;
  /** Honeypot anti-spam — deve permanecer vazio. */
  website?: string;
}
