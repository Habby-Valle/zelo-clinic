"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getClinic, updateClinicApi, type UpdateClinicData } from "@/features/clinic/services"

export function useClinic() {
  return useQuery({
    queryKey: ["clinic", "me"],
    queryFn: getClinic,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })
}

export function useUpdateClinic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateClinicData) => updateClinicApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic", "me"] })
    },
  })
}
