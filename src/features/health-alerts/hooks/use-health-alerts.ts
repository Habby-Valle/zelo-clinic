"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchHealthAlertsApi,
  acknowledgeHealthAlertApi,
  resolveHealthAlertApi,
} from "../services/health-alert.service";
import type { HealthAlertFilters } from "../types";

export function useHealthAlerts(filters: HealthAlertFilters) {
  return useQuery({
    queryKey: ["health-alerts", filters],
    queryFn: () => fetchHealthAlertsApi(filters),
    enabled: !!filters.patient_id,
  });
}

export function useAcknowledgeHealthAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => acknowledgeHealthAlertApi(id),
    onSuccess: () => {
      toast.success("Alerta reconhecido.");
      queryClient.invalidateQueries({ queryKey: ["health-alerts"] });
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Erro ao reconhecer alerta.");
    },
  });
}

export function useResolveHealthAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resolveHealthAlertApi(id),
    onSuccess: () => {
      toast.success("Alerta resolvido.");
      queryClient.invalidateQueries({ queryKey: ["health-alerts"] });
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Erro ao resolver alerta.");
    },
  });
}
