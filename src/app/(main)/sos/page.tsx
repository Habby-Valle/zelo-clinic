import { Suspense } from "react"
import { AlertTriangle } from "lucide-react"
import { SosClient } from "@/features/sos"

export default function SosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <AlertTriangle className="h-6 w-6" />
          Alertas SOS
        </h1>
        <p className="mt-1 text-muted-foreground">
          Alertas de emergência da clínica.
        </p>
      </div>

      <Suspense>
        <SosClient />
      </Suspense>
    </div>
  )
}
