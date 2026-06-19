"use client";

import { Shield } from "lucide-react";
import { AuditLogDetailClient } from "@/features/audit-logs";

export default function AuditLogDetailPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Shield className="h-6 w-6" />
          Detalhes do Log de Auditoria
        </h1>
      </div>

      <AuditLogDetailClient />
    </div>
  );
}
