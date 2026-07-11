export interface FamilyMembersGrowthData {
  month: string;
  total: number;
  new: number;
}

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
    patientId: string;
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
  caregiverId: string;
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
  totalFamilyMembers: number;
  avgSatisfaction: number | null;
  nps: number | null;
  totalRatings: number;
}

export interface ContractsReportData {
  summary: {
    total: number;
    active: number;
    suspended: number;
    cancelled: number;
    expired: number;
  };
  byMonth: { month: string; new: number; total: number }[];
  avgPricePerHour: string;
  avgPricePerShift: string;
  avgWeeklyHours: number;
}

export interface BillingReportData {
  summary: {
    totalRevenue: string;
    totalPending: string;
    totalPaid: string;
    pendingCount: number;
    paidCount: number;
    avgInvoiceValue: string;
  };
  byMonth: {
    month: string;
    revenue: string;
    pending: string;
    paid: string;
    count: number;
  }[];
  byContract: {
    contractId: string;
    contractNumber: string;
    patientName: string;
    totalInvoiced: string;
    totalPaid: string;
  }[];
}

export interface SatisfactionSummary {
  avgSatisfaction: number | null;
  nps: number | null;
  totalRatings: number;
}

export interface SatisfactionReportData {
  summary: SatisfactionSummary;
  byCaregiver: {
    caregiverId: string;
    caregiverName: string;
    total: number;
    avgSatisfaction: number | null;
    nps: number | null;
  }[];
  byDate: {
    date: string;
    total: number;
    avgSatisfaction: number;
  }[];
}
