import { Suspense } from "react";
import { AuditLogsClient } from "@/features/audit-logs";

export const metadata = { title: "Logs de Auditoria — Zelo Clinic" };

export default function AuditLogsPage() {
  return (
    <Suspense fallback={null}>
      <AuditLogsClient />
    </Suspense>
  );
}
