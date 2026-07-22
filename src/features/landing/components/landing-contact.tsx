import { LeadForm } from "@/features/landing/components/lead-form";

export function LandingContact() {
  return (
    <section id="contato" className="border-b bg-background">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 lg:grid-cols-2">
        <div className="lg:pt-6">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Vamos conversar sobre a sua clínica
          </h2>
          <p className="mt-4 text-muted-foreground">
            Deixe seus dados e a nossa equipe entra em contato para apresentar o Zelo, entender a
            sua operação e liberar o acesso da sua clínica.
          </p>
          <ul className="mt-8 space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                1
              </span>
              <span>Você envia o contato pelo formulário ao lado.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                2
              </span>
              <span>Nossa equipe entra em contato e apresenta a plataforma.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                3
              </span>
              <span>Enviamos o convite para você configurar a sua clínica no Zelo.</span>
            </li>
          </ul>
        </div>
        <LeadForm />
      </div>
    </section>
  );
}
