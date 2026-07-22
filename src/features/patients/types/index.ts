export interface CaregiverAssignment {
  id: string;
  caregiver_id: string;
  caregiver_name: string;
  caregiver_email: string | null;
}

export interface EmergencyContactInfo {
  id: string;
  profile_family_id: string;
  profile_family_name: string;
  profile_family_phone: string;
  priority: number;
}

export interface PatientDocument {
  id: string;
  kind: string;
  media_id: string;
  media_url: string | null;
  mime_type: string;
  original_filename: string;
  uploaded_by_name: string | null;
  created_at: string;
}

export interface ClinicPatient {
  id: string;
  clinic_id: string | null;
  name: string;
  birth_date: string;
  gender: "M" | "F" | "O";
  cpf: string | null;
  phone: string;
  email: string | null;
  health_conditions: string;
  allergies: string;
  medications: string;
  blood_type: string | null;
  health_status: string;
  observations: string;
  media_id: string | null;
  media: { id: string; url: string } | null;
  clinic_name: string | null;
  is_active: boolean;
  contract_start_date: string | null;
  active_contract_id: string | null;
  active_contract_weekly_hours: number | null;
  contract_preferred_weekdays: number[] | null;
  contract_preferred_start_time: string | null;
  contract_preferred_end_time: string | null;
  emergency_contacts: EmergencyContactInfo[];
  caregiver_assignments: CaregiverAssignment[];
  documents: PatientDocument[];
  created_at: string;
  updated_at: string;
  caregiver_count: number;
  photo_url: string | null;
}

export interface PatientCaregiver {
  id: string;
  name: string;
  email: string;
}

export interface PendingInvite {
  id: string;
  email: string;
  status: string;
  created_at: string;
}

export interface PatientsPage {
  patients: ClinicPatient[];
  total: number;
}
