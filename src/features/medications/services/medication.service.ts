import { apiFetchClient } from "@/lib/api-client";
import type { Medication, MedicationSuggestion, SaveMedicationInput } from "../types";

export async function fetchMedications(patientId: string): Promise<Medication[]> {
  const data = await apiFetchClient<Medication[]>(`/patients/${patientId}/medications/`);
  return data ?? [];
}

// Sugere nomes de medicação a partir do texto declarado pela família (IA + fallback
// no backend). Só nomes — dose/via/horários são preenchidos manualmente da receita.
export async function fetchMedicationSuggestions(
  patientId: string
): Promise<MedicationSuggestion[]> {
  try {
    const data = await apiFetchClient<{ suggestions: MedicationSuggestion[] }>(
      `/patients/${patientId}/medications/suggest/`,
      { method: "POST" }
    );
    return data?.suggestions ?? [];
  } catch {
    // Sugestão é best-effort: nunca deve quebrar a tela de medicações.
    return [];
  }
}

export async function createMedication(
  patientId: string,
  input: SaveMedicationInput
): Promise<Medication> {
  return apiFetchClient<Medication>(`/patients/${patientId}/medications/`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateMedication(
  patientId: string,
  medId: string,
  input: Partial<SaveMedicationInput>
): Promise<Medication> {
  return apiFetchClient<Medication>(`/patients/${patientId}/medications/${medId}/`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteMedication(patientId: string, medId: string): Promise<void> {
  await apiFetchClient(`/patients/${patientId}/medications/${medId}/`, {
    method: "DELETE",
  });
}
