import { apiFetchClient } from "@/lib/api-client"
import type { Feedback, FeedbackFilters } from "../types"

export async function fetchMyFeedbacks(
  params: FeedbackFilters
): Promise<{ feedbacks: Feedback[]; total: number }> {
  const qs = new URLSearchParams()
  if (params.type && params.type !== "all") qs.set("type", params.type)
  if (params.status && params.status !== "all") qs.set("status", params.status)
  qs.set("page", String(params.page ?? 1))
  qs.set("page_size", String(params.page_size ?? 10))

  const data = await apiFetchClient<{ count: number; results: Feedback[] }>(
    `/feedback/my/?${qs}`
  )
  return { feedbacks: data.results ?? [], total: data.count ?? 0 }
}

export async function uploadMediaApi(file: File): Promise<number> {
  const formData = new FormData()
  formData.append("file", file)
  const data = await apiFetchClient<{ id: number }>("/media/", {
    method: "POST",
    body: formData,
  })
  return data.id
}

export async function sendFeedbackApi(body: {
  type: string
  subject: string
  message: string
  clinic_id?: string | null
  page_url?: string
  media_ids?: number[]
}): Promise<void> {
  await apiFetchClient("/feedback/", {
    method: "POST",
    body: JSON.stringify(body),
  })
}
