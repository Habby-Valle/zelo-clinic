import { Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PublicPlan } from "@/features/landing/types";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function planHighlights(plan: PublicPlan): string[] {
  const items: string[] = [];
  items.push(`Até ${plan.max_patients} pacientes`);
  items.push(`Até ${plan.max_caregivers} cuidadores`);
  items.push(`${plan.max_family_per_patient} familiares por paciente`);
  if (plan.reports_level !== "none") {
    items.push(plan.reports_level === "advanced" ? "Relatórios avançados" : "Relatórios básicos");
  }
  if (plan.has_data_export) items.push("Exportação de dados");
  if (plan.has_custom_branding) items.push("Marca personalizada");
  for (const benefit of plan.benefits) {
    items.push(benefit.benefit_label);
  }
  return items;
}

interface LandingPricingProps {
  plans: PublicPlan[];
}

export function LandingPricing({ plans }: LandingPricingProps) {
  if (plans.length === 0) return null;

  // Destaca o plano do meio quando houver mais de um.
  const featuredIndex = plans.length > 1 ? Math.floor(plans.length / 2) : -1;

  return (
    <section id="planos" className="border-b bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Planos para cada clínica
          </h2>
          <p className="mt-4 text-muted-foreground">
            Escolha o plano ideal para o tamanho da sua operação. Sem fidelidade — cancele quando
            quiser.
          </p>
        </div>
        <div
          className={cn(
            "mt-14 grid gap-6",
            plans.length === 1 && "mx-auto max-w-md",
            plans.length === 2 && "sm:grid-cols-2",
            plans.length >= 3 && "sm:grid-cols-2 lg:grid-cols-3"
          )}
        >
          {plans.map((plan, index) => {
            const featured = index === featuredIndex;
            return (
              <div
                key={plan.id}
                className={cn(
                  "flex flex-col rounded-2xl border bg-card p-6",
                  featured && "border-primary shadow-lg ring-1 ring-primary"
                )}
              >
                {featured && (
                  <span className="mb-4 inline-flex w-fit items-center rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Mais popular
                  </span>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                {plan.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                )}
                <div className="mt-6">
                  <span className="text-4xl font-bold">{formatCurrency(plan.monthly_price)}</span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>
                {plan.yearly_price != null && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    ou {formatCurrency(plan.yearly_price)}/ano
                  </p>
                )}
                <ul className="mt-6 flex-1 space-y-3 text-sm">
                  {planHighlights(plan).map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#contato"
                  className={cn(
                    buttonVariants({
                      variant: featured ? "default" : "outline",
                      size: "lg",
                    }),
                    "mt-8 w-full"
                  )}
                >
                  Quero este plano
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
