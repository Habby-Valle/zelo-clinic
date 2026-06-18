export interface CaregiverAssignment {
  id: number
  caregiver_id: number
  caregiver_name: string
  caregiver_email: string | null
}

export interface EmergencyContactInfo {
  id: number
  profile_family_id: number
  profile_family_name: string
  profile_family_phone: string
  priority: number
}

export interface ClinicPatient {
  id: string
  clinic_id: string | null
  guardian_id: string | null
  name: string
  birth_date: string
  gender: "M" | "F" | "O"
  cpf: string | null
  phone: string
  email: string | null
  health_conditions: string
  allergies: string
  medications: string
  blood_type: string | null
  observations: string
  media_id: number | null
  media: { id: string; url: string } | null
  clinic_name: string | null
  is_active: boolean
  emergency_contacts: EmergencyContactInfo[]
  caregiver_assignments: CaregiverAssignment[]
  created_at: string
  updated_at: string
  caregiver_count: number
  photo_url: string | null
}

export interface PatientCaregiver {
  id: string
  name: string
  email: string
}

export interface PendingInvite {
  id: number
  email: string
  status: string
  created_at: string
}

export interface PatientsPage {
  patients: ClinicPatient[]
  total: number
}
