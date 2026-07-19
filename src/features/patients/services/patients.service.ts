import { apiFetchClient } from "@/lib/api-client";
import type {
  ClinicPatient,
  PatientCaregiver,
  PendingInvite,
  CaregiverAssignment,
  PatientDocument,
  PatientsPage,
} from "../types";

function mapPatient(r: Record<string, unknown>): ClinicPatient {
  const caregiver_assignments = (
    Array.isArray(r.caregiver_assignments) ? r.caregiver_assignments : []
  ) as CaregiverAssignment[];
  return {
    id: String(r.id ?? ""),
    clinic_id: r.clinic_id != null ? String(r.clinic_id) : null,
    name: String(r.name ?? ""),
    birth_date: String(r.birth_date ?? ""),
    gender: (r.gender as ClinicPatient["gender"]) ?? "O",
    cpf: r.cpf != null ? String(r.cpf) : null,
    phone: String(r.phone ?? ""),
    email: r.email != null ? String(r.email) : null,
    health_conditions: String(r.health_conditions ?? ""),
    allergies: String(r.allergies ?? ""),
    medications: String(r.medications ?? ""),
    blood_type: r.blood_type != null ? String(r.blood_type) : null,
    health_status: String(r.health_status ?? "pending"),
    observations: String(r.observations ?? ""),
    media_id: r.media_id != null ? String(r.media_id) : null,
    media: r.media_url ? { id: String(r.media_id ?? ""), url: String(r.media_url) } : null,
    clinic_name: r.clinic_name != null ? String(r.clinic_name) : null,
    is_active: r.is_active !== false,
    contract_start_date: r.contract_start_date != null ? String(r.contract_start_date) : null,
    active_contract_id: r.active_contract_id != null ? String(r.active_contract_id) : null,
    active_contract_weekly_hours:
      r.active_contract_weekly_hours != null ? Number(r.active_contract_weekly_hours) : null,
    contract_preferred_weekdays: Array.isArray(r.contract_preferred_weekdays)
      ? (r.contract_preferred_weekdays as number[])
      : null,
    contract_preferred_start_time:
      r.contract_preferred_start_time != null ? String(r.contract_preferred_start_time) : null,
    contract_preferred_end_time:
      r.contract_preferred_end_time != null ? String(r.contract_preferred_end_time) : null,
    emergency_contacts: Array.isArray(r.emergency_contacts)
      ? (r.emergency_contacts as ClinicPatient["emergency_contacts"])
      : [],
    documents: Array.isArray(r.documents) ? (r.documents as PatientDocument[]) : [],
    caregiver_assignments,
    created_at: String(r.created_at ?? ""),
    updated_at: String(r.updated_at ?? ""),
    caregiver_count: caregiver_assignments.length,
    photo_url: r.media_url != null ? String(r.media_url) : null,
  };
}

export async function fetchPatients(params: {
  search: string;
  isActive: string;
  page: number;
  pageSize: number;
}): Promise<PatientsPage> {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.isActive) qs.set("is_active", params.isActive);
  qs.set("page", String(params.page));
  qs.set("page_size", String(params.pageSize));

  const data = await apiFetchClient<{
    count: number;
    results: Array<Record<string, unknown>>;
  }>(`/patients/?${qs}`);

  return {
    patients: (data.results ?? []).map(mapPatient),
    total: data.count ?? 0,
  };
}

export async function fetchPatientById(id: string): Promise<ClinicPatient | null> {
  try {
    const r = await apiFetchClient<Record<string, unknown>>(`/patients/${id}/`);
    return mapPatient(r);
  } catch {
    return null;
  }
}

export async function fetchClinicCaregivers(): Promise<PatientCaregiver[]> {
  try {
    const data = await apiFetchClient<{
      results: Array<{
        id: string;
        name: string;
        email: string;
        verification_status?: string | null;
      }>;
    }>("/users/?role=caregiver&page_size=200");
    // Só cuidadores aprovados podem ser vinculados a pacientes (gate de segurança).
    return (data.results ?? [])
      .filter((u) => u.verification_status === "approved")
      .map((u) => ({
        id: String(u.id),
        name: u.name,
        email: u.email,
      }));
  } catch {
    return [];
  }
}

