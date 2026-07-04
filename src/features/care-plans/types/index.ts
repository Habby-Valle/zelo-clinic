export type CarePlanStatus = "draft" | "pending_review" | "active" | "archived";

export const CARE_PLAN_STATUS_LABELS: Record<CarePlanStatus, string> = {
  draft: "Rascunho",
  pending_review: "Em revisão",
  active: "Ativo",
  archived: "Arquivado",
};

export interface CarePlanChecklistItem {
  id: string;
  name: string;
  type: string;
  required: boolean;
}

export interface CarePlanChecklist {
  id: string;
  checklist_id: string;
  checklist_name: string;
  checklist_category: string;
  checklist_items: CarePlanChecklistItem[];
  frequency: string;
  order: number;
}

export interface CarePlan {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_health_status: string;
  status: CarePlanStatus;
  status_display: string;
  responsible_name: string;
  responsible_register: string;
  approved_by_name: string | null;
  approved_at: string | null;
  review_note: string;
  notes: string;
  checklists: CarePlanChecklist[];
  created_at: string;
  updated_at: string;
}

export interface ChecklistOption {
  id: string;
  name: string;
  category: string;
}

export interface CaregiverOption {
  id: string;
  name: string;
  register: string;
}

export interface CaregiverMatchResult {
  caregiver_id: string;
  caregiver_name: string;
  specialization: string;
  professional_register: string;
  skill_match: number;
  quality_score: number;
  experience_score: number;
  availability_score: number;
  proximity_score: number;
  overall_score: number;
  explanation?: string;
}

export interface SaveCarePlanInput {
  patient_id: string;
  responsible_name: string;
  responsible_register: string;
  notes?: string;
  checklists: { checklist_id: string }[];
}
