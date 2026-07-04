export interface CaregiverWorkLog {
  id: string;
  caregiver_id: string;
  caregiver_name: string;
  clinic_id: string;
  clinic_name: string;
  date: string;
  total_seconds: number;
  total_hours: string;
  shift_count: number;
  completed_shift_count: number;
  cancelled_shift_count: number;
  overnight: boolean;
  created_at: string;
  updated_at: string;
}

export interface CaregiverHoursSummary {
  total_seconds: number;
  total_hours: number;
  total_shifts: number;
  completed_shifts: number;
  avg_hours_per_shift: number;
  period_start: string;
  period_end: string;
}

export interface CaregiverHoursFilters {
  start_date?: string;
  end_date?: string;
  caregiver_id?: string;
  page?: number;
}

export interface CaregiverHoursPage {
  count: number;
  results: CaregiverWorkLog[];
}