export async function fetchPendingInvites(patientId: string): Promise<PendingInvite[]> {
  try {
    const data = await apiFetchClient<{
      results: Array<{
        id: string;
        email: string;
        status: string;
        created_at: string;
      }>;
    }>(`/invites/?role=family&status=pending&patient_id=${patientId}`);
    return (data.results ?? []).map((i) => ({
      id: String(i.id),
      email: i.email,
      status: i.status,
      created_at: i.created_at,
    }));
  } catch {
    return [];
  }
}

export async function createPatientApi(data: {
  name: string;
  birth_date: string;
  gender: string;
  cpf?: string | null;
  phone: string;
  email?: string | null;
  blood_type?: string | null;
  health_conditions?: string;
  allergies?: string;
  medications?: string;
  observations?: string;
}): Promise<ClinicPatient> {
  const r = await apiFetchClient<Record<string, unknown>>("/patients/", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return mapPatient(r);
}

export async function updatePatientApi(
  id: string,
  data: Partial<{ name: string; birth_date: string; is_active: boolean }>
): Promise<void> {
  await apiFetchClient(`/patients/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deletePatientApi(id: string): Promise<void> {
  await apiFetchClient(`/patients/${id}/`, { method: "DELETE" });
}

export async function assignCaregiversApi(
  patientId: string,
  caregiverIds: string[],
  currentAssignments: CaregiverAssignment[]
): Promise<void> {
  const currentIds = currentAssignments.map((a) => a.caregiver_id);
  const newSet = new Set(caregiverIds);

  for (const assignment of currentAssignments) {
    if (!newSet.has(assignment.caregiver_id)) {
      await apiFetchClient(`/patients/${patientId}/caregivers/${assignment.id}/`, {
        method: "DELETE",
      }).catch(() => {});
    }
  }

  for (const caregiverId of caregiverIds) {
    if (!currentIds.includes(caregiverId)) {
      await apiFetchClient(`/patients/${patientId}/caregivers/`, {
        method: "POST",
        body: JSON.stringify({ caregiver_id: caregiverId }),
      }).catch(() => {});
    }
  }
}

export async function inviteFamilyApi(
  patientId: string,
  clinicId: string,
  email: string
): Promise<void> {
  await apiFetchClient("/invites/", {
    method: "POST",
    body: JSON.stringify({
      email,
      role: "family",
      clinic_id: clinicId,
      patient_id: patientId,
    }),
  });
}

export async function generateFamilyLinkCodeApi(
  email: string
): Promise<{ id: string; email: string; role: string; code: string }> {
  return apiFetchClient("/invites/link-codes/", {
    method: "POST",
    body: JSON.stringify({ email, role: "family" }),
  });
}

export async function cancelInviteApi(inviteId: string): Promise<void> {
  await apiFetchClient(`/invites/${inviteId}/cancel/`, { method: "POST" });
}

export interface PatientRecord {
  patient: {
    id: string;
    name: string;
    birth_date: string;
    gender: string;
    blood_type: string | null;
    health_conditions: string;
    allergies: string;
    medications: string;
    health_status: string;
    health_validated_at: string | null;
    observations: string;
    complexity: string | null;
    clinic_name: string | null;
    created_at: string;
  };
  contracts: Array<Record<string, unknown>>;
  care_plan: Record<string, unknown> | null;
  caregivers: Array<Record<string, unknown>>;
  emergency_contacts: Array<Record<string, unknown>>;
  timeline: Array<{
    event_type: string;
    timestamp: string;
    title: string;
    description: string;
    actor_name: string;
    data: Record<string, unknown>;
  }>;
}

export async function fetchPatientRecord(id: string): Promise<PatientRecord | null> {
  try {
    return await apiFetchClient<PatientRecord>(`/patients/${id}/record/`);
  } catch {
    return null;
  }
}

export function getPatientRecordExportUrl(id: string): string {
  return `/api/proxy/patients/${id}/record/export/`;
}

export async function removeEmergencyContactApi(
  patientId: string,
  contactId: string
): Promise<void> {
  await apiFetchClient(`/patients/${patientId}/contacts/internal/${contactId}/`, {
    method: "DELETE",
  });
}
