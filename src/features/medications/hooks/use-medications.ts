"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMedications,
  fetchMedicationSuggestions,
  createMedication,
  updateMedication,
  deleteMedication,
} from "../services/medication.service";
import type { SaveMedicationInput } from "../types";

export function useMedications(patientId: string) {
  return useQuery({
    queryKey: ["medications", patientId],
    queryFn: () => fetchMedications(patientId),
    enabled: !!patientId,
  });
}

export function useMedicationSuggestions(patientId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["medication-suggestions", patientId],
    queryFn: () => fetchMedicationSuggestions(patientId),
    enabled: !!patientId && enabled,
    staleTime: Infinity, // extração é cara; não refazer sozinha
    retry: false,
  });
}

export function useCreateMedication(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveMedicationInput) => createMedication(patientId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications", patientId] });
    },
  });
}

export function useUpdateMedication(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ medId, input }: { medId: string; input: Partial<SaveMedicationInput> }) =>
      updateMedication(patientId, medId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications", patientId] });
    },
  });
}

export function useDeleteMedication(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (medId: string) => deleteMedication(patientId, medId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications", patientId] });
    },
  });
}
