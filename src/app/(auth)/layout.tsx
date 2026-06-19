import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeJwt, isTokenExpired } from "@/lib/jwt";
import { BriefcaseMedical, Heart, Shield, Users } from "lucide-react";

const features = [
  { icon: Users, text: "Gestão completa de pacientes e cuidadores" },
  { icon: BriefcaseMedical, text: "Controle de turnos e checklists" },
  { icon: Shield, text: "Alertas SOS em tempo real" },
  { icon: Heart, text: "Relatórios e auditoria da clínica" },
];

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("ze_access")?.value;

  if (accessToken) {
    const payload = decodeJwt(accessToken);
    if (payload && !isTokenExpired(payload) && payload.role === "clinic_admin") {
      redirect("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Painel esquerdo — branding */}
      <div className="hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex lg:w-1/2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
            <BriefcaseMedical className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest text-white/60 uppercase">Zelo</p>
            <p className="text-sm leading-none font-bold">Clinic</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl leading-tight font-bold tracking-tight">
              Cuidado com
              <br />
              excelência.
            </h1>
            <p className="max-w-sm text-lg leading-relaxed text-white/70">
              Gerencie sua clínica, sua equipe e seus pacientes em um único lugar.
            </p>
          </div>

          <ul className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm text-white/80">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} Zelo. Todos os direitos reservados.
        </p>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
        {/* Logo mobile */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <BriefcaseMedical className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">Zelo Clinic</span>
        </div>

        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
