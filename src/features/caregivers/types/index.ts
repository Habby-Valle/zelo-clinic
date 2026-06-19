export interface CaregiverProfile {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: string;
  media_id: number | null;
  is_active: boolean;
  patient_count: number;
  created_at: string;
}

export interface CaregiverInvite {
  id: number;
  email: string;
  role: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  created_by_name: string;
  clinic_id: number;
  guardian_id: number | null;
  patient_id: number | null;
  created_at: string;
  expires_at: string;
}
