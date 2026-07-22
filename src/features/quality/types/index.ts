export interface ComplianceRecord {
  id: string;
  shift: string;
  shift_date: string;
  caregiver: string;
  caregiver_name: string;
  clinic: string;
  clinic_name: string;
  total_mandatory: number;
  completed_mandatory: number;
  compliance_pct: number;
  deviations: Deviation[];
  ai_analyzed: boolean;
  ai_insight: string | null;
  analyzed_at: string | null;
}

export interface Deviation {
  item_name: string;
  item_type: string;
  reason: string;
  observation: string;
  checklist_name: string;
}

export interface ComplianceStats {
  caregiver_id: string;
  caregiver_name: string;
  total_shifts: number;
  avg_compliance_pct: number;
  min_compliance_pct: number;
  max_compliance_pct: number;
}
