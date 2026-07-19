export interface ShiftPatient {
  id: string;
  patient_id: string;
  patient_name: string;
}

export interface ShiftItem {
  id: string;
  caregiver_id: string;
  clinic_id: string | null;
  contract_id: string | null;
  start: string;
  end: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  auto_cancelled: boolean;
  notes: string;
  shift_patients: ShiftPatient[];
  caregiver_name: string;
  clinic_name: string | null;
  contract_number: string | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShiftTemplateItem {
  id: string;
  clinic_id: string;
  name: string;
  start_time: string;
  end_time: string;
  instructions: string;
  is_active: boolean;
  created_at: string;
}

export interface PatientOption {
  id: string;
  name: string;
  caregiver_ids: string[];
  has_active_contract: boolean;
  contract_start_date: string | null;
  active_contract_weekly_hours: number | null;
  contract_preferred_weekdays: number[] | null;
  contract_preferred_start_time: string | null;
  contract_preferred_end_time: string | null;
}

export interface CaregiverOption {
  id: string;
  name: string;
  verification_status?: string | null;
}

export interface ShiftFilters {
  search?: string;
  status?: string;
  page?: number;
  page_size?: number;
  patient_id?: string;
  date_from?: string;
  date_to?: string;
}
