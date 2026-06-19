import { use } from "react"
import { ShiftDetailClient } from "@/features/shifts/components"

interface Props {
  params: Promise<{ id: string }>
}

export default function ShiftDetailPage({ params }: Props) {
  const { id } = use(params)
  return <ShiftDetailClient id={Number(id)} />
}
