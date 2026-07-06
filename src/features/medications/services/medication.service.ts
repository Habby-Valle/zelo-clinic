import { apiFetchClient } from "@/lib/api-client";
import type { Medication, SaveMedicationInput } from "../types";

export async function fetchMedications(patientId: string): Promise<Medication[]> {
  const data = await apiFetchClient<Medication[]>(`/patients/${patientId}/medications/`);
  return data ?? [];
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
