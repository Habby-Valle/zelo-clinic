export type HealthAlertType =
  | "vital_sign_anomaly"
  | "medication_skip"
  | "sos_frequency"
  | "decline_trend"
  | "missing_data";

export type HealthAlertSeverity = "low" | "medium" | "high" | "critical";

export type HealthAlertStatus = "open" | "acknowledged" | "resolved" | "dismissed";

export interface HealthAlert {
  id: string;
  patient: string;
  patient_name: string;
  clinic: string;
  clinic_name: string;
  caregiver: string | null;
  caregiver_name: string | null;
  alert_type: HealthAlertType;
  alert_type_display: string;
  severity: HealthAlertSeverity;
  severity_display: string;
  status: HealthAlertStatus;
  status_display: string;
  indicator: string;
  current_value: string;
  expected_range: string;
  details: string;
  ai_insight: string;
  detected_at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
}

export interface HealthAlertFilters {
  patient_id?: string;
  severity?: HealthAlertSeverity | "";
  status?: HealthAlertStatus | "";
  alert_type?: HealthAlertType | "";
  days?: number;
}
