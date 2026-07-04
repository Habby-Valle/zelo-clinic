"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchContracts,
  fetchContractById,
  sendProposalApi,
  rejectContractApi,
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

export function useSendProposal(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      price_per_hour: number;
      price_per_shift: number;
      night_surcharge?: number;
      night_surcharge_type?: string;
    }) => sendProposalApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts", id] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}

export function useRejectContract(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => rejectContractApi(id),
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
