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

// Turnos num intervalo de datas (para o calendário). Filtros opcionais:
// paciente (visão do paciente) ou status (visão da clínica).
export function useShiftsRange(
  dateFrom: string,
  dateTo: string,
  filters?: { patient_id?: string; status?: string }
) {
  return useQuery({
    queryKey: ["shifts", "range", dateFrom, dateTo, filters ?? {}],
    queryFn: () =>
      fetchShiftsApi({
        ...filters,
        date_from: dateFrom,
        date_to: dateTo,
        page_size: 500,
      }),
    enabled: !!dateFrom && !!dateTo,
  });
}

export function usePatientShiftsRange(patientId: string, dateFrom: string, dateTo: string) {
  return useShiftsRange(patientId ? dateFrom : "", patientId ? dateTo : "", {
    patient_id: patientId,
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
