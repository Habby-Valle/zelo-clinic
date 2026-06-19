"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchShiftsApi,
  fetchShiftApi,
  fetchShiftTemplatesApi,
  fetchClinicPatientsApi,
  fetchClinicCaregiversApi,
  fetchChecklistOptionsApi,
} from "../services";
import type { ShiftFilters } from "../types";

export function useShifts(params: ShiftFilters) {
  return useQuery({
    queryKey: ["shifts", params],
    queryFn: () => fetchShiftsApi(params),
  });
}

export function useShift(id: number) {
  return useQuery({
    queryKey: ["shift", id],
    queryFn: () => fetchShiftApi(id),
    enabled: !!id,
  });
}

export function useShiftTemplates() {
  return useQuery({
    queryKey: ["shift-templates"],
    queryFn: fetchShiftTemplatesApi,
  });
}

export function useClinicPatients() {
  return useQuery({
    queryKey: ["shift-patients-options"],
    queryFn: fetchClinicPatientsApi,
    staleTime: 5 * 60 * 1000,
  });
}

export function useClinicCaregivers() {
  return useQuery({
    queryKey: ["shift-caregivers-options"],
    queryFn: fetchClinicCaregiversApi,
    staleTime: 5 * 60 * 1000,
  });
}

export function useChecklistOptions() {
  return useQuery({
    queryKey: ["shift-checklist-options"],
    queryFn: fetchChecklistOptionsApi,
    staleTime: 5 * 60 * 1000,
  });
}
