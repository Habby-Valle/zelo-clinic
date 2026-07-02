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

export interface FamilyMemberDetail extends FamilyMember {
  patients: FamilyMemberPatient[];
}

export interface FamilyMembersPage {
  count: number;
  results: FamilyMember[];
}
