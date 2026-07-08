export type MedicationRoute = "oral" | "iv" | "im" | "sc" | "topical" | "inhalation" | "other";

export const MEDICATION_ROUTE_LABELS: Record<MedicationRoute, string> = {
  oral: "Oral",
  iv: "Intravenosa",
  im: "Intramuscular",
  sc: "Subcutânea",
  topical: "Tópica",
  inhalation: "Inalatória",
  other: "Outra",
};

export interface Medication {
  id: string;
  patient: string;
  name: string;
  dose: string;
  route: MedicationRoute;
  route_display: string;
  schedule_times: string[];
  start_date: string | null;
  end_date: string | null;
  prescribed_by: string;
  notes: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Sugestão de medicação a partir do texto declarado pela família.
// Apenas nome + trecho de origem — dose/via/horários são sempre manuais.
export interface MedicationSuggestion {
  name: string;
  source_text: string;
}

export interface SaveMedicationInput {
  name: string;
  dose?: string;
  route?: MedicationRoute;
  schedule_times?: string[];
  start_date?: string | null;
  end_date?: string | null;
  prescribed_by?: string;
  notes?: string;
  is_active?: boolean;
}
