import { apiFetchClient } from "@/lib/api-client";
import type { FamilyMember, FamilyMemberDetail, FamilyMembersPage } from "../types";

export async function fetchFamilyMembers(params: {
  search: string;
  page: number;
  pageSize: number;
}): Promise<{ familyMembers: FamilyMember[]; total: number }> {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  qs.set("page", String(params.page));
  qs.set("page_size", String(params.pageSize));

  const data = await apiFetchClient<FamilyMembersPage>(`/family/members/?${qs}`);

  return { familyMembers: data.results ?? [], total: data.count ?? 0 };
}

export async function fetchFamilyMember(id: string): Promise<FamilyMemberDetail> {
  return apiFetchClient<FamilyMemberDetail>(`/family/members/${id}/`);
}

export async function inviteFamilyMemberApi(email: string, clinicId: string): Promise<void> {
  await apiFetchClient("/invites/", {
    method: "POST",
    body: JSON.stringify({
      email,
      role: "family",
      clinic_id: clinicId,
    }),
  });
}

export async function generateFamilyLinkCodeApi(email: string): Promise<{
  id: string;
  email: string;
  role: string;
  code: string;
}> {
  return apiFetchClient("/invites/link-codes/", {
    method: "POST",
    body: JSON.stringify({ email, role: "family" }),
  });
}
