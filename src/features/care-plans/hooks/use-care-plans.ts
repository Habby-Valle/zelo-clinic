"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  approveCarePlan,
  createCarePlan,
  fetchActiveCarePlans,
  fetchCaregiverMatch,
  fetchCaregiverOptions,
  fetchCarePlanByPatient,
  fetchCarePlansForReview,
  fetchChecklistOptions,
  fetchChecklistSuggestions,
  returnCarePlan,
  submitCarePlan,
  updateCarePlan,
  updateCarePlanChecklists,
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

export function useChecklistSuggestions(patientId: string) {
  return useQuery({
    queryKey: ["checklist-suggestions", patientId],
    queryFn: () => fetchChecklistSuggestions(patientId),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCaregiverMatch(patientId: string) {
  return useQuery({
    queryKey: ["caregiver-match", patientId],
    queryFn: () => fetchCaregiverMatch(patientId),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
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

export function useSubmitCarePlan(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => submitCarePlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["care-plan", patientId] });
    },
  });
}

export function useCarePlansForReview() {
  return useQuery({
    queryKey: ["care-plans", "review"],
    queryFn: fetchCarePlansForReview,
  });
}

export function useActiveCarePlans() {
  return useQuery({
    queryKey: ["care-plans", "active"],
    queryFn: fetchActiveCarePlans,
  });
}

export function useApproveCarePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => approveCarePlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["care-plans"] });
    },
  });
}

export function useReturnCarePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, note }: { planId: string; note: string }) =>
      returnCarePlan(planId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["care-plans"] });
    },
  });
}

export function useUpdateCarePlanChecklists() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, checklistIds }: { planId: string; checklistIds: string[] }) =>
      updateCarePlanChecklists(planId, checklistIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["care-plans"] });
    },
  });
}
