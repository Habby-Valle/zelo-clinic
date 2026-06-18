"use client"

import { useState } from "react"
import {
  Plus,
  Mail,
  XCircle,
  Clock,
  Users,
  CheckCircle2,
  XOctagon,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthStore } from "@/store/authStore"
import {
  useCaregivers,
  useCaregiverInvites,
  useInviteCaregiver,
  useCancelCaregiverInvite,
} from "../hooks"
import type { CaregiverInvite } from "../types"

const STATUS_VARIANTS: Record<
  CaregiverInvite["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "default",
  accepted: "secondary",
  expired: "outline",
  cancelled: "destructive",
}

const STATUS_LABELS: Record<CaregiverInvite["status"], string> = {
  pending: "Pendente",
  accepted: "Aceito",
  expired: "Expirado",
  cancelled: "Cancelado",
}

export function CaregiversClient() {
  const clinicId = useAuthStore((state) => state.user?.clinic_id ?? null)

  const [tab, setTab] = useState("caregivers")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 20

  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteError, setInviteError] = useState<string | null>(null)

  const [cancelId, setCancelId] = useState<number | null>(null)

  const { data: caregiversData, isLoading: loadingCaregivers } = useCaregivers({
    search: tab === "caregivers" ? search : "",
    page: tab === "caregivers" ? page : 1,
    pageSize,
  })

  const { data: invitesData, isLoading: loadingInvites } = useCaregiverInvites({
    search: tab === "invites" ? search : "",
    page: tab === "invites" ? page : 1,
    pageSize,
  })

  const inviteCaregiver = useInviteCaregiver()
  const cancelInvite = useCancelCaregiverInvite()

  const caregivers = caregiversData?.caregivers ?? []
  const caregiversTotal = caregiversData?.total ?? 0
  const invites = invitesData?.invites ?? []
  const invitesTotal = invitesData?.total ?? 0

  const currentTotal = tab === "caregivers" ? caregiversTotal : invitesTotal
  const totalPages = Math.ceil(currentTotal / pageSize)

  function onTabChange(value: string | null) {
    if (!value) return
    setTab(value)
    setSearch("")
    setPage(1)
  }

  function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    if (!clinicId) {
      setInviteError("Clínica não identificada. Faça login novamente.")
      return
    }
    setInviteError(null)
    inviteCaregiver.mutate(
      { email: inviteEmail.trim(), clinicId },
      {
        onSuccess: () => {
          setInviteOpen(false)
          setInviteEmail("")
          setTab("invites")
        },
        onError: (err) =>
          setInviteError(
            err instanceof Error ? err.message : "Erro ao enviar convite"
          ),
      }
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cuidadores</h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie cuidadores e convites da clínica.
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)} disabled={false}>
          <Plus className="mr-2 h-4 w-4" />
          Convidar Cuidador
        </Button>
      </div>

      <Tabs value={tab} onValueChange={onTabChange}>
        <TabsList>
          <TabsTrigger value="caregivers">
            <Users className="mr-2 h-4 w-4" />
            Cuidadores
          </TabsTrigger>
          <TabsTrigger value="invites">
            <Mail className="mr-2 h-4 w-4" />
            Convites
          </TabsTrigger>
        </TabsList>

        {/* ── Cuidadores ── */}
        <TabsContent value="caregivers" className="mt-4 space-y-4">
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="max-w-xs"
          />

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Pacientes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingCaregivers ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-36" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-48" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-8 rounded-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : caregivers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Users className="h-8 w-8" />
                          <p>Nenhum cuidador encontrado</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    caregivers.map((cg) => (
                      <TableRow key={cg.id}>
                        <TableCell className="font-medium">{cg.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {cg.email}
                        </TableCell>
                        <TableCell>
                          {cg.patient_count > 0 ? (
                            <Badge variant="outline">{cg.patient_count}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {cg.is_active ? (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1">
                              <XOctagon className="h-3 w-3" />
                              Inativo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(cg.created_at).toLocaleDateString("pt-BR")}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {(page - 1) * pageSize + 1} a{" "}
                {Math.min(page * pageSize, caregiversTotal)} de{" "}
                {caregiversTotal} cuidadores
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Convites ── */}
        <TabsContent value="invites" className="mt-4 space-y-4">
          <Input
            placeholder="Buscar por email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="max-w-xs"
          />

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Enviado em</TableHead>
                    <TableHead>Expira em</TableHead>
                    <TableHead className="w-[60px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingInvites ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-48" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    ))
                  ) : invites.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Mail className="h-8 w-8" />
                          <p>Nenhum convite encontrado</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setInviteOpen(true)}
                                            >
                            Enviar primeiro convite
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    invites.map((invite) => (
                      <TableRow key={invite.id}>
                        <TableCell className="font-medium">
                          {invite.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_VARIANTS[invite.status]}>
                            {STATUS_LABELS[invite.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(invite.created_at).toLocaleDateString(
                            "pt-BR"
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            {new Date(invite.expires_at) < new Date() &&
                              invite.status === "pending" && (
                                <Clock className="h-3 w-3 text-destructive" />
                              )}
                            {new Date(invite.expires_at).toLocaleDateString(
                              "pt-BR"
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {invite.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => setCancelId(invite.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {(page - 1) * pageSize + 1} a{" "}
                {Math.min(page * pageSize, invitesTotal)} de {invitesTotal}{" "}
                convites
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog de convite */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Convidar Cuidador</DialogTitle>
            <DialogDescription>
              Envie um convite por email para um novo cuidador. Ele receberá um
              link para criar a própria conta.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInvite} className="space-y-4">
            {inviteError && (
              <p className="text-sm text-destructive">{inviteError}</p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="invite-email">Email do cuidador *</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="cuidador@exemplo.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={inviteCaregiver.isPending}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setInviteOpen(false)
                  setInviteEmail("")
                  setInviteError(null)
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={inviteCaregiver.isPending}>
                {inviteCaregiver.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Enviar Convite
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog cancelar convite */}
      <AlertDialog
        open={cancelId !== null}
        onOpenChange={() => setCancelId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar convite</AlertDialogTitle>
            <AlertDialogDescription>
              O cuidador convidado não poderá mais usar este link para criar a
              conta. Você poderá enviar um novo convite depois.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={cancelInvite.isPending}
              onClick={() => {
                if (cancelId !== null) {
                  cancelInvite.mutate(cancelId, {
                    onSuccess: () => setCancelId(null),
                  })
                }
              }}
            >
              {cancelInvite.isPending ? "Cancelando..." : "Cancelar convite"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
