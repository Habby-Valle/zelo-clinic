export type VerificationStatus = "pending" | "approved" | "rejected";

export interface CaregiverProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  media_id: string | null;
  is_active: boolean;
  patient_count: number;
  professional_register?: string | null;
  verification_status: VerificationStatus | null;
  verification_note: string | null;
  verified_at: string | null;
  created_at: string;
}

export interface CaregiverInvite {
  id: string;
  email: string;
  role: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  created_by_name: string;
  clinic_id: string;
  guardian_id: string | null;
  patient_id: string | null;
  created_at: string;
  expires_at: string;
}
