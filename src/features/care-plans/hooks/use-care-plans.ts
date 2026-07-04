"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  activateCarePlan,
  createCarePlan,
  fetchCaregiverOptions,
  fetchCarePlanByPatient,
  fetchChecklistOptions,
  updateCarePlan,
} from "../services/care-plan.service";
import type { SaveCarePlanInput } from "../types";

export function useCarePlan(patientId: string) {
  return useQuery({
    queryKey: ["care-plan", patientId],
    queryFn: () => fetchCarePlanByPatient(patientId),
    enabled: !!patientId,
  });
}

export function useChecklistOptionsForPlan() {
  return useQuery({
    queryKey: ["checklist-options-plan"],
    queryFn: fetchChecklistOptions,
  });
}

export function useCaregiverOptionsForPlan() {
  return useQuery({
    queryKey: ["caregiver-options-plan"],
    queryFn: fetchCaregiverOptions,
  });
}

export function useSaveCarePlan(patientId: string, planId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveCarePlanInput) =>
      planId ? updateCarePlan(planId, input) : createCarePlan(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["care-plan", patientId] });
    },
  });
}

export function useActivateCarePlan(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => activateCarePlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["care-plan", patientId] });
    },
  });
}
