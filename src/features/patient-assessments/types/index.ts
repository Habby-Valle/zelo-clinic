export type MobilityLevel = "independent" | "assisted" | "wheelchair" | "bedridden";

export const MOBILITY_LABELS: Record<MobilityLevel, string> = {
  independent: "Independente",
  assisted: "Com auxílio",
  wheelchair: "Cadeira de rodas",
  bedridden: "Acamado",
};

export interface PatientAssessment {
  id: string;
  patient: string;
  performed_by: string | null;
  performed_by_name: string | null;
  mobility_level: MobilityLevel | "";
  mobility_display: string;
  fall_risk_score: number | null;
  pressure_ulcer_risk: number | null;
  adl_scores: Record<string, number>;
  diagnoses: string[];
  notes: string;
  performed_at: string;
}

export interface SavePatientAssessmentInput {
  mobility_level: MobilityLevel | "";
  fall_risk_score?: number | null;
  pressure_ulcer_risk?: number | null;
  adl_scores?: Record<string, number>;
  diagnoses?: string[];
  notes?: string;
}
