"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAsaasConfig,
  updateAsaasConfig,
  testAsaasConnection,
  type UpdateAsaasConfigData,
} from "@/features/clinic/services/asaas.service";

export function useAsaasConfig() {
  return useQuery({
    queryKey: ["asaas", "config"],
    queryFn: getAsaasConfig,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateAsaasConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateAsaasConfigData) => updateAsaasConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["asaas", "config"] });
    },
  });
}

export function useTestAsaasConnection() {
  return useMutation({
    mutationFn: testAsaasConnection,
  });
}
