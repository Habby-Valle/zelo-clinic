"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createLead } from "@/features/landing/services";

const leadSchema = z.object({
  name: z.string().min(2, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().optional(),
  clinic_name: z.string().optional(),
  city: z.string().optional(),
  message: z.string().optional(),
  // Honeypot anti-spam — invisível para humanos.
  website: z.string().optional(),
});

type LeadSchema = z.infer<typeof leadSchema>;

export function LeadForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadSchema>({ resolver: zodResolver(leadSchema) });

  async function onSubmit(data: LeadSchema) {
    setServerError(null);
    try {
      await createLead(data);
      setSent(true);
    } catch {
      setServerError("Não foi possível enviar. Tente novamente em instantes.");
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center rounded-2xl border bg-card p-10 text-center">
        <CheckCircle2 className="size-12 text-primary" />
        <h3 className="mt-4 text-xl font-semibold">Recebemos o seu contato!</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Nossa equipe vai retornar em breve para apresentar o Zelo para a sua clínica.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border bg-card p-6 md:p-8"
      noValidate
    >
      {serverError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {/* Honeypot: mantido fora do fluxo visual e do tab order. */}
      <div aria-hidden className="hidden">
        <label htmlFor="website">Não preencha este campo</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="lead-name">Nome *</Label>
          <Input
            id="lead-name"
            placeholder="Seu nome"
            disabled={isSubmitting}
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lead-email">E-mail *</Label>
          <Input
            id="lead-email"
            type="email"
            placeholder="seu@email.com"
            disabled={isSubmitting}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lead-phone">Telefone / WhatsApp</Label>
          <Input
            id="lead-phone"
            placeholder="(00) 00000-0000"
            disabled={isSubmitting}
            {...register("phone")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lead-clinic">Nome da clínica</Label>
          <Input
            id="lead-clinic"
            placeholder="Sua clínica"
            disabled={isSubmitting}
            {...register("clinic_name")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lead-city">Cidade</Label>
          <Input
            id="lead-city"
            placeholder="Cidade / UF"
            disabled={isSubmitting}
            {...register("city")}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="lead-message">Mensagem</Label>
          <Textarea
            id="lead-message"
            placeholder="Conte um pouco sobre a sua clínica e o que procura."
            rows={4}
            disabled={isSubmitting}
            {...register("message")}
          />
        </div>
      </div>

      <Button type="submit" size="lg" className="mt-6 w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Enviando…
          </>
        ) : (
          "Enviar contato"
        )}
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Ao enviar, você concorda em ser contatado pela equipe Zelo.
      </p>
    </form>
  );
}
