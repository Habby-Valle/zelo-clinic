export interface CostSummary {
  totalShifts: number;
  totalHours: number;
  totalCost: number;
  unpricedShiftCount: number;
  unpricedContractCount: number;
}

export interface CostByContract {
  contractId: string;
  contractNumber: string;
  patientName: string;
  billingMode: "per_shift" | "per_hour" | "fixed";
  pricePerHour: string | null;
  pricePerShift: string | null;
  shifts: number;
  hours: number;
  nightSurcharge?: number;
  cost: number | null;
}

export interface CostByMonth {
  month: string;
  shifts: number;
  hours: number;
  cost: number;
}

export interface CostShiftRow {
  id: string;
  date: string;
  contractNumber: string;
  patientName: string;
  caregiverName: string;
  start: string;
  end: string;
  hours: number;
  billingMode: "per_shift" | "per_hour" | "fixed";
  amount: string | null;
  nightSurcharge?: string;
  cost: string | null;
}

export interface CostReportData {
  summary: CostSummary;
  byContract: CostByContract[];
  byMonth: CostByMonth[];
  shifts: CostShiftRow[];
}

export interface CostReportFilters {
  date_from: string;
  date_to: string;
}
