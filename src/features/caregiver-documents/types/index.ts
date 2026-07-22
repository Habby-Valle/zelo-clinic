export type CaregiverDocumentType =
  | "professional_register"
  | "certificate"
  | "course"
  | "vaccine"
  | "health_exam"
  | "document"
  | "other";

export const DOCUMENT_TYPE_LABELS: Record<CaregiverDocumentType, string> = {
  professional_register: "Registro profissional",
  certificate: "Certidão",
  course: "Curso/Capacitação",
  vaccine: "Vacina",
  health_exam: "Exame de saúde (ASO)",
  document: "Documento pessoal",
  other: "Outro",
};

export const DOCUMENT_TYPE_OPTIONS: { value: CaregiverDocumentType; label: string }[] = (
  Object.keys(DOCUMENT_TYPE_LABELS) as CaregiverDocumentType[]
).map((value) => ({
  value,
  label: DOCUMENT_TYPE_LABELS[value],
}));

export interface CaregiverDocument {
  id: string;
  caregiver_name: string;
  document_type: CaregiverDocumentType;
  document_type_display: string;
  name: string;
  media_id: string | null;
  media_url: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  created_at: string;
}

export interface CreateCaregiverDocumentInput {
  caregiver_id: string;
  document_type: CaregiverDocumentType;
  name: string;
  media_id?: string | null;
  issue_date?: string | null;
  expiry_date?: string | null;
}
