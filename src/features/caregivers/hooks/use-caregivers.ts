"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCaregivers,
  fetchCaregiver,
  verifyCaregiverApi,
  fetchCaregiverInvites,
  inviteCaregiverApi,
  resendInviteApi,
  cancelCaregiverInviteApi,
  generateLinkCodeApi,
} from "../services";

interface ListParams {
  search: string;
  page: number;
  pageSize: number;
  isActive?: string;
}

interface InviteListParams {
  search: string;
  page: number;
  pageSize: number;
  status?: string;
  role?: string | null;
}

export function useCaregivers(params: ListParams) {
  return useQuery({
    queryKey: ["caregivers", params.search, params.isActive, params.page, params.pageSize],
    queryFn: () => fetchCaregivers(params, "caregiver"),
  });
}

export function useNurses(params: ListParams) {
  return useQuery({
    queryKey: ["nurses", params.search, params.isActive, params.page, params.pageSize],
    queryFn: () => fetchCaregivers(params, "clinic_nurse"),
  });
}

export function useCaregiver(id: string) {
  return useQuery({
    queryKey: ["caregiver", id],
    queryFn: () => fetchCaregiver(id),
    enabled: !!id,
  });
}

export function useVerifyCaregiver(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ action, note }: { action: "approve" | "reject"; note?: string }) =>
      verifyCaregiverApi(id, action, note),
    onSuccess: (data) => {
      queryClient.setQueryData(["caregiver", id], data);
      queryClient.invalidateQueries({ queryKey: ["caregivers"] });
      queryClient.invalidateQueries({ queryKey: ["nurses"] });
    },
  });
}

export function useCaregiverInvites(params: InviteListParams) {
  return useQuery({
    queryKey: ["invites", params.search, params.status, params.role, params.page, params.pageSize],
    queryFn: () => fetchCaregiverInvites(params),
  });
}

export function useInviteCaregiver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, clinicId }: { email: string; clinicId: string }) =>
      inviteCaregiverApi(email, clinicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites"] });
    },
  });
}

export function useResendInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => resendInviteApi(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites"] });
    },
  });
}

export function useCancelCaregiverInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => cancelCaregiverInviteApi(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites"] });
    },
  });
}

export function useGenerateLinkCode() {
  return useMutation({
    mutationFn: (email: string) => generateLinkCodeApi(email),
  });
}
