"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, Loader2, Save, Lock } from "lucide-react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { useClinic, useUpdateClinic } from "@/features/clinic/hooks"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getInitials, formatCnpj, formatPhone, formatCep, unformat } from "@/lib/format"

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Senha atual é obrigatória"),
    new_password: z.string().min(6, "Nova senha deve ter no mínimo 6 caracteres"),
    confirm_password: z.string().min(1, "Confirmação é obrigatória"),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Senhas não conferem",
    path: ["confirm_password"],
  })

type PasswordFormData = z.infer<typeof passwordSchema>

export function SettingsClient() {
  const { data: clinic, isLoading } = useClinic()
  const updateClinic = useUpdateClinic()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [phone, setPhone] = useState("")
  const [document, setDocument] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [street, setStreet] = useState("")
  const [number, setNumber] = useState("")
  const [complement, setComplement] = useState("")
  const [neighborhood, setNeighborhood] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [country, setCountry] = useState("Brasil")

  const [saving, setSaving] = useState(false)
  const [passwordResult, setPasswordResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: "", new_password: "", confirm_password: "" },
  })

  useEffect(() => {
    if (!clinic) return
    setPhone(clinic.phone ?? "")
    setDocument(clinic.document ?? "")
    setZipCode(clinic.address?.zip_code ?? "")
    setStreet(clinic.address?.street ?? "")
    setNumber(clinic.address?.number ?? "")
    setComplement(clinic.address?.complement ?? "")
    setNeighborhood(clinic.address?.neighborhood ?? "")
    setCity(clinic.address?.city ?? "")
    setState(clinic.address?.state ?? "")
    setCountry(clinic.address?.country ?? "Brasil")
  }, [clinic])

  const clinicName = clinic?.name ?? ""
  const clinicLogo = clinic?.media_url ?? null

  async function handleSaveClinic() {
    setSaving(true)
    try {
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
      })
      toast.success("Dados da clínica atualizados")
    } catch {
      toast.error("Erro ao salvar dados da clínica")
    }
    setSaving(false)
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append("file", file)

      const uploadRes = await fetch("/api/proxy/media/upload/", {
        method: "POST",
        body: formData,
      })

      if (!uploadRes.ok) {
        toast.error("Erro ao fazer upload da imagem")
        return
      }

      const mediaData = await uploadRes.json()
      await updateClinic.mutateAsync({ media_id: mediaData.id })
      toast.success("Logo da clínica atualizada")
    } catch {
      toast.error("Erro ao atualizar logo")
    }
  }

  async function handlePasswordChange(data: PasswordFormData) {
    setPasswordResult(null)
    try {
      const res = await fetch("/api/proxy/auth/change-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: data.current_password,
          new_password: data.new_password,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Erro ao alterar senha")
      }

      setPasswordResult({ success: true, message: "Senha alterada com sucesso!" })
      passwordForm.reset()
      toast.success("Senha alterada com sucesso")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao alterar senha"
      setPasswordResult({ success: false, message })
    }
  }

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
    country !== (clinic?.address?.country ?? "Brasil")

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Clinic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Dados da Clínica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo */}
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
              <p className="text-sm text-muted-foreground">
                Clique no ícone para alterar a foto
              </p>
            </div>
          </div>

          {/* Document & Phone */}
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

          {/* Address */}
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

      {/* Change Password */}
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

            <Button
              type="submit"
              disabled={passwordForm.formState.isSubmitting}
            >
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
    </div>
  )
}
