"use client"

import { useQuery } from "@tanstack/react-query"
import { getClinic } from "@/features/clinic/services"

export function useClinic() {
  return useQuery({
    queryKey: ["clinic", "me"],
    queryFn: getClinic,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })
}
