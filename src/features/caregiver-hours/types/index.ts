export interface CaregiverWorkLog {
  id: string;
  caregiver: string;
  caregiver_name: string;
  clinic: string;
  date: string;
  total_seconds: number;
  total_hours: string;
  shift_count: number;
  completed: number;
  cancelled: number;
  overnight: boolean;
}

export interface CaregiverHoursSummary {
  total_hours: string;
  avg_hours_per_shift: string;
  period: {
    start_date: string;
    end_date: string;
  };
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
