export type ChecklistItemType = "text" | "boolean" | "select" | "number"

export interface ChecklistItemOption {
  id: string
  label: string
  value: string
}

export interface ChecklistItem {
  id: string
  name: string
  type: ChecklistItemType
  required: boolean
  has_observation: boolean
  order: number
  options: ChecklistItemOption[]
}

export interface Checklist {
  id: number
  name: string
  icon: string | null
  order: number
  is_active: boolean
  clinic_id: number | null
  clinic_name: string | null
  created_by_name: string | null
  items_count: number
  created_at: string
}

export interface ChecklistDetail {
  id: number
  name: string
  icon: string | null
  order: number
  is_active: boolean
  clinic_id: number | null
  clinic_name: string | null
  created_by_name: string | null
  items: ChecklistItem[]
  created_at: string
}

export interface ChecklistFilters {
  search?: string
  isActive?: string
  page?: number
  pageSize?: number
}
