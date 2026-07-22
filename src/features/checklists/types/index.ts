export type ChecklistItemType = "text" | "boolean" | "select" | "number";

export type AlertSeverity = "" | "low" | "medium" | "high" | "critical";

export type Criticality = "low" | "medium" | "high";

export type FrequencyType = "as_needed" | "per_shift" | "daily" | "fixed_times";

export interface ChecklistItemOption {
  id: string;
  label: string;
  value: string;
}

export interface ChecklistItem {
  id: string;
  name: string;
  type: ChecklistItemType;
  required: boolean;
  has_observation: boolean;
  order: number;
  options: ChecklistItemOption[];
  unit: string;
  expected_min: number | null;
  expected_max: number | null;
  target_value: number | null;
  alert_severity: AlertSeverity;
  criticality: Criticality;
  instructions: string;
  requires_photo: boolean;
  frequency: FrequencyType;
  scheduled_times: string[];
}

export interface Checklist {
  id: string;
  name: string;
  icon: string | null;
  order: number;
  is_active: boolean;
  clinic_id: string | null;
  clinic_name: string | null;
  created_by_name: string | null;
  items_count: number;
  created_at: string;
}

export interface ChecklistDetail {
  id: string;
  name: string;
  icon: string | null;
  order: number;
  is_active: boolean;
  clinic_id: string | null;
  clinic_name: string | null;
  created_by_name: string | null;
  version: number;
  items: ChecklistItem[];
  created_at: string;
}

export interface ChecklistFilters {
  search?: string;
  isActive?: string;
  page?: number;
  pageSize?: number;
}
