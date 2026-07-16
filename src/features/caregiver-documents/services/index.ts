import { apiFetchClient } from "@/lib/api-client";
import type { CaregiverDocument, CreateCaregiverDocumentInput } from "../types";

export async function fetchCaregiverDocuments(caregiverId: string): Promise<CaregiverDocument[]> {
  return apiFetchClient<CaregiverDocument[]>(`/caregivers/documents/?caregiver=${caregiverId}`);
}

export async function uploadDocumentMedia(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/proxy/media/upload/", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Falha ao enviar o arquivo");
  }

  const data = (await res.json()) as { id: string };
  return data.id;
}

export async function createCaregiverDocument(
  input: CreateCaregiverDocumentInput
): Promise<CaregiverDocument> {
  return apiFetchClient<CaregiverDocument>("/caregivers/documents/", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function deleteCaregiverDocument(id: string): Promise<void> {
  await apiFetchClient(`/caregivers/documents/${id}/`, { method: "DELETE" });
}
