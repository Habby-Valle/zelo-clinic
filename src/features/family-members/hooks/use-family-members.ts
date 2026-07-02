"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchFamilyMembers, fetchFamilyMember } from "../services";

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
