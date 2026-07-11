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

export function usePatientShifts(patientId: string) {
  return useShifts({ patient_id: patientId, page_size: 10 });
}

// Turnos de um paciente num intervalo de datas (para o calendário).
export function usePatientShiftsRange(
  patientId: string,
  dateFrom: string,
  dateTo: string
) {
  return useQuery({
    queryKey: ["shifts", "range", patientId, dateFrom, dateTo],
    queryFn: () =>
      fetchShiftsApi({
        patient_id: patientId,
        date_from: dateFrom,
        date_to: dateTo,
        page_size: 100,
      }),
    enabled: !!patientId && !!dateFrom && !!dateTo,
  });
}

export function useShift(id: string) {
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
