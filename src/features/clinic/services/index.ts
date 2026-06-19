import { apiFetchClient } from "@/lib/api-client"
import type { Clinic } from "@/features/clinic/types"

export async function getClinic(): Promise<Clinic> {
  return apiFetchClient<Clinic>("/clinics/me/")
}
