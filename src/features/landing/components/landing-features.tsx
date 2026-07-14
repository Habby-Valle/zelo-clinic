import { CalendarClock, ClipboardCheck, Pill, BarChart3, Bell, Star } from "lucide-react";

const FEATURES = [
  {
    icon: CalendarClock,
    title: "Turnos e escalas",
    description:
      "Organize os turnos dos cuidadores, com recorrência e acompanhamento das horas trabalhadas.",
  },
  {
    icon: ClipboardCheck,
    title: "Checklists de cuidado",
    description:
      "Planos de cuidado com tarefas padronizadas — cada visita registra o que foi feito.",
  },
  {
    icon: Pill,
    title: "Controle de medicação",
    description:
      "Registro de administração de medicamentos (MAR) a partir da prescrição da família.",
  },
  {
    icon: BarChart3,
    title: "Relatórios completos",
    description:
      "Relatórios diários, contratos, SOS e satisfação — visão clara da operação da clínica.",
  },
  {
    icon: Bell,
    title: "Notificações e SOS",
    description: "Alertas em tempo real para a família e a clínica, incluindo pedidos de socorro.",
  },
  {
    icon: Star,
    title: "Qualidade e satisfação",
    description: "Pesquisas de satisfação e indicadores de qualidade para melhorar continuamente.",
  },
];

export function LandingFeatures() {
  return (
    <section id="recursos" className="border-b bg-background">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Tudo o que a sua clínica precisa
          </h2>
          <p className="mt-4 text-muted-foreground">
            Uma plataforma única para coordenar cuidados, dar transparência às famílias e ter
            controle da operação.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-2xl border bg-card p-6">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
