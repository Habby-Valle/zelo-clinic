import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { decodeJwt, isTokenExpired } from "@/lib/jwt"
import { BriefcaseMedical, Heart, Shield, Users } from "lucide-react"

const features = [
  { icon: Users, text: "Gestão completa de pacientes e cuidadores" },
  { icon: BriefcaseMedical, text: "Controle de turnos e checklists" },
  { icon: Shield, text: "Alertas SOS em tempo real" },
  { icon: Heart, text: "Relatórios e auditoria da clínica" },
]

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("ze_access")?.value

  if (accessToken) {
    const payload = decodeJwt(accessToken)
    if (payload && !isTokenExpired(payload) && payload.role === "clinic_admin") {
      redirect("/dashboard")
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Painel esquerdo — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-blue-600 to-blue-800 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <BriefcaseMedical className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-blue-200">Zelo</p>
            <p className="text-sm font-bold leading-none">Clinic</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold leading-tight tracking-tight">
              Cuidado com
              <br />
              excelência.
            </h1>
            <p className="text-lg text-blue-100/80 leading-relaxed max-w-sm">
              Gerencie sua clínica, sua equipe e seus pacientes em um único lugar.
            </p>
          </div>

          <ul className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm text-blue-100/90">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-blue-300/60">
          © {new Date().getFullYear()} Zelo. Todos os direitos reservados.
        </p>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-12 dark:bg-zinc-950">
        {/* Logo mobile */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <BriefcaseMedical className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Zelo Clinic</span>
        </div>

        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
