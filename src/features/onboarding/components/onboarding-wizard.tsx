"use client";

import { useState, useRef, useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Image as ImageIcon,
  QrCode,
  Camera,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Check,
  Wifi,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import { useClinic, useUpdateClinic } from "@/features/clinic/hooks";
import {
  useAsaasConfig,
  useUpdateAsaasConfig,
  useTestAsaasConnection,
} from "@/features/clinic/hooks/use-asaas-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getInitials, formatCnpj, formatPhone, formatCep, unformat } from "@/lib/format";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Dados da clínica", icon: Building2 },
  { id: 2, label: "Logo", icon: ImageIcon },
  { id: 3, label: "Pagamentos", icon: QrCode },
] as const;

export function OnboardingWizard() {
  const router = useRouter();
  const { data: clinic, isLoading } = useClinic();
  const updateClinic = useUpdateClinic();

  const { data: asaasConfig, isLoading: asaasLoading } = useAsaasConfig();
  const updateAsaas = useUpdateAsaasConfig();
  const testAsaas = useTestAsaasConnection();

  const [step, setStep] = useState(1);
  const [finishing, setFinishing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Passo 1: dados da clínica ──
  const [phone, setPhone] = useState("");
  const [document, setDocument] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("Brasil");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [cnes, setCnes] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [description, setDescription] = useState("");
  const [responsibleName, setResponsibleName] = useState("");

  // ── Passo 3: ASAAS ──
  const [asaasApiKey, setAsaasApiKey] = useState("");
  const [asaasWalletId, setAsaasWalletId] = useState("");
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (!clinic) return;
    startTransition(() => {
      setPhone(clinic.phone ?? "");
      setDocument(clinic.document ?? "");
      setZipCode(clinic.address?.zip_code ?? "");
      setStreet(clinic.address?.street ?? "");
      setNumber(clinic.address?.number ?? "");
      setComplement(clinic.address?.complement ?? "");
      setNeighborhood(clinic.address?.neighborhood ?? "");
      setCity(clinic.address?.city ?? "");
      setState(clinic.address?.state ?? "");
      setCountry(clinic.address?.country ?? "Brasil");
      setEmail(clinic.email ?? "");
      setWebsite(clinic.website ?? "");
      setDescription(clinic.description ?? "");
      setResponsibleName(clinic.responsible_name ?? "");
      setWhatsapp(clinic.whatsapp ?? "");
      setCnes(clinic.cnes ?? "");
      setSpecialty(clinic.specialty ?? "");
    });
  }, [clinic]);

  useEffect(() => {
    if (asaasConfig) {
      startTransition(() => setAsaasWalletId(asaasConfig.wallet_id ?? ""));
    }
  }, [asaasConfig]);

  const clinicName = clinic?.name ?? "";
  const clinicLogo = clinic?.media_url ?? null;

  async function handleSaveClinicData() {
    await updateClinic.mutateAsync({
      phone: unformat(phone) || undefined,
      document: unformat(document) || undefined,
      address: {
        zip_code: unformat(zipCode),
        street,
        number,
        complement: complement || "",
        neighborhood,
        city,
        state,
        country,
      },
      email: email || undefined,
      website: website || undefined,
      whatsapp: unformat(whatsapp) || undefined,
      cnes: cnes || undefined,
      specialty: specialty || undefined,
    });
    setStep(2);
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/proxy/media/upload/", {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) {
        toast.error("Erro ao fazer upload da imagem");
        return;
      }
      const mediaData = await uploadRes.json();
      await updateClinic.mutateAsync({ media_id: mediaData.id });
      toast.success("Logo da clínica atualizada");
    } catch {
      toast.error("Erro ao atualizar logo");
    }
  }

  async function handleTestAsaas() {
    setTestResult(null);
    try {
      const result = await testAsaas.mutateAsync(asaasApiKey);
      setTestResult(result);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    } catch {
      toast.error("Erro ao testar conexão");
    }
  }

  async function completeOnboarding() {
    setFinishing(true);
    try {
      // Salva a config ASAAS se o admin preencheu algo neste passo.
      if (asaasApiKey || asaasWalletId) {
        await updateAsaas.mutateAsync({
          api_key: asaasApiKey || undefined,
          wallet_id: asaasWalletId || undefined,
        });
      }
      await updateClinic.mutateAsync({ onboarding_completed: true });
      toast.success("Configuração concluída!");
      router.replace("/dashboard");
    } catch {
      toast.error("Erro ao concluir a configuração");
      setFinishing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Skeleton className="h-[32rem] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">Vamos configurar sua clínica</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Três passos rápidos para deixar o {clinicName || "seu painel"} pronto para uso.
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isDone = step > s.id;
          const isActive = step === s.id;
          return (
            <div key={s.id} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    isActive && "border-primary bg-primary text-primary-foreground",
                    isDone && "border-primary bg-primary/10 text-primary",
                    !isActive && !isDone && "border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {isDone ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mb-5 h-0.5 w-10 sm:w-16",
                    step > s.id ? "bg-primary" : "bg-muted-foreground/20"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ───── Passo 1: Dados ───── */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Dados da clínica</CardTitle>
            <p className="text-sm text-muted-foreground">
              Confirme os dados informados no cadastro. Você pode ajustá-los agora.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Nome da clínica</Label>
                <Input value={clinicName} disabled />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="document">CNPJ</Label>
                <Input
                  id="document"
                  placeholder="00.000.000/0000-00"
                  value={formatCnpj(document)}
                  onChange={(e) => setDocument(unformat(e.target.value))}
                  maxLength={18}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  placeholder="(00) 00000-0000"
                  value={formatPhone(phone)}
                  onChange={(e) => setPhone(unformat(e.target.value))}
                  maxLength={15}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Endereço</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    placeholder="00000-000"
                    value={formatCep(zipCode)}
                    onChange={(e) => setZipCode(unformat(e.target.value))}
                    maxLength={9}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="street">Logradouro</Label>
                  <Input
                    id="street"
                    placeholder="Rua, Avenida..."
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    placeholder="S/N"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    placeholder="Sala, bloco..."
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    placeholder="Centro"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    placeholder="São Paulo"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    placeholder="SP"
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
                    maxLength={2}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Contato</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contato@clinica.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    placeholder="(00) 00000-0000"
                    value={formatPhone(whatsapp)}
                    onChange={(e) => setWhatsapp(unformat(e.target.value))}
                    maxLength={15}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="website">Site</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://www.clinica.com.br"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Informações Adicionais</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="cnes">CNES</Label>
                  <Input
                    id="cnes"
                    placeholder="Código CNES"
                    value={cnes}
                    onChange={(e) => setCnes(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Input
                    id="specialty"
                    placeholder="Ex: Home Care, Geriatria"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="responsibleName">Responsável Legal</Label>
                <Input
                  id="responsibleName"
                  placeholder="Nome do responsável"
                  value={responsibleName}
                  onChange={(e) => setResponsibleName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Descrição</Label>
                <textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Breve descrição da clínica..."
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveClinicData} disabled={updateClinic.isPending}>
                {updateClinic.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                Continuar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ───── Passo 2: Logo ───── */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Logo da clínica</CardTitle>
            <p className="text-sm text-muted-foreground">
              A logo aparece no painel e nas comunicações com as famílias. Você pode adicioná-la
              agora ou depois.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4 py-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex h-56 w-56 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 transition-colors hover:border-primary/50"
              >
                {clinicLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={clinicLogo} alt={clinicName} className="h-full w-full object-contain" />
                ) : (
                  <span className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon className="h-12 w-12" />
                    <span className="text-3xl font-semibold">
                      {clinicName ? getInitials(clinicName) : "ZC"}
                    </span>
                  </span>
                )}
                {updateClinic.isPending && (
                  <span className="absolute inset-0 flex items-center justify-center bg-background/60">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </span>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Camera className="mr-2 h-4 w-4" />
                {clinicLogo ? "Trocar imagem" : "Enviar imagem"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <Button onClick={() => setStep(3)}>
                <ArrowRight className="mr-2 h-4 w-4" />
                Continuar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ───── Passo 3: ASAAS ───── */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Recebimento via PIX (ASAAS)
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure a chave de API do ASAAS para receber pagamentos das famílias via PIX.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {asaasLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <>
                {testResult && (
                  <Alert variant={testResult.success ? "default" : "destructive"}>
                    <AlertDescription>{testResult.message}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="asaas-api-key">Chave de API (sandbox/produção)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="asaas-api-key"
                      type="password"
                      placeholder={
                        asaasConfig?.has_api_key
                          ? "Chave já configurada — digite para substituir"
                          : "asaas_api_key_..."
                      }
                      value={asaasApiKey}
                      onChange={(e) => setAsaasApiKey(e.target.value)}
                      className="flex-1"
                    />
                    {asaasConfig?.has_api_key && (
                      <Badge
                        variant="outline"
                        className="shrink-0 self-center border-emerald-300 text-xs text-emerald-700"
                      >
                        Configurada
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="asaas-wallet-id">Wallet ID (opcional)</Label>
                  <Input
                    id="asaas-wallet-id"
                    placeholder="wallet_id_..."
                    value={asaasWalletId}
                    onChange={(e) => setAsaasWalletId(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleTestAsaas}
                  disabled={!asaasApiKey || testAsaas.isPending}
                >
                  {testAsaas.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wifi className="mr-2 h-4 w-4" />
                  )}
                  Testar conexão
                </Button>

                {!asaasConfig?.has_api_key && !asaasApiKey && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Sem a integração ASAAS você não conseguirá receber pagamentos via PIX. É
                      possível configurar depois em Configurações → Pagamentos.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(2)} disabled={finishing}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <Button onClick={completeOnboarding} disabled={finishing}>
                {finishing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                {asaasApiKey || asaasConfig?.has_api_key ? "Concluir" : "Concluir sem configurar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
