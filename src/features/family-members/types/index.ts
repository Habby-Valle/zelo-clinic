export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship_to_patient: string;
  patient_count: number;
  created_at: string;
}

export interface FamilyMemberPatient {
  id: string;
  name: string;
}

export interface FamilyMemberAddress {
  zip_code?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
}

export interface FamilyMemberDetail extends FamilyMember {
  patients: FamilyMemberPatient[];
  address?: FamilyMemberAddress | null;
}

export interface FamilyMembersPage {
  count: number;
  results: FamilyMember[];
}
