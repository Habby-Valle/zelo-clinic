import { buttonVariants } from "@/components/ui/button";
import { ShieldCheck, HeartPulse, Users } from "lucide-react";

const HIGHLIGHTS = [
  { icon: HeartPulse, label: "Cuidado acompanhado em tempo real" },
  { icon: ShieldCheck, label: "Dados protegidos e auditados" },
  { icon: Users, label: "Família, cuidadores e clínica conectados" },
];

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 to-background">
      <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            Plataforma de gestão de cuidados
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-balance md:text-6xl">
            Gestão de cuidados que a sua clínica e as famílias podem confiar
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-pretty text-muted-foreground">
            O Zelo conecta clínicas, cuidadores e famílias em um só lugar — turnos, checklists,
            medicações e relatórios de cada visita, com transparência total.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#contato" className={buttonVariants({ size: "lg", className: "px-6" })}>
              Fale com a gente
            </a>
            <a
              href="#planos"
              className={buttonVariants({ variant: "outline", size: "lg", className: "px-6" })}
            >
              Ver planos
            </a>
          </div>
        </div>
        <div className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-xl border bg-background/60 p-4 text-sm"
            >
              <item.icon className="size-5 shrink-0 text-primary" />
              <span className="font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
