export interface AuditLog {
  id: string
  user_id: string | null
  user_name: string | null
  user_email: string | null
  action: string
  content_type_name: string | null
  object_id: string
  description: string
  created_at: string
}

export interface AuditLogDetail extends AuditLog {
  changes: Record<string, unknown> | null
  ip_address: string | null
}

export interface AuditLogFilters {
  action?: string
  content_type?: string
  search?: string
  date_from?: string
  date_to?: string
  page?: number
  page_size?: number
}
