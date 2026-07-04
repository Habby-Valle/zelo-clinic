import { apiFetchClient } from "@/lib/api-client";
import type { CaregiverProfile, CaregiverInvite } from "../types";

export async function fetchCaregivers(params: {
  search: string;
  page: number;
  pageSize: number;
}): Promise<{ caregivers: CaregiverProfile[]; total: number }> {
  const qs = new URLSearchParams({ role: "caregiver" });
  if (params.search) qs.set("search", params.search);
  qs.set("page", String(params.page));
  qs.set("page_size", String(params.pageSize));

  const data = await apiFetchClient<{
    count: number;
    results: CaregiverProfile[];
  }>(`/users/?${qs}`);

  return { caregivers: data.results ?? [], total: data.count ?? 0 };
}

export async function fetchCaregiver(id: string): Promise<CaregiverProfile> {
  return apiFetchClient<CaregiverProfile>(`/users/${id}/`);
}

export async function verifyCaregiverApi(
  id: string,
  action: "approve" | "reject",
  note = ""
): Promise<CaregiverProfile> {
  return apiFetchClient<CaregiverProfile>(`/users/${id}/verify/`, {
    method: "POST",
    body: JSON.stringify({ action, note }),
  });
}

export async function fetchCaregiverInvites(params: {
  search: string;
  page: number;
  pageSize: number;
}): Promise<{ invites: CaregiverInvite[]; total: number }> {
  const qs = new URLSearchParams({ role: "caregiver" });
  if (params.search) qs.set("search", params.search);
  qs.set("page", String(params.page));
  qs.set("page_size", String(params.pageSize));

  const data = await apiFetchClient<{
    count: number;
    results: CaregiverInvite[];
  }>(`/invites/?${qs}`);

  return { invites: data.results ?? [], total: data.count ?? 0 };
}

export async function inviteCaregiverApi(email: string, clinicId: string): Promise<void> {
  await apiFetchClient("/invites/", {
    method: "POST",
    body: JSON.stringify({
      email,
      role: "caregiver",
      clinic_id: clinicId,
    }),
  });
}

export async function inviteNurseApi(email: string, clinicId: string): Promise<void> {
  await apiFetchClient("/invites/", {
    method: "POST",
    body: JSON.stringify({
      email,
      role: "clinic_nurse",
      clinic_id: clinicId,
    }),
  });
}

export async function cancelCaregiverInviteApi(inviteId: string): Promise<void> {
  await apiFetchClient(`/invites/${inviteId}/cancel/`, { method: "POST" });
}

export async function generateLinkCodeApi(
  email: string,
  role: "caregiver" | "clinic_nurse" = "caregiver"
): Promise<{ id: string; email: string; role: string; code: string }> {
  return apiFetchClient("/invites/link-codes/", {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
}
