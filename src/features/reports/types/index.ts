export interface DateRange {
  from: string;
  to: string;
}

export interface ShiftsReportData {
  date: string;
  total: number;
  completed: number;
  cancelled: number;
}

export interface ChecklistsReportData {
  date: string;
  completed: number;
  pending: number;
}

export interface PatientsGrowthData {
  month: string;
  total: number;
  new: number;
}

export interface SosReportData {
  summary: {
    total: number;
    active: number;
    acknowledged: number;
    resolved: number;
    avgResponseTimeMinutes: number | null;
  };
  byPatient: {
    patientId: number;
    patientName: string;
    total: number;
    resolved: number;
  }[];
  byDate: {
    date: string;
    total: number;
    acknowledged: number;
    resolved: number;
  }[];
}

export interface CaregiverReportData {
  caregiverId: number;
  caregiverName: string;
  totalShifts: number;
  completedShifts: number;
  cancelledShifts: number;
  completedChecklists: number;
}

export interface ClinicReportSummary {
  totalShifts: number;
  completedShifts: number;
  cancelledShifts: number;
  totalChecklistsCompleted: number;
  totalPatients: number;
  totalCaregivers: number;
}
