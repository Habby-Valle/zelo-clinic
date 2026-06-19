import { use } from "react"
import { ChecklistDetailClient } from "@/features/checklists/components"

interface Props {
  params: Promise<{ id: string }>
}

export default function ChecklistDetailPage({ params }: Props) {
  const { id } = use(params)
  return <ChecklistDetailClient id={Number(id)} />
}
