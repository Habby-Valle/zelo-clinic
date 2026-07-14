"use client";

import { useState, useRef, useEffect, startTransition } from "react";
import {
  Camera,
  Loader2,
  Save,
  Lock,
  FileText,
  CalendarCheck,
  Star,
  QrCode,
  Wifi,
  Building2,
  Bell,
  CreditCard,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useClinic, useUpdateClinic } from "@/features/clinic/hooks";
import {
  useAsaasConfig,
  useUpdateAsaasConfig,
  useTestAsaasConnection,
} from "@/features/clinic/hooks/use-asaas-config";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { getInitials, formatCnpj, formatPhone, formatCep, unformat } from "@/lib/format";

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Senha atual é obrigatória"),
    new_password: z.string().min(6, "Nova senha deve ter no mínimo 6 caracteres"),
    confirm_password: z.string().min(1, "Confirmação é obrigatória"),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Senhas não conferem",
    path: ["confirm_password"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export function SettingsClient() {
  const { data: clinic, isLoading } = useClinic();
  const updateClinic = useUpdateClinic();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [description, setDescription] = useState("");
  const [responsibleName, setResponsibleName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [cnes, setCnes] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [socialInstagram, setSocialInstagram] = useState("");
  const [socialFacebook, setSocialFacebook] = useState("");
  const [socialLinkedin, setSocialLinkedin] = useState("");
  const [businessHours, setBusinessHours] = useState<
    Record<string, { open: string; close: string; is_open: boolean }>
  >({});
  const DAYS = [
    { key: "monday", label: "Segunda" },
    { key: "tuesday", label: "Terça" },
    { key: "wednesday", label: "Quarta" },
    { key: "thursday", label: "Quinta" },
    { key: "friday", label: "Sexta" },
    { key: "saturday", label: "Sábado" },
    { key: "sunday", label: "Domingo" },
  ] as const;

  const [saving, setSaving] = useState(false);

  const { data: asaasConfig, isLoading: asaasLoading } = useAsaasConfig();
  const updateAsaas = useUpdateAsaasConfig();
  const testAsaas = useTestAsaasConnection();
  const [asaasApiKey, setAsaasApiKey] = useState("");
  const [asaasWalletId, setAsaasWalletId] = useState("");
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (asaasConfig) {
      setAsaasApiKey(asaasConfig.api_key ?? "");
      setAsaasWalletId(asaasConfig.wallet_id ?? "");
    }
  }, [asaasConfig]);

  const [passwordResult, setPasswordResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: "", new_password: "", confirm_password: "" },
  });

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
      const sm = clinic.social_media as Record<string, string> | undefined;
      setSocialInstagram(sm?.instagram ?? "");
      setSocialFacebook(sm?.facebook ?? "");
      setSocialLinkedin(sm?.linkedin ?? "");
      setBusinessHours(
        (clinic.business_hours as Record<
          string,
          { open: string; close: string; is_open: boolean }
        >) ?? {}
      );
    });
  }, [clinic]);

  const clinicName = clinic?.name ?? "";
  const clinicLogo = clinic?.media_url ?? null;

  async function handleSaveClinic() {
    setSaving(true);
    try {
      const socialMediaData: Record<string, string> = {};
      if (socialInstagram) socialMediaData.instagram = socialInstagram;
      if (socialFacebook) socialMediaData.facebook = socialFacebook;
      if (socialLinkedin) socialMediaData.linkedin = socialLinkedin;

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
        description: description || undefined,
        responsible_name: responsibleName || undefined,
        whatsapp: unformat(whatsapp) || undefined,
        cnes: cnes || undefined,
        specialty: specialty || undefined,
        social_media: Object.keys(socialMediaData).length > 0 ? socialMediaData : undefined,
        business_hours: businessHours,
      });
      toast.success("Dados da clínica atualizados");
    } catch {
      toast.error("Erro ao salvar dados da clínica");
    }
    setSaving(false);
  }

  async function handleToggleDailyReport(checked: boolean) {
    try {
      await updateClinic.mutateAsync({ daily_report_enabled: checked });
      toast.success(checked ? "Relatório diário ativado" : "Relatório diário desativado");
    } catch {
      toast.error("Erro ao atualizar o relatório diário");
    }
  }

  async function handleToggleVisitNotification(checked: boolean) {
    try {
      await updateClinic.mutateAsync({ visit_notification_enabled: checked });
      toast.success(checked ? "Notificação de visita ativada" : "Notificação de visita desativada");
    } catch {
      toast.error("Erro ao atualizar a notificação de visita");
    }
  }

  async function handleToggleSatisfactionSurvey(checked: boolean) {
    try {
      await updateClinic.mutateAsync({ satisfaction_survey_enabled: checked });
      toast.success(
        checked ? "Pesquisa de satisfação ativada" : "Pesquisa de satisfação desativada"
      );
    } catch {
      toast.error("Erro ao atualizar a pesquisa de satisfação");
    }
  }

  async function handleSaveAsaas() {
    try {
      await updateAsaas.mutateAsync({
        api_key: asaasApiKey,
        wallet_id: asaasWalletId,
      });
      toast.success("Configuração ASAAS salva");
    } catch {
      toast.error("Erro ao salvar configuração ASAAS");
    }
  }

  async function handleTestAsaas() {
    setTestResult(null);
    try {
      const result = await testAsaas.mutateAsync(asaasApiKey);
      setTestResult(result);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Erro ao testar conexão");
    }
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

  async function handlePasswordChange(data: PasswordFormData) {
    setPasswordResult(null);
    try {
      const res = await fetch("/api/proxy/auth/change-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: data.current_password,
          new_password: data.new_password,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Erro ao alterar senha");
      }

      setPasswordResult({ success: true, message: "Senha alterada com sucesso!" });
      passwordForm.reset();
      toast.success("Senha alterada com sucesso");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao alterar senha";
      setPasswordResult({ success: false, message });
    }
  }

  const [tab, setTab] = useState("geral");

  const hasClinicChanges =
    phone !== (clinic?.phone ?? "") ||
    document !== (clinic?.document ?? "") ||
    zipCode !== (clinic?.address?.zip_code ?? "") ||
    street !== (clinic?.address?.street ?? "") ||
    number !== (clinic?.address?.number ?? "") ||
    complement !== (clinic?.address?.complement ?? "") ||
    neighborhood !== (clinic?.address?.neighborhood ?? "") ||
    city !== (clinic?.address?.city ?? "") ||
    state !== (clinic?.address?.state ?? "") ||
    country !== (clinic?.address?.country ?? "Brasil") ||
    email !== (clinic?.email ?? "") ||
    website !== (clinic?.website ?? "") ||
    description !== (clinic?.description ?? "") ||
    responsibleName !== (clinic?.responsible_name ?? "") ||
    whatsapp !== (clinic?.whatsapp ?? "") ||
    cnes !== (clinic?.cnes ?? "") ||
    specialty !== (clinic?.specialty ?? "") ||
    socialInstagram !==
      ((clinic?.social_media as Record<string, string> | undefined)?.instagram ?? "") ||
    socialFacebook !==
      ((clinic?.social_media as Record<string, string> | undefined)?.facebook ?? "") ||
    socialLinkedin !==
      ((clinic?.social_media as Record<string, string> | undefined)?.linkedin ?? "") ||
    JSON.stringify(businessHours) !== JSON.stringify(clinic?.business_hours ?? {});

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="mb-6">
        <TabsTrigger value="geral">
          <Building2 className="h-4 w-4" />
          Geral
        </TabsTrigger>
        <TabsTrigger value="notificacoes">
          <Bell className="h-4 w-4" />
          Notificações
        </TabsTrigger>
        <TabsTrigger value="pagamentos">
          <CreditCard className="h-4 w-4" />
          Pagamentos
        </TabsTrigger>
        <TabsTrigger value="seguranca">
          <Shield className="h-4 w-4" />
          Segurança
        </TabsTrigger>
      </TabsList>

      {/* ───── Geral ───── */}
      <TabsContent value="geral" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados da Clínica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar size="lg">
                  <AvatarImage src={clinicLogo ?? undefined} alt={clinicName} />
                  <AvatarFallback className="text-base">
                    {clinicName ? getInitials(clinicName) : "ZC"}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs"
                >
                  <Camera className="h-3 w-3" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </div>
              <div className="space-y-1">
                <p className="font-medium">{clinicName}</p>
                <p className="text-sm text-muted-foreground">Clique no ícone para alterar a foto</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
              <div className="space-y-1.5">
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
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Informações da Clínica</h3>
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
                    placeholder="Home Care, Geriatria..."
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
                <Label htmlFor="website">Site</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://www.clinica.com.br"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Descrição</Label>
                <textarea
                  id="description"
                  rows={3}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                  placeholder="Breve descrição da clínica..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Redes Sociais</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="socialInstagram">Instagram</Label>
                  <Input
                    id="socialInstagram"
                    placeholder="@clinica ou url"
                    value={socialInstagram}
                    onChange={(e) => setSocialInstagram(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="socialFacebook">Facebook</Label>
                  <Input
                    id="socialFacebook"
                    placeholder="url do Facebook"
                    value={socialFacebook}
                    onChange={(e) => setSocialFacebook(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="socialLinkedin">LinkedIn</Label>
                  <Input
                    id="socialLinkedin"
                    placeholder="url do LinkedIn"
                    value={socialLinkedin}
                    onChange={(e) => setSocialLinkedin(e.target.value)}
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
              <h3 className="text-sm font-medium text-foreground">Informações</h3>
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

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Redes Sociais</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="socialInstagram">Instagram</Label>
                  <Input
                    id="socialInstagram"
                    placeholder="https://instagram.com/..."
                    value={socialInstagram}
                    onChange={(e) => setSocialInstagram(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="socialFacebook">Facebook</Label>
                  <Input
                    id="socialFacebook"
                    placeholder="https://facebook.com/..."
                    value={socialFacebook}
                    onChange={(e) => setSocialFacebook(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="socialLinkedin">LinkedIn</Label>
                  <Input
                    id="socialLinkedin"
                    placeholder="https://linkedin.com/..."
                    value={socialLinkedin}
                    onChange={(e) => setSocialLinkedin(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Horários de Funcionamento</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {DAYS.map((d) => {
                  const day = businessHours[d.key];
                  return (
                    <div key={d.key} className="rounded-lg border p-3">
                      <p className="mb-2 text-xs font-medium">{d.label}</p>
                      <div className="flex gap-2">
                        <select
                          value={day?.open ?? ""}
                          onChange={(e) =>
                            setBusinessHours((prev) => ({
                              ...prev,
                              [d.key]: {
                                ...(prev[d.key] ?? { open: "", close: "", is_open: true }),
                                open: e.target.value,
                              },
                            }))
                          }
                          className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
                        >
                          <option value="">--</option>
                          {Array.from({ length: 24 }, (_, i) => {
                            const h = String(i).padStart(2, "0");
                            return <option key={h} value={`${h}:00`}>{`${h}:00`}</option>;
                          })}
                        </select>
                        <span className="flex items-center text-xs text-muted-foreground">às</span>
                        <select
                          value={day?.close ?? ""}
                          onChange={(e) =>
                            setBusinessHours((prev) => ({
                              ...prev,
                              [d.key]: {
                                ...(prev[d.key] ?? { open: "", close: "", is_open: true }),
                                close: e.target.value,
                              },
                            }))
                          }
                          className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
                        >
                          <option value="">--</option>
                          {Array.from({ length: 24 }, (_, i) => {
                            const h = String(i).padStart(2, "0");
                            return <option key={h} value={`${h}:00`}>{`${h}:00`}</option>;
                          })}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveClinic} disabled={saving || !hasClinicChanges}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar alterações
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ───── Notificações ───── */}
      <TabsContent value="notificacoes" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Relatório diário para familiares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="daily-report" className="text-sm font-medium">
                  Enviar resumo diário automático
                </Label>
                <p className="text-sm text-muted-foreground">
                  Todas as noites, familiares e responsáveis recebem por push e e-mail um resumo do
                  dia de cada paciente — cuidados realizados e ocorrências registradas.
                </p>
              </div>
              <Switch
                id="daily-report"
                checked={clinic?.daily_report_enabled ?? true}
                onCheckedChange={handleToggleDailyReport}
                disabled={updateClinic.isPending}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4" />
              Notificação de visita agendada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="visit-notification" className="text-sm font-medium">
                  Avisar familiares ao agendar uma visita
                </Label>
                <p className="text-sm text-muted-foreground">
                  Quando um turno é agendado, familiares e responsáveis recebem por push e e-mail a
                  confirmação da visita (data, horário e cuidador).
                </p>
              </div>
              <Switch
                id="visit-notification"
                checked={clinic?.visit_notification_enabled ?? true}
                onCheckedChange={handleToggleVisitNotification}
                disabled={updateClinic.isPending}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Pesquisa de satisfação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="satisfaction-survey" className="text-sm font-medium">
                  Pedir avaliação após cada turno
                </Label>
                <p className="text-sm text-muted-foreground">
                  Quando um turno é concluído, os familiares recebem por push e e-mail um convite
                  para avaliar o atendimento (nota de 1 a 5 e comentário).
                </p>
              </div>
              <Switch
                id="satisfaction-survey"
                checked={clinic?.satisfaction_survey_enabled ?? true}
                onCheckedChange={handleToggleSatisfactionSurvey}
                disabled={updateClinic.isPending}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ───── Pagamentos ───── */}
      <TabsContent value="pagamentos" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Integração ASAAS (PIX)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Configure a chave de API do ASAAS para receber pagamentos via PIX dos familiares.
            </p>
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
                <div className="flex gap-2">
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
                  <Button onClick={handleSaveAsaas} disabled={updateAsaas.isPending}>
                    {updateAsaas.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Salvar
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ───── Segurança ───── */}
      <TabsContent value="seguranca" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Alterar Senha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={passwordForm.handleSubmit(handlePasswordChange)}
              className="space-y-4"
              noValidate
            >
              {passwordResult && (
                <Alert variant={passwordResult.success ? "default" : "destructive"}>
                  <AlertDescription>{passwordResult.message}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="current_password">Senha atual</Label>
                <Input
                  id="current_password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...passwordForm.register("current_password")}
                />
                {passwordForm.formState.errors.current_password && (
                  <p className="text-xs text-destructive">
                    {passwordForm.formState.errors.current_password.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new_password">Nova senha</Label>
                <Input
                  id="new_password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...passwordForm.register("new_password")}
                />
                {passwordForm.formState.errors.new_password && (
                  <p className="text-xs text-destructive">
                    {passwordForm.formState.errors.new_password.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm_password">Confirmar nova senha</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...passwordForm.register("confirm_password")}
                />
                {passwordForm.formState.errors.confirm_password && (
                  <p className="text-xs text-destructive">
                    {passwordForm.formState.errors.confirm_password.message}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                {passwordForm.formState.isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="mr-2 h-4 w-4" />
                )}
                Alterar senha
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
