"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchContracts,
  fetchContractById,
  fetchPricingSuggestion,
  transitionContractApi,
  updateContractApi,
  validateHealthApi,
} from "../services";

export function useContracts(params: {
  status: string;
  search: string;
  page: number;
  pageSize: number;
}) {
  return useQuery({
    queryKey: ["contracts", params.status, params.search, params.page, params.pageSize],
    queryFn: () => fetchContracts(params),
  });
}

export function useContract(id: string) {
  return useQuery({
    queryKey: ["contracts", id],
    queryFn: () => fetchContractById(id),
    enabled: !!id,
  });
}

export function useUpdateContract(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof updateContractApi>[1]) => updateContractApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts", id] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}

export function useTransitionContract(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      status: "suspended" | "active" | "cancelled" | "expired";
      reason?: string;
    }) => transitionContractApi(id, vars.status, vars.reason ?? ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts", id] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}

export function usePricingSuggestion(contractId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["pricing-suggestion", contractId],
    queryFn: () => fetchPricingSuggestion(contractId),
    enabled: !!contractId && enabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useValidateHealth(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => validateHealthApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts", id] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}
