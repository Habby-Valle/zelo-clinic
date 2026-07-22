import { apiFetchClient } from "@/lib/api-client";
import type { PatientAssessment, SavePatientAssessmentInput } from "../types";

export async function fetchPatientAssessments(patientId: string): Promise<PatientAssessment[]> {
  const data = await apiFetchClient<PatientAssessment[]>(`/patients/${patientId}/assessments/`);
  return data ?? [];
}

export async function fetchPatientAssessment(
  patientId: string,
  assessmentId: string
): Promise<PatientAssessment> {
  return apiFetchClient<PatientAssessment>(`/patients/${patientId}/assessments/${assessmentId}/`);
}

export async function createPatientAssessment(
  patientId: string,
  input: SavePatientAssessmentInput
): Promise<PatientAssessment> {
  return apiFetchClient<PatientAssessment>(`/patients/${patientId}/assessments/`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updatePatientAssessment(
  patientId: string,
  assessmentId: string,
  input: SavePatientAssessmentInput
): Promise<PatientAssessment> {
  return apiFetchClient<PatientAssessment>(`/patients/${patientId}/assessments/${assessmentId}/`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
