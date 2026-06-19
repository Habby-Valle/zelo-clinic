export type FeedbackType = "bug" | "feature" | "compliment" | "other"

export type FeedbackStatus = "received" | "in_review" | "resolved" | "closed"

export interface Feedback {
  id: number
  user_name: string | null
  user_email: string | null
  clinic_id: number | null
  type: FeedbackType
  type_display: string
  subject: string
  message: string
  page_url: string
  status: FeedbackStatus
  status_display: string
  media: { id: number; url: string; original_filename: string }[]
  created_at: string
  updated_at: string
}

export interface FeedbackFilters {
  type?: FeedbackType | "all"
  status?: FeedbackStatus | "all"
  page?: number
  page_size?: number
}
