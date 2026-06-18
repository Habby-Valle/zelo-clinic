export interface DashboardKpis {
  totalPatients: number
  newPatientsThisMonth: number
  totalCaregivers: number
  activeShifts: number
  shiftsToday: number
  completedToday: number
  pendingToday: number
  checklistsToday: number
  activeSosAlerts: number
  acknowledgedSosAlerts: number
}

export interface DashboardResponse {
  kpis: DashboardKpis
  clinicStats: unknown[]
  revenue: unknown
  recentActivity: unknown[]
}

export interface RecentShift {
  id: number
  caregiver: { id: number; name: string } | null
  started_at: string | null
  ended_at: string | null
  status: string
  patients: Array<{ id: number; name: string }>
}

export interface ShiftsListResponse {
  results: Array<{
    id: number
    caregiver: { id: number; name: string } | null
    start: string | null
    end: string | null
    status: string
    shift_patients: Array<{ patient: { id: number; name: string } }>
  }>
  count: number
}
