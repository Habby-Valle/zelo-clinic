"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPatientAssessment,
  fetchPatientAssessments,
  updatePatientAssessment,
} from "../services/patient-assessment.service";
import type { SavePatientAssessmentInput } from "../types";

export function usePatientAssessments(patientId: string) {
  return useQuery({
    queryKey: ["patient-assessments", patientId],
    queryFn: () => fetchPatientAssessments(patientId),
    enabled: !!patientId,
  });
}

export function useCreatePatientAssessment(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SavePatientAssessmentInput) => createPatientAssessment(patientId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["patient-assessments", patientId],
      });
    },
  });
}

export function useUpdatePatientAssessment(patientId: string, assessmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SavePatientAssessmentInput) =>
      updatePatientAssessment(patientId, assessmentId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["patient-assessments", patientId],
      });
    },
  });
}
