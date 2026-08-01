"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchFamilyMembers,
  fetchFamilyMember,
  inviteFamilyMemberApi,
  generateFamilyLinkCodeApi,
} from "../services";

export function useFamilyMembers(params: { search: string; page: number; pageSize: number }) {
  return useQuery({
    queryKey: ["family-members", params.search, params.page, params.pageSize],
    queryFn: () => fetchFamilyMembers(params),
  });
}

export function useFamilyMember(id: string) {
  return useQuery({
    queryKey: ["family-members", id],
    queryFn: () => fetchFamilyMember(id),
    enabled: !!id,
  });
}

export function useInviteFamilyMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, clinicId }: { email: string; clinicId: string }) =>
      inviteFamilyMemberApi(email, clinicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family-members"] });
    },
  });
}

export function useGenerateFamilyLinkCode() {
  return useMutation({
    mutationFn: (email: string) => generateFamilyLinkCodeApi(email),
  });
}
