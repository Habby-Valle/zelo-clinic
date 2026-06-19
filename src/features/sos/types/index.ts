export type SosStatus = "active" | "acknowledged" | "resolved"

export interface SosAlert {
  id: string
  caregiver_id: string
  caregiver_name: string
  patient_id: string
  patient_name: string
  shift_id: string | null
  clinic_id: string | null
  clinic_name: string | null
  status: SosStatus
  triggered_at: string
  acknowledged_by_id: string | null
  acknowledged_by_name: string | null
  acknowledged_at: string | null
  resolved_by_id: string | null
  resolved_by_name: string | null
  resolved_at: string | null
  resolution_reason: string | null
  notes: string | null
  latitude: number | null
  longitude: number | null
}

export interface SosFilters {
  status?: SosStatus | "all"
  page?: number
  page_size?: number
}

export interface SosSummary {
  active: number
  acknowledged: number
  resolvedToday: number
}
