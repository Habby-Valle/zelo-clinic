import { apiFetchClient } from "@/lib/api-client"
import type { Clinic } from "@/features/clinic/types"

export async function getClinic(): Promise<Clinic> {
  return apiFetchClient<Clinic>("/clinics/me/")
}

export interface UpdateClinicData {
  phone?: string
  document?: string
  media_id?: number | null
  theme_color?: string | null
  address?: {
    zip_code?: string
    street?: string
    number?: string
    complement?: string
    neighborhood?: string
    city?: string
    state?: string
    country?: string
  } | null
}

export async function updateClinicApi(data: UpdateClinicData): Promise<Clinic> {
  return apiFetchClient<Clinic>("/clinics/me/", {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}
