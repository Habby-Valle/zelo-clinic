"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchSosAlertsApi,
  fetchSosSummaryApi,
  acknowledgeSosAlertApi,
  resolveSosAlertApi,
} from "../services";
import type { SosFilters } from "../types";

export function useSosAlerts(params: SosFilters) {
  return useQuery({
    queryKey: ["sos", "alerts", params],
    queryFn: () => fetchSosAlertsApi(params),
  });
}

export function useSosSummary() {
  return useQuery({
    queryKey: ["sos", "summary"],
    queryFn: () => fetchSosSummaryApi(),
  });
}

export function useAcknowledgeSosAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => acknowledgeSosAlertApi(id),
    onSuccess: () => {
      toast.success("Alerta confirmado.");
      queryClient.invalidateQueries({ queryKey: ["sos"] });
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Erro ao confirmar alerta.");
    },
  });
}

export function useResolveSosAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => resolveSosAlertApi(id, reason),
    onSuccess: () => {
      toast.success("Alerta resolvido.");
      queryClient.invalidateQueries({ queryKey: ["sos"] });
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Erro ao resolver alerta.");
    },
  });
}
