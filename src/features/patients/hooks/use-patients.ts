"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchPatients,
  fetchPatientById,
  fetchClinicCaregivers,
  fetchPendingInvites,
  createPatientApi,
  updatePatientApi,
  deletePatientApi,
  assignCaregiversApi,
  inviteFamilyApi,
  cancelInviteApi,
  removeEmergencyContactApi,
} from "../services"
import type { CaregiverAssignment } from "../types"

export function usePatients(params: {
  search: string
  isActive: string
  page: number
  pageSize: number
}) {
  return useQuery({
    queryKey: ["patients", params.search, params.isActive, params.page, params.pageSize],
    queryFn: () => fetchPatients(params),
  })
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ["patients", id],
    queryFn: () => fetchPatientById(id),
    enabled: !!id,
  })
}

export function useClinicCaregivers() {
  return useQuery({
    queryKey: ["clinic-caregivers"],
    queryFn: fetchClinicCaregivers,
  })
}

export function usePendingInvites(patientId: string) {
  return useQuery({
    queryKey: ["pending-invites", patientId],
    queryFn: () => fetchPendingInvites(patientId),
    enabled: !!patientId,
  })
}

export function useCreatePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => createPatientApi(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] })
    },
  })
}

export function useUpdatePatient(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<{ name: string; birth_date: string; is_active: boolean }>) =>
      updatePatientApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients", id] })
      queryClient.invalidateQueries({ queryKey: ["patients"] })
    },
  })
}

export function useDeletePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePatientApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] })
    },
  })
}

export function useAssignCaregivers(patientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      caregiverIds,
      currentAssignments,
    }: {
      caregiverIds: string[]
      currentAssignments: CaregiverAssignment[]
    }) => assignCaregiversApi(patientId, caregiverIds, currentAssignments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients", patientId] })
    },
  })
}

export function useInviteFamily(patientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ clinicId, email }: { clinicId: string; email: string }) =>
      inviteFamilyApi(patientId, clinicId, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-invites", patientId] })
    },
  })
}

export function useCancelInvite(patientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (inviteId: number) => cancelInviteApi(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-invites", patientId] })
    },
  })
}

export function useRemoveEmergencyContact(patientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (contactId: number) => removeEmergencyContactApi(patientId, contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients", patientId] })
    },
  })
}

export function useTogglePatientStatus(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (isActive: boolean) => updatePatientApi(id, { is_active: isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients", id] })
      queryClient.invalidateQueries({ queryKey: ["patients"] })
    },
  })
}
