import { Settings } from "lucide-react"
import { SettingsClient } from "@/features/clinic/components"

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Settings className="h-6 w-6" />
          Configurações
        </h1>
        <p className="mt-1 text-muted-foreground">
          Gerencie as informações da sua clínica.
        </p>
      </div>

      <SettingsClient />
    </div>
  )
}
