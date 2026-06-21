"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2 } from "lucide-react";

import {
  registerClinicAdminStep1Schema,
  registerClinicAdminStep2Schema,
  type RegisterClinicAdminStep1Values,
  type RegisterClinicAdminStep2Values,
} from "@/lib/validations/invite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InviteInfo {
  email: string;
  role: string;
  clinic_name: string | null;
}

export default function RegisterPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();

  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [step1Data, setStep1Data] = useState<RegisterClinicAdminStep1Values | null>(null);

  const form1 = useForm<RegisterClinicAdminStep1Values>({
    resolver: zodResolver(registerClinicAdminStep1Schema),
  });

  const form2 = useForm<RegisterClinicAdminStep2Values>({
    resolver: zodResolver(registerClinicAdminStep2Schema),
  });

  useEffect(() => {
    fetch(`/api/register/${params.token}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Convite inválido");
        setInviteInfo(data);
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, [params.token]);

  function onStep1Submit(values: RegisterClinicAdminStep1Values) {
    setStep1Data(values);
    setStep(2);
  }

  async function onStep2Submit(values: RegisterClinicAdminStep2Values) {
    if (!step1Data) return;
    setSubmitError(null);

    const { confirm_password, ...personal } = step1Data;
    const payload = { ...personal, ...values };
    void confirm_password;

    const res = await fetch(`/api/register/${params.token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      setSubmitError(data.error ?? "Erro ao criar conta");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 3000);
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-md space-y-4 text-center">
        <h1 className="text-xl font-bold">Convite inválido</h1>
        <p className="text-muted-foreground">{loadError}</p>
        <p className="text-sm text-muted-foreground">
          Este link pode ter expirado ou já ter sido utilizado. Entre em contato com o administrador.
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md space-y-4 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
        <h1 className="text-xl font-bold">Conta criada com sucesso!</h1>
        <p className="text-muted-foreground">
          Você será redirecionado para o login em instantes...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <span className={step === 1 ? "font-semibold text-foreground" : ""}>1. Seus dados</span>
          <span>→</span>
          <span className={step === 2 ? "font-semibold text-foreground" : ""}>2. Dados da clínica</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          {step === 1 ? "Criar sua conta" : "Cadastrar sua clínica"}
        </h1>
        {step === 1 && inviteInfo?.email && (
          <p className="mt-1 text-sm text-muted-foreground">
            Email: <strong>{inviteInfo.email}</strong>
          </p>
        )}
      </div>

      {submitError && (
        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{submitError}</div>
      )}

      {step === 1 && (
        <form onSubmit={form1.handleSubmit(onStep1Submit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome completo *</Label>
            <Input id="name" placeholder="Seu nome completo" {...form1.register("name")} />
            {form1.formState.errors.name && (
              <p className="text-xs text-destructive">{form1.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Telefone *</Label>
            <Input id="phone" placeholder="(11) 99999-9999" {...form1.register("phone")} />
            {form1.formState.errors.phone && (
              <p className="text-xs text-destructive">{form1.formState.errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Senha *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              {...form1.register("password")}
            />
            {form1.formState.errors.password && (
              <p className="text-xs text-destructive">{form1.formState.errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm_password">Confirmar senha *</Label>
            <Input
              id="confirm_password"
              type="password"
              placeholder="Repita a senha"
              {...form1.register("confirm_password")}
            />
            {form1.formState.errors.confirm_password && (
              <p className="text-xs text-destructive">
                {form1.formState.errors.confirm_password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full">
            Próximo
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={form2.handleSubmit(onStep2Submit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="clinic_name">Nome da clínica *</Label>
            <Input id="clinic_name" placeholder="Ex: Clínica Bem Cuidar" {...form2.register("clinic_name")} />
            {form2.formState.errors.clinic_name && (
              <p className="text-xs text-destructive">{form2.formState.errors.clinic_name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="clinic_document">CNPJ *</Label>
            <Input
              id="clinic_document"
              placeholder="00.000.000/0001-00"
              {...form2.register("clinic_document")}
            />
            {form2.formState.errors.clinic_document && (
              <p className="text-xs text-destructive">{form2.formState.errors.clinic_document.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="clinic_phone">Telefone da clínica *</Label>
            <Input id="clinic_phone" placeholder="(11) 3333-3333" {...form2.register("clinic_phone")} />
            {form2.formState.errors.clinic_phone && (
              <p className="text-xs text-destructive">{form2.formState.errors.clinic_phone.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setStep(1)}
              disabled={form2.formState.isSubmitting}
            >
              Voltar
            </Button>
            <Button type="submit" className="flex-1" disabled={form2.formState.isSubmitting}>
              {form2.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar conta
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
