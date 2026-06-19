export interface ShiftPatient {
  id: number
  patient_id: number
  patient_name: string
}

export interface ShiftItem {
  id: number
  caregiver_id: number
  clinic_id: number | null
  start: string
  end: string
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
  notes: string
  shift_patients: ShiftPatient[]
  caregiver_name: string
  clinic_name: string | null
  created_by_name: string | null
  created_at: string
  updated_at: string
}

export interface ShiftTemplateItem {
  id: number
  clinic_id: number
  name: string
  start_time: string
  end_time: string
  instructions: string
  is_active: boolean
  created_at: string
}

export interface PatientOption {
  id: number
  name: string
  caregiver_ids: number[]
}

export interface CaregiverOption {
  id: number
  name: string
}

export interface ShiftFilters {
  search?: string
  status?: string
  page?: number
  page_size?: number
}
