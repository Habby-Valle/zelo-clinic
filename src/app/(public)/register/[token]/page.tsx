"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2, Search } from "lucide-react";

import {
  registerClinicAdminStep1Schema,
  registerClinicAdminStep2Schema,
  registerClinicAdminStep3Schema,
  type RegisterClinicAdminStep1Values,
  type RegisterClinicAdminStep2Values,
  type RegisterClinicAdminStep3Values,
} from "@/lib/validations/invite";
import { formatCep, formatPhone, formatCnpj } from "@/lib/format";
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
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [step1Data, setStep1Data] = useState<RegisterClinicAdminStep1Values | null>(null);
  const [step2Data, setStep2Data] = useState<RegisterClinicAdminStep2Values | null>(null);
  const [cepLoading, setCepLoading] = useState(false);

  const form1 = useForm<RegisterClinicAdminStep1Values>({
    resolver: zodResolver(registerClinicAdminStep1Schema),
  });

  const form2 = useForm<RegisterClinicAdminStep2Values>({
    resolver: zodResolver(registerClinicAdminStep2Schema),
  });

  const form3 = useForm<RegisterClinicAdminStep3Values>({
    resolver: zodResolver(registerClinicAdminStep3Schema),
    defaultValues: {
      zip_code: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
    },
  });

  const cepValue = form3.watch("zip_code") ?? "";

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

  function onStep2Submit(values: RegisterClinicAdminStep2Values) {
    setStep2Data(values);
    setStep(3);
  }

  async function onStep3Submit(values: RegisterClinicAdminStep3Values) {
    if (!step1Data || !step2Data) return;
    setSubmitError(null);

    const { confirm_password, ...personal } = step1Data;
    const payload = {
      ...personal,
      ...step2Data,
      address: {
        zip_code: values.zip_code,
        street: values.street,
        number: values.number,
        complement: values.complement || "",
        neighborhood: values.neighborhood,
        city: values.city,
        state: values.state,
        country: "Brasil",
      },
    };
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

  async function handleCepSearch() {
    const digits = cepValue.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.erro) return;
      form3.setValue("street", data.logradouro, { shouldValidate: true });
      form3.setValue("neighborhood", data.bairro, { shouldValidate: true });
      form3.setValue("city", data.localidade, { shouldValidate: true });
      form3.setValue("state", data.uf, { shouldValidate: true });
    } finally {
      setCepLoading(false);
    }
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

  const stepTitle =
    step === 1 ? "Criar sua conta" : step === 2 ? "Cadastrar sua clínica" : "Endereço da clínica";

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <span className={step === 1 ? "font-semibold text-foreground" : ""}>1. Seus dados</span>
          <span>→</span>
          <span className={step === 2 ? "font-semibold text-foreground" : ""}>2. Dados da clínica</span>
          <span>→</span>
          <span className={step === 3 ? "font-semibold text-foreground" : ""}>3. Endereço</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{stepTitle}</h1>
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
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              value={formatPhone(form1.watch("phone"))}
              onChange={(e) =>
                form1.setValue("phone", e.target.value.replace(/\D/g, "").slice(0, 11), {
                  shouldValidate: true,
                })
              }
            />
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
              value={formatCnpj(form2.watch("clinic_document"))}
              onChange={(e) =>
                form2.setValue("clinic_document", e.target.value.replace(/\D/g, "").slice(0, 14), {
                  shouldValidate: true,
                })
              }
            />
            {form2.formState.errors.clinic_document && (
              <p className="text-xs text-destructive">{form2.formState.errors.clinic_document.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="clinic_phone">Telefone da clínica *</Label>
            <Input
              id="clinic_phone"
              placeholder="(11) 3333-3333"
              value={formatPhone(form2.watch("clinic_phone"))}
              onChange={(e) =>
                form2.setValue("clinic_phone", e.target.value.replace(/\D/g, "").slice(0, 11), {
                  shouldValidate: true,
                })
              }
            />
            {form2.formState.errors.clinic_phone && (
              <p className="text-xs text-destructive">{form2.formState.errors.clinic_phone.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
              Voltar
            </Button>
            <Button type="submit" className="flex-1">
              Próximo
            </Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={form3.handleSubmit(onStep3Submit)} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="zip_code">CEP *</Label>
              <div className="flex gap-1">
                <Input
                  id="zip_code"
                  placeholder="00000-000"
                  value={formatCep(cepValue)}
                  onChange={(e) => form3.setValue("zip_code", e.target.value, { shouldValidate: true })}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={handleCepSearch}
                  disabled={cepValue.replace(/\D/g, "").length !== 8 || cepLoading}
                  title="Buscar CEP"
                >
                  {cepLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {form3.formState.errors.zip_code && (
                <p className="text-xs text-destructive">{form3.formState.errors.zip_code.message}</p>
              )}
            </div>
            <div className="w-24 space-y-1.5">
              <Label htmlFor="number">Nº *</Label>
              <Input id="number" placeholder="123" {...form3.register("number")} />
              {form3.formState.errors.number && (
                <p className="text-xs text-destructive">{form3.formState.errors.number.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="street">Logradouro *</Label>
            <Input id="street" placeholder="Rua das Flores" {...form3.register("street")} />
            {form3.formState.errors.street && (
              <p className="text-xs text-destructive">{form3.formState.errors.street.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="neighborhood">Bairro *</Label>
              <Input id="neighborhood" placeholder="Centro" {...form3.register("neighborhood")} />
              {form3.formState.errors.neighborhood && (
                <p className="text-xs text-destructive">{form3.formState.errors.neighborhood.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">Cidade *</Label>
              <Input id="city" placeholder="São Paulo" {...form3.register("city")} />
              {form3.formState.errors.city && (
                <p className="text-xs text-destructive">{form3.formState.errors.city.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="state">UF *</Label>
              <Input
                id="state"
                placeholder="SP"
                maxLength={2}
                {...form3.register("state")}
                onChange={(e) =>
                  form3.setValue("state", e.target.value.toUpperCase(), { shouldValidate: true })
                }
              />
              {form3.formState.errors.state && (
                <p className="text-xs text-destructive">{form3.formState.errors.state.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="complement">Complemento</Label>
            <Input id="complement" placeholder="Sala 5 (opcional)" {...form3.register("complement")} />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>
              Voltar
            </Button>
            <Button type="submit" className="flex-1">
              Criar conta
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
