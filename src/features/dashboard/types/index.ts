export interface DashboardKpis {
  totalPatients: number;
  newPatientsThisMonth: number;
  totalCaregivers: number;
  totalFamilyMembers: number;
  activeShifts: number;
  shiftsToday: number;
  completedToday: number;
  pendingToday: number;
  checklistsToday: number;
  activeSosAlerts: number;
  acknowledgedSosAlerts: number;
  avgSatisfaction: number | null;
  nps: number | null;
  totalRatings: number;
}

export interface DashboardResponse {
  kpis: DashboardKpis;
  clinicStats: unknown[];
  revenue: unknown;
  recentActivity: unknown[];
}

export interface RecentShift {
  id: string;
  caregiver_name: string | null;
  started_at: string | null;
  ended_at: string | null;
  status: string;
  patient_name: string | null;
}

export interface ShiftsListResponse {
  results: Array<{
    id: string;
    caregiver_name: string | null;
    start: string | null;
    end: string | null;
    status: string;
    shift_patients: Array<{ patient_name: string }>;
  }>;
  count: number;
}
