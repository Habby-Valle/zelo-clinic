const FAQ = [
  {
    question: "Como a minha clínica começa a usar o Zelo?",
    answer:
      "O acesso é liberado por convite. Envie o seu contato pelo formulário e a nossa equipe cuida do onboarding da sua clínica.",
  },
  {
    question: "Preciso instalar algo?",
    answer:
      "Não. O painel da clínica funciona no navegador e os cuidadores e famílias usam o aplicativo Zelo no celular.",
  },
  {
    question: "Tenho fidelidade ou multa por cancelamento?",
    answer:
      "Não há fidelidade. Os planos são mensais e você pode cancelar quando quiser, sem multa.",
  },
  {
    question: "Os dados dos pacientes ficam seguros?",
    answer:
      "Sim. Os dados são protegidos, com controle de acesso por perfil e registro de auditoria das operações sensíveis.",
  },
];

export function LandingFaq() {
  return (
    <section className="border-b bg-muted/30">
      <div className="mx-auto max-w-3xl px-4 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Perguntas frequentes</h2>
        </div>
        <div className="mt-12 space-y-4">
          {FAQ.map((item) => (
            <details
              key={item.question}
              className="group rounded-xl border bg-card p-5 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between font-medium">
                {item.question}
                <span className="ml-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
