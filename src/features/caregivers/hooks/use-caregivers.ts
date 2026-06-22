"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCaregivers,
  fetchCaregiverInvites,
  inviteCaregiverApi,
  cancelCaregiverInviteApi,
} from "../services";

export function useCaregivers(params: { search: string; page: number; pageSize: number }) {
  return useQuery({
    queryKey: ["caregivers", params.search, params.page, params.pageSize],
    queryFn: () => fetchCaregivers(params),
  });
}

export function useCaregiverInvites(params: { search: string; page: number; pageSize: number }) {
  return useQuery({
    queryKey: ["caregiver-invites", params.search, params.page, params.pageSize],
    queryFn: () => fetchCaregiverInvites(params),
  });
}

export function useInviteCaregiver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, clinicId }: { email: string; clinicId: string }) =>
      inviteCaregiverApi(email, clinicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caregiver-invites"] });
    },
  });
}

export function useCancelCaregiverInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => cancelCaregiverInviteApi(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caregiver-invites"] });
    },
  });
}
