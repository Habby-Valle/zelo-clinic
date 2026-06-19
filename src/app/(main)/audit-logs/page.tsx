import { Suspense } from "react"
import { AuditLogsClient } from "@/features/audit-logs"

export default function AuditLogsPage() {
  return (
    <Suspense fallback={null}>
      <AuditLogsClient />
    </Suspense>
  )
}
