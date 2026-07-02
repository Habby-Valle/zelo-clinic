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
  caregiver: { id: string; name: string } | null;
  started_at: string | null;
  ended_at: string | null;
  status: string;
  patients: Array<{ id: string; name: string }>;
}

export interface ShiftsListResponse {
  results: Array<{
    id: string;
    caregiver: { id: string; name: string } | null;
    start: string | null;
    end: string | null;
    status: string;
    shift_patients: Array<{ patient: { id: string; name: string } }>;
  }>;
  count: number;
}
